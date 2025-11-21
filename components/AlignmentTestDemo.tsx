'use client'

import { useState } from 'react'
import { FormField } from '@/lib/types'

interface AlignmentTestDemoProps {
  onClose: () => void
}

export default function AlignmentTestDemo({ onClose }: AlignmentTestDemoProps) {
  const [testFields] = useState<FormField[]>([
    {
      id: '1',
      name: 'campo_esquerda',
      type: 'text',
      label: 'Campo Esquerda',
      required: false,
      position: { x: 50, y: 100, width: 200, height: 40, page: 0 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      fontStyle: { family: 'Arial', size: 12, weight: 'normal', style: 'normal', decoration: 'none', color: '#000000' }
    },
    {
      id: '2',
      name: 'campo_centro',
      type: 'text',
      label: 'Campo Centro',
      required: false,
      position: { x: 300, y: 100, width: 200, height: 40, page: 0 },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fontStyle: { family: 'Arial', size: 12, weight: 'bold', style: 'normal', decoration: 'none', color: '#0066CC' }
    },
    {
      id: '3',
      name: 'campo_direita',
      type: 'text',
      label: 'Campo Direita',
      required: false,
      position: { x: 550, y: 100, width: 200, height: 40, page: 0 },
      alignment: { horizontal: 'right', vertical: 'middle' },
      fontStyle: { family: 'Arial', size: 12, weight: 'normal', style: 'italic', decoration: 'underline', color: '#CC0000' }
    }
  ])

  const [testData] = useState({
    campo_esquerda: 'Texto à esquerda',
    campo_centro: 'Texto centralizado',
    campo_direita: 'Texto à direita'
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Teste de Alinhamento</h3>
            <p className="text-sm text-gray-500">Verificação das configurações de alinhamento</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-medium mb-4">Configurações dos Campos de Teste:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testFields.map(field => (
                <div key={field.id} className="border rounded-lg p-4">
                  <h5 className="font-medium text-sm mb-2">{field.label}</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Alinhamento H: <span className="font-mono bg-gray-100 px-1 rounded">{field.alignment?.horizontal}</span></div>
                    <div>Alinhamento V: <span className="font-mono bg-gray-100 px-1 rounded">{field.alignment?.vertical}</span></div>
                    <div>Fonte: <span className="font-mono bg-gray-100 px-1 rounded">{field.fontStyle?.family} {field.fontStyle?.size}pt</span></div>
                    <div>Estilo: <span className="font-mono bg-gray-100 px-1 rounded">{field.fontStyle?.weight} {field.fontStyle?.style}</span></div>
                    <div>Cor: <span className="font-mono bg-gray-100 px-1 rounded">{field.fontStyle?.color}</span></div>
                    <div>Decoração: <span className="font-mono bg-gray-100 px-1 rounded">{field.fontStyle?.decoration}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-4">Preview Visual:</h4>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 relative" style={{ height: '300px' }}>
              {testFields.map(field => {
                const style: React.CSSProperties = {
                  position: 'absolute',
                  left: `${(field.position.x / 794) * 100}%`,
                  top: `${(field.position.y / 300) * 100}%`,
                  width: `${(field.position.width / 794) * 100}%`,
                  height: `${(field.position.height / 300) * 100}%`,
                  border: '1px dashed #ccc',
                  display: 'flex',
                  alignItems: field.alignment?.vertical === 'top' ? 'flex-start' : 
                           field.alignment?.vertical === 'bottom' ? 'flex-end' : 'center',
                  justifyContent: field.alignment?.horizontal === 'left' ? 'flex-start' :
                                field.alignment?.horizontal === 'right' ? 'flex-end' : 'center',
                  fontFamily: field.fontStyle?.family || 'Arial',
                  fontSize: `${(field.fontStyle?.size || 12) * 0.8}px`,
                  fontWeight: field.fontStyle?.weight || 'normal',
                  fontStyle: field.fontStyle?.style || 'normal',
                  textDecoration: field.fontStyle?.decoration || 'none',
                  color: field.fontStyle?.color || '#000000',
                  padding: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }

                return (
                  <div key={field.id} style={style}>
                    {testData[field.name as keyof typeof testData]}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Instruções:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Configure os campos no designer com diferentes alinhamentos</li>
              <li>Salve as configurações</li>
              <li>Gere o relatório PDF</li>
              <li>Verifique se o alinhamento no PDF corresponde às configurações</li>
              <li>Abra o console do navegador para ver os logs detalhados durante a geração</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}