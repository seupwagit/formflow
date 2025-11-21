'use client'

import React, { useState } from 'react'
import { FileText, Eye, Settings, Palette, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { FormField } from '@/lib/types'

interface ReportFormattingDemoProps {
  onClose: () => void
}

export default function ReportFormattingDemo({ onClose }: ReportFormattingDemoProps) {
  const [demoFields, setDemoFields] = useState<FormField[]>([
    {
      id: 'demo_1',
      name: 'titulo',
      type: 'text',
      label: 'Título do Relatório',
      required: false,
      position: { x: 100, y: 50, width: 400, height: 40, page: 0 },
      fontStyle: {
        family: 'Helvetica',
        size: 18,
        weight: 'bold',
        style: 'normal',
        decoration: 'none',
        color: '#1a365d'
      },
      alignment: {
        horizontal: 'center',
        vertical: 'middle'
      }
    },
    {
      id: 'demo_2',
      name: 'nome_cliente',
      type: 'text',
      label: 'Nome do Cliente',
      required: false,
      position: { x: 50, y: 120, width: 200, height: 30, page: 0 },
      fontStyle: {
        family: 'Arial',
        size: 12,
        weight: 'normal',
        style: 'normal',
        decoration: 'none',
        color: '#2d3748'
      },
      alignment: {
        horizontal: 'left',
        vertical: 'middle'
      }
    },
    {
      id: 'demo_3',
      name: 'data_relatorio',
      type: 'date',
      label: 'Data do Relatório',
      required: false,
      position: { x: 350, y: 120, width: 150, height: 30, page: 0 },
      fontStyle: {
        family: 'Courier',
        size: 11,
        weight: 'normal',
        style: 'italic',
        decoration: 'none',
        color: '#4a5568'
      },
      alignment: {
        horizontal: 'right',
        vertical: 'middle'
      }
    },
    {
      id: 'demo_4',
      name: 'observacoes',
      type: 'textarea',
      label: 'Observações',
      required: false,
      position: { x: 50, y: 180, width: 450, height: 80, page: 0 },
      fontStyle: {
        family: 'Times',
        size: 10,
        weight: 'normal',
        style: 'normal',
        decoration: 'none',
        color: '#2b6cb0'
      },
      alignment: {
        horizontal: 'left',
        vertical: 'top'
      }
    },
    {
      id: 'demo_5',
      name: 'total',
      type: 'number',
      label: 'Valor Total',
      required: false,
      position: { x: 300, y: 300, width: 200, height: 35, page: 0 },
      fontStyle: {
        family: 'Helvetica',
        size: 14,
        weight: 'bold',
        style: 'normal',
        decoration: 'underline',
        color: '#38a169'
      },
      alignment: {
        horizontal: 'right',
        vertical: 'middle'
      }
    }
  ])

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const selectedField = demoFields.find(f => f.id === selectedFieldId)

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setDemoFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const updateFontStyle = (fieldId: string, fontUpdates: Partial<FormField['fontStyle']>) => {
    setDemoFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            fontStyle: { ...field.fontStyle!, ...fontUpdates }
          } 
        : field
    ))
  }

  const updateAlignment = (fieldId: string, alignUpdates: Partial<FormField['alignment']>) => {
    setDemoFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { 
            ...field, 
            alignment: { ...field.alignment!, ...alignUpdates }
          } 
        : field
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Demonstração de Formatação de Relatório</h3>
              <p className="text-sm text-gray-500">Configure a formatação e veja como aparece no PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Lista de Campos */}
          <div className="w-1/4 p-4 border-r overflow-y-auto">
            <h4 className="font-medium mb-3">Campos de Demonstração</h4>
            <div className="space-y-2">
              {demoFields.map(field => (
                <button
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`w-full p-3 text-left rounded border transition-colors ${
                    selectedFieldId === field.id 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{field.label}</div>
                  <div className="text-xs text-gray-500">{field.type}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {field.alignment?.horizontal} / {field.alignment?.vertical}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configurações */}
          <div className="w-1/3 p-4 border-r overflow-y-auto">
            <h4 className="font-medium mb-3">Configurações de Formatação</h4>
            
            {selectedField ? (
              <div className="space-y-4">
                {/* Alinhamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alinhamento Horizontal
                  </label>
                  <div className="flex space-x-1">
                    {(['left', 'center', 'right'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => updateAlignment(selectedField.id, { horizontal: align })}
                        className={`p-2 rounded border ${
                          selectedField.alignment?.horizontal === align
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="h-4 w-4" />}
                        {align === 'center' && <AlignCenter className="h-4 w-4" />}
                        {align === 'right' && <AlignRight className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alinhamento Vertical
                  </label>
                  <select
                    value={selectedField.alignment?.vertical || 'top'}
                    onChange={(e) => updateAlignment(selectedField.id, { 
                      vertical: e.target.value as 'top' | 'middle' | 'bottom' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="top">Topo</option>
                    <option value="middle">Meio</option>
                    <option value="bottom">Base</option>
                  </select>
                </div>

                {/* Fonte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Família da Fonte
                  </label>
                  <select
                    value={selectedField.fontStyle?.family || 'Helvetica'}
                    onChange={(e) => updateFontStyle(selectedField.id, { 
                      family: e.target.value as any 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Arial">Arial</option>
                    <option value="Times">Times</option>
                    <option value="Courier">Courier</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="72"
                      value={selectedField.fontStyle?.size || 12}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        size: parseInt(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso
                    </label>
                    <select
                      value={selectedField.fontStyle?.weight || 'normal'}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        weight: e.target.value as any 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Negrito</option>
                      <option value="lighter">Mais Leve</option>
                      <option value="bolder">Mais Pesado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo
                    </label>
                    <select
                      value={selectedField.fontStyle?.style || 'normal'}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        style: e.target.value as any 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Itálico</option>
                      <option value="oblique">Oblíquo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decoração
                    </label>
                    <select
                      value={selectedField.fontStyle?.decoration || 'none'}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        decoration: e.target.value as any 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="none">Nenhuma</option>
                      <option value="underline">Sublinhado</option>
                      <option value="overline">Sobrelinha</option>
                      <option value="line-through">Riscado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor da Fonte
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={selectedField.fontStyle?.color || '#000000'}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        color: e.target.value 
                      })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={selectedField.fontStyle?.color || '#000000'}
                      onChange={(e) => updateFontStyle(selectedField.id, { 
                        color: e.target.value 
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Selecione um campo para configurar</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="w-5/12 p-4 overflow-y-auto">
            <h4 className="font-medium mb-3">Preview do Relatório</h4>
            
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 min-h-[600px] relative">
              {/* Simular página A4 */}
              <div className="absolute inset-0 bg-gray-50 opacity-30 pointer-events-none"></div>
              
              {demoFields.map(field => (
                <div
                  key={field.id}
                  className={`absolute border-2 transition-all cursor-pointer ${
                    selectedFieldId === field.id 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={{
                    left: `${(field.position.x / 600) * 100}%`,
                    top: `${(field.position.y / 800) * 100}%`,
                    width: `${(field.position.width / 600) * 100}%`,
                    height: `${(field.position.height / 800) * 100}%`,
                    fontFamily: field.fontStyle?.family || 'Helvetica',
                    fontSize: `${(field.fontStyle?.size || 12) * 0.8}px`, // Escala para preview
                    fontWeight: field.fontStyle?.weight || 'normal',
                    fontStyle: field.fontStyle?.style || 'normal',
                    textDecoration: field.fontStyle?.decoration || 'none',
                    color: field.fontStyle?.color || '#000000',
                    textAlign: field.alignment?.horizontal || 'left',
                    display: 'flex',
                    alignItems: field.alignment?.vertical === 'middle' ? 'center' : 
                              field.alignment?.vertical === 'bottom' ? 'flex-end' : 'flex-start',
                    padding: '4px'
                  }}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  <span className="w-full">
                    {field.type === 'textarea' 
                      ? 'Este é um exemplo de texto longo que seria exibido em um campo de textarea no relatório PDF gerado.'
                      : field.type === 'date'
                      ? '2024-01-15'
                      : field.type === 'number'
                      ? 'R$ 1.234,56'
                      : `Exemplo de ${field.label}`
                    }
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">💡 Como funciona</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Configure o alinhamento e formatação dos campos</li>
                <li>• O PDF gerado respeitará exatamente essas configurações</li>
                <li>• Alinhamento horizontal: esquerda, centro, direita</li>
                <li>• Alinhamento vertical: topo, meio, base</li>
                <li>• Suporte completo a fontes, cores e decorações</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}