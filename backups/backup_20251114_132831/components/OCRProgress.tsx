'use client'

import { useState, useEffect } from 'react'
import { Eye, Zap, CheckCircle, AlertCircle } from 'lucide-react'

interface OCRProgressProps {
  isProcessing: boolean
  currentPage?: number
  totalPages?: number
  stage?: 'converting' | 'ocr' | 'analyzing' | 'complete'
  fieldsDetected?: number
}

export default function OCRProgress({ 
  isProcessing, 
  currentPage = 0, 
  totalPages = 0, 
  stage = 'converting',
  fieldsDetected = 0 
}: OCRProgressProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing])

  if (!isProcessing) return null

  const getStageInfo = () => {
    switch (stage) {
      case 'converting':
        return {
          icon: <Eye className="h-5 w-5 text-blue-500" />,
          title: 'Convertendo PDF',
          description: 'Renderizando páginas em alta resolução...'
        }
      case 'ocr':
        return {
          icon: <Zap className="h-5 w-5 text-yellow-500" />,
          title: 'Executando OCR',
          description: `Analisando página ${currentPage + 1} de ${totalPages}...`
        }
      case 'analyzing':
        return {
          icon: <AlertCircle className="h-5 w-5 text-purple-500" />,
          title: 'Analisando Campos',
          description: 'Identificando tipos e posições dos campos...'
        }
      case 'complete':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Processamento Concluído',
          description: `${fieldsDetected} campos detectados com sucesso!`
        }
    }
  }

  const stageInfo = getStageInfo()
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Ícone animado */}
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              {stageInfo.icon}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {stageInfo.title}{dots}
          </h3>

          {/* Descrição */}
          <p className="text-sm text-gray-600 mb-6">
            {stageInfo.description}
          </p>

          {/* Barra de progresso */}
          {totalPages > 0 && stage !== 'complete' && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Página {currentPage + 1}</span>
                <span>{totalPages} total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}% concluído
              </div>
            </div>
          )}

          {/* Estatísticas */}
          {fieldsDetected > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {fieldsDetected} campos detectados
                </span>
              </div>
            </div>
          )}

          {/* Dicas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">💡 Dica:</p>
              <p>O OCR funciona melhor com PDFs de alta qualidade e texto bem definido.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}