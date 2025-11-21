'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormTemplate } from '@/lib/types'
import { ContractSummary } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, BarChart3, Users, Calendar, Building2, Database } from 'lucide-react'

interface TemplateWithHierarchy extends FormTemplate {
  contract?: ContractSummary
  company_name?: string
  company_document?: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<TemplateWithHierarchy[]>([])
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterContract, setFilterContract] = useState<string>('all')
  const [responseStats, setResponseStats] = useState<{[key: string]: number}>({})

  useEffect(() => {
    loadTemplates()
    loadResponseStats()
    loadContracts()
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [filterStatus, filterContract])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      
      // Carregar templates com informações hierárquicas
      let query = supabase
        .from('template_hierarchy')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('is_active', filterStatus === 'active')
      }

      if (filterContract !== 'all') {
        query = query.eq('contract_id', filterContract)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar templates:', error)
        // Fallback para tabela original se a view não existir
        const fallbackQuery = supabase
          .from('form_templates')
          .select('*')
          .order('created_at', { ascending: false })
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        
        if (fallbackError) {
          console.error('Erro no fallback:', fallbackError)
          return
        }
        
        setTemplates(fallbackData || [])
        return
      }

      // Enriquecer com dados de contrato se disponível
      const enrichedTemplates = await Promise.all(
        (data || []).map(async (template: any) => {
          if (template.contract_id && !template.contract?.contract_number) {
            try {
              const contract = await ContractService.getContractById(template.contract_id)
              return {
                ...template,
                contract,
                company_name: contract?.company?.name,
                company_document: contract?.company?.document
              }
            } catch (error) {
              console.warn('Erro ao carregar contrato:', template.contract_id)
              return template
            }
          }
          return {
            ...template,
            company_name: template.company_name,
            company_document: template.company_document
          }
        })
      )

      setTemplates(enrichedTemplates)
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadContracts = async () => {
    try {
      const contractsData = await ContractService.getContracts({ status: 'active' })
      setContracts(contractsData)
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
    }
  }

  const loadResponseStats = async () => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('template_id')

      if (error) {
        console.error('Erro ao carregar estatísticas:', error)
        return
      }

      // Contar respostas por template
      const stats: {[key: string]: number} = {}
      data?.forEach((response: any) => {
        stats[response.template_id] = (stats[response.template_id] || 0) + 1
      })
      
      setResponseStats(stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.contract?.contract_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (template: FormTemplate) => {
    // Salvar template no localStorage para o designer
    localStorage.setItem('current_template', JSON.stringify(template))
    router.push(`/designer?template=${template.id}`)
  }

  const handleViewReports = (template: FormTemplate) => {
    router.push(`/reports?template=${template.id}`)
  }

  const handleFillForm = (template: FormTemplate) => {
    router.push(`/fill-form?template=${template.id}`)
  }

  const handleDelete = async (template: FormTemplate) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', template.id)

      if (error) {
        console.error('Erro ao excluir template:', error)
        alert('Erro ao excluir template')
        return
      }

      loadTemplates()
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      alert('Erro ao excluir template')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Templates de Formulários
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerencie seus modelos e visualize relatórios
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                form_templates • form_responses
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/reports')}
                className="flex items-center space-x-2 btn-secondary"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Relatórios</span>
              </button>
              <button
                onClick={() => router.push('/designer')}
                className="flex items-center space-x-2 btn-primary"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Template</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-semibold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {templates.filter(t => t.is_active).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Respostas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(responseStats).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {templates.filter(t => {
                    const created = new Date(t.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar templates, contratos ou empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos Status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <select
                  value={filterContract}
                  onChange={(e) => setFilterContract(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos Contratos</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.contract_number} - {contract.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template criado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro template de formulário'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/designer')}
                className="btn-primary"
              >
                Criar Primeiro Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.description || 'Sem descrição'}
                      </p>
                      
                      {/* Informações Hierárquicas */}
                      {(template.contract?.contract_number || template.company_name) && (
                        <div className="space-y-1 mb-2">
                          {template.contract?.contract_number && (
                            <div className="flex items-center text-xs text-blue-600">
                              <FileText className="h-3 w-3 mr-1" />
                              <span>Contrato: {template.contract?.contract_number}</span>
                            </div>
                          )}
                          {template.company_name && (
                            <div className="flex items-center text-xs text-purple-600">
                              <Building2 className="h-3 w-3 mr-1" />
                              <span>Empresa: {template.company_name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Campos:</span> {template.fields?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Respostas:</span> {responseStats[template.id] || 0}
                    </div>
                    <div>
                      <span className="font-medium">Páginas:</span> {template.pdf_pages || 1}
                    </div>
                    <div>
                      <span className="font-medium">Criado:</span> {
                        new Date(template.created_at).toLocaleDateString('pt-BR')
                      }
                    </div>
                  </div>

                  {/* Botão principal de edição */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar Template</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/form-responses?template=${template.id}`)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                        title="📊 Gerenciar Coletas - Ver e gerenciar todas as coletas de dados"
                      >
                        <Database className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFillForm(template)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="📝 Preencher Formulário - Usar este template para coletar dados"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewReports(template)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="📊 Ver Relatórios - Visualizar dados coletados"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                        title="🎨 Editar no Canvas - Modificar campos, posições e propriedades"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Navegação Hierárquica */}
                      {template.contract?.id && (
                        <button
                          onClick={() => router.push(`/contracts/${template.contract?.id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="📄 Ver Contrato - Navegar para detalhes do contrato"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      
                      {template.contract?.company_id && (
                        <button
                          onClick={() => router.push(`/companies/${template.contract?.company_id}`)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                          title="🏢 Ver Empresa - Navegar para detalhes da empresa"
                        >
                          <Building2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}