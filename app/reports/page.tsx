'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormTemplate } from '@/lib/types'
import { BarChart3, ArrowLeft, FileText, Trash2 } from 'lucide-react'
import AdvancedFilters from '@/components/AdvancedFilters'
import ViewControls, { ViewMode } from '@/components/ViewControls'
import GroupingControls from '@/components/GroupingControls'
import TanStackDataGrid from '@/components/TanStackDataGrid'
import TreeView from '@/components/TreeView'
import CardsView from '@/components/CardsView'
import ChartsView from '@/components/ChartsView'

interface FormResponse {
  id: string
  template_id: string
  response_data: any
  status: string
  created_at: string
  updated_at: string
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewMode>('table')
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
        loadResponses(templateId)
      }
    }
  }, [templateId, templates])

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Erro ao carregar templates:', error)
        return
      }

      setTemplates(data || [])
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadResponses = async (templateId: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar respostas:', error)
        return
      }

      const responseData = data || []
      setResponses(responseData)
      setFilteredResponses(responseData)
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template)
    loadResponses(template.id)
    router.push(`/reports?template=${template.id}`)
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!selectedTemplate || filteredResponses.length === 0) return

    const headers = ['ID', 'Status', 'Data de Criação', 'Última Atualização']
    const fieldKeys = selectedTemplate.fields ? selectedTemplate.fields.map((f: any) => f.name || f.id) : []
    headers.push(...fieldKeys.map(key => {
      const field = selectedTemplate.fields?.find((f: any) => (f.name || f.id) === key)
      return field?.label || key
    }))

    const csvContent = [
      headers.join(','),
      ...filteredResponses.map(response => {
        const row = [
          response.id,
          response.status,
          new Date(response.created_at).toLocaleString('pt-BR'),
          new Date(response.updated_at).toLocaleString('pt-BR')
        ]
        
        fieldKeys.forEach(key => {
          row.push(response.response_data[key] || '')
        })
        
        return row.join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${selectedTemplate.name}_${format}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFilterChange = (filtered: FormResponse[]) => {
    setFilteredResponses(filtered)
  }

  const handleItemAction = (action: 'view' | 'edit' | 'delete', item: FormResponse) => {
    switch (action) {
      case 'view':
        handleViewResponse(item.id)
        break
      case 'edit':
        handleEditResponse(item.id)
        break
      case 'delete':
        confirmDelete(item.id)
        break
    }
  }

  const handleRefresh = () => {
    if (selectedTemplate) {
      loadResponses(selectedTemplate.id)
    }
  }

  const handleEditResponse = (responseId: string) => {
    // Redirecionar para a página de preenchimento do formulário com os dados existentes
    router.push(`/fill-form?template=${selectedTemplate?.id}&response=${responseId}`)
  }

  const handleViewResponse = (responseId: string) => {
    // Redirecionar para visualização detalhada da resposta
    router.push(`/responses/${responseId}`)
  }

  const handleDeleteResponse = async (responseId: string) => {
    try {
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', responseId)

      if (error) {
        console.error('Erro ao excluir resposta:', error)
        alert('Erro ao excluir resposta. Tente novamente.')
        return
      }

      // Atualizar a lista de respostas
      const updatedResponses = responses.filter(r => r.id !== responseId)
      setResponses(updatedResponses)
      setFilteredResponses(updatedResponses)
      setShowDeleteModal(false)
      setResponseToDelete(null)
      
      alert('Resposta excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir resposta:', error)
      alert('Erro ao excluir resposta. Tente novamente.')
    }
  }

  const confirmDelete = (responseId: string) => {
    setResponseToDelete(responseId)
    setShowDeleteModal(true)
  }

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-primary-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Relatórios de Formulários
                  </h1>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  form_templates • form_responses • template_background_versions
                </div>
              </div>
              
              <button
                onClick={() => router.push('/templates')}
                className="flex items-center space-x-2 btn-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Selecione um Template
            </h2>
            <p className="text-gray-600">
              Escolha um template para visualizar seus relatórios e dados coletados
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {template.description || 'Sem descrição'}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Campos:</span> {template.fields?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Páginas:</span> {template.pdf_pages || 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Relatório: {selectedTemplate.name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {responses.length} respostas coletadas
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                form_templates • form_responses • template_background_versions
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/fill-form?template=${selectedTemplate.id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FileText className="h-5 w-5" />
                <span>Nova Coleta</span>
              </button>
              <button
                onClick={() => router.push('/reports')}
                className="flex items-center space-x-2 btn-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Trocar Template</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* View Controls */}
        <ViewControls
          currentView={currentView}
          onViewChange={setCurrentView}
          totalRecords={responses.length}
          filteredRecords={filteredResponses.length}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Advanced Filters */}
        <AdvancedFilters
          fields={selectedTemplate.fields || []}
          responses={responses}
          onFilterChange={handleFilterChange}
          onFiltersUpdate={() => {}}
        />

        {/* Grouping Controls (only for tree view) */}
        {currentView === 'tree' && (
          <GroupingControls
            fields={selectedTemplate.fields || []}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        )}

        {/* Content based on current view */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {currentView === 'table' && (
              <TanStackDataGrid
                responses={filteredResponses}
                fields={selectedTemplate.fields || []}
                onItemAction={handleItemAction}
                onBulkAction={(action, items) => {
                  if (action === 'delete') {
                    items.forEach(item => handleItemAction('delete', item))
                  } else if (action === 'export') {
                    handleExport('csv')
                  }
                }}
                onNewItem={() => router.push(`/fill-form?template=${selectedTemplate.id}`)}
              />
            )}

            {currentView === 'tree' && (
              <TreeView
                responses={filteredResponses}
                fields={selectedTemplate.fields || []}
                groupBy={groupBy}
                onItemAction={handleItemAction}
              />
            )}

            {currentView === 'cards' && (
              <CardsView
                responses={filteredResponses}
                fields={selectedTemplate.fields || []}
                onItemAction={handleItemAction}
              />
            )}

            {currentView === 'chart' && (
              <ChartsView
                responses={filteredResponses}
                fields={selectedTemplate.fields || []}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar Exclusão
                </h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setResponseToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => responseToDelete && handleDeleteResponse(responseToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}