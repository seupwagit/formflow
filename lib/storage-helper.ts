import { supabase } from './supabase'

export class StorageHelper {
  
  /**
   * Obter URL pública de uma imagem com verificação
   */
  static async getVerifiedImageUrl(bucket: string, path: string): Promise<string | null> {
    try {
      // Obter URL pública
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      const publicUrl = data.publicUrl
      console.log('🔗 URL pública gerada:', publicUrl)

      // Verificar se a URL é acessível
      const response = await fetch(publicUrl, { method: 'HEAD' })
      
      if (response.ok) {
        console.log('✅ URL acessível:', publicUrl)
        return publicUrl
      } else {
        console.error('❌ URL não acessível:', response.status, publicUrl)
        return null
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar URL:', error)
      return null
    }
  }

  /**
   * Listar arquivos no storage para debug
   */
  static async listStorageFiles(bucket: string, folder?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('❌ Erro ao listar arquivos:', error)
        return []
      }

      console.log(`📁 Arquivos no bucket ${bucket}/${folder}:`, data)
      return data || []
      
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error)
      return []
    }
  }

  /**
   * Verificar se um arquivo existe no storage
   */
  static async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path)

      return !error && !!data
      
    } catch (error) {
      return false
    }
  }

  /**
   * Debug completo do storage
   */
  static async debugStorage(processingId: string): Promise<void> {
    console.log('🔍 Debug do storage para:', processingId)
    
    // Listar arquivos PDF
    const pdfFiles = await this.listStorageFiles('form-pdfs', 'pdfs')
    console.log('📄 PDFs encontrados:', pdfFiles.filter(f => f.name.includes(processingId)))
    
    // Listar imagens processadas
    const imageFiles = await this.listStorageFiles('processed-images', 'processed')
    console.log('🖼️ Imagens encontradas:', imageFiles.filter(f => f.name.includes(processingId)))
    
    // Verificar URLs específicas
    const expectedImagePath = `processed/${processingId}_page_1.png`
    const imageExists = await this.fileExists('processed-images', expectedImagePath)
    console.log('🔍 Imagem existe?', expectedImagePath, imageExists)
    
    if (imageExists) {
      const verifiedUrl = await this.getVerifiedImageUrl('processed-images', expectedImagePath)
      console.log('🔗 URL verificada:', verifiedUrl)
    }
  }
}