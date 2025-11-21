'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { 
  Calendar, 
  User, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface CardsViewProps {
  responses: any[]
  fields: FormField[]
  onItemAction: (action: 'view' | 'edit' | 'delete', item: any) => void
}

export default function CardsView({ responses, fields, onItemAction }: CardsViewProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'reviewed':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatFieldValue = (field: FormField, value: any) => {
    if (value == null || value === '') return '-'

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR')
      case 'number':
        return Number(value).toLocaleString('pt-BR')
      case 'checkbox':
        return value ? 'Sim' : 'Não'
      case 'textarea':
        return String(value).length > 100 ? String(value).substring(0, 97) + '...' : String(value)
      default:
        return String(value).length > 50 ? String(value).substring(0, 47) + '...' : String(value)
    }
  }

  const getMainFields = () => {
    // Pegar os primeiros 3-4 campos mais importantes para mostrar no card
    return fields.slice(0, 4)
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
        <p className="text-sm text-gray-500">
          Não há dados que correspondam aos filtros aplicados
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Visualização em Cards</h3>
          <p className="text-sm text-gray-500">{responses.length} registro(s) encontrado(s)</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {responses.map((response) => (
          <div
            key={response.id}
            className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              selectedCard === response.id 
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedCard(selectedCard === response.id ? null : response.id)}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    #{response.id.substring(0, 8)}
                  </span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Toggle menu
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(response.status)}`}>
                  {getStatusIcon(response.status)}
                  <span className="capitalize">{response.status}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(response.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
              <div className="space-y-3">
                {getMainFields().map((field) => {
                  const value = response.response_data?.[field.name]
                  if (!value && value !== 0) return null

                  return (
                    <div key={field.name} className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.label}
                      </span>
                      <span className="text-sm text-gray-900 mt-1">
                        {formatFieldValue(field, value)}
                      </span>
                    </div>
                  )
                })}

                {/* Show more fields if card is selected */}
                {selectedCard === response.id && fields.length > 4 && (
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {fields.slice(4).map((field) => {
                      const value = response.response_data?.[field.name]
                      if (!value && value !== 0) return null

                      return (
                        <div key={field.name} className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {field.label}
                          </span>
                          <span className="text-sm text-gray-900 mt-1">
                            {formatFieldValue(field, value)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Atualizado {new Date(response.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction('view', response)
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="Visualizar"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction('edit', response)
                    }}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                    title="Editar"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction('delete', response)
                    }}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button (if needed for pagination) */}
      {responses.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Mostrando {responses.length} registro(s)
          </p>
        </div>
      )}
    </div>
  )
}