/**
 * Script para migrar configurações OCR existentes para o novo formato unificado
 * Execute este script no console do navegador para migrar configurações salvas
 */

console.log('🔄 Iniciando migração de configurações OCR...')

// Configuração padrão otimizada
const DEFAULT_OCR_CONFIG = {
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

try {
  // Verificar se existe configuração antiga
  const oldConfig = localStorage.getItem('ocr_config')
  
  if (oldConfig) {
    const parsed = JSON.parse(oldConfig)
    console.log('📋 Configuração atual encontrada:', parsed)
    
    // Se já está no formato novo, apenas validar
    if (parsed.pageSegMode && parsed.ocrEngineMode) {
      console.log('✅ Configuração já está no formato novo')
      
      // Garantir que tem todas as propriedades
      const updatedConfig = { ...DEFAULT_OCR_CONFIG, ...parsed }
      localStorage.setItem('ocr_config', JSON.stringify(updatedConfig))
      console.log('✅ Configuração atualizada com propriedades faltantes:', updatedConfig)
      
    } else {
      // Migrar do formato antigo
      console.log('🔄 Migrando do formato antigo...')
      
      const migratedConfig = {
        ...DEFAULT_OCR_CONFIG,
        language: parsed.language || DEFAULT_OCR_CONFIG.language,
        confidenceThreshold: parsed.confidence 
          ? Math.round(parsed.confidence * 100) 
          : DEFAULT_OCR_CONFIG.confidenceThreshold,
        enablePreprocessing: parsed.preprocessing ?? DEFAULT_OCR_CONFIG.enablePreprocessing,
        deskew: parsed.deskew ?? DEFAULT_OCR_CONFIG.deskew,
        removeNoise: parsed.removeNoise ?? DEFAULT_OCR_CONFIG.removeNoise,
        enhanceContrast: parsed.enhanceContrast ?? DEFAULT_OCR_CONFIG.enhanceContrast,
        binarize: parsed.binarize ?? DEFAULT_OCR_CONFIG.binarize,
        scale: parsed.scale ?? DEFAULT_OCR_CONFIG.scale
      }
      
      localStorage.setItem('ocr_config', JSON.stringify(migratedConfig))
      console.log('✅ Configuração migrada com sucesso:', migratedConfig)
    }
    
  } else {
    // Primeira vez - usar configuração padrão otimizada
    console.log('📋 Primeira configuração - usando padrão otimizado')
    localStorage.setItem('ocr_config', JSON.stringify(DEFAULT_OCR_CONFIG))
    console.log('✅ Configuração padrão salva:', DEFAULT_OCR_CONFIG)
  }
  
  console.log('🎉 Migração concluída com sucesso!')
  console.log('💡 A configuração padrão foi otimizada para melhor detecção de campos em formulários')
  
} catch (error) {
  console.error('❌ Erro na migração:', error)
  
  // Em caso de erro, usar configuração padrão
  localStorage.setItem('ocr_config', JSON.stringify(DEFAULT_OCR_CONFIG))
  console.log('🔧 Configuração padrão aplicada como fallback')
}

// Mostrar configuração final
const finalConfig = JSON.parse(localStorage.getItem('ocr_config'))
console.log('📊 Configuração final:', finalConfig)

console.log(`
🎯 CONFIGURAÇÃO OTIMIZADA APLICADA:

✅ Idioma: Português + Inglês (melhor cobertura)
✅ Modo de Segmentação: 6 (bloco uniforme - ideal para formulários)  
✅ Engine: LSTM (melhor precisão)
✅ DPI: 300 (boa qualidade)
✅ Pré-processamento: Habilitado
✅ Limite de Confiança: 60% (equilibrio)
✅ Escala: 2x (melhor reconhecimento)

Esta configuração foi otimizada especificamente para detecção de campos em formulários!
`)