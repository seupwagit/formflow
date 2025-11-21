import { HybridAIOCRProcessor, ExpectedFieldsConfig } from './hybrid-ai-ocr-processor'
import { SupabaseStorageManager } from './supabase-storage'
import { PDFConverterFailover, PDFConversionResult } from './pdf-converter-failover'
import { FormField } from './types'

export interface CompletePDFResult {
  pdfPath: string
  imagePaths: string[]
  imageUrls: string[]
  detectedFields: FormField[]
  pages: number
  ocrText: string[]
  processingId: string
  confidence: number
  expectedVsFound: { [page: number]: { expected: number, found: number } }
  method: string
}

export class CompletePDFProcessor {
  private pdfConverter: PDFConverterFailover
  private storageManager: SupabaseStorageManager
  private hybridProcessor: HybridAIOCRProcessor
  private processingId: string
  private expectedFieldsConfig: ExpectedFieldsConfig = {}

  constructor() {
    this.pdfConverter = new PDFConverterFailover()
    this.storageManager = new SupabaseStorageManager()
    this.hybridProcessor = new HybridAIOCRProcessor()
    this.processingId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Configurar campos esperados por página
   */
  setExpectedFields(config: ExpectedFieldsConfig): void {
    this.expectedFieldsConfig = config
    this.hybridProcessor.setExpectedFields(config)
    console.log('📋 Configuração de campos esperados aplicada:', config)
  }

  async processCompletePDF(
    file: File,
    onProgress?: (stage: string, progress: number, details?: any) => void
  ): Promise<CompletePDFResult> {
    
    console.log(`🚀 Iniciando processamento completo do PDF: ${file.name}`)
    console.log(`📋 ID do processamento: ${this.processingId}`)

    try {
      // Etapa 1: Upload do PDF original
      onProgress?.('Enviando PDF para Supabase...', 5)
      const pdfPath = await this.storageManager.uploadPDF(file)
      console.log(`✅ PDF enviado: ${pdfPath}`)

      // Etapa 2: Converter PDF em imagens (com failover)
      onProgress?.('Convertendo PDF em imagens...', 15)
      const conversionResult = await this.pdfConverter.convertPDFToImages(file, (method, progress) => {
        onProgress?.(`Convertendo PDF (${method})`, 15 + (progress * 0.3))
      })
      
      if (!conversionResult.success) {
        throw new Error(`Falha na conversão PDF: ${conversionResult.error}`)
      }
      
      console.log(`✅ PDF convertido com ${conversionResult.method}: ${conversionResult.pages} páginas`)

      // Etapa 3: Upload das imagens processadas
      onProgress?.('Enviando imagens para Supabase...', 50)
      const imagePaths = await this.storageManager.uploadProcessedImages(
        conversionResult.images, 
        pdfPath
      )
      console.log(`✅ ${imagePaths.length} imagens enviadas`)

      // Etapa 4: Obter URLs públicas
      onProgress?.('Gerando URLs públicas...', 65)
      const imageUrls = await this.storageManager.getProcessedImageUrls(imagePaths)
      console.log(`✅ URLs públicas geradas`)

      // Etapa 5: Processar com IA Híbrida + OCR
      onProgress?.('Executando IA Híbrida + OCR...', 75)
      const hybridResult = await this.hybridProcessor.processWithHybridAI(imageUrls, onProgress)
      console.log(`✅ IA Híbrida processou ${hybridResult.detectedFields.length} campos (${Math.round(hybridResult.confidence * 100)}% confiança)`)

      // Etapa 6: Converter campos detectados
      onProgress?.('Finalizando detecção de campos...', 95)
      const detectedFields = this.hybridProcessor.convertToFormFields(hybridResult.detectedFields)
      console.log(`✅ ${detectedFields.length} campos convertidos`)

      // Etapa 6: Salvar metadados no banco
      onProgress?.('Salvando metadados...', 98)
      await this.saveProcessingMetadata({
        processingId: this.processingId,
        fileName: file.name,
        pdfPath,
        imagePaths,
        fieldsCount: detectedFields.length,
        pages: conversionResult.pages
      })

      onProgress?.('Processamento concluído!', 100)

      const result: CompletePDFResult = {
        pdfPath,
        imagePaths,
        imageUrls,
        detectedFields,
        pages: conversionResult.pages,
        ocrText: hybridResult.ocrText,
        processingId: this.processingId,
        confidence: hybridResult.confidence,
        expectedVsFound: hybridResult.expectedVsFound,
        method: `${conversionResult.method} + ${hybridResult.method}`
      }

      console.log(`🎉 Processamento completo finalizado: ${this.processingId}`)
      return result

    } catch (error) {
      console.error(`❌ Erro no processamento completo:`, error)
      
      // Cleanup em caso de erro
      await this.cleanup()
      
      throw error
    }
  }



  /**
   * Salvar metadados do processamento no banco
   */
  private async saveProcessingMetadata(metadata: {
    processingId: string
    fileName: string
    pdfPath: string
    imagePaths: string[]
    fieldsCount: number
    pages: number
  }): Promise<void> {
    try {
      const { supabase } = require('./supabase')
      
      const { error } = await supabase
        .from('pdf_processing_log')
        .insert({
          processing_id: metadata.processingId,
          file_name: metadata.fileName,
          pdf_path: metadata.pdfPath,
          image_paths: metadata.imagePaths,
          fields_count: metadata.fieldsCount,
          pages_count: metadata.pages,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Erro ao salvar metadados:', error)
        // Não falhar o processamento por causa disso
      } else {
        console.log('✅ Metadados salvos no banco')
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar metadados:', error)
      // Não falhar o processamento por causa disso
    }
  }

  /**
   * Carregar processamento existente pelo ID
   */
  async loadExistingProcessing(processingId: string): Promise<CompletePDFResult | null> {
    try {
      const { supabase } = require('./supabase')
      
      const { data, error } = await supabase
        .from('pdf_processing_log')
        .select('*')
        .eq('processing_id', processingId)
        .eq('status', 'completed')
        .single()

      if (error || !data) {
        console.log('❌ Processamento não encontrado:', processingId)
        return null
      }

      // Obter URLs públicas atualizadas
      const imageUrls = await this.storageManager.getProcessedImageUrls(data.image_paths)

      // Reconstruir resultado
      const result: CompletePDFResult = {
        pdfPath: data.pdf_path,
        imagePaths: data.image_paths,
        imageUrls,
        detectedFields: [], // Seria necessário salvar os campos também
        pages: data.pages_count,
        ocrText: [], // Seria necessário salvar o texto OCR também
        processingId: data.processing_id,
        confidence: 0,
        expectedVsFound: {},
        method: 'loaded'
      }

      console.log('✅ Processamento carregado:', processingId)
      return result
      
    } catch (error) {
      console.error('❌ Erro ao carregar processamento:', error)
      return null
    }
  }

  /**
   * Listar processamentos recentes
   */
  async listRecentProcessings(limit: number = 10): Promise<any[]> {
    try {
      const { supabase } = require('./supabase')
      
      const { data, error } = await supabase
        .from('pdf_processing_log')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Erro ao listar processamentos:', error)
        return []
      }

      return data || []
      
    } catch (error) {
      console.error('❌ Erro ao listar processamentos:', error)
      return []
    }
  }

  /**
   * Cleanup de arquivos em caso de erro
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Executando cleanup...')
      
      // Aqui poderíamos deletar arquivos parcialmente enviados
      // Por enquanto, apenas log
      
      console.log('✅ Cleanup concluído')
      
    } catch (error) {
      console.error('❌ Erro no cleanup:', error)
    }
  }

  /**
   * Obter estatísticas de uso do storage
   */
  async getStorageStats(): Promise<{
    totalPDFs: number
    totalImages: number
    totalSize: number
  }> {
    try {
      const pdfFiles = await this.storageManager.listFiles('form-pdfs', 'pdfs')
      const imageFiles = await this.storageManager.listFiles('processed-images', 'processed')

      const totalSize = [...pdfFiles, ...imageFiles].reduce((sum, file) => {
        return sum + (file.metadata?.size || 0)
      }, 0)

      return {
        totalPDFs: pdfFiles.length,
        totalImages: imageFiles.length,
        totalSize
      }
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return { totalPDFs: 0, totalImages: 0, totalSize: 0 }
    }
  }
}