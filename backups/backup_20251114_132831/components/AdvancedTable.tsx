'use client'

import { useState, useMemo } from 'react'
import { FormField } from '@/lib/types'
import { 
  Table, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Download,
  Filter,
  Columns,
  Settings
} from 'lucide-react'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  width?: number
  type: 'text' | 'number' | 'date' | 'status' | 'actions'
  sortable: boolean
}

interface AdvancedTableProps {
  responses: any[]
  fields: FormField[]
  onItemAction: (action: 'view' | 'edit' | 'delete', item: any) => void
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void
}

export default function AdvancedTable({ 
  responses, 
  fields, 
  onItemAction, 
  onExport 
}: AdvancedTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' })
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  // Configuração inicial das colunas
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const baseColumns: ColumnConfig[] = [
      { key: 'id', label: 'ID', visible: true, type: 'text', sortable: true, width: 120 },
      { key: 'status', label: 'Status', visible: true, type: 'status', sortable: true, width: 100 },
      { key: 'created_at', label: 'Data Criação', visible: true, type: 'date', sortable: true, width: 140 },
      { key: 'updated_at', label: 'Última Atualização', visible: false, type: 'date', sortable: true, width: 140 }
    ]

    // Adicionar colunas dos campos do formulário
    const fieldColumns: ColumnConfig[] = fields.map(field => ({
      key: field.name,
      label: field.label,
      visible: true,
      type: field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text',
      sortable: true,
      width: 150
    }))

    return [
      ...baseColumns,
      ...fieldColumns,
      { key: 'actions', label: 'Ações', visible: true, type: 'actions', sortable: false, width: 120 }
    ]
  })

  // Dados ordenados
  const sortedData = useMemo(() => {
    const sorted = [...responses].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
        aValue = new Date(a[sortConfig.key])
        bValue = new Date(b[sortConfig.key])
      } else if (sortConfig.key === 'id' || sortConfig.key === 'status') {
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
      } else {
        aValue = a.response_data?.[sortConfig.key]
        bValue = b.response_data?.[sortConfig.key]
      }

      // Tratar valores nulos/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Comparação
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [responses, sortConfig])

  // Paginação
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map(item => item.id)))
    }
  }

  const toggleColumnVisibility = (key: string) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ))
  }

  const formatCellValue = (value: any, type: string) => {
    if (value == null) return '-'

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR')
      case 'number':
        return Number(value).toLocaleString('pt-BR')
      case 'status':
        const statusColors: {[key: string]: string} = {
          'draft': 'bg-yellow-100 text-yellow-800',
          'submitted': 'bg-green-100 text-green-800',
          'reviewed': 'bg-blue-100 text-blue-800',
          'approved': 'bg-purple-100 text-purple-800'
        }
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[value] || 'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        )
      default:
        return String(value).length > 50 ? String(value).substring(0, 47) + '...' : String(value)
    }
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />
  }

  const visibleColumns = columns.filter(col => col.visible)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Table className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Tabela Avançada</h3>
            <span className="text-sm text-gray-500">
              ({sortedData.length} registros)
            </span>
            {selectedRows.size > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedRows.size} selecionado(s)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Ações em lote */}
            {selectedRows.size > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={() => onExport?.('csv')}
                  className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                >
                  Exportar Selecionados
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir ${selectedRows.size} registro(s) selecionado(s)?`)) {
                      selectedRows.forEach(id => {
                        const item = responses.find(r => r.id === id)
                        if (item) onItemAction('delete', item)
                      })
                      setSelectedRows(new Set())
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                >
                  Excluir Selecionados
                </button>
              </div>
            )}

            {/* Configurações */}
            <button
              onClick={() => setShowColumnConfig(!showColumnConfig)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Configurar colunas"
            >
              <Columns className="h-4 w-4" />
            </button>

            {/* Tamanho da página */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>

        {/* Configuração de Colunas */}
        {showColumnConfig && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Configurar Colunas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {columns.map(column => (
                <label key={column.key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumnVisibility(column.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox para selecionar todos */}
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* Checkbox */}
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(item.id)}
                    onChange={() => handleSelectRow(item.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                {visibleColumns.map(column => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.key === 'actions' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onItemAction('view', item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onItemAction('edit', item)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onItemAction('delete', item)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : column.key === 'id' ? (
                      <span className="font-mono text-xs">
                        {item.id.substring(0, 8)}...
                      </span>
                    ) : column.key === 'created_at' || column.key === 'updated_at' ? (
                      formatCellValue(item[column.key], column.type)
                    ) : column.key === 'status' ? (
                      formatCellValue(item[column.key], column.type)
                    ) : (
                      formatCellValue(item.response_data?.[column.key], column.type)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <Table className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
          <p className="text-sm text-gray-500">
            Não há dados que correspondam aos filtros aplicados
          </p>
        </div>
      )}
    </div>
  )
}