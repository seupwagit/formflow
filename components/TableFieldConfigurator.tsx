'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { Table, Plus, Trash2, Settings, Grid } from 'lucide-react'

interface TableFieldConfiguratorProps {
  fields: FormField[]
  onConfigureTable: (tableField: FormField) => void
  onClose: () => void
}

export default function TableFieldConfigurator({
  fields,
  onConfigureTable,
  onClose
}: TableFieldConfiguratorProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)
  const [columnHeaders, setColumnHeaders] = useState<string[]>(['Coluna 1', 'Coluna 2', 'Coluna 3'])
  const [tableName, setTableName] = useState('tabela_dados')
  const [allowAddRows, setAllowAddRows] = useState(true)

  const toggleFieldSelection = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleColumnsChange = (newColumns: number) => {
    setColumns(newColumns)
    setColumnHeaders(prev => {
      const newHeaders = [...prev]
      while (newHeaders.length < newColumns) {
        newHeaders.push(`Coluna ${newHeaders.length + 1}`)
      }
      return newHeaders.slice(0, newColumns)
    })
  }

  const handleCreateTable = () => {
    if (selectedFields.length === 0) {
      alert('Selecione pelo menos um campo para criar a tabela')
      return
    }

    // Calcular posição da tabela baseada nos campos selecionados
    const selectedFieldObjects = fields.filter(f => selectedFields.includes(f.id))
    const minX = Math.min(...selectedFieldObjects.map(f => f.position.x))
    const minY = Math.min(...selectedFieldObjects.map(f => f.position.y))
    const maxX = Math.max(...selectedFieldObjects.map(f => f.position.x + f.position.width))
    const maxY = Math.max(...selectedFieldObjects.map(f => f.position.y + f.position.height))

    const tableField: FormField = {
      id: `table_${Date.now()}`,
      name: tableName,
      type: 'table',
      label: `Tabela: ${tableName}`,
      required: false,
      position: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        page: selectedFieldObjects[0].position.page
      },
      tableConfig: {
        rows,
        columns,
        columnHeaders,
        cellFields: selectedFieldObjects,
        allowAddRows,
        allowRemoveRows: true,
        minRows: 1,
        maxRows: 50
      }
    }

    onConfigureTable(tableField)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Grid className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold">Configurar Tabela</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Configurações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Configurações da Tabela</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Tabela
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="tabela_dados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Linhas
                </label>
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Colunas
                </label>
                <input
                  type="number"
                  value={columns}
                  onChange={(e) => handleColumnsChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowAddRows}
                    onChange={(e) => setAllowAddRows(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Permitir adicionar linhas</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cabeçalhos das Colunas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Cabeçalhos das Colunas</h3>
            <div className="grid grid-cols-2 gap-4">
              {columnHeaders.map((header, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coluna {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => {
                      const newHeaders = [...columnHeaders]
                      newHeaders[idx] = e.target.value
                      setColumnHeaders(newHeaders)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Campos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Selecionar Campos da Tabela ({selectedFields.length} selecionados)
            </h3>
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {fields.map(field => (
                <div
                  key={field.id}
                  onClick={() => toggleFieldSelection(field.id)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedFields.includes(field.id) ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{field.label}</div>
                      <div className="text-sm text-gray-500">
                        {field.name} • {field.type} • Posição: ({Math.round(field.position.x)}, {Math.round(field.position.y)})
                      </div>
                    </div>
                    {selectedFields.includes(field.id) && (
                      <div className="text-blue-600">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Preview da Tabela</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    {columnHeaders.map((header, idx) => (
                      <th key={idx} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(rows, 3) }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {columnHeaders.map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-2 text-sm text-gray-500 border-r last:border-r-0">
                          Célula {rowIdx + 1},{colIdx + 1}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows > 3 && (
                <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                  ... e mais {rows - 3} linha(s)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateTable}
            disabled={selectedFields.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Table className="h-4 w-4" />
            <span>Criar Tabela</span>
          </button>
        </div>
      </div>
    </div>
  )
}
