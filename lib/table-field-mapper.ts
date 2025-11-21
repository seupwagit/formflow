/**
 * Mapeador inteligente de campos de tabela
 * Detecta tabelas em formulários e mapeia cada célula como campo único
 */

import { FormField } from './types'

export interface TableCell {
  row: number
  col: number
  x: number
  y: number
  width: number
  height: number
  content?: string
}

export interface DetectedTable {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rows: number
  cols: number
  cells: TableCell[]
  headerRow?: boolean
}

export interface TableFieldMapping {
  tableId: string
  tableName: string
  fields: FormField[]
}

/**
 * Detecta estruturas de tabela baseado em posições de campos
 */
export function detectTables(fields: any[]): DetectedTable[] {
  console.log('🔍 Detectando tabelas em', fields.length, 'campos...')
  
  const tables: DetectedTable[] = []
  const processedFields = new Set<string>()
  
  // Agrupar campos por proximidade (possíveis células de tabela)
  const fieldGroups = groupFieldsByProximity(fields)
  
  fieldGroups.forEach((group, groupIndex) => {
    if (group.length < 4) return // Mínimo 2x2 para ser considerado tabela
    
    const tableStructure = analyzeTableStructure(group)
    
    if (tableStructure.isTable) {
      const table: DetectedTable = {
        id: `table_${groupIndex + 1}`,
        name: `Tabela ${groupIndex + 1}`,
        x: Math.min(...group.map(f => f.bbox?.x || f.position?.x || 0)),
        y: Math.min(...group.map(f => f.bbox?.y || f.position?.y || 0)),
        width: Math.max(...group.map(f => (f.bbox?.x || f.position?.x || 0) + (f.bbox?.width || f.position?.width || 200))) - Math.min(...group.map(f => f.bbox?.x || f.position?.x || 0)),
        height: Math.max(...group.map(f => (f.bbox?.y || f.position?.y || 0) + (f.bbox?.height || f.position?.height || 35))) - Math.min(...group.map(f => f.bbox?.y || f.position?.y || 0)),
        rows: tableStructure.rows,
        cols: tableStructure.cols,
        cells: tableStructure.cells,
        headerRow: tableStructure.hasHeader
      }
      
      tables.push(table)
      
      // Marcar campos como processados
      group.forEach(field => {
        processedFields.add(field.id || field.label)
      })
      
      console.log(`📊 Tabela detectada: ${table.rows}x${table.cols} (${table.cells.length} células)`)
    }
  })
  
  console.log(`✅ ${tables.length} tabelas detectadas`)
  return tables
}

/**
 * Agrupa campos por proximidade espacial
 */
function groupFieldsByProximity(fields: any[]): any[][] {
  const groups: any[][] = []
  const processed = new Set<string>()
  
  const PROXIMITY_THRESHOLD = 100 // pixels
  
  fields.forEach(field => {
    const fieldId = field.id || field.label
    if (processed.has(fieldId)) return
    
    const fieldX = field.bbox?.x || field.position?.x || 0
    const fieldY = field.bbox?.y || field.position?.y || 0
    
    // Encontrar campos próximos
    const nearbyFields = fields.filter(otherField => {
      const otherId = otherField.id || otherField.label
      if (processed.has(otherId) || otherId === fieldId) return false
      
      const otherX = otherField.bbox?.x || otherField.position?.x || 0
      const otherY = otherField.bbox?.y || otherField.position?.y || 0
      
      const distance = Math.sqrt(Math.pow(fieldX - otherX, 2) + Math.pow(fieldY - otherY, 2))
      return distance <= PROXIMITY_THRESHOLD
    })
    
    if (nearbyFields.length >= 3) { // Mínimo para formar uma tabela
      const group = [field, ...nearbyFields]
      groups.push(group)
      
      // Marcar como processados
      group.forEach(f => processed.add(f.id || f.label))
    }
  })
  
  return groups
}

