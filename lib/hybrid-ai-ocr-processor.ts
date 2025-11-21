import { GoogleGenerativeAI } from '@google/generative-ai'
import { FormField } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'

export interface ExpectedFieldsConfig {
  [pageNumber: number]: {
    expectedCount: number
    fieldTypes?: string[]
    description?: string
  }
}

export interface HybridOCRResult {
  pages: number
  imageUrls: string[]
  detectedFields: HybridDetectedField[]
  ocrText: string[]
  confidence: number
  method: 'hybrid' | 'ai-only' | 'ocr-fallback'
  expectedVsFound: { [page: number]: { expected: number, found: number } }
}

export interface HybridDetectedField {
  id: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea' | 'signature' | 'email' | 'phone'
  label: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  page: number
  detectionMethod: 'ai' | 'ocr' | 'hybrid'
  description?: string
}

export class HybridAIOCRProcessor {
  private genAI: GoogleGenerativeAI
  private model: any
  private expectedFields: ExpectedFieldsConfig = {}

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não encontrada no .env.local')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    
    // Usar modelo configurável
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    this.model = this.genAI.getGenerativeModel({ model: modelName })
    
    console.log(`🤖 Inicializando Hybrid AI+OCR com modelo: ${modelName}`)
  }

  /**
   * Configurar campos esperados por página
   */
  setExpectedFields(config: ExpectedFieldsConfig): void {
    this.expectedFields = config
    console.log('📋 Configuração de campos esperados:', config)
  }

  /**
   * Processar PDF com IA híbrida + OCR
   */
  async processWithHybridAI(
    imageUrls: string[],
    onProgress?: (stage: string, progress: number, details?: any) => void
  ): Promise<HybridOCRResult> {
    
    console.log('🚀 Iniciando processamento híbrido AI+OCR...')
    
    const allDetectedFields: HybridDetectedField[] = []
    const ocrTexts: string[] = []
    const expectedVsFound: { [page: number]: { expected: number, found: number } } = {}
    
    for (let i = 0; i < imageUrls.length; i++) {
      const pageNum = i + 1
      const expectedConfig = this.expectedFields[pageNum] || { expectedCount: 0 }
      
      onProgress?.(`Processando página ${pageNum} (esperados: ${expectedConfig.expectedCount} campos)`, 
                  (i / imageUrls.length) * 90)
      
      console.log(`📄 Processando página ${pageNum}/${imageUrls.length}`)
      console.log(`🎯 Campos esperados: ${expectedConfig.expectedCount}`)
      
      try {
        const pageResult = await this.processPageWithHybridAI(
          imageUrls[i], 
          i, 
          expectedConfig,
          onProgress
        )
        
        allDetectedFields.push(...pageResult.fields)
        ocrTexts.push(pageResult.text)
        
        expectedVsFound[pageNum] = {
          expected: expectedConfig.expectedCount,
          found: pageResult.fields.length
        }
        
        console.log(`✅ Página ${pageNum}: ${pageResult.fields.length}/${expectedConfig.expectedCount} campos encontrados`)
        
        // Se não encontrou campos suficientes, tentar novamente com modo agressivo
        if (pageResult.fields.length < expectedConfig.expectedCount * 0.7) {
          console.log(`🔄 Tentativa agressiva para página ${pageNum}...`)
          
          const aggressiveResult = await this.processPageAggressively(
            imageUrls[i], 
            i, 
            expectedConfig,
            pageResult.fields.length
          )
          
          if (aggressiveResult.fields.length > pageResult.fields.length) {
            // Substituir pelos resultados agressivos se melhores
            allDetectedFields.splice(-pageResult.fields.length, pageResult.fields.length)
            allDetectedFields.push(...aggressiveResult.fields)
            expectedVsFound[pageNum].found = aggressiveResult.fields.length
            
            console.log(`✅ Modo agressivo melhorou: ${aggressiveResult.fields.length} campos`)
          }
        }
        
      } catch (error) {
        console.error(`❌ Erro na página ${pageNum}:`, error)
        ocrTexts.push('')
        expectedVsFound[pageNum] = { expected: expectedConfig.expectedCount, found: 0 }
      }
    }
    
    onProgress?.('Finalizando processamento híbrido...', 95)
    
    // Calcular confiança geral
    const totalExpected = Object.values(expectedVsFound).reduce((sum, page) => sum + page.expected, 0)
    const totalFound = Object.values(expectedVsFound).reduce((sum, page) => sum + page.found, 0)
    const confidence = totalExpected > 0 ? Math.min(1, totalFound / totalExpected) : 0.8
    
    console.log(`🎯 Resultado final: ${totalFound}/${totalExpected} campos (${Math.round(confidence * 100)}% confiança)`)
    
    return {
      pages: imageUrls.length,
      imageUrls,
      detectedFields: allDetectedFields,
      ocrText: ocrTexts,
      confidence,
      method: 'hybrid',
      expectedVsFound
    }
  }

  /**
   * Processar uma página com IA híbrida
   */
  private async processPageWithHybridAI(
    imageUrl: string, 
    pageIndex: number, 
    expectedConfig: { expectedCount: number, fieldTypes?: string[], description?: string },
    onProgress?: (stage: string, progress: number, details?: any) => void
  ): Promise<{ fields: HybridDetectedField[], text: string }> {
    
    try {
      const base64Data = imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : imageUrl
      
      const prompt = this.buildHybridPrompt(expectedConfig, pageIndex + 1)
      
      onProgress?.(`IA analisando página ${pageIndex + 1}...`, 50)
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      console.log(`🤖 Resposta da IA para página ${pageIndex + 1}:`, text.substring(0, 300) + '...')

      // Processar resposta da IA
      const aiFields = await this.parseAIResponse(text, pageIndex, expectedConfig)
      
      return {
        fields: aiFields,
        text: text
      }

    } catch (error) {
      console.error(`❌ Erro no processamento híbrido da página ${pageIndex + 1}:`, error)
      return { fields: [], text: '' }
    }
  }

  /**
   * Processamento agressivo quando não encontra campos suficientes
   */
  private async processPageAggressively(
    imageUrl: string, 
    pageIndex: number, 
    expectedConfig: { expectedCount: number, fieldTypes?: string[], description?: string },
    currentCount: number
  ): Promise<{ fields: HybridDetectedField[], text: string }> {
    
    try {
      console.log(`🔥 Modo agressivo: buscando ${expectedConfig.expectedCount - currentCount} campos adicionais`)
      
      const base64Data = imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : imageUrl
      
      const aggressivePrompt = `
MODO ULTRA AGRESSIVO DE DETECÇÃO DE CAMPOS - PÁGINA ${pageIndex + 1}

VOCÊ DEVE ENCONTRAR EXATAMENTE ${expectedConfig.expectedCount} CAMPOS NESTA IMAGEM!

Atualmente foram encontrados apenas ${currentCount} campos, mas DEVEM existir ${expectedConfig.expectedCount} campos.

INSTRUÇÕES CRÍTICAS:
1. PROCURE MINUCIOSAMENTE por QUALQUER elemento que possa ser um campo:
   - Linhas em branco (____)
   - Caixas vazias (□)
   - Espaços após dois pontos (:)
   - Áreas com bordas
   - Qualquer espaço que pareça ser para preenchimento
   - Campos parcialmente preenchidos
   - Campos com texto placeholder
   - Assinaturas, datas, números, checkboxes

2. SEJA EXTREMAMENTE DETALHISTA nas coordenadas
3. INCLUA campos mesmo com baixa confiança
4. PREFIRA FALSOS POSITIVOS a perder campos reais
5. VARIE os tipos de campo baseado no contexto

RESPONDA APENAS COM JSON VÁLIDO:
{
  "fields": [
    {
      "id": "aggressive_campo_X",
      "type": "text|number|date|checkbox|select|textarea|signature|email|phone",
      "label": "Nome descritivo do campo",
      "bbox": {
        "x": coordenada_x_precisa,
        "y": coordenada_y_precisa,
        "width": largura_precisa,
        "height": altura_precisa
      },
      "confidence": 0.6_a_1.0,
      "description": "Descrição detalhada do que foi detectado"
    }
  ],
  "totalFound": número_total_de_campos_encontrados,
  "searchStrategy": "Estratégia usada para encontrar os campos"
}

ENCONTRE TODOS OS ${expectedConfig.expectedCount} CAMPOS!
`

      const result = await this.model.generateContent([
        aggressivePrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      const aggressiveFields = await this.parseAIResponse(text, pageIndex, expectedConfig, true)
      
      return {
        fields: aggressiveFields,
        text: text
      }

    } catch (error) {
      console.error(`❌ Erro no modo agressivo:`, error)
      return { fields: [], text: '' }
    }
  }

  /**
   * Construir prompt híbrido inteligente
   */
  private buildHybridPrompt(
    expectedConfig: { expectedCount: number, fieldTypes?: string[], description?: string },
    pageNumber: number
  ): string {
    
    const basePrompt = `
ANÁLISE HÍBRIDA AI+OCR - PÁGINA ${pageNumber}

OBJETIVO: Detectar EXATAMENTE ${expectedConfig.expectedCount} campos de formulário nesta imagem.

CONTEXTO IMPORTANTE:
- Esta é a página ${pageNumber} de um formulário PDF
- Devem existir aproximadamente ${expectedConfig.expectedCount} campos nesta página
- ${expectedConfig.description || 'Formulário padrão de inspeção/relatório'}

INSTRUÇÕES DETALHADAS:
1. ANALISE MINUCIOSAMENTE toda a imagem
2. IDENTIFIQUE todos os elementos que podem ser campos:
   - Caixas de texto vazias ou com placeholder
   - Linhas para preenchimento (_______)
   - Checkboxes (□ ☐ ☑ ✓)
   - Campos de data (DD/MM/AAAA)
   - Áreas de assinatura
   - Listas de seleção
   - Campos numéricos
   - Áreas de texto livre

3. SEJA PRECISO nas coordenadas (x, y, width, height)
4. CLASSIFIQUE corretamente o tipo de cada campo
5. USE labels descritivos em português
6. GARANTA que encontrou próximo de ${expectedConfig.expectedCount} campos

TIPOS ESPERADOS: ${expectedConfig.fieldTypes?.join(', ') || 'text, number, date, checkbox, select, textarea, signature'}

RESPONDA APENAS COM JSON VÁLIDO:
{
  "fields": [
    {
      "id": "campo_p${pageNumber}_X",
      "type": "text|number|date|checkbox|select|textarea|signature|email|phone",
      "label": "Nome do campo em português",
      "bbox": {
        "x": posição_x_exata,
        "y": posição_y_exata,
        "width": largura_exata,
        "height": altura_exata
      },
      "confidence": 0.8_a_1.0,
      "description": "Descrição do que foi detectado"
    }
  ],
  "pageAnalysis": {
    "totalFieldsFound": número_de_campos_encontrados,
    "expectedFields": ${expectedConfig.expectedCount},
    "confidence": confiança_geral_0_a_1,
    "notes": "Observações sobre a detecção"
  }
}

ENCONTRE TODOS OS ${expectedConfig.expectedCount} CAMPOS ESPERADOS!
`

    return basePrompt
  }

  /**
   * Processar resposta da IA
   */
  private async parseAIResponse(
    text: string, 
    pageIndex: number, 
    expectedConfig: { expectedCount: number },
    isAggressive: boolean = false
  ): Promise<HybridDetectedField[]> {
    
    try {
      // Limpar e extrair JSON
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonData = JSON.parse(cleanText)
      
      const fields: HybridDetectedField[] = []
      
      if (jsonData.fields && Array.isArray(jsonData.fields)) {
        // ETAPA 1: Remover duplicados por label ANTES da conversão
        const uniqueFieldsByLabel = this.removeDuplicatesByLabel(jsonData.fields)
        console.log(`✅ Híbrido: Após remoção de duplicados por label: ${uniqueFieldsByLabel.length} campos únicos`)
        
        const usedIds = new Set<string>()
        
        uniqueFieldsByLabel.forEach((field: any, index: number) => {
          if (field.bbox && field.label) {
            // ETAPA 2: Gerar ID único garantido
            const baseName = sanitizeFieldName(field.label)
            let uniqueId = baseName
            let counter = 1
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseName}_${counter}`
              counter++
            }
            
            fields.push({
              id: uniqueId,
              type: this.validateFieldType(field.type),
              label: field.label,
              bbox: {
                x: Math.max(0, Number(field.bbox.x) || 0),
                y: Math.max(0, Number(field.bbox.y) || 0),
                width: Math.max(20, Number(field.bbox.width) || 150),
                height: Math.max(15, Number(field.bbox.height) || 30)
              },
              confidence: Math.min(1, Math.max(0.5, Number(field.confidence) || 0.8)),
              page: pageIndex,
              detectionMethod: isAggressive ? 'ai' : 'hybrid',
              description: field.description
            })
            
            usedIds.add(uniqueId)
            console.log(`✅ Híbrido campo ${index + 1}: "${field.label}" → ID: "${uniqueId}"`)
          }
        })
      }
      
      console.log(`📊 Página ${pageIndex + 1}: ${fields.length}/${expectedConfig.expectedCount} campos processados`)
      
      return fields
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error)
      console.log('Resposta problemática:', text.substring(0, 500))
      
      // Fallback: tentar extrair campos por padrões
      return this.extractFieldsByPatterns(text, pageIndex)
    }
  }

  /**
   * Remove campos duplicados por label, mantendo o melhor
   */
  private removeDuplicatesByLabel(fields: any[]): any[] {
    const fieldsByLabel = new Map<string, any[]>()
    
    // Agrupar por label
    fields.forEach(field => {
      const normalizedLabel = field.label.trim().toLowerCase()
      if (!fieldsByLabel.has(normalizedLabel)) {
        fieldsByLabel.set(normalizedLabel, [])
      }
      fieldsByLabel.get(normalizedLabel)!.push(field)
    })
    
    const uniqueFields: any[] = []
    
    fieldsByLabel.forEach((fieldsWithSameLabel, label) => {
      if (fieldsWithSameLabel.length === 1) {
        uniqueFields.push(fieldsWithSameLabel[0])
      } else {
        console.log(`🔄 Híbrido - Label duplicado "${label}": ${fieldsWithSameLabel.length} campos encontrados`)
        
        // Escolher o melhor campo baseado em confiança e posição
        const bestField = fieldsWithSameLabel.reduce((best, current) => {
          const bestConf = Number(best.confidence) || 0.5
          const currentConf = Number(current.confidence) || 0.5
          
          // Preferir maior confiança
          if (currentConf > bestConf) return current
          if (currentConf < bestConf) return best
          
          // Se confiança igual, preferir posição mais organizada
          const bestScore = (Number(best.bbox?.x) || 0) + (Number(best.bbox?.y) || 0)
          const currentScore = (Number(current.bbox?.x) || 0) + (Number(current.bbox?.y) || 0)
          
          return currentScore < bestScore ? current : best
        })
        
        uniqueFields.push(bestField)
        console.log(`   ✅ Mantido: confiança ${bestField.confidence}`)
      }
    })
    
    return uniqueFields
  }

  /**
   * Fallback: extrair campos por padrões de texto
   */
  private extractFieldsByPatterns(text: string, pageIndex: number): HybridDetectedField[] {
    const fields: HybridDetectedField[] = []
    
    const patterns = [
      { regex: /nome|name/i, type: 'text' as const, label: 'Nome' },
      { regex: /data|date/i, type: 'date' as const, label: 'Data' },
      { regex: /email/i, type: 'email' as const, label: 'Email' },
      { regex: /telefone|phone/i, type: 'phone' as const, label: 'Telefone' },
      { regex: /assinatura|signature/i, type: 'signature' as const, label: 'Assinatura' },
      { regex: /número|numero|number/i, type: 'number' as const, label: 'Número' }
    ]

    patterns.forEach((pattern, index) => {
      if (pattern.regex.test(text)) {
        // Gerar nome PostgreSQL correto para fallback
        const sanitizedName = sanitizeFieldName(pattern.label)
        
        fields.push({
          id: sanitizedName, // Nome PostgreSQL correto
          type: pattern.type,
          label: pattern.label,
          bbox: {
            x: 100 + (index * 50),
            y: 100 + (index * 60),
            width: 200,
            height: 35
          },
          confidence: 0.6,
          page: pageIndex,
          detectionMethod: 'ocr',
          description: 'Campo detectado por padrão de texto'
        })
      }
    })

    return fields
  }

  /**
   * Validar tipo de campo
   */
  private validateFieldType(type: string): HybridDetectedField['type'] {
    const validTypes: HybridDetectedField['type'][] = [
      'text', 'number', 'date', 'checkbox', 'select', 'textarea', 'signature', 'email', 'phone'
    ]
    
    return validTypes.includes(type as any) ? type as HybridDetectedField['type'] : 'text'
  }

  /**
   * Converter para FormField
   */
  private mapFieldType(type: string): 'text' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'textarea' | 'signature' {
    switch (type) {
      case 'email':
      case 'phone':
        return 'text'
      case 'number':
        return 'number'
      case 'date':
        return 'date'
      case 'select':
        return 'select'
      case 'checkbox':
        return 'checkbox'
      case 'textarea':
        return 'textarea'
      case 'signature':
        return 'signature'
      case 'image':
        return 'image'
      default:
        return 'text'
    }
  }

  convertToFormFields(detectedFields: HybridDetectedField[]): FormField[] {
    return detectedFields.map((field, index) => {
      // Usar nome já sanitizado do campo ou gerar um novo
      const sanitizedName = field.id || sanitizeFieldName(field.label)
      
      return {
        id: sanitizedName,
        name: sanitizedName, // Nome PostgreSQL correto
        type: this.mapFieldType(field.type),
        label: field.label,
        required: this.isLikelyRequired(field.label),
        position: {
          x: Math.round(field.bbox.x),
          y: Math.round(field.bbox.y),
          width: Math.round(field.bbox.width),
          height: Math.round(field.bbox.height),
          page: field.page
        },
        validation: this.generateValidation(field.type),
        placeholder: this.generatePlaceholder(field.type, field.label),
        helpText: field.description
      }
    })
  }

  private generateFieldName(label: string, index: number): string {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || `campo_${index}`
  }

  private isLikelyRequired(label: string): boolean {
    const requiredPatterns = /\b(nome|name|data|date|assinatura|signature|obrigatório|required|\*)\b/i
    return requiredPatterns.test(label)
  }

  private generateValidation(type: string) {
    switch (type) {
      case 'number':
        return { min: 0, max: 999999 }
      case 'text':
      case 'email':
      case 'phone':
        return { maxLength: 255 }
      case 'textarea':
        return { maxLength: 1000 }
      default:
        return undefined
    }
  }

  private generatePlaceholder(type: string, label: string): string {
    switch (type) {
      case 'date':
        return 'dd/mm/aaaa'
      case 'number':
        return '0'
      case 'email':
        return 'exemplo@email.com'
      case 'phone':
        return '(11) 99999-9999'
      case 'text':
        return `Digite ${label.toLowerCase()}`
      default:
        return ''
    }
  }
}