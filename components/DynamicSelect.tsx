/**
 * Componente para campos de seleção dinâmica
 */

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DynamicSelectProps {
  fieldConfig: {
    dynamicConfig?: {
      sourceTable: string
      valueField: string
      displayField: string
      filterCondition?: string
      orderBy?: string
    }
  }
  value: any
  onChange: (value: any) => void
  required?: boolean
}

export default function DynamicSelect({ 
  fieldConfig, 
  value, 
  onChange, 
  required = false 
}: DynamicSelectProps) {
  const [options, setOptions] = useState<Array<{value: any, label: string}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOptions()
  }, [fieldConfig])

  const loadOptions = async () => {
    if (!fieldConfig.dynamicConfig) {
      setError('Configuração dinâmica não encontrada')
      setIsLoading(false)
      return
    }

    const { sourceTable, valueField, displayField, filterCondition, orderBy } = fieldConfig.dynamicConfig

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from(sourceTable)
        .select(`${valueField}, ${displayField}`)

      if (filterCondition) {
        // Aplicar filtro se especificado
        // Nota: Esta é uma implementação básica, pode precisar ser expandida
        query = query.filter(filterCondition.split(' ')[0], filterCondition.split(' ')[1], filterCondition.split(' ')[2])
      }

      if (orderBy) {
        query = query.order(orderBy)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const formattedOptions = data?.map(item => ({
        value: item[valueField],
        label: item[displayField]
      })) || []

      setOptions(formattedOptions)

    } catch (err) {
      console.error('Erro ao carregar opções dinâmicas:', err)
      setError('Erro ao carregar opções')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <span className="text-gray-500">Carregando opções...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50">
        <span className="text-red-600">{error}</span>
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
    >
      <option value="">Selecione uma opção</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}