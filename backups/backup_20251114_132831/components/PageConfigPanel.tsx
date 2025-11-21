'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { ValidationRule } from '@/lib/types/validation-rules'
import { 
  Type, Hash, Calendar, CheckSquare, List, FileText, 
  Signature, Mail, Phone, Image, Calculator, Database,
  Table, Settings, Plus, Trash2, AlertCircle
} from 'lucide-react'
import ValidationRuleBuilder from './ValidationRuleBuilder'

interface PageConfigPanelProps {
  pageNumber: number
  pageDescription: string
  expectedFieldCount: number
  detectedFields: FormField[]
  validationRules: ValidationRule[]
  onUpdateDescription: (description: string) => void
  onUpdateExpectedCount: (count: number) => void
  onAddFieldType: (type: FormField['type']) => void
  onRemoveFieldType: (type: FormField['type']) => void
  onUpdateValidationRules: (rules: ValidationRule[]) => void
}

export default function PageConfigPanel({
  pageNumber,
  pageDescription,
  expectedFieldCount,
  detectedFields,
  validationRules,
  onUpdateDescription,
  onUpdateExpectedCount,
  onAddFieldType,
  onRemoveFieldType,
  onUpdateValidationRules
}: PageConfigPanelProps) {
  const [showValidationBuilder, setShowValidationBuilder] = useState(false)

  // Tipos de campo disponíveis
  const fieldTypes: Array<{
    type: FormField['type']
    label: string
    icon: any
    color: string
  }> = [
    { type: 'text', label: 'Texto', icon: Type, color: 'pink' },
    { type: 'number', label: 'Número', icon: Hash, color: 'blue' },
    { type: 'date', label: 'Data', icon: Calendar, color: 'purple' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'indigo' },
    { type: 'select', label: 'Lista', icon: List, color: 'gray' },
    { type: 'textarea', label: 'Área de Texto', icon: FileText, color: 'gray' },
    { type: 'signature', label: 'Assinatura', icon: Signature, color: 'orange' },
    { type: 'image', label: 'Email', icon: Mail, color: 'blue' },
    { type: 'dynamic_list', label: 'Lista Dinâmica', icon: Database, color: 'green' },
    { type: 'calculated', label: 'Calculado', icon: Calculator, color: 'yellow' },
    { type: 'table', label: 'Tabela', icon: Table, color: 'teal' },
  ]

  // Contar campos por tipo
  const fieldTypeCounts = detectedFields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Página {pageNumber}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Campos esperados:</span>
          <input
            type="number"
            value={expectedFieldCount}
            onChange={(e) => onUpdateExpectedCount(parseInt(e.target.value) || 0)}
            min="0"
            className="w-20 px-3 py-1 border rounded-lg text-center"
          />
        </div>
      </div>

      {/* Descrição da Página */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição da Página:
        </label>
        <input
          type="text"
          value={pageDescription}
          onChange={(e) => onUpdateDescription(e.target.value)}
          placeholder="Página 1 do formulário"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tipos de Campo Esperados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipos de Campo Esperados:
        </label>
        <div className="flex flex-wrap gap-2">
          {fieldTypes.map(({ type, label, icon: Icon, color }) => {
            const count = fieldTypeCounts[type] || 0
            const isActive = count > 0

            return (
              <button
                key={type}
                onClick={() => isActive ? onRemoveFieldType(type) : onAddFieldType(type)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all
                  ${isActive 
                    ? `bg-${color}-50 border-${color}-300 text-${color}-700` 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white rounded text-xs font-bold">
                    {count}
                  </span>
                )}
                {isActive ? (
                  <Trash2 className="h-3 w-3 ml-1" />
                ) : (
                  <Plus className="h-3 w-3 ml-1" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Botão de Validações */}
      <div className="pt-4 border-t">
        <button
          onClick={() => setShowValidationBuilder(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Configurar Validações Condicionais</span>
          {validationRules.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white text-purple-600 rounded-full text-xs font-bold">
              {validationRules.length}
            </span>
          )}
        </button>
      </div>

      {/* Resumo da Configuração */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">
          Resumo da Configuração:
        </h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>
            <strong>{detectedFields.length} campos</strong> detectados em <strong>{pageNumber} página(s)</strong>
          </p>
          {expectedFieldCount > 0 && detectedFields.length !== expectedFieldCount && (
            <div className="flex items-start space-x-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-800">
                Esperado: {expectedFieldCount} campos, Detectado: {detectedFields.length} campos.
                {detectedFields.length < expectedFieldCount 
                  ? ' A IA ativará modo agressivo de detecção.' 
                  : ' Verifique se há campos duplicados.'}
              </p>
            </div>
          )}
          {validationRules.length > 0 && (
            <p className="mt-2">
              <strong>{validationRules.length} regra(s)</strong> de validação configurada(s)
            </p>
          )}
        </div>
      </div>

      {/* Modal de Validações */}
      {showValidationBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Validações Condicionais</h2>
              <button
                onClick={() => setShowValidationBuilder(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ValidationRuleBuilder
                fields={detectedFields.map(f => ({
                  name: f.name,
                  label: f.label,
                  type: f.type
                }))}
                rules={validationRules}
                onChange={onUpdateValidationRules}
              />
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowValidationBuilder(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
