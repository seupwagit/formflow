'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  FilterFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  Calendar,
  User,
  FileText,
  Clock,
  Plus
} from 'lucide-react'
import { FormField } from '@/lib/types'

interface TanStackDataGridProps {
  responses: any[]
  fields: FormField[]
  onItemAction: (action: 'view' | 'edit' | 'delete', item: any) => void
  onBulkAction?: (action: string, items: any[]) => void
  onNewItem?: () => void // 🆕 Callback para criar nova coleta
}

// Filtro customizado para busca global
const globalFilterFn: FilterFn<any> = (row, columnId, value) => {
  const search = value.toLowerCase()
  
  // Buscar em todos os campos de resposta
  const responseData = row.original.response_data || {}
  const searchableText = [
    row.original.id,
    row.original.status,
    ...Object.values(responseData)
  ].join(' ').toLowerCase()
  
  return searchableText.includes(search)
}

export default function TanStackDataGrid({
  responses,
  fields,
  onItemAction,
  onBulkAction,
  onNewItem
}: TanStackDataGridProps) {
  // Estados da tabela
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Estados da UI
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  const columnHelper = createColumnHelper<any>()

  // Definir colunas dinamicamente baseado nos campos
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns: ColumnDef<any>[] = [
      // Coluna de seleção
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      
      // ID da resposta
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <div className="font-mono text-xs text-gray-600">
            {String(info.getValue() || '').substring(0, 8)}...
          </div>
        ),
        size: 100,
      }),

      // Status
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'submitted': return 'bg-green-100 text-green-800'
              case 'draft': return 'bg-yellow-100 text-yellow-800'
              case 'reviewed': return 'bg-blue-100 text-blue-800'
              default: return 'bg-gray-100 text-gray-800'
            }
          }
          
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(String(status))}`}>
              {status === 'submitted' && <Check className="h-3 w-3 mr-1" />}
              {status === 'draft' && <Edit className="h-3 w-3 mr-1" />}
              {status === 'reviewed' && <Eye className="h-3 w-3 mr-1" />}
              {String(status)}
            </span>
          )
        },
        filterFn: 'equals',
        size: 120,
      }),

      // Data de criação
      columnHelper.accessor('created_at', {
        header: 'Criado em',
        cell: (info) => (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{new Date(String(info.getValue() || '')).toLocaleDateString('pt-BR')}</span>
          </div>
        ),
        size: 120,
      }),

      // Data de atualização
      columnHelper.accessor('updated_at', {
        header: 'Atualizado em',
        cell: (info) => (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{new Date(String(info.getValue() || '')).toLocaleDateString('pt-BR')}</span>
          </div>
        ),
        size: 120,
      }),
    ]

    // Adicionar colunas dos campos do formulário
    const fieldColumns = fields.map((field) =>
      columnHelper.accessor(`response_data.${field.name}`, {
        header: field.label || field.name,
        cell: (info) => {
          const value = info.getValue()
          if (!value) return <span className="text-gray-400">-</span>
          
          // Formatação baseada no tipo do campo
          switch (field.type) {
            case 'date':
              return new Date(String(value || '')).toLocaleDateString('pt-BR')
            case 'number':
              return typeof value === 'number' ? value.toLocaleString('pt-BR') : value
            case 'checkbox':
              return value ? '✓ Sim' : '✗ Não'
            default:
              return String(value).length > 50 
                ? String(value).substring(0, 50) + '...'
                : String(value)
          }
        },
        filterFn: 'includesString',
        size: 150,
      })
    )

    // Coluna de ações
    const actionsColumn: ColumnDef<any> = {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        console.log('🎯 Renderizando ações para:', row.original.id)
        return (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              console.log('👁️ Visualizar clicado:', row.original.id)
              onItemAction('view', row.original)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Visualizar detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              console.log('✏️ Editar clicado:', row.original.id)
              onItemAction('edit', row.original)
            }}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Editar documento"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              console.log('🗑️ Excluir clicado:', row.original.id)
              onItemAction('delete', row.original)
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Excluir documento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )},
      enableSorting: false,
      enableHiding: false,
      size: 150,
    }

    return [...baseColumns, ...fieldColumns, actionsColumn]
  }, [fields, onItemAction])

  // Configurar tabela
  const table = useReactTable({
    data: responses,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn,
  })

  // Ações em lote
  const handleBulkAction = (action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedItems = selectedRows.map(row => row.original)
    
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item')
      return
    }

    if (onBulkAction) {
      onBulkAction(action, selectedItems)
    }
    
    // Limpar seleção após ação
    setRowSelection({})
  }

  // Exportar dados
  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original)
    
    // Implementar exportação (CSV, Excel, etc.)
    console.log('Exportando dados:', dataToExport)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header com controles */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Dados Coletados
              </h3>
              <p className="text-sm text-gray-500">
                {table.getFilteredRowModel().rows.length} de {responses.length} registros
                {Object.keys(rowSelection).length > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {Object.keys(rowSelection).length} selecionados
                  </span>
                )}
              </p>
            </div>
            
            {/* 🆕 Botão Nova Coleta */}
            {onNewItem && (
              <button
                onClick={onNewItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span>Nova Coleta</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Busca global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Botão de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-md ${
                showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>

            {/* Configurações de colunas */}
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md"
            >
              <Settings className="h-4 w-4" />
              <span>Colunas</span>
            </button>

            {/* Exportar */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Ações em lote */}
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-800">
              {Object.keys(rowSelection).length} item(s) selecionado(s)
            </span>
            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-sm rounded"
            >
              <Trash2 className="h-3 w-3" />
              <span>Excluir</span>
            </button>
            <button
              onClick={() => handleBulkAction('export')}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded"
            >
              <Download className="h-3 w-3" />
              <span>Exportar</span>
            </button>
          </div>
        )}

        {/* Painel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                  onChange={(e) =>
                    table.getColumn('status')?.setFilterValue(e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="submitted">Enviado</option>
                  <option value="draft">Rascunho</option>
                  <option value="reviewed">Revisado</option>
                </select>
              </div>

              {/* Filtros por campos do formulário */}
              {fields.slice(0, 2).map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label || field.name}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filtrar por ${field.label || field.name}...`}
                    value={(table.getColumn(`response_data.${field.name}`)?.getFilterValue() as string) ?? ''}
                    onChange={(e) =>
                      table.getColumn(`response_data.${field.name}`)?.setFilterValue(e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  table.resetColumnFilters()
                  setGlobalFilter('')
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}

        {/* Configurações de colunas */}
        {showColumnSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Colunas Visíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {table.getAllLeafColumns().map((column) => {
                if (!column.getCanHide()) return null
                
                return (
                  <label key={column.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : column.id}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center space-x-1 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp 
                              className={`h-3 w-3 ${
                                header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-400'
                              }`} 
                            />
                            <ChevronDown 
                              className={`h-3 w-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-400'
                              }`} 
                            />
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id}
                className={`hover:bg-gray-50 ${
                  row.getIsSelected() ? 'bg-blue-50' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              de {table.getFilteredRowModel().rows.length} registros
            </span>
            
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {[10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} por página
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-700">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1 border border-gray-300 rounded disabled:opacity-50"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}