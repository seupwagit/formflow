'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, Type, Hash, Calendar, CheckSquare, List, AlignLeft, Table, Calculator, Database } from 'lucide-react'

interface AddFieldMenuProps {
  onAddField: (type: string) => void
  disabled?: boolean
}

export default function AddFieldMenu({ onAddField, disabled = false }: AddFieldMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fieldTypes = [
    { type: 'text', label: 'Texto', icon: Type, description: 'Campo de texto simples' },
    { type: 'number', label: 'Número', icon: Hash, description: 'Campo numérico' },
    { type: 'date', label: 'Data', icon: Calendar, description: 'Seletor de data' },
    { type: 'select', label: 'Select', icon: List, description: 'Lista de opções' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Caixa de seleção' },
    { type: 'textarea', label: 'Área de Texto', icon: AlignLeft, description: 'Texto multilinha' },
    { type: 'calculated', label: 'Calculado', icon: Calculator, description: 'Campo com fórmula' },
    { type: 'dynamic_list', label: 'Lista Dinâmica', icon: Database, description: 'Lista do banco de dados' },
    { type: 'table', label: 'Tabela', icon: Table, description: 'Tabela de dados' },
  ]

  const handleSelect = (type: string) => {
    onAddField(type)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Adicionar Campo"
      >
        <Plus className="h-4 w-4" />
        <span>Adicionar Campo</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
              Selecione o tipo de campo
            </div>
            {fieldTypes.map((fieldType) => {
              const Icon = fieldType.icon
              return (
                <button
                  key={fieldType.type}
                  onClick={() => handleSelect(fieldType.type)}
                  className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                >
                  <Icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {fieldType.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fieldType.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
