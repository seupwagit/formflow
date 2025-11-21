'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Save, X, Building2, Calendar, DollarSign, Tag, Upload } from 'lucide-react'
import { Contract, ContractFormData, Company, CONTRACT_TYPES } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'

interface ContractFormProps {
  contract?: Contract | null
  preselectedCompanyId?: string
  onSave: (contract: Contract) => void
  onCancel: () => void
}

export default function ContractForm({ contract, preselectedCompanyId, onSave, onCancel }: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    company_id: preselectedCompanyId || '',
    contract_number: '',
    title: '',
    description: '',
    contract_type: 'service',
    status: 'draft',
    start_date: '',
    end_date: '',
    value: 0,
    currency: 'BRL',
    payment_terms: '',
    renewal_type: 'manual',
    renewal_period: undefined,
    contract_file_url: '',
    signed_date: '',
    signed_by_company: '',
    signed_by_client: '',
    tags: [],
    metadata: {}
  })
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadCompanies()
    generateContractNumber()
  }, [])

  useEffect(() => {
    if (contract) {
      setFormData({
        company_id: contract.company_id,
        contract_number: contract.contract_number,
        title: contract.title,
        description: contract.description || '',
        contract_type: contract.contract_type,
        status: contract.status,
        start_date: contract.start_date,
        end_date: contract.end_date || '',
        value: contract.value || 0,
        currency: contract.currency,
        payment_terms: contract.payment_terms || '',
        renewal_type: contract.renewal_type,
        renewal_period: contract.renewal_period,
        contract_file_url: contract.contract_file_url || '',
        signed_date: contract.signed_date || '',
        signed_by_company: contract.signed_by_company || '',
        signed_by_client: contract.signed_by_client || '',
        tags: contract.tags || [],
        metadata: contract.metadata || {}
      })
    }
  }, [contract])

  const loadCompanies = async () => {
    try {
      const data = await ContractService.getCompanies({ status: 'active' })
      setCompanies(data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const generateContractNumber = async () => {
    if (!contract) { // Só gerar para novos contratos
      try {
        const number = await ContractService.generateContractNumber()
        setFormData(prev => ({ ...prev, contract_number: number }))
      } catch (error) {
        console.error('Erro ao gerar número do contrato:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulário
    const validation = ContractService.validateContractForm(formData)
    if (!validation.isValid) {
      const errorMap = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message
        return acc
      }, {} as Record<string, string>)
      setErrors(errorMap)
      return
    }

    setIsLoading(true)
    setErrors({})
    
    try {
      let savedContract: Contract
      
      if (contract) {
        savedContract = await ContractService.updateContract(contract.id, formData)
      } else {
        savedContract = await ContractService.createContract(formData)
      }
      
      onSave(savedContract)
    } catch (error) {
      console.error('Erro ao salvar contrato:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Erro ao salvar contrato' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  const selectedCompany = companies.find(c => c.id === formData.company_id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {contract ? 'Editar Contrato' : 'Novo Contrato'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erro geral */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações Básicas
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa *
              </label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!!preselectedCompanyId}
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {ContractService.formatDocument(company.document, company.document_type)}
                  </option>
                ))}
              </select>
              {errors.company_id && <p className="text-red-600 text-sm mt-1">{errors.company_id}</p>}
              
              {selectedCompany && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium">{selectedCompany.name}</span>
                  </div>
                  <p className="text-gray-600 ml-6">
                    {ContractService.formatDocument(selectedCompany.document, selectedCompany.document_type)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Contrato *
              </label>
              <input
                type="text"
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contract_number ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="CONT-0001"
              />
              {errors.contract_number && <p className="text-red-600 text-sm mt-1">{errors.contract_number}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Contrato *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Contrato de Prestação de Serviços"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contrato *
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contract_type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'service' && 'Serviços'}
                    {type === 'product' && 'Produto'}
                    {type === 'maintenance' && 'Manutenção'}
                    {type === 'consulting' && 'Consultoria'}
                    {type === 'license' && 'Licença'}
                    {type === 'partnership' && 'Parceria'}
                    {type === 'other' && 'Outro'}
                  </option>
                ))}
              </select>
              {errors.contract_type && <p className="text-red-600 text-sm mt-1">{errors.contract_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="expired">Expirado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o objeto do contrato..."
            />
          </div>

          {/* Datas e Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Vigência e Valores
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Contrato
              </label>
              <div className="flex">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className={`flex-1 px-3 py-2 border-t border-r border-b rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Renovação
              </label>
              <select
                value={formData.renewal_type}
                onChange={(e) => setFormData({ ...formData, renewal_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
                <option value="none">Não renovável</option>
              </select>
            </div>

            {formData.renewal_type === 'automatic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de Renovação (meses)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.renewal_period || ''}
                  onChange={(e) => setFormData({ ...formData, renewal_period: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
            )}
          </div>

          {/* Termos de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Termos de Pagamento
            </label>
            <textarea
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Pagamento em 30 dias após emissão da nota fiscal..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite uma tag e pressione Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}