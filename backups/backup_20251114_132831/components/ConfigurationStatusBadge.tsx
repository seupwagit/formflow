'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Settings } from 'lucide-react'

export default function ConfigurationStatusBadge() {
  const [configStatus, setConfigStatus] = useState<'perfect' | 'needs-attention' | 'unknown'>('unknown')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = () => {
    try {
      const config = localStorage.getItem('ocr_config')
      
      if (!config) {
        setConfigStatus('needs-attention')
        return
      }
      
      const parsedConfig = JSON.parse(config)
      
      // Verificar configuração perfeita
      const isPerfect = (
        parsedConfig.language === 'por+eng' &&
        parsedConfig.pageSegMode === '6' &&
        parsedConfig.ocrEngineMode === '1' &&
        parsedConfig.dpi === 300 &&
        parsedConfig.enablePreprocessing === true &&
        parsedConfig.confidenceThreshold === 60
      )
      
      setConfigStatus(isPerfect ? 'perfect' : 'needs-attention')
      
    } catch (error) {
      setConfigStatus('needs-attention')
    }
  }

  const getStatusInfo = () => {
    switch (configStatus) {
      case 'perfect':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          text: 'Configuração Perfeita',
          bgColor: 'bg-green-100 border-green-300 text-green-800',
          description: 'Sistema configurado para detectar 30+ campos automaticamente'
        }
      case 'needs-attention':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          text: 'Configuração Precisa de Atenção',
          bgColor: 'bg-yellow-100 border-yellow-300 text-yellow-800',
          description: 'Configuração pode não estar otimizada para máxima detecção'
        }
      default:
        return {
          icon: <Settings className="h-4 w-4 text-gray-600" />,
          text: 'Verificando...',
          bgColor: 'bg-gray-100 border-gray-300 text-gray-800',
          description: 'Verificando configuração atual'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${statusInfo.bgColor}`}
      >
        {statusInfo.icon}
        <span>{statusInfo.text}</span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              {statusInfo.icon}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{statusInfo.text}</h4>
                <p className="text-sm text-gray-600 mb-3">{statusInfo.description}</p>
                
                {configStatus === 'perfect' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-xs text-green-800 space-y-1">
                      <div className="font-semibold">✅ Configuração Otimizada:</div>
                      <div>• Gemini Vision ativo</div>
                      <div>• Modo 6 (formulários)</div>
                      <div>• Engine LSTM</div>
                      <div>• Confiança 60%</div>
                      <div className="text-green-700 font-semibold mt-2">
                        🎯 Detecta 30+ campos automaticamente!
                      </div>
                    </div>
                  </div>
                )}
                
                {configStatus === 'needs-attention' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="text-xs text-yellow-800 space-y-1">
                      <div className="font-semibold">⚠️ Ação Recomendada:</div>
                      <div>1. Vá em Configurações OCR</div>
                      <div>2. Use o preset "Formulários"</div>
                      <div>3. Salve as configurações</div>
                      <div className="text-yellow-700 font-semibold mt-2">
                        Isso restaurará a detecção perfeita!
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}