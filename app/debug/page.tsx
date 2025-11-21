'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testWorkerUrls = async () => {
    setIsLoading(true)
    setResults([])
    
    const workerUrls = [
      'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js',
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js',
      '/pdf.worker.min.js'
    ]

    for (const url of workerUrls) {
      try {
        addResult(`🔍 Testando: ${url}`)
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          addResult(`✅ Acessível: ${url} (${response.status})`)
        } else {
          addResult(`❌ Erro HTTP: ${url} (${response.status})`)
        }
      } catch (error) {
        addResult(`❌ Falha de rede: ${url} - ${error}`)
      }
    }
    
    setIsLoading(false)
  }

  const testPdfJsImport = async () => {
    setIsLoading(true)
    addResult('🔄 Testando import do PDF.js...')
    
    try {
      const pdfjsLib = await import('pdfjs-dist')
      addResult(`✅ PDF.js importado: versão ${pdfjsLib.version || 'desconhecida'}`)
      
      // Testar diferentes workers
      const workers = [
        'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js'
      ]
      
      for (const workerSrc of workers) {
        try {
          addResult(`🔧 Configurando worker: ${workerSrc}`)
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
          
          // Criar um PDF de teste simples
          const testPdf = new Uint8Array([
            0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc4, 0xe5, 0xf2, 0xe5, 0xeb, 0xa7, 0xf3, 0xa0, 0xd0, 0xc4, 0xc6, 0x0a, 0x34, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x0a, 0x2f, 0x4c, 0x65, 0x6e, 0x67, 0x74, 0x68, 0x20, 0x35, 0x20, 0x30, 0x20, 0x52, 0x0a, 0x2f, 0x46, 0x69, 0x6c, 0x74, 0x65, 0x72, 0x20, 0x2f, 0x46, 0x6c, 0x61, 0x74, 0x65, 0x44, 0x65, 0x63, 0x6f, 0x64, 0x65, 0x0a, 0x3e, 0x3e, 0x0a, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x0a, 0x78, 0x9c, 0x33, 0x54, 0x30, 0x50, 0x30, 0x51, 0x30, 0x36, 0x55, 0x28, 0x4a, 0x57, 0x48, 0x2c, 0x4a, 0x55, 0x48, 0x2a, 0x4a, 0x4d, 0x4c, 0x51, 0x70, 0x0c, 0x0a, 0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a
          ])
          
          const pdf = await pdfjsLib.getDocument({ data: testPdf }).promise
          addResult(`✅ Worker funcionando: ${workerSrc}`)
          addResult(`📄 PDF teste carregado: ${pdf.numPages} páginas`)
          break
          
        } catch (workerError) {
          addResult(`❌ Worker falhou: ${workerSrc} - ${workerError}`)
        }
      }
      
    } catch (error) {
      addResult(`❌ Erro no import PDF.js: ${error}`)
    }
    
    setIsLoading(false)
  }

  const testFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsLoading(true)
        addResult(`📁 Arquivo selecionado: ${file.name} (${file.size} bytes)`)
        
        try {
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
          
          const arrayBuffer = await file.arrayBuffer()
          addResult(`📄 ArrayBuffer criado: ${arrayBuffer.byteLength} bytes`)
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          addResult(`✅ PDF carregado: ${pdf.numPages} páginas`)
          
          // Testar renderização da primeira página
          const page = await pdf.getPage(1)
          const viewport = page.getViewport({ scale: 1.0 })
          addResult(`📐 Página 1: ${viewport.width}x${viewport.height}`)
          
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')!
          canvas.height = viewport.height
          canvas.width = viewport.width
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise
          
          const dataUrl = canvas.toDataURL('image/png')
          addResult(`🖼️ PNG gerado: ${dataUrl.length} caracteres`)
          addResult(`✅ Conversão PDF→PNG bem-sucedida!`)
          
        } catch (error) {
          addResult(`❌ Erro na conversão: ${error}`)
        }
        
        setIsLoading(false)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Debug PDF.js Worker</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testWorkerUrls}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            🔍 Testar URLs Worker
          </button>
          
          <button
            onClick={testPdfJsImport}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            📦 Testar Import PDF.js
          </button>
          
          <button
            onClick={testFileUpload}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            📁 Testar Upload PDF
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Resultados dos Testes</h2>
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Executando testes...</span>
            </div>
          )}
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-gray-500">Clique em um botão acima para executar testes...</div>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Diagnóstico Atual</h3>
          <p className="text-yellow-700 mb-4">
            Erro detectado: <code>Failed to fetch dynamically imported module: https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js</code>
          </p>
          <div className="text-sm text-yellow-600">
            <p><strong>Possíveis causas:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Bloqueio de CORS pelo navegador</li>
              <li>Problema de conectividade com CDN</li>
              <li>Versão incompatível do worker</li>
              <li>Configuração de CSP (Content Security Policy)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}