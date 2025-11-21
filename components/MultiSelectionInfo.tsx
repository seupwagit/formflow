'use client'

import { FormField } from '@/lib/types'
import { Move, Copy, Trash2, X } from 'lucide-react'

interface MultiSelectionInfoProps {
  selectedFields: FormField[]
  onClearSelection: () => void
  onMoveFields: (deltaX: number, deltaY: number) => void
  onDuplicateFields: () => void
  onDeleteFields: () => void
}

export default function MultiSelectionInfo({ 
  selectedFields, 
  onClearSelection,
  onMoveFields,
  onDuplicateFields,
  onDeleteFields
}: MultiSelectionInfoProps) {
  if (selectedFields.length === 0) return null

  const handleKeyboardMove = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        onMoveFields(0, -step)
        break
      case 'ArrowDown':
        e.preventDefault()
        onMoveFields(0, step)
        break
      case 'ArrowLeft':
        e.preventDefault()
        onMoveFields(-step, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        onMoveFields(step, 0)
        break
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        onDeleteFields()
        break
      case 'Escape':
        e.preventDefault()
        onClearSelection()
        break
    }
  }

  return (
    <div 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50"
      tabIndex={0}
      onKeyDown={handleKeyboardMove}
    >
      <div className="flex items-center space-x-4">
        {/* Info da Seleção */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-900">
            {selectedFields.length} campo{selectedFields.length !== 1 ? 's' : ''} selecionado{selectedFields.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          {/* Mover */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onMoveFields(-5, 0)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-xs"
              title="Mover para esquerda"
            >
              ←
            </button>
            <button
              onClick={() => onMoveFields(0, -5)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-xs"
              title="Mover para cima"
            >
              ↑
            </button>
            <button
              onClick={() => onMoveFields(0, 5)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-xs"
              title="Mover para baixo"
            >
              ↓
            </button>
            <button
              onClick={() => onMoveFields(5, 0)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-xs"
              title="Mover para direita"
            >
              →
            </button>
          </div>

          {/* Duplicar */}
          <button
            onClick={onDuplicateFields}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
            title="Duplicar campos selecionados"
          >
            <Copy className="h-4 w-4" />
          </button>

          {/* Deletar */}
          <button
            onClick={onDeleteFields}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
            title="Deletar campos selecionados"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Limpar Seleção */}
          <button
            onClick={onClearSelection}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Limpar seleção (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dicas de Teclado */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Use as setas para mover • Shift+setas = movimento rápido • Del = deletar • Esc = limpar seleção
      </div>
    </div>
  )
}