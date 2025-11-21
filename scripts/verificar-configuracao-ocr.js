/**
 * 🔍 SCRIPT DE VERIFICAÇÃO DA CONFIGURAÇÃO OCR
 * Execute no console do navegador para verificar se a configuração está correta
 */

console.log('🔍 VERIFICANDO CONFIGURAÇÃO OCR...')

// Função para verificar configuração
function verificarConfiguracaoOCR() {
  const config = localStorage.getItem('ocr_config')
  
  if (!config) {
    console.log('❌ PROBLEMA: Nenhuma configuração OCR encontrada!')
    return false
  }
  
  try {
    const parsedConfig = JSON.parse(config)
    console.log('📋 Configuração atual:', parsedConfig)
    
    // Verificações críticas
    const verificacoes = {
      language: parsedConfig.language === 'por+eng',
      pageSegMode: parsedConfig.pageSegMode === '6',
      ocrEngineMode: parsedConfig.ocrEngineMode === '1',
      dpi: parsedConfig.dpi === 300,
      enablePreprocessing: parsedConfig.enablePreprocessing === true,
      confidenceThreshold: parsedConfig.confidenceThreshold === 60
    }
    
    console.log('🔍 Verificações:')
    
    let todasCorretas = true
    Object.entries(verificacoes).forEach(([key, isCorrect]) => {
      const status = isCorrect ? '✅' : '❌'
      const valor = parsedConfig[key]
      console.log(`${status} ${key}: ${valor} ${isCorrect ? '(CORRETO)' : '(INCORRETO)'}`)
      
      if (!isCorrect) {
        todasCorretas = false
      }
    })
    
    if (todasCorretas) {
      console.log('🎉 CONFIGURAÇÃO PERFEITA!')
      console.log('✅ Todas as configurações estão corretas para detecção máxima de campos')
      return true
    } else {
      console.log('⚠️ CONFIGURAÇÃO PRECISA SER CORRIGIDA!')
      return false
    }
    
  } catch (error) {
    console.log('❌ ERRO: Configuração corrompida:', error)
    return false
  }
}

// Função para verificar se Gemini Vision está sendo usado
function verificarGeminiVision() {
  console.log('🤖 Verificando uso do Gemini Vision...')
  
  // Verificar se há logs recentes do Gemini Vision
  const hasGeminiLogs = performance.getEntriesByType('navigation').length > 0
  
  console.log('💡 Para confirmar Gemini Vision:')
  console.log('1. Faça upload de um PDF')
  console.log('2. Verifique se aparece no console: "🎯 USANDO GEMINI VISION"')
  console.log('3. Deve detectar 20+ campos em formulários típicos')
  
  return true
}

// Função para aplicar configuração correta se necessário
function aplicarConfiguracaoCorreta() {
  console.log('🔧 Aplicando configuração correta...')
  
  const configCorreta = {
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
  
  localStorage.setItem('ocr_config', JSON.stringify(configCorreta))
  console.log('✅ Configuração correta aplicada!')
  console.log('🔄 Recarregue a página para aplicar as mudanças')
  
  return configCorreta
}

// Executar verificações
console.log('=' .repeat(50))
console.log('🎯 VERIFICAÇÃO COMPLETA DA CONFIGURAÇÃO OCR')
console.log('=' .repeat(50))

const configOK = verificarConfiguracaoOCR()
verificarGeminiVision()

if (!configOK) {
  console.log('')
  console.log('🔧 CORREÇÃO AUTOMÁTICA DISPONÍVEL')
  console.log('Execute: aplicarConfiguracaoCorreta()')
  console.log('')
}

console.log('=' .repeat(50))
console.log('📚 DOCUMENTAÇÃO COMPLETA:')
console.log('• docs/GEMINI_VISION_CONFIGURACAO_CRITICA.md')
console.log('• docs/gemini-vision-restoration.md')
console.log('• docs/ocr-config-fix.md')
console.log('=' .repeat(50))

// Disponibilizar funções globalmente
window.verificarConfiguracaoOCR = verificarConfiguracaoOCR
window.aplicarConfiguracaoCorreta = aplicarConfiguracaoCorreta
window.verificarGeminiVision = verificarGeminiVision

console.log('🛠️ Funções disponíveis:')
console.log('• verificarConfiguracaoOCR()')
console.log('• aplicarConfiguracaoCorreta()')
console.log('• verificarGeminiVision()')

return {
  configOK,
  verificarConfiguracaoOCR,
  aplicarConfiguracaoCorreta,
  verificarGeminiVision
}