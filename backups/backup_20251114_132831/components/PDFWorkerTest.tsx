'use client'

import { useState } from 'react'
import { PDFWorkerManager } from '@/lib/pdf-worker-config'

export default function PDFWorkerTest() {
  const [status, setStatus] = useState<string>('Não testado')
  const [workerInfo, setWorkerInfo] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const testWorker = async () => {
    setTesting(true)
    setStatus('Testando...')
    
    try {
      console.log('🔍 Iniciando teste do worker PDF.js...')
      
      // Importar PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      
      // Configurar worker
      const manager = PDFWorkerManager.getInstance()
      const workerSrc = await manager.setupWorker(pdfjsLib)
      
      setStatus(`✅ Worker configurado: ${workerSrc}`)
      setWorkerInfo(manager.getWorkerStatus())
      
      console.log('✅ Teste do worker concluído com sucesso')
      
    } catch (error) {
      console.error('❌ Erro no teste do worker:', error)
      setStatus(`❌ Erro: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  const resetWorker = () => {
    const manager = PDFWorkerManager.getInstance()
    manager.resetWorker()
    setStatus('Worker resetado')
    setWorkerInfo(null)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Teste do Worker PDF.js</h2>
      
      <div className="space-y-4">
        <div>
          <p className="font-medium">Status:</p>
          <p className={`p-2 rounded ${
            status.includes('✅') ? 'bg-green-100 text-green-800' :
            status.includes('❌') ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={testWorker}
            disabled={testing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Testando...' : 'Testar Worker'}
          </button>
          
          <button
            onClick={resetWorker}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Worker
          </button>
        </div>

        {workerInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Informações do Worker:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Worker Atual:</strong> {workerInfo.current || 'Nenhum'}</p>
              <p><strong>Workers Testados:</strong> {workerInfo.tested.length}</p>
              <p><strong>Workers Disponíveis:</strong> {workerInfo.available.length}</p>
            </div>
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Detalhes dos Workers</summary>
              <div className="mt-2 text-xs">
                {workerInfo.available.map((worker: any, index: number) => (
                  <div key={index} className={`p-2 mb-1 rounded ${
                    worker.tested ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <p><strong>URL:</strong> {worker.workerSrc}</p>
                    <p><strong>Local:</strong> {worker.isLocal ? 'Sim' : 'Não'}</p>
                    <p><strong>Testado:</strong> {worker.tested ? 'Sim' : 'Não'}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}