import { FormField } from './types'

/**
 * Utilitários para trabalhar com campos de formulário
 */

/**
 * Garante que um campo tenha uma estrutura position válida
 */
export function ensureValidPosition(field: FormField, index: number = 0): FormField {
  return {
    ...field,
    position: {
      x: field.position?.x ?? 100 + (index * 50),
      y: field.position?.y ?? 100 + (index * 40),
      width: field.position?.width ?? 200,
      height: field.position?.height ?? 30,
      page: field.position?.page ?? 0
    }
  }
}

/**
 * Normaliza um array de campos garantindo que todos tenham estrutura válida
 */
export function normalizeFields(fields: FormField[]): FormField[] {
  return fields.map((field, index) => ensureValidPosition(field, index))
}

/**
 * Filtra campos por página de forma segura
 */
export function getFieldsByPage(fields: FormField[], page: number): FormField[] {
  return fields.filter(field => {
    // Verificar se o campo tem position válida
    if (!field.position) return false
    
    // Verificar se page está definida
    const fieldPage = field.position.page
    if (fieldPage === undefined || fieldPage === null) return false
    
    return fieldPage === page
  })
}

/**
 * Conta campos por página
 */
export function countFieldsByPage(fields: FormField[], totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, i) => 
    getFieldsByPage(fields, i).length
  )
}

/**
 * Valida se um campo tem estrutura mínima necessária
 */
export function isValidField(field: any): field is FormField {
  return (
    field &&
    typeof field === 'object' &&
    typeof field.id === 'string' &&
    typeof field.name === 'string' &&
    typeof field.type === 'string' &&
    typeof field.label === 'string'
  )
}

/**
 * Converte campos do formato do banco para o formato do designer
 */
export function convertFieldsFromDatabase(dbFields: any): FormField[] {
  if (!dbFields) return []
  
  let fields: FormField[] = []
  
  // Se fields é um objeto (formato antigo do banco)
  if (typeof dbFields === 'object' && !Array.isArray(dbFields)) {
    fields = Object.entries(dbFields).map(([fieldName, fieldConfig]: [string, any], index) => ({
      id: fieldConfig.id || `field_${index}`,
      name: fieldName,
      type: fieldConfig.type || 'text',
      label: fieldConfig.label || fieldName,
      required: fieldConfig.required || false,
      position: {
        x: fieldConfig.position?.x || 100 + (index * 50),
        y: fieldConfig.position?.y || 100 + (index * 40),
        width: fieldConfig.position?.width || 200,
        height: fieldConfig.position?.height || 30,
        page: fieldConfig.position?.page || 0
      },
      options: fieldConfig.options,
      validation: fieldConfig.validation
    }))
  }
  // Se fields é um array (formato novo ou de detecção OCR)
  else if (Array.isArray(dbFields)) {
    fields = dbFields.map((field, index) => {
      // Verificar se é formato de detecção OCR (tem 'id' mas não 'name')
      if (field.id && !field.name) {
        return {
          id: field.id,
          name: field.id, // Usar o ID como nome do campo no banco
          type: field.type || 'text',
          label: field.label || field.id,
          required: field.required || false,
          position: {
            x: field.x || field.position?.x || 100 + (index * 50),
            y: field.y || field.position?.y || 100 + (index * 40),
            width: field.width || field.position?.width || 200,
            height: field.height || field.position?.height || 30,
            page: field.page || field.position?.page || 0
          },
          options: field.options,
          validation: field.validation
        }
      }
      // Formato padrão
      return ensureValidPosition(field, index)
    }).filter(isValidField)
  }
  
  // Corrigir nomes inválidos e marcar como auto-detectados
  const correctedFields = fixInvalidFieldNames(fields)
  return normalizeFields(correctedFields)
}/**
 * Co
nverte campos do formato de detecção OCR para o formato do designer
 */
