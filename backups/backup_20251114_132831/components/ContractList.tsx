'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import { ContractSummary, ContractFilters, ContractStats, Company } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import ContractForm from './ContractForm'

interface ContractListProps {
  companyId?: string // Para filtrar por empresa específica
}

export default function ContractList({ companyId }: ContractListProps) {
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [filters, setFilters] = useState<ContractFilters>(
    companyId ? { company_id: companyId } : {}
  )
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadContracts()
    loadStats()
    if (!companyId) {
      loadCompanies()
    }
  }, [filters, companyId])

  const loadContracts = async () => {
    try {
      setIsLoading(true)
      const data = await ContractService.getContracts(filters)
      setContracts(data)
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await ContractService.getContractStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      const data = await ContractService.getCompanies({ status: 'active' })
      setCompanies(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const handleSave = (contract: any) => {
    setShowForm(false)
    setSelectedContract(null)
    loadContracts()
    loadStats()
  }

  const handleEdit = (contract: ContractSummary) => {
    setSelectedContract(contract)
    setShowForm(true)
  }

  const handleDelete = async (contract: ContractSummary) => {
    if (!confirm(`Tem certeza que deseja excluir o contrato "${contract.contract_number}"?`)) {
      return
    }

    try {
      await ContractService.deleteContract(contract.id)
      loadContracts()
      loadStats()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir contrato')
    }
  }

  const isExpiringSoon = (endDate: string) => {
    if (!endDate) return false
    const end = new Date(endDate)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return end <= thirtyDaysFromNow && end >= now
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {companyId ? 'Contratos da Empresa' : 'Contratos'}
          </h1>
          <p className="text-gray-600">
            {companyId 
              ? 'Gerencie os contratos desta empresa'
              : 'Gerencie todos os contratos do sistema'
            }
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedContract(null)
            setShowForm(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* Estatísticas */}
      {stats && !companyId && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
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
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencendo</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.expiring_soon}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {ContractService.formatCurrency(stats.total_value)}
                </p>
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
                  placeholder="Buscar contratos..."
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
              {contracts.length} contrato(s) encontrado(s)
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              {!companyId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <select
                    value={filters.company_id || ''}
                    onChange={(e) => setFilters({ ...filters, company_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Todas</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="expired">Expirado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.contract_type || ''}
                  onChange={(e) => setFilters({ ...filters, contract_type: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="service">Serviços</option>
                  <option value="product">Produto</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="consulting">Consultoria</option>
                  <option value="license">Licença</option>
                  <option value="partnership">Parceria</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters(companyId ? { company_id: companyId } : {})}
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
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
              <p className="text-gray-500 mb-4">
                {companyId 
                  ? 'Esta empresa ainda não possui contratos cadastrados'
                  : 'Comece criando seu primeiro contrato'
                }
              </p>
              <button
                onClick={() => {
                  setSelectedContract(null)
                  setShowForm(true)
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Contrato</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrato
                    </th>
                    {!companyId && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vigência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Templates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.contract_number}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {contract.title}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {!companyId && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.company_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ContractService.formatDocument(contract.company_document, contract.company_document_type)}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contract.contract_type === 'service' && 'Serviços'}
                        {contract.contract_type === 'product' && 'Produto'}
                        {contract.contract_type === 'maintenance' && 'Manutenção'}
                        {contract.contract_type === 'consulting' && 'Consultoria'}
                        {contract.contract_type === 'license' && 'Licença'}
                        {contract.contract_type === 'partnership' && 'Parceria'}
                        {contract.contract_type === 'other' && 'Outro'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div>{new Date(contract.start_date).toLocaleDateString('pt-BR')}</div>
                            {contract.end_date && (
                              <div className={`text-xs ${
                                isExpiringSoon(contract.end_date) ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                até {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                                {isExpiringSoon(contract.end_date) && (
                                  <AlertTriangle className="inline h-3 w-3 ml-1" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contract.value ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            {ContractService.formatCurrency(contract.value, contract.currency)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{contract.template_count} template(s)</span>
                          <span className="text-gray-400">•</span>
                          <span>{contract.response_count} documento(s)</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ContractService.getStatusColor(contract.status, 'contract')
                        }`}>
                          {ContractService.getStatusLabel(contract.status, 'contract')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => window.open(`/contracts/${contract.id}`, '_blank')}
                            className="text-gray-400 hover:text-blue-600"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEdit(contract)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(contract)}
                            className="text-gray-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal do Formulário */}
      {showForm && (
        <ContractForm
          contract={selectedContract}
          preselectedCompanyId={companyId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setSelectedContract(null)
          }}
        />
      )}
    </div>
  )
}