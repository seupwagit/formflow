/**
 * Script para verificar se os templates têm imagens
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

async function checkTemplateImages() {
  try {
    console.log('🔍 Verificando imagens dos templates...\n')
    
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, image_paths, pdf_url')
      .limit(5)
    
    if (error) {
      throw error
    }
    
    console.log(`📊 ${templates.length} templates encontrados:\n`)
    
    templates.forEach((template, index) => {
      console.log(`${index + 1}. 📋 ${template.name}`)
      console.log(`   ID: ${template.id}`)
      console.log(`   PDF URL: ${template.pdf_url ? '✅ SIM' : '❌ NÃO'}`)
      console.log(`   Image Paths: ${template.image_paths ? `✅ ${JSON.stringify(template.image_paths)}` : '❌ NÃO'}`)
      
      if (template.image_paths && Array.isArray(template.image_paths)) {
        console.log(`   📊 ${template.image_paths.length} imagens encontradas`)
        template.image_paths.forEach((path, imgIndex) => {
          console.log(`      ${imgIndex + 1}. ${path.substring(0, 50)}...`)
        })
      }
      console.log('')
    })
    
    // Verificar se há templates sem imagens
    const templatesWithoutImages = templates.filter(t => !t.image_paths || t.image_paths.length === 0)
    
    if (templatesWithoutImages.length > 0) {
      console.log(`⚠️ PROBLEMA ENCONTRADO:`)
      console.log(`${templatesWithoutImages.length} templates SEM IMAGENS:`)
      templatesWithoutImages.forEach(t => {
        console.log(`   - ${t.name} (ID: ${t.id})`)
      })
      
      console.log(`\n💡 SOLUÇÃO:`)
      console.log(`1. Abra o designer com estes templates`)
      console.log(`2. Carregue o PDF novamente para gerar as imagens`)
      console.log(`3. Salve o template para persistir as imagens`)
    } else {
      console.log(`✅ TODOS OS TEMPLATES TÊM IMAGENS!`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar templates:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkTemplateImages()
}

module.exports = { checkTemplateImages }