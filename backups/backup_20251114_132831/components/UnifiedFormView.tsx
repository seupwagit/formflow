'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { List, Layout, ChevronLeft, ChevronRight } from 'lucide-react'
import FormFieldRenderer from './FormFieldRenderer'

interface UnifiedFormViewProps {
  fields: FormField[]
  formData: { [key: string]: any }
  pdfImages: string[]
  mode: 'edit' | 'view' // edit = pode editar, view = só visualizar
  onChange?: (fieldId: string, value: any) => void
  onBlur?: (fieldName: string) => void
  onFocus?: (fieldName: string) => void
  showLabels?: boolean
  className?: string
  fieldColors?: { [key: string]: string }
  fieldVisibility?: { [key: string]: boolean }
  fieldRequired?: { [key: string]: boolean }
  fieldDisabled?: { [key: string]: boolean }
}

export default function UnifiedFormView({
  fields,
  formData,
  pdfImages,
  mode,
  onChange,
  onBlur,
  onFocus,
  showLabels = true,
  className = '',
  fieldColors = {},
  fieldVisibility = {},
  fieldRequired = {},
  fieldDisabled = {}
}: UnifiedFormViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'canvas'>('list')
  const [currentPage, setCurrentPage] = useState(0)

  // Converter formData de field.id para field.name para campos calculados
  const getFormDataByName = () => {
    const dataByName: { [key: string]: any } = {}
    fields.forEach((field: FormField) => {
      if (field.id && field.name) {
        dataByName[field.name] = formData[field.id]
      }
    })
    return dataByName
  }

  const formDataByName = getFormDataByName()

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header com controles de visualização */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Lista</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('canvas')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'canvas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={pdfImages.length === 0}
          >
            <Layout className="h-4 w-4" />
            <span>Canvas</span>
          </button>
        </div>

        {/* Navegação de páginas (só no canvas com múltiplas páginas) */}
        {viewMode === 'canvas' && pdfImages.length > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage + 1} de {pdfImages.length}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pdfImages.length - 1, currentPage + 1))}
              disabled={currentPage === pdfImages.length - 1}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Visualização em Lista */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {fields.map((field: FormField) => {
              // Verificar visibilidade do campo
              const isVisible = fieldVisibility[field.name] !== false
              if (!isVisible) return null

              return (
                <div key={field.id}>
                  {mode === 'edit' ? (
                    <FormFieldRenderer
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => onChange?.(field.id, value)}
                      onBlur={() => onBlur?.(field.name)}
                      onFocus={() => onFocus?.(field.name)}
                      showLabel={showLabels}
                      labelPosition="top"
                      allFields={fields}
                      allValues={formDataByName}
                      fieldColor={fieldColors[field.name]}
                      isRequired={fieldRequired[field.name] ?? field.required}
                      isDisabled={fieldDisabled[field.name] ?? false}
                    />
                  ) : (
                    // Modo visualização
                    <div className="border-b pb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <div className="text-gray-900">
                        {formData[field.id] || (
                          <span className="text-gray-400 italic">Não preenchido</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Visualização em Canvas */}
        {viewMode === 'canvas' && pdfImages.length > 0 && (
          <div className="relative inline-block">
            <img
              src={pdfImages[currentPage]}
              alt={`Página ${currentPage + 1}`}
              className="max-w-full h-auto border border-gray-300 rounded"
            />

            {/* Renderizar campos sobre o canvas */}
            {fields
              .filter((field: FormField) => {
                // Filtrar por página e visibilidade
                const isVisible = fieldVisibility[field.name] !== false
                return field.position.page === currentPage && isVisible
              })
              .map((field: FormField) => (
                <div
                  key={field.id}
                  style={{
                    position: 'absolute',
                    left: `${field.position.x}px`,
                    top: `${field.position.y}px`,
                    width: `${field.position.width}px`,
                    height: `${field.position.height}px`,
                  }}
                >
                  {mode === 'edit' ? (
                    <FormFieldRenderer
                      field={field}
                      value={formData[field.id]}
                      onChange={(value) => onChange?.(field.id, value)}
                      onBlur={() => onBlur?.(field.name)}
                      onFocus={() => onFocus?.(field.name)}
                      showLabel={false}
                      labelPosition="top"
                      allFields={fields}
                      allValues={formDataByName}
                      fieldColor={fieldColors[field.name]}
                      isRequired={fieldRequired[field.name] ?? field.required}
                      isDisabled={fieldDisabled[field.name] ?? false}
                    />
                  ) : (
                    // Modo visualização
                    <div
                      style={{
                        display: 'flex',
                        alignItems: field.alignment?.vertical || 'middle',
                        justifyContent: field.alignment?.horizontal || 'left',
                        fontSize: `${field.fontStyle?.size || 12}px`,
                        fontFamily: field.fontStyle?.family || 'Arial',
                        fontWeight: field.fontStyle?.weight || 'normal',
                        color: field.fontStyle?.color || '#000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        height: '100%',
                      }}
                      title={`${field.label}: ${formData[field.id] || ''}`}
                    >
                      {field.type === 'checkbox'
                        ? formData[field.id]
                          ? '✓'
                          : ''
                        : formData[field.id] || ''}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Mensagem quando não há imagens para canvas */}
        {viewMode === 'canvas' && pdfImages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma imagem de fundo disponível para visualização em canvas.</p>
            <p className="text-sm mt-2">Use a visualização em lista para {mode === 'edit' ? 'preencher' : 'visualizar'} o formulário.</p>
          </div>
        )}
      </div>
    </div>
  )
}
