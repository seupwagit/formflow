'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, Settings, Zap } from 'lucide-react'

export default function OCRConfigNotice() {
  const [showNotice, setShowNotice] = useState(false)
  const [hasOptimizedConfig, setHasOptimizedConfig] = useState(false)

  useEffect(() => {
    checkAndMigrateConfig()
  }, [])

  const checkAndMigrateConfig = () => {
    try {
      const savedConfig = localStorage.getItem('ocr_config')
      const hasSeenNotice = localStorage.getItem('ocr_config_notice_seen')
      
      if (!savedConfig || !hasSeenNotice) {
        // Aplicar configuração otimizada
        const optimizedConfig = {
          language: 'por+eng',
          pageSegMode: '6',
          ocrEngineMode: '1', 
          dpi: 300,
          enablePreprocessing: true,
          confidenceThreshold: 60,
          deskew: true,
          removeNoise: true,
          enhanceContrast: true,
          binarize: false,
          scale: 2.0
        }
        
        localStorage.setItem('ocr_config', JSON.stringify(optimizedConfig))
        setHasOptimizedConfig(true)
        setShowNotice(true)
        
        console.log('🎯 Configuração OCR otimizada aplicada:', optimizedConfig)
      } else {
        // Verificar se a configuração atual está otimizada
        const config = JSON.parse(savedConfig)
        const isOptimized = config.pageSegMode === '6' && 
                           config.language === 'por+eng' && 
                           config.ocrEngineMode === '1' &&
                           config.enablePreprocessing === true
        
        setHasOptimizedConfig(isOptimized)
      }
    } catch (error) {
      console.error('Erro ao verificar configuração OCR:', error)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('ocr_config_notice_seen', 'true')
    setShowNotice(false)
  }

  const handleOpenSettings = () => {
    // Disparar evento para abrir configurações
    window.dispatchEvent(new CustomEvent('openOCRSettings'))
    handleDismiss()
  }

  if (!showNotice) return null

  return (
    <div className="fixed top-4 right-4 max-w-md bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              🎯 OCR Otimizado Aplicado!
            </h3>
            
            <p className="text-xs text-gray-700 mb-3">
              Aplicamos uma configuração otimizada para <strong>melhor detecção de campos</strong> em formulários:
            </p>
            
            <div className="space-y-1 text-xs text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Português + Inglês</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Modo formulário (segmentação 6)</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Engine LSTM (alta precisão)</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Pré-processamento inteligente</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenSettings}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                <Settings className="h-3 w-3" />
                <span>Ajustar</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Entendi
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}