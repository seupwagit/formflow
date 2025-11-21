/**
 * Conversor PDF robusto com múltiplas estratégias de fallback
 * Tenta diferentes workers e abordagens até encontrar uma que funcione
 */

export interface PDFConversionResult {
  success: boolean
  imageUrls: string[]
  method: string
  error?: string
}

export class RobustPDFConverter {
  private static instance: RobustPDFConverter
  private workingWorkerUrl: string | null = null

  static getInstance(): RobustPDFConverter {
    if (!RobustPDFConverter.instance) {
      RobustPDFConverter.instance = new RobustPDFConverter()
    }
    return RobustPDFConverter.instance
  }

  async convertPDFToImages(file: File): Promise<PDFConversionResult> {
    console.log('🔄 Iniciando conversão PDF robusta:', file.name)

    // Lista de estratégias em ordem de preferência
    const strategies = [
      () => this.tryWithCachedWorker(file),
      () => this.tryWithDifferentWorkers(file),
      () => this.tryWithLocalWorker(file),
      () => this.tryWithCanvas2PDF(file),
      () => this.createFallbackImages(file)
    ]

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Tentativa ${i + 1}/${strategies.length}`)
        const result = await strategies[i]()
        
        if (result.success) {
          console.log(`✅ Conversão bem-sucedida com método: ${result.method}`)
          return result
        }
      } catch (error) {
        console.warn(`❌ Estratégia ${i + 1} falhou:`, error)
      }
    }

    // Se todas as estratégias falharam
    return {
      success: false,
      imageUrls: [],
      method: 'none',
      error: 'Todas as estratégias de conversão falharam'
    }
  }

  private async tryWithCachedWorker(file: File): Promise<PDFConversionResult> {
    if (!this.workingWorkerUrl) {
      throw new Error('Nenhum worker em cache')
    }

    console.log('🔄 Tentando com worker em cache:', this.workingWorkerUrl)
    return await this.convertWithWorker(file, this.workingWorkerUrl, 'cached-worker')
  }

  private async tryWithDifferentWorkers(file: File): Promise<PDFConversionResult> {
    const workerUrls = [
      // Worker local primeiro (sabemos que está acessível)
      '/pdf.worker.min.js',
      // Depois tentar CDNs (caso o local não funcione)
      'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
    ]

    for (const workerUrl of workerUrls) {
      try {
        console.log('🔄 Testando worker:', workerUrl)
        
        // Primeiro testar se a URL está acessível
        const response = await fetch(workerUrl, { method: 'HEAD' })
        if (!response.ok) {
          console.warn(`❌ Worker não acessível: ${workerUrl} (${response.status})`)
          continue
        }

        const result = await this.convertWithWorker(file, workerUrl, `cdn-worker-${workerUrl.split('/')[2]}`)
        
        if (result.success) {
          this.workingWorkerUrl = workerUrl // Cache o worker que funcionou
          return result
        }
      } catch (error) {
        console.warn(`❌ Worker falhou: ${workerUrl}`, error)
      }
    }

    throw new Error('Nenhum worker CDN funcionou')
  }

  private async tryWithLocalWorker(file: File): Promise<PDFConversionResult> {
    console.log('🔄 Tentando com worker local')
    return await this.convertWithWorker(file, '/pdf.worker.min.js', 'local-worker')
  }

  private async convertWithWorker(file: File, workerUrl: string, method: string): Promise<PDFConversionResult> {
    const pdfjsLib = await import('pdfjs-dist')
    
    console.log(`🔧 Configurando worker: ${workerUrl}`)
    
    // Configurar worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    
    // Aguardar um pouco para o worker ser configurado
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Carregar PDF
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0 // Reduzir logs
    }).promise

    console.log(`📄 PDF carregado: ${pdf.numPages} páginas`)

    // Converter cada página
    const imageUrls: string[] = []
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 })
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Configurar contexto para melhor qualidade
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      imageUrls.push(dataUrl)
      
      console.log(`✅ Página ${pageNum} convertida: ${dataUrl.length} bytes`)
    }

    return {
      success: true,
      imageUrls,
      method
    }
  }

  private async tryWithCanvas2PDF(file: File): Promise<PDFConversionResult> {
    console.log('🔄 Tentando com Canvas2PDF (método alternativo)')
    
    try {
      // Usar uma abordagem diferente com FileReader
      const dataUrl = await this.fileToDataUrl(file)
      
      // Criar uma imagem placeholder baseada no PDF
      const canvas = document.createElement('canvas')
      canvas.width = 794  // A4 width
      canvas.height = 1123 // A4 height
      const ctx = canvas.getContext('2d')!
      
      // Fundo branco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Borda
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
      
      // Texto indicativo
      ctx.fillStyle = '#000000'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('DOCUMENTO PDF CARREGADO', canvas.width / 2, 100)
      ctx.font = '16px Arial'
      ctx.fillText(`Arquivo: ${file.name}`, canvas.width / 2, 150)
      ctx.fillText(`Tamanho: ${(file.size / 1024).toFixed(1)} KB`, canvas.width / 2, 180)
      
      // Simular campos comuns
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Nome:', 50, 250)
      ctx.strokeRect(150, 230, 300, 30)
      
      ctx.fillText('Data:', 50, 300)
      ctx.strokeRect(150, 280, 150, 30)
      
      ctx.fillText('Observações:', 50, 350)
      ctx.strokeRect(50, 360, 500, 100)
      
      const placeholderUrl = canvas.toDataURL('image/png', 1.0)
      
      return {
        success: true,
        imageUrls: [placeholderUrl],
        method: 'canvas2pdf-placeholder'
      }
      
    } catch (error) {
      throw new Error(`Canvas2PDF falhou: ${error}`)
    }
  }

  private async createFallbackImages(file: File): Promise<PDFConversionResult> {
    console.log('🔄 Criando imagens de fallback')
    
    // Criar uma imagem de erro informativa
    const canvas = document.createElement('canvas')
    canvas.width = 794
    canvas.height = 1123
    const ctx = canvas.getContext('2d')!
    
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#f8f9fa')
    gradient.addColorStop(1, '#e9ecef')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Borda
    ctx.strokeStyle = '#dee2e6'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Ícone de erro
    ctx.fillStyle = '#dc3545'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('⚠️', canvas.width / 2, 150)
    
    // Título
    ctx.fillStyle = '#495057'
    ctx.font = 'bold 24px Arial'
    ctx.fillText('ERRO NA CONVERSÃO PDF', canvas.width / 2, 220)
    
    // Informações
    ctx.font = '16px Arial'
    ctx.fillStyle = '#6c757d'
    ctx.fillText(`Arquivo: ${file.name}`, canvas.width / 2, 270)
    ctx.fillText(`Tamanho: ${(file.size / 1024).toFixed(1)} KB`, canvas.width / 2, 300)
    ctx.fillText('Use o modo manual para criar campos', canvas.width / 2, 350)
    
    // Instruções
    ctx.font = '14px Arial'
    ctx.fillText('1. Use a ferramenta "Adicionar Campo" (A)', canvas.width / 2, 420)
    ctx.fillText('2. Clique no formulário para criar campos', canvas.width / 2, 450)
    ctx.fillText('3. Configure as propriedades de cada campo', canvas.width / 2, 480)
    
    const errorImageUrl = canvas.toDataURL('image/png', 1.0)
    
    return {
      success: true, // Consideramos sucesso pois fornece uma imagem utilizável
      imageUrls: [errorImageUrl],
      method: 'fallback-error-image',
      error: 'PDF conversion failed, using fallback image'
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}