'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PDFUploader from '@/components/PDFUploader'
import NavigationButton from '@/components/NavigationButton'
import { FileText, Plus, History, Building2, Users } from 'lucide-react'

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const [processingStatus, setProcessingStatus] = useState<{
    stage: string
    progress: number
    method?: string
  } | undefined>()

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setProcessingStatus({ stage: 'Carregando configurações...', progress: 5 })
    
    try {
      // Carregar configurações salvas
      const savedOcrConfig = localStorage.getItem('ocr_config')
      const savedFieldsConfig = localStorage.getItem('expected_fields_config')
      
      let ocrConfig = null
      let expectedFieldsConfig = {}
      
      if (savedOcrConfig) {
        ocrConfig = JSON.parse(savedOcrConfig)
        console.log('✅ Configurações OCR carregadas:', ocrConfig)
      }
      
      if (savedFieldsConfig) {
        expectedFieldsConfig = JSON.parse(savedFieldsConfig)
        console.log('✅ Configurações de campos esperados carregadas:', expectedFieldsConfig)
      }
      
      setProcessingStatus({ stage: 'Iniciando processamento...', progress: 10 })
      
      // Usar processador completo com storage real
      const { CompleteStorageProcessor } = await import('@/lib/complete-storage-processor')
      const processor = new CompleteStorageProcessor()
      
      // Aplicar configurações se disponíveis
      if (ocrConfig) {
        processor.setOCRConfig(ocrConfig)
      }
      
      if (Object.keys(expectedFieldsConfig).length > 0) {
        processor.setExpectedFields(expectedFieldsConfig)
      }
      
      const result = await processor.processFile(file, (stage, progress) => {
        setProcessingStatus({ 
          stage, 
          progress, 
          method: 'OCR + IA Completo'
        })
      })
      
      if (!result.success) {
        throw new Error(result.message)
      }
      
      // Salvar resultado completo no localStorage para o designer
      const processingData = {
        processingId: result.processingId,
        fileName: result.fileName,
        pdfPublicUrl: result.pdfPublicUrl,
        imagePublicUrls: result.imagePublicUrls,
        detectedFields: result.detectedFields,
        pages: result.imagePublicUrls.length
      }
      
      localStorage.setItem('current_processing', JSON.stringify(processingData))
      console.log('✅ Dados salvos no localStorage:', processingData)
      
      setProcessingStatus({ stage: 'Processamento concluído! Redirecionando...', progress: 100 })
      
      // Redirecionar para o designer com os campos detectados
      console.log('🔄 Redirecionando para o designer...')
      const designerUrl = `/designer?processing=${encodeURIComponent(result.processingId)}`
      console.log('🎯 URL de destino:', designerUrl)
      
      // Mostrar botão de redirecionamento manual como backup
      setTimeout(() => {
        setProcessingStatus({ 
          stage: `✅ Sucesso! ${result.detectedFields?.length || 0} campos detectados`, 
          progress: 100 
        })
        
        // Tentar redirecionamento automático
        router.push(designerUrl)
      }, 1000)
      
      // Backup: redirecionamento manual após 3 segundos
      setTimeout(() => {
        if (window.location.pathname === '/') {
          console.log('🔄 Redirecionamento automático falhou, tentando novamente...')
          window.location.href = designerUrl
        }
      }, 3000)
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error)
      setProcessingStatus({ stage: 'Erro no processamento', progress: 0 })
      
      // Mostrar erro mais detalhado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao processar PDF: ${errorMessage}\n\nVerifique:\n- Conexão com internet\n- Configuração do Gemini API\n- Permissões do Supabase`)
      
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setProcessingStatus(undefined)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Mapeador de Formulários
                </h1>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                file_uploads • form_templates
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                title="🔧 Configurações Avançadas - Configure OCR, IA e parâmetros de detecção antes do upload para obter os melhores resultados"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Configurações</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 Header: Navegando para /templates')
                  router.push('/templates')
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                title="📄 Modelos Salvos - Visualize, edite e gerencie todos os formulários já processados e salvos no sistema"
              >
                <FileText className="h-5 w-5" />
                <span>Modelos</span>
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Header: Navegando para /inspections')
                  router.push('/inspections')
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                title="📋 Histórico de Inspeções - Acesse relatórios e dados de inspeções já realizadas usando os formulários"
              >
                <History className="h-5 w-5" />
                <span>Inspeções</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transforme PDFs em Formulários Digitais
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload de formulários PDF, reconhecimento automático de campos e criação 
            de formulários interativos com integração ao Supabase.
          </p>
        </div>

        {/* Configuration Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                💡 Dica: Configure o OCR Primeiro
              </h3>
              <p className="text-blue-800 mb-3">
                Para obter os melhores resultados na detecção automática de campos, 
                configure os parâmetros de OCR antes de fazer o upload do PDF.
              </p>
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="⚙️ Configurar OCR e IA - Ajuste parâmetros de reconhecimento, idioma, confiança e tipos de campos esperados para maximizar a precisão da detecção automática"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.50 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Configurar OCR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <PDFUploader 
            onFileUpload={handleFileUpload} 
            isLoading={isUploading}
            processingStatus={processingStatus}
          />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div 
            className="card p-6 text-center"
            title="🤖 IA Avançada - Usa OCR (Tesseract) + Gemini para extrair texto e identificar campos automaticamente. Detecta tipos, posições e propriedades com alta precisão"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reconhecimento Automático
            </h3>
            <p className="text-gray-600">
              IA detecta automaticamente campos de texto, números, datas e listas em PDFs
            </p>
          </div>

          <div 
            className="card p-6 text-center"
            title="🎨 Editor Intuitivo - Interface visual com ferramentas de seleção, movimento, redimensionamento e criação de campos. Suporte a múltiplas páginas e zoom"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Editor Visual
            </h3>
            <p className="text-gray-600">
              Ajuste campos manualmente com interface drag & drop intuitiva
            </p>
          </div>

          <div 
            className="card p-6 text-center"
            title="🗄️ Banco de Dados - Integração completa com Supabase para armazenamento de formulários, campos e dados coletados. Criação automática de tabelas"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Integração Supabase
            </h3>
            <p className="text-gray-600">
              Criação automática de tabelas e schemas com histórico completo
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          
          {/* Links diretos para teste */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">🔗 Links diretos (se os botões não funcionarem):</p>
            <div className="flex gap-2 text-sm">
              <a href="/templates" className="text-blue-600 hover:underline">Templates</a>
              <span>•</span>
              <a href="/inspections" className="text-green-600 hover:underline">Inspeções</a>
              <span>•</span>
              <a href="/designer" className="text-purple-600 hover:underline">Designer</a>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavigationButton
              href="/templates"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="📄 Modelos Salvos - Visualize, edite, duplique ou exclua formulários já processados. Acesse estatísticas e histórico de uso"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Ver Modelos</div>
                <div className="text-sm text-gray-500">Gerenciar formulários salvos</div>
              </div>
            </NavigationButton>

            <NavigationButton
              href="/inspections"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="📋 Histórico de Inspeções - Visualize relatórios, dados coletados e estatísticas de inspeções realizadas usando os formulários"
            >
              <History className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Histórico</div>
                <div className="text-sm text-gray-500">Ver inspeções realizadas</div>
              </div>
            </NavigationButton>

            <button
              onClick={() => router.push('/designer')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="➕ Criar Formulário - Acesse o designer para criar um formulário do zero ou carregar uma imagem de teste para experimentar"
            >
              <Plus className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Novo Formulário</div>
                <div className="text-sm text-gray-500">Criar do zero</div>
              </div>
            </button>

            <NavigationButton
              href="/companies"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
              title="🏢 Empresas - Gerencie o cadastro de empresas e clientes do sistema"
            >
              <Building2 className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Empresas</div>
                <div className="text-sm text-purple-600">Cadastro de clientes</div>
              </div>
            </NavigationButton>

            <NavigationButton
              href="/contracts"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              title="📄 Contratos - Gerencie contratos vinculados às empresas"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Contratos</div>
                <div className="text-sm text-blue-600">Gestão contratual</div>
              </div>
            </NavigationButton>

            <NavigationButton
              href="/responses"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              title="📋 Documentos Coletados - Visualize todos os documentos coletados com informações hierárquicas"
            >
              <FileText className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Documentos</div>
                <div className="text-sm text-green-600">Dados coletados</div>
              </div>
            </NavigationButton>

            <NavigationButton
              href="/users"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
              title="👥 Usuários - Gerencie usuários e permissões do sistema (apenas administradores)"
            >
              <Users className="h-5 w-5 text-indigo-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Usuários</div>
                <div className="text-sm text-indigo-600">Gerenciar acessos</div>
              </div>
            </NavigationButton>
          </div>
        </div>
      </main>
    </div>
  )
}