'use client'

import React from 'react'
import TanStackDataGrid from './TanStackDataGrid'
import TableComparison from './TableComparison'
import { FormField } from '@/lib/types'

// Dados de exemplo
const mockResponses = [
  {
    id: 'resp_001',
    status: 'submitted',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    response_data: {
      nome_completo: 'João Silva Santos',
      email: 'joao.silva@email.com',
      telefone: '(11) 99999-9999',
      data_nascimento: '1985-03-15',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      profissao: 'Engenheiro de Software',
      salario: 8500.00,
      tem_experiencia: true,
      observacoes: 'Candidato com excelente perfil técnico e boa comunicação.'
    }
  },
  {
    id: 'resp_002',
    status: 'draft',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T15:45:00Z',
    response_data: {
      nome_completo: 'Maria Oliveira Costa',
      email: 'maria.oliveira@email.com',
      telefone: '(21) 88888-8888',
      data_nascimento: '1990-07-22',
      endereco: 'Av. Copacabana, 456 - Rio de Janeiro/RJ',
      profissao: 'Designer UX/UI',
      salario: 6200.00,
      tem_experiencia: true,
      observacoes: 'Portfolio impressionante com projetos de grande escala.'
    }
  },
  {
    id: 'resp_003',
    status: 'reviewed',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T16:30:00Z',
    response_data: {
      nome_completo: 'Pedro Henrique Almeida',
      email: 'pedro.almeida@email.com',
      telefone: '(31) 77777-7777',
      data_nascimento: '1988-12-03',
      endereco: 'Rua da Liberdade, 789 - Belo Horizonte/MG',
      profissao: 'Analista de Dados',
      salario: 7300.00,
      tem_experiencia: false,
      observacoes: 'Recém formado, mas com muito potencial e vontade de aprender.'
    }
  },
  {
    id: 'resp_004',
    status: 'submitted',
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-01-18T11:45:00Z',
    response_data: {
      nome_completo: 'Ana Carolina Ferreira',
      email: 'ana.ferreira@email.com',
      telefone: '(85) 66666-6666',
      data_nascimento: '1992-05-18',
      endereco: 'Rua do Sol, 321 - Fortaleza/CE',
      profissao: 'Gerente de Projetos',
      salario: 9200.00,
      tem_experiencia: true,
      observacoes: 'Liderança natural com certificações PMP e Scrum Master.'
    }
  },
  {
    id: 'resp_005',
    status: 'draft',
    created_at: '2024-01-19T16:20:00Z',
    updated_at: '2024-01-19T17:10:00Z',
    response_data: {
      nome_completo: 'Carlos Eduardo Lima',
      email: 'carlos.lima@email.com',
      telefone: '(47) 55555-5555',
      data_nascimento: '1987-09-25',
      endereco: 'Av. Beira Mar, 654 - Florianópolis/SC',
      profissao: 'Desenvolvedor Full Stack',
      salario: 7800.00,
      tem_experiencia: true,
      observacoes: 'Especialista em React, Node.js e arquitetura de microsserviços.'
    }
  }
]

