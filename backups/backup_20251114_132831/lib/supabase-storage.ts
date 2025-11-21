import { supabase } from './supabase'

export class SupabaseStorageManager {
  
  /**
   * Upload do PDF original para o bucket
   */
  async uploadPDF(file: File, fileName?: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const sanitizedName = (fileName || file.name)
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase()
      
      const filePath = `pdfs/${timestamp}_${sanitizedName}`
      
      console.log('📤 Fazendo upload do PDF para Supabase Storage...')
      
      const { data, error } = await supabase.storage
        .from('form-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Erro no upload do PDF:', error)
        throw error
      }

      console.log('✅ PDF enviado com sucesso:', data.path)
      return data.path
      
    } catch (error) {
      console.error('❌ Erro no upload do PDF:', error)
      throw error
    }
  }

  /**
   * Upload das imagens PNG processadas
   */
  async uploadProcessedImages(images: string[], pdfPath: string): Promise<string[]> {
    try {
      const uploadPromises = images.map(async (imageDataUrl, index) => {
        // Converter data URL para blob
        const response = await fetch(imageDataUrl)
        const blob = await response.blob()
        
        // Gerar nome do arquivo baseado no PDF
        const baseName = pdfPath.replace('pdfs/', '').replace('.pdf', '')
        const imagePath = `processed/${baseName}_page_${index + 1}.png`
        
        console.log(`📤 Enviando imagem da página ${index + 1}...`)
        
        const { data, error } = await supabase.storage
          .from('processed-images')
          .upload(imagePath, blob, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          })

        if (error) {
          console.error(`❌ Erro no upload da página ${index + 1}:`, error)
          throw error
        }

        return data.path
      })

      const uploadedPaths = await Promise.all(uploadPromises)
      console.log('✅ Todas as imagens enviadas com sucesso')
      
      return uploadedPaths
      
    } catch (error) {
      console.error('❌ Erro no upload das imagens:', error)
      throw error
    }
  }

  /**
   * Obter URL pública de um arquivo
   */
  async getPublicUrl(bucket: string, path: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      return data.publicUrl
      
    } catch (error) {
      console.error('❌ Erro ao obter URL pública:', error)
      throw error
    }
  }

  /**
   * Obter URLs públicas das imagens processadas
   */
  async getProcessedImageUrls(imagePaths: string[]): Promise<string[]> {
    try {
      const urls = await Promise.all(
        imagePaths.map(path => this.getPublicUrl('processed-images', path))
      )
      
      return urls
      
    } catch (error) {
      console.error('❌ Erro ao obter URLs das imagens:', error)
      throw error
    }
  }

  /**
   * Download de arquivo do storage
   */
  async downloadFile(bucket: string, path: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path)

      if (error) {
        console.error('❌ Erro no download:', error)
        throw error
      }

      return data
      
    } catch (error) {
      console.error('❌ Erro no download do arquivo:', error)
      throw error
    }
  }

  /**
   * Listar arquivos em um bucket
   */
  async listFiles(bucket: string, folder?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('❌ Erro ao listar arquivos:', error)
        throw error
      }

      return data || []
      
    } catch (error) {
      console.error('❌ Erro ao listar arquivos:', error)
      throw error
    }
  }

  /**
   * Deletar arquivo do storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error('❌ Erro ao deletar arquivo:', error)
        throw error
      }

      console.log('✅ Arquivo deletado:', path)
      
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error)
      throw error
    }
  }

  /**
   * Limpar arquivos antigos (mais de 7 dias)
   */
  async cleanupOldFiles(): Promise<void> {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Listar arquivos antigos nos buckets
      const buckets = ['form-pdfs', 'processed-images']
      
      for (const bucket of buckets) {
        const files = await this.listFiles(bucket)
        
        const oldFiles = files.filter(file => {
          const fileDate = new Date(file.created_at)
          return fileDate < sevenDaysAgo
        })

        if (oldFiles.length > 0) {
          console.log(`🧹 Limpando ${oldFiles.length} arquivos antigos do bucket ${bucket}`)
          
          const deletePromises = oldFiles.map(file => 
            this.deleteFile(bucket, file.name)
          )
          
          await Promise.all(deletePromises)
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na limpeza de arquivos:', error)
    }
  }

  /**
   * Verificar se um arquivo existe
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'))

      if (error) return false

      const fileName = path.split('/').pop()
      return data?.some(file => file.name === fileName) || false
      
    } catch (error) {
      return false
    }
  }

  /**
   * Obter informações de um arquivo
   */
  async getFileInfo(bucket: string, path: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'))

      if (error) throw error

      const fileName = path.split('/').pop()
      const fileInfo = data?.find(file => file.name === fileName)
      
      return fileInfo
      
    } catch (error) {
      console.error('❌ Erro ao obter info do arquivo:', error)
      throw error
    }
  }
}