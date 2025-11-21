'use client'

import React, { useState } from 'react'

export default function AlignmentGuide() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
        title="Como usar as ferramentas de alinhamento"
      >
        ❓ Como alinhar campos
      </button>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-blue-900">🎯 Guia de Alinhamento</div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-blue-700">
        <div>
          <strong>1. Seleção Múltipla:</strong>
          <div className="ml-2">• Segure Ctrl/Cmd e clique nos campos</div>
          <div className="ml-2">• Ou arraste para selecionar área</div>
        </div>
        
        <div>
          <strong>2. Alinhamento:</strong>
          <div className="ml-2">• Use os botões ou atalhos Ctrl+Shift+tecla</div>
          <div className="ml-2">• L=Esquerda, R=Direita, C=Centro</div>
          <div className="ml-2">• T=Topo, B=Base, M=Meio</div>
        </div>
        
        <div>
          <strong>3. Distribuição:</strong>
          <div className="ml-2">• Precisa de 3+ campos selecionados</div>
          <div className="ml-2">• H=Horizontal, V=Vertical</div>
        </div>
        
        <div className="text-blue-600 text-xs mt-2">
          💡 Dica: Selecione campos similares (ex: labels) para alinhamento profissional!
        </div>
      </div>
    </div>
  )
}