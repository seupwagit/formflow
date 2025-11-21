/**
 * Utilitário para reorganizar campos ocultos no canvas
 * Mantém campos visíveis intactos e reorganiza apenas os ocultos
 */

import { FormField } from './types'

export interface FieldVisibility {
  field: FormField
  isVisible: boolean
  isOverlapping: boolean
  reason: string
}

/**
 * Analisa quais campos estão visíveis no canvas
 */
export function analyzeFieldVisibility(
  fields: FormField[],
  canvasWidth: number = 800,
  canvasHeight: number = 1000
): FieldVisibility[] {
  const analysis: FieldVisibility[] = []
  
  fields.forEach((field, index) => {
    const pos = field.position
    let isVisible = true
    let isOverlapping = false
    let reason = 'Visível'
    
    // Verificar se está fora dos limites do canvas
    if (pos.x < 0 || pos.y < 0 || 
        pos.x + pos.width > canvasWidth || 
        pos.y + pos.height > canvasHeight) {
      isVisible = false
      reason = 'Fora dos limites do canvas'
    }
    
    // Verificar sobreposição com outros campos
    const overlappingFields = fields.filter((otherField, otherIndex) => {
      if (otherIndex === index) return false
      
      const otherPos = otherField.position
      return (
        pos.x < otherPos.x + otherPos.width &&
        pos.x + pos.width > otherPos.x &&
        pos.y < otherPos.y + otherPos.height &&
        pos.y + pos.height > otherPos.y &&
        pos.page === otherPos.page
      )
    })
    
    if (overlappingFields.length > 0) {
      isOverlapping = true
      if (isVisible) {
        reason = `Sobreposto com ${overlappingFields.length} campo(s)`
      } else {
        reason += ` e sobreposto com ${overlappingFields.length} campo(s)`
      }
    }
    
    analysis.push({
      field,
      isVisible: isVisible && !isOverlapping,
      isOverlapping,
      reason
    })
  })
  
  return analysis
}

/**
 * Reorganiza campos ocultos sem afetar os visíveis
 */
export function reorganizeHiddenFields(
  fields: FormField[],
  canvasWidth: number = 800,
  canvasHeight: number = 1000
): FormField[] {
  const analysis = analyzeFieldVisibility(fields, canvasWidth, canvasHeight)
  
  // Separar campos visíveis dos ocultos
  const visibleFields = analysis.filter(a => a.isVisible).map(a => a.field)
  const hiddenFields = analysis.filter(a => !a.isVisible).map(a => a.field)
  
  console.log(`📊 Análise: ${visibleFields.length} visíveis, ${hiddenFields.length} ocultos`)
  
  if (hiddenFields.length === 0) {
    console.log('✅ Todos os campos já estão visíveis')
    return fields
  }
  
  // Encontrar área livre para reposicionar campos ocultos
  const reorganizedHiddenFields = repositionHiddenFields(
    hiddenFields,
    visibleFields,
    canvasWidth,
    canvasHeight
  )
  
  // Combinar campos visíveis (intactos) com campos reorganizados
  const result = [...visibleFields, ...reorganizedHiddenFields]
  
  console.log(`✅ Reorganização concluída: ${result.length} campos total`)
  return result
}

/**
 * Reposiciona campos ocultos em áreas livres
 */
function repositionHiddenFields(
  hiddenFields: FormField[],
  visibleFields: FormField[],
  canvasWidth: number,
  canvasHeight: number
): FormField[] {
  const repositioned: FormField[] = []
  const gridSize = 20 // Espaçamento da grade
  const fieldSpacing = 10 // Espaço entre campos
  
  // Agrupar campos visíveis por página
  const visibleByPage: { [page: number]: FormField[] } = {}
  visibleFields.forEach(field => {
    if (!visibleByPage[field.position.page]) {
      visibleByPage[field.position.page] = []
    }
    visibleByPage[field.position.page].push(field)
  })
  
  hiddenFields.forEach((field, index) => {
    const page = field.position.page
    const visibleOnPage = visibleByPage[page] || []
    
    // Encontrar posição livre na página
    const newPosition = findFreePosition(
      field,
      visibleOnPage,
      repositioned.filter(f => f.position.page === page),
      canvasWidth,
      canvasHeight,
      gridSize,
      fieldSpacing
    )
    
    repositioned.push({
      ...field,
      position: newPosition
    })
  })
  
  return repositioned
}

/**
 * Encontra uma posição livre para um campo
 */
function findFreePosition(
  field: FormField,
  visibleFields: FormField[],
  alreadyRepositioned: FormField[],
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number,
  spacing: number
): FormField['position'] {
  const allOccupiedFields = [...visibleFields, ...alreadyRepositioned]
  const fieldWidth = field.position.width
  const fieldHeight = field.position.height
  const page = field.position.page
  
  // Tentar posições em grade, começando do canto superior direito
  for (let y = spacing; y <= canvasHeight - fieldHeight - spacing; y += gridSize) {
    for (let x = spacing; x <= canvasWidth - fieldWidth - spacing; x += gridSize) {
      const testPosition = { x, y, width: fieldWidth, height: fieldHeight, page }
      
      // Verificar se esta posição está livre
      const isOccupied = allOccupiedFields.some(occupiedField => {
        const pos = occupiedField.position
        return (
          testPosition.x < pos.x + pos.width + spacing &&
          testPosition.x + testPosition.width + spacing > pos.x &&
          testPosition.y < pos.y + pos.height + spacing &&
          testPosition.y + testPosition.height + spacing > pos.y &&
          testPosition.page === pos.page
        )
      })
      
      if (!isOccupied) {
        return testPosition
      }
    }
  }
  
  // Se não encontrou posição livre, colocar em uma área de "overflow"
  const overflowX = canvasWidth + 20
  const overflowY = spacing + (alreadyRepositioned.length * (fieldHeight + spacing))
  
  return {
    x: overflowX,
    y: overflowY,
    width: fieldWidth,
    height: fieldHeight,
    page
  }
}

/**
 * Gera relatório de campos ocultos
 */
export function generateVisibilityReport(fields: FormField[]): string {
  const analysis = analyzeFieldVisibility(fields)
  
  const visible = analysis.filter(a => a.isVisible)
  const hidden = analysis.filter(a => !a.isVisible)
  const overlapping = analysis.filter(a => a.isOverlapping)
  
  let report = `📊 RELATÓRIO DE VISIBILIDADE DOS CAMPOS\n\n`
  report += `Total de campos: ${fields.length}\n`
  report += `Campos visíveis: ${visible.length}\n`
  report += `Campos ocultos: ${hidden.length}\n`
  report += `Campos sobrepostos: ${overlapping.length}\n\n`
  
  if (hidden.length > 0) {
    report += `🔍 CAMPOS OCULTOS:\n`
    hidden.forEach(item => {
      report += `• ${item.field.label} - ${item.reason}\n`
    })
  }
  
  return report
}