/**
 * @deprecated Este arquivo está DEPRECATED desde 14/11/2024
 * 
 * ⚠️ NÃO USE ESTE ARQUIVO EM NOVOS CÓDIGOS!
 * 
 * Motivo: Tabela form_instances foi consolidada com form_responses
 * 
 * Use ao invés:
 * - ResponseService (lib/services/response-service.ts) para form_responses
 * - Supabase client direto para form_templates
 * 
 * Backup: backups/backup_20241114_xxxxxx/
 * Documentação: docs/AUDITORIA_TABELAS_20241114.md
 * 
 * Este arquivo será removido em versão futura.
 */

// @ts-nocheck
import { supabaseAdmin } from './supabase'
import { FormField, FormTemplate, FormInstance, FileUpload } from './types'

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }
  return supabaseAdmin
}

/**
 * @deprecated Use ResponseService ao invés
 */
export class DatabaseManager {
  
  // =====================================================
  // GERENCIAMENTO DE TEMPLATES
  // =====================================================
  
  async createTableForForm(tableName: string, fields: FormField[]): Promise<void> {
    // Gerar SQL para criar tabela dinamicamente baseada nos campos
    const columns = fields.map(field => {
      let sqlType = 'TEXT'
      
      switch (field.type) {
        case 'number':
          sqlType = 'NUMERIC'
          break
        case 'date':
          sqlType = 'DATE'
          break
        case 'checkbox':
          sqlType = 'BOOLEAN'
          break
        case 'textarea':
          sqlType = 'TEXT'
          break
        case 'image':
        case 'signature':
          sqlType = 'TEXT' // URL da imagem
          break
        default:
          sqlType = 'VARCHAR(255)'
      }
      
      const required = field.required ? 'NOT NULL' : ''
      return `${field.name} ${sqlType} ${required}`
    }).join(', ')

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id),
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
        ${columns.length > 0 ? ',' + columns : ''}
      );
      
      -- Trigger para atualizar updated_at
      CREATE TRIGGER update_${tableName}_updated_at
        BEFORE UPDATE ON ${tableName}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `

    const { error } = await getSupabaseAdmin().rpc('execute_sql', {
      sql_query: createTableSQL
    } as any)

    if (error) {
      console.error('Erro ao criar tabela:', error)
      throw error
    }
  }

  async saveFormTemplate(template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await getSupabaseAdmin()
      .from('form_templates')
      .insert({
        name: template.name,
        description: template.description,
        pdf_url: template.pdf_url,
        pdf_pages: template.pdf_pages,
        fields: template.fields as any,
        table_name: template.table_name,
        version: template.version,
        is_active: template.is_active,
        created_by: template.created_by
      } as any)
      .select('id')
      .single()

    if (error) throw error
    
    // Criar tabela correspondente se table_name foi fornecido
    if (template.table_name && template.fields) {
      await this.createTableForForm(template.table_name, template.fields)
    }
    
    return (data as any).id
  }

  async updateFormTemplate(id: string, updates: Partial<FormTemplate>): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('form_templates')
      .update({
        ...updates,
        fields: updates.fields as any
      } as any)
      .eq('id', id)

    if (error) throw error
  }

  async getFormTemplates(): Promise<FormTemplate[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('form_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(this.mapTemplateFromDB)
  }

  async getFormTemplate(id: string): Promise<FormTemplate | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('form_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return this.mapTemplateFromDB(data)
  }

  private mapTemplateFromDB(data: any): FormTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      pdf_url: data.pdf_url,
      pdf_pages: data.pdf_pages || 1,
      fields: Array.isArray(data.fields) ? data.fields : [],
      table_name: data.table_name,
      version: data.version || 1,
      is_active: data.is_active !== false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by
    }
  }

  // =====================================================
  // GERENCIAMENTO DE INSTÂNCIAS
  // =====================================================

  async saveFormInstance(instance: Omit<FormInstance, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await getSupabaseAdmin()
      .from('form_instances')
      .insert({
        template_id: instance.template_id,
        data: instance.data as any,
        status: instance.status,
        created_by: instance.created_by
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async saveFormInstanceToTable(tableName: string, data: Record<string, any>): Promise<string> {
    const { data: result, error } = await getSupabaseAdmin()
      .from(tableName)
      .insert(data)
      .select('id')
      .single()

    if (error) throw error
    return result.id
  }

  async getFormInstances(templateId?: string): Promise<FormInstance[]> {
    let query = getSupabaseAdmin()
      .from('form_instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(this.mapInstanceFromDB)
  }

  async getFormInstancesFromTable(tableName: string): Promise<any[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private mapInstanceFromDB(data: any): FormInstance {
    return {
      id: data.id,
      template_id: data.template_id,
      data: data.data || {},
      status: data.status || 'draft',
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by
    }
  }

  // =====================================================
  // GERENCIAMENTO DE UPLOADS
  // =====================================================

  async saveFileUpload(upload: Omit<FileUpload, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await getSupabaseAdmin()
      .from('file_uploads')
      .insert({
        filename: upload.filename,
        original_filename: upload.original_filename,
        file_path: upload.file_path,
        file_size: upload.file_size,
        mime_type: upload.mime_type,
        processing_status: upload.processing_status,
        ocr_results: upload.ocr_results as any,
        detected_fields: upload.detected_fields as any,
        created_by: upload.created_by
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  async updateFileUpload(id: string, updates: Partial<FileUpload>): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('file_uploads')
      .update({
        ...updates,
        ocr_results: updates.ocr_results as any,
        detected_fields: updates.detected_fields as any
      })
      .eq('id', id)

    if (error) throw error
  }

  async getFileUpload(id: string): Promise<FileUpload | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('file_uploads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return this.mapUploadFromDB(data)
  }

  private mapUploadFromDB(data: any): FileUpload {
    return {
      id: data.id,
      filename: data.filename,
      original_filename: data.original_filename,
      file_path: data.file_path,
      file_size: data.file_size,
      mime_type: data.mime_type,
      processing_status: data.processing_status || 'pending',
      ocr_results: data.ocr_results,
      detected_fields: data.detected_fields || [],
      created_at: data.created_at,
      created_by: data.created_by
    }
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  async deleteFormTemplate(id: string): Promise<void> {
    // Primeiro, obter o template para saber o nome da tabela
    const template = await this.getFormTemplate(id)
    
    if (template?.table_name) {
      // Deletar a tabela dinâmica
      if (!getSupabaseAdmin()) {
        throw new Error('Supabase admin client not available')
      }
      await getSupabaseAdmin().rpc('execute_sql', {
        sql_query: `DROP TABLE IF EXISTS ${template.table_name} CASCADE;`
      } as any)
    }

    // Deletar o template (instâncias serão deletadas em cascata)
    if (!getSupabaseAdmin()) {
      throw new Error('Supabase admin client not available')
    }
    const { error } = await getSupabaseAdmin()
      .from('form_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async duplicateFormTemplate(id: string, newName: string): Promise<string> {
    const template = await this.getFormTemplate(id)
    if (!template) throw new Error('Template não encontrado')

    const newTableName = `form_${newName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
    
    return await this.saveFormTemplate({
      name: newName,
      description: `Cópia de: ${template.description || template.name}`,
      pdf_url: template.pdf_url,
      pdf_pages: template.pdf_pages,
      fields: template.fields,
      table_name: newTableName,
      version: 1,
      is_active: true,
      created_by: template.created_by
    })
  }
}
