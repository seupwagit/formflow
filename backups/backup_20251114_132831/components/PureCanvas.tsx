'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FormField } from '@/lib/types'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Trash2 } from 'lucide-react'

interface PureCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export default function PureCanvas({ 
  pdfImages, 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField 
}: PureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>('')

  // Dimensões do canvas
  const canvasWidth = 800
  const canvasHeight = 1000

  useEffect(() => {
    if (pdfImages.length > 0) {
      loadPage(currentPage)
    }
  }, [currentPage, pdfImages, zoom])

  useEffect(() => {
    drawCanvas()
  }, [fields, currentPage, selectedField])

  const loadPage = async (pageIndex: number) => {
    if (!canvasRef.current || !pdfImages[pageIndex]) return

    setIsLoading(true)
    console.log(`📄 Carregando página ${pageIndex + 1}/${pdfImages.length}`)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Configurar canvas
    canvas.width = canvasWidth * zoom
    canvas.height = canvasHeight * zoom
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    try {
      // Carregar imagem PNG da página
      const img = new Image()
      img.onload = () => {
        console.log(`✅ PNG carregado: ${img.width}x${img.height}`)
        
        // Desenhar imagem PNG como fundo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Desenhar campos sobre a imagem
        drawCanvas()
        setIsLoading(false)
      }
      
      img.onerror = () => {
        console.error('❌ Erro ao carregar PNG')
        drawFallbackBackground(ctx)
        drawCanvas()
        setIsLoading(false)
      }
      
      img.src = pdfImages[pageIndex]
      
    } catch (error) {
      console.error('❌ Erro ao carregar página:', error)
      drawFallbackBackground(ctx)
      drawCanvas()
      setIsLoading(false)
    }
  }

  const drawFallbackBackground = (ctx: CanvasRenderingContext2D) => {
    // Fundo branco com borda
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
    
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2 * zoom
    ctx.strokeRect(20 * zoom, 20 * zoom, (canvasWidth - 40) * zoom, (canvasHeight - 40) * zoom)
    
    // Título
    ctx.fillStyle = '#374151'
    ctx.font = `bold ${24 * zoom}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(`Página ${currentPage + 1}`, (canvasWidth / 2) * zoom, 80 * zoom)
  }

  const drawCanvas = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Desenhar campos da página atual
    const pageFields = fields.filter(field => field.position.page === currentPage)
    
    pageFields.forEach(field => {
      drawField(ctx, field, field.id === selectedField?.id)
    })
  }

  const drawField = (ctx: CanvasRenderingContext2D, field: FormField, isSelected: boolean) => {
    const x = field.position.x * zoom
    const y = field.position.y * zoom
    const width = field.position.width * zoom
    const height = field.position.height * zoom

    // Cores por tipo
    const colors = {
      text: '#3b82f6',
      number: '#10b981',
      date: '#f59e0b',
      select: '#8b5cf6',
      checkbox: '#ef4444',
      textarea: '#6366f1',
      image: '#ec4899',
      signature: '#14b8a6'
    }

    const color = (colors as any)[field.type] || '#6b7280'

    // Fundo do campo
    ctx.fillStyle = isSelected ? `${color}30` : `${color}15`
    ctx.fillRect(x, y, width, height)

    // Borda do campo
    ctx.strokeStyle = isSelected ? color : `${color}80`
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.strokeRect(x, y, width, height)

    // Label do campo
    ctx.fillStyle = color
    ctx.font = `${12 * zoom}px Arial`
    ctx.textAlign = 'left'
    ctx.fillText(field.label + (field.required ? ' *' : ''), x + 5 * zoom, y - 5 * zoom)

    // Ícone do tipo
    const icons = {
      text: '📝', number: '🔢', date: '📅', select: '📋',
      checkbox: '☑️', textarea: '📄', image: '🖼️', signature: '✍️'
    }
    
    ctx.font = `${14 * zoom}px Arial`
    ctx.fillText((icons as any)[field.type] || '📝', x + width - 20 * zoom, y + 15 * zoom)

    // Handles de redimensionamento se selecionado
    if (isSelected) {
      drawResizeHandles(ctx, x, y, width, height, color)
    }
  }

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) => {
    const handleSize = 8 * zoom
    ctx.fillStyle = color
    
    // Handles nos cantos e meio das bordas
    const handles = [
      { x: x - handleSize/2, y: y - handleSize/2, pos: 'nw' },
      { x: x + width - handleSize/2, y: y - handleSize/2, pos: 'ne' },
      { x: x - handleSize/2, y: y + height - handleSize/2, pos: 'sw' },
      { x: x + width - handleSize/2, y: y + height - handleSize/2, pos: 'se' },
      { x: x + width/2 - handleSize/2, y: y - handleSize/2, pos: 'n' },
      { x: x + width/2 - handleSize/2, y: y + height - handleSize/2, pos: 's' },
      { x: x - handleSize/2, y: y + height/2 - handleSize/2, pos: 'w' },
      { x: x + width - handleSize/2, y: y + height/2 - handleSize/2, pos: 'e' }
    ]
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })
  }

  const getFieldAt = (x: number, y: number): FormField | null => {
    const pageFields = fields.filter(field => field.position.page === currentPage)
    
    // Verificar em ordem reversa (campos no topo primeiro)
    for (let i = pageFields.length - 1; i >= 0; i--) {
      const field = pageFields[i]
      const fx = field.position.x * zoom
      const fy = field.position.y * zoom
      const fw = field.position.width * zoom
      const fh = field.position.height * zoom
      
      if (x >= fx && x <= fx + fw && y >= fy && y <= fy + fh) {
        return field
      }
    }
    
    return null
  }

  const getResizeHandle = (x: number, y: number, field: FormField): string => {
    const fx = field.position.x * zoom
    const fy = field.position.y * zoom
    const fw = field.position.width * zoom
    const fh = field.position.height * zoom
    const handleSize = 8 * zoom
    
    const handles = [
      { x: fx - handleSize/2, y: fy - handleSize/2, w: handleSize, h: handleSize, pos: 'nw' },
      { x: fx + fw - handleSize/2, y: fy - handleSize/2, w: handleSize, h: handleSize, pos: 'ne' },
      { x: fx - handleSize/2, y: fy + fh - handleSize/2, w: handleSize, h: handleSize, pos: 'sw' },
      { x: fx + fw - handleSize/2, y: fy + fh - handleSize/2, w: handleSize, h: handleSize, pos: 'se' }
    ]
    
    for (const handle of handles) {
      if (x >= handle.x && x <= handle.x + handle.w && y >= handle.y && y <= handle.y + handle.h) {
        return handle.pos
      }
    }
    
    return ''
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedField = getFieldAt(x, y)
    
    if (clickedField) {
      onFieldSelect(clickedField)
      
      // Verificar se clicou em handle de redimensionamento
      const handle = getResizeHandle(x, y, clickedField)
      if (handle) {
        setIsResizing(clickedField.id)
        setResizeHandle(handle)
      } else {
        // Iniciar drag
        setIsDragging(clickedField.id)
        setDragOffset({
          x: x - clickedField.position.x * zoom,
          y: y - clickedField.position.y * zoom
        })
      }
    } else {
      onFieldSelect(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging && selectedField) {
      // Mover campo
      const newX = Math.max(0, Math.min((x - dragOffset.x) / zoom, canvasWidth - selectedField.position.width))
      const newY = Math.max(0, Math.min((y - dragOffset.y) / zoom, canvasHeight - selectedField.position.height))
      
      updateFieldPosition(selectedField.id, { x: newX, y: newY })
      
    } else if (isResizing && selectedField) {
      // Redimensionar campo
      resizeField(selectedField, x / zoom, y / zoom)
    }

    // Atualizar cursor
    updateCursor(x, y)
  }

  const handleMouseUp = () => {
    setIsDragging(null)
    setIsResizing(null)
    setResizeHandle('')
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedField = getFieldAt(x, y)
    if (clickedField) {
      onFieldSelect(clickedField)
      // Abrir propriedades (será implementado no componente pai)
    } else {
      // Criar novo campo na posição clicada
      addFieldAt(x / zoom, y / zoom)
    }
  }

  const updateCursor = (x: number, y: number) => {
    if (!canvasRef.current) return

    const field = getFieldAt(x, y)
    let cursor = 'default'
    
    if (field) {
      if (field.id === selectedField?.id) {
        const handle = getResizeHandle(x, y, field)
        if (handle) {
          cursor = handle.includes('n') || handle.includes('s') ? 'ns-resize' :
                   handle.includes('e') || handle.includes('w') ? 'ew-resize' :
                   handle.includes('nw') || handle.includes('se') ? 'nwse-resize' :
                   'nesw-resize'
        } else {
          cursor = 'move'
        }
      } else {
        cursor = 'pointer'
      }
    }
    
    canvasRef.current.style.cursor = cursor
  }

  const updateFieldPosition = (fieldId: string, newPosition: { x: number, y: number }) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId 
        ? { ...field, position: { ...field.position, ...newPosition } }
        : field
    )
    onFieldsChange(updatedFields)
  }

  const resizeField = (field: FormField, mouseX: number, mouseY: number) => {
    const originalPos = field.position
    let newWidth = originalPos.width
    let newHeight = originalPos.height
    let newX = originalPos.x
    let newY = originalPos.y

    switch (resizeHandle) {
      case 'se':
        newWidth = Math.max(50, mouseX - originalPos.x)
        newHeight = Math.max(20, mouseY - originalPos.y)
        break
      case 'sw':
        newWidth = Math.max(50, originalPos.x + originalPos.width - mouseX)
        newHeight = Math.max(20, mouseY - originalPos.y)
        newX = Math.min(mouseX, originalPos.x + originalPos.width - 50)
        break
      case 'ne':
        newWidth = Math.max(50, mouseX - originalPos.x)
        newHeight = Math.max(20, originalPos.y + originalPos.height - mouseY)
        newY = Math.min(mouseY, originalPos.y + originalPos.height - 20)
        break
      case 'nw':
        newWidth = Math.max(50, originalPos.x + originalPos.width - mouseX)
        newHeight = Math.max(20, originalPos.y + originalPos.height - mouseY)
        newX = Math.min(mouseX, originalPos.x + originalPos.width - 50)
        newY = Math.min(mouseY, originalPos.y + originalPos.height - 20)
        break
    }

    const updatedFields = fields.map(f => 
      f.id === field.id 
        ? { ...f, position: { ...f.position, x: newX, y: newY, width: newWidth, height: newHeight } }
        : f
    )
    onFieldsChange(updatedFields)
  }

  const addFieldAt = (x: number, y: number) => {
    const pageFields = fields.filter(f => f.position && f.position.page === currentPage)
    
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_p${currentPage + 1}_${pageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: Math.max(10, Math.min(x - 100, canvasWidth - 210)),
        y: Math.max(10, Math.min(y - 15, canvasHeight - 40)),
        width: 200,
        height: 30,
        page: currentPage
      }
    }

    console.log(`➕ Adicionando campo na posição ${x.toFixed(0)},${y.toFixed(0)}`)
    
    const updatedFields = [...fields, newField]
    onFieldsChange(updatedFields)
    onFieldSelect(newField)
  }

  const deleteSelectedField = () => {
    if (!selectedField) return
    
    const updatedFields = fields.filter(field => field.id !== selectedField.id)
    onFieldsChange(updatedFields)
    onFieldSelect(null)
  }

  const nextPage = () => {
    if (currentPage < pdfImages.length - 1) {
      console.log(`➡️ Próxima página: ${currentPage + 2}`)
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      console.log(`⬅️ Página anterior: ${currentPage}`)
      setCurrentPage(currentPage - 1)
    }
  }

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta))
    console.log(`🔍 Zoom: ${(newZoom * 100).toFixed(0)}%`)
    setZoom(newZoom)
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          {/* Navegação */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {pdfImages.map((_, index) => (
                <option key={index} value={index}>
                  Página {index + 1}
                </option>
              ))}
            </select>
            
            <button
              onClick={nextPage}
              disabled={currentPage === pdfImages.length - 1}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <button onClick={() => handleZoom(-0.2)} className="btn-secondary">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => handleZoom(0.2)} className="btn-secondary">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addFieldAt(100, 100)}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Campo</span>
          </button>
          
          {selectedField && (
            <button
              onClick={deleteSelectedField}
              className="flex items-center space-x-2 btn-secondary text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="bg-white rounded-lg shadow overflow-auto" ref={containerRef}>
        <div className="relative inline-block">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          <canvas
            ref={canvasRef}
            className="border border-gray-200 block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-green-700">
          <div>
            <span className="font-medium">Página {currentPage + 1}:</span>
            <span className="ml-1">{fields.filter(f => f.position && f.position.page === currentPage).length} campos</span>
          </div>
          <div>
            <span className="font-medium">Total:</span>
            <span className="ml-1">{fields.length} campos</span>
          </div>
          <div className="text-xs">
            Canvas HTML5 puro - Clique duplo para adicionar campo
          </div>
        </div>
      </div>
    </div>
  )
}