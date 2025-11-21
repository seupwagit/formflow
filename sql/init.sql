-- =====================================================
-- SISTEMA DE MAPEAMENTO AUTOMÁTICO DE FORMULÁRIOS
-- Estrutura simplificada e focada
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE MODELOS DE FORMULÁRIOS
-- =====================================================
CREATE TABLE form_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  pdf_pages INTEGER DEFAULT 1,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  table_name VARCHAR(255) UNIQUE,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 2. TABELA DE INSTÂNCIAS DE INSPEÇÃO
-- =====================================================
CREATE TABLE form_instances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 3. TABELA DE UPLOADS DE ARQUIVOS
-- =====================================================
CREATE TABLE file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_results JSONB,
  detected_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 4. FUNÇÃO PARA EXECUTAR SQL DINÂMICO
-- =====================================================
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS PARA ATUALIZAR TIMESTAMPS
-- =====================================================
CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_instances_updated_at
  BEFORE UPDATE ON form_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_form_templates_created_by ON form_templates(created_by);
CREATE INDEX idx_form_templates_created_at ON form_templates(created_at);
CREATE INDEX idx_form_templates_is_active ON form_templates(is_active);
CREATE INDEX idx_form_instances_template_id ON form_instances(template_id);
CREATE INDEX idx_form_instances_created_by ON form_instances(created_by);
CREATE INDEX idx_form_instances_status ON form_instances(status);
CREATE INDEX idx_file_uploads_created_by ON file_uploads(created_by);
CREATE INDEX idx_file_uploads_processing_status ON file_uploads(processing_status);