export function convertFieldsFromDetection(detectedFields: any[]): FormField[] {
  if (!Array.isArray(detectedFields)) return []
  
  console.log('🔄 Convertendo campos detectados:', detectedFields)
  
  const convertedFields = detectedFields.map((field, index) => {
    console.log(`📝 Campo ${index}:`, field)
    
    // FORÇAR o uso do ID como name, ignorando qualquer name existente
    const correctName = field.id || `field_${index}`
    
    const formField: FormField = {
      id: correctName,
      name: correctName, // SEMPRE usar o ID como nome do campo no banco
      type: field.type || 'text',
      label: field.label || correctName || `Campo ${index + 1}`,
      required: field.required || false,
      position: {
        x: field.x || 100 + (index * 50),
        y: field.y || 100 + (index * 40),
        width: field.width || 200,
        height: field.height || 30,
        page: field.page || 0
      },
      options: field.options,
      validation: field.validation,
      placeholder: field.placeholder,
      helpText: field.helpText,
      dynamicConfig: field.dynamicConfig
    }
    
    // Marcar como campo detectado automaticamente (não editável)
    ;(formField as any).isAutoDetected = true
    
    console.log(`✅ Campo convertido - ID: ${field.id} → NAME: ${formField.name}`)
    return formField
  }).filter(field => field.name && field.label)
  
  console.log('🎯 Campos finais:', convertedFields)
  return convertedFields
}

/**
 * Converte campos do formato do designer para o formato do banco
 */
export function convertFieldsToDatabase(fields: FormField[]): any {
  const fieldsObject: any = {}
  
  fields.forEach(field => {
    fieldsObject[field.name] = {
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,
      position: field.position,
      options: field.options,
      validation: field.validation,
      placeholder: field.placeholder,
      helpText: field.helpText,
      dynamicConfig: field.dynamicConfig
    }
  })
  
  return fieldsObject
}/**

 * Marca campos existentes como auto-detectados se eles têm nomes válidos
 */
export function markFieldsAsAutoDetected(fields: FormField[]): FormField[] {
  return fields.map(field => {
    // Se o campo tem um nome que parece ter sido gerado automaticamente
    // (sem caracteres especiais, números no início, etc.)
    const hasValidName = /^[a-z_][a-z0-9_]*$/i.test(field.name)
    
    if (hasValidName) {
      ;(field as any).isAutoDetected = true
    }
    
    return field
  })
}

/**
 * Corrige nomes de campos que estão inválidos - APLICAÇÃO IMEDIATA
 */
export function fixInvalidFieldNames(fields: FormField[]): FormField[] {
  const { sanitizeFieldName, generateFieldName } = require('./field-name-utils')
  const existingNames: string[] = []
  
  return fields.map(field => {
    let correctedName = field.name
    
    // Casos específicos que vemos no sistema:
    if (field.name.startsWith('field_02_ddd_telefone')) {
      correctedName = 'ddd_telefone'
    } else if (field.name.startsWith('field_01_razao_social')) {
      correctedName = 'razao_social_nome'
    } else if (field.name.startsWith('field_03_fpas')) {
      correctedName = 'fpas'
    } else if (field.name.startsWith('field_04_simples')) {
      correctedName = 'simples'
    } else if (field.name.startsWith('field_05_remuneracao')) {
      correctedName = 'remuneracao'
    } else if (field.name.startsWith('field_06_qtde_trabalhadores')) {
      correctedName = 'qtde_trabalhadores'
    } else if (field.name.startsWith('field_07_aliquota_fgts')) {
      correctedName = 'aliquota_fgts'
    } else if (field.name.startsWith('field_08_cod_recolhimento')) {
      correctedName = 'cod_recolhimento'
    } else if (field.name.startsWith('field_09_id_recolhimento')) {
      correctedName = 'id_recolhimento'
    } else if (field.name.startsWith('field_10_inscricao_tipo')) {
      correctedName = 'inscricao_tipo'
    } else if (field.name.startsWith('field_11_competencia')) {
      correctedName = 'competencia'
    } else if (field.name.startsWith('field_12_data_de_validade')) {
      correctedName = 'data_de_validade'
    } else if (field.name.startsWith('field_13_deposito_contribuicao_social')) {
      correctedName = 'deposito_contribuicao_social'
    } else if (field.name.startsWith('field_14_encargos')) {
      correctedName = 'encargos'
    } else if (field.name.startsWith('field_15_total_a_recolher')) {
      correctedName = 'total_a_recolher'
    }
    // Se ainda está inválido, sanitizar
    else if (!/^[a-z_][a-z0-9_]*$/i.test(field.name)) {
      const sanitized = sanitizeFieldName(field.name)
      correctedName = generateFieldName(sanitized, existingNames)
    }
    
    // Garantir unicidade
    if (existingNames.includes(correctedName.toLowerCase())) {
      let counter = 2
      let uniqueName = `${correctedName}_${counter}`
      while (existingNames.includes(uniqueName.toLowerCase())) {
        counter++
        uniqueName = `${correctedName}_${counter}`
      }
      correctedName = uniqueName
    }
    
    existingNames.push(correctedName.toLowerCase())
    
    return {
      ...field,
      name: correctedName
    }
  })
}/**

 * Força a correção de TODOS os campos para usar o ID correto como name
 * Esta função corrige campos que já estão carregados no sistema
 */
