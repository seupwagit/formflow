import { DetectedField, FormField, PDFProcessingResult } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'

/**
 * Processador PDF simplificado para funcionar no navegador
 * Foca na funcionalidade essencial sem dependências complexas
 */
export class SimplePDFProcessor {
  private pdfBuffer: ArrayBuffer | null = null
  private pageImages: string[] = []

  /**
   * Carrega e processa PDF de forma simplificada
   */
  async loadPDF(file: File): Promise<PDFProcessingResult> {
    console.log('📄 Processando PDF (modo simplificado):', file.name)
    
    try {
      this.pdfBuffer = await file.arrayBuffer()
      
      // Validar PDF
      if (!this.isValidPDF(this.pdfBuffer)) {
        throw new Error('Arquivo não é um PDF válido')
      }

      // Contar páginas de forma básica
      const pageCount = this.countPages(this.pdfBuffer)
      console.log(`📊 PDF tem ${pageCount} página(s)`)

      // Gerar imagens placeholder para cada página
      this.pageImages = []
      for (let i = 0; i < pageCount; i++) {
        const imageUrl = this.generatePagePlaceholder(i, file.name)
        this.pageImages.push(imageUrl)
      }

      // Gerar campos detectados simulados
      const detectedFields = this.generateMockFields(pageCount)
      
      // Simular texto OCR
      const ocrText = this.generateMockOCRText(pageCount, file.name)

      return {
        pages: pageCount,
        detectedFields,
        ocrText,
        imageUrls: this.pageImages
      }

    } catch (error) {
      console.error('❌ Erro no processamento simplificado:', error)
      throw error
    }
  }

  /**
   * Valida se o arquivo é um PDF
   */
  private isValidPDF(buffer: ArrayBuffer): boolean {
    const uint8Array = new Uint8Array(buffer)
    const header = new TextDecoder().decode(uint8Array.slice(0, 8))
    return header.startsWith('%PDF-')
  }

