'use client'

import { useState, useEffect } from 'react'
import { TemplateBackgroundManager, TemplateBackgroundVersion } from '@/lib/template-background-manager'
import { Calendar, Image, Eye, Download, CheckCircle } from 'lucide-react'

interface BackgroundVersionHistoryProps {
  templateId: string
  onClose: () => void
}

export default function BackgroundVersionHistory({ templateId, onClose }: BackgroundVersionHistoryProps) {
  const [versions, setVersions] = useState<TemplateBackgroundVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVersionHistory()
  }, [templateId])

  const loadVersionHistory = async () => {
    try {
      setIsLoading(true)
      const history = await TemplateBackgroundManager.getBackgroundVersionHistory(templateId)
      setVersions(history)
    } catch (error) {
      console.error('Erro ao carregar histórico de versões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const previewImage = (imagePath: string) => {
    // Abrir imagem em nova aba para visualização
    if (imagePath.startsWith('data:image/') || imagePath.startsWith('http')) {
      window.open(imagePath, '_blank')
    } else {
      alert('Visualização não disponível para este tipo de imagem')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Versões - Imagens de Fundo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma versão encontrada
              </h3>
              <p className="text-gray-600">
                Este template ainda não possui histórico de versões de imagem de fundo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 ${
                    version.is_current 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Versão {version.version_number}
                        </h3>
                        {version.is_current && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Atual
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(version.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Image className="h-4 w-4" />
                          <span>{version.image_paths.length} imagem(ns)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Imagens:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {version.image_paths.map((imagePath, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                            >
                              <span className="text-xs text-gray-600 truncate flex-1">
                                Página {index + 1}
                              </span>
                              <button
                                onClick={() => previewImage(imagePath)}
                                className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Visualizar imagem"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {version.pdf_path && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">PDF Original:</span>
                        <button
                          onClick={() => window.open(version.pdf_path!, '_blank')}
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4" />
                          <span>Baixar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}