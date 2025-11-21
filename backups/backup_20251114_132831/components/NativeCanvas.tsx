'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FormField } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus, Trash2, ZoomIn, ZoomOut, MousePointer, Move, Square, AlignLeft, AlignCenter, AlignRight, AlignJustify, Copy, Settings, Grid, Undo, Redo, Download, Upload } from 'lucide-react'
import { useMultiSelection } from '@/lib/useMultiSelection'
import SelectionBox from './SelectionBox'
import MultiSelectionInfo from './MultiSelectionInfo'

type CanvasTool = 'select' | 'move' | 'resize' | 'add'

interface NativeCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
  onOpenProperties?: () => void
}

interface HistoryState {
  fields: FormField[]
  timestamp: number
}

export default function NativeCanvas({ 
  pdfImages, 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField,
  onOpenProperties
}: NativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragField, setDragField] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  // Dimensões A4 em pixels (210x297mm a 96 DPI ≈ 794x1123px)
  const [canvasSize] = useState({ width: 794, height: 1123 })
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [currentTool, setCurrentTool] = useState<CanvasTool>('select')
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null>(null)
  const [hoverHandle, setHoverHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null>(null)
  const [cursorStyle, setCursorStyle] = useState('default')
  
  // Novas funcionalidades
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize] = useState(10)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  
  // Hook de seleção múltipla
  const multiSelection = useMultiSelection()
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [copiedField, setCopiedField] = useState<FormField | null>(null)
  const [availableTables, setAvailableTables] = useState<string[]>([])

  // Usar função utilitária para filtrar campos por página
  const { getFieldsByPage } = require('@/lib/field-utils')
  const currentPageFields = getFieldsByPage(fields, currentPage)

  // Constantes para detecção de bordas
  const RESIZE_HANDLE_SIZE = 8 // Área sensível para redimensionamento (pixels)
  const CORNER_SIZE = 12 // Área dos cantos para redimensionamento diagonal

  // Função para snap to grid
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }, [snapToGrid, gridSize])

  // Função para adicionar ao histórico
  const addToHistory = useCallback((newFields: FormField[]) => {
    const newState: HistoryState = {
      fields: JSON.parse(JSON.stringify(newFields)),
      timestamp: Date.now()
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    
    // Limitar histórico a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }
    
    setHistory(newHistory)
  }, [history, historyIndex])

  // Função para desfazer
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onFieldsChange(history[newIndex].fields)
    }
  }, [historyIndex, history, onFieldsChange])

  // Função para refazer
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onFieldsChange(history[newIndex].fields)
    }
  }, [historyIndex, history, onFieldsChange])

  // Carregar tabelas disponíveis do banco
  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await fetch('/api/tables')
        if (response.ok) {
          const tables = await response.json()
          setAvailableTables(tables.map((t: any) => t.table_name))
        }
      } catch (error) {
        console.error('Erro ao carregar tabelas:', error)
      }
    }
    loadTables()
  }, [])

  // Função para detectar se o mouse está sobre uma borda de redimensionamento
  const getResizeHandle = useCallback((mouseX: number, mouseY: number, field: FormField): string | null => {
    if (!field.position) return null

    const { x, y, width, height } = field.position
    const scaledX = x * scale
    const scaledY = y * scale
    const scaledWidth = width * scale
    const scaledHeight = height * scale

    // Verificar cantos primeiro (prioridade maior)
    // Canto sudeste (SE)
    if (mouseX >= scaledX + scaledWidth - CORNER_SIZE && mouseX <= scaledX + scaledWidth + RESIZE_HANDLE_SIZE &&
        mouseY >= scaledY + scaledHeight - CORNER_SIZE && mouseY <= scaledY + scaledHeight + RESIZE_HANDLE_SIZE) {
      return 'se'
    }
    
    // Canto sudoeste (SW)
    if (mouseX >= scaledX - RESIZE_HANDLE_SIZE && mouseX <= scaledX + CORNER_SIZE &&
        mouseY >= scaledY + scaledHeight - CORNER_SIZE && mouseY <= scaledY + scaledHeight + RESIZE_HANDLE_SIZE) {
      return 'sw'
    }
    
    // Canto nordeste (NE)
    if (mouseX >= scaledX + scaledWidth - CORNER_SIZE && mouseX <= scaledX + scaledWidth + RESIZE_HANDLE_SIZE &&
        mouseY >= scaledY - RESIZE_HANDLE_SIZE && mouseY <= scaledY + CORNER_SIZE) {
      return 'ne'
    }
    
    // Canto noroeste (NW)
    if (mouseX >= scaledX - RESIZE_HANDLE_SIZE && mouseX <= scaledX + CORNER_SIZE &&
        mouseY >= scaledY - RESIZE_HANDLE_SIZE && mouseY <= scaledY + CORNER_SIZE) {
      return 'nw'
    }

    // Verificar bordas
    // Borda direita (E)
    if (mouseX >= scaledX + scaledWidth - RESIZE_HANDLE_SIZE && mouseX <= scaledX + scaledWidth + RESIZE_HANDLE_SIZE &&
        mouseY >= scaledY + CORNER_SIZE && mouseY <= scaledY + scaledHeight - CORNER_SIZE) {
      return 'e'
    }
    
    // Borda esquerda (W)
    if (mouseX >= scaledX - RESIZE_HANDLE_SIZE && mouseX <= scaledX + RESIZE_HANDLE_SIZE &&
        mouseY >= scaledY + CORNER_SIZE && mouseY <= scaledY + scaledHeight - CORNER_SIZE) {
      return 'w'
    }
    
    // Borda inferior (S)
    if (mouseY >= scaledY + scaledHeight - RESIZE_HANDLE_SIZE && mouseY <= scaledY + scaledHeight + RESIZE_HANDLE_SIZE &&
        mouseX >= scaledX + CORNER_SIZE && mouseX <= scaledX + scaledWidth - CORNER_SIZE) {
      return 's'
    }
    
    // Borda superior (N)
    if (mouseY >= scaledY - RESIZE_HANDLE_SIZE && mouseY <= scaledY + RESIZE_HANDLE_SIZE &&
        mouseX >= scaledX + CORNER_SIZE && mouseX <= scaledX + scaledWidth - CORNER_SIZE) {
      return 'n'
    }

    return null
  }, [scale])

  // Função para obter o cursor apropriado para cada handle
  const getCursorForHandle = useCallback((handle: string | null): string => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nw-resize'
      case 'ne':
      case 'sw':
        return 'ne-resize'
      case 'n':
      case 's':
        return 'ns-resize'
      case 'e':
      case 'w':
        return 'ew-resize'
      default:
        return 'default'
    }
  }, []) 
 // Função para testar se a imagem está acessível
  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      console.log(`🔍 Teste de URL da imagem: ${url}`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      return response.ok
    } catch (error) {
      console.error(`❌ Erro ao testar URL da imagem: ${url}`, error)
      return false
    }
  }

  // Carregar imagem de fundo (PNG convertido, não PDF original)
  useEffect(() => {
    console.log('🔄 Carregando imagem PNG de fundo:', { 
      currentPage, 
      totalImages: pdfImages?.length, 
      imageUrl: pdfImages?.[currentPage],
      isPNG: pdfImages?.[currentPage]?.includes('data:image/png'),
      allImages: pdfImages?.map((url, i) => ({ 
        page: i, 
        isPNG: url.includes('data:image/png'),
        size: url.length 
      }))
    })
    
    if (pdfImages && pdfImages[currentPage]) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        console.log('✅ Imagem PDF carregada como background:', {
          url: pdfImages[currentPage],
          width: img.width,
          height: img.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        })
        setBackgroundImage(img)
      }
      
      img.onerror = (error) => {
        console.error('❌ Erro ao carregar imagem PDF:', {
          error,
          url: pdfImages[currentPage],
          isDataUrl: pdfImages[currentPage].startsWith('data:'),
          urlLength: pdfImages[currentPage].length
        })
        setBackgroundImage(null)
      }
      
      // Verificar se é PNG (deve ser sempre PNG, nunca PDF)
      if (pdfImages[currentPage].startsWith('data:image/png')) {
        console.log('✅ Carregando PNG Data URL, tamanho:', pdfImages[currentPage].length)
        img.src = pdfImages[currentPage]
      } else if (pdfImages[currentPage].startsWith('data:')) {
        console.warn('⚠️ Data URL não é PNG:', pdfImages[currentPage].substring(0, 50))
        img.src = pdfImages[currentPage]
      } else {
        console.log('🌐 Carregando PNG de URL externa:', pdfImages[currentPage])
        
        // Verificar se a URL aponta para uma imagem PNG
        if (pdfImages[currentPage].includes('.png') || pdfImages[currentPage].includes('processed-images')) {
          console.log('✅ URL parece ser PNG do Supabase Storage')
        } else {
          console.warn('⚠️ URL pode não ser PNG:', pdfImages[currentPage])
        }
        
        // Testar se a URL está acessível
        testImageUrl(pdfImages[currentPage]).then(isAccessible => {
          console.log(`🔍 URL acessível: ${isAccessible}`)
          if (!isAccessible) {
            console.warn('⚠️ URL da imagem não está acessível, pode haver problema de CORS ou URL inválida')
          }
        })
        
        // Para URLs normais, adicionar timestamp para evitar cache
        img.src = `${pdfImages[currentPage]}?t=${Date.now()}`
      }
    } else {
      console.log('❌ Nenhuma imagem disponível para a página', currentPage, {
        hasImages: !!pdfImages,
        imageCount: pdfImages?.length,
        requestedPage: currentPage
      })
      setBackgroundImage(null)
    }
  }, [currentPage, pdfImages])

  // Redesenhar canvas quando campos mudarem
  useEffect(() => {
    redrawCanvas()
  }, [fields, currentPage, selectedField, backgroundImage])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('select')
            e.preventDefault()
          }
          break
        case 'm':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('move')
            e.preventDefault()
          }
          break
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('resize')
            e.preventDefault()
          }
          break
        case 'a':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('add')
            e.preventDefault()
          }
          break
        case 'delete':
        case 'backspace':
          if (selectedField) {
            deleteSelectedFields()
            e.preventDefault()
          }
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            duplicateFields()
            e.preventDefault()
          }
          break
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            copyField()
            e.preventDefault()
          }
          break
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            pasteField()
            e.preventDefault()
          }
          break
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            e.preventDefault()
          }
          break
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            redo()
            e.preventDefault()
          }
          break
        case 'p':
          if (!e.ctrlKey && !e.metaKey && selectedField) {
            onOpenProperties?.()
            e.preventDefault()
          }
          break
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            setSnapToGrid(!snapToGrid)
            e.preventDefault()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedField, snapToGrid, undo, redo]) 
 const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Desenhar fundo
    if (backgroundImage) {
      console.log('🎨 Renderizando background:', {
        canvasSize,
        imageSize: { width: backgroundImage.width, height: backgroundImage.height }
      })
      
      // Calcular escala para ajustar a imagem ao canvas mantendo proporção
      const scaleX = canvasSize.width / backgroundImage.width
      const scaleY = canvasSize.height / backgroundImage.height
      const imageScale = Math.min(scaleX, scaleY) // Usar min para manter toda a imagem visível
      
      const scaledWidth = backgroundImage.width * imageScale
      const scaledHeight = backgroundImage.height * imageScale
      const x = (canvasSize.width - scaledWidth) / 2
      const y = (canvasSize.height - scaledHeight) / 2
      
      // Fundo branco primeiro
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Desenhar a imagem PDF como fundo
      ctx.save()
      ctx.globalAlpha = 0.95 // Deixar um pouco transparente para ver os campos
      ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight)
      ctx.restore()
      
      // Borda ao redor da imagem para delimitar a área
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, scaledWidth, scaledHeight)
      
      console.log(`📄 Background PDF renderizado: ${scaledWidth}x${scaledHeight} na posição (${x}, ${y})`)
    } else {
      // Fundo padrão quando não há imagem
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Grid de fundo para facilitar posicionamento
      if (snapToGrid) {
        ctx.strokeStyle = '#f0f0f0'
        ctx.lineWidth = 1
        for (let i = 0; i <= canvasSize.width; i += gridSize) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, canvasSize.height)
          ctx.stroke()
        }
        for (let i = 0; i <= canvasSize.height; i += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.lineTo(canvasSize.width, i)
          ctx.stroke()
        }
      }
      
      // Borda
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      
      // Texto da página
      ctx.fillStyle = '#6b7280'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Página ${currentPage + 1}`, canvas.width / 2, canvas.height / 2)
      ctx.fillText('(Aguardando imagem PDF)', canvas.width / 2, canvas.height / 2 + 40)
      
      // Debug info
      if (pdfImages && pdfImages.length > 0) {
        ctx.font = '14px Arial'
        ctx.fillStyle = '#ef4444'
        ctx.fillText(`Erro ao carregar: ${pdfImages[currentPage]?.substring(0, 50)}...`, canvas.width / 2, canvas.height / 2 + 80)
      } else {
        ctx.font = '14px Arial'
        ctx.fillStyle = '#ef4444'
        ctx.fillText('Nenhuma imagem disponível', canvas.width / 2, canvas.height / 2 + 80)
      }
    }

    // Desenhar grid se ativo
    if (snapToGrid && backgroundImage) {
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 2])
      for (let i = 0; i <= canvasSize.width; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvasSize.height)
        ctx.stroke()
      }
      for (let i = 0; i <= canvasSize.height; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvasSize.width, i)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    // Desenhar campos
    currentPageFields.forEach((field: any) => {
      const isSelected = field.id === selectedField?.id
      drawField(ctx, field, isSelected)
    })
    
    // Desenhar handles de redimensionamento para campo selecionado
    if (currentTool === 'resize' && selectedField && currentPageFields.some((f: any) => f.id === selectedField.id)) {
      drawResizeHandles(ctx, selectedField)
    }
  }, [currentPageFields, selectedField, backgroundImage, canvasSize, currentPage, snapToGrid, gridSize])

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, field: FormField) => {
    const { x, y, width, height } = field.position
    const handleSize = 8
    
    // Posições dos handles
    const handles = [
      { id: 'nw', x: x - handleSize/2, y: y - handleSize/2 },
      { id: 'n', x: x + width/2 - handleSize/2, y: y - handleSize/2 },
      { id: 'ne', x: x + width - handleSize/2, y: y - handleSize/2 },
      { id: 'e', x: x + width - handleSize/2, y: y + height/2 - handleSize/2 },
      { id: 'se', x: x + width - handleSize/2, y: y + height - handleSize/2 },
      { id: 's', x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
      { id: 'sw', x: x - handleSize/2, y: y + height - handleSize/2 },
      { id: 'w', x: x - handleSize/2, y: y + height/2 - handleSize/2 }
    ]
    
    handles.forEach(handle => {
      // Fundo branco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
      
      // Borda azul
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
    })
  }

  const drawField = (ctx: CanvasRenderingContext2D, field: FormField, isSelected: boolean) => {
    const { x, y, width, height } = field.position
    
    // Verificar se este campo tem hover handle
    const hasHoverHandle = selectedField?.id === field.id && hoverHandle
    
    // Cores baseadas no tipo
    const colors = {
      text: '#3b82f6',
      number: '#10b981',
      date: '#f59e0b',
      select: '#8b5cf6',
      dynamic_list: '#7c3aed',
      checkbox: '#ef4444',
      textarea: '#6366f1',
      image: '#ec4899',
      signature: '#14b8a6'
    }
    
    const color = (colors as any)[field.type] || '#6b7280'
    
    // Fundo do campo com melhor contraste sobre a imagem PDF
    ctx.fillStyle = isSelected ? `${color}50` : `${color}25`
    ctx.fillRect(x, y, width, height)
    
    // Borda branca para contraste
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = isSelected ? 4 : 3
    ctx.strokeRect(x, y, width, height)
    
    // Borda colorida por cima
    ctx.strokeStyle = color
    ctx.lineWidth = isSelected ? 3 : 2
    if (field.type === 'textarea') {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }
    ctx.strokeRect(x, y, width, height)
    
    // Indicador visual de redimensionamento quando mouse está sobre borda
    if (hasHoverHandle) {
      ctx.strokeStyle = '#f59e0b' // Cor laranja para indicar redimensionamento
      ctx.lineWidth = 3
      ctx.setLineDash([3, 3])
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4)
      
      // Desenhar handles visuais nas bordas
      const handleSize = 6
      const handleColor = '#f59e0b'
      const activeColor = '#dc2626'
      
      // Handles dos cantos
      const corners = [
        { handle: 'nw', x: x - handleSize/2, y: y - handleSize/2 },
        { handle: 'ne', x: x + width - handleSize/2, y: y - handleSize/2 },
        { handle: 'sw', x: x - handleSize/2, y: y + height - handleSize/2 },
        { handle: 'se', x: x + width - handleSize/2, y: y + height - handleSize/2 }
      ]
      
      // Handles das bordas
      const edges = [
        { handle: 'n', x: x + width/2 - handleSize/2, y: y - handleSize/2 },
        { handle: 's', x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
        { handle: 'w', x: x - handleSize/2, y: y + height/2 - handleSize/2 },
        { handle: 'e', x: x + width - handleSize/2, y: y + height/2 - handleSize/2 }
      ]
      
      // Desenhar todos os handles
      const allHandles = [...corners, ...edges]
      allHandles.forEach(({ handle, x: hx, y: hy }) => {
        ctx.fillStyle = handle === hoverHandle ? activeColor : handleColor
        ctx.fillRect(hx, hy, handleSize, handleSize)
        
        // Borda branca para contraste
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.strokeRect(hx, hy, handleSize, handleSize)
      })
    }
    
    // Label do campo com sombra para melhor legibilidade
    const fontSize = Math.min(14, height * 0.6)
    ctx.font = `${field.required ? 'bold' : 'normal'} ${fontSize}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    
    const icon = getFieldIcon(field.type)
    const text = `${icon} ${field.label}${field.required ? ' *' : ''}`
    
    // Sombra do texto (fundo branco)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, x + 9, y + height / 2 + 1)
    
    // Texto principal
    ctx.fillStyle = color
    ctx.fillText(text, x + 8, y + height / 2)
    
    // Indicador de seleção
    if (isSelected && !hasHoverHandle) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x - 3, y - 3, width + 6, height + 6)
      
      // Handle de redimensionamento no canto
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(x + width - 5, y + height - 5, 10, 10)
    }
  }



  const getFieldIcon = (type: string) => {
    const icons = {
      text: '📝',
      number: '🔢',
      date: '📅',
      select: '📋',
      dynamic_list: '🔗',
      checkbox: '☑️',
      textarea: '📄',
      image: '🖼️',
      signature: '✍️'
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const getFieldAtPosition = (x: number, y: number): FormField | null => {
    // Verificar campos em ordem reversa (último desenhado primeiro)
    for (let i = currentPageFields.length - 1; i >= 0; i--) {
      const field = currentPageFields[i]
      const { x: fx, y: fy, width, height } = field.position
      
      if (x >= fx && x <= fx + width && y >= fy && y <= fy + height) {
        return field
      }
    }
    return null
  }



  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    
    if (currentTool === 'add') {
      // Modo adicionar campo
      addNewFieldAtPosition(coords.x, coords.y)
      return
    }
    
    // PRIORIDADE 1: Verificar se clicou em uma borda de redimensionamento (qualquer campo)
    for (const field of currentPageFields) {
      const handle = getResizeHandle(coords.x, coords.y, field)
      if (handle) {
        console.log(`🔧 Iniciando redimensionamento automático: ${handle} no campo ${field.label}`)
        onFieldSelect(field) // Selecionar o campo
        setIsResizing(true)
        setResizeHandle(handle as any)
        setHoverHandle(null) // Limpar hover
        return
      }
    }
    
    // PRIORIDADE 2: Verificar se clicou dentro de um campo (para arrastar)
    const field = getFieldAtPosition(coords.x, coords.y)
    
    if (field) {
      // Verificar se é seleção múltipla
      const isCtrlPressed = e.ctrlKey || e.metaKey
      
      if (multiSelection.selectedFields.length > 0 && multiSelection.isFieldSelected(field)) {
        // Campo já está na seleção múltipla, iniciar arrastar grupo
        multiSelection.startDragging(e, field)
      } else {
        // Selecionar campo individual ou adicionar à seleção múltipla
        multiSelection.toggleFieldSelection(field, isCtrlPressed)
        onFieldSelect(field)
        
        // Iniciar arraste se não estiver no modo resize
        if (currentTool !== 'resize') {
          setIsDragging(true)
          setDragField(field.id)
          setDragOffset({
            x: coords.x - field.position.x,
            y: coords.y - field.position.y
          })
        }
      }
    } else {
      // Clicou no vazio - iniciar seleção por arrastar
      if (!e.ctrlKey && !e.metaKey) {
        multiSelection.clearSelection()
        onFieldSelect(null)
      }
      multiSelection.startSelection(e)
    }
  }  
const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    
    // Atualizar seleção múltipla se estiver ativa
    if (multiSelection.selectionBox.isActive) {
      multiSelection.updateSelection(e, fields, currentPage)
      return
    }
    
    // Atualizar arrastar de seleção múltipla
    if (multiSelection.isDragging) {
      // Por enquanto, vamos desabilitar o arrastar automático para evitar problemas
      // O usuário pode usar as setas do teclado ou o botão de mover
      return
    }
    
    // Detectar se o mouse está sobre uma borda de redimensionamento
    if (!isResizing && !isDragging) {
      let foundHandle: string | null = null
      let fieldWithHandle: FormField | null = null

      // Verificar todos os campos da página atual
      for (const field of currentPageFields) {
        const handle = getResizeHandle(coords.x, coords.y, field)
        if (handle) {
          foundHandle = handle
          fieldWithHandle = field
          break
        }
      }

      // Atualizar cursor e handle de hover
      if (foundHandle && fieldWithHandle) {
        setHoverHandle(foundHandle as 's' | 'se' | 'sw' | 'ne' | 'nw' | 'n' | 'e' | 'w' | null)
        setCursorStyle(getCursorForHandle(foundHandle))
        
        // Se não há campo selecionado, selecionar automaticamente
        if (!selectedField || selectedField.id !== fieldWithHandle.id) {
          onFieldSelect(fieldWithHandle)
        }
      } else {
        setHoverHandle(null)
        setCursorStyle('default')
      }
    }
    
    // Atualizar cursor baseado na ferramenta e posição
    updateCursor(coords.x, coords.y)
    
    if (isResizing && resizeHandle && selectedField) {
      // Modo redimensionamento
      const field = selectedField
      const { x, y, width, height } = field.position
      
      let newX = x, newY = y, newWidth = width, newHeight = height
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = width + (x - coords.x)
          newHeight = height + (y - coords.y)
          newX = coords.x
          newY = coords.y
          break
        case 'n':
          newHeight = height + (y - coords.y)
          newY = coords.y
          break
        case 'ne':
          newWidth = coords.x - x
          newHeight = height + (y - coords.y)
          newY = coords.y
          break
        case 'e':
          newWidth = coords.x - x
          break
        case 'se':
          newWidth = coords.x - x
          newHeight = coords.y - y
          break
        case 's':
          newHeight = coords.y - y
          break
        case 'sw':
          newWidth = width + (x - coords.x)
          newHeight = coords.y - y
          newX = coords.x
          break
        case 'w':
          newWidth = width + (x - coords.x)
          newX = coords.x
          break
      }
      
      // Aplicar snap to grid
      newX = snapToGridValue(newX)
      newY = snapToGridValue(newY)
      newWidth = snapToGridValue(newWidth)
      newHeight = snapToGridValue(newHeight)
      
      // Aplicar limites mínimos
      newWidth = Math.max(50, newWidth)
      newHeight = Math.max(25, newHeight)
      
      // Aplicar limites do canvas
      newX = Math.max(0, Math.min(newX, canvasSize.width - newWidth))
      newY = Math.max(0, Math.min(newY, canvasSize.height - newHeight))
      
      const updatedFields = fields.map(f => {
        if (f.id === field.id) {
          return {
            ...f,
            position: {
              ...f.position,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            }
          }
        }
        return f
      })
      
      onFieldsChange(updatedFields)
      
    } else if (isDragging && dragField) {
      // Modo movimentação
      let newX = coords.x - dragOffset.x
      let newY = coords.y - dragOffset.y
      
      // Aplicar snap to grid
      newX = snapToGridValue(newX)
      newY = snapToGridValue(newY)
      
      const updatedFields = fields.map(field => {
        if (field.id === dragField) {
          return {
            ...field,
            position: {
              ...field.position,
              x: Math.max(0, Math.min(newX, canvasSize.width - field.position.width)),
              y: Math.max(0, Math.min(newY, canvasSize.height - field.position.height))
            }
          }
        }
        return field
      })
      
      onFieldsChange(updatedFields)
    }
  }
  
  const updateCursor = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Se estamos redimensionando ou arrastando, manter cursor atual
    if (isResizing || isDragging) {
      return
    }
    
    // Se há um handle de hover (mouse sobre borda), usar cursor de redimensionamento
    if (hoverHandle) {
      canvas.style.cursor = cursorStyle
      return
    }
    
    // Comportamento baseado na ferramenta atual
    if (currentTool === 'add') {
      canvas.style.cursor = 'crosshair'
    } else if (currentTool === 'move') {
      const field = getFieldAtPosition(x, y)
      canvas.style.cursor = field ? 'move' : 'default'
    } else {
      // Modo select: mostrar pointer sobre campos, default caso contrário
      const field = getFieldAtPosition(x, y)
      canvas.style.cursor = field ? 'pointer' : 'default'
    }
  }

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      // Adicionar ao histórico apenas quando terminar uma ação
      addToHistory(fields)
    }
    
    // Finalizar seleção múltipla
    if (multiSelection.selectionBox.isActive) {
      multiSelection.endSelection()
    }
    
    if (multiSelection.isDragging) {
      multiSelection.endDragging()
      addToHistory(fields)
    }
    
    setIsDragging(false)
    setDragField(null)
    setIsResizing(false)
    setResizeHandle(null)
    // Não limpar hoverHandle aqui para manter a detecção de bordas
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e)
    
    // Verificar se clicou duplo em um campo existente
    const field = getFieldAtPosition(coords.x, coords.y)
    
    if (field) {
      console.log('🖱️ Clique duplo no campo:', field.label || field.name)
      
      // Selecionar o campo
      onFieldSelect(field)
      
      // Abrir propriedades se a função foi fornecida
      if (onOpenProperties) {
        onOpenProperties()
      }
    } else {
      // Se não clicou em um campo, criar novo campo na posição
      console.log('🖱️ Clique duplo em área vazia, criando novo campo')
      addNewFieldAtPosition(coords.x, coords.y)
    }
  }

  const addNewField = () => {
    setCurrentTool('add')
  }
  
  const addNewFieldAtPosition = (x: number, y: number) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_${currentPageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: snapToGridValue(Math.max(0, Math.min(x - 100, canvasSize.width - 200))),
        y: snapToGridValue(Math.max(0, Math.min(y - 17, canvasSize.height - 35))),
        width: snapToGridValue(200),
        height: snapToGridValue(35),
        page: currentPage
      }
    }

    const newFields = [...fields, newField]
    onFieldsChange(newFields)
    onFieldSelect(newField)
    setCurrentTool('select')
    addToHistory(newFields)
  }

  const deleteSelectedFields = () => {
    if (multiSelection.selectedFields.length > 0) {
      // Deletar campos da seleção múltipla
      const selectedIds = multiSelection.selectedFields.map(f => f.id)
      const updatedFields = fields.filter(f => !selectedIds.includes(f.id))
      onFieldsChange(updatedFields)
      multiSelection.clearSelection()
      onFieldSelect(null)
      addToHistory(updatedFields)
    } else if (selectedField) {
      // Deletar campo único selecionado
      const updatedFields = fields.filter(field => field.id !== selectedField.id)
      onFieldsChange(updatedFields)
      onFieldSelect(null)
      addToHistory(updatedFields)
    }
  }

  const duplicateSelectedFields = () => {
    if (multiSelection.selectedFields.length > 0) {
      const newFields: FormField[] = []
      
      multiSelection.selectedFields.forEach(field => {
        const newField: FormField = {
          ...field,
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${field.name}_copy`,
          position: {
            ...field.position,
            x: field.position.x + 20,
            y: field.position.y + 20
          }
        }
        newFields.push(newField)
      })
      
      const updatedFields = [...fields, ...newFields]
      onFieldsChange(updatedFields)
      addToHistory(updatedFields)
    }
  }

  const moveSelectedFields = (deltaX: number, deltaY: number) => {
    if (multiSelection.selectedFields.length > 0) {
      const updatedFields = multiSelection.moveSelectedFields(deltaX, deltaY, fields)
      onFieldsChange(updatedFields)
      addToHistory(updatedFields)
    }
  }
  
  const alignFields = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedField || selectedFields.length < 2) return
    
    const fieldsToAlign = fields.filter(f => selectedFields.includes(f.id))
    const referenceField = selectedField
    
    const updatedFields = fields.map(field => {
      if (selectedFields.includes(field.id) && field.id !== referenceField.id) {
        let newX = field.position.x
        let newY = field.position.y
        
        switch (alignment) {
          case 'left':
            newX = referenceField.position.x
            break
          case 'center':
            newX = referenceField.position.x + referenceField.position.width / 2 - field.position.width / 2
            break
          case 'right':
            newX = referenceField.position.x + referenceField.position.width - field.position.width
            break
          case 'top':
            newY = referenceField.position.y
            break
          case 'middle':
            newY = referenceField.position.y + referenceField.position.height / 2 - field.position.height / 2
            break
          case 'bottom':
            newY = referenceField.position.y + referenceField.position.height - field.position.height
            break
        }
        
        return {
          ...field,
          position: {
            ...field.position,
            x: snapToGridValue(newX),
            y: snapToGridValue(newY)
          }
        }
      }
      return field
    })
    
    onFieldsChange(updatedFields)
    addToHistory(updatedFields)
  }
  
  const matchSize = (dimension: 'width' | 'height' | 'both') => {
    if (!selectedField || selectedFields.length < 2) return
    
    const referenceField = selectedField
    
    const updatedFields = fields.map(field => {
      if (selectedFields.includes(field.id) && field.id !== referenceField.id) {
        let newWidth = field.position.width
        let newHeight = field.position.height
        
        if (dimension === 'width' || dimension === 'both') {
          newWidth = referenceField.position.width
        }
        if (dimension === 'height' || dimension === 'both') {
          newHeight = referenceField.position.height
        }
        
        return {
          ...field,
          position: {
            ...field.position,
            width: snapToGridValue(newWidth),
            height: snapToGridValue(newHeight)
          }
        }
      }
      return field
    })
    
    onFieldsChange(updatedFields)
    addToHistory(updatedFields)
  }
  
  const duplicateFields = () => {
    if (!selectedField) return
    
    const newField = {
      ...selectedField,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${selectedField.name}_copy`,
      label: `${selectedField.label} (Cópia)`,
      position: {
        ...selectedField.position,
        x: snapToGridValue(selectedField.position.x + 20),
        y: snapToGridValue(selectedField.position.y + 20)
      }
    }
    
    const newFields = [...fields, newField]
    onFieldsChange(newFields)
    onFieldSelect(newField)
    addToHistory(newFields)
  }

  const copyField = () => {
    if (!selectedField) return
    setCopiedField(selectedField)
  }

  const pasteField = () => {
    if (!copiedField) return
    
    const newField = {
      ...copiedField,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${copiedField.name}_paste`,
      label: `${copiedField.label} (Colado)`,
      position: {
        ...copiedField.position,
        x: snapToGridValue(copiedField.position.x + 30),
        y: snapToGridValue(copiedField.position.y + 30),
        page: currentPage
      }
    }
    
    const newFields = [...fields, newField]
    onFieldsChange(newFields)
    onFieldSelect(newField)
    addToHistory(newFields)
  }

  const exportTemplate = () => {
    const template = {
      name: `Template_${Date.now()}`,
      fields: fields,
      pages: pdfImages.length,
      created: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string)
        if (template.fields && Array.isArray(template.fields)) {
          onFieldsChange(template.fields)
          addToHistory(template.fields)
        }
      } catch (error) {
        console.error('Erro ao importar template:', error)
        alert('Erro ao importar template. Verifique se o arquivo é válido.')
      }
    }
    reader.readAsText(file)
  }

  const nextPage = () => {
    if (currentPage < pdfImages.length - 1) {
      setCurrentPage(currentPage + 1)
      onFieldSelect(null)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      onFieldSelect(null)
    }
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, scale + delta))
    setScale(newScale)
    
    if (containerRef.current) {
      containerRef.current.style.transform = `scale(${newScale})`
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Toolbar Principal */}
      <div className="bg-white rounded-lg shadow">
        {/* Primeira linha - Ferramentas principais */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3 flex-wrap">
            {/* Ferramentas de Interação */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentTool('select')}
                className={`p-2 rounded ${currentTool === 'select' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="🖱️ Ferramenta Selecionar (S)"
              >
                <MousePointer className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('move')}
                className={`p-2 rounded ${currentTool === 'move' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="✋ Ferramenta Mover (M)"
              >
                <Move className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('resize')}
                className={`p-2 rounded ${currentTool === 'resize' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="📏 Ferramenta Redimensionar (R)"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('add')}
                className={`p-2 rounded ${currentTool === 'add' ? 'bg-green-500 text-white' : 'hover:bg-gray-200'}`}
                title="➕ Ferramenta Adicionar (A)"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Snap to Grid */}
            <div className="flex items-center space-x-2 border-l pl-3">
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 rounded ${snapToGrid ? 'bg-green-500 text-white' : 'hover:bg-gray-200'}`}
                title="📐 Snap to Grid (Ctrl+G)"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Histórico */}
            <div className="flex items-center space-x-1 border-l pl-3">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="↶ Desfazer (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="↷ Refazer (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            {/* Template */}
            <div className="flex items-center space-x-1 border-l pl-3">
              <button
                onClick={exportTemplate}
                className="p-2 rounded hover:bg-gray-200"
                title="💾 Exportar Template"
              >
                <Download className="h-4 w-4" />
              </button>
              <label className="p-2 rounded hover:bg-gray-200 cursor-pointer" title="📁 Importar Template">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importTemplate}
                  className="hidden"
                />
              </label>
            </div>

            {/* Correção de Campos */}
            <div className="flex items-center space-x-1 border-l pl-3">
              <button
                onClick={async () => {
                  const { forceCorrectFieldNames, fixInvalidFieldNames } = await import('@/lib/field-utils')
                  const forceCorrected = forceCorrectFieldNames(fields)
                  const finalCorrected = fixInvalidFieldNames(forceCorrected)
                  onFieldsChange(finalCorrected)
                }}
                className="p-2 rounded bg-orange-50 text-orange-600 hover:bg-orange-100"
                title="🔧 Corrigir Nomes - Força correção dos nomes dos campos para usar IDs corretos"
              >
                🔧
              </button>
            </div>
          </div>

          {/* Navegação e Zoom */}
          <div className="flex items-center space-x-3">
            {/* Navegação de páginas */}
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="⬅️ Página Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded min-w-[60px] text-center">
                {currentPage + 1} / {pdfImages.length || 1}
              </span>
              
              <button
                onClick={nextPage}
                disabled={currentPage === pdfImages.length - 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="➡️ Próxima Página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-2 border-l pl-3">
              <button
                onClick={() => handleZoom(-0.2)}
                className="p-2 rounded hover:bg-gray-200"
                title="🔍➖ Diminuir Zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.2)}
                className="p-2 rounded hover:bg-gray-200"
                title="🔍➕ Aumentar Zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Segunda linha - Ações do campo selecionado */}
        {selectedField && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Campo: <span className="text-blue-600">{selectedField.label}</span>
              </span>
              
              {/* Alinhamento */}
              {selectedFields.length > 1 && (
                <div className="flex items-center space-x-1 border-l pl-3">
                  <button
                    onClick={() => alignFields('left')}
                    className="p-2 rounded hover:bg-gray-200"
                    title="⬅️ Alinhar à Esquerda"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alignFields('center')}
                    className="p-2 rounded hover:bg-gray-200"
                    title="↔️ Alinhar ao Centro"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alignFields('right')}
                    className="p-2 rounded hover:bg-gray-200"
                    title="➡️ Alinhar à Direita"
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Ações do Campo */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenProperties}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200"
                title="⚙️ Propriedades do Campo (P)"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Propriedades</span>
              </button>
              <button
                onClick={copyField}
                className="p-2 rounded hover:bg-gray-200"
                title="📋 Copiar Campo (Ctrl+C)"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={duplicateFields}
                className="p-2 rounded hover:bg-gray-200"
                title="📋 Duplicar Campo (Ctrl+D)"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={deleteSelectedFields}
                className="p-2 rounded text-red-600 hover:bg-red-50"
                title="🗑️ Excluir Campo (Delete)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div 
          ref={containerRef}
          className="flex justify-center p-4"
          style={{ transformOrigin: 'center top' }}
        >
          <div 
            ref={multiSelection.canvasRef}
            className="relative"
            style={{ display: 'inline-block' }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-gray-200"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              onMouseLeave={() => {
                handleMouseUp()
                setHoverHandle(null)
                setCursorStyle('default')
              }}
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                cursor: cursorStyle
              }}
            />
            
            {/* Caixa de Seleção Múltipla */}
            <SelectionBox selectionBox={multiSelection.selectionBox} />
          </div>
        </div>
      </div>

      {/* Info e Ajuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Página {currentPage + 1}:</span>
              <span>{currentPageFields.length} campos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Total:</span>
              <span>{fields.length} campos em {pdfImages.length || 1} páginas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Ferramenta:</span>
              <span className="capitalize">{
                currentTool === 'select' ? 'Selecionar' :
                currentTool === 'move' ? 'Mover' :
                currentTool === 'resize' ? 'Redimensionar' :
                'Adicionar Campo'
              }</span>
            </div>
            {selectedField && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Selecionado:</span>
                <span>{selectedField.label}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-medium">Snap to Grid:</span>
              <span className={snapToGrid ? 'text-green-600' : 'text-gray-500'}>
                {snapToGrid ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div><strong>Ferramentas:</strong> S=Selecionar, M=Mover, R=Redimensionar, A=Adicionar</div>
            <div><strong>Redimensionamento:</strong> 🔥 Automático nas bordas dos campos</div>
            <div><strong>Histórico:</strong> Ctrl+Z=Desfazer, Ctrl+Y=Refazer</div>
            <div><strong>Clipboard:</strong> Ctrl+C=Copiar, Ctrl+V=Colar, Ctrl+D=Duplicar</div>
            <div><strong>Grid:</strong> Ctrl+G=Toggle Snap to Grid</div>
            {hoverHandle && (
              <div className="text-orange-600 font-medium">
                🔧 Redimensionamento ativo: {hoverHandle.toUpperCase()}
              </div>
            )}
            {copiedField && (
              <div className="text-green-600 font-medium">
                📋 Campo copiado: {copiedField.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações da Seleção Múltipla */}
      <MultiSelectionInfo
        selectedFields={multiSelection.selectedFields}
        onClearSelection={multiSelection.clearSelection}
        onMoveFields={moveSelectedFields}
        onDuplicateFields={duplicateSelectedFields}
        onDeleteFields={deleteSelectedFields}
      />
    </div>
  )
}