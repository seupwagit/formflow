// Contract Management System - TypeScript Interfaces
// Interfaces para o sistema hierárquico de gestão de contratos

// ============================================================================
// CORE ENTITIES - Entidades principais da hierarquia
// ============================================================================

export interface Address {
  street: string
  number?: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  country: string
}

// Empresa (base da hierarquia)
export interface Company {
  id: string
  name: string
  document: string // CNPJ/CPF formatado
  document_type: 'CNPJ' | 'CPF'
  email?: string
  phone?: string
  address?: Address
  contact_person?: string
  status: 'active' | 'inactive' | 'suspended'
  logo_url?: string
  website?: string
  notes?: string
  created_at: string
  updated_at: string
  
  // Relacionamentos computados
  contracts?: Contract[]
  contract_count?: number
  active_contract_count?: number
  total_contract_value?: number
}

// Contrato (vinculado à empresa)
export interface Contract {
  id: string
  company_id: string // FK obrigatória
  contract_number: string // único
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
  contract_file_url?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  
  // Relacionamentos
  company?: Company
  templates?: FormTemplate[]
  template_count?: number
  response_count?: number
  
  // Campos computados
  days_until_expiry?: number
  is_expiring_soon?: boolean
}

// Template (vinculado ao contrato) - Extensão da interface existente
export interface FormTemplate {
  id: string
  contract_id: string // FK obrigatória (nova)
  name: string
  description?: string
  fields: any[]
  template_category?: string
  template_version: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relacionamentos herdados
  contract?: Contract
  company?: Company // via contract
  responses?: FormResponse[]
  response_count?: number
}

// Resposta (herda hierarquia) - Extensão da interface existente
export interface FormResponse {
  id: string
  template_id: string
  contract_id: string // herdado automaticamente
  company_id: string // herdado automaticamente
  data: Record<string, any>
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at: string
  submitted_by?: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  
  // Relacionamentos
  template?: FormTemplate
  contract?: Contract
  company?: Company
}

// ============================================================================
// FORM DATA INTERFACES - Interfaces para formulários
// ============================================================================

export interface CompanyFormData {
  name: string
  document: string
  document_type: 'CNPJ' | 'CPF'
  email?: string
  phone?: string
  contact_person?: string
  status: 'active' | 'inactive' | 'suspended'
  website?: string
  notes?: string
  address?: {
    street: string
    number?: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    postal_code: string
    country: string
  }
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
  tags?: string[]
  metadata?: Record<string, any>
}

// ============================================================================
// FILTER INTERFACES - Interfaces para filtros e busca
// ============================================================================

export interface CompanyFilters {
  status?: 'active' | 'inactive' | 'suspended' | 'all'
  document_type?: 'CNPJ' | 'CPF' | 'all'
  search?: string
  has_contracts?: boolean
  created_after?: string
  created_before?: string
  sort_by?: 'name' | 'created_at' | 'contract_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ContractFilters {
  company_id?: string
  status?: 'draft' | 'active' | 'suspended' | 'expired' | 'cancelled' | 'all'
  contract_type?: string
  search?: string
  start_date_after?: string
  start_date_before?: string
  end_date_after?: string
  end_date_before?: string
  value_min?: number
  value_max?: number
  expiring_within_days?: number
  sort_by?: 'title' | 'start_date' | 'end_date' | 'value' | 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TemplateFilters {
  company_id?: string
  contract_id?: string
  category?: string
  is_active?: boolean
  search?: string
  has_responses?: boolean
  created_after?: string
  created_before?: string
  sort_by?: 'name' | 'created_at' | 'response_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ResponseFilters {
  company_id?: string
  contract_id?: string
  template_id?: string
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'all'
  submitted_after?: string
  submitted_before?: string
  submitted_by?: string
  search?: string
  sort_by?: 'submitted_at' | 'status'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ============================================================================
// STATISTICS INTERFACES - Interfaces para estatísticas e relatórios
// ============================================================================

export interface CompanyStats {
  total_companies: number
  active_companies: number
  inactive_companies: number
  suspended_companies: number
  companies_with_cnpj: number
  companies_with_cpf: number
  total_contracts: number
  total_contract_value: number
  companies_created_this_month: number
  companies_created_this_year: number
}

export interface ContractStats {
  total_contracts: number
  active_contracts: number
  draft_contracts: number
  suspended_contracts: number
  expired_contracts: number
  cancelled_contracts: number
  total_contract_value: number
  average_contract_value: number
  contracts_expiring_30_days: number
  contracts_expiring_90_days: number
  contracts_by_type: Record<string, number>
  contracts_created_this_month: number
  contracts_created_this_year: number
}

export interface TemplateStats {
  total_templates: number
  active_templates: number
  inactive_templates: number
  templates_with_responses: number
  total_responses: number
  templates_by_category: Record<string, number>
  average_responses_per_template: number
  templates_created_this_month: number
  templates_created_this_year: number
}

export interface SystemStats {
  companies: CompanyStats
  contracts: ContractStats
  templates: TemplateStats
  hierarchy_integrity: {
    orphaned_contracts: number
    orphaned_templates: number
    orphaned_responses: number
  }
}

// ============================================================================
// NAVIGATION INTERFACES - Interfaces para navegação hierárquica
// ============================================================================

export interface BreadcrumbItem {
  label: string
  href: string
  type: 'company' | 'contract' | 'template' | 'response'
  id: string
}

export interface HierarchyContext {
  company?: Company
  contract?: Contract
  template?: FormTemplate
  response?: FormResponse
  breadcrumbs: BreadcrumbItem[]
  current_level: 'company' | 'contract' | 'template' | 'response'
}

export interface NavigationCounts {
  companies: number
  contracts: number
  templates: number
  responses: number
  filtered_contracts?: number
  filtered_templates?: number
  filtered_responses?: number
}

// ============================================================================
// VALIDATION INTERFACES - Interfaces para validação
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  suggestions?: string[]
}

export interface DocumentValidation extends ValidationResult {
  document_type: 'CNPJ' | 'CPF'
  formatted_document: string
  is_unique: boolean
}

export interface ContractValidation extends ValidationResult {
  number_is_unique: boolean
  dates_are_valid: boolean
  company_is_active: boolean
  value_is_valid: boolean
}

// ============================================================================
// API RESPONSE INTERFACES - Interfaces para respostas da API
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  filters_applied?: Record<string, any>
  sort_applied?: {
    field: string
    order: 'asc' | 'desc'
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  validation_errors?: Record<string, string[]>
}

// ============================================================================
// UTILITY TYPES - Tipos utilitários
// ============================================================================

export type EntityType = 'company' | 'contract' | 'template' | 'response'

export type StatusType = 
  | 'active' | 'inactive' | 'suspended' // Company
  | 'draft' | 'expired' | 'cancelled'   // Contract
  | 'submitted' | 'approved' | 'rejected' // Response

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  metadata?: Record<string, any>
}

export interface ContractSelectOption extends SelectOption {
  company_name: string
  contract_number: string
  status: string
  end_date?: string
}

// ============================================================================
// FORM FIELD EXTENSIONS - Extensões para campos de formulário
// ============================================================================

// Extensão da interface FormField existente para suportar hierarquia
export interface HierarchicalFormField {
  // Metadados hierárquicos
  company_id?: string
  contract_id?: string
  template_id?: string
  
  // Validações específicas da hierarquia
  requires_company_context?: boolean
  requires_contract_context?: boolean
  
  // Herança de configurações
  inherit_from_contract?: boolean
  inherit_from_company?: boolean
}