export function forceCorrectFieldNames(fields: FormField[]): FormField[] {
  return fields.map(field => {
    let correctedField = { ...field }
    
    // Casos específicos baseados no label para garantir correção
    if (field.label === '02-DDD/TELEFONE') {
      correctedField.id = 'ddd_telefone'
      correctedField.name = 'ddd_telefone'
    } else if (field.label === '01-RAZAO SOCIAL/NOME') {
      correctedField.id = 'razao_social_nome'
      correctedField.name = 'razao_social_nome'
    } else if (field.label === '03-FPAS') {
      correctedField.id = 'fpas'
      correctedField.name = 'fpas'
    } else if (field.label === '04-SIMPLES') {
      correctedField.id = 'simples'
      correctedField.name = 'simples'
    } else if (field.label === '05-REMUNERACAO') {
      correctedField.id = 'remuneracao'
      correctedField.name = 'remuneracao'
    } else if (field.label === '06-QTDE TRABALHADORES') {
      correctedField.id = 'qtde_trabalhadores'
      correctedField.name = 'qtde_trabalhadores'
    } else if (field.label === '07-ALIQUOTA FGTS') {
      correctedField.id = 'aliquota_fgts'
      correctedField.name = 'aliquota_fgts'
    } else if (field.label === '08-COD RECOLHIMENTO') {
      correctedField.id = 'cod_recolhimento'
      correctedField.name = 'cod_recolhimento'
    } else if (field.label === '09-ID RECOLHIMENTO') {
      correctedField.id = 'id_recolhimento'
      correctedField.name = 'id_recolhimento'
    } else if (field.label === '10-INSCRICAO/TIPO (8)') {
      correctedField.id = 'inscricao_tipo'
      correctedField.name = 'inscricao_tipo'
    } else if (field.label === '11-COMPETENCIA') {
      correctedField.id = 'competencia'
      correctedField.name = 'competencia'
    } else if (field.label === '12-DATA DE VALIDADE') {
      correctedField.id = 'data_validade'
      correctedField.name = 'data_validade'
    } else if (field.label === '13-DEPOSITO + CONTRIB SOCIAL') {
      correctedField.id = 'deposito_contribuicao_social'
      correctedField.name = 'deposito_contribuicao_social'
    } else if (field.label === '14-ENCARGOS') {
      correctedField.id = 'encargos'
      correctedField.name = 'encargos'
    } else if (field.label === '15-TOTAL A RECOLHER') {
      correctedField.id = 'total_a_recolher'
      correctedField.name = 'total_a_recolher'
    }
    // Se o campo tem um ID válido diferente do name, usar o ID
    else if (field.id && field.id !== field.name) {
      correctedField.name = field.id
    }
    // Se não tem ID, mas tem name, usar o name como ID também
    else if (!field.id && field.name) {
      correctedField.id = field.name
    }
    
    if (correctedField.name !== field.name || correctedField.id !== field.id) {
      console.log(`🔧 Corrigindo campo: "${field.name}" → "${correctedField.name}" (ID: ${correctedField.id})`)
    }
    
    return correctedField
  })
}