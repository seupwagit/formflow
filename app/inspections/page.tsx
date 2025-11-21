'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResponseService } from '@/lib/services/response-service'
import { supabase } from '@/lib/supabase'
import { FormTemplate } from '@/lib/types'
import { History, Eye, Edit, FileText, Filter } from 'lucide-react'

// ✅ MIGRADO: Página atualizada para usar form_responses ao invés de form_instances
// Data: 14/11/2024 - Consolidação de tabelas legado
// Backup: backups/backup_20241114_xxxxxx/

interface FormResponse {
  id: string
  template_id: string
  response_data: any
  status: string
  created_at: string
  updated_at: string
  created_by?: string
}

export default function InspectionsPage() {
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar respostas usando form_responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Carregar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('is_active', true)
      
      if (responsesError) throw responsesError
      if (templatesError) throw templatesError
      
      setResponses(responsesData || [])
      setTemplates(templatesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResponses = responses.filter(response => {
    if (selectedTemplate && response.template_id !== selectedTemplate) return false
    if (selectedStatus && response.status !== selectedStatus) return false
    return true
  })

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    return template?.name || 'Template não encontrado'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Enviada'
      case 'approved': return 'Aprovada'
      case 'reviewed': return 'Revisada'
      default: return 'Rascunho'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Voltar
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Histórico de Inspeções
                </h1>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                form_responses • form_templates
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os modelos</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos os status</option>
                  <option value="draft">Rascunho</option>
                  <option value="submitted">Enviada</option>
                  <option value="reviewed">Revisada</option>
                  <option value="approved">Aprovada</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedTemplate('')
                    setSelectedStatus('')
                  }}
                  className="btn-secondary"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma resposta encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {responses.length === 0 
                ? 'Ainda não há respostas realizadas'
                : 'Nenhuma resposta corresponde aos filtros selecionados'
              }
            </p>
            <button
              onClick={() => router.push('/templates')}
              className="btn-primary"
            >
              Ver Modelos Disponíveis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResponses.map(response => (
              <div key={response.id} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getTemplateName(response.template_id)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(response.status)}`}>
                        {getStatusLabel(response.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Criada em:</span>
                        <br />
                        {new Date(response.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Atualizada em:</span>
                        <br />
                        {new Date(response.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Campos preenchidos:</span>
                        <br />
                        {Object.keys(response.response_data || {}).length}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span>
                        <br />
                        <code className="text-xs">{response.id.slice(0, 8)}...</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/responses/${response.id}`)}
                      className="flex items-center space-x-1 btn-secondary"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Visualizar</span>
                    </button>
                    
                    {response.status === 'draft' && (
                      <button
                        onClick={() => router.push(`/fill-form?template=${response.template_id}&response=${response.id}`)}
                        className="flex items-center space-x-1 btn-primary"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Continuar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredInstances.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredInstances.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredInstances.filter(i => i.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Rascunhos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredInstances.filter(i => i.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredInstances.filter(i => i.status === 'reviewed').length}
                </div>
                <div className="text-sm text-gray-600">Revisadas</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}