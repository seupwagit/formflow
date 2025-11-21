import { supabase } from '@/lib/supabase'

// Temporary fix for Supabase type issues
const db = supabase as any
import { 
  Company, 
  Contract, 
  ContractSummary,
  CompanyFormData, 
  ContractFormData,
  CompanyFilters,
  ContractFilters,
  CompanyStats,
  ContractStats,
  ValidationResult,
  ValidationError
} from '@/lib/types/contracts'

export class ContractService {
  // ==================== EMPRESAS ====================
  
  static async getCompanies(filters?: CompanyFilters): Promise<Company[]> {
    let query = db
      .from('companies')
      .select('*')
      .order('name')
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,document.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.document_type) {
      query = query.eq('document_type', filters.document_type)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar empresas:', error)
      throw new Error(`Erro ao buscar empresas: ${error.message}`)
    }
    
    return data || []
  }
  
  static async getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await db
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Erro ao buscar empresa:', error)
      return null
    }
    
    return data
  }
  
  static async createCompany(companyData: CompanyFormData): Promise<Company> {
    // Validar documento
    await this.validateCompanyDocument(companyData.document)
    
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await (supabase as any)
      .from('companies')
      .insert({
        ...companyData,
        created_by: user.user?.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar empresa:', error)
      throw new Error(`Erro ao criar empresa: ${error.message}`)
    }
    
    console.log('✅ Empresa criada:', (data as any)?.name)
    return data as Company
  }
  
  static async updateCompany(id: string, companyData: Partial<CompanyFormData>): Promise<Company> {
    // Se está alterando documento, validar
    if (companyData.document) {
      await this.validateCompanyDocument(companyData.document, id)
    }
    
    const { data, error } = await (supabase as any)
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar empresa:', error)
      throw new Error(`Erro ao atualizar empresa: ${error.message}`)
    }
    
    console.log('✅ Empresa atualizada:', (data as any)?.name)
    return data as Company
  }
  
  static async deleteCompany(id: string): Promise<void> {
    // Verificar se tem contratos ativos
    const { data: contracts } = await supabase
      .from('contracts')
      .select('id')
      .eq('company_id', id)
      .eq('status', 'active')
    
    if (contracts && contracts.length > 0) {
      throw new Error('Não é possível excluir empresa com contratos ativos')
    }
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir empresa:', error)
      throw new Error(`Erro ao excluir empresa: ${error.message}`)
    }
    
    console.log('✅ Empresa excluída')
  }
  
  static async getCompanyStats(): Promise<CompanyStats> {
    const { data, error } = await (supabase as any)
      .from('companies')
      .select('status, document_type')
    
    if (error) {
      console.error('Erro ao buscar estatísticas de empresas:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }
    
    const companies = data as any[]
    const stats: CompanyStats = {
      total: companies.length,
      active: companies.filter(c => c.status === 'active').length,
      inactive: companies.filter(c => c.status === 'inactive').length,
      suspended: companies.filter(c => c.status === 'suspended').length,
      by_type: {
        CNPJ: companies.filter(c => c.document_type === 'CNPJ').length,
        CPF: companies.filter(c => c.document_type === 'CPF').length
      }
    }
    
    return stats
  }
  
  // ==================== CONTRATOS ====================
  
  static async getContracts(filters?: ContractFilters): Promise<ContractSummary[]> {
    let query = supabase
      .from('contract_summary')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,contract_number.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.contract_type) {
      query = query.eq('contract_type', filters.contract_type)
    }
    
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id)
    }
    
    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date)
    }
    
    if (filters?.end_date) {
      query = query.lte('end_date', filters.end_date)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar contratos:', error)
      throw new Error(`Erro ao buscar contratos: ${error.message}`)
    }
    
    return data || []
  }
  
  static async getContractById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Erro ao buscar contrato:', error)
      return null
    }
    
    return data
  }
  
  static async createContract(contractData: ContractFormData): Promise<Contract> {
    // Validar número do contrato
    await this.validateContractNumber(contractData.contract_number)
    
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await (supabase as any)
      .from('contracts')
      .insert({
        ...contractData,
        created_by: user.user?.id
      })
      .select(`
        *,
        company:companies(*)
      `)
      .single()
    
    if (error) {
      console.error('Erro ao criar contrato:', error)
      throw new Error(`Erro ao criar contrato: ${error.message}`)
    }
    
    console.log('✅ Contrato criado:', data.contract_number)
    return data
  }
  
  static async updateContract(id: string, contractData: Partial<ContractFormData>): Promise<Contract> {
    // Se está alterando número, validar
    if (contractData.contract_number) {
      await this.validateContractNumber(contractData.contract_number, id)
    }
    
    const { data, error } = await db
      .from('contracts')
      .update(contractData)
      .eq('id', id)
      .select(`
        *,
        company:companies(*)
      `)
      .single()
    
    if (error) {
      console.error('Erro ao atualizar contrato:', error)
      throw new Error(`Erro ao atualizar contrato: ${error.message}`)
    }
    
    console.log('✅ Contrato atualizado:', data.contract_number)
    return data
  }
  
  static async deleteContract(id: string): Promise<void> {
    // Verificar se tem templates vinculados
    const { data: templates } = await supabase
      .from('form_templates')
      .select('id')
      .eq('contract_id', id)
    
    if (templates && templates.length > 0) {
      throw new Error('Não é possível excluir contrato com templates vinculados')
    }
    
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir contrato:', error)
      throw new Error(`Erro ao excluir contrato: ${error.message}`)
    }
    
    console.log('✅ Contrato excluído')
  }
  
  static async getContractStats(): Promise<ContractStats> {
    const { data, error } = await db
      .from('contracts')
      .select('status, contract_type, value, end_date')
    
    if (error) {
      console.error('Erro ao buscar estatísticas de contratos:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }
    
    const contracts = data as any[]
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const stats: ContractStats = {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      draft: contracts.filter(c => c.status === 'draft').length,
      expired: contracts.filter(c => c.status === 'expired').length,
      total_value: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
      by_type: contracts.reduce((acc, c) => {
        acc[c.contract_type] = (acc[c.contract_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      expiring_soon: contracts.filter(c => 
        c.end_date && 
        new Date(c.end_date) <= thirtyDaysFromNow && 
        new Date(c.end_date) >= now
      ).length
    }
    
    return stats
  }
  
  // ==================== VALIDAÇÕES ====================
  
  private static async validateCompanyDocument(document: string, excludeId?: string): Promise<void> {
    let query = supabase
      .from('companies')
      .select('id')
      .eq('document', document)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data } = await query
    
    if (data && data.length > 0) {
      throw new Error('Documento já cadastrado para outra empresa')
    }
  }
  
  private static async validateContractNumber(contractNumber: string, excludeId?: string): Promise<void> {
    let query = supabase
      .from('contracts')
      .select('id')
      .eq('contract_number', contractNumber)
    
    if (excludeId) {
      query = query.neq('id', excludeId)
    }
    
    const { data } = await query
    
    if (data && data.length > 0) {
      throw new Error('Número de contrato já existe')
    }
  }
  
  // ==================== VALIDAÇÕES DE FORMULÁRIO ====================
  
  static validateCompanyForm(data: CompanyFormData): ValidationResult {
    const errors: ValidationError[] = []
    
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Nome da empresa é obrigatório' })
    }
    
    if (!data.document?.trim()) {
      errors.push({ field: 'document', message: 'Documento é obrigatório' })
    } else {
      const cleanDoc = data.document.replace(/\D/g, '')
      if (data.document_type === 'CNPJ' && cleanDoc.length !== 14) {
        errors.push({ field: 'document', message: 'CNPJ deve ter 14 dígitos' })
      } else if (data.document_type === 'CPF' && cleanDoc.length !== 11) {
        errors.push({ field: 'document', message: 'CPF deve ter 11 dígitos' })
      }
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'E-mail inválido' })
    }
    
    if (data.website && !/^https?:\/\/.+/.test(data.website)) {
      errors.push({ field: 'website', message: 'Website deve começar com http:// ou https://' })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  static validateContractForm(data: ContractFormData): ValidationResult {
    const errors: ValidationError[] = []
    
    if (!data.company_id?.trim()) {
      errors.push({ field: 'company_id', message: 'Empresa é obrigatória' })
    }
    
    if (!data.contract_number?.trim()) {
      errors.push({ field: 'contract_number', message: 'Número do contrato é obrigatório' })
    }
    
    if (!data.title?.trim()) {
      errors.push({ field: 'title', message: 'Título do contrato é obrigatório' })
    }
    
    if (!data.contract_type?.trim()) {
      errors.push({ field: 'contract_type', message: 'Tipo do contrato é obrigatório' })
    }
    
    if (!data.start_date) {
      errors.push({ field: 'start_date', message: 'Data de início é obrigatória' })
    }
    
    if (data.start_date && data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
      errors.push({ field: 'end_date', message: 'Data de fim deve ser posterior à data de início' })
    }
    
    if (data.value && data.value < 0) {
      errors.push({ field: 'value', message: 'Valor deve ser positivo' })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // ==================== UTILITÁRIOS ====================
  
  static async getActiveContracts(): Promise<ContractSummary[]> {
    return this.getContracts({ status: 'active' })
  }
  
  static async getContractsByCompany(companyId: string): Promise<ContractSummary[]> {
    return this.getContracts({ company_id: companyId })
  }
  
  static async generateContractNumber(): Promise<string> {
    const { data } = await db
      .from('contracts')
      .select('contract_number')
      .order('created_at', { ascending: false })
      .limit(1)
    
    let nextNumber = 1
    
    if (data && data.length > 0) {
      const contracts = data as any[]
      const lastNumber = contracts[0].contract_number
      const match = lastNumber.match(/CONT-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    return `CONT-${nextNumber.toString().padStart(4, '0')}`
  }
  
  static formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value)
  }
  
  static formatDocument(document: string, type: 'CNPJ' | 'CPF'): string {
    const cleanDoc = document.replace(/\D/g, '')
    
    if (type === 'CNPJ') {
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    } else {
      return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
  }
  
  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return phone
  }
  
  static getStatusLabel(status: string, type: 'company' | 'contract'): string {
    const labels = {
      company: {
        active: 'Ativo',
        inactive: 'Inativo',
        suspended: 'Suspenso'
      },
      contract: {
        draft: 'Rascunho',
        active: 'Ativo',
        suspended: 'Suspenso',
        expired: 'Expirado',
        cancelled: 'Cancelado'
      }
    }
    
    return labels[type][status as keyof typeof labels[typeof type]] || status
  }
  
  static getStatusColor(status: string, type: 'company' | 'contract'): string {
    const colors = {
      company: {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-red-100 text-red-800'
      },
      contract: {
        draft: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        suspended: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800'
      }
    }
    
    return colors[type][status as keyof typeof colors[typeof type]] || 'bg-gray-100 text-gray-800'
  }
  
  // ==================== HIERARQUIA E NAVEGAÇÃO ====================
  
  static async getHierarchyPath(type: 'company' | 'contract' | 'template' | 'response', id: string) {
    const path = []
    
    switch (type) {
      case 'response':
        const response = await db
          .from('form_responses')
          .select(`
            id,
            template:form_templates(
              id, name,
              contract:contracts(
                id, contract_number, title,
                company:companies(id, name)
              )
            )
          `)
          .eq('id', id)
          .single()
        
        const responseData = response.data as any
        if (responseData?.template?.contract?.company) {
          path.push({
            type: 'company',
            id: responseData.template.contract.company.id,
            label: responseData.template.contract.company.name,
            href: `/companies/${responseData.template.contract.company.id}`
          })
          path.push({
            type: 'contract',
            id: responseData.template.contract.id,
            label: responseData.template.contract.contract_number,
            href: `/contracts/${responseData.template.contract.id}`
          })
          path.push({
            type: 'template',
            id: response.data.template.id,
            label: response.data.template.name,
            href: `/templates/${response.data.template.id}`
          })
        }
        break
        
      case 'template':
        const template = await db
          .from('form_templates')
          .select(`
            id, name,
            contract:contracts(
              id, contract_number, title,
              company:companies(id, name)
            )
          `)
          .eq('id', id)
          .single()
        
        const templateData = template.data as any
        if (templateData?.contract?.company) {
          path.push({
            type: 'company',
            id: templateData.contract.company.id,
            label: templateData.contract.company.name,
            href: `/companies/${templateData.contract.company.id}`
          })
          path.push({
            type: 'contract',
            id: templateData.contract.id,
            label: templateData.contract.contract_number,
            href: `/contracts/${templateData.contract.id}`
          })
        }
        break
        
      case 'contract':
        const contract = await db
          .from('contracts')
          .select(`
            id, contract_number, title,
            company:companies(id, name)
          `)
          .eq('id', id)
          .single()
        
        const contractData = contract.data as any
        if (contractData?.company) {
          path.push({
            type: 'company',
            id: contractData.company.id,
            label: contractData.company.name,
            href: `/companies/${contractData.company.id}`
          })
        }
        break
    }
    
    return path
  }
}