/**
 * Gerador de IDs únicos para campos
 * Resolve o problema de campos duplicados com mesmo label
 */

import { FormField } from './types'
import { sanitizeFieldName } from './field-name-utils'

/**
 * 🔒 Gera ID único CONSISTENTE para um campo
 * IDs são baseados em label + posição, SEM timestamp para evitar mudanças
 */
export function generateUniqueFieldId(
  label: string, 
  existingFields: FormField[], 
  position: { x: number; y: number; page: number },
  index?: number
): string {
  // Sanitizar o label base
  const baseName = sanitizeFieldName(label)
  
  // Criar ID base simples: nome_pagina_x_y
  const baseId = `${baseName}_p${position.page}_x${Math.round(position.x)}_y${Math.round(position.y)}`
  
  // Se não existe, usar o ID base
  if (!existingFields.some(field => field.id === baseId)) {
    return baseId
  }
  
  // Se existe, adicionar contador numérico simples
  let counter = 1
  let uniqueId = `${baseId}_${counter}`
  
  while (existingFields.some(field => field.id === uniqueId)) {
    counter++
    uniqueId = `${baseId}_${counter}`
  }
  
  return uniqueId
}

/**
 * 🔒 Gera nome único SIMPLES para banco de dados
 * Quando labels são iguais, adiciona _01, _02, _03, etc.
 */
export function generateUniqueFieldName(
  label: string, 
  existingFields: FormField[], 
  position: { x: number; y: number; page: number },
  index?: number
): string {
  const baseName = sanitizeFieldName(label)
  
  // Verificar quantos campos com o mesmo nome base já existem
  const sameNameFields = existingFields.filter(field => 
    field.name === baseName || field.name.match(new RegExp(`^${baseName}_\\d+$`))
  )
  
  // Se é o primeiro, usar nome base
  if (sameNameFields.length === 0) {
    return baseName
  }
  
  // Se já existem, adicionar sufixo numérico simples: _01, _02, _03
  let counter = 1
  let uniqueName = `${baseName}_${counter.toString().padStart(2, '0')}`
  
  while (existingFields.some(field => field.name === uniqueName)) {
    counter++
    uniqueName = `${baseName}_${counter.toString().padStart(2, '0')}`
  }
  
  return uniqueName
}

/**
 * 🔒 CRÍTICO: Corrige IDs duplicados mantendo TODOS os campos
 * Campos com mesmo label mas posições diferentes são VÁLIDOS (ex: tabelas)
 */
export function fixDuplicateFields(fields: FormField[]): FormField[] {
  console.log(`🔍 Corrigindo IDs duplicados em ${fields.length} campos...`)
  
  // Detectar IDs duplicados
  const idMap = new Map<string, FormField[]>()
  
  fields.forEach(field => {
    if (!idMap.has(field.id)) {
      idMap.set(field.id, [])
    }
    idMap.get(field.id)!.push(field)
  })
  
  // Encontrar IDs duplicados
  const duplicateIds = Array.from(idMap.entries()).filter(([_, fields]) => fields.length > 1)
  
  if (duplicateIds.length === 0) {
    console.log(`   ✅ Nenhum ID duplicado encontrado`)
    return fields
  }
  
  console.log(`   🔴 ${duplicateIds.length} IDs duplicados encontrados`)
  
  // Corrigir IDs duplicados
  const correctedFields = [...fields]
  let correctionCount = 0
  
  duplicateIds.forEach(([duplicateId, duplicateFields]) => {
    console.log(`   🔧 Corrigindo ID duplicado: "${duplicateId}" (${duplicateFields.length} campos)`)
    
    // Manter o primeiro, corrigir os outros
    duplicateFields.slice(1).forEach((field, idx) => {
      const fieldIndex = correctedFields.findIndex(f => f === field)
      if (fieldIndex !== -1) {
        // Gerar novo ID único
        const newId = generateUniqueFieldId(
          field.label,
          correctedFields,
          field.position,
          idx + 1
        )
        
        correctedFields[fieldIndex] = {
          ...field,
          id: newId
        }
        
        console.log(`      ✅ "${duplicateId}" → "${newId}"`)
        correctionCount++
      }
    })
  })
  
  console.log(`✅ Correção concluída: ${correctionCount} IDs corrigidos`)
  
  return correctedFields
}

/**
 * Detecta campos duplicados
 */
export function detectDuplicateFields(fields: FormField[]): {
  duplicateIds: string[]
  duplicateNames: string[]
  duplicateGroups: Array<{ id: string; count: number; fields: FormField[] }>
} {
  const idCounts = new Map<string, FormField[]>()
  const nameCounts = new Map<string, FormField[]>()
  
  // Contar ocorrências de IDs e nomes
  fields.forEach(field => {
    // IDs
    if (!idCounts.has(field.id)) {
      idCounts.set(field.id, [])
    }
    idCounts.get(field.id)!.push(field)
    
    // Nomes
    if (!nameCounts.has(field.name)) {
      nameCounts.set(field.name, [])
    }
    nameCounts.get(field.name)!.push(field)
  })
  
  // Encontrar duplicatas
  const duplicateIds = Array.from(idCounts.entries())
    .filter(([_, fields]) => fields.length > 1)
    .map(([id, _]) => id)
  
  const duplicateNames = Array.from(nameCounts.entries())
    .filter(([_, fields]) => fields.length > 1)
    .map(([name, _]) => name)
  
  const duplicateGroups = Array.from(idCounts.entries())
    .filter(([_, fields]) => fields.length > 1)
    .map(([id, fields]) => ({ id, count: fields.length, fields }))
  
  return { duplicateIds, duplicateNames, duplicateGroups }
}