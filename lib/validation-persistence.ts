/**
 * 🔒 MÓDULO DE PERSISTÊNCIA DE VALIDAÇÕES CONDICIONAIS
 * 
 * Responsável por garantir que as validações condicionais sejam
 * sempre salvas e carregadas corretamente do banco de dados.
 * 
 * GARANTIAS:
 * - Validações nunca são perdidas
 * - Sempre sincronizadas com o banco
 * - Fácil de debugar
 * - Fácil de manter
 */

import { supabase } from './supabase'
import { ValidationRule } from './types/validation-rules'

export class ValidationPersistence {
  private static instance: ValidationPersistence
  
  private constructor() {}

  static getInstance(): ValidationPersistence {
    if (!ValidationPersistence.instance) {
      ValidationPersistence.instance = new ValidationPersistence()
    }
    return ValidationPersistence.instance
  }

  /**
   * Salvar validações no banco de dados
   * @param templateId - ID do template
   * @param rules - Array de regras de validação
   * @returns Promise<boolean> - true se salvou com sucesso
   */
  async saveValidations(templateId: string, rules: ValidationRule[]): Promise<boolean> {
    try {
      console.log(`💾 [VALIDATION] Salvando ${rules.length} regra(s) para template ${templateId}`)

      // Validar dados antes de salvar
      if (!templateId || !templateId.trim()) {
        console.error('❌ [VALIDATION] Template ID inválido')
        return false
      }

      // Preparar dados - sempre salvar, mesmo se vazio
      const validationData = rules && rules.length > 0 ? rules : []

      // Atualizar no banco
      const { error } = await supabase
        .from('form_templates')
        .update({
          validationRules: validationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) {
        console.error('❌ [VALIDATION] Erro ao salvar:', error)
        return false
      }

      console.log(`✅ [VALIDATION] ${rules.length} regra(s) salva(s) com sucesso`)
      return true

    } catch (error) {
      console.error('❌ [VALIDATION] Erro inesperado ao salvar:', error)
      return false
    }
  }

  /**
   * Carregar validações do banco de dados
   * @param templateId - ID do template
   * @returns Promise<ValidationRule[]> - Array de regras (vazio se não houver)
   */
  async loadValidations(templateId: string): Promise<ValidationRule[]> {
    try {
      console.log(`📂 [VALIDATION] Carregando validações do template ${templateId}`)

      // Validar dados
      if (!templateId || !templateId.trim()) {
        console.error('❌ [VALIDATION] Template ID inválido')
        return []
      }

      // Buscar no banco
      const { data, error } = await supabase
        .from('form_templates')
        .select('validationRules')
        .eq('id', templateId)
        .single()

      if (error) {
        console.error('❌ [VALIDATION] Erro ao carregar:', error)
        return []
      }

      const rules = (data as any)?.validationRules || []
      console.log(`✅ [VALIDATION] ${rules.length} regra(s) carregada(s)`)
      
      return rules

    } catch (error) {
      console.error('❌ [VALIDATION] Erro inesperado ao carregar:', error)
      return []
    }
  }

  /**
   * Verificar se template tem validações
   * @param templateId - ID do template
   * @returns Promise<boolean> - true se tem validações
   */
  async hasValidations(templateId: string): Promise<boolean> {
    const rules = await this.loadValidations(templateId)
    return rules.length > 0
  }

  /**
   * Deletar todas as validações de um template
   * @param templateId - ID do template
   * @returns Promise<boolean> - true se deletou com sucesso
   */
  async deleteValidations(templateId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [VALIDATION] Deletando validações do template ${templateId}`)

      const { error } = await supabase
        .from('form_templates')
        .update({
          validationRules: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) {
        console.error('❌ [VALIDATION] Erro ao deletar:', error)
        return false
      }

      console.log('✅ [VALIDATION] Validações deletadas com sucesso')
      return true

    } catch (error) {
      console.error('❌ [VALIDATION] Erro inesperado ao deletar:', error)
      return false
    }
  }

  /**
   * Contar validações de um template
   * @param templateId - ID do template
   * @returns Promise<number> - Quantidade de regras
   */
  async countValidations(templateId: string): Promise<number> {
    const rules = await this.loadValidations(templateId)
    return rules.length
  }
}

// Export singleton
export const validationPersistence = ValidationPersistence.getInstance()
