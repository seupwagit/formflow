/**
 * 🔒 GERENCIADOR DE VALIDAÇÕES CONDICIONAIS
 * 
 * Módulo isolado e confiável para gerenciar validações condicionais.
 * Garante que TODAS as operações sejam persistidas no banco de dados.
 * 
 * RESPONSABILIDADES:
 * - Salvar validações no banco
 * - Carregar validações do banco
 * - Validar integridade dos dados
 * - Logs detalhados para debug
 * - Tratamento de erros robusto
 */

import { supabase } from './supabase'
import { ValidationRule } from './types/validation-rules'

export class ValidationConditionalManager {
  private static instance: ValidationConditionalManager
  
  private constructor() {
    console.log('🔧 ValidationConditionalManager inicializado')
  }

  static getInstance(): ValidationConditionalManager {
    if (!ValidationConditionalManager.instance) {
      ValidationConditionalManager.instance = new ValidationConditionalManager()
    }
    return ValidationConditionalManager.instance
  }

  /**
   * 💾 SALVAR validações no banco de dados
   * NOVA ABORDAGEM: Usa tabela dedicada ao invés de JSONB
   * @param templateId - ID do template
   * @param rules - Array de regras de validação
   * @returns Promise<boolean> - true se salvou com sucesso
   */
  async saveValidations(templateId: string, rules: ValidationRule[]): Promise<boolean> {
    try {
      console.log(`💾 [VALIDATION-MANAGER] Salvando ${rules.length} validação(ões) para template ${templateId}`)
      
      // Validar entrada
      if (!templateId || !templateId.trim()) {
        console.error('❌ [VALIDATION-MANAGER] Template ID inválido')
        return false
      }

      // Preparar dados - sempre salvar array, mesmo se vazio
      const validationData = Array.isArray(rules) ? rules : []
      
      console.log('📦 [VALIDATION-MANAGER] Dados a salvar:', JSON.stringify(validationData, null, 2))

      // NOVA ABORDAGEM: Usar função RPC com tabela dedicada
      const { error } = await supabase.rpc('save_template_validations', {
        p_template_id: templateId,
        p_rules: validationData
      })

      if (error) {
        console.error('❌ [VALIDATION-MANAGER] Erro ao salvar:', error)
        return false
      }

      console.log(`✅ [VALIDATION-MANAGER] ${rules.length} validação(ões) salva(s) com sucesso na tabela dedicada`)
      
      // Verificar se realmente salvou
      const saved = await this.loadValidations(templateId)
      if (saved.length !== rules.length) {
        console.warn(`⚠️ [VALIDATION-MANAGER] Inconsistência: salvou ${rules.length} mas carregou ${saved.length}`)
        return false
      }
      
      return true

    } catch (error) {
      console.error('❌ [VALIDATION-MANAGER] Erro inesperado ao salvar:', error)
      return false
    }
  }

  /**
   * 📂 CARREGAR validações do banco de dados
   * NOVA ABORDAGEM: Usa tabela dedicada ao invés de JSONB
   * @param templateId - ID do template
   * @returns Promise<ValidationRule[]> - Array de regras (vazio se não houver)
   */
  async loadValidations(templateId: string): Promise<ValidationRule[]> {
    try {
      console.log(`📂 [VALIDATION-MANAGER] Carregando validações do template ${templateId}`)

      // Validar entrada
      if (!templateId || !templateId.trim()) {
        console.error('❌ [VALIDATION-MANAGER] Template ID inválido')
        return []
      }

      // NOVA ABORDAGEM: Usar função RPC com tabela dedicada
      const { data, error } = await supabase.rpc('load_template_validations', {
        p_template_id: templateId
      })

      if (error) {
        console.error('❌ [VALIDATION-MANAGER] Erro ao carregar:', error)
        return []
      }

      // A função RPC já retorna um array JSONB
      const rules = data || []
      
      // Validar que é um array
      if (!Array.isArray(rules)) {
        console.warn('⚠️ [VALIDATION-MANAGER] Dados inválidos (não é array):', typeof rules)
        return []
      }

      console.log(`✅ [VALIDATION-MANAGER] ${rules.length} validação(ões) carregada(s) da tabela dedicada`)
      if (rules.length > 0) {
        console.log('📦 [VALIDATION-MANAGER] Dados carregados:', JSON.stringify(rules, null, 2))
      }
      
      return rules

    } catch (error) {
      console.error('❌ [VALIDATION-MANAGER] Erro inesperado ao carregar:', error)
      return []
    }
  }

  /**
   * 🗑️ DELETAR todas as validações de um template
   * NOVA ABORDAGEM: Deleta da tabela dedicada
   * @param templateId - ID do template
   * @returns Promise<boolean> - true se deletou com sucesso
   */
  async deleteValidations(templateId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [VALIDATION-MANAGER] Deletando validações do template ${templateId}`)

      // NOVA ABORDAGEM: Deletar da tabela dedicada
      const { error } = await supabase
        .from('template_validation_rules')
        .delete()
        .eq('template_id', templateId)

      if (error) {
        console.error('❌ [VALIDATION-MANAGER] Erro ao deletar:', error)
        return false
      }

      console.log('✅ [VALIDATION-MANAGER] Validações deletadas com sucesso da tabela dedicada')
      return true

    } catch (error) {
      console.error('❌ [VALIDATION-MANAGER] Erro inesperado ao deletar:', error)
      return false
    }
  }

  /**
   * 🔢 CONTAR validações de um template
   * @param templateId - ID do template
   * @returns Promise<number> - Quantidade de regras
   */
  async countValidations(templateId: string): Promise<number> {
    const rules = await this.loadValidations(templateId)
    return rules.length
  }

  /**
   * ✅ VERIFICAR se template tem validações
   * @param templateId - ID do template
   * @returns Promise<boolean> - true se tem validações
   */
  async hasValidations(templateId: string): Promise<boolean> {
    const count = await this.countValidations(templateId)
    return count > 0
  }

  /**
   * 🔍 VALIDAR integridade das regras
   * @param rules - Array de regras para validar
   * @returns { valid: boolean, errors: string[] }
   */
  validateRules(rules: ValidationRule[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!Array.isArray(rules)) {
      errors.push('Regras devem ser um array')
      return { valid: false, errors }
    }

    rules.forEach((rule, index) => {
      if (!rule.id) {
        errors.push(`Regra ${index}: ID obrigatório`)
      }
      if (!rule.name) {
        errors.push(`Regra ${index}: Nome obrigatório`)
      }
      if (!Array.isArray(rule.conditions)) {
        errors.push(`Regra ${index}: Condições devem ser um array`)
      }
      if (!Array.isArray(rule.actionsTrue)) {
        errors.push(`Regra ${index}: Ações verdadeiras devem ser um array`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton
export const validationManager = ValidationConditionalManager.getInstance()
