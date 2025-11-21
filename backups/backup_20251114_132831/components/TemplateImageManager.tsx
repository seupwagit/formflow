'use client'

import { useState, useEffect } from 'react'
import { StorageImageManager, StorageImage } from '@/lib/storage-image-manager'
import { TemplateBackgroundManager } from '@/lib/template-background-manager'
import { Image, Upload, Check, X, Eye, RefreshCw } from 'lucide-react'

interface TemplateImageManagerProps {
  templateId: string
  templateName: string
  currentImages?: string[]
  onImagesUpdated: (images: string[]) => void
  onClose: () => void
}

export default function TemplateImageManager({
  templateId,
  templateName,
  currentImages = [],
  onImagesUpdated,
  onClose
}: TemplateImageManagerProps) {
  const [availableImages, setAvailableImages] = useState<StorageImage[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>(currentImages)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadAvailableImages()
  }, [])

  const loadAvailableImages = async () => {
    try {
      setIsLoading(true)
      const images = await StorageImageManager.listProcessedImages()
      setAvailableImages(images)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl)
      } else {
        return [...prev, imageUrl].sort()
      }
    })
  }

  const handleAutoDetect = async () => {
    try {
      setIsLoading(true)
      const detectedImages = await StorageImageManager.findImagesForTemplate(templateId, templateName)
      setSelectedImages(detectedImages)
    } catch (error) {
      console.error('Erro na detecção automática:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Atualizar template com as imagens selecionadas
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase as any)
        .from('form_templates')
        .update({
          image_paths: selectedImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) {
        console.error('Erro ao atualizar template:', error)
        alert('Erro ao salvar imagens')
        return
      }

      // Criar nova versão no sistema de versionamento
      if (selectedImages.length > 0) {
        await TemplateBackgroundManager.createNewBackgroundVersion(
          templateId,
          selectedImages
        )
      }

      onImagesUpdated(selectedImages)
      alert('✅ Imagens atualizadas com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar imagens')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredImages = availableImages.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.name.toLowerCase().includes(templateName.toLowerCase())
  )

  const previewImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gerenciar Imagens de Fundo
              </h2>
              <p className="text-sm text-gray-600">
                Template: {templateName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Controles */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAutoDetect}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Auto-detectar</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              {selectedImages.length} imagem(ns) selecionada(s)
            </div>
          </div>

          {/* Lista de Imagens */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma imagem encontrada
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente ajustar o termo de busca' : 'Faça upload de imagens para o storage'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredImages.map((image) => {
                  const isSelected = selectedImages.includes(image.publicUrl)
                  
                  return (
                    <div
                      key={image.name}
                      className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleImageToggle(image.publicUrl)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                        
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {image.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Criado em: {new Date(image.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => previewImage(image.publicUrl)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Visualizar imagem"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Imagens Selecionadas Preview */}
          {selectedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Imagens Selecionadas (Ordem das Páginas):
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {selectedImages.map((imageUrl, index) => (
                  <div key={imageUrl} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Página ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200"
                    />
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => handleImageToggle(imageUrl)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || selectedImages.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>
              {isSaving ? 'Salvando...' : `Salvar ${selectedImages.length} Imagem(ns)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}