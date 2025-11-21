'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Globe,
  MoreHorizontal,
  Users,
  TrendingUp,
  FileText,
  MapPin
} from 'lucide-react'
import { Company, CompanyFilters, CompanyStats, CompanyFormData } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import CompanyForm from './CompanyForm'

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [filters, setFilters] = useState<CompanyFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCompanies()
    loadStats()
  }, [filters])

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      const data = await ContractService.getCompanies(filters)
      setCompanies(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await ContractService.getCompanyStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSave = async (formData: CompanyFormData) => {
    try {
      if (selectedCompany) {
        // Editar empresa existente
        await ContractService.updateCompany(selectedCompany.id, formData)
      } else {
        // Criar nova empresa
        await ContractService.createCompany(formData)
      }
      
      setShowForm(false)
      setSelectedCompany(null)
      loadCompanies()
      loadStats()
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
    }
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setShowForm(true)
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return
    }

    try {
      await ContractService.deleteCompany(company.id)
      loadCompanies()
      loadStats()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir empresa')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600">Gerencie o cadastro de empresas e clientes</p>
        </div>
        <button
          onClick={() => {
            setSelectedCompany(null)
            setShowForm(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CNPJ</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_type.CNPJ}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPF</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_type.CPF}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar empresas..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md ${
                  showFilters ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {companies.length} empresa(s) encontrada(s)
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={filters.document_type || ''}
                  onChange={(e) => setFilters({ ...filters, document_type: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500 mb-4">Comece criando sua primeira empresa</p>
              <button
                onClick={() => {
                  setSelectedCompany(null)
                  setShowForm(true)
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Empresa</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {companies.map((company) => (
                <div key={company.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                          {ContractService.formatDocument(company.document, company.document_type)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ContractService.getStatusColor(company.status, 'company')
                      }`}>
                        {ContractService.getStatusLabel(company.status, 'company')}
                      </span>
                      
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="space-y-2 mb-4">
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    
                    {company.contact_person && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="truncate">{company.contact_person}</span>
                      </div>
                    )}
                    
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Endereço (se disponível) */}
                  {company.address && (company.address.city || company.address.state) && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {[company.address.city, company.address.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Criado em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(company)}
                        className="p-1 text-gray-400 hover:text-red-600"
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

      {/* Modal do Formulário */}
      {showForm && (
        <CompanyForm
          company={selectedCompany}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setSelectedCompany(null)
          }}
        />
      )}
    </div>
  )
}