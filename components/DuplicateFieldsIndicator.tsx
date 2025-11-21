'use client'

import React, { useEffect, useState } from 'react'
import { FormField } from '@/lib/types'

interface DuplicateFieldsIndicatorProps {
  fields: FormField[]
  onFixDuplicates?: () => void
  onRegenerateAll?: () => void
}

export default function DuplicateFieldsIndicator({ 
  fields, 
  onFixDuplicates, 
  onRegenerateAll 
}: DuplicateFieldsIndicatorProps) {
  const [duplicateInfo, setDuplicateInfo] = useState<{
    duplicateIds: string[]
    duplicateNames: string[]
    totalDuplicates: number
  }>({ duplicateIds: [], duplicateNames: [], totalDuplicates: 0 })

  useEffect(() => {
    // Detectar IDs duplicados
    const idCounts = new Map<string, number>()
    const nameCounts = new Map<string, number>()
    
    fields.forEach(field => {
      idCounts.set(field.id, (idCounts.get(field.id) || 0) + 1)
      nameCounts.set(field.name, (nameCounts.get(field.name) || 0) + 1)
    })
    
    const duplicateIds = Array.from(idCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([id, _]) => id)
    
    const duplicateNames = Array.from(nameCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, _]) => name)
    
    setDuplicateInfo({
      duplicateIds,
      duplicateNames,
      totalDuplicates: duplicateIds.length + duplicateNames.length
    })
  }, [fields])

  if (duplicateInfo.totalDuplicates === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium">Campos Únicos</div>
            <div className="text-sm">Todos os {fields.length} campos têm IDs únicos</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 text-red-700">
          <svg className="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <div className="font-medium">Campos Duplicados Detectados</div>
            <div className="text-sm">
              {duplicateInfo.duplicateIds.length > 0 && (
                <div>• {duplicateInfo.duplicateIds.length} IDs duplicados</div>
              )}
              {duplicateInfo.duplicateNames.length > 0 && (
                <div>• {duplicateInfo.duplicateNames.length} nomes duplicados</div>
              )}
              <div className="mt-1 text-red-600">
                ⚠️ Campos duplicados causam comportamento espelhado
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {onFixDuplicates && (
            <button
              onClick={onFixDuplicates}
              className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs rounded-md border border-yellow-300 transition-colors"
              title="Corrigir apenas campos duplicados"
            >
              Corrigir
            </button>
          )}
          {onRegenerateAll && (
            <button
              onClick={onRegenerateAll}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs rounded-md border border-red-300 transition-colors"
              title="Regenerar todos os IDs"
            >
              Regenerar Todos
            </button>
          )}
        </div>
      </div>
      
      {/* Detalhes dos duplicados */}
      {duplicateInfo.duplicateIds.length > 0 && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs">
          <div className="font-medium text-red-800 mb-1">IDs Duplicados:</div>
          <div className="text-red-700">
            {duplicateInfo.duplicateIds.slice(0, 3).map(id => (
              <div key={id}>• "{id}"</div>
            ))}
            {duplicateInfo.duplicateIds.length > 3 && (
              <div>• ... e mais {duplicateInfo.duplicateIds.length - 3}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}