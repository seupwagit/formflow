/**
 * Componente para Geração de Relatórios com Imagem de Fundo
 */

'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Settings, Image, MapPin } from 'lucide-react'
import { FormField } from '@/lib/types'
import { 
  PDFReportGenerator, 
  PageTemplate, 
  ReportData, 
  ReportConfig,
  convertFormFieldsToMapping,
  generateSimpleReport,
  generatePDFWithVersionedBackground
} from '@/lib/pdf-report-generator'
import { useResponseBackground } from '@/lib/hooks/use-response-background'
import { CalculatedFieldEngine } from '@/lib/calculated-field-engine'

interface ReportGeneratorProps {
  fields: FormField[]
  templateImages: string[] // URLs ou base64 das imagens de fundo
  templateName: string
  templateId: string // ID do template para versionamento
  responseId?: string // ID da resposta (para edição)
  initialData?: ReportData // Dados iniciais do formulário
  onClose: () => void
}

export default function ReportGenerator({ 
  fields, 
  templateImages, 
  templateName,
  templateId,
  responseId,
  initialData = {},
  onClose 
}: ReportGeneratorProps) {
  const [reportData, setReportData] = useState<ReportData>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null)
  
  // Hook para garantir associação correta com versão de background
  useResponseBackground(responseId, templateId)
  const [config, setConfig] = useState<ReportConfig>({
    title: `Relatório - ${templateName}`,
    author: 'Sistema FormFlow',
    dpi: 300,
    pageFormat: 'a4',
    orientation: 'portrait',
    defaultFont: {
      family: 'helvetica',
      size: 10,
      style: 'normal',
      color: '#0064C8' // Azul
    }
  })

  // Inicializar dados dos campos
  useEffect(() => {
    const data: ReportData = { ...initialData }
    fields.forEach(field => {
      // Garantir que o campo tenha posição
      if (!field.position) {
        field.position = { x: 0, y: 0, width: 200, height: 35, page: 0 }
      }
      
      if (!(field.name in data)) {
        data[field.name] = field.placeholder || ''
      }
    })
    setReportData(data)
  }, [fields, initialData])

  const handleFieldChange = (fieldName: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      console.log('📄 Iniciando geração de relatório...')
      
      // DECISÃO INTELIGENTE: Qual versão de imagem usar?
      if (responseId && templateId) {
        console.log('🎯 Resposta existente - usando versionamento para manter consistência')
        
        await generatePDFWithVersionedBackground(
          templateId,
          responseId,
          { ...initialData, ...reportData },
          `relatorio_${templateName}_${responseId.substring(0, 8)}.pdf`
        )
        
        alert('✅ PDF gerado com sucesso! (Versão original da imagem mantida)')
        return
      } else {
        console.log('🆕 Nova resposta - usando imagem ATUAL do template')
        // Para novas respostas, usar sempre a imagem atual do template
        // Isso garante que novos relatórios usem a imagem mais recente
      }
      
      // SISTEMA INTELIGENTE DE VERSIONAMENTO DE IMAGENS
      console.log('🔍 Determinando qual versão de imagem usar...')
      console.log(`📋 Template ID: ${templateId}`)
      console.log(`🆔 Response ID: ${responseId || 'Nova resposta'}`)
      console.log(`🖼️ Imagens do template: ${templateImages?.length || 0}`)
      
      let imagesToUse = templateImages || []
      let resolutionMessage = ''
      
      try {
        if (responseId) {
          // RESPOSTA EXISTENTE: Usar versão específica (versionamento)
          console.log('📜 Resposta existente - buscando versão específica da imagem...')
          
          const { ResponseBackgroundManager } = await import('@/lib/response-background-manager')
          const versionResult = await ResponseBackgroundManager.getResponseBackgroundVersion(responseId)
          
          if (versionResult.success && versionResult.images.length > 0) {
            imagesToUse = versionResult.images
            resolutionMessage = `Usando versão específica: ${versionResult.message}`
            console.log(`✅ Versão específica encontrada: ${versionResult.images.length} imagem(ns)`)
            versionResult.images.forEach((img, index) => {
              console.log(`   ${index + 1}. ${img}`)
            })
          } else {
            console.log('⚠️ Versão específica não encontrada, usando imagem atual do template')
            resolutionMessage = `Fallback para atual: ${versionResult.message}`
          }
        } else {
          // NOVA RESPOSTA: Usar imagem ATUAL do template
          console.log('🆕 Nova resposta - usando imagem ATUAL do template')
          resolutionMessage = 'Nova resposta - usando imagem atual'
        }
        
        // Se ainda não temos imagens válidas, usar o resolver robusto
        if (imagesToUse.length === 0) {
          console.log('🔧 Sem imagens válidas, usando resolver robusto...')
          
          const { TemplateImageResolver } = await import('@/lib/template-image-resolver')
          const resolution = await TemplateImageResolver.ensureTemplateHasImages(templateId)
          
          if (resolution.success) {
            imagesToUse = resolution.images
            resolutionMessage += ` + Resolver: ${resolution.message}`
            
            if (resolution.wasFixed) {
              console.log('🔧 Template foi corrigido automaticamente!')
            }
          } else {
            console.warn(`⚠️ Resolver falhou: ${resolution.message}`)
            resolutionMessage += ` + Erro: ${resolution.message}`
            
            // Último recurso: usar imagens da prop
            if (templateImages && templateImages.length > 0) {
              imagesToUse = templateImages
              resolutionMessage += ' (usando prop como último recurso)'
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Erro no sistema de versionamento:', error)
        resolutionMessage = `Erro no versionamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        
        // Fallback para imagens da prop
        if (templateImages && templateImages.length > 0) {
          imagesToUse = templateImages
          resolutionMessage += ' (fallback para prop)'
        }
      }
      
      console.log(`📊 Resultado final: ${resolutionMessage}`)
      console.log(`🎯 Imagens a usar: ${imagesToUse.length}`)
      imagesToUse.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.substring(0, 80)}...`)
      })
      
      // Verificar se há imagens do template
      if (!imagesToUse || imagesToUse.length === 0) {
        console.log('⚠️ Template sem imagens, gerando PDF básico...')
        
        try {
          // Gerar PDF básico sem imagem de fundo
          const { jsPDF } = await import('jspdf')
          const pdf = new jsPDF()
          
          // Adicionar título
          pdf.setFontSize(16)
          pdf.text(`Relatório: ${templateName}`, 20, 20)
          
          // Adicionar dados
          let yPosition = 40
          const allData = { ...initialData, ...reportData }
          
          Object.entries(allData).forEach(([key, value]) => {
            if (yPosition > 280) { // Nova página se necessário
              pdf.addPage()
              yPosition = 20
            }
            
            pdf.setFontSize(10)
            const fieldLabel = fields.find(f => f.name === key)?.label || key
            pdf.text(`${fieldLabel}: ${value || 'N/A'}`, 20, yPosition)
            yPosition += 10
          })
          
          // Criar URL para download
          const pdfBlob = pdf.output('blob')
          const url = URL.createObjectURL(pdfBlob)
          setGeneratedPdfUrl(url)
          
          console.log('✅ PDF básico gerado com sucesso!')
          return
          
        } catch (error) {
          console.error('❌ Erro ao gerar PDF básico:', error)
          throw new Error('Falha ao gerar PDF básico')
        }
      }
      
      // Gerar PDF com múltiplas páginas e imagens de fundo
      await generateMultiPagePDF(imagesToUse, fields, { ...initialData, ...reportData }, templateName)
      
      console.log('✅ Relatório gerado com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar relatório'
      alert(`Erro ao gerar relatório:\n\n${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Gera PDF com múltiplas páginas e imagens de fundo
   */
  const generateMultiPagePDF = async (
    imageUrls: string[], 
    formFields: any[], 
    data: any, 
    templateName: string
  ) => {
    try {
      console.log(`📄 Gerando PDF com ${imageUrls.length} página(s)...`)
      console.log(`🖼️ URLs das imagens:`, imageUrls)
      
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      let successfulPages = 0
      let failedPages = 0

      // Processar cada página
      for (let pageIndex = 0; pageIndex < imageUrls.length; pageIndex++) {
        const imageUrl = imageUrls[pageIndex]
        
        console.log(`📸 Processando página ${pageIndex + 1}/${imageUrls.length}: ${imageUrl}`)
        
        // Adicionar nova página (exceto a primeira)
        if (pageIndex > 0) {
          pdf.addPage()
        }
        
        // Carregar e adicionar imagem de fundo
        let imageAdded = false
        try {
          const imageBase64 = await loadImageAsBase64(imageUrl)
          if (imageBase64) {
            // Adicionar imagem ocupando toda a página A4
            pdf.addImage(imageBase64, 'PNG', 0, 0, 210, 297)
            console.log(`✅ Imagem de fundo adicionada na página ${pageIndex + 1}`)
            imageAdded = true
            successfulPages++
          } else {
            console.warn(`⚠️ Não foi possível carregar imagem da página ${pageIndex + 1}`)
            failedPages++
          }
        } catch (imageError) {
          console.error(`❌ Erro ao carregar imagem da página ${pageIndex + 1}:`, imageError)
          failedPages++
        }
        
        // Se não conseguiu adicionar a imagem, adicionar um placeholder
        if (!imageAdded) {
          console.log(`🔄 Adicionando placeholder para página ${pageIndex + 1}`)
          
          // Adicionar retângulo de fundo cinza claro
          pdf.setFillColor(245, 245, 245)
          pdf.rect(0, 0, 210, 297, 'F')
          
          // Adicionar texto indicativo
          pdf.setFontSize(16)
          pdf.setTextColor(150, 150, 150)
          pdf.text('Imagem não disponível', 105, 148.5, { align: 'center' })
          pdf.setFontSize(12)
          pdf.text(`Página ${pageIndex + 1}`, 105, 160, { align: 'center' })
          pdf.setFontSize(10)
          pdf.text(imageUrl, 105, 170, { align: 'center', maxWidth: 180 })
        }
        
        // Adicionar campos de dados (apenas na primeira página)
        if (pageIndex === 0) {
          console.log(`📝 Adicionando ${formFields.length} campo(s) na primeira página...`)
          
          let fieldsAdded = 0
          formFields.forEach(field => {
            if (field.position && data[field.name]) {
              try {
                // Converter posição de pixels para mm
                // Assumindo que as coordenadas são baseadas em uma imagem de ~794x1123 pixels
                const x = (field.position.x * 210) / 794 // Proporção para largura A4 (210mm)
                const y = (field.position.y * 297) / 1123 // Proporção para altura A4 (297mm)
                const width = (field.position.width * 210) / 794 // Largura proporcional
                const height = (field.position.height * 297) / 1123 // Altura proporcional
                
                // Validar coordenadas
                if (x < 0 || x > 210 || y < 0 || y > 297) {
                  console.warn(`⚠️ Coordenadas fora dos limites para campo ${field.name}: (${x.toFixed(1)}, ${y.toFixed(1)})`)
                  return
                }
                
                // Configurar fonte baseada nas configurações do campo
                const fontSize = field.fontStyle?.size || config.defaultFont?.size || 10
                pdf.setFontSize(fontSize)
                
                // Configurar cor baseada nas configurações do campo
                const fontColor = field.fontStyle?.color || config.defaultFont?.color || '#0064C8'
                const [r, g, b] = hexToRgb(fontColor)
                pdf.setTextColor(r, g, b)
                
                // Configurar estilo da fonte
                const fontWeight = field.fontStyle?.weight || 'normal'
                const fontStyleType = field.fontStyle?.style || 'normal'
                let pdfFontStyle = 'normal'
                
                if (fontWeight === 'bold' && fontStyleType === 'italic') {
                  pdfFontStyle = 'bolditalic'
                } else if (fontWeight === 'bold' || fontWeight === 'bolder') {
                  pdfFontStyle = 'bold'
                } else if (fontStyleType === 'italic' || fontStyleType === 'oblique') {
                  pdfFontStyle = 'italic'
                }
                
                // Mapear família da fonte
                const fontFamily = field.fontStyle?.family || 'helvetica'
                let pdfFontFamily = 'helvetica'
                
                switch (fontFamily.toLowerCase()) {
                  case 'arial':
                  case 'helvetica':
                    pdfFontFamily = 'helvetica'
                    break
                  case 'times':
                    pdfFontFamily = 'times'
                    break
                  case 'courier':
                    pdfFontFamily = 'courier'
                    break
                  default:
                    pdfFontFamily = 'helvetica'
                }
                
                pdf.setFont(pdfFontFamily, pdfFontStyle)
                
                // Obter valor do campo
                let fieldValue = String(data[field.name] || '').trim()
                
                // Para campos calculados, calcular o valor se necessário
                if (field.type === 'calculated' && field.calculatedConfig) {
                  try {
                    const engine = CalculatedFieldEngine.getInstance()
                    
                    // Inicializar com todos os campos e dados
                    const allFieldsForCalc = formFields || []
                    engine.initialize(allFieldsForCalc, data)
                    
                    // Calcular valor
                    const calculatedValue = engine.getCalculatedValue(field.name)
                    if (calculatedValue !== null) {
                      // Formatar o valor baseado na configuração
                      fieldValue = engine.formatValue(calculatedValue, field.calculatedConfig)
                    }
                  } catch (error) {
                    console.error('❌ Erro ao calcular campo:', error)
                    fieldValue = 'Erro no cálculo'
                  }
                }
                
                if (fieldValue) {
                  // 🎯 APLICAR ALINHAMENTO BASEADO NAS CONFIGURAÇÕES DO CAMPO
                  console.log(`🎯 Aplicando alinhamento para campo "${field.name}":`, field.alignment)
                  
                  const textAlign = field.alignment?.horizontal || 'left'
                  const verticalAlign = field.alignment?.vertical || 'middle'
                  
                  let textX = x
                  let alignOption: any = undefined
                  
                  // ✅ ALINHAMENTO HORIZONTAL CORRIGIDO
                  switch (textAlign) {
                    case 'center':
                      textX = x + (width / 2)
                      alignOption = { align: 'center' }
                      console.log(`   📍 Alinhamento horizontal: CENTER - X: ${textX.toFixed(1)}mm`)
                      break
                    case 'right':
                      textX = x + width - 1 // Margem de 1mm da borda direita
                      alignOption = { align: 'right' }
                      console.log(`   📍 Alinhamento horizontal: RIGHT - X: ${textX.toFixed(1)}mm`)
                      break
                    case 'left':
                    default:
                      textX = x + 1 // Margem de 1mm da borda esquerda
                      alignOption = { align: 'left' }
                      console.log(`   📍 Alinhamento horizontal: LEFT - X: ${textX.toFixed(1)}mm`)
                      break
                  }
                  
                  // ✅ ALINHAMENTO VERTICAL CORRIGIDO
                  let textY = y
                  
                  switch (verticalAlign) {
                    case 'middle':
                      textY = y + (height / 2) + (fontSize * 0.15) // Ajuste para centralizar na linha de base
                      console.log(`   📍 Alinhamento vertical: MIDDLE - Y: ${textY.toFixed(1)}mm`)
                      break
                    case 'bottom':
                      textY = y + height - (fontSize * 0.3) // Margem da borda inferior ajustada
                      console.log(`   📍 Alinhamento vertical: BOTTOM - Y: ${textY.toFixed(1)}mm`)
                      break
                    case 'top':
                    default:
                      textY = y + (fontSize * 0.7) // Ajuste para baseline da fonte no topo
                      console.log(`   📍 Alinhamento vertical: TOP - Y: ${textY.toFixed(1)}mm`)
                      break
                  }
                  
                  // Verificar se o texto precisa ser quebrado
                  const maxWidth = width - 2 // Margem de 2mm
                  
                  if (field.type === 'textarea' || fieldValue.length > 30) {
                    // 📝 CAMPOS DE TEXTO LONGO - MÚLTIPLAS LINHAS
                    const lines = pdf.splitTextToSize(fieldValue, maxWidth)
                    console.log(`   📝 Texto longo dividido em ${Array.isArray(lines) ? lines.length : 1} linha(s)`)
                    
                    if (Array.isArray(lines)) {
                      // Ajustar posição Y inicial para alinhamento vertical em múltiplas linhas
                      let startY = textY
                      const totalTextHeight = lines.length * fontSize * 0.4
                      
                      if (verticalAlign === 'middle') {
                        startY = y + (height / 2) - (totalTextHeight / 2) + (fontSize * 0.3)
                      } else if (verticalAlign === 'bottom') {
                        startY = y + height - totalTextHeight - (fontSize * 0.2)
                      }
                      
                      lines.forEach((line: string, lineIndex: number) => {
                        const lineY = startY + (lineIndex * fontSize * 0.4)
                        if (lineY < y + height && lineY > y) { // Verificar se ainda está dentro do campo
                          pdf.text(line, textX, lineY, alignOption)
                          console.log(`     📄 Linha ${lineIndex + 1}: "${line}" em Y: ${lineY.toFixed(1)}mm`)
                        }
                      })
                    } else {
                      pdf.text(lines, textX, textY, alignOption)
                    }
                  } else {
                    // 📝 CAMPOS SIMPLES - UMA LINHA
                    const displayValue = fieldValue.length > 50 
                      ? fieldValue.substring(0, 47) + '...' 
                      : fieldValue
                    
                    pdf.text(displayValue, textX, textY, alignOption)
                    console.log(`   📄 Texto simples: "${displayValue}" em (${textX.toFixed(1)}, ${textY.toFixed(1)})mm`)
                  }
                  
                  // 🎨 APLICAR DECORAÇÃO DE TEXTO (SUBLINHADO)
                  const textDecoration = field.fontStyle?.decoration
                  if (textDecoration === 'underline') {
                    const displayValue = fieldValue.length > 50 
                      ? fieldValue.substring(0, 47) + '...' 
                      : fieldValue
                    const textWidth = pdf.getTextWidth(displayValue)
                    const underlineY = textY + (fontSize * 0.1)
                    
                    // ✅ AJUSTAR POSIÇÃO X DO SUBLINHADO BASEADA NO ALINHAMENTO
                    let underlineX = textX
                    if (textAlign === 'center') {
                      underlineX = textX - (textWidth / 2)
                    } else if (textAlign === 'right') {
                      underlineX = textX - textWidth
                    }
                    
                    // Desenhar linha de sublinhado
                    pdf.setLineWidth(0.1)
                    pdf.setDrawColor(hexToRgb(fontColor)[0], hexToRgb(fontColor)[1], hexToRgb(fontColor)[2])
                    pdf.line(underlineX, underlineY, underlineX + textWidth, underlineY)
                    console.log(`   🎨 Sublinhado aplicado de (${underlineX.toFixed(1)}, ${underlineY.toFixed(1)}) até (${(underlineX + textWidth).toFixed(1)}, ${underlineY.toFixed(1)})`)
                  }
                  
                  console.log(`✅ Campo "${field.label || field.name}" renderizado:`)
                  console.log(`   📍 Posição: (${textX.toFixed(1)}, ${textY.toFixed(1)})mm`)
                  console.log(`   🎯 Alinhamento: ${textAlign}/${verticalAlign}`)
                  console.log(`   🎨 Fonte: ${pdfFontFamily}/${pdfFontStyle}/${fontSize}pt`)
                  console.log(`   🌈 Cor: ${fontColor}`)
                  console.log(`   📝 Valor: "${fieldValue}"`)
                  console.log(`   📐 Área: ${width.toFixed(1)}x${height.toFixed(1)}mm`)
                  fieldsAdded++
                }
              } catch (fieldError) {
                console.warn(`⚠️ Erro ao adicionar campo ${field.name}:`, fieldError)
              }
            }
          })
          
          console.log(`✅ ${fieldsAdded} campo(s) adicionado(s) com sucesso`)
        }
      }
      
      // Relatório de status
      console.log(`📊 Relatório de geração:`)
      console.log(`   ✅ Páginas com imagem: ${successfulPages}`)
      console.log(`   ⚠️ Páginas com placeholder: ${failedPages}`)
      console.log(`   📄 Total de páginas: ${imageUrls.length}`)
      
      // Criar URL para download
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setGeneratedPdfUrl(url)
      
      console.log(`✅ PDF com ${imageUrls.length} página(s) gerado com sucesso!`)
      
      // Mostrar alerta se houve falhas
      if (failedPages > 0) {
        alert(`⚠️ PDF gerado com ${failedPages} página(s) sem imagem de fundo.\n\nVerifique a conectividade e tente novamente se necessário.`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar PDF multi-página:', error)
      
      // Fallback: PDF básico
      console.log('🔄 Tentando fallback para PDF básico...')
      await generateFallbackPDF(data, templateName)
    }
  }

  /**
   * Carrega imagem como Base64 com múltiplas tentativas e fallbacks
   */
  const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      console.log(`🔍 Carregando imagem: ${imageUrl}`)
      
      // Se já é base64, retornar diretamente
      if (imageUrl.startsWith('data:image/')) {
        console.log('✅ Imagem já está em Base64')
        return imageUrl
      }

      // Validar URL
      if (!imageUrl.startsWith('http')) {
        console.error('❌ URL inválida (não começa com http):', imageUrl)
        return null
      }

      // Tentativa 1: Fetch direto
      try {
        console.log('🔄 Tentativa 1: Fetch direto...')
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        console.log(`✅ Blob obtido: ${blob.size} bytes, tipo: ${blob.type}`)
        
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Erro ao converter para Base64'))
          reader.readAsDataURL(blob)
        })
        
        console.log(`✅ Conversão Base64 concluída: ${base64.length} caracteres`)
        return base64
        
      } catch (fetchError) {
        console.warn('⚠️ Fetch direto falhou:', fetchError)
      }

      // Tentativa 2: Usando Image element como proxy
      try {
        console.log('🔄 Tentativa 2: Usando Image element...')
        
        const img = new (window as any).Image()
        img.crossOrigin = 'anonymous'
        
        const base64 = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              
              if (!ctx) {
                reject(new Error('Não foi possível obter contexto do canvas'))
                return
              }
              
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)
              
              const dataURL = canvas.toDataURL('image/png')
              console.log(`✅ Canvas convertido: ${img.width}x${img.height}`)
              resolve(dataURL)
            } catch (canvasError) {
              reject(canvasError)
            }
          }
          
          img.onerror = () => reject(new Error('Erro ao carregar imagem'))
          
          // Timeout de 10 segundos
          setTimeout(() => reject(new Error('Timeout ao carregar imagem')), 10000)
        })
        
        img.src = imageUrl
        return base64
        
      } catch (imageError) {
        console.warn('⚠️ Image element falhou:', imageError)
      }

      // Tentativa 3: Fetch sem CORS (pode funcionar para algumas URLs)
      try {
        console.log('🔄 Tentativa 3: Fetch sem CORS...')
        const response = await fetch(imageUrl, {
          mode: 'no-cors'
        })
        
        // No-cors não permite acessar o conteúdo, então esta tentativa é limitada
        console.log('⚠️ Fetch no-cors não permite acesso ao conteúdo')
        
      } catch (noCorsError) {
        console.warn('⚠️ Fetch no-cors falhou:', noCorsError)
      }

      console.error('❌ Todas as tentativas de carregamento falharam')
      return null
      
    } catch (error) {
      console.error('❌ Erro geral ao carregar imagem:', error)
      return null
    }
  }

  /**
   * Converte cor hexadecimal para RGB
   */
  const hexToRgb = (hex: string): [number, number, number] => {
    // Remove o # se presente
    hex = hex.replace('#', '')
    
    // Se for cor de 3 dígitos, expandir para 6
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('')
    }
    
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    return [r, g, b]
  }

  /**
   * Gera PDF básico como fallback
   */
  const generateFallbackPDF = async (data: any, templateName: string) => {
    try {
      console.log('🔄 Gerando PDF fallback...')
      
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      
      // Título
      pdf.setFontSize(16)
      pdf.text(`Relatório: ${templateName}`, 20, 20)
      
      // Dados
      let yPosition = 40
      Object.entries(data).forEach(([key, value]) => {
        if (yPosition > 280) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(10)
        const fieldLabel = fields.find(f => f.name === key)?.label || key
        pdf.text(`${fieldLabel}: ${value || 'N/A'}`, 20, yPosition)
        yPosition += 10
      })
      
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setGeneratedPdfUrl(url)
      
      console.log('✅ PDF fallback gerado')
    } catch (error) {
      console.error('❌ Erro no fallback:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const downloadReport = () => {
    if (generatedPdfUrl) {
      const link = document.createElement('a')
      link.href = generatedPdfUrl
      link.download = `relatorio_${templateName.toLowerCase().replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const previewReport = () => {
    if (generatedPdfUrl) {
      window.open(generatedPdfUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Gerador de Relatórios</h3>
              <p className="text-sm text-gray-500">Template: {templateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Painel de Dados */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-green-600" />
              <h4 className="font-medium">Dados do Relatório</h4>
            </div>
            
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : 
                          field.type === 'date' ? 'date' : 'text'}
                    value={String(reportData[field.name] || '')}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Posição: {field.position ? `(${field.position.x}, ${field.position.y})` : 'Não definida'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Painel de Configuração e Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Configurações */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium">Configurações</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Formato
                    </label>
                    <select
                      value={config.pageFormat}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        pageFormat: e.target.value as any 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Carta</option>
                      <option value="legal">Ofício</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orientação
                    </label>
                    <select
                      value={config.orientation}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        orientation: e.target.value as any 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="portrait">Retrato</option>
                      <option value="landscape">Paisagem</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tamanho da Fonte
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={config.defaultFont?.size || 10}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        defaultFont: {
                          ...prev.defaultFont!,
                          size: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DPI
                    </label>
                    <select
                      value={config.dpi}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        dpi: parseInt(e.target.value) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={150}>150 DPI (Rápido)</option>
                      <option value={300}>300 DPI (Padrão)</option>
                      <option value={600}>600 DPI (Alta Qualidade)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Image className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Template</h4>
                </div>
                
                <div className={`p-4 rounded-lg ${templateImages.length === 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600">
                    <strong>Páginas:</strong> {templateImages.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Campos:</strong> {fields.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Resolução:</strong> 794x1123 pixels (A4)
                  </p>
                  
                  {templateImages.length === 0 && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                      <p className="text-sm text-red-800 font-medium">⚠️ Sem imagens de fundo</p>
                      <p className="text-xs text-red-700 mt-1">
                        Este template não possui imagens de fundo. Abra o template no designer e carregue o PDF novamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                <button
                  onClick={generateReport}
                  disabled={isGenerating || templateImages.length === 0}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  title={templateImages.length === 0 ? 'Template sem imagens de fundo' : 'Gerar relatório PDF'}
                >
                  <FileText className="h-5 w-5" />
                  <span>
                    {isGenerating ? 'Gerando...' : 
                     templateImages.length === 0 ? 'Sem Imagens' : 
                     'Gerar Relatório'}
                  </span>
                </button>

                {generatedPdfUrl && (
                  <div className="flex space-x-2">
                    <button
                      onClick={previewReport}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Visualizar</span>
                    </button>
                    
                    <button
                      onClick={downloadReport}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}