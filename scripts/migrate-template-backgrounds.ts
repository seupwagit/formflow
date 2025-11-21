/**
 * Script para migrar templates existentes para o sistema de versionamento de imagens de fundo
 */

import { TemplateBackgroundManager } from '../lib/template-background-manager'

async function migrateTemplateBackgrounds() {
  console.log('🔄 Iniciando migração de templates para sistema de versionamento...')
  
  try {
    await TemplateBackgroundManager.migrateExistingTemplates()
    console.log('✅ Migração concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateTemplateBackgrounds()
}

export { migrateTemplateBackgrounds }