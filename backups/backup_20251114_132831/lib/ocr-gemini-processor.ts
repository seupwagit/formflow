import { createWorker } from 'tesseract.js'
import { FormField } from './types'
import { sanitizeFieldName, validateFieldName } from './field-name-utils'
import { generateUniqueFieldId, generateUniqueFieldName } from './unique-field-generator'
import { OCRConfig, DEFAULT_OCR_CONFIG, validateOCRConfig } from './ocr-config'

export interface OCRGeminiResult {
  processingId: string
  fileName: string
  imageUrls: string[]
  detectedFields: FormField[]
  ocrTexts: string[]
  confidence: number
  success: boolean
  message: string
}

/**
 * Processador que usa OCR tradicional (Tesseract) + Gemini puro (texto)
 * Fluxo correto: PNG → OCR → Texto → Gemini → Campos detectados
 */
export class OCRGeminiProcessor {
  private processingId: string
  private ocrConfig: OCRConfig
  private worker: any = null

  constructor(ocrConfig?: Partial<OCRConfig>) {
    this.processingId = `ocr_gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.ocrConfig = validateOCRConfig(ocrConfig || DEFAULT_OCR_CONFIG)
    
    console.log('🔧 OCR Processor inicializado com configuração:', this.ocrConfig)
  }

  async processImages(
    imageUrls: string[],
    fileName: string,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<OCRGeminiResult> {
    
    console.log('🚀 Iniciando processamento OCR + Gemini puro:', fileName)
    
    try {
      // Etapa 1: Inicializar OCR
      onProgress?.('Inicializando OCR...', 10)
      await this.initializeOCR()
      
      // Etapa 2: Extrair texto de todas as páginas
      onProgress?.('Extraindo texto com OCR...', 30)
      const ocrTexts: string[] = []
      
      for (let i = 0; i < imageUrls.length; i++) {
        console.log(`📄 Processando página ${i + 1}/${imageUrls.length} com OCR...`)
        const text = await this.extractTextFromImage(imageUrls[i])
        ocrTexts.push(text)
        
        const progress = 30 + (i + 1) / imageUrls.length * 40
        onProgress?.(`OCR página ${i + 1}/${imageUrls.length}...`, progress)
      }
      
      console.log(`✅ OCR concluído: ${ocrTexts.length} páginas processadas`)
      
      // Etapa 3: Analisar texto com Gemini puro
      onProgress?.('Analisando campos com IA...', 75)
      const detectedFields = await this.analyzeTextWithGemini(ocrTexts, fileName)
      
      console.log(`✅ Gemini detectou ${detectedFields.length} campos`)
      
      // Etapa 4: Calcular confiança geral
      const confidence = this.calculateOverallConfidence(detectedFields)
      
      onProgress?.('Processamento concluído!', 100)
      
      return {
        processingId: this.processingId,
        fileName,
        imageUrls,
        detectedFields,
        ocrTexts,
        confidence,
        success: true,
        message: `Processamento concluído! ${detectedFields.length} campos detectados com ${Math.round(confidence * 100)}% de confiança.`
      }
      
    } catch (error) {
      console.error('❌ Erro no processamento OCR + Gemini:', error)
      
      return {
        processingId: this.processingId,
        fileName,
        imageUrls,
        detectedFields: [],
        ocrTexts: [],
        confidence: 0,
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    } finally {
      await this.cleanup()
    }
  }

  private async initializeOCR(): Promise<void> {
    try {
      console.log('🔧 Inicializando Tesseract OCR...')
      
      this.worker = await createWorker()
      
      await this.worker.loadLanguage(this.ocrConfig.language)
      await this.worker.initialize(this.ocrConfig.language)
      
      // Configurar parâmetros do OCR baseado na configuração
      await this.worker.setParameters({
        tessedit_pageseg_mode: parseInt(this.ocrConfig.pageSegMode) as any,
        tessedit_oem: parseInt(this.ocrConfig.ocrEngineMode) as any,
        tessedit_char_confidence_th: this.ocrConfig.confidenceThreshold,
        preserve_interword_spaces: '1',
        tessedit_do_invert: '0'
      })
      
      console.log('✅ Parâmetros OCR configurados:', {
        pageSegMode: this.ocrConfig.pageSegMode,
        ocrEngineMode: this.ocrConfig.ocrEngineMode,
        confidenceThreshold: this.ocrConfig.confidenceThreshold
      })
      
      console.log('✅ OCR inicializado com sucesso')
      
    } catch (error) {
      console.error('❌ Erro ao inicializar OCR:', error)
      throw new Error('Falha na inicialização do OCR')
    }
  }

  private async extractTextFromImage(imageUrl: string): Promise<string> {
    try {
      console.log('📖 Extraindo texto da imagem...')
      
      // Pré-processar imagem se configurado
      let processedImageUrl = imageUrl
      if (this.ocrConfig.enablePreprocessing) {
        processedImageUrl = await this.preprocessImage(imageUrl)
      }
      
      const { data: { text, confidence } } = await this.worker.recognize(processedImageUrl)
      
      console.log(`✅ Texto extraído (confiança: ${confidence}%):`, text.substring(0, 100) + '...')
      
      return text
      
    } catch (error) {
      console.error('❌ Erro na extração de texto:', error)
      return ''
    }
  }

  private async preprocessImage(imageUrl: string): Promise<string> {
    try {
      // Usar utilitário seguro para processamento de canvas
      const { loadImageToCanvas } = await import('./canvas-utils')
      
      const options = {
        scale: this.ocrConfig.scale || 2.0,
        enhanceContrast: this.ocrConfig.enhanceContrast || true,
        binarize: this.ocrConfig.binarize || false,
        deskew: this.ocrConfig.deskew || true,
        removeNoise: this.ocrConfig.removeNoise || true,
        quality: 1.0
      }
      
      return await loadImageToCanvas(imageUrl, options)
      
    } catch (error) {
      console.error('❌ Erro no pré-processamento:', error)
      // Retornar URL original se houver erro
      return imageUrl
    }
  }



  private async analyzeTextWithGemini(ocrTexts: string[], fileName: string): Promise<FormField[]> {
    try {
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('Chave do Gemini não configurada')
      }

      console.log('🤖 Analisando texto com Gemini puro (não Vision)...')
      
      // Combinar texto de todas as páginas
      const fullText = ocrTexts.map((text, i) => `=== PÁGINA ${i + 1} ===\n${text}`).join('\n\n')
      
      const prompt = `Analise este texto extraído por OCR de um formulário PDF e identifique TODOS os campos de entrada de dados.

TEXTO DO FORMULÁRIO:
${fullText}

INSTRUÇÕES:
1. Identifique campos como: caixas de texto, campos de data, checkboxes, dropdowns, áreas de texto
2. Para cada campo encontrado, determine:
   - Nome/ID do campo (sem espaços, snake_case)
   - Label/rótulo visível
   - Tipo (text, number, date, checkbox, select, textarea, signature)
   - Se é obrigatório (baseado em asteriscos * ou palavras como "obrigatório")
   - Posição aproximada no documento (início, meio, fim da página)

3. Ignore texto que é apenas informativo ou instruções

RESPONDA APENAS COM JSON VÁLIDO no formato:
{
  "fields": [
    {
      "id": "nome_campo",
      "name": "nome_campo", 
      "type": "text",
      "label": "Nome do Campo",
      "required": false,
      "page": 0,
      "position": "top|middle|bottom",
      "confidence": 0.9
    }
  ]
}

IMPORTANTE: Responda APENAS o JSON, sem explicações adicionais.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API do Gemini: ${response.status}`)
      }

      const data = await response.json()
      const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!geminiText) {
        throw new Error('Resposta vazia do Gemini')
      }

      console.log('🤖 Resposta do Gemini:', geminiText)

      // Extrair JSON da resposta
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Gemini não retornou JSON válido')
      }

      const geminiResult = JSON.parse(jsonMatch[0])
      
      // Converter para FormField[] com IDs únicos
      const detectedFields: FormField[] = []
      
      geminiResult.fields.forEach((field: any, index: number) => {
        const position = this.estimatePosition(field, index, ocrTexts.length)
        
        // Gerar ID único baseado na posição para evitar duplicatas
        const uniqueId = generateUniqueFieldId(field.label || `campo_${index}`, detectedFields, position, index)
        const uniqueName = generateUniqueFieldName(field.label || `campo_${index}`, detectedFields, position, index)
        
        const formField: FormField = {
          id: uniqueId, // ID único baseado em posição + timestamp + índice
          name: uniqueName, // Nome único para banco
          type: this.mapFieldType(field.type),
          label: field.label || 'Campo',
          required: field.required || false,
          position: position,
          // confidence: field.confidence || 0.8
        }
        
        detectedFields.push(formField)
      })

      return detectedFields

    } catch (error) {
      console.error('❌ Erro na análise com Gemini:', error)
      return []
    }
  }

  private mapFieldType(type: string): 'text' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'textarea' | 'signature' {
    switch (type?.toLowerCase()) {
      case 'number':
      case 'numeric':
        return 'number'
      case 'date':
      case 'data':
        return 'date'
      case 'checkbox':
      case 'check':
        return 'checkbox'
      case 'select':
      case 'dropdown':
      case 'lista':
        return 'select'
      case 'textarea':
      case 'area':
      case 'observacoes':
        return 'textarea'
      case 'signature':
      case 'assinatura':
        return 'signature'
      case 'image':
      case 'imagem':
        return 'image'
      default:
        return 'text'
    }
  }

  private estimatePosition(field: any, index: number, totalPages: number): any {
    // Estimar posição baseada na análise do Gemini
    const page = field.page || 0
    
    let x = 100 + (index % 3) * 200 // Distribuir horizontalmente
    let y = 100 + Math.floor(index / 3) * 50 // Distribuir verticalmente
    
    // Ajustar baseado na posição indicada pelo Gemini
    if (field.position === 'middle') {
      y += 300
    } else if (field.position === 'bottom') {
      y += 600
    }
    
    return {
      x: Math.min(x, 600),
      y: Math.min(y, 900),
      width: field.type === 'textarea' ? 400 : 200,
      height: field.type === 'textarea' ? 80 : 35,
      page: Math.min(page, totalPages - 1)
    }
  }

  private calculateOverallConfidence(fields: FormField[]): number {
    if (fields.length === 0) return 0
    
    const totalConfidence = fields.reduce((sum, field) => sum + ((field as any).confidence || 0.8), 0)
    return totalConfidence / fields.length
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.terminate()
        this.worker = null
        console.log('✅ OCR worker finalizado')
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar OCR:', error)
    }
  }
}