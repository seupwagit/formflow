'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Building2, 
  Search, 
  Check, 
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react'
import { ContractSummary, ContractOption } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'

interface ContractSelectorProps {
  selectedContractId?: string
  onSelect: (contract: ContractSummary) => void
  onClear?: () => void
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function ContractSelector({ 
  selectedContractId, 
  onSelect, 
  onClear,
  disabled = false,
  required = true,
  className = ''
}: ContractSelectorProps) {
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [filteredContracts, setFilteredContracts] = useState<ContractSummary[]>([])
  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContracts()
  }, [])

  useEffect(() => {
    if (selectedContractId && contracts.length > 0) {
      const contract = contracts.find(c => c.id === selectedContractId)
      if (contract) {
        setSelectedContract(contract)
      }
    }
  }, [selectedContractId, contracts])

  useEffect(() => {
    filterContracts()
  }, [contracts, searchTerm])

  const loadContracts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Carregar apenas contratos ativos
      const data = await ContractService.getContracts({ status: 'active' })
      setContracts(data)
      
      if (data.length === 0) {
        setError('Nenhum contrato ativo encontrado. É necessário ter pelo menos um contrato ativo para criar templates.')
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
      setError('Erro ao carregar contratos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterContracts = () => {
    if (!searchTerm.trim()) {
      setFilteredContracts(contracts)
      return
    }

    const filtered = contracts.filter(contract => 
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.company_document.includes(searchTerm)
    )
    
    setFilteredContracts(filtered)
  }

  const handleSelect = (contract: ContractSummary) => {
    setSelectedContract(contract)
    setIsOpen(false)
    setSearchTerm('')
    onSelect(contract)
  }

  const handleClear = () => {
    setSelectedContract(null)
    if (onClear) {
      onClear()
    }
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
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contrato {required && '*'}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
            <span className="text-gray-500">Carregando contratos...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contrato {required && '*'}
        </label>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
        <button
          onClick={loadContracts}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contrato {required && '*'}
      </label>
      
      {/* Campo de Seleção */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-white hover:bg-gray-50 cursor-pointer'
          } ${
            selectedContract ? 'border-gray-300' : 'border-gray-300'
          }`}
        >
          {selectedContract ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedContract.contract_number}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {selectedContract.company_name} • {selectedContract.title}
                  </div>
                </div>
              </div>
              
              {!disabled && !required && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <FileText className="h-4 w-4 mr-2" />
              <span>Selecione um contrato ativo</span>
            </div>
          )}
        </button>
        
        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Campo de Busca */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número, título ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Lista de Contratos */}
            <div className="max-h-64 overflow-y-auto">
              {filteredContracts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato ativo disponível'}
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <button
                    key={contract.id}
                    onClick={() => handleSelect(contract)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {contract.contract_number}
                            </span>
                            {contract.end_date && isExpiringSoon(contract.end_date) && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Vencendo
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 truncate">
                            {contract.title}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <div className="flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              <span className="truncate">{contract.company_name}</span>
                            </div>
                            
                            {contract.end_date && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>até {new Date(contract.end_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                            
                            {contract.value && (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                <span>{ContractService.formatCurrency(contract.value)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {selectedContract?.id === contract.id && (
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {/* Footer com informações */}
            <div className="p-3 bg-gray-50 border-t text-xs text-gray-500">
              {filteredContracts.length} contrato(s) ativo(s) disponível(is)
            </div>
          </div>
        )}
      </div>
      
      {/* Informações do Contrato Selecionado */}
      {selectedContract && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-900">
                  {selectedContract.company_name}
                </div>
                <div className="text-sm text-blue-700">
                  {ContractService.formatDocument(selectedContract.company_document, selectedContract.company_document_type)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Vigência: {new Date(selectedContract.start_date).toLocaleDateString('pt-BR')}
                  {selectedContract.end_date && ` até ${new Date(selectedContract.end_date).toLocaleDateString('pt-BR')}`}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-blue-600">
                {selectedContract.template_count} template(s)
              </div>
              <div className="text-xs text-blue-600">
                {selectedContract.response_count} documento(s)
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensagem de Validação */}
      {required && !selectedContract && (
        <p className="mt-1 text-sm text-red-600">
          É obrigatório selecionar um contrato para criar templates
        </p>
      )}
    </div>
  )
}