'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Clipboard, Files, Scissors, Plus } from 'lucide-react'
import { FormField } from '@/lib/types'
import { FieldClipboard } from '@/lib/field-clipboard'

interface CopyPasteToolsProps {
  selectedFields: FormField[]
  allFields: FormField[]
  currentPage: number
  onCopy: (fields: FormField[]) => void
  onPaste: (fields: FormField[]) => void
  onDuplicate: (fields: FormField[]) => void
  disabled?: boolean
}

export default function CopyPasteTools({
  selectedFields,
  allFields,
  currentPage,
  onCopy,
  onPaste,
  onDuplicate,
  disabled = false
}: CopyPasteToolsProps) {
  const [clipboard] = useState(() => FieldClipboard.getInstance())
  const [clipboardInfo, setClipboardInfo] = useState(clipboard.getClipboardInfo())

  // Atualizar informações do clipboard
  useEffect(() => {
    const interval = setInterval(() => {
      setClipboardInfo(clipboard.getClipboardInfo())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const hasSelection = selectedFields.length > 0
  const hasClipboardContent = clipboardInfo.count > 0

  const handleCopy = () => {
    if (!hasSelection) return
    
    clipboard.copyMultiple(selectedFields)
    onCopy(selectedFields)
    setClipboardInfo(clipboard.getClipboardInfo())
  }

  const handlePaste = () => {
    if (!hasClipboardContent) return
    
    const pastedFields = clipboard.paste(currentPage, 20, 20, allFields)
    onPaste(pastedFields)
  }

  const handleDuplicate = () => {
    if (!hasSelection) return
    
    const duplicatedFields = clipboard.duplicateMultiple(
      selectedFields,
      currentPage,
      20,
      20,
      allFields
    )
    onDuplicate(duplicatedFields)
  }

  const handleCut = () => {
    if (!hasSelection) return
    
    // Copiar primeiro
    clipboard.copyMultiple(selectedFields)
    setClipboardInfo(clipboard.getClipboardInfo())
    
    // Depois "cortar" (será removido pelo componente pai)
    onCopy(selectedFields)
  }

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-md shadow-sm">
      {/* Botão Copiar */}
      <button
        onClick={handleCopy}
        disabled={disabled || !hasSelection}
        className={`p-2 rounded transition-colors ${
          hasSelection && !disabled
            ? 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          hasSelection
            ? `Copiar ${selectedFields.length} campo(s) selecionado(s) (Ctrl+C)`
            : 'Selecione campo(s) para copiar'
        }
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* Botão Cortar */}
      <button
        onClick={handleCut}
        disabled={disabled || !hasSelection}
        className={`p-2 rounded transition-colors ${
          hasSelection && !disabled
            ? 'hover:bg-orange-50 text-orange-600 hover:text-orange-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          hasSelection
            ? `Cortar ${selectedFields.length} campo(s) selecionado(s) (Ctrl+X)`
            : 'Selecione campo(s) para cortar'
        }
      >
        <Scissors className="h-4 w-4" />
      </button>

      {/* Botão Colar */}
      <button
        onClick={handlePaste}
        disabled={disabled || !hasClipboardContent}
        className={`p-2 rounded transition-colors ${
          hasClipboardContent && !disabled
            ? 'hover:bg-green-50 text-green-600 hover:text-green-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          hasClipboardContent
            ? `Colar ${clipboardInfo.count} campo(s) do clipboard (Ctrl+V)`
            : 'Clipboard vazio - copie campos primeiro'
        }
      >
        <Clipboard className="h-4 w-4" />
      </button>

      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Botão Duplicar */}
      <button
        onClick={handleDuplicate}
        disabled={disabled || !hasSelection}
        className={`p-2 rounded transition-colors ${
          hasSelection && !disabled
            ? 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={
          hasSelection
            ? `Duplicar ${selectedFields.length} campo(s) selecionado(s) (Ctrl+D)`
            : 'Selecione campo(s) para duplicar'
        }
      >
        <Files className="h-4 w-4" />
      </button>

      {/* Indicador de Clipboard */}
      {hasClipboardContent && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 border-l pl-2">
          <Clipboard className="h-3 w-3" />
          <span>{clipboardInfo.count}</span>
        </div>
      )}

      {/* Indicador de Seleção */}
      {hasSelection && (
        <div className="flex items-center space-x-1 text-xs text-blue-600 border-l pl-2">
          <Plus className="h-3 w-3" />
          <span>{selectedFields.length}</span>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar detalhes do clipboard
export function ClipboardPanel({ 
  clipboard 
}: { 
  clipboard: FieldClipboard 
}) {
  const [info, setInfo] = useState(clipboard.getClipboardInfo())

  useEffect(() => {
    const interval = setInterval(() => {
      setInfo(clipboard.getClipboardInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-80 bg-white border rounded-lg shadow-lg p-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clipboard className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Clipboard</h3>
        </div>
        <div className="text-xs text-gray-500">
          {info.count} campo(s)
        </div>
      </div>

      {/* Conteúdo do Clipboard */}
      <div className="max-h-48 overflow-y-auto space-y-2">
        {info.isEmpty ? (
          <div className="text-center text-gray-500 py-8">
            <Clipboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Clipboard vazio</p>
            <p className="text-xs mt-1">Copie campos para vê-los aqui</p>
          </div>
        ) : (
          info.fields.map((field, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded text-sm border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium">{getFieldIcon(field.type)}</span>
                  <span>{field.label}</span>
                </div>
                <span className="text-xs text-gray-500 uppercase">
                  {field.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <button
          onClick={() => clipboard.clear()}
          className="text-xs text-red-600 hover:text-red-700"
          disabled={info.isEmpty}
        >
          Limpar Clipboard
        </button>
        <div className="text-xs text-gray-500">
          {info.count > 0 ? 'Recente' : 'Vazio'}
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para ícones de campo
function getFieldIcon(type: string): string {
  switch (type) {
    case 'text': return '📝'
    case 'number': return '🔢'
    case 'calculated': return '🧮'
    case 'date': return '📅'
    case 'textarea': return '📄'
    case 'select': return '📋'
    case 'dynamic_list': return '🔗'
    case 'checkbox': return '☑️'
    case 'image': return '🖼️'
    case 'signature': return '✍️'
    default: return '⚡'
  }
}