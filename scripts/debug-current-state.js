/**
 * Script para debugar o estado atual dos campos
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

async function debugCurrentState() {
  try {
    console.log('🔍 Debug do estado atual dos campos...\n')
    
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
    console.log(`📊 Total de campos: ${template.fields.length}\n`)
    
    // Parâmetros do canvas
    const canvasWidth = 794
    const canvasHeight = 1123
    
    console.log(`🖼️ Canvas: ${canvasWidth}x${canvasHeight}\n`)
    
    // Analisar cada campo
    let visibleCount = 0
    let hiddenCount = 0
    let noPositionCount = 0
    
    console.log('📋 ANÁLISE DETALHADA:')
    console.log('=' .repeat(80))
    
    template.fields.forEach((field, index) => {
      const pos = field.position
      
      if (!pos) {
        console.log(`${(index + 1).toString().padStart(2)}. ❌ SEM POSIÇÃO: "${field.label}" (ID: ${field.id})`)
        noPositionCount++
        return
      }
      
      const x = pos.x || 0
      const y = pos.y || 0
      const width = pos.width || 200
      const height = pos.height || 35
      
      const rightEdge = x + width
      const bottomEdge = y + height
      
      const isVisible = x >= 0 && y >= 0 && rightEdge <= canvasWidth && bottomEdge <= canvasHeight
      
      const status = isVisible ? '✅ VISÍVEL' : '🙈 OCULTO'
      const reason = !isVisible ? 
        (x < 0 ? ' (X < 0)' :
         y < 0 ? ' (Y < 0)' :
         rightEdge > canvasWidth ? ` (X+W=${rightEdge} > ${canvasWidth})` :
         bottomEdge > canvasHeight ? ` (Y+H=${bottomEdge} > ${canvasHeight})` : ' (?)') : ''
      
      console.log(`${(index + 1).toString().padStart(2)}. ${status}${reason}: "${field.label}"`)
      console.log(`    ID: ${field.id}`)
      console.log(`    Posição: (${x}, ${y}) Tamanho: ${width}x${height} Bordas: (${rightEdge}, ${bottomEdge})`)
      console.log(`    Page: ${pos.page || 0}`)
      console.log('')
      
      if (isVisible) {
        visibleCount++
      } else {
        hiddenCount++
      }
    })
    
    console.log('=' .repeat(80))
    console.log(`\n📊 RESUMO:`)
    console.log(`✅ Campos visíveis: ${visibleCount}`)
    console.log(`🙈 Campos ocultos: ${hiddenCount}`)
    console.log(`❌ Sem posição: ${noPositionCount}`)
    console.log(`📊 Total: ${template.fields.length}`)
    
    // Verificar se há duplicatas por label
    const labelCounts = new Map()
    template.fields.forEach(field => {
      const label = field.label || 'SEM LABEL'
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
    })
    
    const duplicateLabels = []
    labelCounts.forEach((count, label) => {
      if (count > 1) {
        duplicateLabels.push({ label, count })
      }
    })
    
    if (duplicateLabels.length > 0) {
      console.log(`\n🔄 LABELS DUPLICADOS (${duplicateLabels.length}):`)
      duplicateLabels.forEach(dup => {
        console.log(`  - "${dup.label}" aparece ${dup.count} vezes`)
      })
    }
    
    if (hiddenCount > 0 || noPositionCount > 0) {
      console.log(`\n🚨 PROBLEMA: ${hiddenCount + noPositionCount} campos não estão visíveis!`)
    } else {
      console.log(`\n🎉 PERFEITO: Todos os campos estão visíveis!`)
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugCurrentState()
}

module.exports = { debugCurrentState }