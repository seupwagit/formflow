/**
 * API DE BACKUP COMPLETO DO SUPABASE
 * 
 * Endpoint: POST /api/backup
 * 
 * Criado em: 14/11/2024
 * ⚠️ ARQUIVO NOVO - NÃO ALTERA NADA DO SISTEMA EXISTENTE
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupDir = join(process.cwd(), 'supabase', 'backup', timestamp)
    
    // Criar diretório de backup
    await mkdir(backupDir, { recursive: true })

    const files: string[] = []
    const errors: string[] = []
    let totalRows = 0

    // Lista de tabelas para backup
    const tables = [
      'form_templates',
      'form_responses',
      'companies',
      'contracts',
      'template_validation_rules',
      'template_background_versions',
      'file_uploads',
      'pdf_processing_log'
    ]

    // 1. Backup dos dados de cada tabela
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')

        if (error) {
          errors.push(`Erro em ${table}: ${error.message}`)
          continue
        }

        if (data) {
          // Salvar JSON
          const jsonPath = join(backupDir, `${table}.json`)
          await writeFile(jsonPath, JSON.stringify(data, null, 2))
          files.push(`${table}.json`)
          totalRows += data.length

          // Gerar SQL INSERT
          const sqlContent = generateInsertSQL(table, data)
          const sqlPath = join(backupDir, `${table}.sql`)
          await writeFile(sqlPath, sqlContent)
          files.push(`${table}.sql`)

          console.log(`✅ Backup de ${table}: ${data.length} registros`)
        }
      } catch (err) {
        errors.push(`Erro ao processar ${table}: ${err}`)
      }
    }

    // 2. Backup de Functions
    const functionsSQL = `
-- ============================================
-- BACKUP DE FUNCTIONS/RPC
-- Data: ${new Date().toISOString()}
-- ============================================

-- Function: save_template_validations
CREATE OR REPLACE FUNCTION save_template_validations(
  p_template_id UUID,
  p_rules JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM template_validation_rules WHERE template_id = p_template_id;
  
  INSERT INTO template_validation_rules (template_id, rule_data, rule_order, is_enabled)
  SELECT 
    p_template_id,
    rule_item,
    (row_number() OVER ())::integer - 1 as rule_order,
    COALESCE((rule_item->>'enabled')::boolean, true)
  FROM jsonb_array_elements(p_rules) as rule_item;
END;
$$;

-- Function: load_template_validations
CREATE OR REPLACE FUNCTION load_template_validations(p_template_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(rule_data ORDER BY rule_order), '[]'::jsonb)
  INTO result
  FROM template_validation_rules
  WHERE template_id = p_template_id
  AND is_enabled = true;
  
  RETURN result;
END;
$$;
`
    await writeFile(join(backupDir, 'functions.sql'), functionsSQL)
    files.push('functions.sql')

    // 3. Backup de Triggers
    const triggersSQL = `
-- ============================================
-- BACKUP DE TRIGGERS
-- Data: ${new Date().toISOString()}
-- ============================================

-- Trigger: update_template_validation_rules_updated_at
CREATE OR REPLACE FUNCTION update_template_validation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_template_validation_rules_updated_at ON template_validation_rules;

CREATE TRIGGER trigger_update_template_validation_rules_updated_at
BEFORE UPDATE ON template_validation_rules
FOR EACH ROW
EXECUTE FUNCTION update_template_validation_rules_updated_at();
`
    await writeFile(join(backupDir, 'triggers.sql'), triggersSQL)
    files.push('triggers.sql')

    // 4. Criar README
    const readme = `
# BACKUP COMPLETO DO SUPABASE

**Data:** ${new Date().toISOString()}
**Timestamp:** ${timestamp}

## 📊 RESUMO

- **Tabelas:** ${tables.length}
- **Total de Registros:** ${totalRows}
- **Arquivos Gerados:** ${files.length}

## 📁 ARQUIVOS

### Dados (JSON):
${tables.map(t => `- ${t}.json`).join('\n')}

### Dados (SQL):
${tables.map(t => `- ${t}.sql`).join('\n')}

### Estrutura:
- functions.sql - Functions/RPC
- triggers.sql - Triggers
- RESTORE.sql - Script de restore completo

## 🔄 COMO RESTAURAR

### Opção 1: Restaurar Tudo
\`\`\`bash
psql -h [host] -U [user] -d [database] -f RESTORE.sql
\`\`\`

### Opção 2: Restaurar Tabela Específica
\`\`\`bash
psql -h [host] -U [user] -d [database] -f form_templates.sql
\`\`\`

### Opção 3: Usar JSON (via código)
\`\`\`typescript
import data from './form_templates.json'
await supabase.from('form_templates').insert(data)
\`\`\`

## ⚠️ IMPORTANTE

- Faça backup antes de restaurar
- Verifique se as tabelas existem
- Cuidado com conflitos de ID (UUID)
- Desabilite triggers se necessário

## 📋 DETALHES DAS TABELAS

${tables.map(t => `### ${t}\n- Arquivo JSON: ${t}.json\n- Arquivo SQL: ${t}.sql\n`).join('\n')}
`
    await writeFile(join(backupDir, 'README.md'), readme)
    files.push('README.md')

    // 5. Criar script de restore completo
    const restoreSQL = `
-- ============================================
-- SCRIPT DE RESTORE COMPLETO
-- Data: ${new Date().toISOString()}
-- ============================================

-- INSTRUÇÕES:
-- 1. Execute este script em um banco de dados VAZIO
-- 2. Ou execute seção por seção conforme necessário

\\echo '🔄 Restaurando Functions...'
\\i functions.sql

\\echo '🔄 Restaurando Triggers...'
\\i triggers.sql

\\echo '🔄 Restaurando Dados...'
${tables.map(t => `\\i ${t}.sql`).join('\n')}

\\echo '✅ Restore completo!'

-- Verificação
SELECT 
  'form_templates' as tabela,
  COUNT(*) as registros
FROM form_templates
UNION ALL
SELECT 'form_responses', COUNT(*) FROM form_responses
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'template_validation_rules', COUNT(*) FROM template_validation_rules
UNION ALL
SELECT 'template_background_versions', COUNT(*) FROM template_background_versions;
`
    await writeFile(join(backupDir, 'RESTORE.sql'), restoreSQL)
    files.push('RESTORE.sql')

    // Retornar resultado
    return NextResponse.json({
      success: true,
      timestamp,
      backupDir: `supabase/backup/${timestamp}`,
      summary: {
        tables: tables.length,
        totalRows,
        files: files.length,
        errors: errors.length
      },
      files,
      errors
    })

  } catch (error) {
    console.error('❌ Erro no backup:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

/**
 * Gerar SQL INSERT a partir dos dados
 */
function generateInsertSQL(table: string, data: any[]): string {
  if (!data || data.length === 0) {
    return `-- Tabela ${table} vazia\n-- Data: ${new Date().toISOString()}\n`
  }

  const columns = Object.keys(data[0])
  let sql = `-- ============================================\n`
  sql += `-- BACKUP DE DADOS: ${table}\n`
  sql += `-- Data: ${new Date().toISOString()}\n`
  sql += `-- Total de registros: ${data.length}\n`
  sql += `-- ============================================\n\n`

  for (const row of data) {
    const values = columns.map(col => {
      const value = row[col]
      if (value === null) return 'NULL'
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
      if (typeof value === 'boolean') return value ? 'true' : 'false'
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
      if (Array.isArray(value)) return `ARRAY[${value.map(v => `'${v}'`).join(',')}]`
      return value
    })

    sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`
  }

  return sql + '\n'
}
