'use client'

import React from 'react'
import { Check, X, Star } from 'lucide-react'

export default function TableComparison() {
  const features = [
    {
      feature: 'Busca Global',
      oldTable: false,
      newTable: true,
      description: 'Busca em todos os campos simultaneamente'
    },
    {
      feature: 'Filtros por Coluna',
      oldTable: false,
      newTable: true,
      description: 'Filtros individuais para cada coluna'
    },
    {
      feature: 'Ordenação Múltipla',
      oldTable: false,
      newTable: true,
      description: 'Ordenar por múltiplas colunas'
    },
    {
      feature: 'Seleção Múltipla',
      oldTable: true,
      newTable: true,
      description: 'Selecionar múltiplos registros'
    },
    {
      feature: 'Ações em Lote',
      oldTable: true,
      newTable: true,
      description: 'Executar ações em múltiplos registros'
    },
    {
      feature: 'Paginação Avançada',
      oldTable: false,
      newTable: true,
      description: 'Controle completo de paginação'
    },
    {
      feature: 'Controle de Colunas',
      oldTable: false,
      newTable: true,
      description: 'Mostrar/ocultar colunas dinamicamente'
    },
    {
      feature: 'Redimensionamento',
      oldTable: false,
      newTable: true,
      description: 'Colunas com largura automática'
    },
    {
      feature: 'Performance',
      oldTable: false,
      newTable: true,
      description: 'Renderização otimizada para grandes datasets'
    },
    {
      feature: 'Acessibilidade',
      oldTable: false,
      newTable: true,
      description: 'Suporte completo a leitores de tela'
    },
    {
      feature: 'Responsividade',
      oldTable: true,
      newTable: true,
      description: 'Funciona bem em dispositivos móveis'
    },
    {
      feature: 'Exportação',
      oldTable: true,
      newTable: true,
      description: 'Exportar dados filtrados'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comparação: Tabela Antiga vs TanStack Table
        </h2>
        <p className="text-gray-600">
          Veja as melhorias implementadas com a nova biblioteca TanStack Table
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Funcionalidade
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-900">
                Tabela Antiga
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-900">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>TanStack Table</span>
                </div>
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Descrição
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {features.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {item.feature}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.oldTable ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.newTable ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">
            ❌ Limitações da Tabela Antiga
          </h3>
          <ul className="text-red-800 text-sm space-y-1">
            <li>• Busca limitada apenas por texto simples</li>
            <li>• Sem filtros por coluna individual</li>
            <li>• Ordenação básica por uma coluna</li>
            <li>• Performance ruim com muitos dados</li>
            <li>• Controles de UI limitados</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">
            ✅ Vantagens do TanStack Table
          </h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Busca inteligente em todos os campos</li>
            <li>• Filtros avançados e personalizáveis</li>
            <li>• Ordenação múltipla e complexa</li>
            <li>• Virtualização para performance</li>
            <li>• API moderna e flexível</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          🚀 Principais Melhorias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-800 text-sm">
          <div>
            <strong>Performance:</strong> Renderização otimizada com virtualização para lidar com milhares de registros sem perda de performance.
          </div>
          <div>
            <strong>Usabilidade:</strong> Interface mais intuitiva com controles visuais claros e feedback imediato para todas as ações.
          </div>
          <div>
            <strong>Flexibilidade:</strong> Configuração dinâmica de colunas, filtros personalizados e ações adaptáveis ao contexto.
          </div>
        </div>
      </div>
    </div>
  )
}