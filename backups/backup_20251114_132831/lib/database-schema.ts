import { supabase } from './supabase'

/**
 * Utilitários para trabalhar com o schema do banco de dados
 */

export interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

/**
 * Busca todas as tabelas do schema público
 */
export async function getPublicTables(): Promise<TableInfo[]> {
  try {
    console.log('🔍 Buscando tabelas do Supabase...')
    
    // Importar função de descoberta
    const { discoverExistingTables } = await import('./supabase-tables')
    
    // Descobrir tabelas existentes
    const existingTableNames = await discoverExistingTables()
    
    // Filtrar apenas tabelas que não são do sistema
    const systemTables = [
      'form_templates',
      'form_responses', 
      'form_instances',
      'processing_logs'
    ]
    
    const userTables = existingTableNames.filter(tableName => 
      !systemTables.includes(tableName) &&
      !tableName.startsWith('_') &&
      !tableName.includes('migrations')
    )
    
    // Converter para formato TableInfo
    const tableInfos: TableInfo[] = userTables.map(tableName => ({
      table_name: tableName,
      table_schema: 'public',
      table_type: 'BASE TABLE'
    }))
    
    console.log('✅ Tabelas disponíveis para listas dinâmicas:', userTables)
    return tableInfos
    
  } catch (error) {
    console.error('❌ Erro ao buscar tabelas:', error)
    
    // Fallback: retornar tabelas de exemplo
    const fallbackTables = [
      { table_name: 'categories', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'status_options', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'inspectors', table_schema: 'public', table_type: 'BASE TABLE' }
    ]
    
    console.log('🔄 Usando tabelas de fallback')
    return fallbackTables
  }
}

/**
 * Busca colunas de uma tabela específica
 */
export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  try {
    console.log(`🔍 Buscando colunas da tabela: ${tableName}`)
    
    // Importar função de descoberta
    const { discoverTableColumns } = await import('./supabase-tables')
    
    // Descobrir colunas da tabela
    const columnNames = await discoverTableColumns(tableName)
    
    // Converter para formato ColumnInfo
    const columns: ColumnInfo[] = columnNames.map(columnName => ({
      column_name: columnName,
      data_type: getColumnType(columnName),
      is_nullable: columnName === 'id' ? 'NO' : 'YES',
      column_default: getColumnDefault(columnName)
    }))
    
    console.log(`✅ Colunas encontradas para ${tableName}:`, columns)
    return columns
    
  } catch (error) {
    console.error('Erro ao buscar colunas:', error)
    return getDefaultColumnsForTable(tableName)
  }
}

/**
 * Determina o tipo de uma coluna baseado no nome
 */
function getColumnType(columnName: string): string {
  if (columnName === 'id') return 'integer'
  if (columnName.includes('email')) return 'text'
  if (columnName.includes('color')) return 'text'
  if (columnName.includes('active')) return 'boolean'
  if (columnName.includes('index') || columnName.includes('order')) return 'integer'
  if (columnName.includes('created_at') || columnName.includes('updated_at')) return 'timestamp'
  return 'text'
}

/**
 * Determina o valor padrão de uma coluna baseado no nome
 */
function getColumnDefault(columnName: string): string | null {
  if (columnName === 'id') return 'nextval()'
  if (columnName.includes('active')) return 'true'
  if (columnName.includes('created_at')) return 'now()'
  if (columnName.includes('order_index')) return '0'
  return null
}

/**
 * Retorna colunas padrão baseadas no nome da tabela
 */
function getDefaultColumnsForTable(tableName: string): ColumnInfo[] {
  const commonColumns = [
    { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: 'nextval()' },
    { column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null },
    { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'YES', column_default: 'now()' }
  ]
  
  switch (tableName) {
    case 'categories':
      return [
        ...commonColumns,
        { column_name: 'description', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'active', data_type: 'boolean', is_nullable: 'YES', column_default: 'true' }
      ]
    
    case 'status_options':
      return [
        ...commonColumns,
        { column_name: 'color', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'order_index', data_type: 'integer', is_nullable: 'YES', column_default: '0' }
      ]
    
    case 'inspectors':
      return [
        ...commonColumns,
        { column_name: 'email', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'department', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'active', data_type: 'boolean', is_nullable: 'YES', column_default: 'true' }
      ]
    
    default:
      return commonColumns
  }
}

