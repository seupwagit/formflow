'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  Plus,
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  User,
  FileText,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react'
import { Company, ContractSummary, CompanyFormData } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import CompanyForm from '@/components/CompanyForm'
import HierarchyBreadcrumb from '@/components/HierarchyBreadcrumb'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    if (companyId) {
      loadCompanyData()
    }
  }, [companyId])

  const loadCompanyData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar dados da empresa
      const companyData = await ContractService.getCompanyById(companyId)
      if (!companyData) {
        router.push('/companies')
        return
      }
      setCompany(companyData)
      
      // Carregar contratos da empresa
      const contractsData = await ContractService.getContractsByCompany(companyId)
      setContracts(contractsData)
      
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (formData: CompanyFormData) => {
    try {
      // Atualizar a empresa usando o service
      const updatedCompany = await ContractService.updateCompany(companyId, formData)
      setCompany(updatedCompany)
      setShowEditForm(false)
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      // Aqui você pode adicionar um toast de erro se tiver
    }
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

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Empresa não encontrada</h3>
          <button
            onClick={() => router.push('/companies')}
            className="text-blue-600 hover:underline"
          >
            Voltar para empresas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      {company && (
        <div className="mb-4">
          <HierarchyBreadcrumb
            items={[
              {
                label: company.name,
                href: `/companies/${company.id}`,
                icon: <Building2 className="h-4 w-4" />
              }
            ]}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/companies')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">
              {ContractService.formatDocument(company.document, company.document_type)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm rounded-full ${
            ContractService.getStatusColor(company.status, 'company')
          }`}>
            {ContractService.getStatusLabel(company.status, 'company')}
          </span>
          
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
        {/* Informações da Empresa */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nome</label>
                <p className="text-gray-900">{company.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Documento</label>
                <p className="text-gray-900">
                  {ContractService.formatDocument(company.document, company.document_type)} ({company.document_type})
                </p>
              </div>
              
              {company.contact_person && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Pessoa de Contato</label>
                  <p className="text-gray-900">{company.contact_person}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  ContractService.getStatusColor(company.status, 'company')
                }`}>
                  {ContractService.getStatusLabel(company.status, 'company')}
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Contato
            </h2>
            
            <div className="space-y-3">
              {company.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              
              {company.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                    {company.phone}
                  </a>
                </div>
              )}
              
              {company.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-gray-400 mr-3" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {company.address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço
              </h2>
              
              <div className="text-gray-900">
                {company.address.street && (
                  <p>{company.address.street}, {company.address.number}</p>
                )}
                {company.address.complement && (
                  <p>{company.address.complement}</p>
                )}
                {(company.address.city || company.address.state) && (
                  <p>
                    {[company.address.city, company.address.state, company.address.zip_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {company.address.country && (
                  <p>{company.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          {company.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Observações
              </h2>
              <p className="text-gray-900 whitespace-pre-wrap">{company.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Contratos */}
        <div className="space-y-6">
          {/* Resumo de Contratos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contratos</h2>
              <button
                onClick={() => router.push(`/contracts/new?company=${companyId}`)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" />
                <span>Novo</span>
              </button>
            </div>
            
            {contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum contrato cadastrado</p>
                <button
                  onClick={() => router.push(`/contracts/new?company=${companyId}`)}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Criar primeiro contrato
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {contract.contract_number}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ContractService.getStatusColor(contract.status, 'contract')
                      }`}>
                        {ContractService.getStatusLabel(contract.status, 'contract')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{contract.title}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(contract.start_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      {contract.value && (
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span>{ContractService.formatCurrency(contract.value)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        {contract.template_count} template(s) • {contract.response_count} documento(s)
                      </div>
                      
                      <button
                        onClick={() => router.push(`/contracts/${contract.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Ver detalhes"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {contracts.length > 3 && (
                  <button
                    onClick={() => router.push(`/contracts?company=${companyId}`)}
                    className="w-full text-center text-sm text-blue-600 hover:underline py-2"
                  >
                    Ver todos os contratos ({contracts.length})
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
                  {new Date(company.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Atualizado em:</span>
                <span className="text-gray-900">
                  {new Date(company.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Total de contratos:</span>
                <span className="text-gray-900">{contracts.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Contratos ativos:</span>
                <span className="text-gray-900">
                  {contracts.filter(c => c.status === 'active').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditForm && (
        <CompanyForm
          company={company}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}