'use client'

import { useState } from 'react'
import { Database, Table, Eye } from 'lucide-react'

interface FieldNamePreviewProps {
  fieldName: string
  fieldType: string
  isValid: boolean
}

export default function FieldNamePreview({ fieldName, fieldType, isValid }: FieldNamePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getPostgreSQLType = (fieldType: string): string => {
    const typeMap: Record<string, string> = {
      text: 'VARCHAR(255)',
      textarea: 'TEXT',
      number: 'INTEGER',
      date: 'DATE',
      select: 'VARCHAR(100)',
      dynamic_list: 'INTEGER',
      checkbox: 'BOOLEAN',
      image: 'TEXT', // URL da imagem
      signature: 'TEXT' // Base64 da assinatura
    }
    return typeMap[fieldType] || 'VARCHAR(255)'
  }

  if (!fieldName || !isValid) return null

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Preview da Tabela</span>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-3 w-3" />
          <span>{showPreview ? 'Ocultar' : 'Ver SQL'}</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded p-2">
        <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
          <Table className="h-3 w-3" />
          <span>Coluna na tabela PostgreSQL:</span>
        </div>
        <div className="font-mono text-sm">
          <span className="text-blue-600">{fieldName}</span>
          <span className="text-gray-500 ml-2">{getPostgreSQLType(fieldType)}</span>
        </div>
      </div>

      {showPreview && (
        <div className="mt-3 p-2 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-x-auto">
          <div className="text-gray-400 mb-1">-- SQL que será gerado:</div>
          <div>
            ALTER TABLE formularios ADD COLUMN <span className="text-yellow-400">{fieldName}</span> <span className="text-blue-400">{getPostgreSQLType(fieldType)}</span>;
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        ✅ Nome válido para PostgreSQL • Sem conflitos • Padrão snake_case
      </div>
    </div>
  )
}