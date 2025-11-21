'use client'

import { useEffect, useRef, useState } from 'react'
import { FormField } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

interface SimpleCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
}

export default function SimpleCanvas({ 
  pdfImages, 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField 
}: SimpleCanvasProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const currentPageFields = fields.filter(f => f.position && f.position.page === currentPage)

  const handleFieldClick = (field: FormField, event: React.MouseEvent) => {
    event.stopPropagation()
    onFieldSelect(field)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Se clicou no canvas vazio, desselecionar
    if (event.target === event.currentTarget) {
      onFieldSelect(null)
    }
  }

  const handleMouseDown = (field: FormField, event: React.MouseEvent) => {
    event.preventDefault()
    setDraggedField(field.id)
    
    const rect = event.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedField) return

    const canvasRect = event.currentTarget.getBoundingClientRect()
    const newX = event.clientX - canvasRect.left - dragOffset.x
    const newY = event.clientY - canvasRect.top - dragOffset.y

    // Atualizar posição do campo
    const updatedFields = fields.map(field => {
      if (field.id === draggedField) {
        return {
          ...field,
          position: {
            ...field.position,
            x: Math.max(0, Math.min(newX, 800 - field.position.width)),
            y: Math.max(0, Math.min(newY, 1000 - field.position.height))
          }
        }
      }
      return field
    })

    onFieldsChange(updatedFields)
  }

  const handleMouseUp = () => {
    setDraggedField(null)
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
        <div 
          className="relative bg-gray-100 mx-auto cursor-crosshair"
          style={{ 
            width: '800px', 
            height: '1000px',
            backgroundImage: pdfImages[currentPage] ? `url(${pdfImages[currentPage]})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Campos da página atual */}
          {currentPageFields.map(field => (
            <div
              key={field.id}
              className={`absolute border-2 rounded cursor-move transition-all ${
                selectedField?.id === field.id 
                  ? 'border-blue-500 bg-blue-100 shadow-lg' 
                  : 'border-gray-400 bg-white bg-opacity-80 hover:bg-opacity-100'
              }`}
              style={{
                left: field.position.x,
                top: field.position.y,
                width: field.position.width,
                height: field.position.height,
                borderColor: getFieldColor(field.type),
                backgroundColor: selectedField?.id === field.id 
                  ? `${getFieldColor(field.type)}20` 
                  : '#ffffff80'
              }}
              onClick={(e) => handleFieldClick(field, e)}
              onMouseDown={(e) => handleMouseDown(field, e)}
            >
              <div className="flex items-center justify-between h-full px-2">
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <span className="text-sm">{getFieldIcon(field.type)}</span>
                  <span 
                    className="text-xs font-medium truncate"
                    style={{ color: getFieldColor(field.type) }}
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                
                {selectedField?.id === field.id && (
                  <div className="flex space-x-1">
                    {/* Handles de redimensionamento */}
                    <div 
                      className="w-2 h-2 bg-blue-500 rounded-full cursor-se-resize"
                      style={{ position: 'absolute', bottom: -4, right: -4 }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicador quando não há imagem */}
          {!pdfImages[currentPage] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <div className="text-lg font-medium">Página {currentPage + 1}</div>
                <div className="text-sm">Imagem não disponível</div>
              </div>
            </div>
          )}
        </div>
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
            Clique para selecionar • Arraste para mover • Clique em + para adicionar
          </div>
        </div>
      </div>
    </div>
  )
}