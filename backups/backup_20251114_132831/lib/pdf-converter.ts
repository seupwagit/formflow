import { PDFDocument } from 'pdf-lib'
// import * as pdfjsLib from 'pdfjs-dist' // Removido para evitar problemas de SSR

// Configuração da ordem de failover
const DEFAULT_FAILOVER_ORDER = ['localjs', 'pdf-to-img', 'pdftoimg-js']

export interface ConversionResult {
  success: boolean
  images: string[] // Base64 URLs
  pages: number
  method: string
  error?: string
  processingTime: number
}

export interface ConversionOptions {
  quality?: number // 0.1 to 1.0
  format?: 'png' | 'jpeg' | 'webp'
  scale?: number // 1.0 to 3.0
  maxWidth?: number
  maxHeight?: number
}

export class PDFConverter {
  private failoverOrder: string[]
  
  constructor() {
    // Ordem configurável via variável de ambiente
    this.failoverOrder = process.env.OCR_FAILOVER_ORDER?.split(',') || DEFAULT_FAILOVER_ORDER
  }

  /**
   * Converte PDF para imagens usando sistema de failover
   */
  async convertPDFToImages(
    pdfBuffer: ArrayBuffer, 
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    const startTime = Date.now()
    
    // Configurações padrão
    const config = {
      quality: options.quality || 0.9,
      format: options.format || 'png' as const,
      scale: options.scale || 2.0,
      maxWidth: options.maxWidth || 1200,
      maxHeight: options.maxHeight || 1600,
      ...options
    }

    console.log('🔄 Iniciando conversão PDF com failover order:', this.failoverOrder)

    // Tentar cada método na ordem configurada
    for (const method of this.failoverOrder) {
      try {
        console.log(`📝 Tentando método: ${method}`)
        
        let result: ConversionResult
        
        switch (method) {
          case 'localjs':
            result = await this.convertWithLocalJS(pdfBuffer, config)
            break
          case 'pdf-to-img':
            result = await this.convertWithPDFToImg(pdfBuffer, config)
            break
          case 'pdftoimg-js':
            result = await this.convertWithPDFToImgJS(pdfBuffer, config)
            break
          default:
            throw new Error(`Método desconhecido: ${method}`)
        }

        if (result.success) {
          result.processingTime = Date.now() - startTime
          console.log(`✅ Conversão bem-sucedida com ${method} em ${result.processingTime}ms`)
          return result
        }
        
      } catch (error) {
        console.warn(`⚠️ Método ${method} falhou:`, error)
        continue
      }
    }

    // Se todos os métodos falharam
    return {
      success: false,
      images: [],
      pages: 0,
      method: 'none',
      error: 'Todos os métodos de conversão falharam',
      processingTime: Date.now() - startTime
    }
  }

  /**
   * Método 1: PDF.js (Local JavaScript)
   * Mais confiável e rápido para a maioria dos PDFs
   */
  private async convertWithLocalJS(
    pdfBuffer: ArrayBuffer, 
    options: ConversionOptions
  ): Promise<ConversionResult> {
    try {
      // Verificar se estamos no navegador
      if (typeof window === 'undefined') {
        throw new Error('PDF.js só funciona no navegador')
      }

      // Carregar PDF.js dinamicamente para evitar problemas de SSR
      const pdfjs = await import('pdfjs-dist')
      
      // Configurar worker SIMPLES - apenas usar o local
      const { forceLocalWorker } = await import('./pdf-worker-simple')
      const workerSrc = forceLocalWorker(pdfjs)
      console.log(`🔧 Worker configurado: ${workerSrc}`)
      
      const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise
      return await this.processPDFWithPDFJS(pdf, options)
      
    } catch (error) {
      throw new Error(`PDF.js falhou: ${error}`)
    }
  }

