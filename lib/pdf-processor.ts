import Tesseract from 'tesseract.js'
import { DetectedField, FormField, PDFProcessingResult } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'
// import { PDFConverter, ConversionResult, ConversionOptions } from './pdf-converter' // Removido para evitar problemas

export class PDFProcessor {
  private pdfBuffer: ArrayBuffer | null = null
  private pageImages: string[] = []

  constructor() {
    // Construtor simplificado
  }

  /**
   * Carrega e processa PDF usando processador simplificado
   */
  async loadPDF(file: File): Promise<PDFProcessingResult> {
    console.log('📄 Redirecionando para processador simplificado:', file.name)
    
    try {
      // Usar SimplePDFProcessor diretamente
      const { SimplePDFProcessor } = await import('./pdf-simple-processor')
      const simpleProcessor = new SimplePDFProcessor()
      
      return await simpleProcessor.loadPDF(file)
      
    } catch (error) {
      console.error('❌ Erro no processamento do PDF:', error)
      throw error
    }
  }

  // Métodos simplificados - delegam para SimplePDFProcessor

  /**
   * Converte campos detectados para FormFields
   */
  convertToFormFields(detectedFields: DetectedField[]): FormField[] {
    return detectedFields.map((field, index) => {
      const label = field.text.replace(/[:_\-\s]+$/, '').trim()
      const sanitizedName = sanitizeFieldName(label || `campo_${index}`)
      
      return {
        id: sanitizedName, // Nome PostgreSQL correto
        name: sanitizedName, // Nome também sanitizado
        type: field.suggestedType,
        label: label,
        required: false,
        position: {
          x: field.bbox.x0,
          y: field.bbox.y0,
          width: field.bbox.x1 - field.bbox.x0,
          height: field.bbox.y1 - field.bbox.y0,
          page: field.page
        },
        options: field.suggestedType === 'select' ? ['Aprovado', 'Reprovado', 'Pendente'] : undefined
      }
    })
  }
}