'use client'

import { useState, useEffect } from 'react'

export default function PDFDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    // Carregar informações de debug na inicialização
    loadDebugInfo()
  }, [])

  const loadDebugInfo = () => {
    const info = {
      environment: {
        isClient: typeof window !== 'undefined',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        location: typeof window !== 'undefined' ? window.location.href : 'N/A'
      },
      envVars: {
        pdfWorkerLocal: process.env.NEXT_PUBLIC_PDF_WORKER_LOCAL,
        pdfWorkerFailover: process.env.NEXT_PUBLIC_PDF_WORKER_FAILOVER,
        pdfWorkerTimeout: process.env.NEXT_PUBLIC_PDF_WORKER_TIMEOUT,
        debugPdf: process.env.NEXT_PUBLIC_DEBUG_PDF,
        logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL
      },
      workerUrls: [
        '/pdf.worker.min.js',
        'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js',
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
      ]
    }
    setDebugInfo(info)
  }

  const testWorkerUrls = async () => {
    setTesting(true)
    const results: any[] = []

    for (const url of debugInfo.workerUrls) {
      try {
        console.log(`🔍 Testando: ${url}`)
        
        const startTime = Date.now()
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: url.startsWith('/') ? 'same-origin' : 'no-cors'
        })
        const endTime = Date.now()
        
        const result = {
          url,
          status: response.status,
          ok: response.ok,
          type: response.type,
          time: endTime - startTime,
          accessible: response.ok || response.type === 'opaque'
        }
        
        results.push(result)
        console.log(`${result.accessible ? '✅' : '❌'} ${url} - ${result.status} (${result.time}ms)`)
        
      } catch (error) {
        const result = {
          url,
          status: 'ERROR',
          ok: false,
          type: 'error',
          time: 0,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        
        results.push(result)
        console.log(`❌ ${url} - ${result.error}`)
      }
    }

    setDebugInfo({
      ...debugInfo,
      testResults: results,
      lastTested: new Date().toISOString()
    })
    setTesting(false)
  }

  const testPDFJSImport = async () => {
    try {
      console.log('🔄 Testando import do PDF.js...')
      const pdfjsLib = await import('pdfjs-dist')
      console.log('✅ PDF.js importado:', pdfjsLib.version)
      
      // Testar configuração do worker
      const { setupPDFWorker } = await import('@/lib/pdf-worker-config')
      const workerSrc = await setupPDFWorker(pdfjsLib)
      console.log('✅ Worker configurado:', workerSrc)
      
      setDebugInfo({
        ...debugInfo,
        pdfJsVersion: pdfjsLib.version,
        workerConfigured: workerSrc,
        importSuccess: true
      })
      
    } catch (error) {
      console.error('❌ Erro no import/configuração:', error)
      setDebugInfo({
        ...debugInfo,
        importError: error instanceof Error ? error.message : 'Unknown error',
        importSuccess: false
      })
    }
  }

  if (!debugInfo) {
    return <div>Carregando informações de debug...</div>
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Debug PDF.js Worker</h2>
      
      <div className="space-y-4">
        {/* Environment Info */}
        <div>
          <h3 className="font-medium mb-2">Ambiente</h3>
          <div className="text-sm bg-white p-3 rounded">
            <p><strong>Cliente:</strong> {debugInfo.environment.isClient ? 'Sim' : 'Não'}</p>
            <p><strong>User Agent:</strong> {debugInfo.environment.userAgent}</p>
            <p><strong>URL:</strong> {debugInfo.environment.location}</p>
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <h3 className="font-medium mb-2">Variáveis de Ambiente</h3>
          <div className="text-sm bg-white p-3 rounded">
            {Object.entries(debugInfo.envVars).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {String(value) || 'undefined'}</p>
            ))}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2">
          <button
            onClick={testWorkerUrls}
            disabled={testing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Testando URLs...' : 'Testar URLs dos Workers'}
          </button>
          
          <button
            onClick={testPDFJSImport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Testar Import PDF.js
          </button>
        </div>

        {/* Test Results */}
        {debugInfo.testResults && (
          <div>
            <h3 className="font-medium mb-2">Resultados dos Testes</h3>
            <div className="text-sm space-y-2">
              {debugInfo.testResults.map((result: any, index: number) => (
                <div key={index} className={`p-3 rounded ${
                  result.accessible ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p><strong>URL:</strong> {result.url}</p>
                  <p><strong>Status:</strong> {result.status}</p>
                  <p><strong>Tempo:</strong> {result.time}ms</p>
                  <p><strong>Acessível:</strong> {result.accessible ? 'Sim' : 'Não'}</p>
                  {result.error && <p><strong>Erro:</strong> {result.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF.js Import Results */}
        {debugInfo.importSuccess !== undefined && (
          <div>
            <h3 className="font-medium mb-2">Teste de Import PDF.js</h3>
            <div className={`p-3 rounded text-sm ${
              debugInfo.importSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {debugInfo.importSuccess ? (
                <>
                  <p><strong>✅ Import bem-sucedido</strong></p>
                  <p><strong>Versão:</strong> {debugInfo.pdfJsVersion}</p>
                  <p><strong>Worker:</strong> {debugInfo.workerConfigured}</p>
                </>
              ) : (
                <>
                  <p><strong>❌ Erro no import</strong></p>
                  <p><strong>Erro:</strong> {debugInfo.importError}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}