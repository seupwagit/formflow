/**
 * Script para corrigir templates sem imagens
 */

const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// Ler variáveis do .env.local
const envContent = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTemplateImages() {
  try {
    console.log('🔧 Corrigindo templates sem imagens...\n')
    
    // Buscar templates sem imagens
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, pdf_url, image_paths')
      .or('image_paths.is.null,image_paths.eq.[]')
    
    if (error) {
      throw error
    }
    
    if (templates.length === 0) {
      console.log('✅ Todos os templates já têm imagens!')
      return
    }
    
    console.log(`🔧 ${templates.length} templates precisam de correção:\n`)
    
    for (const template of templates) {
      console.log(`📋 Processando: ${template.name}`)
      
      if (!template.pdf_url) {
        console.log('   ❌ Template sem PDF - não é possível gerar imagens')
        continue
      }
      
      try {
        // Simular geração de imagens (placeholder)
        // Em um cenário real, você usaria uma biblioteca como pdf2pic
        const mockImages = [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1 pixel transparente
        ]
        
        // Atualizar template com imagens
        const { error: updateError } = await supabase
          .from('form_templates')
          .update({ 
            image_paths: mockImages,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
        
        if (updateError) {
          throw updateError
        }
        
        console.log('   ✅ Imagens placeholder adicionadas')
        
      } catch (err) {
        console.log(`   ❌ Erro ao processar: ${err.message}`)
      }
      
      console.log('')
    }
    
    console.log('🎉 Correção concluída!')
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('1. Para gerar imagens reais, abra cada template no designer')
    console.log('2. Carregue o PDF novamente')
    console.log('3. As imagens serão geradas automaticamente')
    
  } catch (error) {
    console.error('❌ Erro ao corrigir templates:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixTemplateImages()
}

module.exports = { fixTemplateImages }