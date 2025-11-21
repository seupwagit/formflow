import { GoogleGenerativeAI } from '@google/generative-ai'
import { FormField } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'
import { generateUniqueFieldId } from './unique-field-generator'

export interface GeminiOCRResult {
  pages: number
  imageUrls: string[]
  detectedFields: GeminiDetectedField[]
  ocrText: string[]
}

export interface GeminiDetectedField {
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
  description?: string
}

export class GeminiOCRProcessor {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não encontrada no .env.local')
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async loadPDF(file: File): Promise<GeminiOCRResult> {
    console.log('🤖 Iniciando processamento com Gemini Vision OCR...')
    
    try {
      // Converter PDF para imagens
      const images = await this.convertPDFToImages(file)
      console.log(`✅ PDF convertido em ${images.length} imagens`)

      // Processar cada página com Gemini Vision
      const allDetectedFields: GeminiDetectedField[] = []
      const ocrTexts: string[] = []
      
      for (let i = 0; i < images.length; i++) {
        console.log(`🔍 Processando página ${i + 1}/${images.length} com Gemini Vision...`)
        
        const { fields, text } = await this.processPageWithGemini(images[i], i)
        allDetectedFields.push(...fields)
        ocrTexts.push(text)
        
        console.log(`📝 Página ${i + 1}: ${fields.length} campos detectados pelo Gemini`)
      }

      console.log(`✅ Gemini OCR concluído: ${allDetectedFields.length} campos total`)

      return {
        pages: images.length,
        imageUrls: images,
        detectedFields: allDetectedFields,
        ocrText: ocrTexts
      }

    } catch (error) {
      console.error('❌ Erro no Gemini OCR:', error)
      throw error
    }
  }

  private async convertPDFToImages(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          
          // Usar PDF.js para renderizar páginas em alta resolução
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          const images: string[] = []
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const viewport = page.getViewport({ scale: 3.0 }) // Alta resolução para Gemini
            
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')!
            canvas.height = viewport.height
            canvas.width = viewport.width
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise
            
            images.push(canvas.toDataURL('image/png', 0.95))
          }
          
