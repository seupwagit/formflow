'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import { Database, Eye, RefreshCw } from 'lucide-react'

interface DynamicListConfigProps {
  field: FormField
  onUpdate: (field: FormField) => void
}

export default function DynamicListConfig({ field, onUpdate }: DynamicListConfigProps) {
  const [tables, setTables] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<Array<{ value: any, label: string }>>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isLoadingColumns, setIsLoadingColumns] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const config = field.dynamicConfig || {
    sourceTable: '',
    valueField: '',
    displayField: '',
    filterCondition: '',
    orderBy: ''
  }

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (config.sourceTable) {
      loadColumns(config.sourceTable)
    }
  }, [config.sourceTable])

  const loadTables = async () => {
    setIsLoadingTables(true)
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const tableList = await response.json()
        setTables(tableList)
      }
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error)
    } finally {
      setIsLoadingTables(false)
    }
  }

  const loadColumns = async (tableName: string) => {
    setIsLoadingColumns(true)
    try {
      const response = await fetch(`/api/tables/${tableName}/columns`)
      if (response.ok) {
        const columnList = await response.json()
        setColumns(columnList)
      }
    } catch (error) {
      console.error('Erro ao carregar colunas:', error)
    } finally {
      setIsLoadingColumns(false)
    }
  }

  const loadPreview = async () => {
    if (!config.sourceTable || !config.valueField || !config.displayField) {
      return
    }

    setIsLoadingPreview(true)
    try {
      // Simular dados de preview por enquanto
      const mockData = [
        { value: 1, label: 'Item 1' },
        { value: 2, label: 'Item 2' },
        { value: 3, label: 'Item 3' },
        { value: 4, label: 'Item 4' },
        { value: 5, label: 'Item 5' }
      ]
      setPreviewData(mockData)
    } catch (error) {
      console.error('Erro ao carregar preview:', error)
      setPreviewData([])
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const updateConfig = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    const updatedField: FormField = {
      ...field,
      dynamicConfig: newConfig
    }
    onUpdate(updatedField)
  }

  const handleTableChange = (tableName: string) => {
    updateConfig({
      sourceTable: tableName,
      valueField: '',
      displayField: '',
      filterCondition: '',
      orderBy: ''
    })
    setPreviewData([])
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Configuração de Lista Dinâmica</h4>
        </div>
        <p className="text-sm text-blue-800">
          Configure a fonte de dados para popular este campo automaticamente com dados do banco.
        </p>
      </div>

      {/* Seleção da Tabela */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tabela de Origem *
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={config.sourceTable}
            onChange={(e) => handleTableChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoadingTables}
          >
            <option value="">Selecione uma tabela...</option>
            {tables.map((table) => (
              <option key={table.table_name} value={table.table_name}>
                {table.table_name}
              </option>
            ))}
          </select>
          <button
            onClick={loadTables}
            disabled={isLoadingTables}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            title="Recarregar tabelas"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingTables ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {isLoadingTables && (
          <p className="text-xs text-gray-500 mt-1">Carregando tabelas...</p>
        )}
      </div>

      {/* Seleção dos Campos */}
      {config.sourceTable && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campo ID (Valor) *
            </label>
            <select
              value={config.valueField}
              onChange={(e) => updateConfig({ valueField: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingColumns}
            >
              <option value="">Selecione o campo ID...</option>
              {columns.map((column) => (
                <option key={column.column_name} value={column.column_name}>
                  {column.column_name} ({column.data_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campo Nome (Exibição) *
            </label>
            <select
              value={config.displayField}
              onChange={(e) => updateConfig({ displayField: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoadingColumns}
            >
              <option value="">Selecione o campo nome...</option>
              {columns.map((column) => (
                <option key={column.column_name} value={column.column_name}>
                  {column.column_name} ({column.data_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Configurações Avançadas */}
      {config.sourceTable && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Configurações Avançadas (Opcional)</h5>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição de Filtro
            </label>
            <input
              type="text"
              value={config.filterCondition || ''}
              onChange={(e) => updateConfig({ filterCondition: e.target.value })}
              placeholder="Ex: active = true"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: campo = valor (ex: active = true, status = 'ativo')
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar Por
            </label>
            <select
              value={config.orderBy || ''}
              onChange={(e) => updateConfig({ orderBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Ordenação padrão (campo nome)</option>
              {columns.map((column) => (
                <option key={column.column_name} value={column.column_name}>
                  {column.column_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Preview dos Dados */}
      {config.sourceTable && config.valueField && config.displayField && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Preview dos Dados
            </label>
            <button
              onClick={loadPreview}
              disabled={isLoadingPreview}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Eye className="h-3 w-3" />
              <span>Visualizar</span>
            </button>
          </div>
          
          {isLoadingPreview ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Carregando preview...</p>
            </div>
          ) : previewData.length > 0 ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                Primeiros {previewData.length} registros:
              </p>
              <div className="space-y-1">
                {previewData.map((item, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-mono text-gray-500">{item.value}</span>
                    <span className="mx-2">→</span>
                    <span className="text-gray-900">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Nenhum dado encontrado. Verifique a configuração.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}