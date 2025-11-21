/**
 * Script para diagnosticar e corrigir o template FGTS
 */

import { ImageLoaderUtils } from '../lib/image-loader-utils'

const FGTS_TEMPLATE_ID = '6689f861-1e8a-4fa2-868a-6c90cb7459c6'

async function fixFgtsTemplate() {
  console.log('🔧 Iniciando diagnóstico e correção do template FGTS...')
  
  try {
    // 1. Diagnóstico completo
    console.log('\n📊 ETAPA 1: Diagnóstico completo')
    const diagnosis = await ImageLoaderUtils.diagnoseTemplateImages(FGTS_TEMPLATE_ID)
    
    console.log('📋 Resultado do diagnóstico:')
    console.log(`  - Template existe: ${diagnosis.templateExists}`)
    console.log(`  - Tem caminhos de imagem: ${diagnosis.hasImagePaths}`)
    console.log(`  - Número de imagens: ${diagnosis.imageCount}`)
    console.log(`  - Imagens acessíveis: ${diagnosis.accessibleImages}`)
    console.log(`  - Imagens inacessíveis: ${diagnosis.inaccessibleImages.length}`)
    
    if (diagnosis.inaccessibleImages.length > 0) {
      console.log('❌ URLs inacessíveis:')
      diagnosis.inaccessibleImages.forEach(url => console.log(`    - ${url}`))
    }
    
    console.log('✅ URLs válidas:')
    diagnosis.allUrls.forEach(url => console.log(`    - ${url}`))

    // 2. Se há problemas, tentar corrigir
    if (diagnosis.inaccessibleImages.length > 0 || diagnosis.imageCount === 0) {
      console.log('\n🔄 ETAPA 2: Tentando correção automática')
      
      // URL correta conhecida
      const correctImageUrl = 'https://fzbjggdfmdabimsfruqy.supabase.co/storage/v1/object/public/processed-images/processed/proc_1762090081005_w43335805_page_1.png'
      
      // Verificar se a URL correta é acessível
      const isCorrectUrlAccessible = await ImageLoaderUtils.checkUrlAccessibility(correctImageUrl)
      
      if (isCorrectUrlAccessible) {
        console.log('✅ URL correta é acessível, atualizando template...')
        
        const success = await ImageLoaderUtils.forceUpdateTemplateImages(
          FGTS_TEMPLATE_ID,
          [correctImageUrl] // Usar apenas uma imagem por enquanto
        )
        
        if (success) {
          console.log('✅ Template atualizado com sucesso!')
          
          // Verificar novamente
          const newDiagnosis = await ImageLoaderUtils.diagnoseTemplateImages(FGTS_TEMPLATE_ID)
          console.log('📊 Novo diagnóstico:')
          console.log(`  - Imagens acessíveis: ${newDiagnosis.accessibleImages}/${newDiagnosis.imageCount}`)
        } else {
          console.log('❌ Falha ao atualizar template')
        }
      } else {
        console.log('❌ URL correta não está acessível')
      }
    } else {
      console.log('✅ Template está funcionando corretamente!')
    }

    // 3. Teste final
    console.log('\n🧪 ETAPA 3: Teste final')
    const finalUrls = await ImageLoaderUtils.reloadTemplateImages(FGTS_TEMPLATE_ID)
    
    if (finalUrls.length > 0) {
      console.log(`✅ Sucesso! ${finalUrls.length} imagem(ns) carregada(s):`)
      finalUrls.forEach((url, index) => console.log(`  ${index + 1}. ${url}`))
    } else {
      console.log('❌ Ainda há problemas com o carregamento de imagens')
    }

    console.log('\n🎯 Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixFgtsTemplate()
}

export { fixFgtsTemplate }