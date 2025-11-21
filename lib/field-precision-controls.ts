import { FormField } from './types'

/**
 * Sistema de controles de precisão para campos
 * Permite ajuste fino de posição e dimensões usando teclado
 */
export class FieldPrecisionControls {
  private static instance: FieldPrecisionControls
  
  // Configurações de precisão
  private readonly POSITION_STEP = 1 // pixels por movimento
  private readonly SIZE_STEP = 1 // pixels por redimensionamento
  private readonly FAST_STEP = 10 // movimento rápido (com Alt)

  private constructor() {}

  static getInstance(): FieldPrecisionControls {
    if (!FieldPrecisionControls.instance) {
      FieldPrecisionControls.instance = new FieldPrecisionControls()
    }
    return FieldPrecisionControls.instance
  }

  /**
   * Ajusta a posição de um campo usando as setas do teclado
   */
  adjustPosition(
    field: FormField,
    direction: 'up' | 'down' | 'left' | 'right',
    isFastMode: boolean = false
  ): FormField {
    const step = isFastMode ? this.FAST_STEP : this.POSITION_STEP
    const newField = { ...field }

    switch (direction) {
      case 'up':
        newField.position = {
          ...field.position,
          y: Math.max(0, field.position.y - step)
        }
        break
      case 'down':
        newField.position = {
          ...field.position,
          y: field.position.y + step
        }
        break
      case 'left':
        newField.position = {
          ...field.position,
          x: Math.max(0, field.position.x - step)
        }
        break
      case 'right':
        newField.position = {
          ...field.position,
          x: field.position.x + step
        }
        break
    }

    console.log(`📐 Posição ajustada: ${field.label} → (${newField.position.x}, ${newField.position.y})`)
    return newField
  }

  /**
   * Ajusta o tamanho de um campo usando as setas do teclado
   */
  adjustSize(
    field: FormField,
    direction: 'up' | 'down' | 'left' | 'right',
    isFastMode: boolean = false
  ): FormField {
    const step = isFastMode ? this.FAST_STEP : this.SIZE_STEP
    const newField = { ...field }

    // Tamanhos mínimos
    const MIN_WIDTH = 50
    const MIN_HEIGHT = 20

    switch (direction) {
      case 'up':
        // Diminuir altura
        newField.position = {
          ...field.position,
          height: Math.max(MIN_HEIGHT, field.position.height - step)
        }
        break
      case 'down':
        // Aumentar altura
        newField.position = {
          ...field.position,
          height: field.position.height + step
        }
        break
      case 'left':
        // Diminuir largura
        newField.position = {
          ...field.position,
          width: Math.max(MIN_WIDTH, field.position.width - step)
        }
        break
      case 'right':
        // Aumentar largura
        newField.position = {
          ...field.position,
          width: field.position.width + step
        }
        break
    }

    console.log(`📏 Tamanho ajustado: ${field.label} → ${newField.position.width}×${newField.position.height}`)
    return newField
  }

  /**
   * Ajusta múltiplos campos simultaneamente
   */
  adjustMultipleFields(
    fields: FormField[],
    operation: 'position' | 'size',
    direction: 'up' | 'down' | 'left' | 'right',
    isFastMode: boolean = false
  ): FormField[] {
    return fields.map(field => {
      if (operation === 'position') {
        return this.adjustPosition(field, direction, isFastMode)
      } else {
        return this.adjustSize(field, direction, isFastMode)
      }
    })
  }

  /**
   * Alinha campos selecionados
   */
  alignFields(
    fields: FormField[],
    alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
  ): FormField[] {
    if (fields.length < 2) return fields

    const alignedFields = [...fields]

    switch (alignment) {
      case 'left': {
        const leftMost = Math.min(...fields.map(f => f.position.x))
        alignedFields.forEach(field => {
          field.position.x = leftMost
        })
        break
      }
      case 'right': {
        const rightMost = Math.max(...fields.map(f => f.position.x + f.position.width))
        alignedFields.forEach(field => {
          field.position.x = rightMost - field.position.width
        })
        break
      }
      case 'top': {
        const topMost = Math.min(...fields.map(f => f.position.y))
        alignedFields.forEach(field => {
          field.position.y = topMost
        })
        break
      }
      case 'bottom': {
        const bottomMost = Math.max(...fields.map(f => f.position.y + f.position.height))
        alignedFields.forEach(field => {
          field.position.y = bottomMost - field.position.height
        })
        break
      }
      case 'center-horizontal': {
        const centerX = fields.reduce((sum, f) => sum + f.position.x + f.position.width / 2, 0) / fields.length
        alignedFields.forEach(field => {
          field.position.x = centerX - field.position.width / 2
        })
        break
      }
      case 'center-vertical': {
        const centerY = fields.reduce((sum, f) => sum + f.position.y + f.position.height / 2, 0) / fields.length
        alignedFields.forEach(field => {
          field.position.y = centerY - field.position.height / 2
        })
        break
      }
    }

    console.log(`🎯 ${fields.length} campo(s) alinhado(s): ${alignment}`)
    return alignedFields
  }

