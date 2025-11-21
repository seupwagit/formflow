'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'
import { Download, FileText, Code, Database, X } from 'lucide-react'

interface ExportDialogProps {
  fields: FormField[]
  templateName: string
  onClose: () => void
}

export default function ExportDialog({ fields, templateName, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'sql' | 'typescript' | 'html'>('json')
  const [isExporting, setIsExporting] = useState(false)

  const exportFormats = [
    {
      id: 'json' as const,
      name: 'JSON',
      description: 'Estrutura dos campos em formato JSON',
      icon: <FileText className="h-5 w-5" />,
      extension: '.json'
    },
    {
      id: 'sql' as const,
      name: 'SQL',
      description: 'Script SQL para criar tabela no banco',
      icon: <Database className="h-5 w-5" />,
      extension: '.sql'
    },
    {
      id: 'typescript' as const,
      name: 'TypeScript',
      description: 'Tipos TypeScript para o formulário',
      icon: <Code className="h-5 w-5" />,
      extension: '.ts'
    },
    {
      id: 'html' as const,
      name: 'HTML',
      description: 'Formulário HTML básico',
      icon: <FileText className="h-5 w-5" />,
      extension: '.html'
    }
  ]

  const generateJSON = () => {
    return JSON.stringify({
      name: templateName,
      fields: fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        label: field.label,
        required: field.required,
        position: field.position,
        validation: field.validation,
        options: field.options,
        placeholder: field.placeholder,
        helpText: field.helpText
      }))
    }, null, 2)
  }

  const generateSQL = () => {
    const tableName = `form_${templateName.toLowerCase().replace(/\s+/g, '_')}`
    
    let sql = `-- Tabela para o formulário: ${templateName}\n`
    sql += `CREATE TABLE ${tableName} (\n`
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
    sql += `  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`
    sql += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n`
    
    fields.forEach(field => {
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
        default:
          sqlType = 'VARCHAR(255)'
      }
      
      const nullable = field.required ? ' NOT NULL' : ''
      sql += `  ${field.name} ${sqlType}${nullable},\n`
    })
    
    sql += `  status VARCHAR(20) DEFAULT 'draft',\n`
    sql += `  submitted_by UUID REFERENCES auth.users(id)\n`
    sql += `);\n\n`
    
    sql += `-- Índices\n`
    sql += `CREATE INDEX idx_${tableName}_status ON ${tableName}(status);\n`
    sql += `CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);\n\n`
    
    sql += `-- RLS (Row Level Security)\n`
    sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`
    
    sql += `-- Políticas de segurança\n`
    sql += `CREATE POLICY "Users can view their own records" ON ${tableName}\n`
    sql += `  FOR SELECT USING (auth.uid() = submitted_by);\n\n`
    
    sql += `CREATE POLICY "Users can insert their own records" ON ${tableName}\n`
    sql += `  FOR INSERT WITH CHECK (auth.uid() = submitted_by);\n\n`
    
    sql += `CREATE POLICY "Users can update their own records" ON ${tableName}\n`
    sql += `  FOR UPDATE USING (auth.uid() = submitted_by);`
    
    return sql
  }

  const generateTypeScript = () => {
    const interfaceName = templateName.replace(/\s+/g, '') + 'Form'
    
    let ts = `// Tipos TypeScript para o formulário: ${templateName}\n\n`
    
    ts += `export interface ${interfaceName} {\n`
    ts += `  id?: string\n`
    ts += `  created_at?: string\n`
    ts += `  updated_at?: string\n`
    
    fields.forEach(field => {
      let tsType = 'string'
      
      switch (field.type) {
        case 'number':
          tsType = 'number'
          break
        case 'date':
          tsType = 'string' // ISO date string
          break
        case 'checkbox':
          tsType = 'boolean'
          break
        case 'select':
          if (field.options && field.options.length > 0) {
            tsType = field.options.map(opt => `'${opt}'`).join(' | ')
          }
          break
      }
      
      const optional = field.required ? '' : '?'
      ts += `  ${field.name}${optional}: ${tsType}\n`
    })
    
    ts += `  status?: 'draft' | 'completed' | 'reviewed'\n`
    ts += `  submitted_by?: string\n`
    ts += `}\n\n`
    
    ts += `export const ${interfaceName}Schema = {\n`
    fields.forEach(field => {
      ts += `  ${field.name}: {\n`
      ts += `    type: '${field.type}',\n`
      ts += `    label: '${field.label}',\n`
      ts += `    required: ${field.required},\n`
      if (field.validation) {
        ts += `    validation: ${JSON.stringify(field.validation)},\n`
      }
      if (field.options) {
        ts += `    options: ${JSON.stringify(field.options)},\n`
      }
      ts += `  },\n`
    })
    ts += `}`
    
    return ts
  }

  const generateHTML = () => {
    let html = `<!DOCTYPE html>\n`
    html += `<html lang="pt-BR">\n`
    html += `<head>\n`
    html += `  <meta charset="UTF-8">\n`
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`
    html += `  <title>${templateName}</title>\n`
    html += `  <style>\n`
    html += `    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n`
    html += `    .form-group { margin-bottom: 15px; }\n`
    html += `    label { display: block; margin-bottom: 5px; font-weight: bold; }\n`
    html += `    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n`
    html += `    .required { color: red; }\n`
    html += `    .help-text { font-size: 12px; color: #666; margin-top: 2px; }\n`
    html += `    button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }\n`
    html += `  </style>\n`
    html += `</head>\n`
    html += `<body>\n`
    html += `  <h1>${templateName}</h1>\n`
    html += `  <form id="form" method="POST">\n`
    
    fields.forEach(field => {
      html += `    <div class="form-group">\n`
      html += `      <label for="${field.name}">\n`
      html += `        ${field.label}\n`
      if (field.required) {
        html += `        <span class="required">*</span>\n`
      }
      html += `      </label>\n`
      
      switch (field.type) {
        case 'textarea':
          html += `      <textarea id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}`
          if (field.placeholder) html += ` placeholder="${field.placeholder}"`
          html += `></textarea>\n`
          break
          
        case 'select':
          html += `      <select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>\n`
          html += `        <option value="">Selecione...</option>\n`
          if (field.options) {
            field.options.forEach(option => {
              html += `        <option value="${option}">${option}</option>\n`
            })
          }
          html += `      </select>\n`
          break
          
        case 'checkbox':
          html += `      <input type="checkbox" id="${field.name}" name="${field.name}" value="true">\n`
          break
          
        default:
          html += `      <input type="${field.type}" id="${field.name}" name="${field.name}"`
          if (field.required) html += ` required`
          if (field.placeholder) html += ` placeholder="${field.placeholder}"`
          if (field.validation?.min !== undefined) html += ` min="${field.validation.min}"`
          if (field.validation?.max !== undefined) html += ` max="${field.validation.max}"`
          if (field.validation?.maxLength) html += ` maxlength="${field.validation.maxLength}"`
          html += `>\n`
      }
      
      if (field.helpText) {
        html += `      <div class="help-text">${field.helpText}</div>\n`
      }
      
      html += `    </div>\n`
    })
    
    html += `    <button type="submit">Enviar</button>\n`
    html += `  </form>\n`
    html += `</body>\n`
    html += `</html>`
    
    return html
  }

  const getExportContent = () => {
    switch (selectedFormat) {
      case 'json':
        return generateJSON()
      case 'sql':
        return generateSQL()
      case 'typescript':
        return generateTypeScript()
      case 'html':
        return generateHTML()
      default:
        return ''
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const content = getExportContent()
      const format = exportFormats.find(f => f.id === selectedFormat)!
      const filename = `${templateName.toLowerCase().replace(/\s+/g, '_')}_form${format.extension}`
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao exportar:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Download className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Exportar Formulário</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seleção de Formato */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Selecione o formato de exportação:</h4>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedFormat === format.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {format.icon}
                    <span className="font-medium">{format.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Preview:</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {getExportContent().substring(0, 1000)}
                {getExportContent().length > 1000 && '...'}
              </pre>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Informações do Export:</p>
                <ul className="space-y-1">
                  <li>• {fields.length} campos serão exportados</li>
                  <li>• Formato: {exportFormats.find(f => f.id === selectedFormat)?.name}</li>
                  <li>• Nome do arquivo: {templateName.toLowerCase().replace(/\s+/g, '_')}_form{exportFormats.find(f => f.id === selectedFormat)?.extension}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary disabled:opacity-50"
          >
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  )
}