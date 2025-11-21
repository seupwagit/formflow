'use client'

import { useState, useMemo } from 'react'
import { FormField } from '@/lib/types'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  Users, 
  Calendar,
  Hash,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface TreeNode {
  id: string
  label: string
  type: 'group' | 'item'
  children?: TreeNode[]
  data?: any
  count?: number
  expanded?: boolean
}

interface TreeViewProps {
  responses: any[]
  fields: FormField[]
  groupBy: string[]
  onItemAction: (action: 'view' | 'edit' | 'delete', item: any) => void
}

export default function TreeView({ responses, fields, groupBy, onItemAction }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Construir árvore baseada nos agrupamentos
  const treeData = useMemo(() => {
    if (groupBy.length === 0) {
      return responses.map(response => ({
        id: response.id,
        label: `Resposta ${response.id.substring(0, 8)}`,
        type: 'item' as const,
        data: response
      }))
    }

    const buildTree = (items: any[], groupFields: string[], level = 0): TreeNode[] => {
      if (level >= groupFields.length) {
        return items.map(item => ({
          id: item.id,
          label: `Resposta ${item.id.substring(0, 8)}`,
          type: 'item' as const,
          data: item
        }))
      }

      const currentField = groupFields[level]
      const groups = new Map<string, any[]>()

      items.forEach(item => {
        let groupValue: string

        if (currentField === 'status') {
          groupValue = item.status || 'Sem status'
        } else if (currentField === 'created_date') {
          const date = new Date(item.created_at)
          groupValue = date.toLocaleDateString('pt-BR')
        } else if (currentField === 'created_month') {
          const date = new Date(item.created_at)
          groupValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else if (currentField === 'created_year') {
          const date = new Date(item.created_at)
          groupValue = String(date.getFullYear())
        } else {
          // Campo personalizado
          groupValue = String(item.response_data?.[currentField] || 'Sem valor')
        }

        if (!groups.has(groupValue)) {
          groups.set(groupValue, [])
        }
        groups.get(groupValue)!.push(item)
      })

      return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupValue, groupItems]) => ({
          id: `${currentField}-${groupValue}-${level}`,
          label: getGroupLabel(currentField, groupValue),
          type: 'group' as const,
          count: groupItems.length,
          children: buildTree(groupItems, groupFields, level + 1),
          expanded: expandedNodes.has(`${currentField}-${groupValue}-${level}`)
        }))
    }

    return buildTree(responses, groupBy)
  }, [responses, groupBy, expandedNodes])

  const getGroupLabel = (field: string, value: string): string => {
    switch (field) {
      case 'status':
        const statusLabels: {[key: string]: string} = {
          'draft': 'Rascunhos',
          'submitted': 'Enviados',
          'reviewed': 'Revisados',
          'approved': 'Aprovados'
        }
        return statusLabels[value] || value
      case 'created_date':
        return `Data: ${value}`
      case 'created_month':
        const [year, month] = value.split('-')
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
        return `${monthNames[parseInt(month) - 1]} ${year}`
      case 'created_year':
        return `Ano: ${value}`
      default:
        const field_obj = fields.find(f => f.name === field)
        return `${field_obj?.label || field}: ${value}`
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const expandAll = () => {
    const allNodeIds = new Set<string>()
    
    const collectNodeIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'group') {
          allNodeIds.add(node.id)
          if (node.children) {
            collectNodeIds(node.children)
          }
        }
      })
    }
    
    collectNodeIds(treeData)
    setExpandedNodes(allNodeIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const getNodeIcon = (node: TreeNode) => {
    if (node.type === 'item') {
      return <FileText className="h-4 w-4 text-blue-500" />
    }
    
    return node.expanded ? 
      <FolderOpen className="h-4 w-4 text-yellow-500" /> : 
      <Folder className="h-4 w-4 text-yellow-600" />
  }

  const renderNode = (node: TreeNode, level = 0) => {
    const isExpanded = node.type === 'group' && node.expanded

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer ${
            level > 0 ? 'ml-' + (level * 4) : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => node.type === 'group' && toggleNode(node.id)}
        >
          {/* Expand/Collapse Icon */}
          {node.type === 'group' && (
            <div className="mr-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}

          {/* Node Icon */}
          <div className="mr-3">
            {getNodeIcon(node)}
          </div>

          {/* Label */}
          <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${
              node.type === 'group' ? 'font-medium text-gray-900' : 'text-gray-700'
            }`}>
              {node.label}
            </span>

            {/* Count Badge */}
            {node.type === 'group' && node.count !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                {node.count}
              </span>
            )}

            {/* Actions for items */}
            {node.type === 'item' && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemAction('view', node.data)
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="Visualizar"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemAction('edit', node.data)
                  }}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                  title="Editar"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemAction('delete', node.data)
                  }}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {node.type === 'group' && isExpanded && node.children && (
          <div className="group">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (treeData.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
        <p className="text-sm text-gray-500">
          Não há respostas que correspondam aos filtros aplicados
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">
              Visualização em Árvore
            </h3>
            <span className="text-xs text-gray-500">
              ({responses.length} registros)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              Expandir Tudo
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {treeData.map(node => renderNode(node))}
        </div>
      </div>
    </div>
  )
}