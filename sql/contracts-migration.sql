-- =====================================================
-- MIGRAÇÃO: SISTEMA HIERÁRQUICO DE CONTRATOS
-- Adiciona hierarquia: Empresa → Contrato → Template → Documento
-- =====================================================

-- =====================================================
-- 1. TABELA DE EMPRESAS (BASE DA HIERARQUIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(50) UNIQUE NOT NULL, -- CNPJ/CPF
  document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('CNPJ', 'CPF')),
  email VARCHAR(255),
  phone VARCHAR(50),
  address JSONB, -- {street, number, complement, city, state, zip_code, country}
  contact_person VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  logo_url TEXT,
  website VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 2. TABELA DE CONTRATOS (VINCULADOS À EMPRESA)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  contract_type VARCHAR(50) NOT NULL, -- 'service', 'product', 'maintenance', etc.
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_terms TEXT,
  renewal_type VARCHAR(20) DEFAULT 'manual' CHECK (renewal_type IN ('manual', 'automatic', 'none')),
  renewal_period INTEGER, -- em meses
  contract_file_url TEXT,
  signed_date DATE,
  signed_by_company VARCHAR(255),
  signed_by_client VARCHAR(255),
  tags TEXT[], -- array de tags para categorização
  metadata JSONB, -- dados adicionais flexíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 3. ATUALIZAR TABELA DE TEMPLATES (VINCULAR AO CONTRATO)
-- =====================================================
-- Adicionar colunas de hierarquia à tabela existente
ALTER TABLE form_templates 
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS template_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS template_version VARCHAR(20) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS is_template_active BOOLEAN DEFAULT true;

-- =====================================================
-- 4. ATUALIZAR TABELA DE INSTÂNCIAS (HERDAR HIERARQUIA)
-- =====================================================
-- Renomear form_instances para form_responses para melhor semântica
ALTER TABLE form_instances RENAME TO form_responses;

-- Adicionar colunas de hierarquia herdadas
ALTER TABLE form_responses 
ADD COLUMN IF NOT EXISTS contract_id UUID,
ADD COLUMN IF NOT EXISTS company_id UUID;

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);

CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);

