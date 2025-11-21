'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OCRSettings from '@/components/OCRSettings'
import { OCRConfig, DEFAULT_OCR_CONFIG, validateOCRConfig } from '@/lib/ocr-config'
import ExpectedFieldsConfig from '@/components/ExpectedFieldsConfig'
import { ExpectedFieldsConfig as ExpectedFieldsConfigType } from '@/lib/hybrid-ai-ocr-processor'
import { useToast } from '@/components/ToastProvider'
import { Settings, Zap, Brain, FileText, Save, RotateCcw, ArrowLeft, Database, Plus } from 'lucide-react'
import { createExampleTables, populateExampleData } from '@/lib/database-schema'
import DatabaseDebug from '@/components/DatabaseDebug'

export default function AdminPage() {
  const router = useRouter()
  const { showSuccess, showInfo, showWarning } = useToast()
  
  // Estados das configurações
  const [ocrConfig, setOcrConfig] = useState<OCRConfig>(DEFAULT_OCR_CONFIG)
  
  const [expectedFieldsConfig, setExpectedFieldsConfig] = useState<ExpectedFieldsConfigType>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isCreatingTables, setIsCreatingTables] = useState(false)

  // Carregar configurações salvas
  useEffect(() => {
    loadSavedConfigurations()
  }, [])

  const loadSavedConfigurations = () => {
    try {
      // Carregar configuração OCR
      const savedOcrConfig = localStorage.getItem('ocr_config')
      if (savedOcrConfig) {
        const parsedConfig = JSON.parse(savedOcrConfig)
        setOcrConfig(validateOCRConfig(parsedConfig))
        console.log('✅ Configuração OCR carregada e validada:', parsedConfig)
      } else {
        console.log('📋 Usando configuração padrão otimizada')
      }

      // Carregar configuração de campos esperados
      const savedFieldsConfig = localStorage.getItem('expected_fields_config')
      if (savedFieldsConfig) {
        setExpectedFieldsConfig(JSON.parse(savedFieldsConfig))
      }

      console.log('✅ Configurações carregadas do localStorage')
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      showWarning('Configurações', 'Usando configurações padrão')
    }
  }

  const handleOCRConfigChange = (newConfig: OCRConfig) => {
    setOcrConfig(newConfig)
    setHasUnsavedChanges(true)
  }

  const handleExpectedFieldsChange = (newConfig: ExpectedFieldsConfigType) => {
    setExpectedFieldsConfig(newConfig)
    setHasUnsavedChanges(true)
  }

  const saveConfigurations = () => {
    try {
      // Salvar configuração OCR
      localStorage.setItem('ocr_config', JSON.stringify(ocrConfig))
      
      // Salvar configuração de campos esperados
      localStorage.setItem('expected_fields_config', JSON.stringify(expectedFieldsConfig))
      
      setHasUnsavedChanges(false)
      showSuccess('Configurações Salvas', 'Todas as configurações foram salvas com sucesso')
      
      console.log('✅ Configurações salvas:', { ocrConfig, expectedFieldsConfig })
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      showWarning('Erro', 'Não foi possível salvar as configurações')
    }
  }

  const resetToDefaults = () => {
    setOcrConfig(DEFAULT_OCR_CONFIG)
    setExpectedFieldsConfig({})
    setHasUnsavedChanges(true)
    
    showInfo('Configurações Resetadas', 'Configurações voltaram ao padrão otimizado para formulários')
    console.log('🔄 Configurações resetadas para:', DEFAULT_OCR_CONFIG)
  }

  const goToUpload = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Você tem alterações não salvas. Deseja salvar antes de continuar?')
      if (confirm) {
        saveConfigurations()
      }
    }
    router.push('/')
  }

  const handleCreateExampleTables = async () => {
    setIsCreatingTables(true)
    try {
      showInfo('Criando Tabelas', 'Criando tabelas de exemplo para listas dinâmicas...')
      
      await createExampleTables()
      await populateExampleData()
      
      showSuccess(
        'Tabelas Criadas!', 
        'Tabelas de exemplo criadas: categories, status_options, inspectors'
      )
    } catch (error) {
      console.error('Erro ao criar tabelas:', error)
      showWarning(
        'Erro ao Criar Tabelas', 
        'Não foi possível criar as tabelas de exemplo. Verifique as permissões do banco.'
      )
    } finally {
      setIsCreatingTables(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="btn-secondary"
                  title="Voltar ao início"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Settings className="h-6 w-6" />
                    <span>Administração do Sistema</span>
                  </h1>
                  <p className="text-sm text-gray-600">
                    Configure o OCR e parâmetros de detecção antes do upload dos PDFs
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                configurações • file_uploads
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  * Alterações não salvas
                </span>
              )}
              
              <button
                onClick={resetToDefaults}
                className="btn-secondary"
                title="Resetar para padrão"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Resetar</span>
              </button>
              
              <button
                onClick={saveConfigurations}
                className={`btn-primary ${hasUnsavedChanges ? 'ring-2 ring-blue-300' : ''}`}
                title="Salvar configurações"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Configurações OCR */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>Configurações de OCR</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ajuste os parâmetros de reconhecimento óptico de caracteres para melhor precisão
              </p>
            </div>
            
            <div className="p-6">
              {/* Configurações OCR Inline */}
              <div className="space-y-6">
                {/* Idioma */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma de Reconhecimento
                  </label>
                  <select
                    value={ocrConfig.language}
                    onChange={(e) => handleOCRConfigChange({ ...ocrConfig, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="por">Português</option>
                    <option value="eng">Inglês</option>
                    <option value="por+eng">Português + Inglês (recomendado)</option>
                    <option value="spa">Espanhol</option>
                    <option value="fra">Francês</option>
                    <option value="deu">Alemão</option>
                  </select>
                </div>

                {/* Modo de Segmentação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo de Segmentação de Página
                  </label>
                  <select
                    value={ocrConfig.pageSegMode}
                    onChange={(e) => handleOCRConfigChange({ ...ocrConfig, pageSegMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="6">6 - Bloco uniforme de texto (padrão)</option>
                    <option value="4">4 - Coluna de texto de tamanhos variados</option>
                    <option value="11">11 - Texto esparso</option>
                    <option value="7">7 - Linha única de texto</option>
                    <option value="8">8 - Palavra única</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Modo 6 é recomendado para formulários
                  </p>
                </div>

                {/* Engine OCR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engine de OCR
                  </label>
                  <select
                    value={ocrConfig.ocrEngineMode}
                    onChange={(e) => handleOCRConfigChange({ ...ocrConfig, ocrEngineMode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 - LSTM engine (recomendado)</option>
                    <option value="0">0 - Legacy engine</option>
                    <option value="2">2 - Legacy + LSTM</option>
                    <option value="3">3 - Padrão disponível</option>
                  </select>
                </div>

                {/* Configurações Avançadas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DPI de Processamento
                    </label>
                    <select
                      value={ocrConfig.dpi}
                      onChange={(e) => handleOCRConfigChange({ ...ocrConfig, dpi: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={150}>150 DPI (Rápido)</option>
                      <option value={300}>300 DPI (Recomendado)</option>
                      <option value={600}>600 DPI (Alta qualidade)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Confiança ({ocrConfig.confidenceThreshold}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ocrConfig.confidenceThreshold}
                      onChange={(e) => handleOCRConfigChange({ ...ocrConfig, confidenceThreshold: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Pré-processamento */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ocrConfig.enablePreprocessing}
                      onChange={(e) => handleOCRConfigChange({ ...ocrConfig, enablePreprocessing: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Habilitar pré-processamento de imagem
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Aplica filtros para melhorar a qualidade da imagem antes do OCR
                  </p>
                </div>

                {/* Presets */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Presets Rápidos:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleOCRConfigChange({
                        language: 'por+eng',
                        pageSegMode: '6',
                        ocrEngineMode: '1',
                        dpi: 300,
                        enablePreprocessing: true,
                        confidenceThreshold: 60
                      })}
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      📋 Formulários
                    </button>
                    <button
                      onClick={() => handleOCRConfigChange({
                        language: 'por+eng',
                        pageSegMode: '4',
                        ocrEngineMode: '1',
                        dpi: 300,
                        enablePreprocessing: true,
                        confidenceThreshold: 70
                      })}
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      📄 Documentos
                    </button>
                    <button
                      onClick={() => handleOCRConfigChange({
                        language: 'por+eng',
                        pageSegMode: '11',
                        ocrEngineMode: '1',
                        dpi: 600,
                        enablePreprocessing: true,
                        confidenceThreshold: 50
                      })}
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      🔍 Texto Esparso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de Campos Esperados */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span>Campos Esperados</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure os tipos de campos que o sistema deve procurar automaticamente
              </p>
            </div>
            
            <div className="p-6">
              <ExpectedFieldsConfig
                totalPages={1}
                onConfigChange={handleExpectedFieldsChange}
                initialConfig={expectedFieldsConfig}
              />
            </div>
          </div>
        </div>

        {/* Configurações de Banco de Dados */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações de Banco de Dados
                </h3>
                <p className="text-sm text-gray-600">
                  Configure tabelas para listas dinâmicas nos formulários
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-purple-900 mb-2">
                🔗 Listas Dinâmicas
              </h4>
              <p className="text-sm text-purple-800 mb-3">
                Crie campos que buscam dados diretamente do banco de dados, 
                tornando os formulários mais consistentes e atualizados.
              </p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <strong>Categorias:</strong> Para classificar itens</li>
                <li>• <strong>Status:</strong> Para estados de aprovação</li>
                <li>• <strong>Inspetores:</strong> Para responsáveis</li>
              </ul>
            </div>

            <button
              onClick={handleCreateExampleTables}
              disabled={isCreatingTables}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isCreatingTables ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>
                {isCreatingTables ? 'Criando...' : 'Criar Tabelas de Exemplo'}
              </span>
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Cria tabelas: categories, status_options, inspectors com dados de exemplo
            </p>
          </div>
        </div>

        {/* Ferramentas de Debug */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🐛 Ferramentas de Debug</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a
              href="/debug"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Debug PDF.js</h3>
              </div>
              <p className="text-sm text-gray-600">
                Diagnóstico do worker PDF.js e carregamento de PDFs
              </p>
            </a>

            <a
              href="/debug-supabase"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Debug Supabase</h3>
              </div>
              <p className="text-sm text-gray-600">
                Teste de conexão e queries do Supabase
              </p>
            </a>

            <a
              href="/admin/backup"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Backup Sistema</h3>
              </div>
              <p className="text-sm text-gray-600">
                Backup do banco de dados e arquivos do Storage
              </p>
            </a>
          </div>

          <DatabaseDebug />
        </div>

        {/* Informações e Dicas */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Dicas para Melhor Precisão</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📄 Qualidade do PDF:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use PDFs com resolução mínima de 300 DPI</li>
                <li>Evite PDFs escaneados com baixa qualidade</li>
                <li>Prefira PDFs nativos (não escaneados)</li>
                <li>Certifique-se que o texto está legível</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">⚙️ Configurações OCR:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Confiança 0.7-0.8 para melhor precisão</li>
                <li>Ative pré-processamento para PDFs escaneados</li>
                <li>Use escala 2.0 para imagens pequenas</li>
                <li>Configure campos esperados por tipo de formulário</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎯 Campos Esperados:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Configure quantos campos de cada tipo esperar</li>
                <li>Ajude o sistema a priorizar detecções</li>
                <li>Melhore a precisão para formulários específicos</li>
                <li>Reduza falsos positivos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🚀 Fluxo Recomendado:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>1. Configure OCR aqui primeiro</li>
                <li>2. Faça upload do PDF</li>
                <li>3. Verifique resultados no Designer</li>
                <li>4. Reajuste configurações se necessário</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ação Principal */}
        <div className="mt-8 text-center">
          <button
            onClick={goToUpload}
            className="btn-primary text-lg px-8 py-3"
          >
            <FileText className="h-5 w-5 mr-2" />
            Ir para Upload de PDF
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Configure primeiro, depois faça o upload para obter os melhores resultados
          </p>
        </div>
      </main>
    </div>
  )
}