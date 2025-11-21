'use client'

import { useState, useRef, useEffect } from 'react'
import { FormField } from '@/lib/types'

interface ResizableFieldProps {
  field: FormField
  isSelected: boolean
  isResizeMode: boolean
  onFieldUpdate: (field: FormField) => void
  onFieldSelect: (field: FormField) => void
  scale?: number
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export default function ResizableField({
  field,
  isSelected,
  isResizeMode,
  onFieldUpdate,
  onFieldSelect,
  scale = 1
}: ResizableFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialBounds, setInitialBounds] = useState({ x: 0, y: 0, width: 0, height: 0 })
  
  const fieldRef = useRef<HTMLDivElement>(null)

  const { x, y, width, height } = field.position

  // Forçar re-render quando as propriedades mudarem
  useEffect(() => {
    console.log('🔄 Campo atualizado:', field.label, field.type, field.required)
  }, [field.label, field.type, field.required, field.name])

  // Cores baseadas no tipo de campo
  const getFieldColor = () => {
    const colors = {
      text: '#3b82f6',
      number: '#10b981',
      calculated: '#f97316', // Laranja para campos calculados
      date: '#f59e0b',
      select: '#8b5cf6',
      checkbox: '#ef4444',
      textarea: '#6366f1',
      image: '#ec4899',
      signature: '#14b8a6'
    }
    return colors[field.type as keyof typeof colors] || '#6b7280'
  }

  const fieldColor = getFieldColor()

  // Handles de redimensionamento
  const resizeHandles: { id: ResizeHandle; cursor: string; position: any }[] = [
    { id: 'nw', cursor: 'nw-resize', position: { top: -4, left: -4 } },
    { id: 'n', cursor: 'n-resize', position: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'ne', cursor: 'ne-resize', position: { top: -4, right: -4 } },
    { id: 'e', cursor: 'e-resize', position: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
    { id: 'se', cursor: 'se-resize', position: { bottom: -4, right: -4 } },
    { id: 's', cursor: 's-resize', position: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'sw', cursor: 'sw-resize', position: { bottom: -4, left: -4 } },
    { id: 'w', cursor: 'w-resize', position: { top: '50%', left: -4, transform: 'translateY(-50%)' } }
  ]

  // Iniciar arraste do campo
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizeMode) return // Não arrastar no modo redimensionar
    
    e.preventDefault()
    e.stopPropagation()
    
    onFieldSelect(field)
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - x * scale,
      y: e.clientY - y * scale
    })
  }

  // Iniciar redimensionamento
  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setActiveHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialBounds({ x, y, width, height })
  }

  // Manipular movimento do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isResizeMode) {
        // Arrastar campo
        const newX = (e.clientX - dragStart.x) / scale
        const newY = (e.clientY - dragStart.y) / scale
        
        onFieldUpdate({
          ...field,
          position: {
            ...field.position,
            x: Math.max(0, newX),
            y: Math.max(0, newY)
          }
        })
      } else if (isResizing && activeHandle) {
        // Redimensionar campo
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        
        let newX = initialBounds.x
        let newY = initialBounds.y
        let newWidth = initialBounds.width
        let newHeight = initialBounds.height
        
        switch (activeHandle) {
          case 'nw':
            newX = initialBounds.x + deltaX / scale
            newY = initialBounds.y + deltaY / scale
            newWidth = initialBounds.width - deltaX / scale
            newHeight = initialBounds.height - deltaY / scale
            break
          case 'n':
            newY = initialBounds.y + deltaY / scale
            newHeight = initialBounds.height - deltaY / scale
            break
          case 'ne':
            newY = initialBounds.y + deltaY / scale
            newWidth = initialBounds.width + deltaX / scale
            newHeight = initialBounds.height - deltaY / scale
            break
          case 'e':
            newWidth = initialBounds.width + deltaX / scale
            break
          case 'se':
            newWidth = initialBounds.width + deltaX / scale
            newHeight = initialBounds.height + deltaY / scale
            break
          case 's':
            newHeight = initialBounds.height + deltaY / scale
            break
          case 'sw':
            newX = initialBounds.x + deltaX / scale
            newWidth = initialBounds.width - deltaX / scale
            newHeight = initialBounds.height + deltaY / scale
            break
          case 'w':
            newX = initialBounds.x + deltaX / scale
            newWidth = initialBounds.width - deltaX / scale
            break
        }
        
        // Aplicar limites mínimos
        if (newWidth < 50) {
          newWidth = 50
          if (activeHandle.includes('w')) {
            newX = initialBounds.x + initialBounds.width - 50
          }
        }
        if (newHeight < 25) {
          newHeight = 25
          if (activeHandle.includes('n')) {
            newY = initialBounds.y + initialBounds.height - 25
          }
        }
        
        // Aplicar limites de posição
        newX = Math.max(0, newX)
        newY = Math.max(0, newY)
        
        onFieldUpdate({
          ...field,
          position: {
            ...field.position,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          }
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setActiveHandle(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, activeHandle, dragStart, initialBounds, field, onFieldUpdate, scale])

  // Ícone do tipo de campo
  const getFieldIcon = () => {
    const icons = {
      text: '📝',
      number: '🔢',
      calculated: '🧮',
      date: '📅',
      select: '📋',
      checkbox: '☑️',
      textarea: '📄',
      image: '🖼️',
      signature: '✍️'
    }
    return icons[field.type as keyof typeof icons] || '📝'
  }

  return (
    <div
      ref={fieldRef}
      className={`absolute select-none transition-all duration-150 ${
        isDragging ? 'z-50' : isSelected ? 'z-40' : 'z-30'
      }`}
      style={{
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        cursor: isDragging ? 'grabbing' : isResizeMode ? 'default' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Campo principal */}
      <div
        className={`w-full h-full border-2 rounded transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        style={{
          borderColor: isSelected ? fieldColor : undefined,
          backgroundColor: isSelected ? `${fieldColor}15` : undefined
        }}
      >
        {/* Conteúdo do campo */}
        <div className="flex items-center h-full px-2 text-sm">
          <span className="mr-1">{getFieldIcon()}</span>
          <div className="flex-1 min-w-0">
            <span 
              className="truncate font-medium block"
              style={{ color: fieldColor }}
              title={`${field.name} (${field.type})`}
            >
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {/* Mostrar fórmula para campos calculados */}
            {field.type === 'calculated' && field.calculatedConfig?.formula && (
              <div className="text-xs text-gray-500 truncate" title={field.calculatedConfig.formula}>
                = {field.calculatedConfig.formula}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handles de redimensionamento */}
      {isSelected && isResizeMode && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle.id}
              className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm shadow-sm hover:bg-blue-600 transition-colors"
              style={{
                ...handle.position,
                cursor: handle.cursor,
                zIndex: 60
              }}
              onMouseDown={(e) => handleResizeStart(e, handle.id)}
            />
          ))}
          
          {/* Indicador de dimensões */}
          <div 
            className="absolute -bottom-6 left-0 text-xs bg-black text-white px-1 rounded pointer-events-none"
            style={{ fontSize: '10px' }}
          >
            {Math.round(width)} × {Math.round(height)}
          </div>
        </>
      )}

      {/* Indicador de seleção */}
      {isSelected && !isResizeMode && (
        <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-dashed border-blue-500 rounded pointer-events-none" />
      )}
    </div>
  )
}