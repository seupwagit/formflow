'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Play, Eye, RefreshCw } from 'lucide-react'
import { FormField } from '@/lib/types'
import { CalculatedFieldEngine } from '@/lib/calculated-field-engine'

interface CalculatedFieldDemoProps {
  onClose: () => void
}

export default function CalculatedFieldDemo({ onClose }: CalculatedFieldDemoProps) {
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'preco',
      name: 'preco',
      type: 'number',
      label: 'Preço Unitário',
      required: false,
      position: { x: 50, y: 50, width: 150, height: 35, page: 0 }
    },
    {
      id: 'quantidade',
      name: 'quantidade', 
      type: 'number',
      label: 'Quantidade',
      required: false,
      position: { x: 220, y: 50, width: 150, height: 35, page: 0 }
    },
    {
      id: 'desconto',
      name: 'desconto',
      type: 'number', 
      label: 'Desconto (%)',
      required: false,
      position: { x: 390, y: 50, width: 150, height: 35, page: 0 }
    },
    {
      id: 'subtotal',
      name: 'subtotal',
      type: 'calculated',
      label: 'Subtotal',
      required: false,
      position: { x: 50, y: 120, width: 200, height: 35, page: 0 },
      calculatedConfig: {
        formula: '{preco} * {quantidade}',
        dependencies: ['preco', 'quantidade'],
        formatType: 'currency',
        decimalPlaces: 2
      }
    },
    {
      id: 'valor_desconto',
      name: 'valor_desconto',
      type: 'calculated',
      label: 'Valor do Desconto',
      required: false,
      position: { x: 270, y: 120, width: 200, height: 35, page: 0 },
      calculatedConfig: {
        formula: '{subtotal} * ({desconto} / 100)',
        dependencies: ['subtotal', 'desconto'],
        formatType: 'currency',
        decimalPlaces: 2
      }
    }
  ])

  const [values, setValues] = useState({
    preco: 10.50,
    quantidade: 3,
    desconto: 15
  })

  const [calculatedValues, setCalculatedValues] = useState<Record<string, string>>({})
  const [engine] = useState(() => CalculatedFieldEngine.getInstance())

  // Recalcular quando valores mudarem
  useEffect(() => {
    engine.initialize(fields, values)
    const newCalculatedValues = engine.recalculateAll()
    
    const formatted: Record<string, string> = {}
    fields.forEach(field => {
      if (field.type === 'calculated' && field.calculatedConfig) {
        const value = newCalculatedValues[field.name]
        if (typeof value === 'number') {
          formatted[field.name] = engine.formatValue(value, field.calculatedConfig)
        }
      }
    })
    
    setCalculatedValues(formatted)
  }, [values, fields, engine])

  const updateValue = (fieldName: string, value: number) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold">Demonstração de Campos Calculados</h3>
              <p className="text-sm text-gray-500">Veja como os cálculos funcionam em tempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Campos de Entrada */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Campos de Entrada</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Preço Unitário
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={values.preco}
                  onChange={(e) => updateValue('preco', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📦 Quantidade
                </label>
                <input
                  type="number"
                  value={values.quantidade}
                  onChange={(e) => updateValue('quantidade', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏷️ Desconto (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={values.desconto}
                  onChange={(e) => updateValue('desconto', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Campos Calculados */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Campos Calculados (Automáticos)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Subtotal</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 mb-1">
                  {calculatedValues.subtotal || 'R$ 0,00'}
                </div>
                <div className="text-xs text-orange-600 font-mono">
                  = {values.preco} × {values.quantidade}
                </div>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Valor do Desconto</span>
                </div>
                <div className="text-2xl font-bold text-red-900 mb-1">
                  {calculatedValues.valor_desconto || 'R$ 0,00'}
                </div>
                <div className="text-xs text-red-600 font-mono">
                  = {calculatedValues.subtotal || '0'} × ({values.desconto}% ÷ 100)
                </div>
              </div>
            </div>
          </div>

          {/* Explicação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">🧮 Como Funciona</h5>
            <div className="text-sm text-blue-700 space-y-2">
              <div>• <strong>Campos Calculados</strong> são atualizados automaticamente</div>
              <div>• <strong>Fórmulas</strong> podem referenciar outros campos usando {'{nome_campo}'}</div>
              <div>• <strong>Formatação</strong> automática (moeda, porcentagem, etc.)</div>
              <div>• <strong>Dependências</strong> são resolvidas automaticamente</div>
              <div>• <strong>No PDF</strong> aparece o valor calculado final</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}