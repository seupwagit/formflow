/**
 * Utilitários para validação e sanitização de nomes de campos PostgreSQL
 */

// Palavras reservadas do PostgreSQL que não podem ser usadas como nomes de campos
const POSTGRES_RESERVED_WORDS = [
  'all', 'analyse', 'analyze', 'and', 'any', 'array', 'as', 'asc', 'asymmetric',
  'authorization', 'binary', 'both', 'case', 'cast', 'check', 'collate', 'collation',
  'column', 'concurrently', 'constraint', 'create', 'cross', 'current_catalog',
  'current_date', 'current_role', 'current_schema', 'current_time', 'current_timestamp',
  'current_user', 'default', 'deferrable', 'desc', 'distinct', 'do', 'else', 'end',
  'except', 'false', 'fetch', 'for', 'foreign', 'freeze', 'from', 'full', 'grant',
  'group', 'having', 'ilike', 'in', 'initially', 'inner', 'intersect', 'into', 'is',
  'isnull', 'join', 'lateral', 'leading', 'left', 'like', 'limit', 'localtime',
  'localtimestamp', 'natural', 'not', 'notnull', 'null', 'offset', 'on', 'only',
  'or', 'order', 'outer', 'overlaps', 'placing', 'primary', 'references', 'returning',
  'right', 'select', 'session_user', 'similar', 'some', 'symmetric', 'table',
  'tablesample', 'then', 'to', 'trailing', 'true', 'union', 'unique', 'user',
  'using', 'variadic', 'verbose', 'when', 'where', 'window', 'with'
]

/**
 * Sanitiza um nome de campo para ser compatível com PostgreSQL
 */
export function sanitizeFieldName(input: string): string {
  if (!input) return ''
  
  // Converter para minúsculas
  let sanitized = input.toLowerCase()
  
  // Remover acentos e caracteres especiais
  sanitized = sanitized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9_]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_+|_+$/g, '') // Remove underscores do início e fim
  
  // Garantir que não comece com número
  if (/^[0-9]/.test(sanitized)) {
    sanitized = 'field_' + sanitized
  }
  
  // Garantir que não seja vazio
  if (!sanitized) {
    sanitized = 'field_1'
  }
  
  // Verificar se é palavra reservada
  if (POSTGRES_RESERVED_WORDS.includes(sanitized)) {
    sanitized = sanitized + '_field'
  }
  
  // Limitar tamanho (PostgreSQL permite até 63 caracteres)
  if (sanitized.length > 63) {
    sanitized = sanitized.substring(0, 60) + '_' + Math.random().toString(36).substr(2, 2)
  }
  
  return sanitized
}

/**
 * Valida se um nome de campo é válido para PostgreSQL
 */
export function validateFieldName(name: string): {
  isValid: boolean
  errors: string[]
  suggestions: string[]
} {
  const errors: string[] = []
  const suggestions: string[] = []
  
  if (!name) {
    errors.push('Nome do campo é obrigatório')
    return { isValid: false, errors, suggestions }
  }
  
  // Verificar se começa com número
  if (/^[0-9]/.test(name)) {
    errors.push('Nome não pode começar com número')
    suggestions.push('Adicione uma letra no início (ex: field_' + name + ')')
  }
  
  // Verificar caracteres inválidos
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    errors.push('Nome deve conter apenas letras, números e underscore')
    suggestions.push('Use apenas a-z, 0-9 e _ (underscore)')
  }
  
  // Verificar se é palavra reservada
  if (POSTGRES_RESERVED_WORDS.includes(name.toLowerCase())) {
    errors.push('Nome é uma palavra reservada do PostgreSQL')
    suggestions.push('Adicione um sufixo (ex: ' + name + '_field)')
  }
  
  // Verificar tamanho
  if (name.length > 63) {
    errors.push('Nome muito longo (máximo 63 caracteres)')
    suggestions.push('Encurte o nome para menos de 63 caracteres')
  }
  
  // Verificar se tem espaços
  if (name.includes(' ')) {
    errors.push('Nome não pode conter espaços')
    suggestions.push('Substitua espaços por underscore (_)')
  }
  
  // Verificar se tem acentos
  if (name !== name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
    errors.push('Nome não pode conter acentos')
    suggestions.push('Remova acentos (ex: ação → acao)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  }
}

/**
 * Gera um nome de campo único baseado em um label
 */
export function generateFieldName(label: string, existingNames: string[] = []): string {
  let baseName = sanitizeFieldName(label)
  let finalName = baseName
  let counter = 1
  
  // Garantir unicidade
  while (existingNames.includes(finalName)) {
    finalName = `${baseName}_${counter}`
    counter++
  }
  
  return finalName
}

/**
 * Verifica se um nome de campo já existe
 */
export function isFieldNameUnique(name: string, existingNames: string[], currentFieldId?: string, fields?: any[]): boolean {
  // Se estamos editando um campo existente, ignorar seu próprio nome
  if (currentFieldId && fields) {
    const currentField = fields.find(f => f.id === currentFieldId)
    if (currentField && currentField.name === name) {
      return true
    }
  }
  
  return !existingNames.includes(name.toLowerCase())
}

/**
 * Formata um nome de campo para exibição
 */
export function formatFieldNameForDisplay(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Converte um label em um nome de campo sugerido
 */
export function labelToFieldName(label: string): string {
  return sanitizeFieldName(label)
}