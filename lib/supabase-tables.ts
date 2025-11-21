import { supabase } from './supabase'

/**
 * Lista de tabelas conhecidas que podem existir no Supabase
 */
// ✅ ATUALIZADO: Removida form_instances (consolidada com form_responses) - 14/11/2024
const KNOWN_TABLES = [
  'categories',
  'status_options', 
  'inspectors',
  'form_templates',
  'form_responses',
  'template_validation_rules',
  'template_background_versions',
  'companies',
  'contracts',
  'pdf_processing_log',
  'file_uploads'
]

/**
 * Testa se uma tabela existe fazendo uma query simples
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    return !error
  } catch {
    return false
  }
}

/**
 * Descobre quais tabelas existem no banco
 */
export async function discoverExistingTables(): Promise<string[]> {
  console.log('🔍 Descobrindo tabelas existentes...')
  
  const existingTables: string[] = []
  
  for (const tableName of KNOWN_TABLES) {
    const exists = await tableExists(tableName)
    if (exists) {
      existingTables.push(tableName)
      console.log(`✅ Tabela encontrada: ${tableName}`)
    } else {
      console.log(`❌ Tabela não encontrada: ${tableName}`)
    }
  }
  
  return existingTables
}

/**
 * Descobre as colunas de uma tabela fazendo uma query
 */
export async function discoverTableColumns(tableName: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error || !data || data.length === 0) {
      return getDefaultColumns(tableName)
    }
    
    return Object.keys(data[0])
  } catch {
    return getDefaultColumns(tableName)
  }
}

/**
 * Retorna colunas padrão baseadas no nome da tabela
 */
function getDefaultColumns(tableName: string): string[] {
  const baseColumns = ['id', 'name', 'created_at']
  
  switch (tableName) {
    case 'categories':
      return [...baseColumns, 'description', 'active']
    case 'status_options':
      return [...baseColumns, 'color', 'order_index']
    case 'inspectors':
      return [...baseColumns, 'email', 'department', 'active']
    default:
      return baseColumns
  }
}

/**
 * Cria as tabelas de exemplo se elas não existirem
 */
export async function ensureExampleTables(): Promise<void> {
  console.log('🔧 Verificando/criando tabelas de exemplo...')
  
  const existingTables = await discoverExistingTables()
  
  // Se as tabelas já existem, não fazer nada
  if (existingTables.includes('categories') && 
      existingTables.includes('status_options') && 
      existingTables.includes('inspectors')) {
    console.log('✅ Todas as tabelas de exemplo já existem')
    return
  }
  
  console.log('ℹ️ Algumas tabelas não existem. Você precisa criá-las manualmente no Supabase Dashboard:')
  console.log('')
  console.log('-- SQL para criar as tabelas:')
  console.log(`
-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Status
CREATE TABLE IF NOT EXISTS status_options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Inspetores
CREATE TABLE IF NOT EXISTS inspectors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  department VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO categories (name, description, active) VALUES
('Segurança', 'Itens relacionados à segurança', true),
('Qualidade', 'Controle de qualidade', true),
('Manutenção', 'Manutenção preventiva e corretiva', true),
('Limpeza', 'Procedimentos de limpeza', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO status_options (name, color, order_index) VALUES
('Aprovado', '#10B981', 1),
('Reprovado', '#EF4444', 2),
('Pendente', '#F59E0B', 3),
('Em Análise', '#6366F1', 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO inspectors (name, email, department, active) VALUES
('João Silva', 'joao@empresa.com', 'Qualidade', true),
('Maria Santos', 'maria@empresa.com', 'Segurança', true),
('Pedro Costa', 'pedro@empresa.com', 'Manutenção', true),
('Ana Oliveira', 'ana@empresa.com', 'Limpeza', true)
ON CONFLICT (email) DO NOTHING;
  `)
}