/**
 * Analisa se um grupo de campos forma uma estrutura de tabela
 */
function analyzeTableStructure(fields: any[]): {
  isTable: boolean
  rows: number
  cols: number
  cells: TableCell[]
  hasHeader: boolean
} {
  // Extrair posições
  const positions = fields.map(field => ({
    field,
    x: field.bbox?.x || field.position?.x || 0,
    y: field.bbox?.y || field.position?.y || 0,
    width: field.bbox?.width || field.position?.width || 200,
    height: field.bbox?.height || field.position?.height || 35
  }))
  
  // Ordenar por Y (linhas) e depois por X (colunas)
  positions.sort((a, b) => {
    const yDiff = a.y - b.y
    if (Math.abs(yDiff) < 20) { // Mesma linha
      return a.x - b.x
    }
    return yDiff
  })
  
  // Detectar linhas e colunas
  const rows = detectRows(positions)
  const cols = detectColumns(positions)
  
  // Verificar se forma uma grade regular
  const isRegularGrid = rows.length >= 2 && cols.length >= 2 && 
                       (rows.length * cols.length) >= (positions.length * 0.8) // 80% das posições devem formar a grade
  
  if (!isRegularGrid) {
    return {
      isTable: false,
      rows: 0,
      cols: 0,
      cells: [],
      hasHeader: false
    }
  }
  
  // Criar células
  const cells: TableCell[] = []
  positions.forEach((pos, index) => {
    const row = findRowIndex(pos.y, rows)
    const col = findColumnIndex(pos.x, cols)
    
    if (row >= 0 && col >= 0) {
      cells.push({
        row,
        col,
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        content: pos.field.label || pos.field.id
      })
    }
  })
  
  // Detectar se primeira linha é cabeçalho
  const hasHeader = detectHeaderRow(cells, rows.length)
  
  return {
    isTable: true,
    rows: rows.length,
    cols: cols.length,
    cells,
    hasHeader
  }
}

/**
 * Detecta linhas baseado em posições Y
 */
function detectRows(positions: any[]): number[] {
  const yPositions = positions.map(p => p.y)
  const uniqueYs = Array.from(new Set(yPositions)).sort((a, b) => a - b)
  
  // Agrupar Ys próximos (mesma linha)
  const rows: number[] = []
  const TOLERANCE = 15
  
  uniqueYs.forEach(y => {
    const existingRow = rows.find(rowY => Math.abs(rowY - y) <= TOLERANCE)
    if (!existingRow) {
      rows.push(y)
    }
  })
  
  return rows.sort((a, b) => a - b)
}

/**
 * Detecta colunas baseado em posições X
 */
function detectColumns(positions: any[]): number[] {
  const xPositions = positions.map(p => p.x)
  const uniqueXs = Array.from(new Set(xPositions)).sort((a, b) => a - b)
  
  // Agrupar Xs próximos (mesma coluna)
  const cols: number[] = []
  const TOLERANCE = 15
  
  uniqueXs.forEach(x => {
    const existingCol = cols.find(colX => Math.abs(colX - x) <= TOLERANCE)
    if (!existingCol) {
      cols.push(x)
    }
  })
  
  return cols.sort((a, b) => a - b)
}

/**
 * Encontra índice da linha para uma posição Y
 */
function findRowIndex(y: number, rows: number[]): number {
  const TOLERANCE = 15
  return rows.findIndex(rowY => Math.abs(rowY - y) <= TOLERANCE)
}

/**
 * Encontra índice da coluna para uma posição X
 */
function findColumnIndex(x: number, cols: number[]): number {
  const TOLERANCE = 15
  return cols.findIndex(colX => Math.abs(colX - x) <= TOLERANCE)
}

/**
 * Detecta se primeira linha é cabeçalho
 */
