// Tipos para o sistema de validação condicional

export type ComparisonOperator = 
  | 'equals' // Igual a
  | 'not_equals' // Diferente de
  | 'greater_than' // Maior que
  | 'less_than' // Menor que
  | 'greater_or_equal' // Maior ou igual a
  | 'less_or_equal' // Menor ou igual a
  | 'contains' // Contém
  | 'not_contains' // Não contém
  | 'starts_with' // Começa com
  | 'ends_with' // Termina com
  | 'is_empty' // Está vazio
  | 'is_not_empty' // Não está vazio

export type LogicalOperator = 'AND' | 'OR'

export type ActionType = 
  | 'show_message' // Mostrar mensagem
  | 'block_submit' // Bloquear envio
  | 'set_field_value' // Definir valor de campo
  | 'clear_field' // Limpar campo
  | 'show_field' // Mostrar campo
  | 'hide_field' // Esconder campo
  | 'make_required' // Tornar obrigatório
  | 'make_optional' // Tornar opcional
  | 'disable_field' // Desabilitar campo
  | 'enable_field' // Habilitar campo
  | 'change_color' // Mudar cor do campo

export interface ValidationCondition {
  id: string
  fieldName: string // Campo a ser verificado
  operator: ComparisonOperator
  value: any // Valor de comparação
  compareWithField?: string // Opcional: comparar com outro campo
}

export interface ValidationRule {
  id: string
  name: string // Nome descritivo da regra
  description?: string
  enabled: boolean
  
  // Condições (IF)
  conditions: ValidationCondition[]
  logicalOperator: LogicalOperator // Como combinar as condições
  
  // Ações quando verdadeiro (THEN)
  actionsTrue: ValidationAction[]
  
  // Ações quando falso (ELSE) - opcional
  actionsFalse?: ValidationAction[]
  
  // Tipo de execução (eventos)
  executionType: 
    | 'on_change'      // Quando campo muda
    | 'on_blur'        // Ao sair do campo
    | 'on_focus'       // Ao entrar no campo
    | 'on_submit'      // Ao tentar enviar
    | 'on_save'        // Ao salvar rascunho
    | 'on_load'        // Ao carregar formulário
    | 'on_print'       // Ao imprimir
    | 'continuous'     // Continuamente (tempo real)
  
  // Prioridade (regras com maior prioridade executam primeiro)
  priority: number
}

export interface ValidationAction {
  id: string
  type: ActionType
  targetField?: string // Campo alvo da ação
  value?: any // Valor para ações que precisam (ex: set_field_value)
  message?: string // Mensagem para show_message
  messageType?: 'info' | 'warning' | 'error' | 'success'
  color?: string // Cor para change_color (ex: '#FF0000', 'red', 'bg-red-500')
}

// Exemplos de regras pré-definidas
export const VALIDATION_RULE_EXAMPLES: Partial<ValidationRule>[] = [
  {
    name: 'Validar Temperatura Mínima',
    description: 'Se temperatura for menor que 0, mostrar aviso e bloquear envio',
    conditions: [
      {
        id: '1',
        fieldName: 'temperatura',
        operator: 'less_than',
        value: 0
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'show_message',
        message: 'Temperatura não pode ser menor que 0°C',
        messageType: 'error'
      },
      {
        id: '2',
        type: 'block_submit'
      }
    ],
    executionType: 'on_change'
  },
  {
    name: 'Comparar Dois Campos',
    description: 'Se valor_final for menor que valor_inicial, mostrar erro',
    conditions: [
      {
        id: '1',
        fieldName: 'valor_final',
        operator: 'less_than',
        value: null,
        compareWithField: 'valor_inicial'
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'show_message',
        message: 'Valor final não pode ser menor que valor inicial',
        messageType: 'error'
      }
    ],
    executionType: 'on_change'
  },
  {
    name: 'Campo Obrigatório Condicional',
    description: 'Se tipo_inspecao = "completa", tornar observacoes obrigatório',
    conditions: [
      {
        id: '1',
        fieldName: 'tipo_inspecao',
        operator: 'equals',
        value: 'completa'
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'make_required',
        targetField: 'observacoes'
      },
      {
        id: '2',
        type: 'show_field',
        targetField: 'observacoes'
      }
    ],
    actionsFalse: [
      {
        id: '1',
        type: 'make_optional',
        targetField: 'observacoes'
      },
      {
        id: '2',
        type: 'hide_field',
        targetField: 'observacoes'
      }
    ],
    executionType: 'on_change'
  },
  {
    name: 'Validação Múltipla (AND)',
    description: 'Se pressao > 100 E temperatura > 80, mostrar alerta crítico',
    conditions: [
      {
        id: '1',
        fieldName: 'pressao',
        operator: 'greater_than',
        value: 100
      },
      {
        id: '2',
        fieldName: 'temperatura',
        operator: 'greater_than',
        value: 80
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'show_message',
        message: '⚠️ ALERTA CRÍTICO: Pressão e temperatura acima dos limites!',
        messageType: 'error'
      },
      {
        id: '2',
        type: 'block_submit'
      }
    ],
    executionType: 'continuous'
  },
  {
    name: 'Auto-preenchimento',
    description: 'Se status = "aprovado", preencher data_aprovacao automaticamente',
    conditions: [
      {
        id: '1',
        fieldName: 'status',
        operator: 'equals',
        value: 'aprovado'
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'set_field_value',
        targetField: 'data_aprovacao',
        value: '{{TODAY}}' // Valor especial para data atual
      }
    ],
    executionType: 'on_change'
  },
  {
    name: 'Destacar Campo com Erro',
    description: 'Se temperatura for crítica, destacar campo em vermelho',
    conditions: [
      {
        id: '1',
        fieldName: 'temperatura',
        operator: 'greater_than',
        value: 100
      }
    ],
    logicalOperator: 'AND',
    actionsTrue: [
      {
        id: '1',
        type: 'change_color',
        targetField: 'temperatura',
        color: '#EF4444' // Vermelho
      },
      {
        id: '2',
        type: 'show_message',
        message: '⚠️ Temperatura crítica!',
        messageType: 'error'
      }
    ],
    actionsFalse: [
      {
        id: '1',
        type: 'change_color',
        targetField: 'temperatura',
        color: '#10B981' // Verde (normal)
      }
    ],
    executionType: 'on_change'
  }
]
