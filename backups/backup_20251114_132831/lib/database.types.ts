export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      form_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          pdf_url: string
          pdf_pages: number | null
          fields: Json
          table_name: string | null
          version: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          pdf_url: string
          pdf_pages?: number | null
          fields?: Json
          table_name?: string | null
          version?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          pdf_url?: string
          pdf_pages?: number | null
          fields?: Json
          table_name?: string | null
          version?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
      form_instances: {
        Row: {
          id: string
          template_id: string | null
          data: Json
          status: string | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          template_id?: string | null
          data?: Json
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          template_id?: string | null
          data?: Json
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
      file_uploads: {
        Row: {
          id: string
          filename: string
          original_filename: string
          file_path: string
          file_size: number
          mime_type: string
          processing_status: string | null
          ocr_results: Json | null
          detected_fields: Json | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          filename: string
          original_filename: string
          file_path: string
          file_size: number
          mime_type: string
          processing_status?: string | null
          ocr_results?: Json | null
          detected_fields?: Json | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          filename?: string
          original_filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          processing_status?: string | null
          ocr_results?: Json | null
          detected_fields?: Json | null
          created_at?: string | null
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}