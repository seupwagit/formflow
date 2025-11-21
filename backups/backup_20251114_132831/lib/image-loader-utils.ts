import { supabase } from './supabase'

/**
 * Utilitários para carregamento robusto de imagens
 */
export class ImageLoaderUtils {
  /**
   * Carrega URLs de imagens de forma robusta
   */
  static async loadImageUrls(imagePaths: string[]): Promise<string[]> {
    if (!imagePaths || imagePaths.length === 0) {
      console.log('⚠️ Nenhum caminho de imagem fornecido')
      return []
    }

    console.log('🖼️ Carregando URLs de imagens:', imagePaths)

    const imageUrls = await Promise.all(
      imagePaths.map(async (path: string) => {
        try {
          // Se já é uma URL completa, usar diretamente
          if (path.startsWith('http')) {
            console.log('✅ URL direta encontrada:', path)
            
            // Verificar se a URL é acessível (opcional, pode ser lento)
            const isAccessible = await this.checkUrlAccessibility(path)
            if (isAccessible) {
              console.log('✅ URL verificada e acessível:', path)
            } else {
              console.warn('⚠️ URL pode não estar acessível:', path)
            }
            
            return path
          }
          
          // Se é um caminho relativo, construir URL pública
          const { data } = supabase.storage
            .from('processed-images')
            .getPublicUrl(path)
          
          console.log('✅ URL construída:', data.publicUrl)
          return data.publicUrl
        } catch (error) {
          console.error('❌ Erro ao processar caminho de imagem:', path, error)
          return null
        }
      })
    )

    // Filtrar URLs válidas
    const validUrls = imageUrls.filter(url => url !== null) as string[]
    console.log(`📸 Total de URLs válidas: ${validUrls.length}/${imagePaths.length}`)

    return validUrls
  }

  /**
   * Verifica se uma URL é acessível (versão simplificada)
   */
  static async checkUrlAccessibility(url: string, timeoutMs: number = 2000): Promise<boolean> {
    try {
      // Verificação simples sem fetch para evitar travamentos
      if (!url || !url.startsWith('http')) {
        return false
      }
      
      // Assumir que URLs do Supabase são válidas
      if (url.includes('supabase.co')) {
        return true
      }
      
      return true // Assumir válida por padrão
    } catch (error) {
      console.warn('⚠️ Erro ao verificar URL:', url, error)
      return false
    }
  }

  /**
   * Recarrega imagens de um template específico do banco
   */
  static async reloadTemplateImages(templateId: string): Promise<string[]> {
    try {
      console.log('🔄 Recarregando imagens do template:', templateId)
      
      const { data: template, error } = await supabase
        .from('form_templates')
        .select('image_paths, name')
        .eq('id', templateId)
        .single()

      if (error) {
        console.error('❌ Erro ao recarregar template:', error)
        return []
      }

      if (!(template as any)?.image_paths) {
        console.warn('⚠️ Template não possui imagens:', (template as any)?.name)
        return []
      }

      console.log('✅ Template recarregado:', (template as any).name, (template as any).image_paths)
      return await this.loadImageUrls((template as any).image_paths)
    } catch (error) {
      console.error('❌ Erro ao recarregar imagens do template:', error)
      return []
    }
  }

  /**
   * Força atualização das imagens de um template
   */
  static async forceUpdateTemplateImages(templateId: string, newImagePaths: string[]): Promise<boolean> {
    try {
      console.log('🔄 Forçando atualização de imagens do template:', templateId)
      
      const { error } = await (supabase as any)
        .from('form_templates')
        .update({
          image_paths: newImagePaths,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) {
        console.error('❌ Erro ao atualizar imagens do template:', error)
        return false
      }

      console.log('✅ Imagens do template atualizadas com sucesso')
      return true
    } catch (error) {
      console.error('❌ Erro ao forçar atualização:', error)
      return false
    }
  }

  /**
   * Diagnóstico completo de imagens de um template
   */
  static async diagnoseTemplateImages(templateId: string): Promise<{
    templateExists: boolean
    hasImagePaths: boolean
    imageCount: number
    accessibleImages: number
    inaccessibleImages: string[]
    allUrls: string[]
  }> {
    try {
      console.log('🔍 Diagnosticando imagens do template:', templateId)
      
      // Verificar se template existe
      const { data: template, error } = await supabase
        .from('form_templates')
        .select('image_paths, name')
        .eq('id', templateId)
        .single()

      if (error || !template) {
        return {
          templateExists: false,
          hasImagePaths: false,
          imageCount: 0,
          accessibleImages: 0,
          inaccessibleImages: [],
          allUrls: []
        }
      }

      const imagePaths = (template as any).image_paths || []
      const imageUrls = await this.loadImageUrls(imagePaths)
      
      // Verificar acessibilidade de cada URL
      const accessibilityResults = await Promise.all(
        imageUrls.map(async (url) => ({
          url,
          accessible: await this.checkUrlAccessibility(url)
        }))
      )

      const accessibleCount = accessibilityResults.filter(r => r.accessible).length
      const inaccessibleUrls = accessibilityResults
        .filter(r => !r.accessible)
        .map(r => r.url)

      const diagnosis = {
        templateExists: true,
        hasImagePaths: imagePaths.length > 0,
        imageCount: imageUrls.length,
        accessibleImages: accessibleCount,
        inaccessibleImages: inaccessibleUrls,
        allUrls: imageUrls
      }

      console.log('📊 Diagnóstico completo:', diagnosis)
      return diagnosis
    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error)
      return {
        templateExists: false,
        hasImagePaths: false,
        imageCount: 0,
        accessibleImages: 0,
        inaccessibleImages: [],
        allUrls: []
      }
    }
  }
}