// Campos de exemplo
const mockFields: FormField[] = [
  {
    id: 'nome_completo',
    name: 'nome_completo',
    type: 'text',
    label: 'Nome Completo',
    required: true,
    position: { x: 0, y: 0, width: 200, height: 30, page: 0 }
  },
  {
    id: 'email',
    name: 'email',
    type: 'text',
    label: 'E-mail',
    required: true,
    position: { x: 0, y: 40, width: 200, height: 30, page: 0 }
  },
  {
    id: 'telefone',
    name: 'telefone',
    type: 'text',
    label: 'Telefone',
    required: false,
    position: { x: 0, y: 80, width: 150, height: 30, page: 0 }
  },
  {
    id: 'data_nascimento',
    name: 'data_nascimento',
    type: 'date',
    label: 'Data de Nascimento',
    required: true,
    position: { x: 0, y: 120, width: 120, height: 30, page: 0 }
  },
  {
    id: 'endereco',
    name: 'endereco',
    type: 'textarea',
    label: 'Endereço',
    required: false,
    position: { x: 0, y: 160, width: 300, height: 60, page: 0 }
  },
  {
    id: 'profissao',
    name: 'profissao',
    type: 'text',
    label: 'Profissão',
    required: true,
    position: { x: 0, y: 230, width: 200, height: 30, page: 0 }
  },
  {
    id: 'salario',
    name: 'salario',
    type: 'number',
    label: 'Salário Pretendido',
    required: false,
    position: { x: 0, y: 270, width: 150, height: 30, page: 0 }
  },
  {
    id: 'tem_experiencia',
    name: 'tem_experiencia',
    type: 'checkbox',
    label: 'Tem Experiência',
    required: false,
    position: { x: 0, y: 310, width: 20, height: 20, page: 0 }
  },
  {
    id: 'observacoes',
    name: 'observacoes',
    type: 'textarea',
    label: 'Observações',
    required: false,
    position: { x: 0, y: 350, width: 400, height: 80, page: 0 }
  }
]

export default function TanStackDemo() {
  const handleItemAction = (action: 'view' | 'edit' | 'delete', item: any) => {
    console.log(`Ação: ${action}`, item)
    
    switch (action) {
      case 'view':
        alert(`Visualizando: ${item.response_data.nome_completo}`)
        break
      case 'edit':
        alert(`Editando: ${item.response_data.nome_completo}`)
        break
      case 'delete':
        if (confirm(`Excluir registro de ${item.response_data.nome_completo}?`)) {
          console.log('Excluindo item:', item.id)
        }
        break
    }
  }

  const handleBulkAction = (action: string, items: any[]) => {
    console.log(`Ação em lote: ${action}`, items)
    
    switch (action) {
      case 'delete':
        if (confirm(`Excluir ${items.length} registro(s) selecionado(s)?`)) {
          console.log('Excluindo itens:', items.map(item => item.id))
        }
        break
      case 'export':
        console.log('Exportando itens:', items)
        alert(`Exportando ${items.length} registro(s)`)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TanStack Table Demo
          </h1>
          <p className="text-gray-600">
            Demonstração da nova grid com TanStack Table - Filtros avançados, ordenação, 
            seleção múltipla, paginação e ações em lote.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Funcionalidades Implementadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">🔍 Busca e Filtros</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Busca global em todos os campos</li>
                <li>• Filtros por coluna individual</li>
                <li>• Filtro por status</li>
                <li>• Limpeza rápida de filtros</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">📊 Ordenação e Visualização</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Ordenação por qualquer coluna</li>
                <li>• Indicadores visuais de ordenação</li>
                <li>• Controle de visibilidade de colunas</li>
                <li>• Redimensionamento automático</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">⚡ Ações e Seleção</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Seleção múltipla com checkboxes</li>
                <li>• Ações individuais (ver, editar, excluir)</li>
                <li>• Ações em lote</li>
                <li>• Exportação de dados</li>
              </ul>
            </div>
          </div>
        </div>

        <TanStackDataGrid
          responses={mockResponses}
          fields={mockFields}
          onItemAction={handleItemAction}
          onBulkAction={handleBulkAction}
        />

        <div className="mt-8">
          <TableComparison />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💡 Como Usar
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p><strong>Busca Global:</strong> Digite na caixa de busca para filtrar todos os campos</p>
            <p><strong>Filtros:</strong> Clique em "Filtros" para filtrar por status ou campos específicos</p>
            <p><strong>Ordenação:</strong> Clique nos cabeçalhos das colunas para ordenar</p>
            <p><strong>Seleção:</strong> Use os checkboxes para selecionar múltiplos registros</p>
            <p><strong>Colunas:</strong> Clique em "Colunas" para mostrar/ocultar colunas</p>
            <p><strong>Ações:</strong> Use os botões de ação para visualizar, editar ou excluir registros</p>
          </div>
        </div>
      </div>
    </div>
  )
}