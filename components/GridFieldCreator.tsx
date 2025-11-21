'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { Grid, Plus, Trash2, X } from 'lucide-react'

interface GridFieldCreatorProps {
  onCreateGrid: (gridFields: FormField[], gridConfig: any) => void
  onClose: () => void
  startPosition?: { x: number; y: number; page: number }
}

interface ColumnConfig {
  name: string
  label: string
  type: FormField['type']
  placeholder?: string
  defaultValue?: string
}

export default function GridFieldCreator({
  onCreateGrid,
  onClose,
  startPosition = { x: 100, y: 100, page: 0 }
}: GridFieldCreatorProps) {
  const [gridName, setGridName] = useState('tabela_dados')
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { name: 'coluna_1', label: 'Coluna 1', type: 'text', placeholder: '', defaultValue: '' },
    { name: 'coluna_2', label: 'Coluna 2', type: 'text', placeholder: '', defaultValue: '' },
    { name: 'coluna_3', label: 'Coluna 3', type: 'text', placeholder: '', defaultValue: '' }
  ])

  const fieldTypes: Array<{ value: FormField['type']; label: string }> = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Lista' },
    { value: 'textarea', label: 'Área de Texto' }
  ]

  const addColumn = () => {
    setColumns([...columns, {
      name: `coluna_${columns.length + 1}`,
      label: `Coluna ${columns.length + 1}`,
      type: 'text',
      placeholder: '',
      defaultValue: ''
    }])
  }

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return
    setColumns(columns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: keyof ColumnConfig, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const handleCreate = () => {
    if (!gridName.trim()) {
      alert('Digite um nome para a tabela')
      return
    }

    if (columns.some(col => !col.name.trim() || !col.label.trim())) {
      alert('Preencha nome e label de todas as colunas')
      return
    }

    // Calcular dimensões
    const cellWidth = 150
    const cellHeight = 35
    const headerHeight = 40
    const totalWidth = cellWidth * columns.length
    const totalHeight = headerHeight + (cellHeight * rows)

    // Gerar campos automaticamente
    const generatedFields: FormField[] = []
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns.length; col++) {
        const column = columns[col]
        const fieldId = `${gridName}_${column.name}_linha${row + 1}`
        const fieldName = `${column.name}_${(row + 1).toString().padStart(2, '0')}`
        
        generatedFields.push({
          id: fieldId,
          name: fieldName,
          type: column.type,
          label: `${column.label} (Linha ${row + 1})`,
          required: false,
          placeholder: column.placeholder || undefined,
          position: {
            x: startPosition.x + (col * cellWidth),
            y: startPosition.y + headerHeight + (row * cellHeight),
            width: cellWidth - 2,
            height: cellHeight - 2,
            page: startPosition.page
          }
        })
      }
    }

    // Configuração do grid
    const gridConfig = {
      name: gridName,
      rows,
      columns: columns.map(col => ({
        name: col.name,
        label: col.label,
        type: col.type
      })),
      position: startPosition,
      dimensions: {
        width: totalWidth,
        height: totalHeight,
        cellWidth,
        cellHeight,
        headerHeight
      }
    }

    onCreateGrid(generatedFields, gridConfig)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <Grid className="h-6 w-6 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold">Criar Tabela/Grid</h2>
              <p className="text-sm text-gray-600">Configure linhas, colunas e tipos - o resto é automático</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Configurações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Tabela
              </label>
              <input
                type="text"
                value={gridName}
                onChange={(e) => setGridName(e.target.value)}
                placeholder="tabela_dados"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Linhas
              </label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Configuração de Colunas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Colunas ({columns.length})
              </label>
              <button
                onClick={addColumn}
                className="flex items-center space-x-1 px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Coluna</span>
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((column, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 space-y-3">
                      {/* Linha 1: Nome, Label, Tipo */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Nome (banco)</label>
                          <input
                            type="text"
                            value={column.name}
                            onChange={(e) => updateColumn(index, 'name', e.target.value)}
                            placeholder="coluna_1"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Label (exibição)</label>
                          <input
                            type="text"
                            value={column.label}
                            onChange={(e) => updateColumn(index, 'label', e.target.value)}
                            placeholder="Coluna 1"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tipo</label>
                          <select
                            value={column.type}
                            onChange={(e) => updateColumn(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            {fieldTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Linha 2: Placeholder (opcional) */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Placeholder (opcional - deixe vazio para não poluir)
                        </label>
                        <input
                          type="text"
                          value={column.placeholder || ''}
                          onChange={(e) => updateColumn(index, 'placeholder', e.target.value)}
                          placeholder="Ex: Digite o nome... (deixe vazio se preferir)"
                          className="w-full px-2 py-1 border rounded text-sm text-gray-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeColumn(index)}
                      disabled={columns.length <= 1}
                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed mt-5"
                      title="Remover coluna"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview da Tabela</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-3 py-2 text-left font-medium text-gray-700 border-r last:border-r-0">
                        <div>{col.label}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {col.type}
                          {col.placeholder && (
                            <span className="ml-1 text-blue-600">• com placeholder</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(rows, 3) }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 border-r last:border-r-0">
                          <div className="text-gray-700 font-mono text-xs">
                            {col.name}_{(rowIdx + 1).toString().padStart(2, '0')}
                          </div>
                          {col.placeholder && (
                            <div className="text-gray-400 text-xs italic mt-0.5">
                              "{col.placeholder}"
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows > 3 && (
                    <tr className="border-t bg-gray-50">
                      <td colSpan={columns.length} className="px-3 py-2 text-center text-sm text-gray-500">
                        ... e mais {rows - 3} linha(s)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-semibold text-teal-800 mb-2">Resumo</h4>
            <div className="text-sm text-teal-700 space-y-1">
              <p>• <strong>{rows * columns.length} campos</strong> serão criados automaticamente</p>
              <p>• <strong>{rows} linhas</strong> × <strong>{columns.length} colunas</strong></p>
              <p>• Campos nomeados como: <code className="bg-white px-1 rounded">{columns[0]?.name}_01</code>, <code className="bg-white px-1 rounded">{columns[0]?.name}_02</code>, etc.</p>
              {columns.some(col => col.placeholder) && (
                <p>• <strong>{columns.filter(col => col.placeholder).length} coluna(s)</strong> com placeholder configurado</p>
              )}
              {columns.every(col => !col.placeholder) && (
                <p className="text-teal-600">• ✓ Sem placeholders - tela limpa e sem poluição visual</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 font-medium shadow-md"
          >
            Criar {rows * columns.length} Campos
          </button>
        </div>
      </div>
    </div>
  )
}