function detectHeaderRow(cells: TableCell[], totalRows: number): boolean {
  if (totalRows < 2) return false
  
  const firstRowCells = cells.filter(cell => cell.row === 0)
  const secondRowCells = cells.filter(cell => cell.row === 1)
  
  // Heurística: se primeira linha tem conteúdo mais descritivo, é cabeçalho
  const firstRowHasDescriptiveContent = firstRowCells.some(cell => 
    cell.content && (
      cell.content.length > 10 ||
      /nome|data|valor|quantidade|descrição|total/i.test(cell.content)
    )
  )
  
  return firstRowHasDescriptiveContent && secondRowCells.length > 0
}

/**
 * Mapeia tabelas detectadas para campos únicos
 */
export function mapTablesToFields(tables: DetectedTable[]): TableFieldMapping[] {
  console.log('🗺️ Mapeando', tables.length, 'tabelas para campos únicos...')
  
  const mappings: TableFieldMapping[] = []
  
  tables.forEach((table, tableIndex) => {
    const fields: FormField[] = []
    
    table.cells.forEach(cell => {
      // Gerar nome único para cada célula
      const cellName = generateCellFieldName(table.name, cell.row, cell.col, table.headerRow || false)
      const cellId = sanitizeFieldName(cellName)
      
      // Determinar tipo baseado no conteúdo
      const fieldType = determineCellFieldType(cell.content)
      
      // Gerar label descritivo
      const label = generateCellLabel(table.name, cell.row, cell.col, cell.content, table.headerRow || false)
      
      const field: FormField = {
        id: cellId,
        name: cellId,
        type: fieldType,
        label: label,
        required: false,
        position: {
          x: cell.x,
          y: cell.y,
          width: cell.width,
          height: cell.height,
          page: 0
        },
        placeholder: `${table.name} - Linha ${cell.row + 1}, Coluna ${cell.col + 1}`,
        helpText: `Campo da tabela ${table.name} (${cell.row + 1}x${cell.col + 1})`
      }
      
      fields.push(field)
    })
    
    mappings.push({
      tableId: table.id,
      tableName: table.name,
      fields
    })
    
    console.log(`✅ Tabela "${table.name}" mapeada: ${fields.length} campos únicos`)
  })
  
  return mappings
}

/**
 * Gera nome único para campo de célula
 */
function generateCellFieldName(tableName: string, row: number, col: number, hasHeader: boolean): string {
  const sanitizedTableName = sanitizeFieldName(tableName)
  
  if (hasHeader && row === 0) {
    return `${sanitizedTableName}_header_col${col + 1}`
  } else {
    const dataRow = hasHeader ? row : row + 1
    return `${sanitizedTableName}_linha${dataRow}_col${col + 1}`
  }
}

/**
 * Gera label descritivo para célula
 */
function generateCellLabel(tableName: string, row: number, col: number, content?: string, hasHeader?: boolean): string {
  if (content && content.trim()) {
    return content.trim()
  }
  
  if (hasHeader && row === 0) {
    return `${tableName} - Cabeçalho Col ${col + 1}`
  } else {
    const dataRow = hasHeader ? row : row + 1
    return `${tableName} - Linha ${dataRow}, Col ${col + 1}`
  }
}

/**
 * Determina tipo do campo baseado no conteúdo
 */
function determineCellFieldType(content?: string): FormField['type'] {
  if (!content) return 'text'
  
  const lowerContent = content.toLowerCase()
  
  if (/data|date/i.test(lowerContent)) return 'date'
  if (/valor|preço|price|total|quantidade|qtd/i.test(lowerContent)) return 'number'
  if (/email/i.test(lowerContent)) return 'text' // Poderia ser 'email' se tivesse esse tipo
  if (/telefone|phone|fone/i.test(lowerContent)) return 'text'
  if (/observ|obs|descrição|desc/i.test(lowerContent)) return 'textarea'
  
  return 'text'
}

/**
 * Sanitiza nome do campo
 */
function sanitizeFieldName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50) || 'campo'
}