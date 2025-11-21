// =====================================================
// CONFIGURAÇÃO DO SISTEMA DE CONVERSÃO PDF
// =====================================================

export interface PDFConverterConfig {
  // Ordem de failover dos métodos de conversão
  failoverOrder: string[]
  
  // Configurações de qualidade
  defaultQuality: number
  defaultScale: number
  maxWidth: number
  maxHeight: number
  
  // Configurações de OCR
  ocrLanguage: string
  ocrConfidenceThreshold: number
  
  // Timeouts (em ms)
  conversionTimeout: number
  ocrTimeout: number
  
  // Configurações de retry
  maxRetries: number
  retryDelay: number
}

export const DEFAULT_CONFIG: PDFConverterConfig = {
  // Ordem padrão: Local JS -> PDF-to-img -> PDFToImg-JS
  failoverOrder: ['localjs', 'pdf-to-img', 'pdftoimg-js'],
  
  // Qualidade e dimensões
  defaultQuality: 0.9,
  defaultScale: 2.0,
  maxWidth: 1200,
  maxHeight: 1600,
  
  // OCR
  ocrLanguage: 'por',
  ocrConfidenceThreshold: 0.6,
  
  // Timeouts
  conversionTimeout: 30000, // 30 segundos
  ocrTimeout: 60000,        // 60 segundos
  
  // Retry
  maxRetries: 2,
  retryDelay: 1000 // 1 segundo
}

/**
 * Carrega configuração do ambiente ou usa padrão
 */
export function loadPDFConfig(): PDFConverterConfig {
  const config = { ...DEFAULT_CONFIG }
  
  // Ordem de failover configurável via env
  if (process.env.OCR_FAILOVER_ORDER) {
    config.failoverOrder = process.env.OCR_FAILOVER_ORDER.split(',').map(s => s.trim())
  }
  
  // Qualidade configurável
  if (process.env.PDF_QUALITY) {
    const quality = parseFloat(process.env.PDF_QUALITY)
    if (quality >= 0.1 && quality <= 1.0) {
      config.defaultQuality = quality
    }
  }
  
  // Escala configurável
  if (process.env.PDF_SCALE) {
    const scale = parseFloat(process.env.PDF_SCALE)
    if (scale >= 0.5 && scale <= 5.0) {
      config.defaultScale = scale
    }
  }
  
  // Dimensões máximas
  if (process.env.PDF_MAX_WIDTH) {
    config.maxWidth = parseInt(process.env.PDF_MAX_WIDTH)
  }
  
  if (process.env.PDF_MAX_HEIGHT) {
    config.maxHeight = parseInt(process.env.PDF_MAX_HEIGHT)
  }
  
  // Idioma do OCR
  if (process.env.OCR_LANGUAGE) {
    config.ocrLanguage = process.env.OCR_LANGUAGE
  }
  
  // Threshold de confiança do OCR
  if (process.env.OCR_CONFIDENCE_THRESHOLD) {
    const threshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD)
    if (threshold >= 0.1 && threshold <= 1.0) {
      config.ocrConfidenceThreshold = threshold
    }
  }
  
  // Timeouts
  if (process.env.CONVERSION_TIMEOUT) {
    config.conversionTimeout = parseInt(process.env.CONVERSION_TIMEOUT)
  }
  
  if (process.env.OCR_TIMEOUT) {
    config.ocrTimeout = parseInt(process.env.OCR_TIMEOUT)
  }
  
  return config
}

/**
 * Valida se um método de conversão é suportado
 */
export function isValidConversionMethod(method: string): boolean {
  const validMethods = ['localjs', 'pdf-to-img', 'pdftoimg-js']
  return validMethods.includes(method)
}

/**
 * Obtém configuração otimizada baseada no tamanho do arquivo
 */
