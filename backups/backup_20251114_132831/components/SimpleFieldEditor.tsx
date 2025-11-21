'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface SimpleFieldEditorProps {
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
  currentPage: number
}

export default function SimpleFieldEditor({ 
  fields, 
  onFieldsChange, 
  onFieldSelect,
  selectedField,
  currentPage 
}: SimpleFieldEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null)

  const currentPageFields = fields.filter(f => f.position && f.position.page === currentPage)

  const addNewField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_${currentPageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: 50,
        y: 50 + (currentPageFields.length * 40),
        width: 200,
        height: 35,
        page: currentPage
      }
    }

    onFieldsChange([...fields, newField])
    onFieldSelect(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onFieldsChange(updatedFields)
  }

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId)
    onFieldsChange(updatedFields)
    if (selectedField?.id === fieldId) {
      onFieldSelect(null)
    }
  }

  const fieldTypes = [
    { value: 'text', label: 'Texto', icon: '📝' },
    { value: 'number', label: 'Número', icon: '🔢' },
    { value: 'date', label: 'Data', icon: '📅' },
    { value: 'select', label: 'Lista', icon: '📋' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'textarea', label: 'Área de Texto', icon: '📄' },
    { value: 'signature', label: 'Assinatura', icon: '✍️' }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Editor de Campos - Página {currentPage + 1}
          </h3>
          <button
            onClick={addNewField}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Campo</span>
          </button>
        </div>
      </div>

      {/* Lista de Campos */}
      <div className="p-4">
        {currentPageFields.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum campo nesta página
            </h4>
            <p className="text-gray-600 mb-4">
              Adicione campos para começar a mapear o formulário
            </p>
            <button onClick={addNewField} className="btn-primary">
              Adicionar Primeiro Campo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPageFields.map(field => (
              <div
                key={field.id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedField?.id === field.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {editingField === field.id ? (
                  /* Modo de Edição */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Campo
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as FormField['type'] })}
                          className="input-field"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Campo obrigatório</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          X
                        </label>
                        <input
                          type="number"
                          value={field.position.x}
                          onChange={(e) => updateField(field.id, { 
                            position: { ...field.position, x: Number(e.target.value) }
                          })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Y
                        </label>
                        <input
                          type="number"
                          value={field.position.y}
                          onChange={(e) => updateField(field.id, { 
                            position: { ...field.position, y: Number(e.target.value) }
                          })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Largura
                        </label>
                        <input
                          type="number"
                          value={field.position.width}
                          onChange={(e) => updateField(field.id, { 
                            position: { ...field.position, width: Number(e.target.value) }
                          })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Altura
                        </label>
                        <input
                          type="number"
                          value={field.position.height}
                          onChange={(e) => updateField(field.id, { 
                            position: { ...field.position, height: Number(e.target.value) }
                          })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingField(null)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null)
                          onFieldSelect(field)
                        }}
                        className="btn-primary"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Modo de Visualização */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {fieldTypes.find(t => t.value === field.type)?.icon || '📝'}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {field.name} • {field.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onFieldSelect(field)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Selecionar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(field.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Posição: {field.position.x}, {field.position.y} • 
                      Tamanho: {field.position.width}×{field.position.height}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}