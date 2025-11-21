'use client'

import { useState } from 'react'
import { getPublicTables, getTableColumns } from '@/lib/database-schema'
import { Database, Table, RefreshCw, Eye } from 'lucide-react'

export default function DatabaseDebug() {
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [columns, setColumns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingColumns, setIsLoadingColumns] = useState(false)

  const loadTables = async () => {
    setIsLoading(true)
    try {
      const tableList = await getPublicTables()
      setTables(tableList)
      console.log('Tabelas encontradas:', tableList)
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadColumns = async (tableName: string) => {
    setIsLoadingColumns(true)
    setSelectedTable(tableName)
    try {
      const columnList = await getTableColumns(tableName)
      setColumns(columnList)
      console.log(`Colunas de ${tableName}:`, columnList)
    } catch (error) {
      console.error('Erro ao carregar colunas:', error)
    } finally {
      setIsLoadingColumns(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Debug do Banco de Dados</h3>
        </div>
        <button
          onClick={loadTables}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Carregar Tabelas</span>
        </button>
      </div>

      {/* Lista de Tabelas */}
      {tables.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">
            Tabelas Encontradas ({tables.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {tables.map((table, index) => (
              <button
                key={index}
                onClick={() => loadColumns(table.table_name)}
                className={`flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 text-left ${
                  selectedTable === table.table_name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Table className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{table.table_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colunas da Tabela Selecionada */}
      {selectedTable && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-gray-900">
              Colunas de "{selectedTable}"
            </h4>
            {isLoadingColumns && (
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          
          {columns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nulo?
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Padrão
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {columns.map((column, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {column.column_name}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {column.data_type}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {column.is_nullable}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {column.column_default || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !isLoadingColumns ? (
            <p className="text-sm text-gray-500">Nenhuma coluna encontrada</p>
          ) : null}
        </div>
      )}

      {/* Instruções */}
      {tables.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Clique em "Carregar Tabelas" para ver as tabelas disponíveis</p>
          <p className="text-sm text-gray-500">
            Se não aparecer nenhuma tabela, você precisa criar as tabelas de exemplo primeiro
          </p>
        </div>
      )}
    </div>
  )
}