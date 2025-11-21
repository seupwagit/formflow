'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import { X, Plus, Trash2 } from 'lucide-react'

interface FieldEditorProps {
  field: FormField | null
  onSave: (field: FormField) => void
  onDelete: (fieldId: string) => void
  onClose: () => void
}

export default function FieldEditor({ field, onSave, onDelete, onClose }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField | null>(null)
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    if (field) {
      setEditedField({ ...field })
      setOptions(field.options || [])
    }
  }, [field])

  if (!editedField) return null

  const handleSave = () => {
    const updatedField = {
      ...editedField,
      options: editedField.type === 'select' ? options : undefined
    }
    onSave(updatedField)
    onClose()
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Editar Campo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome do Campo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Campo
            </label>
            <input
              type="text"
              value={editedField.name}
              onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={editedField.type}
              onChange={(e) => setEditedField({ 
                ...editedField, 
                type: e.target.value as FormField['type'] 
              })}
              className="input-field"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="textarea">Área de Texto</option>
              <option value="select">Lista de Seleção</option>
              <option value="checkbox">Checkbox</option>
              <option value="image">Imagem</option>
            </select>
          </div>

          {/* Obrigatório */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={editedField.required}
              onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
              Campo obrigatório
            </label>
          </div>

          {/* Opções para Select */}
          {editedField.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opções
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="input-field flex-1"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Opção</span>
                </button>
              </div>
            </div>
          )}

          {/* Validação para Number */}
          {editedField.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  value={editedField.validation?.min || ''}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      min: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  value={editedField.validation?.max || ''}
                  onChange={(e) => setEditedField({
                    ...editedField,
                    validation: {
                      ...editedField.validation,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Posição */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X
              </label>
              <input
                type="number"
                value={editedField.position.x}
                onChange={(e) => setEditedField({
                  ...editedField,
                  position: { ...editedField.position, x: Number(e.target.value) }
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
                value={editedField.position.y}
                onChange={(e) => setEditedField({
                  ...editedField,
                  position: { ...editedField.position, y: Number(e.target.value) }
                })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largura
              </label>
              <input
                type="number"
                value={editedField.position.width}
                onChange={(e) => setEditedField({
                  ...editedField,
                  position: { ...editedField.position, width: Number(e.target.value) }
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
                value={editedField.position.height}
                onChange={(e) => setEditedField({
                  ...editedField,
                  position: { ...editedField.position, height: Number(e.target.value) }
                })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <button
            onClick={() => {
              onDelete(editedField.id)
              onClose()
            }}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </button>
          
          <div className="flex space-x-2">
            <button onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}