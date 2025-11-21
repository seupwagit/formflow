'use client'

import { useState, useEffect } from 'react'
import { Image, RefreshCw, Settings, Eye, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import TemplateImageManager from '@/components/TemplateImageManager'

interface TemplateStatus {
  id: string
  name: string
  imageCount: number
  images: string[]
  hasImages: boolean
  created_at: string
}

interface AvailableImage {
  name: string
  url: string
  created_at: string
}

interface MigrationStatus {
  templates: TemplateStatus[]
  availableImages: AvailableImage[]
}

export default function TemplateImagesAdminPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStatus | null>(null)
  const [showImageManager, setShowImageManager] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/migrate-images')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        console.error('Erro ao carregar status:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runMigration = async () => {
    try {
      setIsMigrating(true)
      const response = await fetch('/api/migrate-images', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        alert('✅ Migração concluída com sucesso!')
        await loadStatus() // Recarregar status
      } else {
        alert(`❌ Erro na migração: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro na migração:', error)
      alert('❌ Erro na migração')
    } finally {
      setIsMigrating(false)
    }
  }

  const handleManageImages = (template: TemplateStatus) => {
    setSelectedTemplate(template)
    setShowImageManager(true)
  }

  const handleImagesUpdated = async (images: string[]) => {
    // Recarregar status após atualização
    await loadStatus()
    setShowImageManager(false)
    setSelectedTemplate(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Imagens de Templates
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadStatus}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={runMigration}
                disabled={isMigrating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className={`h-5 w-5 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Migrando...' : 'Executar Migração'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {status?.templates.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Com Imagens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {status?.templates.filter(t => t.hasImages).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sem Imagens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {status?.templates.filter(t => !t.hasImages).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Templates */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Status dos Templates
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {status?.templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {template.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.hasImages 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.hasImages ? 'Com Imagens' : 'Sem Imagens'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.imageCount} imagem(ns)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleManageImages(template)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Gerenciar imagens"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        {template.images.length > 0 && (
                          <button
                            onClick={() => window.open(template.images[0], '_blank')}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                            title="Visualizar primeira imagem"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Imagens Disponíveis */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Imagens Disponíveis no Storage ({status?.availableImages.length || 0})
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {status?.availableImages.map((image, index) => (
                <div key={image.name} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded border border-gray-200 cursor-pointer hover:border-blue-500"
                    onClick={() => window.open(image.url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 text-xs text-gray-600 truncate" title={image.name}>
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Template Image Manager Modal */}
      {showImageManager && selectedTemplate && (
        <TemplateImageManager
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          currentImages={selectedTemplate.images}
          onImagesUpdated={handleImagesUpdated}
          onClose={() => {
            setShowImageManager(false)
            setSelectedTemplate(null)
          }}
        />
      )}
    </div>
  )
}