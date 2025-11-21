export interface Company {
  id: string
  name: string
  document: string // CNPJ/CPF
  document_type: 'CNPJ' | 'CPF'
  email?: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  contact_person?: string
  status: 'active' | 'inactive' | 'suspended'
  logo_url?: string
  website?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Contract {
  id: string
  company_id: string
  contract_number: string
  title: string
  description?: string
  contract_type: string
  status: 'draft' | 'active' | 'suspended' | 'expired' | 'cancelled'
  start_date: string
  end_date?: string
  value?: number
  currency: string
  payment_terms?: string
  renewal_type: 'manual' | 'automatic' | 'none'
  renewal_period?: number // em meses
  contract_file_url?: string
  signed_date?: string
  signed_by_company?: string
  signed_by_client?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
  
  // Dados relacionados (joins)
  company?: Company
  template_count?: number
  response_count?: number
}

export interface ContractSummary extends Contract {
  company_name: string
  company_document: string
  company_document_type: 'CNPJ' | 'CPF'
  company_status: 'active' | 'inactive' | 'suspended'
  template_count: number
  response_count: number
  active_template_count: number
}

// Formulários
export interface CompanyFormData {
  name: string
  document: string
  document_type: 'CNPJ' | 'CPF'
  email?: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  contact_person?: string
  status: 'active' | 'inactive' | 'suspended'
  logo_url?: string
  website?: string
  notes?: string
}

export interface ContractFormData {
  company_id: string
  contract_number: string
  title: string
  description?: string
  contract_type: string
  status: 'draft' | 'active' | 'suspended' | 'expired' | 'cancelled'
  start_date: string
  end_date?: string
  value?: number
  currency: string
  payment_terms?: string
  renewal_type: 'manual' | 'automatic' | 'none'
  renewal_period?: number
  contract_file_url?: string
  signed_date?: string
  signed_by_company?: string
  signed_by_client?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// Filtros e buscas
export interface CompanyFilters {
  search?: string
  status?: string
  document_type?: string
}

export interface ContractFilters {
  search?: string
  status?: string
  contract_type?: string
  company_id?: string
  start_date?: string
  end_date?: string
}

// Estatísticas
export interface CompanyStats {
  total: number
  active: number
  inactive: number
  suspended: number
  by_type: {
    CNPJ: number
    CPF: number
  }
}

export interface ContractStats {
  total: number
  active: number
  draft: number
  expired: number
  total_value: number
  by_type: Record<string, number>
  expiring_soon: number // próximos 30 dias
}

// Enhanced FormTemplate interface para incluir hierarquia
export interface FormTemplate {
  id: string
  name: string
  description?: string
  pdf_url: string
  pdf_pages: number
  fields: any[]
  table_name?: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  
  // Novas colunas da hierarquia
  contract_id?: string
  template_category?: string
  template_version: string
  is_template_active: boolean
  
  // Relacionamentos
  contract?: Contract
  company?: Company // via contract
  response_count?: number
}

// Enhanced FormResponse interface para incluir herança
export interface FormResponse {
  id: string
  template_id: string
  response_data: Record<string, any>
  status: 'draft' | 'submitted' | 'reviewed' | 'approved'
  submitted_at?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  created_by?: string
  reviewed_by?: string
  
  // Colunas herdadas automaticamente
  contract_id?: string
  company_id?: string
  
  // Relacionamentos
  template?: FormTemplate
  contract?: Contract
  company?: Company
}

// Tipos para seleção hierárquica
export interface ContractOption {
  id: string
  contract_number: string
  title: string
  company_name: string
  company_document: string
  status: string
}

export interface HierarchyBreadcrumb {
  type: 'company' | 'contract' | 'template' | 'response'
  id: string
  label: string
  href: string
}

// Tipos para navegação
export interface NavigationCounts {
  companies: number
  contracts: number
  templates: number
  responses: number
}

// Tipos para validação
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Constantes para tipos de contrato
export const CONTRACT_TYPES = [
  'service',
  'product', 
  'maintenance',
  'consulting',
  'license',
  'partnership',
  'other'
] as const

export type ContractType = typeof CONTRACT_TYPES[number]

// Constantes para status
export const COMPANY_STATUSES = ['active', 'inactive', 'suspended'] as const
export const CONTRACT_STATUSES = ['draft', 'active', 'suspended', 'expired', 'cancelled'] as const
export const RENEWAL_TYPES = ['manual', 'automatic', 'none'] as const

export type CompanyStatus = typeof COMPANY_STATUSES[number]
export type ContractStatus = typeof CONTRACT_STATUSES[number]
export type RenewalType = typeof RENEWAL_TYPES[number]