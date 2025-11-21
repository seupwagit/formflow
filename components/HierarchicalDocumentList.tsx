'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { FormResponse, ContractSummary, Company } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ToastProvider'

interface HierarchicalDocumentListProps {
  companyId?: string
  contractId?: string
  templateId?: string
  showHierarchy?: boolean
}

interface GroupedDocuments {
  [companyId: string]: {
    company: Company
    contracts: {
      [contractId: string]: {
        contract: ContractSummary
        templates: {
          [templateId: string]: {
            template_name: string
            responses: FormResponse[]
          }
        }
      }
    }
  }
}

export default function HierarchicalDocumentList({ 
  companyId, 
  contractId, 
  templateId,
  showHierarchy = true 
}: HierarchicalDocumentListProps) {
  const { showSuccess, showError, showWarning } = useToast()
  const [documents, setDocuments] = useState<FormResponse[]>([])
  const [groupedDocuments, setGroupedDocuments] = useState<GroupedDocuments>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set())
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list'>(showHierarchy ? 'hierarchy' : 'list')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [companyId, contractId, templateId, statusFilter, dateFilter])

  useEffect(() => {
    if (viewMode === 'hierarchy') {
      groupDocumentsByHierarchy()
    }
  }, [documents, viewMode])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      
      let query = supabase
        .from('form_responses')
        .select(`
          *,
          template:form_templates(
            id, name,
            contract:contracts(
              id, contract_number, title,
              company:companies(id, name, document, document_type)
            )
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros específicos
      if (companyId) {
        query = query.eq('company_id', companyId)
      }
      
      if (contractId) {
        query = query.eq('contract_id', contractId)
      }
      
      if (templateId) {
        query = query.eq('template_id', templateId)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            startDate = new Date(0)
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar documentos:', error)
        return
      }

      setDocuments(data || [])
      console.log('✅ Documentos carregados:', data?.length || 0)
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupDocumentsByHierarchy = () => {
    const grouped: GroupedDocuments = {}
    
    documents.forEach(doc => {
      if (!doc.company_id || !doc.contract_id || !doc.template_id) return
      
      const companyId = doc.company_id
      const contractId = doc.contract_id
      const templateId = doc.template_id
      
      // Inicializar estrutura se não existir
      if (!grouped[companyId]) {
        grouped[companyId] = {
          company: doc.template?.contract?.company || {} as Company,
          contracts: {}
        }
      }
      
      if (!grouped[companyId].contracts[contractId]) {
        grouped[companyId].contracts[contractId] = {
          contract: {
            ...doc.template?.contract,
            company_name: doc.template?.contract?.company?.name || '',
            company_document: doc.template?.contract?.company?.document || '',
            company_document_type: doc.template?.contract?.company?.document_type || 'CNPJ',
            company_status: doc.template?.contract?.company?.status || 'active',
            template_count: 0,
            response_count: 0,
            active_template_count: 0
          } as ContractSummary,
          templates: {}
        }
      }
      
      if (!grouped[companyId].contracts[contractId].templates[templateId]) {
        grouped[companyId].contracts[contractId].templates[templateId] = {
          template_name: doc.template?.name || 'Template sem nome',
          responses: []
        }
      }
      
      grouped[companyId].contracts[contractId].templates[templateId].responses.push(doc)
    })
    
    setGroupedDocuments(grouped)
  }

  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      doc.id.toLowerCase().includes(searchLower) ||
      doc.template?.name?.toLowerCase().includes(searchLower) ||
      doc.template?.contract?.contract_number?.toLowerCase().includes(searchLower) ||
      doc.template?.contract?.title?.toLowerCase().includes(searchLower) ||
      doc.template?.contract?.company?.name?.toLowerCase().includes(searchLower) ||
      doc.template?.contract?.company?.document?.includes(searchTerm)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      case 'approved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho'
      case 'submitted': return 'Enviado'
      case 'reviewed': return 'Revisado'
      case 'approved': return 'Aprovado'
      default: return status
    }
  }

  const toggleExpanded = (type: 'company' | 'contract' | 'template', id: string) => {
    const setters = {
      company: setExpandedCompanies,
      contract: setExpandedContracts,
      template: setExpandedTemplates
    }
    
    const getters = {
      company: expandedCompanies,
      contract: expandedContracts,
      template: expandedTemplates
    }
    
    const current = getters[type]
    const setter = setters[type]
    
    const newSet = new Set(current)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setter(newSet)
  }

  const handleEdit = (doc: FormResponse) => {
    console.log('✏️ Editando documento:', doc.id)
    // Redirecionar para o formulário de edição
    window.location.href = `/fill-form?template=${doc.template_id}&response=${doc.id}`
  }

  const handleDelete = async (docId: string) => {
    console.log('🗑️ Excluindo documento:', docId)
    try {
      setIsDeleting(true)
      
      const { error } = await supabase
        .from('form_responses')
        .delete()
        .eq('id', docId)

      if (error) {
        console.error('Erro ao excluir documento:', error)
        showError('Erro ao Excluir', 'Não foi possível excluir o documento. Tente novamente.')
        return
      }

      // Remover da lista local
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      setShowDeleteModal(null)
      
      showSuccess('Documento Excluído', 'O documento foi excluído com sucesso.')
      console.log('✅ Documento excluído:', docId)
      
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      showError('Erro ao Excluir', 'Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const renderDocumentCard = (doc: FormResponse, showHierarchyInfo = true) => {
    console.log('🎨 Renderizando card do documento:', doc.id)
    return (
      <div key={doc.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            <a 
              href={`/responses/${doc.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              Documento #{doc.id.slice(-8)}
            </a>
          </h4>
          
          {showHierarchyInfo && (
            <div className="space-y-1 mb-2">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-3 w-3 mr-1" />
                <span>{doc.template?.name}</span>
              </div>
              
              {doc.template?.contract && (
                <div className="flex items-center text-sm text-blue-600">
                  <FileText className="h-3 w-3 mr-1" />
                  <a 
                    href={`/contracts/${doc.template.contract.id}`}
                    className="hover:underline"
                  >
                    {doc.template.contract.contract_number}
                  </a>
                </div>
              )}
              
              {doc.template?.contract?.company && (
                <div className="flex items-center text-sm text-purple-600">
                  <Building2 className="h-3 w-3 mr-1" />
                  <a 
                    href={`/companies/${doc.template.contract.company.id}`}
                    className="hover:underline"
                  >
                    {doc.template.contract.company.name}
                  </a>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500 space-x-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            
            {doc.submitted_at && (
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Enviado: {new Date(doc.submitted_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>
        
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
          {getStatusLabel(doc.status)}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-1">
          {/* Ações Principais */}
          <a
            href={`/responses/${doc.id}`}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="Visualizar detalhes"
          >
            <Eye className="h-4 w-4" />
          </a>
          
          <button
            onClick={() => handleEdit(doc)}
            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors"
            title="Editar documento"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowDeleteModal(doc.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Excluir documento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {/* Separador */}
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          {/* Ações Secundárias */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(doc.response_data, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `documento-${doc.id.slice(-8)}.json`
              link.click()
              URL.revokeObjectURL(url)
            }}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
            title="Download dados"
          >
            <Download className="h-4 w-4" />
          </button>
          
          {/* Navegação Hierárquica */}
          {doc.template?.contract && (
            <a
              href={`/contracts/${doc.template.contract.id}`}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              title="Ver contrato"
            >
              <FileText className="h-4 w-4" />
            </a>
          )}
          
          {doc.template?.contract?.company && (
            <a
              href={`/companies/${doc.template.contract.company.id}`}
              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
              title="Ver empresa"
            >
              <Building2 className="h-4 w-4" />
            </a>
          )}
        </div>
        
        <div className="text-xs text-gray-500 font-medium">
          {Object.keys(doc.response_data || {}).length} campo(s)
        </div>
      </div>
    </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos, templates, contratos ou empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos Status</option>
              <option value="draft">Rascunho</option>
              <option value="submitted">Enviado</option>
              <option value="reviewed">Revisado</option>
              <option value="approved">Aprovado</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todas as Datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>
            
            {showHierarchy && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('hierarchy')}
                  className={`px-3 py-2 text-sm rounded ${
                    viewMode === 'hierarchy' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Hierarquia
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm rounded ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Lista
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredDocuments.length} documento(s) encontrado(s)
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'hierarchy' ? (
        /* Visualização Hierárquica */
        <div className="space-y-4">
          {Object.entries(groupedDocuments).map(([companyId, companyData]) => {
            const isCompanyExpanded = expandedCompanies.has(companyId)
            
            return (
              <div key={companyId} className="bg-white rounded-lg shadow">
                {/* Cabeçalho da Empresa */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded('company', companyId)}
                >
                  <div className="flex items-center space-x-3">
                    {isCompanyExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {companyData.company.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {ContractService.formatDocument(companyData.company.document, companyData.company.document_type)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {Object.keys(companyData.contracts).length} contrato(s)
                  </div>
                </div>
                
                {/* Contratos da Empresa */}
                {isCompanyExpanded && (
                  <div className="border-t">
                    {Object.entries(companyData.contracts).map(([contractId, contractData]) => {
                      const isContractExpanded = expandedContracts.has(contractId)
                      
                      return (
                        <div key={contractId} className="border-b last:border-b-0">
                          {/* Cabeçalho do Contrato */}
                          <div 
                            className="flex items-center justify-between p-4 pl-12 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleExpanded('contract', contractId)}
                          >
                            <div className="flex items-center space-x-3">
                              {isContractExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {contractData.contract.contract_number}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {contractData.contract.title}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              {Object.keys(contractData.templates).length} template(s)
                            </div>
                          </div>
                          
                          {/* Templates do Contrato */}
                          {isContractExpanded && (
                            <div className="bg-gray-50">
                              {Object.entries(contractData.templates).map(([templateId, templateData]) => {
                                const isTemplateExpanded = expandedTemplates.has(templateId)
                                
                                return (
                                  <div key={templateId}>
                                    {/* Cabeçalho do Template */}
                                    <div 
                                      className="flex items-center justify-between p-4 pl-20 cursor-pointer hover:bg-gray-100"
                                      onClick={() => toggleExpanded('template', templateId)}
                                    >
                                      <div className="flex items-center space-x-3">
                                        {isTemplateExpanded ? (
                                          <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-gray-900">
                                          {templateData.template_name}
                                        </span>
                                      </div>
                                      
                                      <div className="text-sm text-gray-500">
                                        {templateData.responses.length} documento(s)
                                      </div>
                                    </div>
                                    
                                    {/* Documentos do Template */}
                                    {isTemplateExpanded && (
                                      <div className="pl-24 pr-4 pb-4 space-y-2">
                                        {templateData.responses.map(response => 
                                          renderDocumentCard(response, false)
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Visualização em Lista */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => renderDocumentCard(doc, true))}
        </div>
      )}
      
      {filteredDocuments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Ainda não há documentos coletados'}
          </p>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-500">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir este documento? Todos os dados coletados serão perdidos permanentemente.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}