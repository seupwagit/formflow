'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { FormField } from '@/lib/types'
import { analyzeFieldVisibility } from '@/lib/field-organizer'

interface FieldVisibilityIndicatorProps {
  fields: FormField[]
}

export default function FieldVisibilityIndicator({ fields }: FieldVisibilityIndicatorProps) {
  const [visibilityStats, setVisibilityStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    overlapping: 0
  })

  useEffect(() => {
    if (fields.length === 0) return

    const analysis = analyzeFieldVisibility(fields)
    const visible = analysis.filter(a => a.isVisible)
    const hidden = analysis.filter(a => !a.isVisible)
    const overlapping = analysis.filter(a => a.isOverlapping)

    setVisibilityStats({
      total: fields.length,
      visible: visible.length,
      hidden: hidden.length,
      overlapping: overlapping.length
    })
  }, [fields])

  if (visibilityStats.total === 0) return null

  const hasHiddenFields = visibilityStats.hidden > 0
  const hasOverlappingFields = visibilityStats.overlapping > 0

  return (
    <div className="flex items-center space-x-4 text-xs">
      {/* Campos Visíveis */}
      <div className="flex items-center space-x-1 text-green-600">
        <Eye className="h-3 w-3" />
        <span>{visibilityStats.visible} visíveis</span>
      </div>

      {/* Campos Ocultos */}
      {hasHiddenFields && (
        <div className="flex items-center space-x-1 text-red-600">
          <EyeOff className="h-3 w-3" />
          <span>{visibilityStats.hidden} ocultos</span>
        </div>
      )}

      {/* Campos Sobrepostos */}
      {hasOverlappingFields && (
        <div className="flex items-center space-x-1 text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          <span>{visibilityStats.overlapping} sobrepostos</span>
        </div>
      )}

      {/* Status Geral */}
      {hasHiddenFields || hasOverlappingFields ? (
        <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
          ⚠️ Campos precisam de reorganização
        </div>
      ) : (
        <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
          ✅ Todos os campos visíveis
        </div>
      )}
    </div>
  )
}