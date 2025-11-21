'use client'

import { useEffect } from 'react'
import { FormField } from '@/lib/types'

interface KeyboardShortcutsProps {
  onAddField: () => void
  onSave: () => void
  onPreview: () => void
  onDeleteSelected: () => void
  selectedField: FormField | null
  onDuplicateSelected: () => void
}

export default function KeyboardShortcuts({
  onAddField,
  onSave,
  onPreview,
  onDeleteSelected,
  selectedField,
  onDuplicateSelected
}: KeyboardShortcutsProps) {
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      // Ctrl/Cmd + S = Salvar
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        onSave()
        return
      }

      // Ctrl/Cmd + P = Preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault()
        onPreview()
        return
      }

      // Ctrl/Cmd + N = Novo campo
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        onAddField()
        return
      }

      // Delete = Excluir campo selecionado
      if (event.key === 'Delete' && selectedField) {
        event.preventDefault()
        onDeleteSelected()
        return
      }

      // Ctrl/Cmd + D = Duplicar campo selecionado
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && selectedField) {
        event.preventDefault()
        onDuplicateSelected()
        return
      }

      // Escape = Desselecionar
      if (event.key === 'Escape') {
        event.preventDefault()
        // Implementar deseleção se necessário
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onAddField, onSave, onPreview, onDeleteSelected, selectedField, onDuplicateSelected])

  return null // Este componente não renderiza nada visualmente
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Atalhos de Teclado</h4>
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Salvar modelo</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+S</kbd>
        </div>
        <div className="flex justify-between">
          <span>Visualizar</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+P</kbd>
        </div>
        <div className="flex justify-between">
          <span>Novo campo</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+N</kbd>
        </div>
        <div className="flex justify-between">
          <span>Excluir selecionado</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Delete</kbd>
        </div>
        <div className="flex justify-between">
          <span>Duplicar selecionado</span>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+D</kbd>
        </div>
        
        {/* Separador para atalhos de alinhamento */}
        <div className="border-t border-gray-300 my-2 pt-2">
          <div className="text-xs font-medium text-gray-700 mb-2">Alinhamento (2+ campos):</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Alinhar à esquerda</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+L</kbd>
            </div>
            <div className="flex justify-between">
              <span>Alinhar à direita</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+R</kbd>
            </div>
            <div className="flex justify-between">
              <span>Centralizar horizontal</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+C</kbd>
            </div>
            <div className="flex justify-between">
              <span>Alinhar ao topo</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+T</kbd>
            </div>
            <div className="flex justify-between">
              <span>Alinhar à base</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+B</kbd>
            </div>
            <div className="flex justify-between">
              <span>Centralizar vertical</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Distribuir horizontal</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+H</kbd>
            </div>
            <div className="flex justify-between">
              <span>Distribuir vertical</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Ctrl+Shift+V</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}