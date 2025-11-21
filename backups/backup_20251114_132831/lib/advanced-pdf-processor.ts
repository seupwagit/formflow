import { createWorker } from 'tesseract.js'
import { FormField } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'

export interface ProcessedPDFResult {
  pages: number
  imageUrls: string[]
  detectedFields: DetectedField[]
  ocrText: string[]
}

export interface DetectedField {
  id: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea' | 'signature'
  label: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  page: number
  text?: string
}

export class AdvancedPDFProcessor {
  private worker: Tesseract.Worker | null = null

  async initializeOCR() {
    if (!this.worker) {
      this.worker = await createWorker('por+eng', 1, {
        logger: m => console.log('OCR:', m)
      })
      
      // Configurar para melhor detecção de formulários
      await this.worker.setParameters({
        tessedit_pageseg_mode: 6 as any, // Uniform block of text
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ .:,-_()[]{}/',
        preserve_interword_spaces: '1'
      })
    }
  }

  async loadPDF(file: File): Promise<ProcessedPDFResult> {
    console.log('🔄 Iniciando processamento avançado do PDF...')
    
    try {
      // Converter PDF para imagens usando canvas
      const images = await this.convertPDFToImages(file)
      console.log(`✅ PDF convertido em ${images.length} imagens`)

      // Inicializar OCR
      await this.initializeOCR()
      
      // Processar cada página com OCR
      const allDetectedFields: DetectedField[] = []
      const ocrTexts: string[] = []
      
      for (let i = 0; i < images.length; i++) {
        console.log(`🔍 Processando OCR da página ${i + 1}/${images.length}...`)
        
        const { fields, text } = await this.processPageWithOCR(images[i], i)
        allDetectedFields.push(...fields)
        ocrTexts.push(text)
        
        console.log(`📝 Página ${i + 1}: ${fields.length} campos detectados`)
      }

      console.log(`✅ Processamento concluído: ${allDetectedFields.length} campos total`)

      return {
        pages: images.length,
        imageUrls: images,
        detectedFields: allDetectedFields,
        ocrText: ocrTexts
      }

    } catch (error) {
      console.error('❌ Erro no processamento avançado:', error)
      throw error
    }
  }

