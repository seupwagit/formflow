'use client'

import { FormField } from '@/lib/types'
import { BarChart3, CheckCircle, AlertCircle, FileText, Hash } from 'lucide-react'

interface FieldStatisticsProps {
  fields: FormField[]
  currentPage: number
  totalPages: number
}

export default function FieldStatistics({ fields, currentPage, totalPages }: FieldStatisticsProps) {
  const currentPageFields = fields.filter(f => f.position && f.position.page === currentPage)
  const requiredFields = fields.filter(f => f.required)
  const fieldsByType = fields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const fieldsByPage = Array.from({ length: totalPages }, (_, i) => 
    fields.filter(f => f.position && f.position.page === i).length
  )

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      text: '📝',
      number: '🔢',
      date: '📅',
      select: '📋',
      checkbox: '☑️',
      textarea: '📄',
      image: '🖼️',
      signature: '✍️'
    }
    return icons[type] || '📝'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-yellow-100 text-yellow-800',
      select: 'bg-purple-100 text-purple-800',
      checkbox: 'bg-red-100 text-red-800',
      textarea: 'bg-indigo-100 text-indigo-800',
      image: 'bg-pink-100 text-pink-800',
      signature: 'bg-teal-100 text-teal-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4 w-full max-w-sm">
      {/* Resumo Geral */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Resumo Geral</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex-1 min-w-0 truncate">Total de campos:</span>
            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0">
              {fields.length}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex-1 min-w-0 truncate">Página atual:</span>
            <div className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0">
              {currentPageFields.length}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex-1 min-w-0 truncate">Obrigatórios:</span>
            <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0">
              {requiredFields.length}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex-1 min-w-0 truncate">Tipos diferentes:</span>
            <div className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0">
              {Object.keys(fieldsByType).length}
            </div>
          </div>
        </div>
      </div>

      {/* Campos por Página */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Campos por Página</h3>
        </div>
        
        <div className="space-y-3">
          {fieldsByPage.map((count, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`text-sm flex-1 min-w-0 truncate ${index === currentPage ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                Página {index + 1}
              </span>
              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0 ${
                index === currentPage 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tipos de Campo */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Hash className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Tipos de Campo</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(fieldsByType)
            .sort(([,a], [,b]) => b - a)
            .map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{getTypeIcon(type)}</span>
                <span className="text-sm text-gray-600 capitalize truncate">{type}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg font-bold text-sm min-w-[3rem] text-center ml-2 flex-shrink-0 ${getTypeColor(type)}`}>
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validação */}
      <div className="card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Validação</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">
              {requiredFields.length} campos obrigatórios definidos
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">
              {fields.filter(f => f.validation).length} campos com validação
            </span>
          </div>
          
          {fields.some(f => !f.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) && (
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600">
                Alguns nomes de campo podem ter caracteres inválidos
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}