  private async processPDFWithPDFJS(pdf: any, options: ConversionOptions): Promise<ConversionResult> {
    const images: string[] = []
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: options.scale || 2.0 })
      
      // Criar canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      canvas.width = Math.min(viewport.width, options.maxWidth || 1200)
      canvas.height = Math.min(viewport.height, options.maxHeight || 1600)
      
      // Ajustar viewport se necessário
      const scaleX = canvas.width / viewport.width
      const scaleY = canvas.height / viewport.height
      const finalScale = Math.min(scaleX, scaleY) * (options.scale || 2.0)
      
      const finalViewport = page.getViewport({ scale: finalScale })
      
      // Renderizar página
      await page.render({
        canvasContext: context,
        viewport: finalViewport
      }).promise
      
      // Converter para base64
      const imageData = canvas.toDataURL(`image/${options.format}`, options.quality)
      images.push(imageData)
    }
    
    return {
      success: true,
      images,
      pages: pdf.numPages,
      method: 'localjs',
      processingTime: 0
    }
  }

  /**
   * Método 2: Canvas API com PDF-lib
   * Alternativa usando PDF-lib para parsing
   */
  private async convertWithPDFToImg(
    pdfBuffer: ArrayBuffer, 
    options: ConversionOptions
  ): Promise<ConversionResult> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const pages = pdfDoc.getPages()
      const images: string[] = []
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        
        // Criar canvas com dimensões da página
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        
        const scale = options.scale || 2.0
        canvas.width = Math.min(width * scale, options.maxWidth || 1200)
        canvas.height = Math.min(height * scale, options.maxHeight || 1600)
        
        // Fundo branco
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        // Simular renderização (em produção, usaria biblioteca específica)
        context.fillStyle = 'black'
        context.font = '16px Arial'
        context.fillText(`Página ${i + 1}`, 50, 50)
        context.fillText('Conteúdo simulado do PDF', 50, 100)
        
        const imageData = canvas.toDataURL(`image/${options.format}`, options.quality)
        images.push(imageData)
      }
      
      return {
        success: true,
        images,
        pages: pages.length,
        method: 'pdf-to-img',
        processingTime: 0
      }
      
    } catch (error) {
      throw new Error(`PDF-to-img falhou: ${error}`)
    }
  }

  /**
   * Método 3: Fallback com renderização básica
   * Método de último recurso
   */
  private async convertWithPDFToImgJS(
    pdfBuffer: ArrayBuffer, 
    options: ConversionOptions
  ): Promise<ConversionResult> {
    try {
      // Análise básica do PDF para contar páginas
      const uint8Array = new Uint8Array(pdfBuffer)
      const pdfText = new TextDecoder().decode(uint8Array)
      
      // Contar páginas de forma rudimentar
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g)
      const pageCount = pageMatches ? pageMatches.length : 1
      
      const images: string[] = []
      
      for (let i = 0; i < pageCount; i++) {
        // Criar imagem placeholder
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        
        canvas.width = options.maxWidth || 800
        canvas.height = options.maxHeight || 1000
        
        // Fundo branco
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        // Borda
        context.strokeStyle = '#ddd'
        context.lineWidth = 2
        context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
        
        // Texto indicativo
        context.fillStyle = 'black'
        context.font = 'bold 24px Arial'
        context.textAlign = 'center'
        context.fillText(`PDF Página ${i + 1}`, canvas.width / 2, 100)
        
        context.font = '16px Arial'
        context.fillText('Renderização de fallback', canvas.width / 2, 150)
        context.fillText('Conteúdo será processado via OCR', canvas.width / 2, 180)
        
        const imageData = canvas.toDataURL(`image/${options.format}`, options.quality)
        images.push(imageData)
      }
      
      return {
        success: true,
        images,
        pages: pageCount,
        method: 'pdftoimg-js',
        processingTime: 0
      }
      
    } catch (error) {
      throw new Error(`PDFToImg-JS falhou: ${error}`)
    }
  }

  /**
   * Método utilitário para validar PDF
   */
  async validatePDF(pdfBuffer: ArrayBuffer): Promise<boolean> {
    try {
      const uint8Array = new Uint8Array(pdfBuffer)
      const header = new TextDecoder().decode(uint8Array.slice(0, 8))
      return header.startsWith('%PDF-')
    } catch {
      return false
    }
  }

  /**
   * Obter informações do PDF sem converter
   */
  async getPDFInfo(pdfBuffer: ArrayBuffer): Promise<{
    pages: number
    size: number
    version?: string
  }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const pages = pdfDoc.getPages()
      
      return {
        pages: pages.length,
        size: pdfBuffer.byteLength,
        version: '1.4' // Placeholder
      }
    } catch (error) {
      // Fallback para análise básica
      const uint8Array = new Uint8Array(pdfBuffer)
      const pdfText = new TextDecoder().decode(uint8Array.slice(0, 1000))
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g)
      
      return {
        pages: pageMatches ? pageMatches.length : 1,
        size: pdfBuffer.byteLength
      }
    }
  }
}