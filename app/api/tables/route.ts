import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Lista de TODAS as tabelas reais que existem no banco
    // ✅ ATUALIZADO: Removidas tabelas legado (14/11/2024)
    // - inspection_solda: Nunca foi usada
    // - form_instances: Consolidada com form_responses
    const allTables = [
      'form_templates',
      'form_responses',
      'file_uploads',
      'pdf_processing_log',
      'template_validation_rules',
      'template_background_versions',
      'companies',
      'contracts'
    ]
    
    // Verificar quais tabelas realmente existem e estão acessíveis
    const existingTables = []
    
    for (const tableName of allTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error) {
          existingTables.push({ table_name: tableName })
        }
      } catch (e) {
        console.log(`Tabela ${tableName} não acessível:`, e)
      }
    }
    
    console.log(`✅ Encontradas ${existingTables.length} tabelas acessíveis:`, existingTables.map(t => t.table_name))
    
    // Se encontrou tabelas, retornar elas
    if (existingTables.length > 0) {
      return NextResponse.json(existingTables)
    }
    
    // Fallback: retornar todas as tabelas conhecidas
    console.log('⚠️ Nenhuma tabela acessível, retornando lista completa')
    return NextResponse.json(allTables.map(name => ({ table_name: name })))
    
  } catch (error) {
    console.error('❌ Erro ao buscar tabelas:', error)
    
    // Fallback final: retornar todas as tabelas que sabemos que existem
    return NextResponse.json([
      { table_name: 'form_templates' },
      { table_name: 'form_responses' },
      { table_name: 'file_uploads' },
      { table_name: 'pdf_processing_log' },
      { table_name: 'template_validation_rules' },
      { table_name: 'template_background_versions' },
      { table_name: 'companies' },
      { table_name: 'contracts' }
    ])
  }
}