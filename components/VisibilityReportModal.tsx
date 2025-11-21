'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'
import { FormField } from '@/lib/types'
import { analyzeFieldVisibility, FieldVisibility } from '@/lib/field-organizer'

interface VisibilityReportModalProps {
  isOpen: boolean
  onClose: () => void
  fields: FormField[]
  onReorganize: () => void
}

export default function VisibilityReportModal({ 
  isOpen, 
  onClose, 
  fields, 
  onReorganize 
}: VisibilityReportModalProps) {
  const [analysis, setAnalysis] = useState<FieldVisibility[]>([])

  if (!isOpen) return null

  // Analisar campos quando o modal abrir
  const fieldAnalysis = analyzeFieldVisibility(fields)
  const visible = fieldAnalysis.filter(a => a.isVisible)
  const hidden = fieldAnalysis.filter(a => !a.isVisible)
  const overlapping = fieldAnalysis.filter(a => a.isOverlapping)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Relatório de Visibilidade dos Campos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{fields.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Visíveis</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{visible.length}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <EyeOff className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Ocultos</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{hidden.length}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Sobrepostos</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{overlapping.length}</p>
            </div>
          </div>

          {/* Lista de Campos Ocultos */}
          {hidden.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <EyeOff className="h-5 w-5 text-red-600" />
                <span>Campos Ocultos ({hidden.length})</span>
              </h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  ⚠️ Estes campos não estão visíveis no canvas e podem precisar ser reposicionados.
                </p>
              </div>
              
              <div className="space-y-2">
                {hidden.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{item.field.label}</p>
                        <p className="text-sm text-gray-600">
                          Posição: ({item.field.position.x}, {item.field.position.y}) - 
                          Tamanho: {item.field.position.width}x{item.field.position.height}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-700">{item.reason}</p>
                      <p className="text-xs text-gray-500">Página {item.field.position.page + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Campos Visíveis */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span>Campos Visíveis ({visible.length})</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {visible.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.field.label}</p>
                    <p className="text-xs text-gray-600">
                      ({item.field.position.x}, {item.field.position.y})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {hidden.length > 0 ? (
              <span>💡 Use "Reorganizar" para mover campos ocultos para posições visíveis</span>
            ) : (
              <span>✅ Todos os campos estão visíveis no canvas</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
            
            {hidden.length > 0 && (
              <button
                onClick={() => {
                  onReorganize()
                  onClose()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reorganizar Campos Ocultos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}