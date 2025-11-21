'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import { Bug, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface CanvasDebugProps {
  pdfImages: string[]
  fields: FormField[]
  selectedField: FormField | null
}

export default function CanvasDebug({ pdfImages, fields, selectedField }: CanvasDebugProps) {
  const [debugInfo, setDebugInfo] = useState({
    canvasSupport: false,
    webglSupport: false,
    imageLoadTest: false,
    memoryUsage: 0,
    errors: [] as string[]
  })

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const errors: string[] = []
    
    // Teste 1: Suporte a Canvas
    const canvasSupport = !!document.createElement('canvas').getContext('2d')
    if (!canvasSupport) {
      errors.push('Canvas 2D não suportado pelo navegador')
    }

    // Teste 2: Suporte a WebGL
    const canvas = document.createElement('canvas')
    const webglSupport = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))

    // Teste 3: Teste de carregamento de imagem
    let imageLoadTest = false
    if (pdfImages.length > 0) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = () => {
            imageLoadTest = true
            resolve(true)
          }
          img.onerror = () => {
            errors.push('Erro ao carregar imagem PDF')
            reject(false)
          }
          img.src = pdfImages[0]
        })
      } catch (error) {
        errors.push(`Erro no teste de imagem: ${error}`)
      }
    }

    // Teste 4: Uso de memória
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

    setDebugInfo({
      canvasSupport,
      webglSupport,
      imageLoadTest,
      memoryUsage,
      errors
    })
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <Bug className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Debug do Canvas</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Testes de Compatibilidade */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Compatibilidade</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Canvas 2D:</span>
              {getStatusIcon(debugInfo.canvasSupport)}
            </div>
            <div className="flex items-center justify-between">
              <span>WebGL:</span>
              {getStatusIcon(debugInfo.webglSupport)}
            </div>
            <div className="flex items-center justify-between">
              <span>Carregamento de Imagem:</span>
              {getStatusIcon(debugInfo.imageLoadTest)}
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Sistema</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Navegador:</span>
              <span className="text-gray-600">{navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Memória JS:</span>
              <span className="text-gray-600">
                {debugInfo.memoryUsage > 0 ? `${Math.round(debugInfo.memoryUsage / 1024 / 1024)}MB` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Imagens PDF:</span>
              <span className="text-gray-600">{pdfImages.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado Atual */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-gray-900 mb-2">Estado Atual</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{fields.length}</div>
            <div className="text-gray-600">Campos Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {fields.filter(f => f.required).length}
            </div>
            <div className="text-gray-600">Obrigatórios</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {selectedField ? '1' : '0'}
            </div>
            <div className="text-gray-600">Selecionado</div>
          </div>
        </div>
      </div>

      {/* Erros */}
      {debugInfo.errors.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Erros Detectados</span>
          </h4>
          <div className="space-y-1">
            {debugInfo.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50 p-3 rounded">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Dicas para resolver problemas:</p>
            <ul className="space-y-1 text-xs">
              <li>• Tente recarregar a página (F5)</li>
              <li>• Verifique se JavaScript está habilitado</li>
              <li>• Use um navegador moderno (Chrome, Firefox, Safari)</li>
              <li>• Limpe o cache do navegador</li>
              <li>• Tente em modo incógnito</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}