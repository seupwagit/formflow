'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import { ValidationRule } from '@/lib/types/validation-rules'
import { ValidationEngine } from '@/lib/validation-engine'
import { X, AlertCircle, CheckCircle, Info, Zap } from 'lucide-react'
import FormFieldRenderer from './FormFieldRenderer'

interface ValidationPreviewProps {
  fields: FormField[]
  validationRules: ValidationRule[]
  onClose: () => void
}

export default function ValidationPreview({ fields, validationRules, onClose }: ValidationPreviewProps) {
  const [formData, setFormData] = useState<{[key: string]: any}>({})
  const [validationMessages, setValidationMessages] = useState<Array<{id: string; message: string; type: string}>>([])
  const [canSubmit, setCanSubmit] = useState(true)
  const [fieldVisibility, setFieldVisibility] = useState<{[key: string]: boolean}>({})
  const [fieldRequired, setFieldRequired] = useState<{[key: string]: boolean}>({})
  const [fieldDisabled, setFieldDisabled] = useState<{[key: string]: boolean}>({})

  // Inicializar formData
  useEffect(() => {
    const initialData: {[key: string]: any} = {}
    fields.forEach(field => {
      if (field.name) {
        initialData[field.name] = ''
      }
    })
    setFormData(initialData)
  }, [fields])

  // Executar validações quando valores mudarem
  useEffect(() => {
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      
      // Carregar regras e atualizar valores
      engine.loadRules(validationRules)
      engine.updateFieldValues(formData)
      
      // Executar validações on_change e continuous
      const result = engine.execute('on_change', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação Preview: ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (fieldName, value) => {
          setFormData(prev => ({ ...prev, [fieldName]: value }))
        },
        onToggleFieldVisibility: (fieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [fieldName]: visible }))
        },
        onToggleFieldRequired: (fieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [fieldName]: required }))
        },
        onToggleFieldDisabled: (fieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [fieldName]: disabled }))
        }
      })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações no preview:', error)
    }
  }, [formData, validationRules])

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // 🆕 Handler para evento onBlur
  const handleFieldBlur = (fieldName: string) => {
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      engine.loadRules(validationRules)
      engine.updateFieldValues(formData)
      
      const result = engine.execute('on_blur', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação Preview (onBlur): ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (targetFieldName, value) => {
          setFormData(prev => ({ ...prev, [targetFieldName]: value }))
        },
        onToggleFieldVisibility: (targetFieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
        },
        onToggleFieldRequired: (targetFieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
        },
        onToggleFieldDisabled: (targetFieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
        }
      })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações onBlur no preview:', error)
    }
  }

  // 🆕 Handler para evento onFocus
  const handleFieldFocus = (fieldName: string) => {
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      engine.loadRules(validationRules)
      engine.updateFieldValues(formData)
      
      const result = engine.execute('on_focus', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação Preview (onFocus): ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (targetFieldName, value) => {
          setFormData(prev => ({ ...prev, [targetFieldName]: value }))
        },
        onToggleFieldVisibility: (targetFieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
        },
        onToggleFieldRequired: (targetFieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
        },
        onToggleFieldDisabled: (targetFieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
        }
      })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações onFocus no preview:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Testar Validações</h2>
              <p className="text-sm text-gray-600 mt-1">
                Preencha os campos para ver as validações em ação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Validation Messages */}
        {validationMessages.length > 0 && (
          <div className="p-6 space-y-2 bg-gray-50 border-b">
            {validationMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 p-4 rounded-lg ${
                  msg.type === 'error' ? 'bg-red-50 border border-red-200' :
                  msg.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  msg.type === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                {msg.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                {msg.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                {msg.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                {msg.type === 'info' && <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    msg.type === 'error' ? 'text-red-800' :
                    msg.type === 'warning' ? 'text-yellow-800' :
                    msg.type === 'success' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Fields */}
        <div className="p-6">
          <div className="space-y-6">
            {fields.map(field => {
              // Verificar se o campo está visível
              const isVisible = fieldVisibility[field.name] !== false
              if (!isVisible) return null

              return (
                <div key={field.id}>
                  <FormFieldRenderer
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={(value) => handleInputChange(field.name, value)}
                    onBlur={() => handleFieldBlur(field.name)}
                    onFocus={() => handleFieldFocus(field.name)}
                    allFields={fields}
                    allValues={formData}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {validationRules.length} regra(s) ativa(s) • {validationMessages.length} mensagem(ns)
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Limpar formulário
                const initialData: {[key: string]: any} = {}
                fields.forEach(field => {
                  if (field.name) {
                    initialData[field.name] = ''
                  }
                })
                setFormData(initialData)
                setValidationMessages([])
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpar
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
