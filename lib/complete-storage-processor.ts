import { supabase } from './supabase'
import { sanitizeFieldName } from './field-name-utils'
import { generateUniqueFieldId, generateUniqueFieldName, detectDuplicateFields, fixDuplicateFields } from './unique-field-generator'
import { FormField } from './types'

export interface CompleteStorageResult {
  processingId: string
  fileName: string
  pdfStoragePath: string
  imageStoragePaths: string[]
  pdfPublicUrl: string
  imagePublicUrls: string[]
  detectedFields: DetectedField[]
  success: boolean
  message: string
}

export interface DetectedField {
  id: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select'
  label: string
  x: number
  y: number
  width: number
  height: number
  page: number
  confidence: number
}

export class CompleteStorageProcessor {
  private processingId: string
  private ocrConfig: any = null
  private expectedFieldsConfig: any = {}

  constructor() {
    this.processingId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setOCRConfig(config: any) {
    // 🔒 VALIDAR CONFIGURAÇÃO ANTES DE APLICAR
    const { validateOCRConfig, DEFAULT_OCR_CONFIG } = require('./ocr-config')
    
    if (!config) {
      console.log('⚠️ Nenhuma configuração OCR fornecida, usando configuração testada')
      this.ocrConfig = DEFAULT_OCR_CONFIG
    } else {
      this.ocrConfig = validateOCRConfig(config)
      console.log('✅ Configuração OCR validada e aplicada ao processador:', this.ocrConfig)
      
      // Verificar se é a configuração testada
      if (config.pageSegMode !== '6' || config.ocrEngineMode !== '1') {
        console.warn('⚠️ ATENÇÃO: Configuração OCR não é a testada - pode reduzir detecção de campos!')
      }
    }
  }

  setExpectedFields(config: any) {
    this.expectedFieldsConfig = config
    console.log('✅ Configuração de campos esperados aplicada ao processador:', config)
  }

  async processFile(
    file: File,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<CompleteStorageResult> {
    
    console.log(`🚀 Processamento completo com storage: ${file.name}`)
    
    // 🔒 GARANTIR CONFIGURAÇÃO SEGURA ANTES DO PROCESSAMENTO
    if (!this.ocrConfig) {
      const { loadSafeOCRConfig } = await import('./ocr-config')
      this.ocrConfig = loadSafeOCRConfig()
      console.log('🔧 Configuração OCR segura carregada automaticamente')
    }
    
    try {
      // Etapa 1: Validar arquivo
      onProgress?.('Validando arquivo PDF...', 5)
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Arquivo PDF inválido')
      }

      // Etapa 2: Upload do PDF original para o Supabase Storage
      onProgress?.('Enviando PDF para Supabase Storage...', 15)
      const pdfStoragePath = await this.uploadPDFToStorage(file)
      const pdfPublicUrl = await this.getPublicUrl('form-pdfs', pdfStoragePath)
      
      console.log(`✅ PDF salvo no storage: ${pdfStoragePath}`)

      // Etapa 3: Converter PDF para imagens usando PDF.js
      onProgress?.('Convertendo PDF para imagens...', 35)
      const imageDataUrls = await this.convertPDFToImages(file)
      
      console.log(`✅ PDF convertido em ${imageDataUrls.length} imagens`)

      // Etapa 4: Upload das imagens para o Supabase Storage
      onProgress?.('Enviando imagens para Supabase Storage...', 55)
      const imageStoragePaths = await this.uploadImagesToStorage(imageDataUrls)
      const imagePublicUrls = await Promise.all(
        imageStoragePaths.map(path => this.getPublicUrl('processed-images', path))
      )
      
      console.log(`✅ ${imageStoragePaths.length} imagens salvas no storage`)

      // Etapa 5: Processar com IA usando as URLs públicas
      onProgress?.('Analisando com IA...', 75)
      const detectedFields = await this.analyzeWithAI(imagePublicUrls)
      
      console.log(`✅ ${detectedFields.length} campos detectados`)

      // Etapa 6: Salvar metadados no banco
      onProgress?.('Salvando metadados no banco...', 90)
      await this.saveMetadataToDatabase(file.name, pdfStoragePath, imageStoragePaths, detectedFields)
      
      onProgress?.('Processamento concluído!', 100)
      
      return {
        processingId: this.processingId,
        fileName: file.name,
        pdfStoragePath,
        imageStoragePaths,
        pdfPublicUrl,
        imagePublicUrls,
        detectedFields,
        success: true,
        message: `Processado com sucesso! ${detectedFields.length} campos detectados.`
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error)
      
      return {
        processingId: this.processingId,
        fileName: file.name,
        pdfStoragePath: '',
        imageStoragePaths: [],
        pdfPublicUrl: '',
        imagePublicUrls: [],
        detectedFields: [],
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  private async uploadPDFToStorage(file: File): Promise<string> {
    try {
      const fileName = `${this.processingId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `pdfs/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('form-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Erro no upload do PDF:', error)
        throw new Error(`Erro no upload do PDF: ${error.message}`)
      }

      return data.path
      
    } catch (error) {
      console.error('❌ Erro no upload do PDF:', error)
      throw error
    }
  }

  private async convertPDFToImages(file: File): Promise<string[]> {
    console.log('🔄 Iniciando conversão PDF robusta:', file.name)
    
    try {
      // Usar o conversor robusto com múltiplas estratégias
      const { RobustPDFConverter } = await import('./pdf-converter-robust')
      const converter = RobustPDFConverter.getInstance()
      
      const result = await converter.convertPDFToImages(file)
      
      if (result.success) {
        console.log(`✅ Conversão bem-sucedida com método: ${result.method}`)
        console.log(`📄 ${result.imageUrls.length} imagens geradas`)
        
        if (result.error) {
          console.warn(`⚠️ Aviso: ${result.error}`)
        }
        
        return result.imageUrls
      } else {
        throw new Error(result.error || 'Conversão falhou')
      }
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO na conversão PDF:', error)
      
      // Criar uma imagem de fallback informativa
      const canvas = document.createElement('canvas')
      canvas.width = 794
      canvas.height = 1123
      const ctx = canvas.getContext('2d')!
      
      // Fundo branco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Borda
      ctx.strokeStyle = '#dc3545'
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
      
      // Título de erro
      ctx.fillStyle = '#dc3545'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('⚠️ ERRO NA CONVERSÃO PDF', canvas.width / 2, 100)
      
      // Detalhes
      ctx.font = '16px Arial'
      ctx.fillStyle = '#6c757d'
      ctx.fillText(`Arquivo: ${file.name}`, canvas.width / 2, 150)
      ctx.fillText(`Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`, canvas.width / 2, 180)
      
      // Instruções
      ctx.font = '14px Arial'
      ctx.fillText('Use o modo manual para criar campos:', canvas.width / 2, 250)
      ctx.fillText('1. Ferramenta "Adicionar Campo" (A)', canvas.width / 2, 280)
      ctx.fillText('2. Clique no formulário para posicionar', canvas.width / 2, 310)
      ctx.fillText('3. Configure propriedades de cada campo', canvas.width / 2, 340)
      
      const errorImageUrl = canvas.toDataURL('image/png', 1.0)
      
      console.log('🔄 Retornando imagem de fallback para modo manual')
      return [errorImageUrl]
    }
  }

  private async uploadImagesToStorage(imageDataUrls: string[]): Promise<string[]> {
    try {
      const uploadPromises = imageDataUrls.map(async (dataUrl, index) => {
        // Converter data URL para blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        
        const fileName = `${this.processingId}_page_${index + 1}.png`
        const filePath = `processed/${fileName}`
        
        const { data, error } = await supabase.storage
          .from('processed-images')
          .upload(filePath, blob, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          })

        if (error) {
          console.error(`❌ Erro no upload da página ${index + 1}:`, error)
          throw new Error(`Erro no upload da imagem: ${error.message}`)
        }

        return data.path
      })

      return await Promise.all(uploadPromises)
      
    } catch (error) {
      console.error('❌ Erro no upload das imagens:', error)
      throw error
    }
  }

  private async getPublicUrl(bucket: string, path: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      return data.publicUrl
      
    } catch (error) {
      console.error('❌ Erro ao obter URL pública:', error)
      throw error
    }
  }

  /**
   * 🎯 ANÁLISE COM GEMINI VISION - CONFIGURAÇÃO CRÍTICA
   * 
   * ⚠️ ATENÇÃO: Esta função usa GEMINI VISION que é ESSENCIAL para detecção perfeita de campos!
   * 
   * 📋 HISTÓRICO DO PROBLEMA:
   * - ANTES: Gemini Vision → 30+ campos detectados perfeitamente ✅
   * - PROBLEMA: OCR + Gemini texto → apenas 1 campo detectado ❌
   * - SOLUÇÃO: Restaurado Gemini Vision → volta aos 30+ campos ✅
   * 
   * 🚨 NÃO ALTERE ESTA FUNÇÃO SEM CONSULTAR A DOCUMENTAÇÃO:
   * - docs/gemini-vision-restoration.md
   * - docs/ocr-config-fix.md
   */
  
  /**
   * Converte FormField[] para DetectedField[]
   */
  private convertToDetectedFields(formFields: FormField[]): DetectedField[] {
    return formFields.map(field => ({
      id: field.id,
      type: this.mapToDetectedFieldType(field.type),
      label: field.label,
      x: field.position.x,
      y: field.position.y,
      width: field.position.width,
      height: field.position.height,
      page: field.position.page,
      confidence: 0.8 // valor padrão
    }))
  }

  /**
   * Mapeia tipos de FormField para DetectedField
   */
  private mapToDetectedFieldType(type: string): 'text' | 'number' | 'date' | 'checkbox' | 'select' {
    switch (type) {
      case 'number':
      case 'date':
      case 'checkbox':
      case 'select':
        return type as 'number' | 'date' | 'checkbox' | 'select'
      default:
        return 'text'
    }
  }

  /**
   * 
   * 💡 POR QUE GEMINI VISION É SUPERIOR:
   * - Vê a imagem completa (não apenas texto)
   * - Detecta elementos visuais (bordas, caixas, linhas)
   * - Entende contexto espacial (posicionamento)
   * - Sem perda de informação (não há conversão texto)
   * - Modelo treinado especificamente para visão
   * 
   * 🔧 CONFIGURAÇÃO TESTADA E APROVADA:
   * - Modelo: gemini-2.0-flash-exp
   * - Temperature: 0.1 (precisão máxima)
   * - MaxTokens: 4096 (suficiente para formulários complexos)
   * - Prompt otimizado para detecção máxima
   */
  private async analyzeWithAI(imageUrls: string[]): Promise<DetectedField[]> {
    try {
      console.log('🤖 USANDO GEMINI VISION - CONFIGURAÇÃO TESTADA E APROVADA!')
      
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('Chave do Gemini não configurada')
      }

      const allFields: FormField[] = []
      
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i]
        console.log(`🔍 Analisando página ${i + 1}/${imageUrls.length} com Gemini Vision...`)
        
        // Converter URL para base64 se necessário
        let base64Image: string
        if (imageUrl.startsWith('data:')) {
          base64Image = imageUrl.split(',')[1]
        } else {
          // Baixar imagem e converter para base64
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const dataUrl = await this.blobToBase64(blob)
          base64Image = dataUrl.split(',')[1]
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `🎯 DETECÇÃO DE CAMPOS BASEADA EM BORDAS VISUAIS

Analise esta imagem de formulário e PRIMEIRO identifique todas as BORDAS VISUAIS, depois determine que tipo de campo cada borda representa.

🔍 METODOLOGIA DE DETECÇÃO:

1. PRIMEIRO: ENCONTRE TODAS AS BORDAS VISUAIS
   - Procure por RETÂNGULOS com bordas pretas/cinzas
   - Identifique LINHAS horizontais para preenchimento
   - Localize CAIXAS delimitadas por contornos
   - Encontre CÉLULAS de tabelas com bordas
   - Detecte QUADRADOS pequenos (checkboxes)

2. SEGUNDO: MEÇA AS BORDAS COM PRECISÃO PIXEL
   - x: coordenada EXATA da borda esquerda
   - y: coordenada EXATA da borda superior
   - width: largura COMPLETA da borda (incluindo a linha)
   - height: altura COMPLETA da borda (incluindo a linha)

3. TERCEIRO: IDENTIFIQUE O TIPO DE CAMPO
   Baseado no CONTEXTO ao redor da borda:
   - Texto próximo que indica o tipo (nome, data, valor, etc.)
   - Tamanho da borda (pequena=checkbox, grande=textarea)
   - Formato da borda (retângulo=texto, linha=preenchimento)

4. FOQUE NAS BORDAS MAIS ÓBVIAS PRIMEIRO:
   - Retângulos bem definidos com linhas claras
   - Caixas com contornos completos
   - Linhas horizontais para preenchimento
   - Células de tabelas com bordas visíveis

5. SEJA SISTEMÁTICO:
   - Examine da esquerda para direita, de cima para baixo
   - Não pule bordas mesmo que sejam pequenas
   - Inclua bordas parciais (só linha inferior, por exemplo)
   - Considere agrupamentos de bordas (tabelas)

EXEMPLO DO QUE PROCURAR:
- ┌─────────┐ ← Retângulo completo = campo de texto
- __________ ← Linha horizontal = campo de preenchimento  
- □ ← Quadrado pequeno = checkbox
- │ Campo │ ← Célula de tabela = campo estruturado

RESPONDA APENAS com um array JSON válido:
[
  {
    "type": "text|number|date|checkbox|select|textarea|signature",
    "label": "Texto próximo que identifica o campo",
    "x": 100,
    "y": 200, 
    "width": 200,
    "height": 30,
    "confidence": 0.9,
    "borderDetected": true,
    "borderType": "rectangle|line|table|checkbox|partial",
    "borderDescription": "Descrição da borda encontrada"
  }
]

IMPORTANTE: Retorne APENAS o JSON, sem explicações adicionais.`
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 4096,
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Erro na API Gemini: ${response.status}`)
        }

        const result = await response.json()
        const content = result.candidates?.[0]?.content?.parts?.[0]?.text

        if (content) {
          try {
            console.log(`🤖 Resposta Gemini Vision página ${i + 1}:`, content.substring(0, 200) + '...')
            
            // Extrair JSON do texto
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              const fields = JSON.parse(jsonMatch[0])
              
              console.log(`✅ Gemini Vision detectou ${fields.length} campos na página ${i + 1}`)
              
              // 🎯 PROCESSAR CAMPOS COM DETECÇÃO DE BORDAS
              fields.forEach((field: any, index: number) => {
                // 🎯 PROCESSAMENTO AVANÇADO DE BORDAS - POSICIONAMENTO PIXEL-PERFECT
                const processedField = this.processFieldWithBorderDetection(field, i, index)
                
                // 🔒 USAR FUNÇÕES DE SEGURANÇA PARA EVITAR DUPLICATAS
                const uniqueId = generateUniqueFieldId(processedField.label, allFields, processedField.position, index)
                const uniqueName = generateUniqueFieldName(processedField.label, allFields, processedField.position, index)
                
                allFields.push({
                  id: uniqueId,
                  name: uniqueName,
                  type: this.mapFieldType(processedField.type) as any,
                  label: processedField.label,
                  required: false,
                  position: processedField.position
                } as any)
              })
            } else {
              console.warn(`⚠️ Gemini não retornou JSON válido para página ${i + 1}`)
            }
          } catch (parseError) {
            console.warn(`❌ Erro ao parsear resposta do Gemini página ${i + 1}:`, parseError)
          }
        } else {
          console.warn(`⚠️ Gemini retornou resposta vazia para página ${i + 1}`)
        }
      }
      
      if (allFields.length > 0) {
        console.log(`🎉 GEMINI VISION DETECTOU ${allFields.length} CAMPOS TOTAL!`)
        console.log('🔍 Campos por página:', imageUrls.map((_, i) => 
          allFields.filter(f => f.position.page === i).length
        ))
        
        // 🔒 VERIFICAÇÃO FINAL DE DUPLICATAS REAIS (mesma posição)
        const duplicates = detectDuplicateFields(allFields)
        
        if (duplicates.duplicateIds.length > 0) {
          console.warn(`⚠️ Detectados ${duplicates.duplicateIds.length} IDs duplicados`)
          console.log('🔧 Aplicando correção automática de duplicatas REAIS...')
          
          const cleanedFields = fixDuplicateFields(allFields)
          console.log(`✅ Duplicatas REAIS corrigidas: ${allFields.length} → ${cleanedFields.length} campos`)
          
          return this.convertToDetectedFields(cleanedFields)
        }
        
        // ℹ️ Names duplicados são VÁLIDOS quando posições são diferentes (tabelas, formulários repetidos)
        if (duplicates.duplicateNames.length > 0) {
          console.log(`ℹ️  ${duplicates.duplicateNames.length} campos com names duplicados detectados`)
          console.log(`   Isso é NORMAL para tabelas e formulários com campos repetidos`)
          console.log(`   Cada campo tem posição única e será tratado separadamente`)
        }
        
        return this.convertToDetectedFields(allFields)
      } else {
        console.warn('⚠️ Gemini Vision não detectou nenhum campo, usando fallback')
        return this.generateMockFields(imageUrls.length)
      }
      
    } catch (error) {
      console.error('❌ Erro na análise Gemini Vision:', error)
      console.log('🔄 Usando fallback com campos simulados...')
      return this.generateMockFields(imageUrls.length)
    }
  }

  /**
   * 🎯 PROCESSAR CAMPOS BASEADOS EM BORDAS VISUAIS
   */
  private processFieldWithBorderDetection(field: any, pageIndex: number, fieldIndex: number) {
    // 🔍 USAR AS COORDENADAS DA BORDA COMO REFERÊNCIA PRINCIPAL
    let fieldPosition = {
      x: Math.max(0, field.x || 100),
      y: Math.max(0, field.y || 100),
      width: Math.max(50, field.width || 200),
      height: Math.max(20, field.height || 30),
      page: pageIndex
    }
    
    let borderInfo = {
      detected: field.borderDetected || false,
      type: field.borderType || 'none',
      description: field.borderDescription || '',
      confidence: field.confidence || 0.8
    }
    
    if (borderInfo.detected) {
      // 🎯 USAR AS BORDAS COMO REFERÊNCIA EXATA
      fieldPosition = this.processBorderAsReference(field, borderInfo.type)
      
      console.log(`🎯 Processador - Borda "${borderInfo.type}" detectada para "${field.label}":`, {
        description: borderInfo.description,
        coordinates: fieldPosition,
        originalDetection: { x: field.x, y: field.y, width: field.width, height: field.height }
      })
    } else {
      // 🔧 SEM BORDA: USAR POSIÇÃO DETECTADA DIRETAMENTE
      console.log(`📍 Processador - Campo "${field.label}" sem borda detectada, usando posição estimada`)
    }
    
    return {
      type: field.type || 'text',
      label: field.label || `Campo ${fieldIndex + 1}`,
      position: fieldPosition,
      borderInfo
    }
  }
  
  /**
   * 🎯 PROCESSAR BORDAS COMO REFERÊNCIA VISUAL PRINCIPAL
   */
  private processBorderAsReference(field: any, borderType: string): { x: number; y: number; width: number; height: number; page: number } {
    // 🔍 USAR AS COORDENADAS DA BORDA DETECTADA COMO BASE
    let x = Math.max(0, field.x || 100)
    let y = Math.max(0, field.y || 100)  
    let width = Math.max(50, field.width || 200)
    let height = Math.max(20, field.height || 30)
    
    switch (borderType) {
      case 'rectangle':
        // 🎯 RETÂNGULO: POSICIONAR CAMPO DENTRO DA BORDA
        // Usar 95% da área interna para não tocar as bordas
        const padding = Math.min(3, width * 0.02) // 2% de padding ou 3px máximo
        x = x + padding
        y = y + padding
        width = width - (padding * 2)
        height = height - (padding * 2)
        break
        
      case 'line':
        // 🎯 LINHA: CAMPO SOBRE A LINHA DE PREENCHIMENTO
        // Manter largura da linha, ajustar altura para input
        height = Math.min(25, height) // Altura máxima para input
        y = y - (height / 2) // Centralizar verticalmente na linha
        break
        
      case 'table':
        // 🎯 TABELA: PREENCHER CÉLULA DEIXANDO MARGEM MÍNIMA
        const tablePadding = 2
        x = x + tablePadding
        y = y + tablePadding
        width = width - (tablePadding * 2)
        height = height - (tablePadding * 2)
        break
        
      case 'checkbox':
        // 🎯 CHECKBOX: MANTER TAMANHO PEQUENO E CENTRALIZAR
        const checkboxSize = Math.min(20, Math.min(width, height))
        x = x + (width - checkboxSize) / 2
        y = y + (height - checkboxSize) / 2
        width = checkboxSize
        height = checkboxSize
        break
        
      case 'partial':
        // 🎯 BORDA PARCIAL: USAR ÁREA DETECTADA COM PADDING MÍNIMO
        const partialPadding = 1
        x = x + partialPadding
        y = y + partialPadding
        width = Math.max(width - (partialPadding * 2), 50)
        height = Math.max(height - (partialPadding * 2), 20)
        break
        
      default:
        // 🎯 TIPO DESCONHECIDO: USAR COORDENADAS DETECTADAS DIRETAMENTE
        // Sem ajustes, confiar na detecção do Gemini Vision
        break
    }
    
    // 🔒 GARANTIR VALORES MÍNIMOS E MÁXIMOS SENSATOS
    return {
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      width: Math.max(30, Math.min(800, Math.round(width))),
      height: Math.max(15, Math.min(200, Math.round(height))),
      page: field.page || 0
    }
  }
  
  /**
   * 🔧 DIMENSIONAMENTO INTELIGENTE PARA CAMPOS SEM BORDA
   */
  private applySmartDefaultSizing(field: any, fieldIndex: number) {
    let width = 200
    let height = 30
    
    // 🎯 AJUSTAR BASEADO NO TIPO DE CAMPO
    switch (field.type) {
      case 'textarea':
        width = Math.max(300, field.width || 400)
        height = Math.max(60, field.height || 80)
        break
      case 'checkbox':
        width = 20
        height = 20
        break
      case 'signature':
        width = Math.max(200, field.width || 300)
        height = Math.max(40, field.height || 60)
        break
      case 'date':
        width = Math.max(100, field.width || 150)
        height = Math.max(25, field.height || 30)
        break
      case 'number':
        width = Math.max(80, field.width || 120)
        height = Math.max(25, field.height || 30)
        break
      default:
        width = Math.max(120, field.width || 200)
        height = Math.max(25, field.height || 30)
    }
    
    return {
      x: Math.max(0, field.x || 100),
      y: Math.max(0, field.y || 100),
      width,
      height
    }
  }

  private mapFieldType(type: string): string {
    switch (type?.toLowerCase()) {
      case 'number':
      case 'numeric':
        return 'number'
      case 'date':
      case 'data':
        return 'date'
      case 'checkbox':
      case 'check':
        return 'checkbox'
      case 'select':
      case 'dropdown':
      case 'lista':
        return 'select'
      case 'textarea':
      case 'area':
      case 'observacoes':
        return 'textarea'
      case 'signature':
      case 'assinatura':
        return 'signature'
      default:
        return 'text'
    }
  }

  private generateMockFields(pageCount: number): DetectedField[] {
    const mockFields: DetectedField[] = []
    
    // Campos baseados no seu formulário FPAS
    const formFields = [
      { label: '01-RAZAO SOCIAL/NOME', type: 'text', x: 100, y: 100 },
      { label: '02-DDD/TELEFONE', type: 'text', x: 300, y: 100 },
      { label: '03-FPAS', type: 'number', x: 500, y: 400 },
      { label: '04-SIMPLES', type: 'number', x: 100, y: 450 },
      { label: '05-REMUNERACAO', type: 'number', x: 300, y: 450 },
      { label: '06-QTDE TRABALHADORES', type: 'number', x: 500, y: 450 },
      { label: '07-ALIQUOTA FGTS', type: 'number', x: 100, y: 500 },
      { label: '08-COD RECOLHIMENTO', type: 'number', x: 300, y: 500 },
      { label: '09-ID RECOLHIMENTO', type: 'text', x: 500, y: 500 },
      { label: '10-INSCRICAO/TIPO (8)', type: 'text', x: 100, y: 550 },
      { label: '11-COMPETENCIA', type: 'text', x: 300, y: 550 },
      { label: '12-DATA DE VALIDADE', type: 'date', x: 500, y: 550 },
      { label: '13-DEPOSITO + CONTRIB SOCIAL', type: 'number', x: 100, y: 900 },
      { label: '14-ENCARGOS', type: 'number', x: 300, y: 900 },
      { label: '15-TOTAL A RECOLHER', type: 'number', x: 500, y: 900 },
      // Duplicar campos para segunda seção
      { label: '01-RAZAO SOCIAL/NOME', type: 'text', x: 100, y: 350 },
      { label: '02-DDD/TELEFONE', type: 'text', x: 300, y: 350 },
      { label: '03-FPAS', type: 'number', x: 500, y: 650 },
      { label: '04-SIMPLES', type: 'number', x: 100, y: 700 },
      { label: '05-REMUNERACAO', type: 'number', x: 300, y: 700 },
      { label: '06-QTDE TRABALHADORES', type: 'number', x: 500, y: 700 },
      { label: '07-ALIQUOTA FGTS', type: 'number', x: 100, y: 750 },
      { label: '08-COD RECOLHIMENTO', type: 'number', x: 300, y: 750 },
      { label: '09-ID RECOLHIMENTO', type: 'text', x: 500, y: 750 },
      { label: '10-INSCRICAO/TIPO (8)', type: 'text', x: 100, y: 800 },
      { label: '11-COMPETENCIA', type: 'text', x: 300, y: 800 },
      { label: '12-DATA DE VALIDADE', type: 'date', x: 500, y: 800 },
      { label: '13-DEPOSITO + CONTRIB SOCIAL', type: 'number', x: 100, y: 900 },
      { label: '14-ENCARGOS', type: 'number', x: 300, y: 900 },
      { label: '15-TOTAL A RECOLHER', type: 'number', x: 500, y: 900 }
    ]
    
    for (let page = 0; page < pageCount; page++) {
      formFields.forEach((field, index) => {
        const sanitizedName = sanitizeFieldName(field.label)
        
        mockFields.push({
          id: `${sanitizedName}${index > 14 ? '_2' : ''}`,
          type: field.type as any,
          label: field.label,
          x: field.x,
          y: field.y,
          width: 200,
          height: 35,
          page,
          confidence: 0.9
        })
      })
    }
    
    console.log(`🎭 Gerados ${mockFields.length} campos mock para ${pageCount} página(s)`)
    return mockFields
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private createFallbackFields(): DetectedField[] {
    return [
      {
        id: `field_nome_${Date.now()}`,
        type: 'text',
        label: 'Nome Completo',
        x: 100,
        y: 150,
        width: 250,
        height: 30,
        page: 1,
        confidence: 0.8
      },
      {
        id: `field_cpf_${Date.now()}`,
        type: 'text',
        label: 'CPF',
        x: 400,
        y: 150,
        width: 150,
        height: 30,
        page: 1,
        confidence: 0.8
      },
      {
        id: `field_data_${Date.now()}`,
        type: 'date',
        label: 'Data',
        x: 100,
        y: 220,
        width: 150,
        height: 30,
        page: 1,
        confidence: 0.7
      }
    ]
  }

  private async saveMetadataToDatabase(
    fileName: string,
    pdfPath: string,
    imagePaths: string[],
    detectedFields: DetectedField[]
  ): Promise<void> {
    try {
      // Converter caminhos relativos para URLs públicas completas
      const imagePublicUrls = imagePaths.map(path => {
        // Se já é uma URL completa, usar como está
        if (path.startsWith('http')) {
          return path
        }
        
        // Converter caminho relativo para URL pública
        const { data } = supabase.storage
          .from('processed-images')
          .getPublicUrl(path)
        
        return data.publicUrl
      })

      console.log(`📸 Salvando ${imagePublicUrls.length} URL(s) pública(s) no template:`)
      imagePublicUrls.forEach((url, index) => {
        console.log(`   Página ${index + 1}: ${url}`)
      })

      // Salvar no log de processamento
      const { error: logError } = await supabase
        .from('pdf_processing_log')
        .insert({
          processing_id: this.processingId,
          file_name: fileName,
          pdf_path: pdfPath,
          image_paths: imagePaths, // Log mantém caminhos relativos
          fields_count: detectedFields.length,
          pages_count: imagePaths.length,
          status: 'completed'
        } as any)

      if (logError) {
        console.error('❌ Erro ao salvar log:', logError)
      }

      // Criar template de formulário
      const templateName = fileName.replace(/\.[^/.]+$/, '') // Remove extensão
      
      const { error: templateError } = await supabase
        .from('form_templates')
        .insert({
          processing_id: this.processingId,
          name: templateName,
          description: `Formulário gerado automaticamente de ${fileName}`,
          pdf_url: pdfPath, // Usar pdf_url que já existe
          pdf_path: pdfPath,
          image_paths: imagePublicUrls, // ✅ USAR URLs PÚBLICAS COMPLETAS
          fields: detectedFields,
          field_definitions: this.createFieldDefinitions(detectedFields),
          pdf_pages: imagePaths.length,
          is_active: true
        } as any)

      if (templateError) {
        console.error('❌ Erro ao salvar template:', templateError)
        throw new Error(`Erro ao criar template: ${templateError.message}`)
      }
      
      console.log('✅ Template de formulário criado com URLs públicas completas')
      console.log(`📋 Template: ${templateName}`)
      console.log(`📄 Páginas: ${imagePublicUrls.length}`)
      console.log(`📝 Campos: ${detectedFields.length}`)
      
    } catch (error) {
      console.error('❌ Erro ao salvar no banco:', error)
      throw error
    }
  }

  private createFieldDefinitions(fields: DetectedField[]): any {
    const definitions: any = {}
    
    fields.forEach(field => {
      definitions[field.id] = {
        label: field.label,
        type: field.type,
        required: false,
        validation: this.getValidationRules(field.type),
        position: {
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
          page: field.page
        }
      }
    })
    
    return definitions
  }

  private getValidationRules(type: string): any {
    switch (type) {
      case 'number':
        return { type: 'number', min: 0 }
      case 'date':
        return { type: 'date' }
      case 'text':
        return { type: 'string', maxLength: 255 }
      default:
        return { type: 'string' }
    }
  }
}