export function getOptimizedConfig(fileSizeBytes: number): Partial<PDFConverterConfig> {
  const fileSizeMB = fileSizeBytes / (1024 * 1024)
  
  if (fileSizeMB < 1) {
    // Arquivo pequeno - máxima qualidade
    return {
      defaultQuality: 0.95,
      defaultScale: 2.5,
      maxWidth: 1400,
      maxHeight: 1800
    }
  } else if (fileSizeMB < 5) {
    // Arquivo médio - qualidade balanceada
    return {
      defaultQuality: 0.9,
      defaultScale: 2.0,
      maxWidth: 1200,
      maxHeight: 1600
    }
  } else {
    // Arquivo grande - otimizar performance
    return {
      defaultQuality: 0.8,
      defaultScale: 1.5,
      maxWidth: 1000,
      maxHeight: 1400
    }
  }
}

/**
 * Configurações específicas por tipo de documento
 */
export const DOCUMENT_TYPE_CONFIGS = {
  inspection_form: {
    ocrLanguage: 'por',
    ocrConfidenceThreshold: 0.7,
    fieldPatterns: [
      { pattern: /nome.*inspetor/i, type: 'text', priority: 1 },
      { pattern: /data.*inspe[cç][aã]o/i, type: 'date', priority: 1 },
      { pattern: /temperatura/i, type: 'number', priority: 2 }
    ]
  },
  
  technical_report: {
    ocrLanguage: 'por',
    ocrConfidenceThreshold: 0.8,
    fieldPatterns: [
      { pattern: /relat[oó]rio/i, type: 'text', priority: 1 },
      { pattern: /conclus[aã]o/i, type: 'textarea', priority: 1 }
    ]
  },
  
  checklist: {
    ocrLanguage: 'por',
    ocrConfidenceThreshold: 0.6,
    fieldPatterns: [
      { pattern: /sim|n[aã]o|ok/i, type: 'checkbox', priority: 1 },
      { pattern: /item|verifica[cç][aã]o/i, type: 'text', priority: 2 }
    ]
  }
}

/**
 * Métricas de performance por método
 */
export interface MethodMetrics {
  successRate: number
  avgProcessingTime: number
  avgQuality: number
  lastUsed: Date
  errorCount: number
}

/**
 * Classe para tracking de métricas dos métodos
 */
export class ConversionMetrics {
  private metrics: Map<string, MethodMetrics> = new Map()
  
  recordSuccess(method: string, processingTime: number, quality: number = 1.0) {
    const current = this.metrics.get(method) || {
      successRate: 0,
      avgProcessingTime: 0,
      avgQuality: 0,
      lastUsed: new Date(),
      errorCount: 0
    }
    
    // Atualizar métricas com média móvel
    current.avgProcessingTime = (current.avgProcessingTime + processingTime) / 2
    current.avgQuality = (current.avgQuality + quality) / 2
    current.successRate = Math.min(current.successRate + 0.1, 1.0)
    current.lastUsed = new Date()
    
    this.metrics.set(method, current)
  }
  
  recordFailure(method: string) {
    const current = this.metrics.get(method) || {
      successRate: 1.0,
      avgProcessingTime: 0,
      avgQuality: 0,
      lastUsed: new Date(),
      errorCount: 0
    }
    
    current.successRate = Math.max(current.successRate - 0.2, 0.0)
    current.errorCount += 1
    current.lastUsed = new Date()
    
    this.metrics.set(method, current)
  }
  
  getBestMethod(): string {
    let bestMethod = 'localjs'
    let bestScore = 0
    
    for (const [method, metrics] of Array.from(this.metrics.entries())) {
      // Score baseado em taxa de sucesso e velocidade
      const score = metrics.successRate * 0.7 + 
                   (1 / Math.max(metrics.avgProcessingTime, 1000)) * 0.3
      
      if (score > bestScore) {
        bestScore = score
        bestMethod = method
      }
    }
    
    return bestMethod
  }
  
  getMetrics(): Map<string, MethodMetrics> {
    return new Map(this.metrics)
  }
}