'use client'

import { useEffect } from 'react'
import { FormField } from '@/lib/types'

interface AlignmentShortcutsProps {
  selectedFields: FormField[]
  onAlignLeft: () => void
  onAlignRight: () => void
  onAlignCenter: () => void
  onAlignTop: () => void
  onAlignBottom: () => void
  onAlignMiddle: () => void
  onDistributeHorizontally: () => void
  onDistributeVertically: () => void
}

export default function AlignmentShortcuts({
  selectedFields,
  onAlignLeft,
  onAlignRight,
  onAlignCenter,
  onAlignTop,
  onAlignBottom,
  onAlignMiddle,
  onDistributeHorizontally,
  onDistributeVertically
}: AlignmentShortcutsProps) {
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Só funciona se houver campos selecionados
      if (selectedFields.length < 2) return
      
      // Ignorar se estiver digitando em um input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      // Atalhos de alinhamento (Ctrl/Cmd + Shift + tecla)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'l': // Alinhar à esquerda
            event.preventDefault()
            onAlignLeft()
            break
          case 'r': // Alinhar à direita
            event.preventDefault()
            onAlignRight()
            break
          case 'c': // Centralizar horizontalmente
            event.preventDefault()
            onAlignCenter()
            break
          case 't': // Alinhar ao topo
            event.preventDefault()
            onAlignTop()
            break
          case 'b': // Alinhar à base
            event.preventDefault()
            onAlignBottom()
            break
          case 'm': // Centralizar verticalmente (middle)
            event.preventDefault()
            onAlignMiddle()
            break
          case 'h': // Distribuir horizontalmente
            if (selectedFields.length >= 3) {
              event.preventDefault()
              onDistributeHorizontally()
            }
            break
          case 'v': // Distribuir verticalmente
            if (selectedFields.length >= 3) {
              event.preventDefault()
              onDistributeVertically()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedFields, onAlignLeft, onAlignRight, onAlignCenter, onAlignTop, onAlignBottom, onAlignMiddle, onDistributeHorizontally, onDistributeVertically])

  return null // Este componente não renderiza nada, apenas escuta eventos
}