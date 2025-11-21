'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva'
import { FormField } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import Konva from 'konva'

interface KonvaCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export default function KonvaCanvas({ 
  pdfImages, 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField 
}: KonvaCanvasProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [canvasSize] = useState({ width: 800, height: 1000 })

  const currentPageFields = fields.filter(f => f.position && f.position.page === currentPage)

  // Carregar imagem de fundo da página atual
  useEffect(() => {
    if (pdfImages[currentPage]) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBackgroundImage(img)
      }
      img.src = pdfImages[currentPage]
    } else {
      setBackgroundImage(null)
    }
  }, [currentPage, pdfImages])

  const handleFieldClick = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (field) {
      onFieldSelect(field)
    }
  }

  const handleFieldDragEnd = (fieldId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    const updatedFields = fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          position: {
            ...field.position,
            x: Math.round(node.x()),
            y: Math.round(node.y())
          }
        }
      }
      return field
    })
    onFieldsChange(updatedFields)
  }

  const handleFieldTransform = (fieldId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    // Reset scale and apply to width/height
    node.scaleX(1)
    node.scaleY(1)
    
    const updatedFields = fields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          position: {
            ...field.position,
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: Math.round(node.width() * scaleX),
            height: Math.round(node.height() * scaleY)
          }
        }
      }
      return field
    })
    onFieldsChange(updatedFields)
  }

  const addNewField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_${currentPageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: 50 + (currentPageFields.length * 20),
        y: 50 + (currentPageFields.length * 20),
        width: 200,
        height: 35,
        page: currentPage
      }
    }

    onFieldsChange([...fields, newField])
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
    const newScale = Math.max(0.5, Math.min(3, stageScale + delta))
    setStageScale(newScale)
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Se clicou no stage vazio (não em um shape)
    if (e.target === e.target.getStage()) {
      onFieldSelect(null)
    }
  }

  const getFieldColor = (type: string) => {
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
    return colors[type as keyof typeof colors] || '#6b7280'
  }

  const getFieldIcon = (type: string) => {
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
    return icons[type as keyof typeof icons] || '📝'
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
            
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              Página {currentPage + 1} de {pdfImages.length}
            </span>
            
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
              {Math.round(stageScale * 100)}%
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
            onClick={addNewField}
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable
          onDragEnd={(e) => {
            setStagePosition({
              x: e.target.x(),
              y: e.target.y()
            })
          }}
          onClick={handleStageClick}
        >
          <Layer>
            {/* Background Image */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={canvasSize.width}
                height={canvasSize.height}
                listening={false}
              />
            )}

            {/* Background quando não há imagem */}
            {!backgroundImage && (
              <>
                <Rect
                  x={0}
                  y={0}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  fill="#f8f9fa"
                  stroke="#e5e7eb"
                  strokeWidth={2}
                />
                <Text
                  x={canvasSize.width / 2}
                  y={canvasSize.height / 2}
                  text={`Página ${currentPage + 1}`}
                  fontSize={24}
                  fontFamily="Arial"
                  fill="#6b7280"
                  align="center"
                  offsetX={60}
                  offsetY={12}
                />
              </>
            )}

            {/* Campos da página atual */}
            {currentPageFields.map(field => (
              <Group
                key={field.id}
                x={field.position.x}
                y={field.position.y}
                draggable
                onDragEnd={(e) => handleFieldDragEnd(field.id, e)}
                onTransformEnd={(e) => handleFieldTransform(field.id, e)}
                onClick={() => handleFieldClick(field.id)}
              >
                {/* Retângulo do campo */}
                <Rect
                  width={field.position.width}
                  height={field.position.height}
                  fill={selectedField?.id === field.id ? `${getFieldColor(field.type)}30` : `${getFieldColor(field.type)}15`}
                  stroke={getFieldColor(field.type)}
                  strokeWidth={selectedField?.id === field.id ? 3 : 2}
                  cornerRadius={6}
                  dash={field.type === 'textarea' ? [5, 5] : []}
                />

                {/* Label do campo */}
                <Text
                  x={8}
                  y={field.position.height / 2 - 8}
                  text={`${getFieldIcon(field.type)} ${field.label}${field.required ? ' *' : ''}`}
                  fontSize={Math.min(14, field.position.height * 0.6)}
                  fontFamily="Arial"
                  fill={getFieldColor(field.type)}
                  fontStyle={field.required ? 'bold' : 'normal'}
                />

                {/* Indicador de seleção */}
                {selectedField?.id === field.id && (
                  <>
                    <Rect
                      x={-3}
                      y={-3}
                      width={field.position.width + 6}
                      height={field.position.height + 6}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dash={[5, 5]}
                      listening={false}
                    />
                    {/* Handles de redimensionamento */}
                    <Rect
                      x={field.position.width - 5}
                      y={field.position.height - 5}
                      width={10}
                      height={10}
                      fill="#3b82f6"
                      listening={false}
                    />
                  </>
                )}
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Página {currentPage + 1}:</span>
            <span>{currentPageFields.length} campos</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Total:</span>
            <span>{fields.length} campos em {pdfImages.length} páginas</span>
          </div>
          <div className="text-xs">
            Clique para selecionar • Arraste para mover • Use zoom com mouse wheel
          </div>
        </div>
      </div>
    </div>
  )
}