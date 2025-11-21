'use client'

import React from 'react'
import { FormField } from '@/lib/types'
import { 
  Bold, 
  Italic, 
  Underline, 
  Type,
  Palette,
  Minus,
  Plus
} from 'lucide-react'

interface FontStyleToolsProps {
  selectedField: FormField | null
  onUpdateField: (field: FormField) => void
  disabled?: boolean
}

export default function FontStyleTools({ 
  selectedField, 
  onUpdateField, 
  disabled = false 
}: FontStyleToolsProps) {
  
  if (!selectedField) {
    return (
      <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
        <span className="text-xs text-gray-500">Selecione um campo</span>
      </div>
    )
  }

  // Valores padrão se não existirem
  const currentFontStyle = selectedField.fontStyle || {
    family: 'Arial',
    size: 12,
    weight: 'normal',
    style: 'normal',
    decoration: 'none',
    color: '#000000'
  }

  const updateFontStyle = (updates: Partial<typeof currentFontStyle>) => {
    const newFontStyle = {
      ...currentFontStyle,
      ...updates
    }

    const updatedField = {
      ...selectedField,
      fontStyle: newFontStyle
    }

    onUpdateField(updatedField)
  }

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times', 'Courier', 'Georgia', 'Verdana', 'Tahoma'
  ]

  const isStyleActive = (style: string, value: string) => currentFontStyle[style as keyof typeof currentFontStyle] === value

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-md shadow-sm">
      {/* Família da Fonte */}
      <div className="flex items-center space-x-1 border-r pr-2">
        <Type className="h-4 w-4 text-gray-500" />
        <select
          value={currentFontStyle.family}
          onChange={(e) => updateFontStyle({ family: e.target.value as any })}
          disabled={disabled}
          className="text-xs border-0 bg-transparent focus:ring-0 cursor-pointer"
          title="Família da fonte"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Tamanho da Fonte */}
      <div className="flex items-center space-x-1 border-r pr-2">
        <button
          onClick={() => updateFontStyle({ size: Math.max(8, currentFontStyle.size - 1) })}
          disabled={disabled || currentFontStyle.size <= 8}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Diminuir fonte"
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <input
          type="number"
          value={currentFontStyle.size}
          onChange={(e) => updateFontStyle({ size: Math.max(8, Math.min(72, parseInt(e.target.value) || 12)) })}
          disabled={disabled}
          className="w-10 text-xs text-center border-0 bg-transparent focus:ring-0"
          min="8"
          max="72"
          title="Tamanho da fonte"
        />
        
        <button
          onClick={() => updateFontStyle({ size: Math.min(72, currentFontStyle.size + 1) })}
          disabled={disabled || currentFontStyle.size >= 72}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Aumentar fonte"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Estilos de Fonte */}
      <div className="flex items-center space-x-1 border-r pr-2">
        <button
          onClick={() => updateFontStyle({ 
            weight: currentFontStyle.weight === 'bold' ? 'normal' : 'bold' 
          })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isStyleActive('weight', 'bold')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateFontStyle({ 
            style: currentFontStyle.style === 'italic' ? 'normal' : 'italic' 
          })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isStyleActive('style', 'italic')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => updateFontStyle({ 
            decoration: currentFontStyle.decoration === 'underline' ? 'none' : 'underline' 
          })}
          disabled={disabled}
          className={`p-1.5 rounded transition-colors ${
            isStyleActive('decoration', 'underline')
              ? 'bg-blue-100 text-blue-600 border border-blue-300'
              : 'hover:bg-gray-100 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </button>
      </div>

      {/* Cor da Fonte */}
      <div className="flex items-center space-x-1">
        <Palette className="h-4 w-4 text-gray-500" />
        <input
          type="color"
          value={currentFontStyle.color}
          onChange={(e) => updateFontStyle({ color: e.target.value })}
          disabled={disabled}
          className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
          title="Cor da fonte"
        />
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