  private async convertPDFToImages(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          
          // Usar PDF.js para renderizar páginas
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          const images: string[] = []
          
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const viewport = page.getViewport({ scale: 2.0 }) // Alta resolução para OCR
            
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')!
            canvas.height = viewport.height
            canvas.width = viewport.width
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise
            
            images.push(canvas.toDataURL('image/png'))
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

  private async processPageWithOCR(imageUrl: string, pageIndex: number): Promise<{ fields: DetectedField[], text: string }> {
    if (!this.worker) {
      throw new Error('OCR worker não inicializado')
    }

    try {
      // Executar OCR na imagem
      const { data } = await this.worker.recognize(imageUrl)
      
      // Extrair campos baseado no texto e posições
      const detectedFields = this.extractFieldsFromOCR(data, pageIndex)
      
      return {
        fields: detectedFields,
        text: data.text
      }
    } catch (error) {
      console.error('Erro no OCR:', error)
      return { fields: [], text: '' }
    }
  }

  private extractFieldsFromOCR(ocrData: Tesseract.Page, pageIndex: number): DetectedField[] {
    const fields: DetectedField[] = []
    
    // Padrões para identificar diferentes tipos de campos
    const patterns = {
      name: /\b(nome|name|inspetor|inspector|responsável|técnico)\b/i,
      date: /\b(data|date|dia|day)\b/i,
      number: /\b(número|number|num|código|code|id)\b/i,
      temperature: /\b(temperatura|temperature|temp|°c|celsius)\b/i,
      pressure: /\b(pressão|pressure|psi|bar|kpa)\b/i,
      signature: /\b(assinatura|signature|assinar|sign)\b/i,
      checkbox: /\b(sim|não|yes|no|ok|aprovado|reprovado)\b/i,
      email: /\b(email|e-mail|mail)\b/i,
      phone: /\b(telefone|phone|tel|celular|mobile)\b/i,
      address: /\b(endereço|address|rua|street|cidade|city)\b/i
    }

    // Processar palavras do OCR
    ocrData.words.forEach((word, index) => {
      if (word.confidence < 60) return // Ignorar palavras com baixa confiança
      
      const text = word.text.toLowerCase()
      let fieldType: DetectedField['type'] = 'text'
      let label = word.text
      
      // Determinar tipo do campo baseado no texto
      if (patterns.date.test(text)) {
        fieldType = 'date'
        label = this.capitalizeFirst(word.text)
      } else if (patterns.number.test(text) || patterns.temperature.test(text) || patterns.pressure.test(text)) {
        fieldType = 'number'
        label = this.capitalizeFirst(word.text)
      } else if (patterns.signature.test(text)) {
        fieldType = 'signature'
        label = 'Assinatura'
      } else if (patterns.checkbox.test(text)) {
        fieldType = 'checkbox'
        label = this.capitalizeFirst(word.text)
      } else if (patterns.name.test(text)) {
        fieldType = 'text'
        label = 'Nome'
      } else if (patterns.email.test(text)) {
        fieldType = 'text'
        label = 'Email'
      } else if (patterns.phone.test(text)) {
        fieldType = 'text'
        label = 'Telefone'
      } else if (patterns.address.test(text)) {
        fieldType = 'textarea'
        label = 'Endereço'
      }

      // Criar campo se for relevante
      if (this.isRelevantField(text)) {
        // Procurar por espaço em branco próximo (possível área de preenchimento)
        const fieldArea = this.findFieldArea(word, ocrData.words, index)
        
        fields.push({
          id: `field_${pageIndex}_${index}`,
          type: fieldType,
          label: label,
          bbox: fieldArea,
          confidence: word.confidence,
          page: pageIndex,
          text: word.text
        })
      }
    })

    // Detectar linhas e retângulos que podem ser campos
    const geometricFields = this.detectGeometricFields(ocrData, pageIndex)
    fields.push(...geometricFields)

    // Remover duplicatas e campos sobrepostos
    return this.deduplicateFields(fields)
  }

  private isRelevantField(text: string): boolean {
    // Filtrar palavras muito curtas ou irrelevantes
    if (text.length < 3) return false
    
    // Lista de palavras irrelevantes
    const irrelevantWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an']
    if (irrelevantWords.includes(text.toLowerCase())) return false
    
    // Verificar se contém padrões de campo
    const fieldPatterns = /\b(nome|name|data|date|número|number|assinatura|signature|telefone|phone|email|endereço|address|temperatura|pressure|inspetor|técnico)\b/i
    return fieldPatterns.test(text)
  }

  private findFieldArea(word: Tesseract.Word, allWords: Tesseract.Word[], currentIndex: number): DetectedField['bbox'] {
    // Área base da palavra
    let bbox = {
      x: word.bbox.x0,
      y: word.bbox.y0,
      width: word.bbox.x1 - word.bbox.x0,
      height: word.bbox.y1 - word.bbox.y0
    }

    // Procurar por espaço em branco à direita (área de preenchimento)
    const rightSpace = this.findRightSpace(word, allWords)
    if (rightSpace > 50) { // Se há espaço significativo
      bbox.width = Math.min(rightSpace, 200) // Limitar largura máxima
    }

    // Ajustar altura mínima para campos
    bbox.height = Math.max(bbox.height, 25)
    
    // Expandir um pouco para melhor usabilidade
    bbox.x -= 5
    bbox.y -= 2
    bbox.width += 10
    bbox.height += 4

    return bbox
  }

  private findRightSpace(word: Tesseract.Word, allWords: Tesseract.Word[]): number {
    const wordRight = word.bbox.x1
    const wordY = (word.bbox.y0 + word.bbox.y1) / 2
    
    // Encontrar próxima palavra na mesma linha
    let nextWordLeft = Infinity
    
    allWords.forEach(otherWord => {
      if (otherWord === word) return
      
      const otherY = (otherWord.bbox.y0 + otherWord.bbox.y1) / 2
      const yDiff = Math.abs(wordY - otherY)
      
      // Se está na mesma linha (tolerância de 10px)
      if (yDiff < 10 && otherWord.bbox.x0 > wordRight) {
        nextWordLeft = Math.min(nextWordLeft, otherWord.bbox.x0)
      }
    })
    
    return nextWordLeft === Infinity ? 200 : nextWordLeft - wordRight
  }

  private detectGeometricFields(ocrData: Tesseract.Page, pageIndex: number): DetectedField[] {
    const fields: DetectedField[] = []
    
    // Detectar linhas horizontais que podem ser campos de texto
    const lines = this.detectHorizontalLines(ocrData)
    
    lines.forEach((line, index) => {
      fields.push({
        id: `line_field_${pageIndex}_${index}`,
        type: 'text',
        label: 'Campo de Texto',
        bbox: line,
        confidence: 80,
        page: pageIndex
      })
    })

    return fields
  }

  private detectHorizontalLines(ocrData: Tesseract.Page): DetectedField['bbox'][] {
    // Esta é uma implementação simplificada
    // Em uma versão mais avançada, usaríamos processamento de imagem para detectar linhas
    const lines: DetectedField['bbox'][] = []
    
    // Procurar por padrões de underscores ou traços
    ocrData.words.forEach(word => {
      if (word.text.match(/_{3,}|_{3,}/)) {
        lines.push({
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: 25
        })
      }
    })

    return lines
  }

  private deduplicateFields(fields: DetectedField[]): DetectedField[] {
    const deduplicated: DetectedField[] = []
    
    fields.forEach(field => {
      // Verificar se já existe um campo similar na mesma posição
      const existing = deduplicated.find(existing => {
        const xOverlap = Math.abs(existing.bbox.x - field.bbox.x) < 20
        const yOverlap = Math.abs(existing.bbox.y - field.bbox.y) < 20
        return xOverlap && yOverlap
      })
      
      if (!existing) {
        deduplicated.push(field)
      } else if (field.confidence > existing.confidence) {
        // Substituir por campo com maior confiança
        const index = deduplicated.indexOf(existing)
        deduplicated[index] = field
      }
    })

    return deduplicated
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  convertToFormFields(detectedFields: DetectedField[]): FormField[] {
    return detectedFields.map((field, index) => {
      const sanitizedName = sanitizeFieldName(field.label || `campo_${index}`)
      
      return {
        id: sanitizedName,
        name: sanitizedName,
        type: field.type,
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
        placeholder: this.generatePlaceholder(field.type, field.label)
      }
    })
  }

  private generateFieldName(label: string, index: number): string {
    // Converter label para nome de campo válido
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || `field_${index}`
  }

  private isLikelyRequired(label: string): boolean {
    const requiredPatterns = /\b(nome|name|data|date|assinatura|signature|obrigatório|required)\b/i
    return requiredPatterns.test(label)
  }

  private generateValidation(type: string) {
    switch (type) {
      case 'number':
        return { min: 0, max: 9999 }
      case 'text':
        return { maxLength: 100 }
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
      case 'text':
        return `Digite ${label.toLowerCase()}`
      default:
        return ''
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}