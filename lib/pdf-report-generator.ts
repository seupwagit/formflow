/**
 * Gerador de Relatórios com Imagem de Fundo
 * Cria PDFs profissionais usando templates visuais existentes
 * Integrado com sistema de versionamento de imagens de fundo
 */

import { jsPDF } from 'jspdf'
import { TemplateBackgroundManager, TemplateBackgroundVersion } from './template-background-manager'

export interface FieldMapping {
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  fontFamily?: string
  fontStyle?: 'normal' | 'bold' | 'italic'
  color?: string
  align?: 'left' | 'center' | 'right'
  maxLength?: number
  type?: 'text' | 'number' | 'date' | 'currency' | 'signature'
}

export interface PageTemplate {
  pageNumber: number
  backgroundImage: string // Base64 ou URL da imagem
  imageWidth: number
  imageHeight: number
  fields: Record<string, FieldMapping>
}

export interface ReportData {
  [fieldName: string]: string | number | Date | null
}

export interface ReportConfig {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  dpi?: number
  pageFormat?: 'a4' | 'letter' | 'legal'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  defaultFont?: {
    family: string
    size: number
    style: 'normal' | 'bold' | 'italic'
    color: string
  }
}

export class PDFReportGenerator {
  private pdf: jsPDF
  private config: ReportConfig

  constructor(config: ReportConfig = {}) {
    this.config = {
      dpi: 300,
      pageFormat: 'a4',
      orientation: 'portrait',
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
      defaultFont: {
        family: 'helvetica',
        size: 10,
        style: 'normal',
        color: '#0064C8' // Azul
      },
      ...config
    }

    try {
      this.pdf = new jsPDF({
        orientation: this.config.orientation,
        unit: 'mm',
        format: this.config.pageFormat
      })
      
      console.log('✅ jsPDF inicializado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar jsPDF:', error)
      throw new Error('Falha ao inicializar gerador de PDF')
    }

    // Configurar metadados (opcional, não crítico)
    this.setMetadata()
  }

  private setMetadata(): void {
    try {
      const pdf = this.pdf as any // Type assertion para acessar métodos que podem não existir
      
      if (this.config.title && pdf.setTitle) {
        pdf.setTitle(this.config.title)
      }
      if (this.config.author && pdf.setAuthor) {
        pdf.setAuthor(this.config.author)
      }
      if (this.config.subject && pdf.setSubject) {
        pdf.setSubject(this.config.subject)
      }
      if (this.config.keywords && pdf.setKeywords) {
        pdf.setKeywords(this.config.keywords)
      }
      
      console.log('✅ Metadados do PDF configurados')
    } catch (error) {
      console.warn('⚠️ Erro ao configurar metadados do PDF (não crítico):', error)
      // Continuar sem metadados se houver erro
    }
  }

  /**
   * Gera relatório PDF com múltiplas páginas
   */
  async generateReport(
    templates: PageTemplate[],
    data: ReportData
  ): Promise<Uint8Array> {
    console.log(`📄 Gerando relatório com ${templates.length} páginas...`)

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      
      // Adicionar nova página (exceto a primeira)
      if (i > 0) {
        this.pdf.addPage()
      }

      await this.renderPage(template, data)
      console.log(`✅ Página ${i + 1} renderizada`)
    }

