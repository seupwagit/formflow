'use client'

import { useState, useEffect } from 'react'
import { Contract, Company, FormTemplate, BreadcrumbItem } from '@/lib/types'
import { 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Tag, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  Eye,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface ContractDetailProps {
  contract: Contract
  company: Company
  templates: FormTemplate[]
  onEdit: () => void
  onDelete: () => void
  onCreateTemplate: () => void
  breadcrumbs: BreadcrumbItem[]
}

export default function ContractDetail({ 
  contract, 
  company, 
  templates, 
  onEdit, 
  onDelete, 
  onCreateTemplate,
  breadcrumbs 
}: ContractDetailProps) {
  const [filteredTemplates, setFilteredTemplates] = useState<FormTemplate[]>(templates)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filtrar templates
  useEffect(() => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(template =>
        statusFilter === 'active' ? template.is_active : !template.is_active
      )
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, statusFilter])

  // Calcular status do contrato
  const getContractStatus = () => {
    const now = new Date()
    const endDate = contract.end_date ? new Date(contract.end_date) : null
    
    if (contract.status === 'expired' || (endDate && endDate < now)) {
      return { status: 'expired', label: 'Expirado', color: 'red' }
    }
    
    if (contract.status === 'cancelled') {
      return { status: 'cancelled', label: 'Cancelado', color: 'gray' }
    }
    
    if (contract.status === 'suspended') {
      return { status: 'suspended', label: 'Suspenso', color: 'yellow' }
    }
    
    if (contract.status === 'draft') {
      return { status: 'draft', label: 'Rascunho', color: 'blue' }
    }
    
    // Verificar se está próximo do vencimento
    if (endDate) {
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry <= 30) {
        return { status: 'expiring', label: `Expira em ${daysUntilExpiry} dias`, color: 'orange' }
      }
    }
    
    return { status: 'active', label: 'Ativo', color: 'green' }
  }

  const contractStatus = getContractStatus()

  // Formatação de valores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: contract.currency || 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        {breadcrumbs.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link 
              href={item.href}
              className="hover:text-gray-700 flex items-center space-x-1"
            >
              {item.type === 'company' && <Building2 className="h-4 w-4" />}
              {item.type === 'contract' && <FileText className="h-4 w-4" />}
              <span>{item.label}</span>
            </Link>
          </div>
        ))}
      </nav>

      {/* Header do Contrato */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                contractStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                contractStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                contractStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                contractStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                contractStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {contractStatus.label}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{contract.description}</p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Contrato {contract.contract_number}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <Link 
                  href={`/companies/${company.id}`}
                  className="hover:text-blue-600"
                >
                  {company.name}
                </Link>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>{contract.contract_type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={onDelete}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Datas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Vigência
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Início</label>
              <p className="text-gray-900">{formatDate(contract.start_date)}</p>
            </div>
            {contract.end_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                <p className="text-gray-900">{formatDate(contract.end_date)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Renovação</label>
              <p className="text-gray-900 capitalize">{contract.renewal_type}</p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financeiro
          </h3>
          <div className="space-y-3">
            {contract.value && (
              <div>
                <label className="text-sm font-medium text-gray-500">Valor Total</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(contract.value)}</p>
              </div>
            )}
            {contract.payment_terms && (
              <div>
                <label className="text-sm font-medium text-gray-500">Condições de Pagamento</label>
                <p className="text-gray-900">{contract.payment_terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Estatísticas
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Templates</label>
              <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Templates Ativos</label>
              <p className="text-lg font-semibold text-green-600">
                {templates.filter(t => t.is_active).length}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Documentos Coletados</label>
              <p className="text-lg font-semibold text-purple-600">
                {contract.response_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates do Contrato */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Templates de Formulários
            </h3>
            <button
              onClick={onCreateTemplate}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Template</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="input-field"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {templates.length === 0 ? 'Nenhum template criado' : 'Nenhum template encontrado'}
              </h4>
              <p className="text-gray-500 mb-4">
                {templates.length === 0 
                  ? 'Crie o primeiro template de formulário para este contrato.'
                  : 'Tente ajustar os filtros para encontrar o template desejado.'
                }
              </p>
              {templates.length === 0 && (
                <button
                  onClick={onCreateTemplate}
                  className="btn-primary"
                >
                  Criar Primeiro Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h4>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {template.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{template.fields.length} campos</span>
                    <span>0 respostas</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/templates/${template.id}`}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </Link>
                    <Link
                      href={`/designer?template=${template.id}`}
                      className="btn-primary flex-1 flex items-center justify-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags e Metadados */}
      {(contract.tags?.length || contract.metadata) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Adicionais
          </h3>
          
          {contract.tags && contract.tags.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {contract.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {contract.metadata && Object.keys(contract.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Metadados</label>
              <div className="bg-gray-50 rounded p-3">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(contract.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}