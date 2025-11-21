import { useEffect } from 'react'
import { ResponseBackgroundManager } from '@/lib/response-background-manager'

/**
 * Hook para garantir que respostas sejam associadas com a versão correta da imagem de fundo
 */
export function useResponseBackground(responseId: string | undefined, templateId: string) {
  useEffect(() => {
    // Só executar se temos responseId (resposta existente)
    if (!responseId || !templateId) return
    
    const associateBackground = async () => {
      try {
        console.log(`🔗 Verificando associação de background para resposta ${responseId}`)
        
        // Verificar se a resposta já tem versão associada
        const current = await ResponseBackgroundManager.getResponseBackgroundVersion(responseId)
        
        if (!current.success || !current.version) {
          console.log('🔧 Resposta sem versão de background, associando com atual...')
          
          const result = await ResponseBackgroundManager.associateResponseWithCurrentBackground(
            responseId,
            templateId
          )
          
          if (result.success) {
            console.log(`✅ Resposta associada: ${result.message}`)
          } else {
            console.warn(`⚠️ Falha na associação: ${result.message}`)
          }
        } else {
          console.log(`✅ Resposta já tem versão associada: ${current.message}`)
        }
        
      } catch (error) {
        console.error('❌ Erro no hook de background:', error)
      }
    }
    
    associateBackground()
  }, [responseId, templateId])
}

/**
 * Hook para associar uma nova resposta com a versão atual da imagem
 * Deve ser chamado quando uma resposta é criada/salva
 */
export function useAssociateNewResponse() {
  const associateResponse = async (responseId: string, templateId: string) => {
    try {
      console.log(`🆕 Associando nova resposta ${responseId} com versão atual da imagem...`)
      
      const result = await ResponseBackgroundManager.associateResponseWithCurrentBackground(
        responseId,
        templateId
      )
      
      if (result.success) {
        console.log(`✅ Nova resposta associada: ${result.message}`)
        return result
      } else {
        console.warn(`⚠️ Falha na associação: ${result.message}`)
        return result
      }
      
    } catch (error) {
      console.error('❌ Erro ao associar nova resposta:', error)
      return {
        success: false,
        backgroundVersionId: null,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }
  
  return { associateResponse }
}