'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Wifi, Database, Zap, Cloud } from 'lucide-react'

export default function ConnectivityTest() {
  const [testResults, setTestResults] = useState<{
    internet: boolean | null
    supabase: boolean | null
    gemini: boolean | null
    storage: boolean | null
    details: any
  }>({
    internet: null,
    supabase: null,
    gemini: null,
    storage: null,
    details: {}
  })
  const [isTesting, setIsTesting] = useState(false)

  const runFullTest = async () => {
    setIsTesting(true)
    const results = {
      internet: false,
      supabase: false,
      gemini: false,
      storage: false,
      details: {} as any
    }

    try {
      // Teste 1: Conectividade com Internet
      console.log('🌐 Testando conectividade com internet...')
      try {
        const response = await fetch('https://httpbin.org/json', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        results.internet = response.ok
        results.details.internet = { status: response.status, ok: response.ok }
      } catch (error) {
        results.details.internet = { error: (error as Error).message }
      }

      // Teste 2: Conexão com Supabase
      console.log('🗄️ Testando conexão com Supabase...')
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase.from('form_templates').select('count').limit(1)
        results.supabase = !error
        results.details.supabase = { 
          error: error?.message, 
          connected: !error,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
        }
      } catch (error) {
        results.details.supabase = { error: (error as Error).message }
      }

      // Teste 3: Gemini API
      console.log('🤖 Testando Gemini API...')
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        
        if (!apiKey) {
          throw new Error('NEXT_PUBLIC_GEMINI_API_KEY não encontrada')
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const result = await model.generateContent(['Responda apenas "OK"'])
        const response = await result.response
        const text = response.text()
        
        results.gemini = text.includes('OK')
        results.details.gemini = { 
          response: text, 
          apiKey: apiKey.substring(0, 15) + '...',
          model: 'gemini-1.5-flash'
        }
      } catch (error) {
        results.details.gemini = { error: (error as Error).message }
      }

      // Teste 4: Supabase Storage
      console.log('☁️ Testando Supabase Storage...')
      try {
        const { supabase } = await import('@/lib/supabase')
        
        // Testar listagem de buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
          throw bucketsError
        }

        // Verificar se os buckets necessários existem
        const requiredBuckets = ['form-pdfs', 'processed-images']
        const existingBuckets = buckets?.map(b => b.name) || []
        const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b))
        
        results.storage = missingBuckets.length === 0
        results.details.storage = {
          buckets: existingBuckets,
          required: requiredBuckets,
          missing: missingBuckets,
          total: buckets?.length || 0
        }
      } catch (error) {
        results.details.storage = { error: (error as Error).message }
      }

    } catch (error) {
      console.error('❌ Erro geral nos testes:', error)
    }

    setTestResults(results)
    setIsTesting(false)
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-gray-500'
    return status ? 'text-green-700' : 'text-red-700'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Teste de Conectividade</h3>
        <button
          onClick={runFullTest}
          disabled={isTesting}
          className="btn-primary text-sm"
        >
          {isTesting ? 'Testando...' : 'Executar Testes'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Internet */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Conectividade Internet</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(testResults.internet)}
            <span className={`text-sm ${getStatusColor(testResults.internet)}`}>
              {testResults.internet === null ? 'Aguardando...' : 
               testResults.internet ? 'Conectado' : 'Falhou'}
            </span>
          </div>
        </div>

        {/* Supabase */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-green-500" />
            <span className="font-medium">Supabase Database</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(testResults.supabase)}
            <span className={`text-sm ${getStatusColor(testResults.supabase)}`}>
              {testResults.supabase === null ? 'Aguardando...' : 
               testResults.supabase ? 'Conectado' : 'Falhou'}
            </span>
          </div>
        </div>

        {/* Gemini */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Gemini Vision API</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(testResults.gemini)}
            <span className={`text-sm ${getStatusColor(testResults.gemini)}`}>
              {testResults.gemini === null ? 'Aguardando...' : 
               testResults.gemini ? 'Funcionando' : 'Falhou'}
            </span>
          </div>
        </div>

        {/* Storage */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center space-x-3">
            <Cloud className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Supabase Storage</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(testResults.storage)}
            <span className={`text-sm ${getStatusColor(testResults.storage)}`}>
              {testResults.storage === null ? 'Aguardando...' : 
               testResults.storage ? 'Configurado' : 'Falhou'}
            </span>
          </div>
        </div>
      </div>

      {/* Detalhes dos Erros */}
      {Object.values(testResults).some(v => v === false) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-2">Detalhes dos Erros:</h4>
          <div className="text-xs text-red-700 space-y-1">
            {!testResults.internet && testResults.details.internet?.error && (
              <div>🌐 Internet: {testResults.details.internet.error}</div>
            )}
            {!testResults.supabase && testResults.details.supabase?.error && (
              <div>🗄️ Supabase: {testResults.details.supabase.error}</div>
            )}
            {!testResults.gemini && testResults.details.gemini?.error && (
              <div>🤖 Gemini: {testResults.details.gemini.error}</div>
            )}
            {!testResults.storage && testResults.details.storage?.error && (
              <div>☁️ Storage: {testResults.details.storage.error}</div>
            )}
          </div>
        </div>
      )}

      {/* Resumo de Sucesso */}
      {Object.values(testResults).every(v => v === true) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Todos os testes passaram! Sistema pronto para uso.</span>
          </div>
        </div>
      )}
    </div>
  )
}