/**
 * Script para testar a correção de duplicados
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

// Importar a função corrigida (simulação)
function fixDuplicateFields(fields) {
  console.log(`🔍 Analisando ${fields.length} campos para remoção de duplicados...`)
  
  // Agrupar campos por label
  const fieldsByLabel = new Map()
  
  fields.forEach(field => {
    const label = field.label || 'SEM_LABEL'
    if (!fieldsByLabel.has(label)) {
      fieldsByLabel.set(label, [])
    }
    fieldsByLabel.get(label).push(field)
  })
  
  const uniqueFields = []
  let duplicatesRemoved = 0
  
  // Para cada label, manter apenas o melhor campo
  fieldsByLabel.forEach((fieldsWithSameLabel, label) => {
    if (fieldsWithSameLabel.length === 1) {
      // Apenas um campo com este label, manter
      uniqueFields.push(fieldsWithSameLabel[0])
    } else {
      // Múltiplos campos com mesmo label - escolher o melhor
      console.log(`🔄 "${label}": ${fieldsWithSameLabel.length} campos duplicados encontrados`)
      
      const bestField = fieldsWithSameLabel.reduce((best, current) => {
        // Preferir IDs mais simples (sem sufixos longos)
        const bestIdComplexity = (best.id.match(/_/g) || []).length
        const currentIdComplexity = (current.id.match(/_/g) || []).length
        
        if (currentIdComplexity < bestIdComplexity) {
          return current
        } else if (currentIdComplexity > bestIdComplexity) {
          return best
        }
        
        // Se IDs têm mesma complexidade, preferir posições mais organizadas
        const bestPos = best.position
        const currentPos = current.position
        
        if (!bestPos && currentPos) return current
        if (bestPos && !currentPos) return best
        if (!bestPos && !currentPos) return best
        
        // Preferir posições com coordenadas menores (mais organizadas)
        const bestScore = (bestPos.x || 0) + (bestPos.y || 0)
        const currentScore = (currentPos.x || 0) + (currentPos.y || 0)
        
        return currentScore < bestScore ? current : best
      })
      
      uniqueFields.push(bestField)
      duplicatesRemoved += fieldsWithSameLabel.length - 1
      
      console.log(`   ✅ Mantido: "${bestField.id}" (${bestField.position?.x || 0}, ${bestField.position?.y || 0})`)
      
      // Log dos campos removidos
      fieldsWithSameLabel.forEach(field => {
        if (field.id !== bestField.id) {
          console.log(`   ❌ Removido: "${field.id}" (${field.position?.x || 0}, ${field.position?.y || 0})`)
        }
      })
    }
  })
  
  console.log(`✅ Remoção de duplicados concluída:`)
  console.log(`   - Campos antes: ${fields.length}`)
  console.log(`   - Campos depois: ${uniqueFields.length}`)
  console.log(`   - Duplicados removidos: ${duplicatesRemoved}`)
  
  return uniqueFields
}

async function testFixDuplicates() {
  try {
    console.log('🧪 Testando correção de duplicados...\n')
    
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
    console.log(`📊 Campos antes: ${template.fields.length}\n`)
    
    // Aplicar correção
    const fixedFields = fixDuplicateFields(template.fields)
    
    console.log(`\n💾 Salvando campos corrigidos no banco...`)
    
    // Salvar no banco
    const { error: updateError } = await supabase
      .from('form_templates')
      .update({ fields: fixedFields })
      .eq('id', template.id)
    
    if (updateError) {
      throw updateError
    }
    
    console.log(`✅ Campos corrigidos salvos com sucesso!`)
    console.log(`🎉 Template agora tem ${fixedFields.length} campos únicos!`)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testFixDuplicates()
}

module.exports = { testFixDuplicates }