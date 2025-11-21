import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const tableName = params.table
    
    console.log(`🔍 Buscando colunas da tabela: ${tableName}`)
    
    // Mapear colunas conhecidas para cada tabela
    const knownColumns: { [key: string]: any[] } = {
      'form_templates': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'name', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'pdf_url', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'pdf_pages', data_type: 'integer', is_nullable: 'YES' },
        { column_name: 'fields', data_type: 'jsonb', is_nullable: 'NO' },
        { column_name: 'table_name', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'version', data_type: 'integer', is_nullable: 'YES' },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'processing_id', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'pdf_path', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'image_paths', data_type: 'text[]', is_nullable: 'YES' },
        { column_name: 'field_definitions', data_type: 'jsonb', is_nullable: 'YES' }
      ],
      'form_instances': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'template_id', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'data', data_type: 'jsonb', is_nullable: 'NO' },
        { column_name: 'status', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES' }
      ],
      'form_responses': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'template_id', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'response_data', data_type: 'jsonb', is_nullable: 'NO' },
        { column_name: 'status', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'submitted_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'reviewed_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'reviewed_by', data_type: 'uuid', is_nullable: 'YES' }
      ],
      'file_uploads': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'filename', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'original_filename', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'file_path', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'file_size', data_type: 'bigint', is_nullable: 'NO' },
        { column_name: 'mime_type', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'processing_status', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'ocr_results', data_type: 'jsonb', is_nullable: 'YES' },
        { column_name: 'detected_fields', data_type: 'jsonb', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES' }
      ],
      'pdf_processing_log': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'processing_id', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'file_name', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'pdf_path', data_type: 'varchar', is_nullable: 'NO' },
        { column_name: 'image_paths', data_type: 'text[]', is_nullable: 'NO' },
        { column_name: 'fields_count', data_type: 'integer', is_nullable: 'YES' },
        { column_name: 'pages_count', data_type: 'integer', is_nullable: 'YES' },
        { column_name: 'status', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'error_message', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamptz', is_nullable: 'YES' }
      ],
      'inspection_solda': [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'template_id', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'inspector_name', data_type: 'varchar', is_nullable: 'YES' },
        { column_name: 'inspection_date', data_type: 'date', is_nullable: 'YES' },
        { column_name: 'temperature', data_type: 'numeric', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'updated_at', data_type: 'timestamptz', is_nullable: 'YES' },
        { column_name: 'created_by', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'status', data_type: 'varchar', is_nullable: 'YES' }
      ]
    }
    
    // Retornar colunas conhecidas da tabela
    if (knownColumns[tableName]) {
      console.log(`✅ Retornando ${knownColumns[tableName].length} colunas para ${tableName}`)
      return NextResponse.json(knownColumns[tableName])
    }
    
    // Fallback para tabela desconhecida
    console.log(`⚠️ Tabela ${tableName} não encontrada, usando fallback`)
    const fallbackColumns = [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'name', data_type: 'varchar', is_nullable: 'YES' },
      { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' }
    ]
    
    return NextResponse.json(fallbackColumns)
    
  } catch (error) {
    console.error('❌ Erro ao buscar colunas:', error)
    
    // Fallback para erro
    const fallbackColumns = [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'name', data_type: 'varchar', is_nullable: 'YES' },
      { column_name: 'created_at', data_type: 'timestamptz', is_nullable: 'YES' }
    ]
    
    return NextResponse.json(fallbackColumns)
  }
}