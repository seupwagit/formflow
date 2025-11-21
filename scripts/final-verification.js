/**
 * Script de verificação final - testa se o problema foi resolvido
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

async function finalVerification() {
  try {
    console.log('🔍 VERIFICAÇÃO FINAL - Problema de campos ocultos\n')
    
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
    
    // Parâmetros do canvas
    const canvasWidth = 794
    const canvasHeight = 1123
    
    // Análise de visibilidade
    let visibleCount = 0
    let hiddenCount = 0
    let noPositionCount = 0
    
    template.fields.forEach(field => {
      if (!field.position) {
        noPositionCount++
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
    
    console.log(`\n📊 RESULTADOS:`)
    console.log(`✅ Campos visíveis: ${visibleCount}`)
    console.log(`🙈 Campos ocultos: ${hiddenCount}`)
    console.log(`❌ Sem posição: ${noPositionCount}`)
    console.log(`🔄 Labels duplicados: ${duplicateLabels.length}`)
    console.log(`🆔 IDs duplicados: ${duplicateIds.length}`)
    
    // Verificação final
    const isFixed = hiddenCount === 0 && noPositionCount === 0 && duplicateLabels.length === 0 && duplicateIds.length === 0
    
    console.log(`\n🎯 RESULTADO FINAL:`)
    if (isFixed) {
      console.log(`✅ PROBLEMA RESOLVIDO!`)
      console.log(`🎉 Todos os ${template.fields.length} campos estão visíveis e únicos!`)
      console.log(`💡 O template está pronto para uso sem problemas de campos ocultos.`)
    } else {
      console.log(`❌ PROBLEMA AINDA EXISTE:`)
      if (hiddenCount > 0) console.log(`   - ${hiddenCount} campos ocultos`)
      if (noPositionCount > 0) console.log(`   - ${noPositionCount} campos sem posição`)
      if (duplicateLabels.length > 0) console.log(`   - ${duplicateLabels.length} labels duplicados`)
      if (duplicateIds.length > 0) console.log(`   - ${duplicateIds.length} IDs duplicados`)
    }
    
    // Instruções para o usuário
    console.log(`\n📋 INSTRUÇÕES:`)
    console.log(`1. Recarregue a página do designer (F5)`)
    console.log(`2. Abra o template FGTS`)
    console.log(`3. Todos os campos devem estar visíveis`)
    console.log(`4. Salve e saia - os campos devem permanecer visíveis`)
    console.log(`5. Se o problema voltar, use o botão "Corrigir Duplicados"`)
    
  } catch (error) {
    console.error('❌ Erro na verificação final:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  finalVerification()
}

module.exports = { finalVerification }