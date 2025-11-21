'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, Trash2, Save, Eye } from 'lucide-react'
import { ExpectedFieldsConfig } from '@/lib/hybrid-ai-ocr-processor'

interface ExpectedFieldsConfigProps {
  totalPages: number
  onConfigChange: (config: ExpectedFieldsConfig) => void
  initialConfig?: ExpectedFieldsConfig
}

export default function ExpectedFieldsConfigComponent({ 
  totalPages, 
  onConfigChange, 
  initialConfig = {} 
}: ExpectedFieldsConfigProps) {
  const [config, setConfig] = useState<ExpectedFieldsConfig>(initialConfig)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    // Inicializar configuração padrão se não existir
    const defaultConfig: ExpectedFieldsConfig = {}
    
    for (let i = 1; i <= totalPages; i++) {
      if (!config[i]) {
        defaultConfig[i] = {
          expectedCount: 10, // Padrão: 10 campos por página
          fieldTypes: ['text', 'number', 'date', 'checkbox'],
          description: `Página ${i} do formulário`
        }
      } else {
        defaultConfig[i] = config[i]
      }
    }
    
    setConfig(defaultConfig)
    onConfigChange(defaultConfig)
  }, [totalPages])

  const updatePageConfig = (pageNum: number, field: string, value: any) => {
    const newConfig = {
      ...config,
      [pageNum]: {
        ...config[pageNum],
        [field]: value
      }
    }
    
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const addFieldType = (pageNum: number, fieldType: string) => {
    const currentTypes = config[pageNum]?.fieldTypes || []
    if (!currentTypes.includes(fieldType)) {
      updatePageConfig(pageNum, 'fieldTypes', [...currentTypes, fieldType])
    }
  }

  const removeFieldType = (pageNum: number, fieldType: string) => {
    const currentTypes = config[pageNum]?.fieldTypes || []
    updatePageConfig(pageNum, 'fieldTypes', currentTypes.filter(t => t !== fieldType))
  }

  const applyToAllPages = (field: string, value: any) => {
    const newConfig = { ...config }
    
    for (let i = 1; i <= totalPages; i++) {
      newConfig[i] = {
        ...newConfig[i],
        [field]: value
      }
    }
    
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const fieldTypeOptions = [
    { value: 'text', label: 'Texto', icon: '📝' },
    { value: 'number', label: 'Número', icon: '🔢' },
    { value: 'date', label: 'Data', icon: '📅' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'select', label: 'Lista', icon: '📋' },
    { value: 'textarea', label: 'Área de Texto', icon: '📄' },
    { value: 'signature', label: 'Assinatura', icon: '✍️' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Telefone', icon: '📞' }
  ]

  const getTotalExpectedFields = () => {
    return Object.values(config).reduce((sum, page) => sum + (page.expectedCount || 0), 0)
  }

  if (!showConfig) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Configuração de Campos Esperados</h3>
              <p className="text-sm text-gray-600">
                Total: {getTotalExpectedFields()} campos em {totalPages} páginas
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Eye className="h-4 w-4" />
            <span>Configurar</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Configuração de Campos Esperados</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Total: {getTotalExpectedFields()} campos
          </span>
          <button
            onClick={() => setShowConfig(false)}
            className="btn-secondary text-sm"
          >
            Ocultar
          </button>
        </div>
      </div>

      {/* Ações Globais */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-900 mb-2">Aplicar a Todas as Páginas:</h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Campos por página"
            className="input-field text-sm w-32"
            onChange={(e) => {
              const count = parseInt(e.target.value) || 0
              if (count > 0) {
                applyToAllPages('expectedCount', count)
              }
            }}
          />
          <button
            onClick={() => applyToAllPages('fieldTypes', ['text', 'number', 'date', 'checkbox'])}
            className="btn-secondary text-xs"
          >
            Tipos Padrão
          </button>
        </div>
      </div>

      {/* Configuração por Página */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <div key={pageNum} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Página {pageNum}</h4>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Campos esperados:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config[pageNum]?.expectedCount || 0}
                  onChange={(e) => updatePageConfig(pageNum, 'expectedCount', parseInt(e.target.value) || 0)}
                  className="input-field text-sm w-20"
                />
              </div>
            </div>

            {/* Descrição da Página */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Página:
              </label>
              <input
                type="text"
                value={config[pageNum]?.description || ''}
                onChange={(e) => updatePageConfig(pageNum, 'description', e.target.value)}
                placeholder={`Descrição da página ${pageNum}`}
                className="input-field text-sm"
              />
            </div>

            {/* Tipos de Campo Esperados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de Campo Esperados:
              </label>
              
              {/* Tipos Selecionados */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(config[pageNum]?.fieldTypes || []).map(fieldType => {
                  const typeInfo = fieldTypeOptions.find(t => t.value === fieldType)
                  return (
                    <span
                      key={fieldType}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                    >
                      <span>{typeInfo?.icon}</span>
                      <span>{typeInfo?.label}</span>
                      <button
                        onClick={() => removeFieldType(pageNum, fieldType)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>

              {/* Adicionar Tipos */}
              <div className="flex flex-wrap gap-1">
                {fieldTypeOptions
                  .filter(type => !(config[pageNum]?.fieldTypes || []).includes(type.value))
                  .map(type => (
                    <button
                      key={type.value}
                      onClick={() => addFieldType(pageNum, type.value)}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs"
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                      <Plus className="h-3 w-3" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <div className="flex items-center justify-between text-sm text-green-700">
          <div>
            <strong>Resumo da Configuração:</strong>
          </div>
          <div>
            <strong>{getTotalExpectedFields()} campos</strong> em <strong>{totalPages} páginas</strong>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-green-600">
          A IA usará essas informações para garantir que encontre o número correto de campos em cada página.
          Se não encontrar campos suficientes, ativará o modo agressivo de detecção.
        </div>
      </div>
    </div>
  )
}