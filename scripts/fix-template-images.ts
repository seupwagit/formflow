/**
 * Script para corrigir e associar imagens de fundo aos templates
 */

import { TemplateBackgroundManager } from '../lib/template-background-manager'
import { StorageImageManager } from '../lib/storage-image-manager'

async function fixTemplateImages() {
  console.log('🔧 Iniciando correção de imagens de templates...')
  
  try {
    // 1. Listar imagens disponíveis no storage
    console.log('📋 Listando imagens disponíveis no storage...')
    const availableImages = await StorageImageManager.listProcessedImages()
    console.log(`📸 Encontradas ${availableImages.length} imagens no storage:`)
    
    availableImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.name} (${img.publicUrl})`)
    })

    // 2. Executar migração completa
    console.log('\n🔄 Executando migração completa...')
    await TemplateBackgroundManager.migrateExistingTemplates()

    // 3. Verificar resultado
    console.log('\n✅ Verificando resultado da migração...')
    
    // Importar supabase dinamicamente para evitar problemas de módulo
    const { supabase } = await import('../lib/supabase')
    
    const { data: templates } = await supabase
      .from('form_templates')
      .select('id, name, image_paths')

    if (templates) {
      console.log('\n📊 Status dos templates após migração:')
      templates.forEach(template => {
        const templateData = template as any
        const imageCount = templateData.image_paths?.length || 0
        const status = imageCount > 0 ? '✅' : '❌'
        console.log(`  ${status} ${templateData.name}: ${imageCount} imagem(ns)`)
        
        if (templateData.image_paths && templateData.image_paths.length > 0) {
          templateData.image_paths.forEach((path: string, index: number) => {
            console.log(`    - Página ${index + 1}: ${path}`)
          })
        }
      })
    }

    console.log('\n🎯 Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro na correção:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixTemplateImages()
}

export { fixTemplateImages }