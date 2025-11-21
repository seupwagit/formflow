'use client'

import { useState, useEffect } from 'react'
import { Settings, X, Zap, Eye, Brain } from 'lucide-react'
import { OCRConfig, DEFAULT_OCR_CONFIG, OCR_PRESETS, validateOCRConfig, loadSafeOCRConfig, saveOCRConfigSafely, getOCRConfigWarning } from '@/lib/ocr-config'

interface OCRSettingsProps {
  onClose: () => void
  onApply: (settings: OCRConfig) => void
}

export default function OCRSettings({ onClose, onApply }: OCRSettingsProps) {
  // 🔒 CARREGAR CONFIGURAÇÕES SEGURAS
  const [config, setConfig] = useState<OCRConfig>(() => loadSafeOCRConfig())
  const [configWarning, setConfigWarning] = useState<any>(null)

  // Verificar avisos de configuração ao carregar
  useEffect(() => {
    const warning = getOCRConfigWarning()
    setConfigWarning(warning)
  }, [])

  const handleSave = () => {
    try {
      saveOCRConfigSafely(config)
      console.log('✅ Configurações OCR salvas com segurança:', config)
      
      // Atualizar aviso após salvar
      const warning = getOCRConfigWarning()
      setConfigWarning(warning)
    } catch (error) {
      console.error('❌ Erro ao salvar configurações OCR:', error)
    }
  }

  const handleApply = () => {
    handleSave()
    onApply(config)
    onClose()
  }

  const handleSaveOnly = () => {
    handleSave()
    // Mostrar feedback visual de salvamento
    const button = document.querySelector('[data-save-only]') as HTMLButtonElement
    if (button) {
      const originalText = button.textContent
      button.textContent = '✅ Salvo!'
      button.disabled = true
      setTimeout(() => {
        button.textContent = originalText
        button.disabled = false
      }, 2000)
    }
  }

  const pageSegModes = [
    { value: '0', label: 'Orientação e detecção de script (OSD) apenas' },
    { value: '1', label: 'Segmentação automática de página com OSD' },
    { value: '2', label: 'Segmentação automática de página, sem OSD ou OCR' },
    { value: '3', label: 'Segmentação automática de página, sem OSD' },
    { value: '4', label: 'Assumir uma única coluna de texto de tamanhos variados' },
    { value: '5', label: 'Assumir um único bloco uniforme de texto alinhado verticalmente' },
    { value: '6', label: 'Assumir um único bloco uniforme de texto (padrão)' },
    { value: '7', label: 'Tratar a imagem como uma única linha de texto' },
    { value: '8', label: 'Tratar a imagem como uma única palavra' },
    { value: '9', label: 'Tratar a imagem como uma única palavra em um círculo' },
    { value: '10', label: 'Tratar a imagem como um único caractere' },
    { value: '11', label: 'Texto esparso. Encontrar o máximo de texto possível' },
    { value: '12', label: 'Texto esparso com OSD' },
    { value: '13', label: 'Linha bruta. Tratar a imagem como uma única linha de texto' }
  ]

  const ocrEngineModes = [
    { value: '0', label: 'Apenas Legacy engine' },
    { value: '1', label: 'Apenas Neural nets LSTM engine (padrão)' },
    { value: '2', label: 'Legacy + LSTM engines' },
    { value: '3', label: 'Padrão, baseado no que está disponível' }
  ]

  const languages = [
    { value: 'por', label: 'Português' },
    { value: 'eng', label: 'Inglês' },
    { value: 'por+eng', label: 'Português + Inglês (recomendado)' },
    { value: 'spa', label: 'Espanhol' },
    { value: 'fra', label: 'Francês' },
    { value: 'deu', label: 'Alemão' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Configurações do OCR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Aviso Dinâmico de Configuração */}
          {configWarning && (
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">⚠️</span>
                </div>
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">🚨 CONFIGURAÇÃO ALTERADA DETECTADA</h3>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <div className="bg-white border border-yellow-300 rounded p-2">
                      <div className="font-semibold text-red-900">{configWarning.message}</div>
                      {configWarning.isCustom && (
                        <div className="mt-1 text-red-800">
                          ⚠️ Configuração personalizada pode detectar apenas 1-3 campos ao invés de 30+
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setConfig(OCR_PRESETS.FORMULARIOS)
                        localStorage.removeItem('ocr_config_warning')
                        setConfigWarning(null)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700"
                    >
                      🔧 Restaurar Configuração Testada (30+ campos)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso Crítico */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">!</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900 mb-2">⚠️ AVISO IMPORTANTE - LEIA ANTES DE ALTERAR</h3>
                <div className="text-sm text-red-800 space-y-2">
                  <div>
                    <strong>🎯 O sistema está configurado para detectar 30+ campos automaticamente.</strong>
                  </div>
                  <div>
                    <strong>✅ Se está funcionando bem, NÃO altere as configurações!</strong>
                  </div>
                  <div className="bg-white border border-red-300 rounded p-2 mt-2">
                    <div className="font-semibold text-red-900 mb-1">📋 Configuração Atual Testada:</div>
                    <div>• <strong>Gemini Vision</strong> para detecção visual perfeita</div>
                    <div>• <strong>Modo 6</strong> otimizado para formulários</div>
                    <div>• <strong>Engine LSTM</strong> para máxima precisão</div>
                    <div>• <strong>Confiança 60%</strong> para equilibrio perfeito</div>
                  </div>
                  <div className="text-red-900 font-semibold">
                    🚨 Alterar pode reduzir a detecção de 30 campos para apenas 1-3 campos!
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Eye className="inline h-4 w-4 mr-1" />
              Idioma de Reconhecimento
            </label>
            <select
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
              className="input-field"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Múltiplos idiomas melhoram a precisão para documentos mistos
            </p>
          </div>

          {/* Modo de Segmentação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Brain className="inline h-4 w-4 mr-1" />
              Modo de Segmentação de Página
              <span 
                className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded cursor-help"
                title="⚠️ CUIDADO: Modo 6 é ESSENCIAL para formulários! Alterar pode reduzir drasticamente a detecção de campos."
              >
                ⚠️ Crítico
              </span>
            </label>
            <select
              value={config.pageSegMode}
              onChange={(e) => setConfig({ ...config, pageSegMode: e.target.value })}
              className="input-field"
            >
              {pageSegModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.value} - {mode.label}
                  {mode.value === '6' ? ' ⭐ RECOMENDADO' : ''}
                </option>
              ))}
            </select>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="font-semibold text-yellow-800">🎯 CONFIGURAÇÃO CRÍTICA:</div>
              <div className="text-yellow-700">
                • <strong>Modo 6</strong> é essencial para formulários
                • Detecta blocos uniformes de texto perfeitamente
                • <span className="text-red-600 font-semibold">Alterar pode quebrar a detecção!</span>
              </div>
            </div>
          </div>

          {/* Engine OCR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="inline h-4 w-4 mr-1" />
              Engine de OCR
              <span 
                className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded cursor-help"
                title="💡 LSTM (modo 1) é a engine mais avançada e precisa. Recomendado para manter."
              >
                💡 Otimizado
              </span>
            </label>
            <select
              value={config.ocrEngineMode}
              onChange={(e) => setConfig({ ...config, ocrEngineMode: e.target.value })}
              className="input-field"
            >
              {ocrEngineModes.map(engine => (
                <option key={engine.value} value={engine.value}>
                  {engine.value} - {engine.label}
                  {engine.value === '1' ? ' ⭐ RECOMENDADO' : ''}
                </option>
              ))}
            </select>
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-semibold text-blue-800">🚀 ENGINE OTIMIZADA:</div>
              <div className="text-blue-700">
                • <strong>LSTM (modo 1)</strong> é a mais avançada
                • Melhor precisão para texto moderno
                • Recomendado manter esta configuração
              </div>
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DPI de Processamento
              </label>
              <select
                value={config.dpi}
                onChange={(e) => setConfig({ ...config, dpi: Number(e.target.value) })}
                className="input-field"
              >
                <option value={150}>150 DPI (Rápido)</option>
                <option value={300}>300 DPI (Recomendado)</option>
                <option value={600}>600 DPI (Alta qualidade)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Maior DPI = melhor qualidade, mas mais lento
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de Confiança (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.confidenceThreshold}
                onChange={(e) => setConfig({ ...config, confidenceThreshold: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-medium">{config.confidenceThreshold}%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Campos com confiança abaixo deste valor serão ignorados
              </p>
            </div>
          </div>

          {/* Pré-processamento */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.enablePreprocessing}
                onChange={(e) => setConfig({ ...config, enablePreprocessing: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <h4 className="font-semibold text-green-900">Presets Testados e Aprovados</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setConfig(OCR_PRESETS.FORMULARIOS)}
                className="relative group btn-secondary text-xs bg-green-100 border-2 border-green-300 text-green-800 hover:bg-green-200 font-semibold"
                title="🎯 CONFIGURAÇÃO PERFEITA: Detecta 30+ campos automaticamente. Esta configuração foi testada e aprovada para formulários complexos. NÃO ALTERE!"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>🎯</span>
                  <span>Formulários</span>
                  <span className="text-xs">(PERFEITO)</span>
                </div>
                
                {/* Tooltip educativo */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-64">
                  <div className="font-semibold mb-1">✅ CONFIGURAÇÃO TESTADA</div>
                  <div>• Detecta 30+ campos automaticamente</div>
                  <div>• Gemini Vision otimizado</div>
                  <div>• Precisão de 95%+</div>
                  <div className="text-yellow-200 mt-1">⚠️ NÃO altere esta configuração!</div>
                </div>
              </button>
              
              <button
                onClick={() => setConfig(OCR_PRESETS.DOCUMENTOS)}
                className="btn-secondary text-xs"
                title="Para documentos com texto corrido (não formulários)"
              >
                📄 Documentos
              </button>
              <button
                onClick={() => setConfig(OCR_PRESETS.TEXTO_ESPARSO)}
                className="btn-secondary text-xs"
                title="Para documentos de baixa qualidade ou texto esparso"
              >
                🔍 Texto Esparso
              </button>
              <button
                onClick={() => setConfig(OCR_PRESETS.ALTA_QUALIDADE)}
                className="btn-secondary text-xs"
                title="Para PDFs nativos de alta qualidade"
              >
                ⚡ Alta Qualidade
              </button>
            </div>
            
            <div className="bg-white border border-green-300 rounded-lg p-3">
              <div className="text-xs text-green-800 space-y-1">
                <div className="font-semibold flex items-center space-x-1">
                  <span>🎯</span>
                  <span>CONFIGURAÇÃO RECOMENDADA: "Formulários"</span>
                </div>
                <div>• <strong>Detecta 30+ campos</strong> automaticamente</div>
                <div>• <strong>Gemini Vision</strong> otimizado para formulários</div>
                <div>• <strong>Testado e aprovado</strong> para máxima precisão</div>
                <div className="text-red-700 font-semibold mt-2">
                  ⚠️ NÃO altere configurações manuais se estiver funcionando bem!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={handleSaveOnly} 
            className="btn-secondary"
            data-save-only
          >
            Salvar
          </button>
          <button onClick={handleApply} className="btn-primary">
            Salvar e Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}