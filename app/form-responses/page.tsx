'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormTemplate, FormField } from '@/lib/types'
import { Plus, Edit, Trash2, FileText, ArrowLeft, Calendar } from 'lucide-react'
import UnifiedFormView from '@/components/UnifiedFormView'

interface FormResponse {
  id: string
  template_id: string
  response_data: any
  status: string
  created_at: string
  updated_at: string
  submitted_at: string | null
}

export default function FormResponsesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('template')
  
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (templateId) {
      loadTemplateAndResponses()
    }
  }, [templateId])

  const loadTemplateAndResponses = async () => {
    if (!templateId) return
    
    setIsLoading(true)
    try {
      // Carregar template
      const { data: templateData, error: templateError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError
      setTemplate(templateData)

      // Carregar imagens do template
      if ((templateData as any).image_paths && Array.isArray((templateData as any).image_paths)) {
        const imageUrls = await Promise.all(
          (templateData as any).image_paths.map(async (path: string) => {
            try {
              if (path.startsWith('http')) return path
              const { data: urlData } = supabase.storage
                .from('processed-images')
                .getPublicUrl(path)
              return urlData.publicUrl
            } catch (error) {
              console.warn('⚠️ Erro ao carregar imagem:', path, error)
              return null
            }
          })
        )
        setPdfImages(imageUrls.filter(url => url !== null) as string[])
      }

      // Carregar respostas
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })

      if (responsesError) throw responsesError
      setResponses(responsesData || [])
      
      if (responsesData && responsesData.length > 0) {
        setSelectedResponse(responsesData[0])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewResponse = () => {
    router.push(`/fill-form?template=${templateId}`)
  }

  const handleEditResponse = (responseId: string) => {
    router.push(`/fill-form?template=${templateId}&response=${responseId}`)
  }

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleta de dados?')) return

    try {
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', responseId)

      if (error) throw error

      // Atualizar lista
      setResponses(prev => prev.filter(r => r.id !== responseId))
      if (selectedResponse?.id === responseId) {
        setSelectedResponse(responses[0] || null)
      }
      
      alert('Coleta de dados excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir coleta de dados')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      draft: 'Rascunho',
      submitted: 'Enviado',
      archived: 'Arquivado'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Template não encontrado</h2>
          <button onClick={() => router.push('/templates')} className="btn-primary mt-4">
            Voltar aos Templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/templates')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-600">
                  {responses.length} {responses.length === 1 ? 'coleta' : 'coletas'} de dados
                </p>
              </div>
            </div>
            <button
              onClick={handleNewResponse}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Coleta</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Lista de Respostas - Sidebar */}
          <div className="col-span-4 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Coletas de Dados</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
              {responses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma coleta de dados ainda</p>
                  <p className="text-sm mt-1">Clique em "Nova Coleta" para começar</p>
                </div>
              ) : (
                responses.map((response) => (
                  <div
                    key={response.id}
                    onClick={() => setSelectedResponse(response)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedResponse?.id === response.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusBadge(response.status)}
                          <span className="text-xs text-gray-500">
                            #{response.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(response.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditResponse(response.id)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteResponse(response.id)
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visualização de Dados */}
          <div className="col-span-8">
            {selectedResponse ? (
              /* 🎯 COMPONENTE UNIFICADO - Substitui ~140 linhas de código duplicado */
              <UnifiedFormView
                fields={template.fields && Array.isArray(template.fields) ? template.fields : []}
                formData={selectedResponse.response_data}
                pdfImages={pdfImages}
                mode="view"
                showLabels={true}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma coleta de dados para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
