'use client'

import React, { useState, useEffect } from 'react'
import { Move, Maximize2, AlignLeft, AlignRight, AlignCenter, AlignJustify, RotateCcw } from 'lucide-react'
import { FormField } from '@/lib/types'
import { FieldPrecisionControls } from '@/lib/field-precision-controls'

interface PrecisionControlsProps {
  selectedFields: FormField[]
  onFieldsUpdate: (fields: FormField[]) => void
  disabled?: boolean
}

export default function PrecisionControls({
  selectedFields,
  onFieldsUpdate,
  disabled = false
}: PrecisionControlsProps) {
  const [precisionControls] = useState(() => FieldPrecisionControls.getInstance())
  const [showStats, setShowStats] = useState(false)

  const hasSelection = selectedFields.length > 0
  const hasMultipleSelection = selectedFields.length > 1

  // Calcular estatísticas
  const stats = precisionControls.getPositionStats(selectedFields)

  const handleAlign = (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical') => {
    if (!hasMultipleSelection) return
    
    const alignedFields = precisionControls.alignFields(selectedFields, alignment)
    onFieldsUpdate(alignedFields)
  }

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedFields.length < 3) return
    
    const distributedFields = precisionControls.distributeFields(selectedFields, direction)
    onFieldsUpdate(distributedFields)
  }

  const handleUniformSize = (dimension: 'width' | 'height' | 'both') => {
    if (!hasMultipleSelection) return
    
    const uniformFields = precisionControls.uniformSize(selectedFields, dimension)
    onFieldsUpdate(uniformFields)
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm p-3 space-y-3">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Move className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Controles de Precisão</h3>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showStats ? 'Ocultar' : 'Stats'}
        </button>
      </div>

      {/* Informações de Seleção */}
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        {hasSelection ? (
          <div>
            <div className="font-medium">
              {selectedFields.length} campo(s) selecionado(s)
            </div>
            {hasSelection && (
              <div className="mt-1 space-y-1">
                <div>Posição: ({Math.round(stats.center.x)}, {Math.round(stats.center.y)})</div>
                <div>Área: {Math.round(stats.bounds.width)}×{Math.round(stats.bounds.height)}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            Selecione campo(s) para usar controles de precisão
          </div>
        )}
      </div>

      {/* Atalhos de Teclado */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700">Atalhos de Teclado:</div>
        <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Shift + ↑↓←→</span>
            <span>Mover (1px)</span>
          </div>
          <div className="flex justify-between">
            <span>Ctrl + ↑↓←→</span>
            <span>Redimensionar (1px)</span>
          </div>
          <div className="flex justify-between">
            <span>Alt + Shift + ↑↓←→</span>
            <span>Mover (10px)</span>
          </div>
          <div className="flex justify-between">
            <span>Alt + Ctrl + ↑↓←→</span>
            <span>Redimensionar (10px)</span>
          </div>
        </div>
      </div>

      {/* Ferramentas de Alinhamento */}
      {hasMultipleSelection && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Alinhamento:</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleAlign('left')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Alinhar à esquerda"
            >
              <AlignLeft className="h-3 w-3 mx-auto" />
            </button>
            <button
              onClick={() => handleAlign('center-horizontal')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Centralizar horizontalmente"
            >
              <AlignCenter className="h-3 w-3 mx-auto" />
            </button>
            <button
              onClick={() => handleAlign('right')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Alinhar à direita"
            >
              <AlignRight className="h-3 w-3 mx-auto" />
            </button>
            <button
              onClick={() => handleAlign('top')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Alinhar ao topo"
            >
              <AlignJustify className="h-3 w-3 mx-auto rotate-90" />
            </button>
            <button
              onClick={() => handleAlign('center-vertical')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Centralizar verticalmente"
            >
              <AlignCenter className="h-3 w-3 mx-auto rotate-90" />
            </button>
            <button
              onClick={() => handleAlign('bottom')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Alinhar à base"
            >
              <AlignJustify className="h-3 w-3 mx-auto rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* Ferramentas de Distribuição */}
      {selectedFields.length >= 3 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Distribuição:</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => handleDistribute('horizontal')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Distribuir horizontalmente"
            >
              ↔️ Horizontal
            </button>
            <button
              onClick={() => handleDistribute('vertical')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Distribuir verticalmente"
            >
              ↕️ Vertical
            </button>
          </div>
        </div>
      )}

      {/* Ferramentas de Tamanho Uniforme */}
      {hasMultipleSelection && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Tamanho Uniforme:</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleUniformSize('width')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Mesma largura"
            >
              ↔️ Largura
            </button>
            <button
              onClick={() => handleUniformSize('height')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Mesma altura"
            >
              ↕️ Altura
            </button>
            <button
              onClick={() => handleUniformSize('both')}
              disabled={disabled}
              className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              title="Mesmo tamanho"
            >
              <Maximize2 className="h-3 w-3 mx-auto" />
            </button>
          </div>
        </div>
      )}

      {/* Estatísticas Detalhadas */}
      {showStats && hasSelection && (
        <div className="space-y-2 border-t pt-2">
          <div className="text-xs font-medium text-gray-700">Estatísticas:</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Centro: ({Math.round(stats.center.x)}, {Math.round(stats.center.y)})</div>
            <div>Limites: {Math.round(stats.bounds.x)}, {Math.round(stats.bounds.y)}</div>
            <div>Dimensões: {Math.round(stats.bounds.width)}×{Math.round(stats.bounds.height)}</div>
            {hasMultipleSelection && (
              <>
                <div>Espaçamento H: {Math.round(stats.spacing.horizontal)}px</div>
                <div>Espaçamento V: {Math.round(stats.spacing.vertical)}px</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente compacto para a barra de ferramentas
export function PrecisionToolbar({
  selectedFields,
  onFieldsUpdate,
  disabled = false
}: PrecisionControlsProps) {
  const [precisionControls] = useState(() => FieldPrecisionControls.getInstance())
  
  const hasSelection = selectedFields.length > 0
  const hasMultipleSelection = selectedFields.length > 1

  const handleAlign = (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical') => {
    if (!hasMultipleSelection) return
    
    const alignedFields = precisionControls.alignFields(selectedFields, alignment)
    onFieldsUpdate(alignedFields)
  }

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-md shadow-sm">
      {/* Indicador */}
      <Move className="h-4 w-4 text-gray-500" />
      
      {/* Alinhamento Horizontal */}
      <button
        onClick={() => handleAlign('left')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Alinhar à esquerda (múltipla seleção)"
      >
        <AlignLeft className="h-3 w-3" />
      </button>
      
      <button
        onClick={() => handleAlign('center-horizontal')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Centralizar horizontalmente"
      >
        <AlignCenter className="h-3 w-3" />
      </button>
      
      <button
        onClick={() => handleAlign('right')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Alinhar à direita"
      >
        <AlignRight className="h-3 w-3" />
      </button>

      {/* Separador */}
      <div className="w-px h-4 bg-gray-300 mx-1" />

      {/* Alinhamento Vertical */}
      <button
        onClick={() => handleAlign('top')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Alinhar ao topo"
      >
        <AlignJustify className="h-3 w-3 rotate-90" />
      </button>
      
      <button
        onClick={() => handleAlign('center-vertical')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Centralizar verticalmente"
      >
        <AlignCenter className="h-3 w-3 rotate-90" />
      </button>
      
      <button
        onClick={() => handleAlign('bottom')}
        disabled={disabled || !hasMultipleSelection}
        className={`p-1 rounded transition-colors ${
          hasMultipleSelection && !disabled
            ? 'hover:bg-gray-100 text-gray-600'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Alinhar à base"
      >
        <AlignJustify className="h-3 w-3 rotate-90" />
      </button>

      {/* Indicador de seleção */}
      {hasSelection && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 border-l pl-2">
          <span>{selectedFields.length}</span>
        </div>
      )}
    </div>
  )
}