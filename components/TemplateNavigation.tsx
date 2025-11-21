'use client'

import { useState, useEffect } from 'react'
import { FormTemplate, Contract, Company, FormResponse, BreadcrumbItem } from '@/lib/types'
import { 
  FileText, 
  Building2, 
  Calendar, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface TemplateNavigationProps {
  template: FormTemplate
  contract: Contract
  company: Company
  responses: FormResponse[]
  onEdit: () => void
  onDelete: () => void
  onCreateResponse: () => void
  breadcrumbs: BreadcrumbItem[]
}

export default function TemplateNavigation({ 
  template, 
  contract, 
  company, 
  responses, 
  onEdit, 
  onDelete, 
  onCreateResponse,
  breadcrumbs 
}: TemplateNavigationProps) {
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>(responses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  // Filtrar respostas
  useEffect(() => {
    let filtered = responses

    if (searchTerm) {
      filtered = filtered.filter(response =>
        response.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(response => response.status === statusFilter)
    }

    setFilteredResponses(filtered)
  }, [responses, searchTerm, statusFilter, dateFilter])

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Template: {template.name}
        </h2>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onEdit}
              className="btn-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Template
            </button>
            
            <button
              onClick={onCreateResponse}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Resposta
            </button>
          </div>
          
          <button
            onClick={onDelete}
            className="btn-danger"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </button>
        </div>

        {/* Lista de respostas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Respostas ({filteredResponses.length})
          </h3>
          
          {filteredResponses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma resposta encontrada
            </p>
          ) : (
            <div className="space-y-2">
              {filteredResponses.map((response) => (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Resposta #{response.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Por: {response.submitted_by || 'Anônimo'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        response.status === 'submitted' ? 'bg-green-100 text-green-800' :
                        response.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {response.status}
                      </span>
                      
                      <Link
                        href={`/responses/${response.id}`}
                        className="btn-secondary btn-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
  