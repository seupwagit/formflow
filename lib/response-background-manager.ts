import { supabase } from './supabase'
import { TemplateBackgroundManager } from './template-background-manager'

/**
 * Gerencia a associação entre respostas e versões de imagem de fundo
 * Garante que cada resposta mantenha a imagem que estava ativa quando foi criada
 */
export class ResponseBackgroundManager {
  
  /**
   * Associa uma resposta com a versão atual da imagem de fundo do template
   * Deve ser chamado sempre que uma nova resposta for criada ou salva
   */
  static async associateResponseWithCurrentBackground(
    responseId: string,
    templateId: string
  ): Promise<{
    success: boolean
    backgroundVersionId: string | null
    message: string
  }> {
    try {
      console.log(`🔗 Associando resposta ${responseId} com versão atual da imagem...`)
      
      // Buscar a versão atual da imagem de fundo do template
      const currentVersion = await TemplateBackgroundManager.getCurrentBackgroundVersion(templateId)
      
      if (!currentVersion) {
        console.log('⚠️ Template não possui versão de imagem de fundo, criando uma...')
        
        // Se não há versão, criar uma com as imagens atuais do template
        const { data: template } = await supabase
          .from('form_templates')
          .select('image_paths')
          .eq('id', templateId)
          .single()
        
        if ((template as any)?.image_paths && (template as any).image_paths.length > 0) {
          const newVersion = await TemplateBackgroundManager.createNewBackgroundVersion(
            templateId,
            (template as any).image_paths
          )
          
          if (newVersion) {
            await this.updateResponseBackgroundVersion(responseId, newVersion.id)
            return {
              success: true,
              backgroundVersionId: newVersion.id,
              message: `Nova versão criada e associada: ${newVersion.version_number}`
            }
          }
        }
        
        return {
          success: false,
          backgroundVersionId: null,
          message: 'Template não possui imagens de fundo válidas'
        }
      }
      
      // Associar resposta com a versão atual
      await this.updateResponseBackgroundVersion(responseId, currentVersion.id)
      
      console.log(`✅ Resposta associada com versão ${currentVersion.version_number}`)
      
      return {
        success: true,
        backgroundVersionId: currentVersion.id,
        message: `Associada com versão ${currentVersion.version_number}`
      }
      
    } catch (error) {
      console.error('❌ Erro ao associar resposta com background:', error)
      return {
        success: false,
        backgroundVersionId: null,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }
  
  /**
   * Atualiza o background_version_id de uma resposta
   */
  private static async updateResponseBackgroundVersion(
    responseId: string,
    backgroundVersionId: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from('form_responses')
      .update({
        background_version_id: backgroundVersionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', responseId)
    
    if (error) {
      throw new Error(`Erro ao atualizar resposta: ${error.message}`)
    }
  }
  
  /**
   * Obtém a versão de imagem de fundo associada a uma resposta
   */
  static async getResponseBackgroundVersion(responseId: string): Promise<{
    success: boolean
    version: any | null
    images: string[]
    message: string
  }> {
    try {
      // Buscar a resposta e sua versão de background
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .select(`
          id,
          template_id,
          background_version_id,
          created_at
        `)
        .eq('id', responseId)
        .single()
      
      if (responseError || !response) {
        return {
          success: false,
          version: null,
          images: [],
          message: 'Resposta não encontrada'
        }
      }
      
      // Se não tem versão associada, usar a versão atual do template
      if (!(response as any).background_version_id) {
        console.log('⚠️ Resposta sem versão de background, usando atual do template')
        
        const currentVersion = await TemplateBackgroundManager.getCurrentBackgroundVersion((response as any).template_id)
        
        if (currentVersion) {
          // Associar automaticamente para futuras consultas
          await this.updateResponseBackgroundVersion(responseId, currentVersion.id)
          
          return {
            success: true,
            version: currentVersion,
            images: currentVersion.image_paths,
            message: `Usando versão atual: ${currentVersion.version_number}`
          }
        }
        
        return {
          success: false,
          version: null,
          images: [],
          message: 'Template não possui versões de background'
        }
      }
      
      // Buscar a versão específica
      const { data: version, error: versionError } = await supabase
        .from('template_background_versions')
        .select('*')
        .eq('id', (response as any).background_version_id)
        .single()
      
      if (versionError || !version) {
        return {
          success: false,
          version: null,
          images: [],
          message: 'Versão de background não encontrada'
        }
      }
      
      return {
        success: true,
        version,
        images: (version as any).image_paths || [],
        message: `Versão ${(version as any).version_number} encontrada`
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar versão de background da resposta:', error)
      return {
        success: false,
        version: null,
        images: [],
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }
  
  /**
   * Garante que todas as respostas existentes tenham versões de background associadas
   */
  static async migrateExistingResponses(): Promise<{
    processed: number
    migrated: number
    errors: string[]
  }> {
    try {
      console.log('🔄 Migrando respostas existentes para sistema de versionamento...')
      
      // Buscar respostas sem background_version_id
      const { data: responses, error } = await supabase
        .from('form_responses')
        .select('id, template_id, created_at')
        .is('background_version_id', null)
      
      if (error) {
        throw new Error(`Erro ao buscar respostas: ${error.message}`)
      }
      
      let processed = 0
      let migrated = 0
      const errors: string[] = []
      
      for (const response of responses || []) {
        processed++
        
        try {
          const result = await this.associateResponseWithCurrentBackground(
            (response as any).id,
            (response as any).template_id
          )
          
          if (result.success) {
            migrated++
            console.log(`✅ Resposta ${(response as any).id} migrada: ${result.message}`)
          } else {
            errors.push(`Resposta ${(response as any).id}: ${result.message}`)
          }
          
        } catch (responseError) {
          const errorMsg = `Erro na resposta ${(response as any).id}: ${responseError instanceof Error ? responseError.message : 'Erro desconhecido'}`
          errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }
      }
      
      console.log(`📊 Migração concluída: ${migrated}/${processed} respostas migradas`)
      
      return { processed, migrated, errors }
      
    } catch (error) {
      console.error('❌ Erro na migração:', error)
      return {
        processed: 0,
        migrated: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    }
  }
}