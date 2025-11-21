// =====================================================
// TIPOS PARA O SISTEMA DE MAPEAMENTO DE FORMULÁRIOS
// =====================================================

// Re-export das interfaces do sistema de contratos
export * from './types/contract-system'

// Re-export apenas das constantes de contratos
export { 
  CONTRACT_TYPES,
  COMPANY_STATUSES,
  CONTRACT_STATUSES,
  RENEWAL_TYPES
} from './types/contracts'

export interface FormField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'textarea' | 'signature' | 'dynamic_list' | 'calculated' | 'table' | 'repeatable_group'
  label: string
  required: boolean
  position: {
    x: number
    y: number
    width: number
    height: number
    page: number
  }
  options?: string[] // Para campos select estáticos
  validation?: {
    min?: number
    max?: number
    pattern?: string
    maxLength?: number
  }
  placeholder?: string
  helpText?: string
  // 🆕 Configuração para tabelas e grupos repetíveis
  tableConfig?: {
    rows: number              // Número de linhas
    columns: number           // Número de colunas
    columnHeaders: string[]   // Cabeçalhos das colunas
    rowHeaders?: string[]     // Cabeçalhos das linhas (opcional)
    cellFields: FormField[]   // Campos dentro de cada célula
    allowAddRows?: boolean    // Permitir adicionar linhas dinamicamente
    allowRemoveRows?: boolean // Permitir remover linhas
    minRows?: number          // Mínimo de linhas
    maxRows?: number          // Máximo de linhas
  }
  // 🆕 Configuração para grupos repetíveis (ex: lista de dependentes)
  repeatableConfig?: {
    minInstances: number      // Mínimo de instâncias
    maxInstances: number      // Máximo de instâncias
    fields: FormField[]       // Campos que se repetem
    addButtonLabel?: string   // Label do botão "Adicionar"
    removeButtonLabel?: string // Label do botão "Remover"
  }
  // Propriedades de alinhamento do conteúdo
  alignment?: {
    horizontal: 'left' | 'center' | 'right'  // Alinhamento horizontal do texto
    vertical: 'top' | 'middle' | 'bottom'    // Alinhamento vertical do texto
  }
  // Propriedades de formatação de fonte
  fontStyle?: {
    family: 'Arial' | 'Helvetica' | 'Times' | 'Courier' | 'Georgia' | 'Verdana' | 'Tahoma'
    size: number // Tamanho em pixels
    weight: 'normal' | 'bold' | 'lighter' | 'bolder'
    style: 'normal' | 'italic' | 'oblique'
    decoration: 'none' | 'underline' | 'overline' | 'line-through'
    color: string // Cor em hex (#000000)
  }
  // Propriedades específicas para campos calculados
  calculatedConfig?: {
    formula: string           // Fórmula de cálculo (ex: "campo1 + campo2")
    dependencies: string[]    // Campos dos quais este campo depende
    formatType: 'number' | 'currency' | 'percentage' | 'custom'
    decimalPlaces?: number    // Casas decimais para exibição
    prefix?: string          // Prefixo (ex: "R$ ")
    suffix?: string          // Sufixo (ex: " %")
    customFormat?: string    // Formato personalizado
  }
  // Propriedades específicas para lista dinâmica
  dynamicConfig?: {
    sourceTable: string    // Tabela de origem dos dados
    valueField: string     // Campo ID a ser armazenado
    displayField: string   // Campo NAME a ser exibido
    filterCondition?: string // Condição WHERE opcional
    orderBy?: string       // Ordenação opcional
  }
}

export interface FormTemplate {
  id: string
  name: string
  description?: string
  pdf_url: string
  pdf_pages: number
  fields: FormField[]
  table_name?: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface FormInstance {
  id: string
  template_id: string
  data: Record<string, any>
  status: 'draft' | 'completed' | 'reviewed'
  created_at: string
  updated_at: string
  created_by?: string
}

export interface DetectedField {
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  page: number
  suggestedType: FormField['type']
  suggestedName: string
}

export interface FileUpload {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  ocr_results?: any
  detected_fields?: DetectedField[]
  created_at: string
  created_by?: string
}

// Tipos para o processamento de PDF
export interface PDFProcessingResult {
  pages: number
  detectedFields: DetectedField[]
  ocrText: string
  imageUrls: string[]
}

// Tipos para validação de campos
export interface FieldValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

// Tipos para o canvas de design
export interface CanvasPosition {
  x: number
  y: number
}

export interface CanvasSize {
  width: number
  height: number
}

// Tipos para exportação
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeImages: boolean
  dateRange?: {
    start: string
    end: string
  }
}