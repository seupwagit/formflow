/**
 * Script para testar se a prevenção de duplicados está funcionando
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

async function testNoDuplicates() {
  try {
    console.log('🧪 TESTE: Verificando se duplicados foram eliminados na origem...\n')
    
    // Buscar template FGTS
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, fields')
      .ilike('name', '%fgts%')
    
    if (error) {
      throw error
    }
    
    if (templates.length === 0) {
      console.log('❌ Nenhum template FGTS encontrado')
      return
    }
    
    const template = templates[0]
    console.log(`📋 Template: ${template.name}`)
    console.log(`📊 Total de campos: ${template.fields.length}`)
    
    // Análise de duplicados
    const labelCounts = new Map()
    const idCounts = new Map()
    
    template.fields.forEach(field => {
      const label = field.label || 'SEM LABEL'
      const id = field.id || 'SEM ID'
      
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
      idCounts.set(id, (idCounts.get(id) || 0) + 1)
    })
    
    const duplicateLabels = Array.from(labelCounts.entries()).filter(([_, count]) => count > 1)
    const duplicateIds = Array.from(idCounts.entries()).filter(([_, count]) => count > 1)
    
    console.log(`\n📊 ANÁLISE DE DUPLICADOS:`)
    console.log(`Labels únicos: ${labelCounts.size}`)
    console.log(`IDs únicos: ${idCounts.size}`)
    console.log(`Labels duplicados: ${duplicateLabels.length}`)
    console.log(`IDs duplicados: ${duplicateIds.length}`)
    
    if (duplicateLabels.length > 0) {
      console.log(`\n🔄 LABELS DUPLICADOS:`)
      duplicateLabels.forEach(([label, count]) => {
        console.log(`  - "${label}" aparece ${count} vezes`)
      })
    }
    
    if (duplicateIds.length > 0) {
      console.log(`\n🆔 IDS DUPLICADOS:`)
      duplicateIds.forEach(([id, count]) => {
        console.log(`  - "${id}" aparece ${count} vezes`)
      })
    }
    
    // Análise de visibilidade
    const canvasWidth = 794
    const canvasHeight = 1123
    
    let visibleCount = 0
    let hiddenCount = 0
    
    template.fields.forEach(field => {
      if (!field.position) {
        hiddenCount++
        return
      }
      
      const x = field.position.x || 0
      const y = field.position.y || 0
      const width = field.position.width || 200
      const height = field.position.height || 35
      
      const rightEdge = x + width
      const bottomEdge = y + height
      
      const isVisible = x >= 0 && y >= 0 && rightEdge <= canvasWidth && bottomEdge <= canvasHeight
      
      if (isVisible) {
        visibleCount++
      } else {
        hiddenCount++
      }
    })
    
    console.log(`\n📊 ANÁLISE DE VISIBILIDADE:`)
    console.log(`✅ Campos visíveis: ${visibleCount}`)
    console.log(`🙈 Campos ocultos: ${hiddenCount}`)
    
    // Resultado final
    const isSuccess = duplicateLabels.length === 0 && duplicateIds.length === 0 && hiddenCount === 0
    
    console.log(`\n🎯 RESULTADO DO TESTE:`)
    if (isSuccess) {
      console.log(`✅ SUCESSO! Problema resolvido na origem:`)
      console.log(`   - Nenhum campo duplicado`)
      console.log(`   - Todos os campos visíveis`)
      console.log(`   - Template limpo e funcional`)
    } else {
      console.log(`❌ AINDA HÁ PROBLEMAS:`)
      if (duplicateLabels.length > 0) console.log(`   - ${duplicateLabels.length} labels duplicados`)
      if (duplicateIds.length > 0) console.log(`   - ${duplicateIds.length} IDs duplicados`)
      if (hiddenCount > 0) console.log(`   - ${hiddenCount} campos ocultos`)
      console.log(`\n💡 RECOMENDAÇÃO: Reprocessar o PDF com OCR/IA para aplicar as novas correções`)
    }
    
    console.log(`\n📋 PRÓXIMOS PASSOS:`)
    console.log(`1. Se ainda há duplicados: Reprocesse o PDF com o botão "Reprocessar com IA"`)
    console.log(`2. Se não há duplicados: Teste salvar/sair/entrar para verificar persistência`)
    console.log(`3. As mudanças devem persistir corretamente agora`)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testNoDuplicates()
}

module.exports = { testNoDuplicates }