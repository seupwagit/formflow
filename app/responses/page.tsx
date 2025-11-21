'use client'

import React from 'react'
import HierarchicalDocumentList from '@/components/HierarchicalDocumentList'

export default function ResponsesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentos Coletados</h1>
        <p className="text-gray-600">Visualize e gerencie todos os documentos organizados hierarquicamente</p>
      </div>

      {/* Usar o componente hierárquico */}
      <HierarchicalDocumentList showHierarchy={true} />
    </div>
  )
}