    console.log(`🎉 Relatório gerado com sucesso!`)
    return new Uint8Array(this.pdf.output('arraybuffer') as ArrayBuffer)
  }

  /**
   * Salva o PDF com o nome especificado
   */
  save(filename: string): void {
    try {
      this.pdf.save(filename)
      console.log(`💾 PDF salvo: ${filename}`)
    } catch (error) {
      console.error('❌ Erro ao salvar PDF:', error)
      throw new Error('Falha ao salvar PDF')
    }
  }

  /**
   * Renderiza uma página do relatório
   */
  private async renderPage(template: PageTemplate, data: ReportData): Promise<void> {
    // ETAPA 1: Adicionar imagem de fundo
    await this.addBackgroundImage(template)

    // ETAPA 2: Renderizar campos sobre a imagem
    this.renderFields(template.fields, data)
  }

  /**
   * Adiciona imagem de fundo à página
   */
  private async addBackgroundImage(template: PageTemplate): Promise<void> {
    try {
      const pageWidth = this.pdf.internal.pageSize.getWidth()
      const pageHeight = this.pdf.internal.pageSize.getHeight()

      // Calcular dimensões mantendo proporção
      const { width, height, x, y } = this.calculateImageDimensions(
        template.imageWidth,
        template.imageHeight,
        pageWidth - this.config.margins!.left - this.config.margins!.right,
        pageHeight - this.config.margins!.top - this.config.margins!.bottom
      )

      // Adicionar imagem de fundo
      this.pdf.addImage(
        template.backgroundImage,
        'PNG', // Formato detectado automaticamente
        x + this.config.margins!.left,
        y + this.config.margins!.top,
        width,
        height,
        undefined,
        'FAST' // Compressão rápida
      )

      console.log(`🖼️ Imagem de fundo adicionada: ${width}x${height}mm`)
    } catch (error) {
      console.error('❌ Erro ao adicionar imagem de fundo:', error)
      throw new Error(`Falha ao processar imagem de fundo: ${error}`)
    }
  }

  /**
   * Calcula dimensões da imagem mantendo proporção
   */
  private calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number; x: number; y: number } {
    const aspectRatio = originalWidth / originalHeight

    let width = maxWidth
    let height = width / aspectRatio

    // Se altura exceder o máximo, ajustar pela altura
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    // Centralizar na página
    const x = (maxWidth - width) / 2
    const y = (maxHeight - height) / 2

    return { width, height, x, y }
  }

  /**
   * Renderiza campos de dados sobre a imagem
   */
  private renderFields(fields: Record<string, FieldMapping>, data: ReportData): void {
    Object.entries(fields).forEach(([fieldName, mapping]) => {
      const value = data[fieldName]
      if (value !== null && value !== undefined) {
        this.renderField(fieldName, value, mapping)
      }
    })
  }

  /**
   * Renderiza um campo individual
   */
  private renderField(fieldName: string, value: any, mapping: FieldMapping): void {
    // Configurar fonte
    const fontSize = mapping.fontSize || this.config.defaultFont!.size
    const fontFamily = mapping.fontFamily || this.config.defaultFont!.family
    const fontStyle = mapping.fontStyle || this.config.defaultFont!.style
    const color = mapping.color || this.config.defaultFont!.color

    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(fontFamily, fontStyle)
    this.pdf.setTextColor(color)

    // Converter coordenadas de pixels para mm (assumindo 96 DPI)
    const x = this.pixelsToMm(mapping.x) + this.config.margins!.left
    const y = this.pixelsToMm(mapping.y) + this.config.margins!.top

    // Formatar valor baseado no tipo
    const formattedValue = this.formatFieldValue(value, mapping.type)

    // Aplicar limitação de caracteres se especificada
    const finalValue = mapping.maxLength 
      ? formattedValue.substring(0, mapping.maxLength)
      : formattedValue

    // Renderizar texto com alinhamento
    const align = mapping.align || 'left'
    this.pdf.text(finalValue, x, y, { align })

    console.log(`📝 Campo "${fieldName}": "${finalValue}" em (${x.toFixed(1)}, ${y.toFixed(1)})mm`)
  }

  /**
   * Formata valor do campo baseado no tipo
   */
  private formatFieldValue(value: any, type?: string): string {
    if (value === null || value === undefined) return ''

    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('pt-BR')
        }
        return String(value)

      case 'currency':
        const numValue = typeof value === 'number' ? value : parseFloat(String(value))
        if (isNaN(numValue)) return String(value)
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue)

      case 'number':
        const num = typeof value === 'number' ? value : parseFloat(String(value))
        if (isNaN(num)) return String(value)
        return new Intl.NumberFormat('pt-BR').format(num)

      case 'signature':
        // Para assinaturas, o valor deve ser uma imagem base64
        if (typeof value === 'string' && value.startsWith('data:image')) {
          // TODO: Implementar renderização de imagem de assinatura
          return '[ASSINATURA]'
        }
        return String(value)

      default:
        return String(value)
    }
  }

  /**
   * Converte pixels para milímetros (assumindo 96 DPI)
   */
  private pixelsToMm(pixels: number): number {
    return (pixels * 25.4) / 96
  }

  /**
   * Adiciona assinatura como imagem
   */
  async addSignature(
    signatureBase64: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    try {
      const xMm = this.pixelsToMm(x) + this.config.margins!.left
      const yMm = this.pixelsToMm(y) + this.config.margins!.top
      const widthMm = this.pixelsToMm(width)
      const heightMm = this.pixelsToMm(height)

      this.pdf.addImage(
        signatureBase64,
        'PNG',
        xMm,
        yMm,
        widthMm,
        heightMm,
        undefined,
        'FAST'
      )

      console.log(`✍️ Assinatura adicionada em (${xMm.toFixed(1)}, ${yMm.toFixed(1)})mm`)
    } catch (error) {
      console.error('❌ Erro ao adicionar assinatura:', error)
    }
  }

  /**
   * Salva o PDF como arquivo (método alternativo)
   */
  saveAs(filename: string = 'relatorio.pdf'): void {
    this.pdf.save(filename)
  }

  /**
   * Retorna o PDF como blob
   */
  getBlob(): Blob {
    return this.pdf.output('blob')
  }

  /**
   * Retorna o PDF como base64
   */
  getBase64(): string {
    return this.pdf.output('datauristring')
  }
}

