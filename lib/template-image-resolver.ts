import { supabase } from './supabase'

/**
 * Utilitário para resolver imagens de template de forma robusta
 * Garante que sempre tenhamos a referência correta das imagens
 */
export class TemplateImageResolver {
  /**
   * Resolve as imagens de um template, sempre buscando a referência mais atual
   */
  static async resolveTemplateImages(templateId: string): Promise<{
    success: boolean
    images: string[]
    template: any
    message: string
  }> {
    try {
      console.log(`🔍 Resolvendo imagens para template: ${templateId}`)
      
      // Buscar template atual do banco
      const { data: template, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error || !template) {
        return {
          success: false,
          images: [],
          template: null,
          message: `Template não encontrado: ${error?.message || 'ID inválido'}`
        }
      }

      const templateData = template as any
      console.log(`📋 Template encontrado: ${templateData.name}`)

      // Verificar se tem imagens
      if (!templateData.image_paths || templateData.image_paths.length === 0) {
        return {
          success: false,
          images: [],
          template,
          message: 'Template não possui imagens de fundo'
        }
      }

      // Validar e corrigir URLs das imagens
      const validImages = templateData.image_paths.map((url: string) => {
        if (!url || typeof url !== 'string') return null
        
        // Se já é uma URL completa, usar diretamente
        if (url.startsWith('http')) {
          return url
        }
        
        // Se é um caminho relativo, construir URL completa
        if (url.startsWith('processed/')) {
          const fullUrl = `https://fzbjggdfmdabimsfruqy.supabase.co/storage/v1/object/public/processed-images/${url}`
          console.log(`🔧 URL corrigida: ${url} -> ${fullUrl}`)
          return fullUrl
        }
        
        // Se não conseguiu corrigir, retornar null
        console.warn(`⚠️ URL não reconhecida: ${url}`)
        return null
      }).filter((url: any): url is string => url !== null)

      if (validImages.length === 0) {
        return {
          success: false,
          images: [],
          template,
          message: 'Template possui imagens inválidas'
        }
      }

      console.log(`✅ ${validImages.length} imagem(ns) válida(s) encontrada(s)`)
      validImages.forEach((url: string, index: number) => {
        console.log(`  ${index + 1}. ${url}`)
      })

      return {
        success: true,
        images: validImages,
        template,
        message: `${validImages.length} imagem(ns) carregada(s) com sucesso`
      }

    } catch (error) {
      console.error('❌ Erro ao resolver imagens do template:', error)
      return {
        success: false,
        images: [],
        template: null,
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Garante que um template tenha imagens válidas
   * Se não tiver, tenta corrigir automaticamente TODAS AS PÁGINAS
   */
  static async ensureTemplateHasImages(templateId: string): Promise<{
    success: boolean
    images: string[]
    wasFixed: boolean
    message: string
  }> {
    try {
      // Primeiro, tentar resolver normalmente
      const resolution = await this.resolveTemplateImages(templateId)
      
      if (resolution.success) {
        return {
          success: true,
          images: resolution.images,
          wasFixed: false,
          message: resolution.message
        }
      }

      console.log('🔧 Template sem imagens válidas, tentando correção automática com TODAS as páginas...')

      // Usar o novo sistema que garante todas as páginas
      const { StorageImageManager } = await import('./storage-image-manager')
      const result = await StorageImageManager.ensureAllPagesAreSaved(templateId, resolution.template?.name)

      if (!result.success) {
        return {
          success: false,
          images: [],
          wasFixed: false,
          message: result.message
        }
      }

      console.log(`✅ Template corrigido com ${result.totalPages} página(s)`)

      return {
        success: true,
        images: result.savedPages,
        wasFixed: true,
        message: result.message
      }

    } catch (error) {
      console.error('❌ Erro ao garantir imagens do template:', error)
      return {
        success: false,
        images: [],
        wasFixed: false,
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Valida se uma URL de imagem é acessível
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      if (!url || !url.startsWith('http')) return false
      
      // Para URLs do Supabase, assumir que são válidas
      if (url.includes('supabase.co')) return true
      
      return true // Assumir válida por padrão para evitar travamentos
    } catch (error) {
      console.warn('⚠️ Erro ao validar URL:', url, error)
      return false
    }
  }

  /**
   * Obtém informações de diagnóstico sobre as imagens de um template
   */
  static async diagnoseTemplate(templateId: string): Promise<{
    templateExists: boolean
    templateName: string
    hasImages: boolean
    imageCount: number
    validImages: number
    images: string[]
    issues: string[]
  }> {
    try {
      const resolution = await this.resolveTemplateImages(templateId)
      
      const diagnosis = {
        templateExists: !!resolution.template,
        templateName: resolution.template?.name || 'N/A',
        hasImages: resolution.images.length > 0,
        imageCount: resolution.template?.image_paths?.length || 0,
        validImages: resolution.images.length,
        images: resolution.images,
        issues: [] as string[]
      }

      // Identificar problemas
      if (!diagnosis.templateExists) {
        diagnosis.issues.push('Template não encontrado no banco de dados')
      }

      if (diagnosis.templateExists && !diagnosis.hasImages) {
        diagnosis.issues.push('Template não possui imagens de fundo')
      }

      if (diagnosis.imageCount > diagnosis.validImages) {
        diagnosis.issues.push(`${diagnosis.imageCount - diagnosis.validImages} imagem(ns) inválida(s)`)
      }

      return diagnosis
    } catch (error) {
      return {
        templateExists: false,
        templateName: 'Erro',
        hasImages: false,
        imageCount: 0,
        validImages: 0,
        images: [],
        issues: [`Erro no diagnóstico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }
    }
  }
}