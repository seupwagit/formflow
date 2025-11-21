'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { 
  Layers, 
  Plus, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  User, 
  Hash, 
  Type,
  CheckSquare,
  List,
  FileText
} from 'lucide-react'

interface GroupingControlsProps {
  fields: FormField[]
  groupBy: string[]
  onGroupByChange: (groupBy: string[]) => void
}

export default function GroupingControls({ fields, groupBy, onGroupByChange }: GroupingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Opções de agrupamento disponíveis
  const groupingOptions = [
    { value: 'status', label: 'Status', icon: <CheckSquare className="h-4 w-4" />, type: 'system' },
    { value: 'created_date', label: 'Data de Criação', icon: <Calendar className="h-4 w-4" />, type: 'system' },
    { value: 'created_month', label: 'Mês de Criação', icon: <Calendar className="h-4 w-4" />, type: 'system' },
    { value: 'created_year', label: 'Ano de Criação', icon: <Calendar className="h-4 w-4" />, type: 'system' },
    ...fields.map(field => ({
      value: field.name,
      label: field.label,
      icon: getFieldIcon(field.type),
      type: 'field' as const
    }))
  ]

  function getFieldIcon(type: string) {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'number': return <Hash className="h-4 w-4" />
      case 'date': return <Calendar className="h-4 w-4" />
      case 'select': return <List className="h-4 w-4" />
      case 'checkbox': return <CheckSquare className="h-4 w-4" />
      case 'textarea': return <FileText className="h-4 w-4" />
      default: return <Type className="h-4 w-4" />
    }
  }

  const addGrouping = (value: string) => {
    if (!groupBy.includes(value)) {
      onGroupByChange([...groupBy, value])
    }
  }

  const removeGrouping = (value: string) => {
    onGroupByChange(groupBy.filter(g => g !== value))
  }

  const moveGrouping = (index: number, direction: 'up' | 'down') => {
    const newGroupBy = [...groupBy]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < newGroupBy.length) {
      [newGroupBy[index], newGroupBy[targetIndex]] = [newGroupBy[targetIndex], newGroupBy[index]]
      onGroupByChange(newGroupBy)
    }
  }

  const clearAllGroupings = () => {
    onGroupByChange([])
  }

  const getOptionLabel = (value: string) => {
    const option = groupingOptions.find(opt => opt.value === value)
    return option?.label || value
  }

  const getOptionIcon = (value: string) => {
    const option = groupingOptions.find(opt => opt.value === value)
    return option?.icon || <Type className="h-4 w-4" />
  }

  const availableOptions = groupingOptions.filter(opt => !groupBy.includes(opt.value))

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Agrupamentos</h3>
            {groupBy.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {groupBy.length} nível(is)
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {groupBy.length > 0 && (
              <button
                onClick={clearAllGroupings}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
              >
                Limpar Tudo
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Groupings */}
      {groupBy.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Agrupamentos Ativos (ordem hierárquica)
            </h4>
            <div className="space-y-2">
              {groupBy.map((group, index) => (
                <div key={group} className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getOptionIcon(group)}
                      <span className="text-sm font-medium text-gray-900">
                        {getOptionLabel(group)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveGrouping(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveGrouping(index, 'down')}
                      disabled={index === groupBy.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeGrouping(group)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remover agrupamento"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Available Options */}
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Adicionar Agrupamento
            </h4>
            
            {availableOptions.length === 0 ? (
              <div className="text-center py-4">
                <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Todos os agrupamentos disponíveis estão sendo usados
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Opções do Sistema */}
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Sistema</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableOptions
                      .filter(opt => opt.type === 'system')
                      .map(option => (
                        <button
                          key={option.value}
                          onClick={() => addGrouping(option.value)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          {option.icon}
                          <span>{option.label}</span>
                        </button>
                      ))
                    }
                  </div>
                </div>

                {/* Campos do Formulário */}
                {availableOptions.some(opt => opt.type === 'field') && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-2">Campos do Formulário</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableOptions
                        .filter(opt => opt.type === 'field')
                        .map(option => (
                          <button
                            key={option.value}
                            onClick={() => addGrouping(option.value)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            {option.icon}
                            <span>{option.label}</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isExpanded && availableOptions.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {availableOptions.length} opção(ões) disponível(is)
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              <Plus className="h-3 w-3" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {groupBy.length === 0 && !isExpanded && (
        <div className="px-4 py-6 text-center">
          <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum agrupamento</h3>
          <p className="text-xs text-gray-500 mb-3">
            Organize seus dados por categorias
          </p>
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 border border-blue-200"
          >
            <Plus className="h-3 w-3" />
            <span>Adicionar Agrupamento</span>
          </button>
        </div>
      )}
    </div>
  )
}