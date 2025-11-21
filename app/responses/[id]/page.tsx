'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  FileText, 
  Building2, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  Edit, 
  Download, 
  ArrowLeft,
  Eye,
  AlertCircle
} from 'lucide-react'
import { FormResponse } from '@/lib/types/contracts'
import { supabase } from '@/lib/supabase'
import { DocumentHierarchyNavigation } from '@/components/HierarchyBreadcrumb'

interface ResponseWithFullHierarchy extends Omit<FormResponse, 'template'> {
  template?: {
    id: string
    name: string
    contract?: {
      id: string
      contract_number: string
      title: string
      company?: {
        id: string
        name: string
        document: string
        document_type: 'CNPJ' | 'CPF'
      }
    }
  }
}

export default function ResponseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const responseId = params.id as string

  const [response, setResponse] = useState<ResponseWithFullHierarchy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (responseId) {
      loadResponse()
    }
  }, [responseId])

  const loadResponse = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('form_responses')
        .select(`
          *,
          template:form_templates(
            id, name,
            contract:contracts(
              id, contract_number, title,
              company:companies(id, name, document, document_type)
            )
          )
        `)
        .eq('id', responseId)
        .single()

      if (error) {
        console.error('Erro ao carregar resposta:', error)
        setError('Documento não encontrado')
        return
      }

      setResponse(data)
      console.log('✅ Resposta carregada:', data)
    } catch (error) {
      console.error('Erro ao carregar resposta:', error)
      setError('Erro ao carregar documento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigate = (type: 'company' | 'contract' | 'template', id: string) => {
    const routes = {
      company: `/companies/${id}`,
      contract: `/contracts/${id}`,
      template: `/templates/${id}`
    }
    router.push(routes[type])
  }

  const handleEdit = () => {
    if (response?.template_id) {
      router.push(`/fill-form?template=${response.template_id}&response=${response.id}`)
    }
  }

  const handleDownload = () => {
    if (!response) return
    
    const dataStr = JSON.stringify({
      id: response.id,
      template: response.template?.name,
      contract: response.template?.contract?.contract_number,
      company: response.template?.contract?.company?.name,
      status: response.status,
      created_at: response.created_at,
      submitted_at: response.submitted_at,
      response_data: response.response_data
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `documento-${response.id.slice(-8)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reviewed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho'
      case 'submitted': return 'Enviado'
      case 'reviewed': return 'Revisado'
      case 'approved': return 'Aprovado'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />
      case 'submitted': return <Eye className="h-4 w-4" />
      case 'reviewed': return <CheckCircle className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !response) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Documento não encontrado'}
            </h3>
            <button
              onClick={() => router.push('/responses')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar aos Documentos</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegação Hierárquica */}
      <DocumentHierarchyNavigation
        company={response.template?.contract?.company}
        contract={response.template?.contract}
        template={response.template}
        document={{ id: response.id }}
        currentPage="responses"
        onNavigate={handleNavigate}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Documento #{response.id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                {response.template?.name || 'Template não encontrado'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(response.status)}`}>
              {getStatusIcon(response.status)}
              <span className="ml-2">{getStatusLabel(response.status)}</span>
            </span>
            
            <button
              onClick={handleEdit}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Documento */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadados */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Documento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID do Documento
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{response.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <p className="text-sm text-gray-900">{response.template?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Criação
                  </label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(response.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                
                {response.submitted_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Envio
                    </label>
                    <div className="flex items-center text-sm text-gray-900">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {new Date(response.submitted_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
                
                {response.reviewed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Revisão
                    </label>
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="h-4 w-4 mr-2 text-purple-500" />
                      {new Date(response.reviewed_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dados do Formulário */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Coletados</h2>
              
              {response.response_data && Object.keys(response.response_data).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(response.response_data).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <div className="text-sm text-gray-900">
                        {typeof value === 'object' ? (
                          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          <p className="break-words">{String(value)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum dado foi coletado ainda</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Contexto Hierárquico */}
          <div className="space-y-6">
            {/* Informações da Empresa */}
            {response.template?.contract?.company && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                  Empresa
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {response.template.contract.company.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {response.template.contract.company.document_type}: {response.template.contract.company.document}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigate('company', response.template!.contract!.company!.id)}
                    className="w-full text-left px-3 py-2 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    Ver detalhes da empresa →
                  </button>
                </div>
              </div>
            )}

            {/* Informações do Contrato */}
            {response.template?.contract && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Contrato
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {response.template.contract.contract_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {response.template.contract.title}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigate('contract', response.template!.contract!.id)}
                    className="w-full text-left px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Ver detalhes do contrato →
                  </button>
                </div>
              </div>
            )}

            {/* Informações do Template */}
            {response.template && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Template
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {response.template.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {response.template.id}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigate('template', response.template!.id)}
                    className="w-full text-left px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Ver template →
                  </button>
                </div>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar documento</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar dados</span>
                </button>
                
                <button
                  onClick={() => router.push('/responses')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver todos os documentos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}