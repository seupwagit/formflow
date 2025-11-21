'use client'

import React from 'react'
import { FormField } from '@/lib/types'

interface AlignmentToolsProps {
  selectedFields: FormField[]
  onUpdateFields: (fields: FormField[]) => void
  disabled?: boolean
}

export default function AlignmentTools({ selectedFields, onUpdateFields, disabled = false }: AlignmentToolsProps) {
  const hasMultipleFields = selectedFields.length > 1

  // Alinhamento horizontal
  const alignLeft = () => {
    if (selectedFields.length < 2) return
    
    const leftmostX = Math.min(...selectedFields.map(f => f.position.x))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, x: leftmostX }
    }))
    
    onUpdateFields(alignedFields)
  }

  const alignRight = () => {
    if (selectedFields.length < 2) return
    
    const rightmostX = Math.max(...selectedFields.map(f => f.position.x + f.position.width))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { 
        ...field.position, 
        x: rightmostX - field.position.width 
      }
    }))
    
    onUpdateFields(alignedFields)
  }

  const alignCenterHorizontal = () => {
    if (selectedFields.length < 2) return
    
    const leftmost = Math.min(...selectedFields.map(f => f.position.x))
    const rightmost = Math.max(...selectedFields.map(f => f.position.x + f.position.width))
    const centerX = leftmost + (rightmost - leftmost) / 2
    
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { 
        ...field.position, 
        x: centerX - field.position.width / 2 
      }
    }))
    
    onUpdateFields(alignedFields)
  }

  // Alinhamento vertical
  const alignTop = () => {
    if (selectedFields.length < 2) return
    
    const topmostY = Math.min(...selectedFields.map(f => f.position.y))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, y: topmostY }
    }))
    
    onUpdateFields(alignedFields)
  }

  const alignBottom = () => {
    if (selectedFields.length < 2) return
    
    const bottommostY = Math.max(...selectedFields.map(f => f.position.y + f.position.height))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { 
        ...field.position, 
        y: bottommostY - field.position.height 
      }
    }))
    
    onUpdateFields(alignedFields)
  }

  const alignCenterVertical = () => {
    if (selectedFields.length < 2) return
    
    const topmost = Math.min(...selectedFields.map(f => f.position.y))
    const bottommost = Math.max(...selectedFields.map(f => f.position.y + f.position.height))
    const centerY = topmost + (bottommost - topmost) / 2
    
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { 
        ...field.position, 
        y: centerY - field.position.height / 2 
      }
    }))
    
    onUpdateFields(alignedFields)
  }

  // Distribuição horizontal
  const distributeHorizontally = () => {
    if (selectedFields.length < 3) return
    
    const sortedFields = [...selectedFields].sort((a, b) => a.position.x - b.position.x)
    const leftmost = sortedFields[0].position.x
    const rightmost = sortedFields[sortedFields.length - 1].position.x + sortedFields[sortedFields.length - 1].position.width
    const totalSpace = rightmost - leftmost
    const totalFieldsWidth = sortedFields.reduce((sum, field) => sum + field.position.width, 0)
    const availableSpace = totalSpace - totalFieldsWidth
    const spacing = availableSpace / (sortedFields.length - 1)
    
    let currentX = leftmost
    const distributedFields = sortedFields.map(field => {
      const newField = {
        ...field,
        position: { ...field.position, x: currentX }
      }
      currentX += field.position.width + spacing
      return newField
    })
    
    onUpdateFields(distributedFields)
  }

  // Distribuição vertical
  const distributeVertically = () => {
    if (selectedFields.length < 3) return
    
    const sortedFields = [...selectedFields].sort((a, b) => a.position.y - b.position.y)
    const topmost = sortedFields[0].position.y
    const bottommost = sortedFields[sortedFields.length - 1].position.y + sortedFields[sortedFields.length - 1].position.height
    const totalSpace = bottommost - topmost
    const totalFieldsHeight = sortedFields.reduce((sum, field) => sum + field.position.height, 0)
    const availableSpace = totalSpace - totalFieldsHeight
    const spacing = availableSpace / (sortedFields.length - 1)
    
    let currentY = topmost
    const distributedFields = sortedFields.map(field => {
      const newField = {
        ...field,
        position: { ...field.position, y: currentY }
      }
      currentY += field.position.height + spacing
      return newField
    })
    
    onUpdateFields(distributedFields)
  }

  if (selectedFields.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="text-xs font-medium text-gray-700 mb-2">
        Alinhamento ({selectedFields.length} campos)
      </div>
      
      {/* Alinhamento Horizontal */}
      <div className="flex flex-col space-y-2">
        <div className="text-xs text-gray-500 mb-1">Horizontal:</div>
        <div className="flex space-x-1">
          <button
            onClick={alignLeft}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 border border-blue-200 rounded transition-colors"
            title="Alinhar à Esquerda"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
          </button>
          
          <button
            onClick={alignCenterHorizontal}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 border border-blue-200 rounded transition-colors"
            title="Centralizar Horizontalmente"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
          </button>
          
          <button
            onClick={alignRight}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 border border-blue-200 rounded transition-colors"
            title="Alinhar à Direita"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17 4a1 1 0 01-1-1H4a1 1 0 110-2h12a1 1 0 011 1zM17 8a1 1 0 01-1-1H8a1 1 0 110-2h8a1 1 0 011 1zM17 12a1 1 0 01-1-1H4a1 1 0 110-2h12a1 1 0 011 1zM17 16a1 1 0 01-1-1H8a1 1 0 110-2h8a1 1 0 011 1z"/>
            </svg>
          </button>
        </div>
        
        {/* Alinhamento Vertical */}
        <div className="text-xs text-gray-500 mb-1 mt-2">Vertical:</div>
        <div className="flex space-x-1">
          <button
            onClick={alignTop}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-green-50 hover:bg-green-100 disabled:bg-gray-50 disabled:text-gray-400 border border-green-200 rounded transition-colors"
            title="Alinhar ao Topo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zM4 7a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM12 7a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1h-2a1 1 0 01-1-1V7z"/>
            </svg>
          </button>
          
          <button
            onClick={alignCenterVertical}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-green-50 hover:bg-green-100 disabled:bg-gray-50 disabled:text-gray-400 border border-green-200 rounded transition-colors"
            title="Centralizar Verticalmente"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM12 5a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zM4 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"/>
            </svg>
          </button>
          
          <button
            onClick={alignBottom}
            disabled={!hasMultipleFields || disabled}
            className="p-1.5 text-xs bg-green-50 hover:bg-green-100 disabled:bg-gray-50 disabled:text-gray-400 border border-green-200 rounded transition-colors"
            title="Alinhar à Base"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3zM12 7a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM3 15a1 1 0 000 2h14a1 1 0 100-2H3z"/>
            </svg>
          </button>
        </div>
        
        {/* Distribuição */}
        <div className="text-xs text-gray-500 mb-1 mt-2">Distribuir:</div>
        <div className="flex space-x-1">
          <button
            onClick={distributeHorizontally}
            disabled={selectedFields.length < 3 || disabled}
            className="p-1.5 text-xs bg-purple-50 hover:bg-purple-100 disabled:bg-gray-50 disabled:text-gray-400 border border-purple-200 rounded transition-colors"
            title="Distribuir Horizontalmente (min. 3 campos)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 5a1 1 0 011-1h1a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zM9 7a1 1 0 011-1h1a1 1 0 011 1v6a1 1 0 01-1 1h-1a1 1 0 01-1-1V7zM15 5a1 1 0 011-1h1a1 1 0 011 1v10a1 1 0 01-1 1h-1a1 1 0 01-1-1V5z"/>
            </svg>
          </button>
          
          <button
            onClick={distributeVertically}
            disabled={selectedFields.length < 3 || disabled}
            className="p-1.5 text-xs bg-purple-50 hover:bg-purple-100 disabled:bg-gray-50 disabled:text-gray-400 border border-purple-200 rounded transition-colors"
            title="Distribuir Verticalmente (min. 3 campos)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a1 1 0 01-1-1V1a1 1 0 112 0v1a1 1 0 01-1 1H5zM5 6a1 1 0 01-1-1V4a1 1 0 112 0v1a1 1 0 01-1 1H5zM15 3a1 1 0 01-1-1V1a1 1 0 112 0v1a1 1 0 01-1 1h-1zM15 6a1 1 0 01-1-1V4a1 1 0 112 0v1a1 1 0 01-1 1h-1zM5 9a1 1 0 000 2h10a1 1 0 100-2H5zM5 15a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1H5zM5 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1H5zM15 15a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1h-1zM15 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1h-1z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}