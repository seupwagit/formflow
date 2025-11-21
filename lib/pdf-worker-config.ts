/**
 * Configuração robusta do worker PDF.js com sistema de failover
 */

export interface WorkerConfig {
  workerSrc: string
  isLocal: boolean
  tested: boolean
}

export class PDFWorkerManager {
  private static instance: PDFWorkerManager
  private workerConfigs: WorkerConfig[] = [
    { 
      workerSrc: process.env.NEXT_PUBLIC_PDF_WORKER_LOCAL || '/pdf.worker.min.js', 
      isLocal: true, 
      tested: false 
    },
    { 
      workerSrc: 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js', 
      isLocal: false, 
      tested: false 
    },
    { 
      workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js', 
      isLocal: false, 
      tested: false 
    },
    { 
      workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js', 
      isLocal: false, 
      tested: false 
    }
  ]
  private currentWorker: WorkerConfig | null = null

  static getInstance(): PDFWorkerManager {
    if (!PDFWorkerManager.instance) {
      PDFWorkerManager.instance = new PDFWorkerManager()
    }
    return PDFWorkerManager.instance
  }

  /**
   * Configura o worker PDF.js com failover automático
   */
  async setupWorker(pdfjsLib: any): Promise<string> {
    console.log('🔧 Configurando worker PDF.js com failover...')

    // Se já temos um worker funcionando, usar ele
    if (this.currentWorker && this.currentWorker.tested) {
      console.log(`✅ Usando worker já testado: ${this.currentWorker.workerSrc}`)
      pdfjsLib.GlobalWorkerOptions.workerSrc = this.currentWorker.workerSrc
      return this.currentWorker.workerSrc
    }

    // FORÇAR uso do worker local primeiro
    const localWorker = this.workerConfigs[0] // Sempre o primeiro é o local
    console.log(`🎯 FORÇANDO uso do worker local: ${localWorker.workerSrc}`)
    
    try {
      // Configurar PDF.js diretamente com o worker local
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorker.workerSrc
      
      // Testar se funciona na prática
      console.log('🧪 Testando funcionalidade do worker local...')
      const worksInPractice = await this.testWorkerFunctionality(pdfjsLib)
      
      if (worksInPractice) {
        console.log(`🎉 Worker local funcionando: ${localWorker.workerSrc}`)
        localWorker.tested = true
        this.currentWorker = localWorker
        return localWorker.workerSrc
      } else {
        console.log(`❌ Worker local não funciona na prática, tentando fallback...`)
      }
    } catch (error) {
      console.log(`❌ Erro no worker local, tentando fallback:`, error)
    }

    // Se o worker local falhou, tentar os externos
    for (let i = 1; i < this.workerConfigs.length; i++) {
      const config = this.workerConfigs[i]
      try {
        console.log(`🔍 Testando worker externo: ${config.workerSrc}`)
        
        const isAccessible = await this.testWorkerAccess(config.workerSrc)
        
        if (isAccessible) {
          console.log(`✅ Worker externo acessível: ${config.workerSrc}`)
          
          // Configurar PDF.js
          pdfjsLib.GlobalWorkerOptions.workerSrc = config.workerSrc
          
          // Testar se funciona na prática
          const worksInPractice = await this.testWorkerFunctionality(pdfjsLib)
          
          if (worksInPractice) {
            console.log(`🎉 Worker externo funcionando: ${config.workerSrc}`)
            config.tested = true
            this.currentWorker = config
            return config.workerSrc
          } else {
            console.log(`❌ Worker externo não funciona na prática: ${config.workerSrc}`)
          }
        } else {
          console.log(`❌ Worker externo não acessível: ${config.workerSrc}`)
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar worker externo ${config.workerSrc}:`, error)
        continue
      }
    }

    // Se chegou aqui, nenhum worker funcionou
    throw new Error('Nenhum worker PDF.js está funcionando')
  }

  /**
   * Testa se o worker está acessível via HTTP
   */
  private async testWorkerAccess(workerUrl: string): Promise<boolean> {
    try {
      const response = await fetch(workerUrl, { 
        method: 'HEAD',
        mode: 'no-cors' // Para evitar problemas de CORS
      })
      return response.ok || response.type === 'opaque'
    } catch (error) {
      // Para arquivos locais, tentar GET
      if (workerUrl.startsWith('/')) {
        try {
          const response = await fetch(workerUrl, { method: 'HEAD' })
          return response.ok
        } catch {
          return false
        }
      }
      return false
    }
  }

  /**
   * Testa se o worker funciona na prática criando um documento simples
   */
  private async testWorkerFunctionality(pdfjsLib: any): Promise<boolean> {
    try {
      // Criar um PDF mínimo para testar
      const testPDF = this.createMinimalPDF()
      
      // Tentar carregar com PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: testPDF })
      const timeout = parseInt(process.env.NEXT_PUBLIC_PDF_WORKER_TIMEOUT || '5000')
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ])
      
      // Se chegou aqui, funcionou
      return pdf && pdf.numPages > 0
      
    } catch (error) {
      console.log('❌ Teste de funcionalidade falhou:', error)
      return false
    }
  }

  /**
   * Cria um PDF mínimo para teste
   */
  private createMinimalPDF(): Uint8Array {
    // PDF mínimo válido em bytes
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
203
%%EOF`

    return new TextEncoder().encode(pdfContent)
  }

  /**
   * Força reset do worker (útil para debug)
   */
  resetWorker(): void {
    console.log('🔄 Resetando configuração do worker...')
    this.currentWorker = null
    this.workerConfigs.forEach(config => config.tested = false)
  }

  /**
   * Obtém status atual do worker
   */
  getWorkerStatus(): {
    current: string | null
    tested: WorkerConfig[]
    available: WorkerConfig[]
  } {
    return {
      current: this.currentWorker?.workerSrc || null,
      tested: this.workerConfigs.filter(c => c.tested),
      available: this.workerConfigs
    }
  }
}

/**
 * Função utilitária para configurar PDF.js rapidamente
 */
export async function setupPDFWorker(pdfjsLib: any): Promise<string> {
  const manager = PDFWorkerManager.getInstance()
  return await manager.setupWorker(pdfjsLib)
}