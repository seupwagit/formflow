'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FileText, 
  ArrowLeft, 
  Edit, 
  Plus,
  Building2, 
  Calendar, 
  DollarSign, 
  Tag,
  Eye,
  AlertTriangle,
  Clock,
  User,
  Globe,
  FileCheck
} from 'lucide-react'
import { Contract, FormTemplate } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import ContractForm from '@/components/ContractForm'
import HierarchyBreadcrumb from '@/components/HierarchyBreadcrumb'

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    if (contractId) {
      loadContractData()
    }
  }, [contractId])

  const loadContractData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar dados do contrato
      const contractData = await ContractService.getContractById(contractId)
      if (!contractData) {
        router.push('/contracts')
        return
      }
      setContract(contractData)
      
      // Carregar templates do contrato (simulado - implementar quando tiver o serviço)
      // const templatesData = await TemplateService.getTemplatesByContract(contractId)
      // setTemplates(templatesData)
      
    } catch (error) {
      console.error('Erro ao carregar dados do contrato:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = (updatedContract: Contract) => {
    setContract(updatedContract)
    setShowEditForm(false)
  }

  const isExpiringSoon = (endDate: string) => {
    if (!endDate) return false
    const end = new Date(endDate)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return end <= thirtyDaysFromNow && end >= now
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contrato não encontrado</h3>
          <button
            onClick={() => router.push('/contracts')}
            className="text-blue-600 hover:underline"
          >
            Voltar para contratos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {contract && (
        <div className="mb-4">
          <HierarchyBreadcrumb
            items={[
              ...(contract.company ? [{
                label: contract.company.name,
                href: `/companies/${contract.company.id}`,
                icon: <Building2 className="h-4 w-4" />
              }] : []),
              {
                label: contract.contract_number,
                href: `/contracts/${contract.id}`,
                icon: <FileText className="h-4 w-4" />
              }
            ]}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/contracts')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.contract_number}</h1>
            <p className="text-gray-600">{contract.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm rounded-full ${
            ContractService.getStatusColor(contract.status, 'contract')
          }`}>
            {ContractService.getStatusLabel(contract.status, 'contract')}
          </span>
          
          {contract.end_date && isExpiringSoon(contract.end_date) && (
            <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Vencendo em breve
            </div>
          )}
          
          <button
            onClick={() => setShowEditForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Contrato */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Informações do Contrato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Número</label>
                <p className="text-gray-900">{contract.contract_number}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Tipo</label>
                <p className="text-gray-900">
                  {contract.contract_type === 'service' && 'Serviços'}
                  {contract.contract_type === 'product' && 'Produto'}
                  {contract.contract_type === 'maintenance' && 'Manutenção'}
                  {contract.contract_type === 'consulting' && 'Consultoria'}
                  {contract.contract_type === 'license' && 'Licença'}
                  {contract.contract_type === 'partnership' && 'Parceria'}
                  {contract.contract_type === 'other' && 'Outro'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  ContractService.getStatusColor(contract.status, 'contract')
                }`}>
                  {ContractService.getStatusLabel(contract.status, 'contract')}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Renovação</label>
                <p className="text-gray-900">
                  {contract.renewal_type === 'manual' && 'Manual'}
                  {contract.renewal_type === 'automatic' && `Automática (${contract.renewal_period} meses)`}
                  {contract.renewal_type === 'none' && 'Não renovável'}
                </p>
              </div>
            </div>
            
            {contract.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Descrição</label>
                <p className="text-gray-900 whitespace-pre-wrap">{contract.description}</p>
              </div>
            )}
          </div>

          {/* Empresa */}
          {contract.company && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Empresa Contratante
              </h2>
              
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{contract.company.name}</h3>
                    <p className="text-sm text-gray-600">
                      {ContractService.formatDocument(contract.company.document, contract.company.document_type)}
                    </p>
                  </div>
                  
                  {contract.company.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{contract.company.email}</span>
                    </div>
                  )}
                  
                  {contract.company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <a 
                        href={contract.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {contract.company.website}
                      </a>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => router.push(`/companies/${contract.company?.id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          )}

          {/* Vigência e Valores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Vigência e Valores
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Data de Início</label>
                <p className="text-gray-900">
                  {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {contract.end_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Fim</label>
                  <p className={`${
                    isExpiringSoon(contract.end_date) ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                    {isExpiringSoon(contract.end_date) && (
                      <AlertTriangle className="inline h-4 w-4 ml-2" />
                    )}
                  </p>
                </div>
              )}
              
              {contract.value && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Valor</label>
                  <p className="text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {ContractService.formatCurrency(contract.value, contract.currency)}
                  </p>
                </div>
              )}
              
              {contract.signed_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Assinatura</label>
                  <p className="text-gray-900">
                    {new Date(contract.signed_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
            
            {contract.payment_terms && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500">Termos de Pagamento</label>
                <p className="text-gray-900 whitespace-pre-wrap">{contract.payment_terms}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {contract.tags && contract.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {contract.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Templates e Ações */}
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
              <button
                onClick={() => router.push(`/templates/designer?contract=${contractId}`)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" />
                <span>Novo</span>
              </button>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum template cadastrado</p>
                <button
                  onClick={() => router.push(`/templates/designer?contract=${contractId}`)}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Criar primeiro template
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {template.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span>{template.response_count || 0} documento(s)</span>
                        <button
                          onClick={() => router.push(`/templates/${template.id}`)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Ver detalhes"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {templates.length > 3 && (
                  <button
                    onClick={() => router.push(`/templates?contract=${contractId}`)}
                    className="w-full text-center text-sm text-blue-600 hover:underline py-2"
                  >
                    Ver todos os templates ({templates.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Criado em:</span>
                <span className="text-gray-900">
                  {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Atualizado em:</span>
                <span className="text-gray-900">
                  {new Date(contract.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Templates:</span>
                <span className="text-gray-900">{templates.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Documentos coletados:</span>
                <span className="text-gray-900">
                  {templates.reduce((sum, t) => sum + (t.response_count || 0), 0)}
                </span>
              </div>
              
              {contract.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dias restantes:</span>
                  <span className={`${
                    isExpiringSoon(contract.end_date) ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/templates/designer?contract=${contractId}`)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Criar Template</span>
              </button>
              
              <button
                onClick={() => router.push(`/companies/${contract.company?.id}`)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Building2 className="h-4 w-4" />
                <span>Ver Empresa</span>
              </button>
              
              <button
                onClick={() => router.push(`/contracts?company=${contract.company?.id}`)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                <span>Outros Contratos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditForm && (
        <ContractForm
          contract={contract}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}