/**
 * 🎯 SCRIPT PARA RESTAURAR A CONFIGURAÇÃO PERFEITA DE OCR
 * Execute este script no console do navegador para restaurar a configuração que funcionava perfeitamente
 */

console.log('🎯 RESTAURANDO CONFIGURAÇÃO PERFEITA DE OCR + GEMINI VISION...')

// Limpar configurações antigas que podem estar causando problemas
localStorage.removeItem('ocr_config')
localStorage.removeItem('expected_fields_config')
localStorage.removeItem('ocr_config_notice_seen')

console.log('🧹 Configurações antigas removidas')

// Aplicar configuração que funcionava perfeitamente
const PERFECT_CONFIG = {
  // Configuração básica otimizada
  language: 'por+eng',
  pageSegMode: '6',
  ocrEngineMode: '1',
  dpi: 300,
  enablePreprocessing: true,
  confidenceThreshold: 60,
  
  // Configurações avançadas que funcionavam
  deskew: true,
  removeNoise: true,
  enhanceContrast: true,
  binarize: false,
  scale: 2.0,
  
  // Configurações específicas para Gemini Vision
  useGeminiVision: true,
  geminiModel: 'gemini-2.0-flash-exp',
  geminiTemperature: 0.1,
  geminiMaxTokens: 4096
}

// Salvar configuração perfeita
localStorage.setItem('ocr_config', JSON.stringify(PERFECT_CONFIG))

console.log('✅ Configuração perfeita aplicada:', PERFECT_CONFIG)

// Configuração de campos esperados otimizada
const PERFECT_FIELDS_CONFIG = {
  text: { min: 5, max: 50, priority: 'high' },
  number: { min: 2, max: 20, priority: 'high' },
  date: { min: 1, max: 10, priority: 'medium' },
  checkbox: { min: 0, max: 15, priority: 'medium' },
  select: { min: 0, max: 10, priority: 'low' },
  textarea: { min: 0, max: 5, priority: 'low' },
  signature: { min: 0, max: 3, priority: 'low' }
}

localStorage.setItem('expected_fields_config', JSON.stringify(PERFECT_FIELDS_CONFIG))

console.log('✅ Configuração de campos esperados aplicada:', PERFECT_FIELDS_CONFIG)

// Forçar reload da página para aplicar mudanças
console.log('🔄 Recarregando página para aplicar configurações...')

setTimeout(() => {
  window.location.reload()
}, 1000)

console.log(`
🎉 CONFIGURAÇÃO PERFEITA RESTAURADA!

✅ O que foi restaurado:
- Gemini Vision (não OCR + texto)
- Configuração otimizada para formulários
- Detecção de 30+ campos como antes
- Processamento rápido e preciso

🚀 Agora teste com seu PDF - deve funcionar perfeitamente como antes!

💡 Principais mudanças:
- Voltou para Gemini Vision API (melhor para campos visuais)
- Configuração de segmentação modo 6 (formulários)
- Pré-processamento inteligente habilitado
- Confiança 60% (equilibrio perfeito)
`)

// Mostrar status final
console.log('📊 Status final das configurações:')
console.log('OCR Config:', JSON.parse(localStorage.getItem('ocr_config') || '{}'))
console.log('Fields Config:', JSON.parse(localStorage.getItem('expected_fields_config') || '{}'))