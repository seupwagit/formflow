# Design Document

## Overview

O sistema implementará uma arquitetura hierárquica rígida onde cada nível depende obrigatoriamente do anterior: **Empresa → Contrato → Template → Documento Coletado**. A solução utilizará React/Next.js no frontend, Supabase como backend, e implementará validações rigorosas de integridade referencial.

## Architecture

### Database Schema

```sql
-- Hierarquia principal
companies (base da hierarquia)
├── contracts (vinculados à empresa)
    ├── form_templates (vinculados ao contrato)
        └── form_responses (herdam empresa + contrato)

-- Relacionamentos obrigatórios
- contracts.company_id → companies.id (NOT NULL, CASCADE)
- form_templates.contract_id → contracts.id (NOT NULL, CASCADE)  
- form_responses.template_id → form_templates.id (NOT NULL)
- form_responses.contract_id → contracts.id (herdado via trigger)
- form_responses.company_id → companies.id (herdado via trigger)
```

### Frontend Architecture

```
app/
├── companies/
│   ├── page.tsx (lista + CRUD)
│   └── [id]/
│       ├── page.tsx (detalhes + contratos)
│       └── contracts/[contractId]/
│           └── page.tsx (templates do contrato)
├── contracts/
│   ├── page.tsx (lista global)
│   └── [id]/
│       ├── page.tsx (detalhes + templates)
│       └── templates/[templateId]/
│           └── page.tsx (documentos coletados)
└── templates/
    ├── page.tsx (lista global com filtros)
    └── designer/
        └── page.tsx (designer com seleção obrigatória de contrato)

components/
├── CompanyForm.tsx
├── CompanyList.tsx
├── ContractForm.tsx
├── ContractList.tsx
├── ContractSelector.tsx (para templates)
├── HierarchyBreadcrumb.tsx
└── HierarchyNavigation.tsx
```

## Components and Interfaces

### 1. Company Management

**CompanyForm.tsx**
- Formulário completo com validação de CNPJ/CPF
- Campos: nome, documento, tipo, contato, endereço, status
- Validação de unicidade de documento
- Upload de logo (opcional)

**CompanyList.tsx**
- Lista paginada com filtros (status, tipo documento, busca)
- Cards com informações resumidas
- Ações: visualizar, editar, excluir (com validações)
- Estatísticas: total, ativos, por tipo

### 2. Contract Management

**ContractForm.tsx**
- Seleção obrigatória de empresa
- Campos: número, título, tipo, vigência, valor, termos
- Validação de datas (início < fim)
- Status workflow: rascunho → ativo → suspenso/expirado/cancelado

**ContractList.tsx**
- Lista com informações da empresa
- Filtros: empresa, status, tipo, vigência
- Indicadores visuais: vencimento próximo, valor total
- Navegação para templates vinculados

### 3. Template Integration

**ContractSelector.tsx**
- Componente para seleção obrigatória de contrato no designer
- Exibe apenas contratos ativos
- Mostra informações da empresa associada
- Breadcrumb: Empresa > Contrato > Template

**Enhanced FormDesigner.tsx**
- Integração com ContractSelector
- Exibição permanente do contrato selecionado
- Validação: impede salvar sem contrato
- Herança automática de metadados do contrato

### 4. Navigation Components

**HierarchyBreadcrumb.tsx**
```tsx
interface BreadcrumbItem {
  label: string
  href: string
  type: 'company' | 'contract' | 'template' | 'response'
}

// Exemplo: Empresa ABC > Contrato 2024-001 > Template Cadastro
```

**HierarchyNavigation.tsx**
- Navegação drill-down
- Contadores em cada nível
- Links contextuais entre níveis

## Data Models

### Enhanced Models

```typescript
// Empresa (base da hierarquia)
interface Company {
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
  
  // Relacionamentos
  contracts?: Contract[]
  contract_count?: number
}

// Contrato (vinculado à empresa)
interface Contract {
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
}

// Template (vinculado ao contrato)
interface FormTemplate {
  id: string
  contract_id: string // FK obrigatória (nova)
  name: string
  description?: string
  fields: FormField[]
  template_category?: string
  template_version: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relacionamentos herdados
  contract?: Contract
  company?: Company // via contract
  responses?: FormResponse[]
}

// Resposta (herda hierarquia)
interface FormResponse {
  id: string
  template_id: string
  contract_id: string // herdado automaticamente
  company_id: string // herdado automaticamente
  data: Record<string, any>
  status: string
  submitted_at: string
  
  // Relacionamentos
  template?: FormTemplate
  contract?: Contract
  company?: Company
}
```

## Error Handling

### Validation Rules

1. **Empresa**
   - Documento único e válido (CNPJ/CPF)
   - Nome obrigatório
   - E-mail válido (se informado)

2. **Contrato**
   - Empresa obrigatória e ativa
   - Número único
   - Data início < data fim
   - Valor >= 0

3. **Template**
   - Contrato obrigatório e ativo
   - Nome único dentro do contrato
   - Pelo menos um campo obrigatório

4. **Integridade Referencial**
   - Não excluir empresa com contratos ativos
   - Não excluir contrato com templates
   - Não alterar contrato de template com respostas

### Error Messages

```typescript
const ErrorMessages = {
  COMPANY_DOCUMENT_EXISTS: 'Documento já cadastrado para outra empresa',
  CONTRACT_NUMBER_EXISTS: 'Número de contrato já existe',
  COMPANY_HAS_ACTIVE_CONTRACTS: 'Não é possível excluir empresa com contratos ativos',
  CONTRACT_HAS_TEMPLATES: 'Não é possível excluir contrato com templates vinculados',
  TEMPLATE_REQUIRES_CONTRACT: 'Template deve estar vinculado a um contrato ativo',
  INVALID_DOCUMENT_FORMAT: 'Formato de documento inválido',
  CONTRACT_DATES_INVALID: 'Data de início deve ser anterior à data de fim'
}
```

## Testing Strategy

### Unit Tests

1. **Services**
   - ContractService: CRUD operations, validations
   - Validation functions: document format, date ranges
   - Hierarchy inheritance: automatic field population

2. **Components**
   - Form validations and submissions
   - Filter and search functionality
   - Navigation and breadcrumb generation

### Integration Tests

1. **Database Operations**
   - Cascade operations and constraints
   - Trigger functions for inheritance
   - View queries for hierarchical data

2. **User Workflows**
   - Complete hierarchy creation flow
   - Template creation with contract selection
   - Document collection with inheritance

### E2E Tests

1. **Critical Paths**
   - Empresa → Contrato → Template → Documento
   - Validation error handling
   - Navigation between hierarchy levels

## Implementation Phases

### Phase 1: Database and Core Services
- Execute schema migrations
- Implement ContractService with all CRUD operations
- Create validation functions
- Set up inheritance triggers

### Phase 2: Company and Contract Management
- Build CompanyForm and CompanyList components
- Build ContractForm and ContractList components
- Implement navigation pages
- Add filtering and search capabilities

### Phase 3: Template Integration
- Enhance FormDesigner with contract selection
- Update template creation workflow
- Implement ContractSelector component
- Add hierarchy breadcrumbs

### Phase 4: Enhanced UX and Reporting
- Build HierarchyNavigation component
- Add dashboard with statistics
- Implement advanced filtering
- Create audit logs and history

### Phase 5: Testing and Polish
- Comprehensive testing suite
- Performance optimization
- Error handling refinement
- Documentation and training materials