  /**
   * Conta páginas de forma rudimentar
   */
  private countPages(buffer: ArrayBuffer): number {
    try {
      const uint8Array = new Uint8Array(buffer)
      const pdfText = new TextDecoder().decode(uint8Array)
      
      // Procurar por indicadores de página
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g)
      const countMatches = pdfText.match(/\/Count\s+(\d+)/g)
      
      if (countMatches && countMatches.length > 0) {
        const count = parseInt(countMatches[0].match(/\d+/)?.[0] || '1')
        return Math.max(1, count)
      }
      
      if (pageMatches) {
        return Math.max(1, pageMatches.length)
      }
      
      // Fallback: assumir 1 página
      return 1
      
    } catch (error) {
      console.warn('Erro ao contar páginas, assumindo 1:', error)
      return 1
    }
  }

  /**
   * Gera imagem placeholder para uma página
   */
  private generatePagePlaceholder(pageIndex: number, fileName: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    // Dimensões padrão A4
    canvas.width = 800
    canvas.height = 1000
    
    // Fundo branco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Borda
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Cabeçalho
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('DOCUMENTO PDF', canvas.width / 2, 80)
    
    // Nome do arquivo
    ctx.font = '16px Arial'
    ctx.fillStyle = '#6b7280'
    const shortName = fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName
    ctx.fillText(shortName, canvas.width / 2, 110)
    
    // Número da página
    ctx.font = '14px Arial'
    ctx.fillText(`Página ${pageIndex + 1}`, canvas.width / 2, 140)
    
    // Simular conteúdo baseado no tipo de documento
    this.drawMockContent(ctx, canvas, pageIndex, fileName)
    
    return canvas.toDataURL('image/png', 0.9)
  }

  /**
   * Desenha conteúdo simulado baseado no tipo de documento
   */
  private drawMockContent(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pageIndex: number, fileName: string) {
    ctx.textAlign = 'left'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#374151'
    
    const startY = 200
    const lineHeight = 30
    let currentY = startY
    
    // Detectar tipo de documento pelo nome
    const isInspection = /inspe[cç]|relat[oó]rio|check|audit/i.test(fileName)
    const isForm = /form|formul[aá]rio|cadastro/i.test(fileName)
    
    if (isInspection) {
      // Formulário de inspeção
      const fields = [
        'Nome do Inspetor: ________________________',
        'Data da Inspeção: ________________________',
        'Local: ________________________',
        'Temperatura (°C): ________________________',
        'Pressão (bar): ________________________',
        'Status: ________________________',
        'Observações: ________________________'
      ]
      
      fields.forEach(field => {
        ctx.fillText(field, 60, currentY)
        currentY += lineHeight + 10
      })
      
    } else if (isForm) {
      // Formulário genérico
      const fields = [
        'Nome Completo: ________________________',
        'CPF: ________________________',
        'Data de Nascimento: ________________________',
        'Endereço: ________________________',
        'Telefone: ________________________',
        'Email: ________________________'
      ]
      
      fields.forEach(field => {
        ctx.fillText(field, 60, currentY)
        currentY += lineHeight + 10
      })
      
    } else {
      // Documento genérico
      ctx.fillText('Este é um documento PDF que será processado', 60, currentY)
      currentY += lineHeight
      ctx.fillText('automaticamente pelo sistema de mapeamento.', 60, currentY)
      currentY += lineHeight * 2
      
      ctx.fillText('Campos detectados aparecerão como áreas', 60, currentY)
      currentY += lineHeight
      ctx.fillText('interativas sobre este documento.', 60, currentY)
    }
    
    // Rodapé
    ctx.font = '12px Arial'
    ctx.fillStyle = '#9ca3af'
    ctx.textAlign = 'center'
    ctx.fillText('Processado pelo Sistema de Mapeamento de Formulários', canvas.width / 2, canvas.height - 40)
  }

  /**
   * Gera campos detectados simulados baseados no conteúdo
   */
  private generateMockFields(pageCount: number): DetectedField[] {
    const fields: DetectedField[] = []
    
    for (let page = 0; page < pageCount; page++) {
      // Campos básicos para cada página
      const pageFields: DetectedField[] = [
        {
          text: 'Nome do Inspetor:',
          confidence: 0.95,
          bbox: { x0: 60, y0: 200, x1: 250, y1: 220 },
          page,
          suggestedType: 'text',
          suggestedName: `inspector_name_p${page + 1}`
        },
        {
          text: 'Data da Inspeção:',
          confidence: 0.92,
          bbox: { x0: 60, y0: 240, x1: 250, y1: 260 },
          page,
          suggestedType: 'date',
          suggestedName: `inspection_date_p${page + 1}`
        },
        {
          text: 'Temperatura (°C):',
          confidence: 0.88,
          bbox: { x0: 60, y0: 320, x1: 250, y1: 340 },
          page,
          suggestedType: 'number',
          suggestedName: `temperature_p${page + 1}`
        }
      ]
      
      // Adicionar campo específico da página
      if (page === 0) {
        pageFields.push({
          text: 'Observações:',
          confidence: 0.85,
          bbox: { x0: 60, y0: 420, x1: 200, y1: 440 },
          page,
          suggestedType: 'textarea',
          suggestedName: 'observations'
        })
      }
      
      fields.push(...pageFields)
    }
    
    return fields
  }

  /**
   * Gera texto OCR simulado
   */
  private generateMockOCRText(pageCount: number, fileName: string): string {
    let text = `DOCUMENTO: ${fileName}\n\n`
    
    for (let i = 0; i < pageCount; i++) {
      text += `--- PÁGINA ${i + 1} ---\n`
      text += 'RELATÓRIO DE INSPEÇÃO\n'
      text += 'Nome do Inspetor: ________________\n'
      text += 'Data da Inspeção: ________________\n'
      text += 'Local: ________________\n'
      text += 'Temperatura (°C): ________________\n'
      text += 'Pressão (bar): ________________\n'
      text += 'Status: ________________\n'
      text += 'Observações: ________________\n\n'
    }
    
    return text
  }

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
        required: field.suggestedType === 'text' || field.suggestedType === 'date',
        position: {
          x: field.bbox.x0 + 260, // Posição após o label
          y: field.bbox.y0,
          width: 200,
          height: field.suggestedType === 'textarea' ? 60 : 25,
          page: field.page
        },
        options: field.suggestedType === 'select' ? ['Aprovado', 'Reprovado', 'Pendente'] : undefined
      }
    })
  }

  /**
   * Obtém imagem de uma página
   */
  getPageImage(pageIndex: number): string | null {
    return this.pageImages[pageIndex] || null
  }

  /**
   * Obtém todas as imagens
   */
  getAllPageImages(): string[] {
    return [...this.pageImages]
  }

  /**
   * Obtém número de páginas
   */
  getPageCount(): number {
    return this.pageImages.length
  }
}