/**
 * Função utilitária para criar relatório simples
 */
export async function generateSimpleReport(
  backgroundImage: string,
  fieldMappings: Record<string, FieldMapping>,
  data: ReportData,
  config?: ReportConfig
): Promise<Uint8Array> {
  try {
    console.log('📄 Iniciando geração de relatório simples...')
    
    const generator = new PDFReportGenerator(config)
    
    const template: PageTemplate = {
      pageNumber: 1,
      backgroundImage,
      imageWidth: 794, // A4 em pixels (96 DPI)
      imageHeight: 1123,
      fields: fieldMappings
    }

    const result = await generator.generateReport([template], data)
    console.log('✅ Relatório simples gerado com sucesso')
    return result
  } catch (error) {
    console.error('❌ Erro na geração de relatório simples:', error)
    throw new Error(`Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Função para converter FormField para FieldMapping
 */
export function convertFormFieldsToMapping(fields: any[]): Record<string, FieldMapping> {
  const mapping: Record<string, FieldMapping> = {}

  fields.forEach(field => {
    if (field.position) {
      // Converter alinhamento do campo para alinhamento do PDF
      const horizontalAlign = field.alignment?.horizontal || 'left'
      const pdfAlign = horizontalAlign === 'center' ? 'center' : 
                      horizontalAlign === 'right' ? 'right' : 'left'

      // Converter família de fonte para jsPDF
      const fontFamily = field.fontStyle?.family || 'helvetica'
      const pdfFontFamily = fontFamily.toLowerCase() === 'times' ? 'times' :
                           fontFamily.toLowerCase() === 'courier' ? 'courier' : 'helvetica'

      // Converter estilo de fonte
      const fontWeight = field.fontStyle?.weight || 'normal'
      const fontStyle = field.fontStyle?.style || 'normal'
      const pdfFontStyle = fontWeight === 'bold' && fontStyle === 'italic' ? 'bolditalic' :
                          fontWeight === 'bold' ? 'bold' :
                          fontStyle === 'italic' ? 'italic' : 'normal'

      mapping[field.name] = {
        x: field.position.x,
        y: field.position.y,
        width: field.position.width,
        height: field.position.height,
        fontSize: field.fontStyle?.size || 10,
        fontFamily: pdfFontFamily,
        fontStyle: pdfFontStyle === 'bolditalic' ? 'bold' : pdfFontStyle,
        color: field.fontStyle?.color || '#0064C8',
        align: pdfAlign,
        type: field.type === 'number' ? 'number' : 
              field.type === 'date' ? 'date' : 
              field.type === 'calculated' ? 'number' : 'text'
      }
    }
  })

  return mapping
}

/**
 * Gera PDF usando a versão correta da imagem de fundo baseada na resposta
 * Esta função garante que PDFs antigos mantenham suas imagens originais
 */
export async function generatePDFWithVersionedBackground(
  templateId: string,
  responseId: string,
  data: ReportData,
  filename?: string
): Promise<void> {
  try {
    console.log('🎯 Gerando PDF com versionamento de imagem de fundo...')
    
    // SEMPRE buscar template atual primeiro para garantir referência correta
    const { supabase } = await import('./supabase')
    const { data: currentTemplate, error: templateError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !currentTemplate) {
      throw new Error('Template não encontrado')
    }

    console.log(`📋 Template encontrado: ${(currentTemplate as any).name}`)
    console.log(`🖼️ Imagens do template: ${(currentTemplate as any).image_paths?.length || 0}`)

    // Tentar obter versão específica para a resposta
    let backgroundVersion = await TemplateBackgroundManager.getBackgroundVersionForResponse(
      responseId,
      templateId
    )

    // Se não há versão específica, usar imagens atuais do template
    if (!backgroundVersion && (currentTemplate as any).image_paths && (currentTemplate as any).image_paths.length > 0) {
      console.log('🔄 Usando imagens atuais do template como fallback')
      
      // Criar versão temporária com imagens atuais
      backgroundVersion = {
        id: 'temp',
        template_id: templateId,
        version_number: 1,
        image_paths: (currentTemplate as any).image_paths,
        pdf_path: (currentTemplate as any).pdf_path,
        is_current: true,
        created_at: new Date().toISOString(),
        created_by: undefined
      }
    }

    if (!backgroundVersion || !backgroundVersion.image_paths || backgroundVersion.image_paths.length === 0) {
      console.warn('⚠️ Nenhuma imagem encontrada, usando fallback')
      return await generateSimplePDFReport(templateId, data, filename)
    }

    console.log(`📸 Usando versão ${backgroundVersion.version_number} da imagem de fundo`)
    console.log(`🖼️ Imagens: ${backgroundVersion.image_paths.join(', ')}`)

    // Usar template já carregado
    const template = currentTemplate

    // Gerar PDF com todas as páginas da versão
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Processar cada página da versão
    for (let pageIndex = 0; pageIndex < backgroundVersion.image_paths.length; pageIndex++) {
      const imagePath = backgroundVersion.image_paths[pageIndex]
      
      console.log(`📸 Processando página ${pageIndex + 1}: ${imagePath}`)
      
      // Adicionar nova página (exceto a primeira)
      if (pageIndex > 0) {
        pdf.addPage()
      }
      
      // Carregar e adicionar imagem de fundo
      try {
        const imageBase64 = await loadImageAsBase64(imagePath)
        if (imageBase64) {
          pdf.addImage(imageBase64, 'PNG', 0, 0, 210, 297)
          console.log(`✅ Página ${pageIndex + 1} adicionada`)
        }
      } catch (imageError) {
        console.error(`❌ Erro ao carregar página ${pageIndex + 1}:`, imageError)
      }
      
      // Adicionar campos apenas na primeira página
      if (pageIndex === 0) {
        const fieldMappings = convertFormFieldsToMapping((template as any).fields || [])
        
        Object.entries(fieldMappings).forEach(([fieldName, mapping]) => {
          const value = data[fieldName]
          if (value) {
            try {
              // Converter posição de pixels para mm
              const x = (mapping.x * 210) / 794
              const y = (mapping.y * 297) / 1123
              
              pdf.setFontSize(mapping.fontSize || 10)
              pdf.setTextColor(0, 100, 200) // Azul
              pdf.text(String(value), x, y)
            } catch (fieldError) {
              console.warn(`⚠️ Erro ao adicionar campo ${fieldName}:`, fieldError)
            }
          }
        })
      }
    }

    // Criar download
    const pdfBlob = pdf.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `relatorio_${(template as any).name}_${responseId.substring(0, 8)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`✅ PDF gerado com sucesso`)
    console.log(`📊 Versão da imagem: ${backgroundVersion.version_number}`)

  } catch (error) {
    console.error('❌ Erro ao gerar PDF com versionamento:', error)
    throw error
  }
}

/**
 * Função de fallback para gerar PDF simples
 */
async function generateSimplePDFReport(
  templateId: string,
  data: ReportData,
  filename?: string
): Promise<void> {
  try {
    console.log('🔄 Usando fallback para geração de PDF...')
    
    // Criar PDF básico sem imagem de fundo
    const pdf = new jsPDF()
    
    // Adicionar título
    pdf.setFontSize(16)
    pdf.text('Relatório de Formulário', 20, 20)
    
    // Adicionar dados
    let yPosition = 40
    Object.entries(data).forEach(([key, value]) => {
      pdf.setFontSize(10)
      pdf.text(`${key}: ${value || 'N/A'}`, 20, yPosition)
      yPosition += 10
    })
    
    // Salvar
    const finalFilename = filename || `relatorio_${templateId.substring(0, 8)}.pdf`
    pdf.save(finalFilename)
    
    console.log('✅ PDF básico gerado com sucesso')
  } catch (error) {
    console.error('❌ Erro no fallback de PDF:', error)
    throw error
  }
}

/**
 * Atualiza a imagem de fundo de um template e cria uma nova versão
 */
export async function updateTemplateBackgroundImages(
  templateId: string,
  newImagePaths: string[],
  newPdfPath?: string,
  userId?: string
): Promise<TemplateBackgroundVersion | null> {
  try {
    console.log('🔄 Atualizando imagem de fundo do template...')
    
    // Criar nova versão da imagem de fundo
    const newVersion = await TemplateBackgroundManager.createNewBackgroundVersion(
      templateId,
      newImagePaths,
      newPdfPath,
      userId
    )

    if (newVersion) {
      console.log(`✅ Nova versão criada: ${newVersion.version_number}`)
      console.log(`📸 Imagens: ${newImagePaths.join(', ')}`)
      
      // A partir de agora, novas respostas usarão esta versão
      // Respostas antigas continuarão usando suas versões originais
    }

    return newVersion
  } catch (error) {
    console.error('❌ Erro ao atualizar imagem de fundo:', error)
    return null
  }
}

/**
 * Função auxiliar para carregar imagem como Base64
 */
async function loadImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    // Se já é base64, retornar diretamente
    if (imagePath.startsWith('data:image/')) {
      return imagePath
    }

    // Se é uma URL, fazer fetch
    if (imagePath.startsWith('http')) {
      const response = await fetch(imagePath)
      const blob = await response.blob()
      
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    }

    // Se é um caminho local, tentar carregar (isso pode não funcionar no browser)
    console.warn(`⚠️ Caminho local detectado: ${imagePath}. Pode não ser possível carregar no browser.`)
    return null

  } catch (error) {
    console.error('❌ Erro ao carregar imagem:', error)
    return null
  }
}