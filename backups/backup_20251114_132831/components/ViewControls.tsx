'use client'

import { useState } from 'react'
import { 
  Table, 
  TreePine, 
  BarChart3, 
  Grid, 
  List, 
  Eye, 
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

export type ViewMode = 'table' | 'tree' | 'cards' | 'chart'

interface ViewControlsProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  totalRecords: number
  filteredRecords: number
  onRefresh?: () => void
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void
}

export default function ViewControls({ 
  currentView, 
  onViewChange, 
  totalRecords, 
  filteredRecords,
  onRefresh,
  onExport 
}: ViewControlsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)

  const viewOptions = [
    {
      id: 'table' as ViewMode,
      label: 'Tabela',
      icon: <Table className="h-4 w-4" />,
      description: 'Visualização em tabela com ordenação e paginação'
    },
    {
      id: 'tree' as ViewMode,
      label: 'Árvore',
      icon: <TreePine className="h-4 w-4" />,
      description: 'Visualização hierárquica em árvore'
    },
    {
      id: 'cards' as ViewMode,
      label: 'Cards',
      icon: <Grid className="h-4 w-4" />,
      description: 'Visualização em cartões'
    },
    {
      id: 'chart' as ViewMode,
      label: 'Gráficos',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Visualização em gráficos e estatísticas'
    }
  ]

  const exportOptions = [
    { format: 'csv', label: 'CSV', description: 'Arquivo de valores separados por vírgula' },
    { format: 'excel', label: 'Excel', description: 'Planilha do Microsoft Excel' },
    { format: 'pdf', label: 'PDF', description: 'Documento PDF' }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-900">Visualização</h3>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {viewOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onViewChange(option.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === option.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={option.description}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center space-x-4">
            {/* Record Count */}
            <div className="text-sm text-gray-600">
              {filteredRecords === totalRecords ? (
                <span>{totalRecords} registro(s)</span>
              ) : (
                <span>
                  {filteredRecords} de {totalRecords} registro(s)
                  {filteredRecords < totalRecords && (
                    <span className="ml-1 text-blue-600">(filtrado)</span>
                  )}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Refresh */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Atualizar dados"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}

              {/* Export */}
              {onExport && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Formatos Disponíveis
                        </div>
                        {exportOptions.map((option) => (
                          <button
                            key={option.format}
                            onClick={() => {
                              onExport(option.format as 'csv' | 'excel' | 'pdf')
                              setShowExportMenu(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Description */}
        <div className="mt-3 text-xs text-gray-500">
          {viewOptions.find(opt => opt.id === currentView)?.description}
        </div>
      </div>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  )
}