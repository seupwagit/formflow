'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from 'fabric'
import { FormField } from '@/lib/types'
import { LoadingOverlay } from './LoadingSpinner'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Save } from 'lucide-react'

interface FabricCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export default function FabricCanvas({ 
  pdfImages, 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField 
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1000 })

  // Inicializar Fabric.js Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
        allowTouchScrolling: false,
        imageSmoothingEnabled: true,
        enableRetinaScaling: true,
        centeredScaling: false,
        centeredRotation: false,
        interactive: true,
        moveCursor: 'move',
        hoverCursor: 'move',
        defaultCursor: 'default'
      })

      fabricCanvasRef.current = canvas

      // Event listeners
      canvas.on('selection:created', handleObjectSelection)
      canvas.on('selection:updated', handleObjectSelection)
      canvas.on('selection:cleared', () => onFieldSelect(null))
      canvas.on('object:modified', handleObjectModified)
      canvas.on('object:moving', handleObjectMoving)
      canvas.on('object:scaling', handleObjectScaling)
      canvas.on('mouse:dblclick', handleDoubleClick)
      
      // Permitir clique no canvas vazio para adicionar campo
      canvas.on('mouse:down', handleCanvasClick)

      return () => {
        canvas.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [canvasSize])

  // Carregar página atual
  useEffect(() => {
    if (fabricCanvasRef.current && pdfImages[currentPage]) {
      loadPageImage(currentPage)
    }
  }, [currentPage, pdfImages])

  // Atualizar campos no canvas
  useEffect(() => {
    if (fabricCanvasRef.current) {
      updateFieldsOnCanvas()
    }
  }, [fields, currentPage])

  // Atualizar seleção
  useEffect(() => {
    if (fabricCanvasRef.current && selectedField) {
      const fieldObject = fabricCanvasRef.current.getObjects().find(
        obj => obj.data?.fieldId === selectedField.id
      )
      if (fieldObject) {
        fabricCanvasRef.current.setActiveObject(fieldObject)
        fabricCanvasRef.current.renderAll()
      }
    }
  }, [selectedField])

  const loadPageImage = async (pageIndex: number) => {
    if (!fabricCanvasRef.current || !pdfImages[pageIndex]) return

    setIsLoading(true)
    const canvas = fabricCanvasRef.current

    try {
      console.log(`📄 Carregando página ${pageIndex + 1}/${pdfImages.length}`)
      
      // Salvar campos da página atual antes de trocar
      saveCurrentPageFields()
      
      // Limpar canvas completamente
      canvas.clear()
      canvas.backgroundColor = '#f8f9fa'

      // Verificar se a imagem PNG está disponível
      const imageUrl = pdfImages[pageIndex]
      if (!imageUrl || (!imageUrl.startsWith('data:image/png') && !imageUrl.startsWith('data:image/'))) {
        console.error('❌ Imagem PNG não disponível:', imageUrl?.substring(0, 50))
        createFallbackBackground(pageIndex)
        setIsLoading(false)
        return
      }
      
      console.log('✅ Carregando imagem PNG válida')

      // Carregar imagem PNG como background
      const imgElement = new Image()
      imgElement.crossOrigin = 'anonymous'
      
      imgElement.onload = () => {
        console.log(`✅ Imagem PNG carregada: ${imgElement.width}x${imgElement.height}`)
        console.log(`📐 Canvas: ${canvasSize.width}x${canvasSize.height}`)
        
        // Calcular escala para caber no canvas
        const scaleX = (canvasSize.width - 40) / imgElement.width
        const scaleY = (canvasSize.height - 40) / imgElement.height
        const scale = Math.min(scaleX, scaleY, 1) // Não aumentar além do tamanho original

        const scaledWidth = imgElement.width * scale
        const scaledHeight = imgElement.height * scale
        
        // Centralizar no canvas
        const left = (canvasSize.width - scaledWidth) / 2
        const top = (canvasSize.height - scaledHeight) / 2
        
        console.log(`🎯 Escala: ${scale.toFixed(2)}, Posição: ${left.toFixed(0)},${top.toFixed(0)}`)
        
        // Definir como background não-interativo (NUNCA PDF!)
        canvas.setBackgroundImage(imageUrl, () => {
          console.log(`🎨 Background PNG definido para página ${pageIndex + 1} - CANVAS LIVRE!`)
          
          // Carregar campos específicos desta página
          loadPageFields(pageIndex)
          
          canvas.renderAll()
          setIsLoading(false)
        }, {
          scaleX: scale,
          scaleY: scale,
          left: left,
          top: top,
          originX: 'left',
          originY: 'top'
        })
      }

      imgElement.onerror = (error) => {
        console.error('❌ Erro ao carregar imagem PNG:', error)
        // Fallback: criar background simples
        createFallbackBackground(pageIndex)
        setIsLoading(false)
      }

      imgElement.src = imageUrl

    } catch (error) {
      console.error('❌ Erro geral ao carregar página:', error)
      createFallbackBackground(pageIndex)
      setIsLoading(false)
    }
  }

  const saveCurrentPageFields = () => {
    if (!fabricCanvasRef.current) return
    
    // Atualizar posições dos campos da página atual baseado nos objetos do canvas
    const canvasObjects = fabricCanvasRef.current.getObjects()
    const updatedFields = fields.map(field => {
      if (field.position.page === currentPage) {
        const canvasObject = canvasObjects.find(obj => obj.data?.fieldId === field.id)
        if (canvasObject) {
          const boundingRect = canvasObject.getBoundingRect()
          return {
            ...field,
            position: {
              ...field.position,
              x: Math.round(boundingRect.left),
              y: Math.round(boundingRect.top),
              width: Math.round(boundingRect.width),
              height: Math.round(boundingRect.height)
            }
          }
        }
      }
      return field
    })
    
    if (JSON.stringify(updatedFields) !== JSON.stringify(fields)) {
      onFieldsChange(updatedFields)
    }
  }

  const loadPageFields = (pageIndex: number) => {
    if (!fabricCanvasRef.current) return
    
    const canvas = fabricCanvasRef.current
    const pageFields = fields.filter(field => field.position.page === pageIndex)
    
    console.log(`📝 Carregando ${pageFields.length} campos para página ${pageIndex + 1}`)
    
    pageFields.forEach(field => {
      const fieldObject = createFieldObject(field)
      if (fieldObject) {
        canvas.add(fieldObject)
      }
    })
    
    canvas.renderAll()
  }

  const createFallbackBackground = (pageIndex: number) => {
    if (!fabricCanvasRef.current) return
    
    const canvas = fabricCanvasRef.current
    
    // Criar background simples com informações da página
    const rect = new fabric.Rect({
      left: 20,
      top: 20,
      width: canvasSize.width - 40,
      height: canvasSize.height - 40,
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      excludeFromExport: true
    })
    
    const text = new fabric.Text(`Página ${pageIndex + 1}`, {
      left: canvasSize.width / 2,
      top: 60,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#6b7280',
      textAlign: 'center',
      originX: 'center',
      selectable: false,
      evented: false,
      excludeFromExport: true
    })
    
    canvas.add(rect, text)
    loadPageFields(pageIndex)
    canvas.renderAll()
  }

  const createFieldObject = (field: FormField): fabric.Object | null => {
    const { position, type, label, required } = field
    
    // Cores baseadas no tipo
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

    const color = (colors as any)[type] || '#6b7280'
    
    // Criar retângulo representando o campo
    const rect = new fabric.Rect({
      left: position.x,
      top: position.y,
      width: position.width,
      height: position.height,
      fill: `${color}15`, // 15% opacity para melhor visibilidade
      stroke: color,
      strokeWidth: 2,
      strokeDashArray: type === 'textarea' ? [5, 5] : [],
      rx: 6,
      ry: 6,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      transparentCorners: false,
      cornerColor: color,
      cornerStyle: 'circle',
      cornerSize: 8,
      borderColor: color,
      borderScaleFactor: 2,
      data: {
        fieldId: field.id,
        fieldType: type,
        fieldData: field
      }
    })

    // Adicionar texto do label dentro do campo
    const labelText = new fabric.Text(label + (required ? ' *' : ''), {
      left: position.x + 8,
      top: position.y + (position.height - 16) / 2,
      fontSize: Math.min(14, position.height * 0.6),
      fontFamily: 'Arial, sans-serif',
      fill: color,
      fontWeight: required ? 'bold' : 'normal',
      selectable: false,
      evented: false,
      excludeFromExport: false
    })

    // Adicionar ícone do tipo
    const icons = {
      text: '📝',
      number: '🔢',
      date: '📅',
      select: '📋',
      checkbox: '☑️',
      textarea: '📄',
      image: '🖼️',
      signature: '✍️'
    }

    const icon = new fabric.Text((icons as any)[type] || '📝', {
      left: position.x + position.width - 25,
      top: position.y + 5,
      fontSize: 16,
      selectable: false,
      evented: false,
      excludeFromExport: false
    })

    // Criar grupo com todos os elementos
    const group = new fabric.Group([rect, labelText, icon], {
      left: position.x,
      top: position.y,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      transparentCorners: false,
      cornerColor: color,
      cornerStyle: 'circle',
      cornerSize: 10,
      borderColor: color,
      borderScaleFactor: 2,
      hoverCursor: 'move',
      moveCursor: 'move',
      data: {
        fieldId: field.id,
        fieldType: type,
        fieldData: field
      }
    })
    
    return group
  }

  const updateFieldsOnCanvas = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    
    // Remover apenas objetos de campo (preservar background)
    const objects = canvas.getObjects().slice() // Cópia para evitar problemas de iteração
    objects.forEach(obj => {
      if (obj.data?.fieldId) {
        canvas.remove(obj)
      }
    })

    // Adicionar campos da página atual
    loadPageFields(currentPage)
  }

  const handleObjectSelection = (e: fabric.IEvent) => {
    const activeObject = e.target
    if (activeObject?.data?.fieldData) {
      onFieldSelect(activeObject.data.fieldData)
    }
  }

  const handleObjectModified = (e: fabric.IEvent) => {
    const activeObject = e.target
    if (activeObject?.data?.fieldId) {
      updateFieldPosition(activeObject)
    }
  }

  const handleObjectMoving = (e: fabric.IEvent) => {
    // Opcional: feedback visual durante movimento
  }

  const handleObjectScaling = (e: fabric.IEvent) => {
    const activeObject = e.target
    if (activeObject?.data?.fieldId) {
      updateFieldPosition(activeObject)
    }
  }

  const handleDoubleClick = (e: fabric.IEvent) => {
    const activeObject = e.target
    if (activeObject?.data?.fieldData) {
      onFieldSelect(activeObject.data.fieldData)
    }
  }

  const handleCanvasClick = (e: fabric.IEvent) => {
    // Se clicou no canvas vazio (não em um objeto)
    if (!e.target) {
      const pointer = fabricCanvasRef.current?.getPointer(e.e)
      if (pointer) {
        // Opcional: adicionar campo na posição clicada
        console.log('Clique no canvas vazio em:', pointer)
      }
    }
  }

  const updateFieldPosition = (fabricObject: fabric.Object) => {
    if (!fabricObject.data?.fieldId) return

    const fieldId = fabricObject.data.fieldId
    const boundingRect = fabricObject.getBoundingRect()

    const updatedFields = fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          position: {
            ...field.position,
            x: Math.round(boundingRect.left),
            y: Math.round(boundingRect.top),
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height)
          }
        }
      }
      return field
    })

    onFieldsChange(updatedFields)
  }

  const addNewField = (x?: number, y?: number) => {
    const pageFields = fields.filter(f => f.position && f.position.page === currentPage)
    const baseX = x || 80 + (pageFields.length * 30)
    const baseY = y || 80 + (pageFields.length * 30)
    
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_p${currentPage + 1}_${pageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: Math.min(baseX, canvasSize.width - 220), // Não sair do canvas
        y: Math.min(baseY, canvasSize.height - 60),
        width: 200,
        height: 35,
        page: currentPage
      }
    }

    console.log(`➕ Adicionando campo na página ${currentPage + 1}:`, newField.name)
    
    const updatedFields = [...fields, newField]
    onFieldsChange(updatedFields)
    onFieldSelect(newField)
    
    // Adicionar ao canvas imediatamente
    if (fabricCanvasRef.current) {
      const fieldObject = createFieldObject(newField)
      if (fieldObject) {
        fabricCanvasRef.current.add(fieldObject)
        fabricCanvasRef.current.setActiveObject(fieldObject)
        fabricCanvasRef.current.renderAll()
      }
    }
  }

  const deleteSelectedField = () => {
    if (!selectedField || !fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const activeObject = canvas.getActiveObject()
    
    if (activeObject?.data?.fieldId === selectedField.id) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }

    const updatedFields = fields.filter(field => field.id !== selectedField.id)
    onFieldsChange(updatedFields)
    onFieldSelect(null)
  }

  const handleZoom = (delta: number) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
    
    setZoom(newZoom)
    canvas.setZoom(newZoom)
    canvas.renderAll()
  }

  const nextPage = () => {
    if (currentPage < pdfImages.length - 1) {
      console.log(`➡️ Navegando para página ${currentPage + 2}`)
      saveCurrentPageFields() // Salvar campos antes de trocar
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      console.log(`⬅️ Navegando para página ${currentPage}`)
      saveCurrentPageFields() // Salvar campos antes de trocar
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pdfImages.length && pageIndex !== currentPage) {
      console.log(`🔄 Mudando para página ${pageIndex + 1}`)
      saveCurrentPageFields()
      setCurrentPage(pageIndex)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          {/* Navegação de páginas */}
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="btn-secondary disabled:opacity-50"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <select
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm min-w-[120px]"
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
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <button
              onClick={() => handleZoom(-0.2)}
              className="btn-secondary"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.2)}
              className="btn-secondary"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addNewField()}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Campo</span>
          </button>
          
          {selectedField && (
            <button
              onClick={deleteSelectedField}
              className="btn-secondary text-red-600 hover:bg-red-50"
            >
              Excluir Campo
            </button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative">
          {isLoading && (
            <LoadingOverlay text={`Carregando página ${currentPage + 1}...`} />
          )}
          
          <canvas
            ref={canvasRef}
            className="border border-gray-200"
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Página {currentPage + 1}:</span>
            <span>{fields.filter(f => f.position && f.position.page === currentPage).length} campos</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Total:</span>
            <span>{fields.length} campos em {pdfImages.length} páginas</span>
          </div>
          <div className="text-xs">
            Clique duplo para propriedades • Arraste para mover
          </div>
        </div>
      </div>
    </div>
  )
}