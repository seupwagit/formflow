'use client'

import { useState, useEffect } from 'react'
import { Company, CompanyFormData } from '@/lib/types/contracts'
import { DocumentValidation } from '@/lib/types/contract-system'
import { Building2, User, Mail, Phone, MapPin, Globe, FileText, Save, X, AlertTriangle, CheckCircle } from 'lucide-react'

interface CompanyFormProps {
  company?: Company | null
  onSave: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function CompanyForm({ company, onSave, onCancel, isLoading = false }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    document: '',
    document_type: 'CNPJ',
    email: '',
    phone: '',
    contact_person: '',
    status: 'active',
    website: '',
    notes: '',
    address: {
      street: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Brasil'
    }
  })

  const [validation, setValidation] = useState<{
    document: DocumentValidation | null
    email: boolean
    general: string[]
  }>({
    document: null,
    email: true,
    general: []
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Preencher formulário se editando empresa existente
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        document: company.document,
        document_type: company.document_type,
        email: company.email || '',
        phone: company.phone || '',
        contact_person: company.contact_person || '',
        status: company.status,
        website: company.website || '',
        notes: company.notes || '',
        address: company.address || {
          street: '',
          number: '',
          complement: '',

          city: '',
          state: '',
          zip_code: '',
          country: 'Brasil'
        }
      })
      setShowAdvanced(true) // Mostrar campos avançados se editando
    }
  }, [company])

  // Validação de CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
    if (cleanCNPJ.length !== 14) return false

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false

    // Validar dígitos verificadores
    let sum = 0
    let weight = 2
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

    sum = 0
    weight = 2
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

    return digit1 === parseInt(cleanCNPJ[12]) && digit2 === parseInt(cleanCNPJ[13])
  }

  // Validação de CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    if (cleanCPF.length !== 11) return false

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    // Validar primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i)
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

    // Validar segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i)
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)

    return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10])
  }

  // Formatação de documento
  const formatDocument = (value: string, type: 'CNPJ' | 'CPF'): string => {
    const numbers = value.replace(/[^\d]/g, '')
    
    if (type === 'CNPJ') {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1-$2')
    }
  }

  // Validação de email
  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validação de documento
  const validateDocument = (document: string, type: 'CNPJ' | 'CPF'): DocumentValidation => {
    const cleanDoc = document.replace(/[^\d]/g, '')
    const isValid = type === 'CNPJ' ? validateCNPJ(document) : validateCPF(document)
    
    const result: DocumentValidation = {
      isValid,
      errors: [],
      document_type: type,
      formatted_document: formatDocument(document, type),
      is_unique: true // TODO: Implementar verificação de unicidade via API
    }

    if (!cleanDoc) {
      result.errors.push('Documento é obrigatório')
    } else if (cleanDoc.length !== (type === 'CNPJ' ? 14 : 11)) {
      result.errors.push(`${type} deve ter ${type === 'CNPJ' ? '14' : '11'} dígitos`)
    } else if (!isValid) {
      result.errors.push(`${type} inválido`)
    }

    return result
  }

  // Atualizar campo do formulário
  const updateField = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Validações em tempo real
    if (field === 'document' || field === 'document_type') {
      const docValidation = validateDocument(
        field === 'document' ? value : formData.document,
        field === 'document_type' ? value : formData.document_type
      )
      setValidation(prev => ({ ...prev, document: docValidation }))
    }

    if (field === 'email') {
      setValidation(prev => ({ ...prev, email: validateEmail(value) }))
    }
  }

  // Atualizar endereço
  const updateAddress = (field: keyof NonNullable<CompanyFormData['address']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }))
  }

  // Validar formulário completo
  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push('Nome da empresa é obrigatório')
    if (!formData.document.trim()) errors.push('Documento é obrigatório')
    
    const docValidation = validateDocument(formData.document, formData.document_type)
    if (!docValidation.isValid) {
      errors.push(...docValidation.errors)
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.push('Email inválido')
    }

    setValidation(prev => ({ ...prev, general: errors }))
    return errors.length === 0
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {company ? 'Editar Empresa' : 'Nova Empresa'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Erros gerais */}
          {validation.general.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Corrija os seguintes erros:</h4>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validation.general.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Empresa */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="input-field"
                  placeholder="Razão social ou nome fantasia"
                  required
                />
              </div>

              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="CNPJ"
                      checked={formData.document_type === 'CNPJ'}
                      onChange={(e) => updateField('document_type', e.target.value as 'CNPJ')}
                      className="mr-2"
                    />
                    <Building2 className="h-4 w-4 mr-1" />
                    CNPJ (Pessoa Jurídica)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="CPF"
                      checked={formData.document_type === 'CPF'}
                      onChange={(e) => updateField('document_type', e.target.value as 'CPF')}
                      className="mr-2"
                    />
                    <User className="h-4 w-4 mr-1" />
                    CPF (Pessoa Física)
                  </label>
                </div>
              </div>

              {/* Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.document_type} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value, formData.document_type)
                      updateField('document', formatted)
                    }}
                    className={`input-field pr-10 ${
                      validation.document && !validation.document.isValid 
                        ? 'border-red-300 focus:border-red-500' 
                        : validation.document?.isValid 
                        ? 'border-green-300 focus:border-green-500'
                        : ''
                    }`}
                    placeholder={formData.document_type === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    required
                  />
                  {validation.document && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {validation.document.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {validation.document && validation.document.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {validation.document.errors[0]}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="input-field"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>
            </div>

            {/* Contato */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Informações de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`input-field pl-10 ${
                        !validation.email ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  {!validation.email && (
                    <p className="mt-1 text-sm text-red-600">Email inválido</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="input-field pl-10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pessoa de Contato
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => updateField('contact_person', e.target.value)}
                      className="input-field pl-10"
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="input-field pl-10"
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Campos Avançados */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Ocultar' : 'Mostrar'} Endereço e Observações
              </button>

              {showAdvanced && (
                <div className="space-y-6">
                  {/* Endereço */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logradouro
                        </label>
                        <input
                          type="text"
                          value={formData.address?.street || ''}
                          onChange={(e) => updateAddress('street', e.target.value)}
                          className="input-field"
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número
                        </label>
                        <input
                          type="text"
                          value={formData.address?.number || ''}
                          onChange={(e) => updateAddress('number', e.target.value)}
                          className="input-field"
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={formData.address?.complement || ''}
                          onChange={(e) => updateAddress('complement', e.target.value)}
                          className="input-field"
                          placeholder="Sala, Andar, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={''}
                          onChange={() => {}}
                          className="input-field"
                          placeholder="Centro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={formData.address?.city || ''}
                          onChange={(e) => updateAddress('city', e.target.value)}
                          className="input-field"
                          placeholder="São Paulo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={formData.address?.state || ''}
                          onChange={(e) => updateAddress('state', e.target.value)}
                          className="input-field"
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={formData.address?.zip_code || ''}
                          onChange={(e) => updateAddress('zip_code', e.target.value)}
                          className="input-field"
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        className="input-field pl-10 min-h-[100px]"
                        placeholder="Informações adicionais sobre a empresa..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Salvando...' : 'Salvar Empresa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}