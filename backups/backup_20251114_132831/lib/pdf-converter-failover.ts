export interface PDFConversionResult {
  success: boolean
  images: string[]
  pages: number
  method: string
  error?: string
}

export class PDFConverterFailover {
  private failoverOrder: string[]

  constructor() {
    // Ordem de failover do .env.local
    this.failoverOrder = (process.env.OCR_FAILOVER_ORDER || 'localjs,pdf-to-img,pdftoimg-js').split(',')
    console.log('📋 Ordem de failover PDF:', this.failoverOrder)
  }

  async convertPDFToImages(file: File, onProgress?: (method: string, progress: number) => void): Promise<PDFConversionResult> {
    console.log('🔄 Iniciando conversão PDF com sistema de failover...')
    
    for (const method of this.failoverOrder) {
      try {
        console.log(`🔧 Tentando método: ${method}`)
        onProgress?.(method, 0)
        
        const result = await this.tryConversionMethod(method, file, onProgress)
        
        if (result.success && result.images.length > 0) {
          console.log(`✅ Sucesso com método: ${method} (${result.pages} páginas)`)
          return result
        } else {
          console.log(`❌ Método ${method} falhou ou não retornou imagens`)
        }
        
      } catch (error) {
        console.error(`❌ Erro no método ${method}:`, error)
        continue
      }
    }

    // Se todos os métodos falharam
    console.error('❌ Todos os métodos de conversão falharam')
    return {
      success: false,
      images: [],
      pages: 0,
      method: 'none',
      error: 'Todos os métodos de conversão falharam'
    }
  }

  private async tryConversionMethod(
    method: string, 
    file: File, 
    onProgress?: (method: string, progress: number) => void
  ): Promise<PDFConversionResult> {
    
    switch (method) {
      case 'localjs':
        return await this.convertWithLocalJS(file, onProgress)
      
      case 'pdf-to-img':
        return await this.convertWithPdfToImg(file, onProgress)
      
      case 'pdftoimg-js':
        return await this.convertWithPdfToImgJS(file, onProgress)
      
      default:
        throw new Error(`Método desconhecido: ${method}`)
    }
  }

  /**
   * Método 1: PDF.js local (mais confiável)
   */
  private async convertWithLocalJS(file: File, onProgress?: (method: string, progress: number) => void): Promise<PDFConversionResult> {
    try {
      console.log('📚 Usando PDF.js local...')
      onProgress?.('PDF.js Local', 10)

      // Importar PDF.js dinamicamente
      const pdfjsLib = await import('pdfjs-dist')
      
      // Configurar worker SIMPLES - apenas usar o local
      const { forceLocalWorker } = await import('./pdf-worker-simple')
      const workerSrc = forceLocalWorker(pdfjsLib)
      console.log(`🔧 Worker configurado: ${workerSrc}`)

      const arrayBuffer = await file.arrayBuffer()
      onProgress?.('PDF.js Local', 30)

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const images: string[] = []

      console.log(`📄 PDF tem ${numPages} páginas`)

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const progress = 30 + (pageNum / numPages) * 60
        onProgress?.('PDF.js Local', progress)

        const page = await pdf.getPage(pageNum)
        
        // Alta resolução para melhor OCR
        const scale = Number(process.env.PDF_SCALE) || 3.0
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Converter para PNG com qualidade alta
        const quality = Number(process.env.PDF_QUALITY) || 0.95
        const imageDataUrl = canvas.toDataURL('image/png', quality)
        images.push(imageDataUrl)

        console.log(`✅ Página ${pageNum}/${numPages} convertida (${Math.round(imageDataUrl.length / 1024)}KB)`)
      }

      onProgress?.('PDF.js Local', 100)

      return {
        success: true,
        images,
        pages: numPages,
        method: 'PDF.js Local'
      }

    } catch (error) {
      console.error('❌ Erro no PDF.js local:', error)
      throw error
    }
  }

  /**
   * Método 2: pdf-to-img (fallback)
   */
  private async convertWithPdfToImg(file: File, onProgress?: (method: string, progress: number) => void): Promise<PDFConversionResult> {
    try {
      console.log('🔄 Tentando pdf-to-img...')
      onProgress?.('pdf-to-img', 20)

      // Simular conversão (implementar se necessário)
      // Por enquanto, usar PDF.js como fallback
      return await this.convertWithLocalJS(file, (method, progress) => {
        onProgress?.('pdf-to-img (PDF.js)', progress)
      })

    } catch (error) {
      console.error('❌ Erro no pdf-to-img:', error)
      throw error
    }
  }

  /**
   * Método 3: pdftoimg-js (último recurso)
   */
  private async convertWithPdfToImgJS(file: File, onProgress?: (method: string, progress: number) => void): Promise<PDFConversionResult> {
    try {
      console.log('🔄 Tentando pdftoimg-js...')
      onProgress?.('pdftoimg-js', 20)

      // Simular conversão (implementar se necessário)
      // Por enquanto, usar PDF.js como fallback
      return await this.convertWithLocalJS(file, (method, progress) => {
        onProgress?.('pdftoimg-js (PDF.js)', progress)
      })

    } catch (error) {
      console.error('❌ Erro no pdftoimg-js:', error)
      throw error
    }
  }

  /**
   * Otimizar imagens para OCR
   */
  private async optimizeImageForOCR(imageDataUrl: string): Promise<string> {
    try {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageDataUrl
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      // Limitar tamanho máximo para OCR
      const maxWidth = Number(process.env.PDF_MAX_WIDTH) || 1200
      const maxHeight = Number(process.env.PDF_MAX_HEIGHT) || 1600

      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height)
        width *= scale
        height *= scale
      }

      canvas.width = width
      canvas.height = height

      // Aplicar filtros para melhor OCR
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Aumentar contraste se configurado
      if (process.env.PDF_ENHANCE_CONTRAST === 'true') {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          // Aumentar contraste
          data[i] = Math.min(255, data[i] * 1.2)     // R
          data[i + 1] = Math.min(255, data[i + 1] * 1.2) // G
          data[i + 2] = Math.min(255, data[i + 2] * 1.2) // B
        }

        ctx.putImageData(imageData, 0, 0)
      }

      return canvas.toDataURL('image/png', 0.95)

    } catch (error) {
      console.error('❌ Erro ao otimizar imagem:', error)
      return imageDataUrl // Retornar original se falhar
    }
  }

  /**
   * Validar se a imagem foi convertida corretamente
   */
  private validateImage(imageDataUrl: string): boolean {
    try {
      // Verificar se é um data URL válido
      if (!imageDataUrl.startsWith('data:image/')) {
        return false
      }

      // Verificar tamanho mínimo
      if (imageDataUrl.length < 1000) {
        return false
      }

      return true

    } catch (error) {
      return false
    }
  }

  /**
   * Obter estatísticas da conversão
   */
  getConversionStats(result: PDFConversionResult): {
    totalSize: number
    averageSize: number
    method: string
    pages: number
  } {
    const totalSize = result.images.reduce((sum, img) => sum + img.length, 0)
    const averageSize = result.images.length > 0 ? totalSize / result.images.length : 0

    return {
      totalSize,
      averageSize,
      method: result.method,
      pages: result.pages
    }
  }
}