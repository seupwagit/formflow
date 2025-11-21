/**
 * Sistema de backup automático das posições dos campos
 * Garante que as posições nunca sejam perdidas
 */

import { FormField } from './types'
import { supabase } from './supabase'

export interface PositionBackup {
  templateId: string
  templateName: string
  timestamp: string
  fieldPositions: Array<{
    id: string
    name: string
    label: string
    position: {
      x: number
      y: number
      width: number
      height: number
      page: number
    }
  }>
}

/**
 * Cria backup das posições dos campos
 */
export async function createPositionBackup(
  templateId: string,
  templateName: string,
  fields: FormField[]
): Promise<void> {
  try {
    const backup: PositionBackup = {
      templateId,
      templateName,
      timestamp: new Date().toISOString(),
      fieldPositions: fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.label,
        position: {
          x: field.position.x,
          y: field.position.y,
          width: field.position.width,
          height: field.position.height,
          page: field.position.page
        }
      }))
    }

    // Salvar no localStorage como backup local
    const backupKey = `position_backup_${templateId}`
    localStorage.setItem(backupKey, JSON.stringify(backup))

    // Salvar no Supabase como backup permanente
    await (supabase as any)
      .from('form_templates')
      .update({
        field_definitions: {
          backup_timestamp: backup.timestamp,
          field_positions: backup.fieldPositions
        }
      })
      .eq('id', templateId)

    console.log(`✅ Backup de posições criado para template ${templateName}`)
    
  } catch (error) {
    console.error('❌ Erro ao criar backup de posições:', error)
  }
}

/**
 * Restaura posições dos campos a partir do backup
 */
export async function restorePositionBackup(templateId: string): Promise<FormField[] | null> {
  try {
    // Primeiro tentar carregar do Supabase
    const { data, error } = await supabase
      .from('form_templates')
      .select('field_definitions, fields')
      .eq('id', templateId)
      .single()

    if (!error && (data as any)?.field_definitions?.field_positions) {
      console.log('✅ Posições restauradas do Supabase')
      return (data as any).field_definitions.field_positions
    }

    // Fallback: tentar carregar do localStorage
    const backupKey = `position_backup_${templateId}`
    const localBackup = localStorage.getItem(backupKey)
    
    if (localBackup) {
      const backup: PositionBackup = JSON.parse(localBackup)
      console.log('✅ Posições restauradas do localStorage')
      return backup.fieldPositions as FormField[]
    }

    return null
    
  } catch (error) {
    console.error('❌ Erro ao restaurar backup de posições:', error)
    return null
  }
}

/**
 * Valida se as posições dos campos estão íntegras
 */
export function validateFieldPositions(fields: FormField[]): boolean {
  return fields.every(field => {
    const pos = field.position
    return (
      typeof pos.x === 'number' &&
      typeof pos.y === 'number' &&
      typeof pos.width === 'number' &&
      typeof pos.height === 'number' &&
      typeof pos.page === 'number' &&
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.width > 0 &&
      pos.height > 0 &&
      pos.page >= 0
    )
  })
}

/**
 * Força salvamento das posições no Supabase
 */
export async function forceSavePositions(
  templateId: string,
  fields: FormField[]
): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('form_templates')
      .update({
        fields: fields,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)

    if (error) {
      console.error('❌ Erro ao forçar salvamento:', error)
      return false
    }

    console.log('✅ Posições salvas com sucesso no Supabase')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao forçar salvamento:', error)
    return false
  }
}