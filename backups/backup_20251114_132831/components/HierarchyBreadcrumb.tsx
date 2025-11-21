'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Building2, FileText, File, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

interface HierarchyBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function HierarchyBreadcrumb({ items, className = '' }: HierarchyBreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          
          {item.href && !item.current ? (
            <Link 
              href={item.href}
              className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="truncate max-w-[200px]">{item.label}</span>
            </Link>
          ) : (
            <span 
              className={`flex items-center space-x-1 ${
                item.current ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="truncate max-w-[200px]">{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// Função utilitária para criar breadcrumbs hierárquicos
export function createHierarchyBreadcrumb(
  company?: { id: string; name: string },
  contract?: { id: string; contract_number: string; title?: string },
  template?: { id: string; name: string },
  document?: { id: string },
  currentPage?: 'companies' | 'contracts' | 'templates' | 'documents' | 'responses'
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = []

  // Adicionar empresa se existir
  if (company) {
    items.push({
      label: company.name,
      href: currentPage !== 'companies' ? `/companies/${company.id}` : undefined,
      icon: <Building2 className="h-4 w-4 text-purple-600" />,
      current: currentPage === 'companies'
    })
  }

  // Adicionar contrato se existir
  if (contract) {
    items.push({
      label: contract.contract_number,
      href: currentPage !== 'contracts' ? `/contracts/${contract.id}` : undefined,
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      current: currentPage === 'contracts'
    })
  }

  // Adicionar template se existir
  if (template) {
    items.push({
      label: template.name,
      href: currentPage !== 'templates' ? `/templates/${template.id}` : undefined,
      icon: <File className="h-4 w-4 text-green-600" />,
      current: currentPage === 'templates'
    })
  }

  // Adicionar documento se existir
  if (document) {
    items.push({
      label: `Documento #${document.id.slice(-8)}`,
      href: currentPage !== 'documents' ? `/responses/${document.id}` : undefined,
      icon: <FileText className="h-4 w-4 text-orange-600" />,
      current: currentPage === 'documents' || currentPage === 'responses'
    })
  }

  return items
}

// Componente específico para navegação hierárquica de documentos
interface DocumentHierarchyNavigationProps {
  company?: { id: string; name: string }
  contract?: { id: string; contract_number: string; title?: string }
  template?: { id: string; name: string }
  document?: { id: string }
  currentPage?: 'companies' | 'contracts' | 'templates' | 'documents' | 'responses'
  showActions?: boolean
  onNavigate?: (type: 'company' | 'contract' | 'template', id: string) => void
}

export function DocumentHierarchyNavigation({
  company,
  contract,
  template,
  document,
  currentPage,
  showActions = true,
  onNavigate
}: DocumentHierarchyNavigationProps) {
  const breadcrumbItems = createHierarchyBreadcrumb(company, contract, template, document, currentPage)

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <HierarchyBreadcrumb items={breadcrumbItems} />
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {company && (
              <button
                onClick={() => onNavigate?.('company', company.id)}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Ver Empresa
              </button>
            )}
            
            {contract && (
              <button
                onClick={() => onNavigate?.('contract', contract.id)}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                <FileText className="h-3 w-3 mr-1" />
                Ver Contrato
              </button>
            )}
            
            {template && (
              <button
                onClick={() => onNavigate?.('template', template.id)}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
              >
                <File className="h-3 w-3 mr-1" />
                Ver Template
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Informações contextuais */}
      {(company || contract || template) && (
        <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
          {company && (
            <div className="flex items-center space-x-1">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Empresa:</span>
              <span>{company.name}</span>
            </div>
          )}
          
          {contract && (
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Contrato:</span>
              <span>{contract.contract_number}</span>
              {contract.title && <span className="text-gray-500">• {contract.title}</span>}
            </div>
          )}
          
          {template && (
            <div className="flex items-center space-x-1">
              <File className="h-4 w-4 text-green-600" />
              <span className="font-medium">Template:</span>
              <span>{template.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}