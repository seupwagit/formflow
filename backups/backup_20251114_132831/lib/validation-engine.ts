// Motor de execução de regras de validação

import { 
  ValidationRule, 
  ValidationCondition, 
  ValidationAction,
  ComparisonOperator 
} from './types/validation-rules'

export class ValidationEngine {
  private static instance: ValidationEngine
  private rules: ValidationRule[] = []
  private fieldValues: { [key: string]: any } = {}
  private blockedSubmit: boolean = false
  private activeMessages: { id: string; message: string; type: string }[] = []

  private constructor() {}

  static getInstance(): ValidationEngine {
    if (!ValidationEngine.instance) {
      ValidationEngine.instance = new ValidationEngine()
    }
    return ValidationEngine.instance
  }

  // Carregar regras
  loadRules(rules: ValidationRule[]) {
    this.rules = rules
      .filter(r => r.enabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    console.log('✅ Regras de validação carregadas:', this.rules.length)
  }

  // Atualizar valores dos campos
  updateFieldValues(values: { [key: string]: any }) {
    this.fieldValues = values
  }

  // Avaliar uma condição
  private evaluateCondition(condition: ValidationCondition): boolean {
    const fieldValue = this.fieldValues[condition.fieldName]
    let compareValue = condition.value

    // Se comparar com outro campo
    if (condition.compareWithField) {
      compareValue = this.fieldValues[condition.compareWithField]
    }

    // Processar valores especiais
    if (compareValue === '{{TODAY}}') {
      compareValue = new Date().toISOString().split('T')[0]
    }

    switch (condition.operator) {
      case 'equals':
        return fieldValue == compareValue

      case 'not_equals':
        return fieldValue != compareValue

      case 'greater_than':
        return Number(fieldValue) > Number(compareValue)

      case 'less_than':
        return Number(fieldValue) < Number(compareValue)

      case 'greater_or_equal':
        return Number(fieldValue) >= Number(compareValue)

      case 'less_or_equal':
        return Number(fieldValue) <= Number(compareValue)

      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase())

      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase())

      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase())

      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase())

      case 'is_empty':
        return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined

      case 'is_not_empty':
        return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined

      default:
        return false
    }
  }

  // Avaliar todas as condições de uma regra
  private evaluateRule(rule: ValidationRule): boolean {
    if (rule.conditions.length === 0) return false

    if (rule.logicalOperator === 'AND') {
      return rule.conditions.every(c => this.evaluateCondition(c))
    } else {
      return rule.conditions.some(c => this.evaluateCondition(c))
    }
  }

  // Executar ações
  private executeActions(
    actions: ValidationAction[], 
    callbacks: ValidationCallbacks
  ): void {
    actions.forEach(action => {
      switch (action.type) {
        case 'show_message':
          if (action.message) {
            this.activeMessages.push({
              id: action.id,
              message: action.message,
              type: action.messageType || 'info'
            })
            callbacks.onShowMessage?.(action.message, action.messageType || 'info')
          }
          break

        case 'block_submit':
          this.blockedSubmit = true
          callbacks.onBlockSubmit?.(true)
          break

        case 'set_field_value':
          if (action.targetField) {
            let value = action.value
            if (value === '{{TODAY}}') {
              value = new Date().toISOString().split('T')[0]
            }
            callbacks.onSetFieldValue?.(action.targetField, value)
          }
          break

        case 'clear_field':
          if (action.targetField) {
            callbacks.onSetFieldValue?.(action.targetField, '')
          }
          break

        case 'show_field':
          if (action.targetField) {
            callbacks.onToggleFieldVisibility?.(action.targetField, true)
          }
          break

        case 'hide_field':
          if (action.targetField) {
            callbacks.onToggleFieldVisibility?.(action.targetField, false)
          }
          break

        case 'make_required':
          if (action.targetField) {
            callbacks.onToggleFieldRequired?.(action.targetField, true)
          }
          break

        case 'make_optional':
          if (action.targetField) {
            callbacks.onToggleFieldRequired?.(action.targetField, false)
          }
          break

        case 'disable_field':
          if (action.targetField) {
            callbacks.onToggleFieldDisabled?.(action.targetField, true)
          }
          break

        case 'enable_field':
          if (action.targetField) {
            callbacks.onToggleFieldDisabled?.(action.targetField, false)
          }
          break

        case 'change_color':
          if (action.targetField && action.color) {
            callbacks.onChangeFieldColor?.(action.targetField, action.color)
          }
          break
      }
    })
  }

  // Executar todas as regras
  execute(
    executionType: 'on_change' | 'on_blur' | 'on_focus' | 'on_submit' | 'on_save' | 'on_load' | 'continuous',
    callbacks: ValidationCallbacks
  ): ValidationResult {
    // Resetar estado
    this.blockedSubmit = false
    this.activeMessages = []

    // Filtrar regras pelo tipo de execução
    const applicableRules = this.rules.filter(r => 
      r.executionType === executionType || r.executionType === 'continuous'
    )

    // Executar cada regra
    applicableRules.forEach(rule => {
      const conditionMet = this.evaluateRule(rule)

      if (conditionMet && rule.actionsTrue) {
        console.log(`✅ Regra "${rule.name}" ativada (condição verdadeira)`)
        this.executeActions(rule.actionsTrue, callbacks)
      } else if (!conditionMet && rule.actionsFalse) {
        console.log(`ℹ️ Regra "${rule.name}" - executando ações falsas`)
        this.executeActions(rule.actionsFalse, callbacks)
      }
    })

    return {
      isValid: !this.blockedSubmit,
      messages: this.activeMessages,
      blockedSubmit: this.blockedSubmit
    }
  }

  // Verificar se pode submeter
  canSubmit(): boolean {
    return !this.blockedSubmit
  }

  // Obter mensagens ativas
  getActiveMessages() {
    return this.activeMessages
  }
}

// Callbacks para ações
export interface ValidationCallbacks {
  onShowMessage?: (message: string, type: string) => void
  onBlockSubmit?: (blocked: boolean) => void
  onSetFieldValue?: (fieldName: string, value: any) => void
  onToggleFieldVisibility?: (fieldName: string, visible: boolean) => void
  onToggleFieldRequired?: (fieldName: string, required: boolean) => void
  onToggleFieldDisabled?: (fieldName: string, disabled: boolean) => void
  onChangeFieldColor?: (fieldName: string, color: string) => void
}

// Resultado da validação
export interface ValidationResult {
  isValid: boolean
  messages: { id: string; message: string; type: string }[]
  blockedSubmit: boolean
}
