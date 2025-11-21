'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Plus,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react'
import { ContractSummary, Company } from '@/lib/types/contracts'
import { ContractService } from '@/lib/services/contract-service'
import { ResponseService } from '@/lib/services/response-service'

interface HierarchyNavigationProps {
  currentLevel?: 'company' | 'contract' | 'template' | 'response'
  currentId?: string
  className?: string
}

interface NavigationNode {
  id: string
  type: 'company' | 'contract' | 'template' | 'response'
  label: string
  href: string
  count?: number
  children?: NavigationNode[]
  isExpanded?: boolean
  metadata?: any
}

export default function HierarchyNavigation({ 
  currentLevel, 
  currentId, 
  className = '' 
}: HierarchyNavigationProps) {
  const router = useRouter()
  const [navigationTree, setNavigationTree] = useState<NavigationNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadNavigationTree()
  }, [])

  const loadNavigationTree = async () => {
    try {
      setIsLoading(true)
      
      // Carregar empresas com estatísticas
      const companies = await ContractService.getCompanies()
      const companyStats = await ContractService.getCompanyStats()
      
      const tree: NavigationNode[] = []
      
      for (const company of companies) {
        // Carregar contratos da empresa
        const contracts = await ContractService.getContractsByCompany(company.id)
        
        const companyNode: NavigationNode = {
          id: company.id,
          type: 'company',
          label: company.name,
          href: `/companies/${company.id}`,
          count: contracts.length,
          metadata: {
            document: company.document,
            status: company.status
          },
          children: [],
          isExpanded: expandedNodes.has(company.id)
        }
        
        // Adicionar contratos como filhos
        for (const contract of contracts) {
          const contractNode: NavigationNode = {
            id: contract.id,
            type: 'contract',
            label: contract.contract_number,
            href: `/contracts/${contract.id}`,
            count: contract.template_count,
            metadata: {
              title: contract.title,
              status: contract.status,
              value: contract.value
            },
            children: [],
            isExpanded: expandedNodes.has(contract.id)
          }
          
          companyNode.children!.push(contractNode)
        }
        
        tree.push(companyNode)
      }
      
      setNavigationTree(tree)
    } catch (error) {
      console.error('Erro ao carregar árvore de navegação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: NavigationNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isCurrent = currentId === node.id
    
    const getIcon = () => {
      switch (node.type) {
        case 'company':
          return <Building2 className="h-4 w-4" />
        case 'contract':
          return <FileText className="h-4 w-4" />
        case 'template':
          return <FileText className="h-4 w-4" />
        case 'response':
          return <FileText className="h-4 w-4" />
        default:
          return null
      }
    }

    const getColor = () => {
      if (isCurrent) {
        return 'bg-blue-100 text-blue-900 border-blue-200'
      }
      
      switch (node.type) {
        case 'company':
          return 'text-purple-700 hover:bg-purple-50'
        case 'contract':
          return 'text-blue-700 hover:bg-blue-50'
        case 'template':
          return 'text-green-700 hover:bg-green-50'
        case 'response':
          return 'text-orange-700 hover:bg-orange-50'
        default:
          return 'text-gray-700 hover:bg-gray-50'
      }
    }

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${getColor()}`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(node.id)}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            
            {!hasChildren && <div className="w-5" />}
            
            {getIcon()}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium truncate">{node.label}</span>
                {node.count !== undefined && (
                  <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded-full">
                    {node.count}
                  </span>
                )}
              </div>
              
              {node.metadata && (
                <div className="text-xs opacity-75 truncate">
                  {node.type === 'company' && node.metadata.document}
                  {node.type === 'contract' && node.metadata.title}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {node.metadata?.value && (
              <div className="text-xs flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {ContractService.formatCurrency(node.metadata.value)}
              </div>
            )}
            
            <button
              onClick={() => router.push(node.href)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
              title="Ver detalhes"
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Navegação Hierárquica</h3>
          <button
            onClick={() => router.push('/companies')}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Empresa</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Explore a hierarquia completa do sistema
        </p>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {navigationTree.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada</p>
            <button
              onClick={() => router.push('/companies')}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              Cadastrar primeira empresa
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {navigationTree.map(node => renderNode(node))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total: {navigationTree.length} empresa(s)</span>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="text-blue-600 hover:text-blue-800"
          >
            Recolher tudo
          </button>
        </div>
      </div>
    </div>
  )
}