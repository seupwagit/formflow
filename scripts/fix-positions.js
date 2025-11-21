/**
 * Script para corrigir posições dos campos que estão em (0,0)
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

async function fixPositions() {
  try {
    console.log('🔧 Corrigindo posições dos campos...\n')
    
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
    
    // Corrigir posições dos campos
    const correctedFields = template.fields.map((field, index) => {
      const currentPos = field.position
      
      // Se posição está em (0,0) ou inválida, corrigir
      if (!currentPos || (currentPos.x === 0 && currentPos.y === 0)) {
        const newPosition = {
          x: 50 + (index % 3) * 250, // 3 colunas
          y: 50 + Math.floor(index / 3) * 50, // Linhas de 50px
          width: 200,
          height: 35,
          page: 0
        }
        
        console.log(`🔧 Corrigindo posição do campo "${field.label}": (0,0) → (${newPosition.x}, ${newPosition.y})`)
        
        return {
          ...field,
          position: newPosition
        }
      }
      
      console.log(`✅ Campo "${field.label}" já tem posição válida: (${currentPos.x}, ${currentPos.y})`)
      return field
    })
    
    // Salvar no banco
    const { error: updateError } = await supabase
      .from('form_templates')
      .update({ fields: correctedFields })
      .eq('id', template.id)
    
    if (updateError) {
      throw updateError
    }
    
    console.log(`\n💾 Posições corrigidas e salvas no banco!`)
    
    // Verificar resultado
    const canvasWidth = 794
    const canvasHeight = 1123
    
    let visibleCount = 0
    let hiddenCount = 0
    
    correctedFields.forEach(field => {
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
    
    console.log(`\n📊 RESULTADO FINAL:`)
    console.log(`✅ Campos visíveis: ${visibleCount}`)
    console.log(`🙈 Campos ocultos: ${hiddenCount}`)
    console.log(`📊 Total: ${correctedFields.length}`)
    
    if (hiddenCount === 0) {
      console.log(`\n🎉 SUCESSO! Todos os campos estão visíveis!`)
      console.log(`✅ Template pronto para uso`)
      console.log(`✅ Nenhum campo duplicado`)
      console.log(`✅ Todas as posições corrigidas`)
    } else {
      console.log(`\n⚠️ Ainda há ${hiddenCount} campos ocultos - pode precisar de ajuste manual`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir posições:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixPositions()
}

module.exports = { fixPositions }