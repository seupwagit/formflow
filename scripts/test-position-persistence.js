/**
 * Script para testar se as posições dos campos estão sendo persistidas corretamente
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

async function testPositionPersistence() {
  try {
    console.log('🔍 Testando persistência de posições dos campos...\n')
    
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
    console.log(`📋 Analisando template: ${template.name}`)
    console.log(`📊 Total de campos: ${template.fields.length}`)
    
    // Analisar posições dos campos
    let fieldsWithValidPositions = 0
    let fieldsWithInvalidPositions = 0
    let hiddenFields = []
    let visibleFields = []
    
    // Assumindo canvas de 794x1123 (A4)
    const canvasWidth = 794
    const canvasHeight = 1123
    
    template.fields.forEach((field, index) => {
      const pos = field.position
      
      if (!pos || pos.x === undefined || pos.y === undefined) {
        fieldsWithInvalidPositions++
        console.log(`❌ Campo ${index + 1} sem posição válida: ${field.label}`)
        return
      }
      
      fieldsWithValidPositions++
      
      // Verificar se está dentro da área visível
      const isVisible = pos.x >= 0 && pos.y >= 0 && 
                       pos.x + (pos.width || 200) <= canvasWidth && 
                       pos.y + (pos.height || 35) <= canvasHeight
      
      if (isVisible) {
        visibleFields.push({
          label: field.label,
          position: `(${Math.round(pos.x)}, ${Math.round(pos.y)})`
        })
      } else {
        hiddenFields.push({
          label: field.label,
          position: `(${Math.round(pos.x)}, ${Math.round(pos.y)})`,
          reason: pos.x < 0 ? 'X negativo' : 
                  pos.y < 0 ? 'Y negativo' :
                  pos.x + (pos.width || 200) > canvasWidth ? 'Fora da largura' :
                  pos.y + (pos.height || 35) > canvasHeight ? 'Fora da altura' : 'Desconhecido'
        })
      }
    })
    
    console.log(`\n📊 ANÁLISE DE POSIÇÕES:`)
    console.log(`✅ Campos com posições válidas: ${fieldsWithValidPositions}`)
    console.log(`❌ Campos com posições inválidas: ${fieldsWithInvalidPositions}`)
    console.log(`👁️ Campos visíveis: ${visibleFields.length}`)
    console.log(`🙈 Campos ocultos: ${hiddenFields.length}`)
    
    if (hiddenFields.length > 0) {
      console.log(`\n🙈 CAMPOS OCULTOS (${hiddenFields.length}):`)
      hiddenFields.forEach((field, index) => {
        console.log(`  ${index + 1}. "${field.label}" em ${field.position} - ${field.reason}`)
      })
      
      console.log(`\n⚠️ PROBLEMA DETECTADO: ${hiddenFields.length} campos estão fora da área visível!`)
      console.log(`💡 SOLUÇÃO: Use o botão "Reorganizar Campos Ocultos" no designer`)
    } else {
      console.log(`\n✅ EXCELENTE: Todos os campos estão na área visível!`)
    }
    
    // Verificar se há campos com posições duplicadas
    const positionMap = new Map()
    const duplicatePositions = []
    
    template.fields.forEach(field => {
      if (field.position) {
        const posKey = `${Math.round(field.position.x)}_${Math.round(field.position.y)}`
        if (positionMap.has(posKey)) {
          duplicatePositions.push({
            position: posKey,
            fields: [positionMap.get(posKey), field.label]
          })
        } else {
          positionMap.set(posKey, field.label)
        }
      }
    })
    
    if (duplicatePositions.length > 0) {
      console.log(`\n🔄 POSIÇÕES DUPLICADAS (${duplicatePositions.length}):`)
      duplicatePositions.forEach((dup, index) => {
        console.log(`  ${index + 1}. Posição ${dup.position}: "${dup.fields[0]}" e "${dup.fields[1]}"`)
      })
    } else {
      console.log(`\n✅ Todas as posições são únicas`)
    }
    
    // Resumo final
    console.log(`\n📊 RESUMO FINAL:`)
    console.log(`Total de campos: ${template.fields.length}`)
    console.log(`Posições válidas: ${fieldsWithValidPositions} ${fieldsWithInvalidPositions === 0 ? '✅' : '❌'}`)
    console.log(`Campos visíveis: ${visibleFields.length} ${hiddenFields.length === 0 ? '✅' : '❌'}`)
    console.log(`Posições únicas: ${positionMap.size} ${duplicatePositions.length === 0 ? '✅' : '❌'}`)
    
    if (fieldsWithInvalidPositions === 0 && hiddenFields.length === 0 && duplicatePositions.length === 0) {
      console.log(`\n🎉 TEMPLATE PERFEITO: Todas as posições estão corretas e persistidas!`)
    } else {
      console.log(`\n⚠️ TEMPLATE PRECISA DE AJUSTES: Há problemas com as posições`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar persistência de posições:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testPositionPersistence()
}

module.exports = { testPositionPersistence }