          resolve(images)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo PDF'))
      reader.readAsArrayBuffer(file)
    })
  }

  async processPageWithGemini(imageUrl: string, pageIndex: number): Promise<{ fields: GeminiDetectedField[], text: string }> {
    try {
      // Converter data URL para formato que o Gemini aceita
      const base64Data = imageUrl.split(',')[1]
      
      const prompt = `
Analise esta imagem de um formulário PDF e identifique TODOS os campos de entrada possíveis.

Para cada campo encontrado, forneça as seguintes informações em formato JSON:

{
  "fields": [
    {
      "id": "campo_1",
      "type": "text|number|date|checkbox|select|textarea|signature|email|phone",
      "label": "Nome do campo conforme aparece no formulário",
      "bbox": {
        "x": posição_x_em_pixels,
        "y": posição_y_em_pixels,
        "width": largura_em_pixels,
        "height": altura_em_pixels
      },
      "confidence": 0.95,
      "description": "Descrição adicional se necessário"
    }
  ],
  "fullText": "Todo o texto extraído da imagem"
}

INSTRUÇÕES IMPORTANTES:
1. Identifique TODOS os campos de entrada: caixas de texto, checkboxes, campos de data, assinaturas, etc.
2. Seja preciso nas coordenadas (x, y, width, height) - use as posições reais dos campos na imagem
3. Determine o tipo correto baseado no contexto:
   - "text" para nomes, descrições gerais
   - "number" para valores numéricos, códigos, quantidades
   - "date" para datas
   - "email" para campos de email
   - "phone" para telefones
   - "checkbox" para sim/não, aprovado/reprovado
   - "select" para listas de opções
   - "textarea" para textos longos
   - "signature" para campos de assinatura
4. Use labels descritivos em português
5. Confidence deve ser entre 0.8 e 1.0 para campos claramente visíveis
6. Inclua campos mesmo que estejam parcialmente preenchidos
7. Procure por linhas, caixas, underscores que indicam campos de entrada

IMPORTANTE - EVITE DUPLICADOS:
- NÃO crie múltiplos campos com o mesmo label/nome
- Se um campo aparece em várias posições, escolha apenas a posição principal
- Cada campo deve ter um label único e descritivo
- Prefira qualidade sobre quantidade - melhor ter menos campos únicos do que muitos duplicados

DETECÇÃO DE TABELAS:
- Se encontrar uma TABELA ou GRADE de campos, mapeie CADA CÉLULA como um campo separado
- Para tabelas, use labels descritivos como: "Tabela1_Linha1_Col1", "Tabela1_Linha1_Col2"
- Identifique cabeçalhos de tabela e linhas de dados separadamente
- Cada célula da tabela deve ter coordenadas precisas e tamanho adequado
- Exemplo: tabela 3x10 = 30 campos únicos, cada um com posição específica

Responda APENAS com o JSON válido, sem texto adicional.
`

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
      
      console.log('🤖 Resposta do Gemini:', text.substring(0, 500) + '...')

      // Tentar extrair JSON da resposta
      let jsonData
      try {
        // Remover markdown se presente
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        jsonData = JSON.parse(cleanText)
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON do Gemini:', parseError)
        console.log('Resposta completa:', text)
        
        // Fallback: tentar extrair campos manualmente
        return this.fallbackFieldExtraction(text, pageIndex)
      }

      // Converter para formato interno
      const detectedFields: GeminiDetectedField[] = []
      
      if (jsonData.fields && Array.isArray(jsonData.fields)) {
        jsonData.fields.forEach((field: any, index: number) => {
          if (field.bbox && field.label) {
            const position = {
              x: Math.max(0, Number(field.bbox.x) || 0),
              y: Math.max(0, Number(field.bbox.y) || 0),
              width: Math.max(50, Number(field.bbox.width) || 200),
              height: Math.max(20, Number(field.bbox.height) || 35),
              page: pageIndex
            }
            
            // Gerar ID único baseado na posição para evitar duplicatas
            const uniqueId = generateUniqueFieldId(field.label, detectedFields.map(f => ({
              id: f.id,
              name: f.id,
              type: 'text' as any,
              label: field.label,
              required: false,
              position: { x: f.bbox.x, y: f.bbox.y, width: f.bbox.width, height: f.bbox.height, page: f.page },
              confidence: f.confidence
            })), position, index)
            
            detectedFields.push({
              id: uniqueId, // ID único baseado em posição + timestamp + índice
              type: this.validateFieldType(field.type),
              label: field.label,
              bbox: {
                x: position.x,
                y: position.y,
                width: position.width,
                height: position.height
              },
              confidence: Math.min(1, Math.max(0, Number(field.confidence) || 0.9)),
              page: pageIndex,
              description: field.description
            })
          }
        })
      }

      return {
        fields: detectedFields,
        text: jsonData.fullText || text
      }

    } catch (error) {
      console.error('❌ Erro no Gemini Vision:', error)
      return { fields: [], text: '' }
    }
  }

  private validateFieldType(type: string): GeminiDetectedField['type'] {
    const validTypes: GeminiDetectedField['type'][] = [
      'text', 'number', 'date', 'checkbox', 'select', 'textarea', 'signature', 'email', 'phone'
    ]
    
    return validTypes.includes(type as any) ? type as GeminiDetectedField['type'] : 'text'
  }

  private fallbackFieldExtraction(text: string, pageIndex: number): { fields: GeminiDetectedField[], text: string } {
    // Fallback simples se o JSON falhar
    const fields: GeminiDetectedField[] = []
    
    // Procurar por padrões comuns
    const patterns = [
      { regex: /nome|name/i, type: 'text' as const, label: 'Nome' },
      { regex: /data|date/i, type: 'date' as const, label: 'Data' },
      { regex: /email|e-mail/i, type: 'email' as const, label: 'Email' },
      { regex: /telefone|phone|fone/i, type: 'phone' as const, label: 'Telefone' },
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
          confidence: 0.7,
          page: pageIndex,
          description: 'Campo detectado por fallback'
        })
      }
    })

    return { fields, text }
  }

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

  convertToFormFields(detectedFields: GeminiDetectedField[]): FormField[] {
    console.log(`🔍 Convertendo ${detectedFields.length} campos detectados pelo Gemini...`)
    
    // ETAPA 1: Detectar e mapear tabelas (funcionalidade futura)
    let tableFields: FormField[] = []
    // TODO: Implementar detecção de tabelas quando necessário
    // Por enquanto, pular esta etapa para evitar problemas de compilação
    
    // ETAPA 2: Remover duplicados por label ANTES da conversão
    const uniqueFieldsByLabel = this.removeDuplicatesByLabel(detectedFields)
    console.log(`✅ Após remoção de duplicados por label: ${uniqueFieldsByLabel.length} campos únicos`)
    
    const formFields: FormField[] = []
    const usedNames = new Set<string>()
    const usedIds = new Set<string>()
    
    // Adicionar campos de tabela primeiro (têm prioridade)
    tableFields.forEach(field => {
      usedNames.add(field.name)
      usedIds.add(field.id)
      formFields.push(field)
    })
    
    uniqueFieldsByLabel.forEach((field, index) => {
      const position = {
        x: Math.round(field.bbox.x),
        y: Math.round(field.bbox.y),
        width: Math.round(field.bbox.width),
        height: Math.round(field.bbox.height),
        page: field.page
      }
      
      // ETAPA 2: Gerar ID e nome únicos garantidos
      let uniqueId = field.id
      let counter = 1
      while (usedIds.has(uniqueId)) {
        uniqueId = `${field.id}_${counter}`
        counter++
      }
      
      const baseName = this.sanitizeFieldName(field.label)
      let uniqueName = baseName
      counter = 1
      while (usedNames.has(uniqueName)) {
        uniqueName = `${baseName}_${counter}`
        counter++
      }
      
      const formField: FormField = {
        id: uniqueId,
        name: uniqueName,
        type: this.mapFieldType(field.type),
        label: field.label,
        required: this.isLikelyRequired(field.label),
        position: position,
        validation: this.generateValidation(field.type),
        placeholder: this.generatePlaceholder(field.type, field.label),
        helpText: field.description
      }
      
      usedIds.add(uniqueId)
      usedNames.add(uniqueName)
      formFields.push(formField)
      
      console.log(`✅ Campo ${index + 1}: "${field.label}" → ID: "${uniqueId}", NAME: "${uniqueName}"`)
    })
    
    console.log(`🎯 Conversão concluída: ${formFields.length} campos únicos gerados`)
    return formFields
  }

  /**
   * Remove campos duplicados por label, mantendo o melhor
   */
  private removeDuplicatesByLabel(fields: GeminiDetectedField[]): GeminiDetectedField[] {
    const fieldsByLabel = new Map<string, GeminiDetectedField[]>()
    
    // Agrupar por label
    fields.forEach(field => {
      const normalizedLabel = field.label.trim().toLowerCase()
      if (!fieldsByLabel.has(normalizedLabel)) {
        fieldsByLabel.set(normalizedLabel, [])
      }
      fieldsByLabel.get(normalizedLabel)!.push(field)
    })
    
    const uniqueFields: GeminiDetectedField[] = []
    
    fieldsByLabel.forEach((fieldsWithSameLabel, label) => {
      if (fieldsWithSameLabel.length === 1) {
        uniqueFields.push(fieldsWithSameLabel[0])
      } else {
        console.log(`🔄 Label duplicado "${label}": ${fieldsWithSameLabel.length} campos encontrados`)
        
        // Escolher o melhor campo baseado em:
        // 1. Maior confiança
        // 2. Posição mais organizada (coordenadas menores)
        // 3. Tamanho mais apropriado
        const bestField = fieldsWithSameLabel.reduce((best, current) => {
          // Preferir maior confiança
          if (current.confidence > best.confidence) return current
          if (current.confidence < best.confidence) return best
          
          // Se confiança igual, preferir posição mais organizada
          const bestScore = best.bbox.x + best.bbox.y
          const currentScore = current.bbox.x + current.bbox.y
          
          return currentScore < bestScore ? current : best
        })
        
        uniqueFields.push(bestField)
        console.log(`   ✅ Mantido: confiança ${bestField.confidence}, posição (${bestField.bbox.x}, ${bestField.bbox.y})`)
        
        // Log dos removidos
        fieldsWithSameLabel.forEach(field => {
          if (field !== bestField) {
            console.log(`   ❌ Removido: confiança ${field.confidence}, posição (${field.bbox.x}, ${field.bbox.y})`)
          }
        })
      }
    })
    
    return uniqueFields
  }

  /**
   * Sanitiza nome do campo para uso como ID/name
   */
  private sanitizeFieldName(label: string): string {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50) || 'campo'
  }

  private generateFieldName(label: string, index: number): string {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
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