  /**
   * Distribui campos uniformemente
   */
  distributeFields(
    fields: FormField[],
    direction: 'horizontal' | 'vertical'
  ): FormField[] {
    if (fields.length < 3) return fields

    const sortedFields = [...fields].sort((a, b) => {
      if (direction === 'horizontal') {
        return a.position.x - b.position.x
      } else {
        return a.position.y - b.position.y
      }
    })

    const first = sortedFields[0]
    const last = sortedFields[sortedFields.length - 1]

    if (direction === 'horizontal') {
      const totalWidth = (last.position.x + last.position.width) - first.position.x
      const availableSpace = totalWidth - sortedFields.reduce((sum, f) => sum + f.position.width, 0)
      const spacing = availableSpace / (sortedFields.length - 1)

      let currentX = first.position.x
      sortedFields.forEach((field, index) => {
        if (index > 0) {
          field.position.x = currentX
        }
        currentX += field.position.width + spacing
      })
    } else {
      const totalHeight = (last.position.y + last.position.height) - first.position.y
      const availableSpace = totalHeight - sortedFields.reduce((sum, f) => sum + f.position.height, 0)
      const spacing = availableSpace / (sortedFields.length - 1)

      let currentY = first.position.y
      sortedFields.forEach((field, index) => {
        if (index > 0) {
          field.position.y = currentY
        }
        currentY += field.position.height + spacing
      })
    }

    console.log(`📐 ${fields.length} campo(s) distribuído(s): ${direction}`)
    return sortedFields
  }

  /**
   * Redimensiona campos para o mesmo tamanho
   */
  uniformSize(
    fields: FormField[],
    dimension: 'width' | 'height' | 'both',
    referenceField?: FormField
  ): FormField[] {
    if (fields.length < 2) return fields

    const reference = referenceField || fields[0]
    const targetWidth = reference.position.width
    const targetHeight = reference.position.height

    return fields.map(field => ({
      ...field,
      position: {
        ...field.position,
        width: dimension === 'height' ? field.position.width : targetWidth,
        height: dimension === 'width' ? field.position.height : targetHeight
      }
    }))
  }

  /**
   * Calcula estatísticas de posicionamento
   */
  getPositionStats(fields: FormField[]): {
    bounds: { x: number; y: number; width: number; height: number }
    center: { x: number; y: number }
    spacing: { horizontal: number; vertical: number }
  } {
    if (fields.length === 0) {
      return {
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        center: { x: 0, y: 0 },
        spacing: { horizontal: 0, vertical: 0 }
      }
    }

    const minX = Math.min(...fields.map(f => f.position.x))
    const minY = Math.min(...fields.map(f => f.position.y))
    const maxX = Math.max(...fields.map(f => f.position.x + f.position.width))
    const maxY = Math.max(...fields.map(f => f.position.y + f.position.height))

    const bounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }

    const center = {
      x: minX + bounds.width / 2,
      y: minY + bounds.height / 2
    }

    // Calcular espaçamento médio
    const sortedByX = [...fields].sort((a, b) => a.position.x - b.position.x)
    const sortedByY = [...fields].sort((a, b) => a.position.y - b.position.y)

    let horizontalSpacing = 0
    let verticalSpacing = 0

    if (sortedByX.length > 1) {
      const spacings = []
      for (let i = 1; i < sortedByX.length; i++) {
        const prev = sortedByX[i - 1]
        const curr = sortedByX[i]
        spacings.push(curr.position.x - (prev.position.x + prev.position.width))
      }
      horizontalSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length
    }

    if (sortedByY.length > 1) {
      const spacings = []
      for (let i = 1; i < sortedByY.length; i++) {
        const prev = sortedByY[i - 1]
        const curr = sortedByY[i]
        spacings.push(curr.position.y - (prev.position.y + prev.position.height))
      }
      verticalSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length
    }

    return {
      bounds,
      center,
      spacing: { horizontal: horizontalSpacing, vertical: verticalSpacing }
    }
  }
}