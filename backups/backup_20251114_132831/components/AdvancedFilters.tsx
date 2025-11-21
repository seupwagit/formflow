'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import { 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Hash, 
  Type, 
  CheckSquare, 
  List, 
  FileText,
  X,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface FilterCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_empty' | 'empty'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface AdvancedFiltersProps {
  fields: FormField[]
  responses: any[]
  onFilterChange: (filteredResponses: any[]) => void
  onFiltersUpdate: (filters: FilterCondition[]) => void
}

export default function AdvancedFilters({ 
  fields, 
  responses, 
  onFilterChange, 
  onFiltersUpdate 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [quickSearch, setQuickSearch] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [fieldFilters, setFieldFilters] = useState<{[key: string]: any}>({})

  // Operadores disponíveis por tipo de campo
  const getOperatorsForField = (field: FormField) => {
    const baseOperators = [
      { value: 'equals', label: 'Igual a' },
      { value: 'not_empty', label: 'Não vazio' },
      { value: 'empty', label: 'Vazio' }
    ]

    switch (field.type) {
      case 'text':
      case 'textarea':
        return [
          ...baseOperators,
          { value: 'contains', label: 'Contém' },
          { value: 'starts_with', label: 'Começa com' },
          { value: 'ends_with', label: 'Termina com' }
        ]
      case 'number':
        return [
          ...baseOperators,
          { value: 'greater_than', label: 'Maior que' },
          { value: 'less_than', label: 'Menor que' },
          { value: 'between', label: 'Entre' }
        ]
      case 'date':
        return [
          ...baseOperators,
          { value: 'greater_than', label: 'Depois de' },
          { value: 'less_than', label: 'Antes de' },
          { value: 'between', label: 'Entre' }
        ]
      case 'select':
        return [
          ...baseOperators,
          { value: 'in', label: 'Em' }
        ]
      case 'checkbox':
        return [
          { value: 'equals', label: 'Igual a' }
        ]
      default:
        return baseOperators
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...responses]

    // Filtro de busca rápida
    if (quickSearch) {
      const searchLower = quickSearch.toLowerCase()
      filtered = filtered.filter(response => {
        return Object.values(response.response_data || {}).some(value =>
          String(value).toLowerCase().includes(searchLower)
        ) || response.id.toLowerCase().includes(searchLower)
      })
    }

    // Filtro de data
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.created_at)
        const start = dateRange.start ? new Date(dateRange.start) : null
        const end = dateRange.end ? new Date(dateRange.end) : null
        
        if (start && responseDate < start) return false
        if (end && responseDate > end) return false
        return true
      })
    }

    // Filtro de status
    if (statusFilter.length > 0) {
      filtered = filtered.filter(response => 
        statusFilter.includes(response.status)
      )
    }

    // Filtros avançados por campo
    filters.forEach(filter => {
      filtered = filtered.filter(response => {
        const fieldValue = response.response_data?.[filter.field]
        return applyFilterCondition(fieldValue, filter)
      })
    })

    onFilterChange(filtered)
  }, [quickSearch, dateRange, statusFilter, filters, responses])

  const applyFilterCondition = (value: any, condition: FilterCondition): boolean => {
    const { operator, value: filterValue } = condition

    switch (operator) {
      case 'equals':
        return String(value) === String(filterValue)
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
      case 'greater_than':
        return Number(value) > Number(filterValue)
      case 'less_than':
        return Number(value) < Number(filterValue)
      case 'between':
        const [min, max] = filterValue
        return Number(value) >= Number(min) && Number(value) <= Number(max)
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value)
      case 'not_empty':
        return value !== null && value !== undefined && String(value).trim() !== ''
      case 'empty':
        return value === null || value === undefined || String(value).trim() === ''
      default:
        return true
    }
  }

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: fields[0]?.name || '',
      operator: 'equals',
      value: '',
      logicalOperator: filters.length > 0 ? 'AND' : undefined
    }
    setFilters([...filters, newFilter])
  }

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ))
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(filter => filter.id !== id))
  }

  const clearAllFilters = () => {
    setQuickSearch('')
    setDateRange({ start: '', end: '' })
    setStatusFilter([])
    setFilters([])
    setFieldFilters({})
  }

  const getFieldIcon = (type: string) => {
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

  const getUniqueValues = (fieldName: string) => {
    const values = responses
      .map(r => r.response_data?.[fieldName])
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
    return Array.from(new Set(values)).sort()
  }

  const statusOptions = [
    { value: 'draft', label: 'Rascunho', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'submitted', label: 'Enviado', color: 'bg-green-100 text-green-800' },
    { value: 'reviewed', label: 'Revisado', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Aprovado', color: 'bg-purple-100 text-purple-800' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
            {(filters.length > 0 || quickSearch || dateRange.start || dateRange.end || statusFilter.length > 0) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.length + (quickSearch ? 1 : 0) + (dateRange.start || dateRange.end ? 1 : 0) + (statusFilter.length > 0 ? 1 : 0)} ativo(s)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Limpar Tudo
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca Rápida */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Busca rápida..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Data */}
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Data inicial"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Data final"
            />
          </div>

          {/* Filtro de Status */}
          <div className="relative">
            <select
              multiple
              value={statusFilter}
              onChange={(e) => setStatusFilter(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adicionar Filtro */}
          <button
            onClick={addFilter}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
          >
            <Plus className="h-4 w-4" />
            <span>Filtro Avançado</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="px-6 py-4">
          {filters.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum filtro avançado</h3>
              <p className="text-sm text-gray-500 mb-4">
                Adicione filtros personalizados para refinar sua busca
              </p>
              <button
                onClick={addFilter}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Primeiro Filtro</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filters.map((filter, index) => (
                <div key={filter.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {/* Operador Lógico */}
                  {index > 0 && (
                    <select
                      value={filter.logicalOperator || 'AND'}
                      onChange={(e) => updateFilter(filter.id, { logicalOperator: e.target.value as 'AND' | 'OR' })}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                      <option value="AND">E</option>
                      <option value="OR">OU</option>
                    </select>
                  )}

                  {/* Campo */}
                  <div className="flex-1">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um campo</option>
                      {fields.map(field => (
                        <option key={field.name} value={field.name}>
                          {field.label} ({field.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operador */}
                  <div className="flex-1">
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any, value: '' })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!filter.field}
                    >
                      {filter.field && getOperatorsForField(fields.find(f => f.name === filter.field)!).map(op => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valor */}
                  <div className="flex-1">
                    {filter.operator === 'between' ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Min"
                          value={filter.value?.[0] || ''}
                          onChange={(e) => updateFilter(filter.id, { 
                            value: [e.target.value, filter.value?.[1] || ''] 
                          })}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Max"
                          value={filter.value?.[1] || ''}
                          onChange={(e) => updateFilter(filter.id, { 
                            value: [filter.value?.[0] || '', e.target.value] 
                          })}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ) : filter.operator === 'in' ? (
                      <select
                        multiple
                        value={Array.isArray(filter.value) ? filter.value : []}
                        onChange={(e) => updateFilter(filter.id, { 
                          value: Array.from(e.target.selectedOptions, option => option.value) 
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {filter.field && getUniqueValues(filter.field).map(value => (
                          <option key={value} value={value}>
                            {String(value)}
                          </option>
                        ))}
                      </select>
                    ) : !['not_empty', 'empty'].includes(filter.operator) ? (
                      <input
                        type="text"
                        placeholder="Valor"
                        value={filter.value || ''}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
                        Sem valor necessário
                      </div>
                    )}
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addFilter}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 border-dashed"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Outro Filtro</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}