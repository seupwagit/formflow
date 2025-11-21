import { supabase } from './supabase'
import { StorageImageManager } from './storage-image-manager'

export interface TemplateBackgroundVersion {
  id: string
  template_id: string
  version_number: number
  image_paths: string[]
  pdf_path?: string
  is_current: boolean
  created_at: string
  created_by?: string
}

export class TemplateBackgroundManager {
  /**
   * Obtém a versão atual da imagem de fundo de um template
   */
  static async getCurrentBackgroundVersion(templateId: string): Promise<TemplateBackgroundVersion | null> {
    try {
      const { data, error } = await supabase
        .from('template_background_versions')
        .select('*')
        .eq('template_id', templateId)
        .eq('is_current', true)
        .single()

      if (error) {
        console.log(`⚠️ Nenhuma versão atual encontrada para template ${templateId}`)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Erro ao buscar versão atual:', error)
      return null
    }
  }

  /**
   * Cria uma nova versão da imagem de fundo para um template
   */
  static async createNewBackgroundVersion(
    templateId: string,
    imagePaths: string[],
    pdfPath?: string,
    userId?: string
  ): Promise<TemplateBackgroundVersion | null> {
    try {
      // Primeiro, marcar todas as versões anteriores como não atuais
      await (supabase as any)
        .from('template_background_versions')
        .update({ is_current: false })
        .eq('template_id', templateId)

      // Obter o próximo número de versão
      const { data: lastVersion } = await supabase
        .from('template_background_versions')
        .select('version_number')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersionNumber = ((lastVersion as any)?.version_number || 0) + 1

      // Criar a nova versão
      const { data, error } = await (supabase as any)
        .from('template_background_versions')
        .insert({
          template_id: templateId,
          version_number: nextVersionNumber,
          image_paths: imagePaths,
          pdf_path: pdfPath,
          is_current: true,
          created_by: userId
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar nova versão de imagem de fundo:', error)
        return null
      }

      // Atualizar o template com as novas imagens
      await (supabase as any)
        .from('form_templates')
        .update({
          image_paths: imagePaths,
          pdf_path: pdfPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      return data
    } catch (error) {
      console.error('Erro ao criar nova versão de imagem de fundo:', error)
      return null
    }
  }

  // Função duplicada removida

  /**
   * Obtém uma versão específica da imagem de fundo
   */
  static async getBackgroundVersion(versionId: string): Promise<TemplateBackgroundVersion | null> {
    try {
      const { data, error } = await supabase
        .from('template_background_versions')
        .select('*')
        .eq('id', versionId)
        .single()

      if (error) {
        console.error('Erro ao obter versão da imagem de fundo:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao obter versão da imagem de fundo:', error)
      return null
    }
  }

  /**
   * Lista todas as versões de imagem de fundo de um template
   */
  static async getBackgroundVersionHistory(templateId: string): Promise<TemplateBackgroundVersion[]> {
    try {
      const { data, error } = await supabase
        .from('template_background_versions')
        .select('*')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false })

      if (error) {
        console.error('Erro ao obter histórico de versões:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao obter histórico de versões:', error)
      return []
    }
  }

  /**
   * Associa uma resposta a uma versão específica da imagem de fundo
   */
  static async associateResponseToBackgroundVersion(
    responseId: string,
    backgroundVersionId: string
  ): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('form_responses')
        .update({ background_version_id: backgroundVersionId })
        .eq('id', responseId)

      if (error) {
        console.error('Erro ao associar resposta à versão da imagem:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao associar resposta à versão da imagem:', error)
      return false
    }
  }

  /**
   * Obtém a versão da imagem de fundo que deve ser usada para uma resposta
   * Se a resposta não tem versão associada, usa a versão atual do template
   */
  static async getBackgroundVersionForResponse(
    responseId: string,
    templateId: string
  ): Promise<TemplateBackgroundVersion | null> {
    try {
      // Primeiro, verificar se a resposta já tem uma versão associada
      const { data: response } = await supabase
        .from('form_responses')
        .select('background_version_id, created_at')
        .eq('id', responseId)
        .single()

      const responseData = response as any
      if (responseData?.background_version_id) {
        // Usar a versão específica associada à resposta
        return await this.getBackgroundVersion(responseData.background_version_id)
      }

      // Se não tem versão associada, encontrar a versão que estava ativa na data de criação da resposta
      if (responseData?.created_at) {
        const { data: versionAtTime } = await supabase
          .from('template_background_versions')
          .select('*')
          .eq('template_id', templateId)
          .lte('created_at', responseData.created_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (versionAtTime) {
          // Associar esta versão à resposta para futuras consultas
          await this.associateResponseToBackgroundVersion(responseId, (versionAtTime as any).id)
          return versionAtTime as any
        }
      }

      // Fallback: usar a versão atual
      return await this.getCurrentBackgroundVersion(templateId)
    } catch (error) {
      console.error('Erro ao obter versão da imagem para resposta:', error)
      return null
    }
  }

  /**
   * Migra templates existentes para o sistema de versionamento
   */
  static async migrateExistingTemplates(): Promise<void> {
    try {
      console.log('🔄 Iniciando migração completa de templates...')

      // Primeiro, executar migração de imagens do storage
      await StorageImageManager.migrateTemplateImages()

      // Buscar todos os templates
      const { data: templates } = await supabase
        .from('form_templates')
        .select('id, name, image_paths, pdf_path')

      if (!templates) return

      for (const template of templates) {
        const templateData = template as any
        console.log(`📋 Processando template: ${templateData.name}`)

        // Verificar se já existe uma versão para este template
        const existingVersion = await this.getCurrentBackgroundVersion(templateData.id)
        
        if (existingVersion) {
          console.log(`✅ Template ${templateData.name} já tem versionamento`)
          continue
        }

        // Se não tem imagens, tentar buscar no storage
        let imagePaths = templateData.image_paths
        if (!imagePaths || imagePaths.length === 0) {
          console.log(`🔍 Buscando imagens para template ${templateData.name}...`)
          imagePaths = await StorageImageManager.findImagesForTemplate(templateData.id, templateData.name)
          
          if (imagePaths.length > 0) {
            // Atualizar template com as imagens encontradas
            await (supabase as any)
              .from('form_templates')
              .update({ image_paths: imagePaths })
              .eq('id', templateData.id)
            
            console.log(`📸 Encontradas ${imagePaths.length} imagens para ${templateData.name}`)
          }
        }

        // Criar versão inicial se temos imagens
        if (imagePaths && imagePaths.length > 0) {
          await this.createNewBackgroundVersion(
            templateData.id,
            imagePaths,
            templateData.pdf_path
          )
          
          console.log(`✅ Criada versão inicial para template ${templateData.name}`)
        } else {
          console.log(`⚠️ Template ${templateData.name} não possui imagens de fundo`)
        }
      }

      console.log('✅ Migração completa de templates concluída!')
    } catch (error) {
      console.error('❌ Erro na migração de templates:', error)
    }
  }
}