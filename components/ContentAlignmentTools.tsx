'use client'

import React from 'react'
import { FormField } from '@/lib/types'
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd
} from 'lucide-react'

interface ContentAlignmentToolsProps {
  selectedField: FormField | null
  onUpdateField: (field: FormField) => void
  disabled?: boolean
}

export default function ContentAlignmentTools({ 
  selectedField, 
  onUpdateField, 
  disabled = false 
}: ContentAlignmentToolsProps) {
  
  if (!selectedField) {
    return (
      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
        <span className="text-xs text-gray-500">Selecione um campo</span>
      </div>
    )
  }

  // Valores padrão se não existirem
  const currentAlignment = selectedField.alignment || {
    horizontal: 'left',
    vertical: 'middle'
  }

  const updateAlignment = (
    horizontal?: 'left' | 'center' | 'right',
    vertical?: 'top' | 'middle' | 'bottom'
  ) => {
    const newAlignment = {
      horizontal: horizontal || currentAlignment.horizontal,
      vertical: vertical || currentAlignment.vertical
    }

    const updatedField = {
      ...selectedField,
      alignment: newAlignment
    }

    onUpdateField(updatedField)
  }

  const isHorizontalActive = (align: string) => currentAlignment.horizontal === align
  const isVerticalActive = (align: string) => currentAlignment.vertical === align

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-md shadow-sm">
      {/* Alinhamento Horizontal */}
      <div className="flex items-center space-x-1 border-r pr-2">
        <span className="text-xs text-gray-600 font-medium">H:</span>
        
        <button
          onClick={() => updateAlignment('left')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isHorizontalActive('left')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateAlignment('center')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isHorizontalActive('center')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateAlignment('right')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isHorizontalActive('right')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      {/* Alinhamento Vertical */}
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-600 font-medium">V:</span>
        
        <button
          onClick={() => updateAlignment(undefined, 'top')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isVerticalActive('top')
              ? 'bg-green-100 text-green-600 border border-green-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Alinhar ao topo"
        >
          <AlignVerticalJustifyStart className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateAlignment(undefined, 'middle')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isVerticalActive('middle')
              ? 'bg-green-100 text-green-600 border border-green-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Centralizar verticalmente"
        >
          <AlignVerticalJustifyCenter className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateAlignment(undefined, 'bottom')}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isVerticalActive('bottom')
              ? 'bg-green-100 text-green-600 border border-green-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Alinhar à base"
        >
          <AlignVerticalJustifyEnd className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador do campo selecionado */}
      <div className="border-l pl-2">
        <span className="text-xs text-gray-500">
          {selectedField.label || selectedField.name}
        </span>
      </div>
    </div>
  )
}