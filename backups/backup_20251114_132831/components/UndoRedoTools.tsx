'use client'

import React from 'react'
import { RotateCcw, RotateCw, History } from 'lucide-react'
import { HistoryManager } from '@/lib/history-manager'

interface UndoRedoToolsProps {
  historyManager: HistoryManager
  onUndo: () => void
  onRedo: () => void
  disabled?: boolean
}

export default function UndoRedoTools({ 
  historyManager, 
  onUndo, 
  onRedo, 
  disabled = false 
}: UndoRedoToolsProps) {
  
  const canUndo = historyManager.canUndo()
  const canRedo = historyManager.canRedo()
  const undoInfo = historyManager.getUndoInfo()
  const redoInfo = historyManager.getRedoInfo()
  const stats = historyManager.getStats()

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-md shadow-sm">
      {/* Botão Desfazer */}
      <button
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className={`p-2 rounded transition-colors ${
          canUndo && !disabled
            ? 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          canUndo 
            ? `Desfazer: ${undoInfo?.description || 'Última ação'} (Ctrl+Z)`
            : 'Nenhuma ação para desfazer'
        }
      >
        <RotateCcw className="h-5 w-5" />
      </button>

      {/* Botão Refazer */}
      <button
        onClick={onRedo}
        disabled={disabled || !canRedo}
        className={`p-2 rounded transition-colors ${
          canRedo && !disabled
            ? 'hover:bg-green-50 text-green-600 hover:text-green-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          canRedo 
            ? `Refazer: ${redoInfo?.description || 'Próxima ação'} (Ctrl+Y)`
            : 'Nenhuma ação para refazer'
        }
      >
        <RotateCw className="h-5 w-5" />
      </button>

      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Indicador de Histórico */}
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <History className="h-4 w-4" />
        <span>{stats.currentPosition}/{stats.totalActions}</span>
      </div>

      {/* Tooltip com informações detalhadas */}
      {(undoInfo || redoInfo) && (
        <div className="hidden group-hover:block absolute top-full left-0 mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
          {undoInfo && (
            <div className="flex items-center space-x-1">
              <RotateCcw className="h-3 w-3" />
              <span>Desfazer: {undoInfo.description}</span>
            </div>
          )}
          {redoInfo && (
            <div className="flex items-center space-x-1 mt-1">
              <RotateCw className="h-3 w-3" />
              <span>Refazer: {redoInfo.description}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente expandido para mostrar histórico completo
export function HistoryPanel({ 
  historyManager, 
  onJumpToAction 
}: { 
  historyManager: HistoryManager
  onJumpToAction?: (actionIndex: number) => void 
}) {
  const history = historyManager.getHistory()
  const stats = historyManager.getStats()
  const currentPosition = stats.currentPosition - 1 // Ajustar para índice baseado em 0

  return (
    <div className="w-80 bg-white border rounded-lg shadow-lg p-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Histórico de Ações</h3>
        </div>
        <div className="text-xs text-gray-500">
          {stats.currentPosition}/{stats.totalActions}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Ações Totais</div>
          <div className="font-medium">{stats.totalActions}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-600">Memória</div>
          <div className="font-medium">{stats.memoryUsage}</div>
        </div>
      </div>

      {/* Lista de Ações */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma ação no histórico</p>
          </div>
        ) : (
          history.map((action, index) => (
            <div
              key={action.id}
              className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                index === currentPosition
                  ? 'bg-blue-100 border border-blue-300 text-blue-800'
                  : index < currentPosition
                  ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-25 text-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => onJumpToAction?.(index)}
              title={`${action.description} - ${new Date(action.timestamp).toLocaleTimeString()}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    index === currentPosition ? 'bg-blue-500' :
                    index < currentPosition ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="font-medium">{getActionIcon(action.type)}</span>
                  <span>{action.description}</span>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(action.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {action.fieldIds && action.fieldIds.length > 0 && (
                <div className="text-xs opacity-75 mt-1 ml-4">
                  Campos: {action.fieldIds.length}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ações do Painel */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <button
          onClick={() => historyManager.clear()}
          className="text-xs text-red-600 hover:text-red-700"
          disabled={history.length === 0}
        >
          Limpar Histórico
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onJumpToAction?.(Math.max(0, currentPosition - 1))}
            disabled={!stats.canUndo}
            className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-300"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onJumpToAction?.(Math.min(history.length - 1, currentPosition + 1))}
            disabled={!stats.canRedo}
            className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-300"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para ícones de ação
function getActionIcon(type: string): string {
  switch (type) {
    case 'add': return '➕'
    case 'delete': return '🗑️'
    case 'update': return '✏️'
    case 'move': return '📐'
    case 'resize': return '📏'
    case 'bulk_update': return '📦'
    default: return '⚡'
  }
}