CREATE INDEX IF NOT EXISTS idx_form_templates_contract_id ON form_templates(contract_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_contract_id ON form_responses(contract_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_company_id ON form_responses(company_id);

-- =====================================================
-- 6. TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at 
  BEFORE UPDATE ON contracts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FUNÇÃO PARA HERDAR DADOS DO CONTRATO
-- =====================================================
CREATE OR REPLACE FUNCTION inherit_contract_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar dados do contrato através do template
    SELECT c.id, c.company_id 
    INTO NEW.contract_id, NEW.company_id
    FROM form_templates ft
    JOIN contracts c ON ft.contract_id = c.id
    WHERE ft.id = NEW.template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGER PARA HERANÇA AUTOMÁTICA
-- =====================================================
DROP TRIGGER IF EXISTS inherit_contract_data_trigger ON form_responses;
CREATE TRIGGER inherit_contract_data_trigger 
    BEFORE INSERT ON form_responses
    FOR EACH ROW 
    EXECUTE FUNCTION inherit_contract_data();

-- =====================================================
-- 9. VIEWS PARA CONSULTAS HIERÁRQUICAS
-- =====================================================

-- View de resumo de contratos com informações da empresa
CREATE OR REPLACE VIEW contract_summary AS
SELECT 
    c.*,
    co.name as company_name,
    co.document as company_document,
    co.document_type as company_document_type,
    co.status as company_status,
    COUNT(DISTINCT ft.id) as template_count,
    COUNT(DISTINCT fr.id) as response_count,
    COALESCE(SUM(CASE WHEN ft.is_active = true THEN 1 ELSE 0 END), 0) as active_template_count
FROM contracts c
JOIN companies co ON c.company_id = co.id
LEFT JOIN form_templates ft ON c.id = ft.contract_id
LEFT JOIN form_responses fr ON c.id = fr.contract_id
GROUP BY c.id, co.name, co.document, co.document_type, co.status;

-- View de resumo de empresas com estatísticas
CREATE OR REPLACE VIEW company_summary AS
SELECT 
    co.*,
    COUNT(DISTINCT c.id) as contract_count,
    COUNT(DISTINCT ft.id) as template_count,
    COUNT(DISTINCT fr.id) as response_count,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_contract_count,
    COALESCE(SUM(c.value), 0) as total_contract_value
FROM companies co
LEFT JOIN contracts c ON co.id = c.company_id
LEFT JOIN form_templates ft ON c.id = ft.contract_id
LEFT JOIN form_responses fr ON c.id = fr.contract_id
GROUP BY co.id;

-- View de templates com contexto hierárquico completo
CREATE OR REPLACE VIEW template_hierarchy AS
SELECT 
    ft.*,
    c.contract_number,
    c.title as contract_title,
    c.status as contract_status,
    co.name as company_name,
    co.document as company_document,
    COUNT(fr.id) as response_count
FROM form_templates ft
LEFT JOIN contracts c ON ft.contract_id = c.id
LEFT JOIN companies co ON c.company_id = co.id
LEFT JOIN form_responses fr ON ft.id = fr.template_id
GROUP BY ft.id, c.contract_number, c.title, c.status, co.name, co.document;

-- =====================================================
-- 10. DADOS DE EXEMPLO PARA DESENVOLVIMENTO
-- =====================================================

-- Inserir empresas de exemplo
INSERT INTO companies (name, document, document_type, email, phone, contact_person, status) VALUES
('Empresa Exemplo LTDA', '12.345.678/0001-90', 'CNPJ', 'contato@exemplo.com', '(11) 99999-9999', 'João Silva', 'active'),
('Consultoria ABC', '98.765.432/0001-10', 'CNPJ', 'admin@abc.com', '(21) 88888-8888', 'Maria Santos', 'active'),
('Freelancer XYZ', '123.456.789-00', 'CPF', 'xyz@freelancer.com', '(31) 77777-7777', 'Pedro Costa', 'active')
ON CONFLICT (document) DO NOTHING;

-- Inserir contratos de exemplo
INSERT INTO contracts (company_id, contract_number, title, description, contract_type, status, start_date, end_date, value) 
SELECT 
    c.id,
    'CONT-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
    'Contrato de Serviços - ' || c.name,
    'Contrato para prestação de serviços de digitalização e processamento de formulários',
    'service',
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '12 months',
    50000.00
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE company_id = c.id);

-- =====================================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE companies IS 'Cadastro de empresas/clientes - base da hierarquia';
COMMENT ON TABLE contracts IS 'Contratos vinculados às empresas';
COMMENT ON COLUMN form_templates.contract_id IS 'Vinculação obrigatória do template ao contrato';
COMMENT ON COLUMN form_responses.contract_id IS 'Herda automaticamente do template via trigger';
COMMENT ON COLUMN form_responses.company_id IS 'Herda automaticamente do contrato via trigger';

-- =====================================================
-- 12. FUNÇÃO PARA VALIDAR INTEGRIDADE HIERÁRQUICA
-- =====================================================
CREATE OR REPLACE FUNCTION validate_hierarchy_integrity()
RETURNS TABLE(
    issue_type TEXT,
    table_name TEXT,
    record_id UUID,
    description TEXT
) AS $$
BEGIN
    -- Templates sem contrato
    RETURN QUERY
    SELECT 
        'missing_contract'::TEXT,
        'form_templates'::TEXT,
        ft.id,
        'Template sem contrato vinculado: ' || ft.name
    FROM form_templates ft
    WHERE ft.contract_id IS NULL;
    
    -- Responses sem herança correta
    RETURN QUERY
    SELECT 
        'missing_inheritance'::TEXT,
        'form_responses'::TEXT,
        fr.id,
        'Response sem herança de contrato/empresa'
    FROM form_responses fr
    WHERE fr.contract_id IS NULL OR fr.company_id IS NULL;
    
    -- Contratos sem empresa
    RETURN QUERY
    SELECT 
        'orphaned_contract'::TEXT,
        'contracts'::TEXT,
        c.id,
        'Contrato órfão: ' || c.contract_number
    FROM contracts c
    LEFT JOIN companies co ON c.company_id = co.id
    WHERE co.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Executar validação inicial
-- SELECT * FROM validate_hierarchy_integrity();