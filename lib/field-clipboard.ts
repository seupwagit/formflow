import { FormField } from './types'

/**
 * Gerenciador de clipboard para campos do formulário
 * Permite copiar, colar e duplicar campos
 */
export class FieldClipboard {
  private static instance: FieldClipboard
  private clipboard: FormField[] = []
  private copyCount: number = 0

  private constructor() {}

  static getInstance(): FieldClipboard {
    if (!FieldClipboard.instance) {
      FieldClipboard.instance = new FieldClipboard()
    }
    return FieldClipboard.instance
  }

  /**
   * Copia um ou mais campos para o clipboard
   */
  copy(fields: FormField | FormField[]): void {
    const fieldsArray = Array.isArray(fields) ? fields : [fields]
    
    // Fazer deep clone dos campos
    this.clipboard = fieldsArray.map(field => ({
      ...JSON.parse(JSON.stringify(field)),
      // Remover ID para evitar conflitos ao colar
      id: undefined as any
    }))
    
    this.copyCount++
    
    console.log(`📋 ${fieldsArray.length} campo(s) copiado(s) para o clipboard`)
    fieldsArray.forEach(field => {
      console.log(`   - ${field.label || field.name} (${field.type})`)
    })
  }

  /**
   * Cola os campos do clipboard
   */
  paste(
    currentPage: number = 0,
    offsetX: number = 20,
    offsetY: number = 20,
    existingFields: FormField[] = []
  ): FormField[] {
    if (this.clipboard.length === 0) {
      console.warn('⚠️ Clipboard vazio - nada para colar')
      return []
    }

    const pastedFields: FormField[] = []
    const timestamp = Date.now()

    this.clipboard.forEach((clipboardField, index) => {
      // Gerar novo ID único
      const newId = `field_${timestamp}_${index}_${Math.random().toString(36).substr(2, 6)}`
      
      // Gerar nome único
      const baseName = clipboardField.name.replace(/_copy_\d+$/, '') // Remove sufixos anteriores
      const newName = this.generateUniqueName(baseName, existingFields, pastedFields)
      
      // Calcular nova posição
      const newPosition = {
        ...clipboardField.position,
        x: clipboardField.position.x + offsetX,
        y: clipboardField.position.y + offsetY,
        page: currentPage
      }

      // Criar novo campo
      const newField: FormField = {
        ...clipboardField,
        id: newId,
        name: newName,
        label: `${clipboardField.label} (Cópia)`,
        position: newPosition
      }

      pastedFields.push(newField)
    })

    console.log(`📋 ${pastedFields.length} campo(s) colado(s) na página ${currentPage + 1}`)
    pastedFields.forEach(field => {
      console.log(`   + ${field.label} em (${field.position.x}, ${field.position.y})`)
    })

    return pastedFields
  }

  /**
   * Duplica um campo diretamente (sem usar clipboard)
   */
  duplicate(
    field: FormField,
    currentPage: number = 0,
    offsetX: number = 20,
    offsetY: number = 20,
    existingFields: FormField[] = []
  ): FormField {
    const timestamp = Date.now()
    const newId = `field_${timestamp}_${Math.random().toString(36).substr(2, 6)}`
    
    // Gerar nome único
    const baseName = field.name.replace(/_dup_\d+$/, '') // Remove sufixos anteriores
    const newName = this.generateUniqueName(baseName, existingFields, [], '_dup')
    
    // Calcular nova posição
    const newPosition = {
      ...field.position,
      x: field.position.x + offsetX,
      y: field.position.y + offsetY,
      page: currentPage
    }

    // Criar campo duplicado
    const duplicatedField: FormField = {
      ...JSON.parse(JSON.stringify(field)), // Deep clone
      id: newId,
      name: newName,
      label: `${field.label} (Duplicado)`,
      position: newPosition
    }

    console.log(`🔄 Campo duplicado: ${field.label} → ${duplicatedField.label}`)
    console.log(`   Posição: (${field.position.x}, ${field.position.y}) → (${newPosition.x}, ${newPosition.y})`)

    return duplicatedField
  }

  /**
   * Gera um nome único para o campo
   */
  private generateUniqueName(
    baseName: string,
    existingFields: FormField[],
    additionalFields: FormField[] = [],
    suffix: string = '_copy'
  ): string {
    const allFields = [...existingFields, ...additionalFields]
    const existingNames = allFields.map(f => f.name)
    
    let counter = 1
    let newName = `${baseName}${suffix}_${counter}`
    
    while (existingNames.includes(newName)) {
      counter++
      newName = `${baseName}${suffix}_${counter}`
    }
    
    return newName
  }

  /**
   * Verifica se há algo no clipboard
   */
  hasContent(): boolean {
    return this.clipboard.length > 0
  }

  /**
   * Obtém informações sobre o conteúdo do clipboard
   */
  getClipboardInfo(): {
    count: number
    fields: Array<{ label: string; type: string }>
    isEmpty: boolean
  } {
    return {
      count: this.clipboard.length,
      fields: this.clipboard.map(field => ({
        label: field.label || field.name,
        type: field.type
      })),
      isEmpty: this.clipboard.length === 0
    }
  }

  /**
   * Limpa o clipboard
   */
  clear(): void {
    const previousCount = this.clipboard.length
    this.clipboard = []
    
    if (previousCount > 0) {
      console.log(`🗑️ Clipboard limpo (${previousCount} campo(s) removido(s))`)
    }
  }

  /**
   * Copia múltiplos campos selecionados
   */
  copyMultiple(fields: FormField[]): void {
    if (fields.length === 0) {
      console.warn('⚠️ Nenhum campo selecionado para copiar')
      return
    }

    this.copy(fields)
    console.log(`📋 Múltipla seleção: ${fields.length} campo(s) copiado(s)`)
  }

  /**
   * Duplica múltiplos campos
   */
  duplicateMultiple(
    fields: FormField[],
    currentPage: number = 0,
    baseOffsetX: number = 20,
    baseOffsetY: number = 20,
    existingFields: FormField[] = []
  ): FormField[] {
    if (fields.length === 0) {
      console.warn('⚠️ Nenhum campo selecionado para duplicar')
      return []
    }

    const duplicatedFields: FormField[] = []
    
    fields.forEach((field, index) => {
      // Offset progressivo para evitar sobreposição
      const offsetX = baseOffsetX + (index * 10)
      const offsetY = baseOffsetY + (index * 10)
      
      const duplicated = this.duplicate(
        field,
        currentPage,
        offsetX,
        offsetY,
        [...existingFields, ...duplicatedFields]
      )
      
      duplicatedFields.push(duplicated)
    })

    console.log(`🔄 Múltipla duplicação: ${fields.length} campo(s) duplicado(s)`)
    return duplicatedFields
  }
}