/**
 * Busca dados de uma tabela para popular lista dinâmica
 */
export async function getDynamicListData(
  tableName: string,
  valueField: string,
  displayField: string,
  filterCondition?: string,
  orderBy?: string
): Promise<Array<{ value: any, label: string }>> {
  try {
    let query = supabase
      .from(tableName)
      .select(`${valueField}, ${displayField}`)

    // Aplicar filtro se fornecido
    if (filterCondition) {
      // Aqui você pode implementar parsing de condições mais complexas
      // Por enquanto, vamos suportar condições simples
      query = query.filter(filterCondition.split('=')[0].trim(), 'eq', filterCondition.split('=')[1]?.trim())
    }

    // Aplicar ordenação
    if (orderBy) {
      query = query.order(orderBy)
    } else {
      query = query.order(displayField)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar dados da lista dinâmica:', error)
      return []
    }

    return (data || []).map(item => ({
      value: item[valueField],
      label: String(item[displayField])
    }))
  } catch (error) {
    console.error('Erro ao buscar dados da lista dinâmica:', error)
    return []
  }
}

/**
 * Cria tabelas de exemplo para demonstração
 */
export async function createExampleTables(): Promise<void> {
  try {
    console.log('🔧 Verificando tabelas de exemplo...')
    
    // Importar função de verificação
    const { ensureExampleTables } = await import('./supabase-tables')
    
    // Verificar e orientar sobre criação das tabelas
    await ensureExampleTables()
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas de exemplo:', error)
    throw error
  }
}

/**
 * Popula tabelas de exemplo com dados iniciais
 */
export async function populateExampleData(): Promise<void> {
  try {
    console.log('📊 Inserindo dados de exemplo...')
    
    // Dados para categorias
    const categories = [
      { name: 'Segurança', description: 'Itens relacionados à segurança', active: true },
      { name: 'Qualidade', description: 'Controle de qualidade', active: true },
      { name: 'Manutenção', description: 'Manutenção preventiva e corretiva', active: true },
      { name: 'Limpeza', description: 'Procedimentos de limpeza', active: true }
    ]

    // Dados para status
    const statusOptions = [
      { name: 'Aprovado', color: '#10B981', order_index: 1 },
      { name: 'Reprovado', color: '#EF4444', order_index: 2 },
      { name: 'Pendente', color: '#F59E0B', order_index: 3 },
      { name: 'Em Análise', color: '#6366F1', order_index: 4 }
    ]

    // Dados para inspetores
    const inspectors = [
      { name: 'João Silva', email: 'joao@empresa.com', department: 'Qualidade', active: true },
      { name: 'Maria Santos', email: 'maria@empresa.com', department: 'Segurança', active: true },
      { name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Manutenção', active: true },
      { name: 'Ana Oliveira', email: 'ana@empresa.com', department: 'Limpeza', active: true }
    ]

    // Tentar inserir dados em cada tabela
    try {
      const { error: catError } = await (supabase as any).from('categories').upsert(categories, { onConflict: 'name' })
      if (catError) console.warn('Aviso categories:', catError.message)
      else console.log('✅ Categorias inseridas')
    } catch (e) {
      console.warn('⚠️ Tabela categories pode não existir ainda')
    }

    try {
      const { error: statusError } = await (supabase as any).from('status_options').upsert(statusOptions, { onConflict: 'name' })
      if (statusError) console.warn('Aviso status_options:', statusError.message)
      else console.log('✅ Status inseridos')
    } catch (e) {
      console.warn('⚠️ Tabela status_options pode não existir ainda')
    }

    try {
      const { error: inspError } = await (supabase as any).from('inspectors').upsert(inspectors, { onConflict: 'email' })
      if (inspError) console.warn('Aviso inspectors:', inspError.message)
      else console.log('✅ Inspetores inseridos')
    } catch (e) {
      console.warn('⚠️ Tabela inspectors pode não existir ainda')
    }

    console.log('✅ Processo de inserção de dados concluído')
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error)
  }
}