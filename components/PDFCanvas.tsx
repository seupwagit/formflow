'use client'

import { useEffect, useRef, useState } from 'react'
import { FormField } from '@/lib/types'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface PDFCanvasProps {
  pdfFile: File | null
  fields: FormField[]
  onFieldClick?: (field: FormField) => void
  onFieldMove?: (fieldId: string, newPosition: { x: number; y: number }) => void
  isDesignMode?: boolean
}

export default function PDFCanvas({ 
  pdfFile, 
  fields, 
  onFieldClick, 
  onFieldMove, 
  isDesignMode = false 
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadPDF()
  }, [pdfFile, currentPage, zoom])

  const loadPDF = async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Dimensões padrão do canvas
    const baseWidth = 800
    const baseHeight = 1000
    canvas.width = baseWidth * zoom
    canvas.height = baseHeight * zoom
    
    // Desenhar fundo branco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (pdfFile) {
      try {
        // Tentar carregar PDF real usando PDFProcessor
        await loadRealPDF(ctx, canvas)
      } catch (error) {
        console.warn('⚠️ Erro ao carregar PDF real, usando simulação:', error)
        loadSimulatedPDF(ctx, canvas)
      }
    } else {
      // PDF simulado para demonstração
      loadSimulatedPDF(ctx, canvas)
    }
  }

  const loadRealPDF = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!pdfFile) return
    
    try {
      // Usar SimplePDFProcessor para converter PDF
      const { SimplePDFProcessor } = await import('@/lib/pdf-simple-processor')
      const processor = new SimplePDFProcessor()
      
      const result = await processor.loadPDF(pdfFile)
      
      if (result.imageUrls && result.imageUrls[currentPage]) {
        // Carregar imagem da página atual
        const img = new Image()
        img.onload = () => {
          // Limpar canvas
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Desenhar imagem do PDF redimensionada para o canvas
          const aspectRatio = img.width / img.height
          const canvasAspectRatio = canvas.width / canvas.height
          
          let drawWidth = canvas.width
          let drawHeight = canvas.height
          let offsetX = 0
          let offsetY = 0
          
          if (aspectRatio > canvasAspectRatio) {
            // Imagem mais larga - ajustar altura
            drawHeight = canvas.width / aspectRatio
            offsetY = (canvas.height - drawHeight) / 2
          } else {
            // Imagem mais alta - ajustar largura
            drawWidth = canvas.height * aspectRatio
            offsetX = (canvas.width - drawWidth) / 2
          }
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
          
          // Renderizar campos sobre a imagem
          setTimeout(() => renderFields(), 100)
        }
        img.onerror = () => {
          console.warn('Erro ao carregar imagem, usando fallback')
          loadSimulatedPDF(ctx, canvas)
        }
        img.src = result.imageUrls[currentPage]
        
        setTotalPages(result.pages)
      } else {
        throw new Error('Imagem da página não disponível')
      }
      
    } catch (error) {
      console.error('Erro ao carregar PDF real:', error)
      throw error
    }
  }

  const loadSimulatedPDF = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Simular conteúdo do PDF
    ctx.fillStyle = 'black'
    ctx.font = `${16 * zoom}px Arial`
    ctx.textAlign = 'left'
    
    // Título
    ctx.font = `bold ${20 * zoom}px Arial`
    ctx.fillText('RELATÓRIO DE INSPEÇÃO', 50 * zoom, 60 * zoom)
    
    // Campos simulados
    ctx.font = `${14 * zoom}px Arial`
    ctx.fillText('Nome do Inspetor: ________________', 50 * zoom, 120 * zoom)
    ctx.fillText('Data da Inspeção: ________________', 50 * zoom, 170 * zoom)
    ctx.fillText('Temperatura (°C): ________________', 50 * zoom, 220 * zoom)
    ctx.fillText('Observações: ________________', 50 * zoom, 270 * zoom)
    
    // Borda do documento
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 2
    ctx.strokeRect(20 * zoom, 20 * zoom, canvas.width - 40 * zoom, canvas.height - 40 * zoom)
    
    setTotalPages(1) // Simular 1 página
    
    // Renderizar campos após desenhar o fundo
    setTimeout(() => renderFields(), 100)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesignMode) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    // Verificar se clicou em um campo
    const clickedField = fields.find(field => 
      field.position.page === currentPage &&
      x >= field.position.x && 
      x <= field.position.x + field.position.width &&
      y >= field.position.y && 
      y <= field.position.y + field.position.height
    )

    if (clickedField) {
      setIsDragging(clickedField.id)
      setDragOffset({
        x: x - clickedField.position.x,
        y: y - clickedField.position.y
      })
      onFieldClick?.(clickedField)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isDesignMode) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / zoom - dragOffset.x
    const y = (e.clientY - rect.top) / zoom - dragOffset.y

    onFieldMove?.(isDragging, { x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  const renderFields = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    // Desenhar campos da página atual
    fields
      .filter(field => field.position.page === currentPage)
      .forEach(field => {
        const x = field.position.x * zoom
        const y = field.position.y * zoom
        const width = field.position.width * zoom
        const height = field.position.height * zoom

        // Desenhar borda do campo
        ctx.strokeStyle = isDesignMode ? '#3b82f6' : '#e5e7eb'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)

        // Desenhar fundo semi-transparente
        ctx.fillStyle = isDesignMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.8)'
        ctx.fillRect(x, y, width, height)

        // Desenhar label se estiver em modo design
        if (isDesignMode) {
          ctx.fillStyle = '#1f2937'
          ctx.font = `${12 * zoom}px Arial`
          ctx.fillText(field.label, x, y - 5 * zoom)
        }
      })
  }

  useEffect(() => {
    renderFields()
  }, [fields, currentPage, zoom, isDesignMode])

  return (
    <div className="flex flex-col space-y-4">
      {/* Controles */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="btn-secondary disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="btn-secondary disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="btn-secondary"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="btn-secondary"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg shadow overflow-auto max-h-[600px]">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  )
}