'use client'

import { useState } from 'react'
import { Zap, CheckCircle, AlertCircle, Eye } from 'lucide-react'

export default function GeminiTest() {
  const [isTesting, setIsTestin] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const testGeminiConnection = async () => {
    setIsTestin(true)
    setTestResult(null)

    try {
      // Verificar se a chave está disponível
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY não encontrada')
      }

      // Importar e testar Gemini
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      // Teste simples
      const result = await model.generateContent([
        'Responda apenas com "OK" se você conseguir me ouvir.'
      ])

      const response = await result.response
      const text = response.text()

      setTestResult({
        success: true,
        message: 'Gemini conectado com sucesso!',
        details: {
          response: text,
          model: 'gemini-1.5-flash',
          apiKey: `${apiKey.substring(0, 10)}...`
        }
      })

    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Erro na conexão com Gemini',
        details: {
          error: error.message,
          stack: error.stack?.substring(0, 200)
        }
      })
    } finally {
      setIsTestin(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Teste Gemini Vision</h3>
        </div>
        
        <button
          onClick={testGeminiConnection}
          disabled={isTesting}
          className="flex items-center space-x-2 btn-secondary"
        >
          <Eye className="h-4 w-4" />
          <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
        </button>
      </div>

      {isTesting && (
        <div className="flex items-center space-x-2 text-sm text-blue-600 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Conectando com Gemini Vision...</span>
        </div>
      )}

      {testResult && (
        <div className={`p-3 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`font-medium ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </span>
          </div>
          
          {testResult.details && (
            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        <p>Este teste verifica se o Gemini Vision está configurado corretamente para OCR.</p>
      </div>
    </div>
  )
}