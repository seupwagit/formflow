'use client'

import React from 'react'
import { FormField } from '@/lib/types'

interface MultiSelectionPanelProps {
  selectedFields: FormField[]
  onClearSelection: () => void
}

export default function MultiSelectionPanel({ selectedFields, onClearSelection }: MultiSelectionPanelProps) {
  if (selectedFields.length === 0) {
    return null
  }

  const getBounds = () => {
    if (selectedFields.length === 0) return null
    
    const xs = selectedFields.map(f => f.position.x)
    const ys = selectedFields.map(f => f.position.y)
    const rights = selectedFields.map(f => f.position.x + f.position.width)
    const bottoms = selectedFields.map(f => f.position.y + f.position.height)
    
    return {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...rights),
      bottom: Math.max(...bottoms),
      width: Math.max(...rights) - Math.min(...xs),
      height: Math.max(...bottoms) - Math.min(...ys)
    }
  }

  const bounds = getBounds()

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-blue-900">
          🎯 {selectedFields.length} campos selecionados
        </div>
        <button
          onClick={onClearSelection}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Limpar seleção
        </button>
      </div>
      
      {bounds && (
        <div className="text-xs text-blue-700 space-y-1">
          <div>📐 Área: {Math.round(bounds.width)} × {Math.round(bounds.height)}px</div>
          <div>📍 Posição: ({Math.round(bounds.left)}, {Math.round(bounds.top)})</div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-blue-600">
        💡 Use as ferramentas de alinhamento abaixo para organizar os campos
      </div>
    </div>
  )
}