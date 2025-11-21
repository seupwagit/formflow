/**
 * Script para limpar duplicados e forçar reprocessamento limpo
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

// Função para remover duplicados (mesma lógica do processador)
function removeDuplicatesByLabel(fields) {
  const fieldsByLabel = new Map()
  
  // Agrupar por label
  fields.forEach(field => {
    const normalizedLabel = field.label.trim().toLowerCase()
    if (!fieldsByLabel.has(normalizedLabel)) {
      fieldsByLabel.set(normalizedLabel, [])
    }
    fieldsByLabel.get(normalizedLabel).push(field)
  })
  
  const uniqueFields = []
  
  fieldsByLabel.forEach((fieldsWithSameLabel, label) => {
    if (fieldsWithSameLabel.length === 1) {
      uniqueFields.push(fieldsWithSameLabel[0])
    } else {
      console.log(`🔄 Label duplicado "${label}": ${fieldsWithSameLabel.length} campos encontrados`)
      
      // Escolher o melhor campo baseado em:
      // 1. ID mais simples (sem sufixos longos)
      // 2. Posição mais organizada
      const bestField = fieldsWithSameLabel.reduce((best, current) => {
        // Preferir IDs mais simples
        const bestIdComplexity = (best.id.match(/_/g) || []).length
        const currentIdComplexity = (current.id.match(/_/g) || []).length
        
        if (currentIdComplexity < bestIdComplexity) return current
        if (currentIdComplexity > bestIdComplexity) return best
        
        // Se IDs têm mesma complexidade, preferir posições mais organizadas
        const bestPos = best.position
        const currentPos = current.position
        
        if (!bestPos && currentPos) return current
        if (bestPos && !currentPos) return best
        if (!bestPos && !currentPos) return best
        
        const bestScore = (bestPos.x || 0) + (bestPos.y || 0)
        const currentScore = (currentPos.x || 0) + (currentPos.y || 0)
        
        return currentScore < bestScore ? current : best
      })
      
      uniqueFields.push(bestField)
      console.log(`   ✅ Mantido: "${bestField.id}" (${bestField.position?.x || 0}, ${bestField.position?.y || 0})`)
      
      fieldsWithSameLabel.forEach(field => {
        if (field.id !== bestField.id) {
          console.log(`   ❌ Removido: "${field.id}" (${field.position?.x || 0}, ${field.position?.y || 0})`)
        }
      })
    }
  })
  
  return uniqueFields
}

async function cleanAndReprocess() {
  try {
    console.log('🧹 LIMPEZA E REPROCESSAMENTO LIMPO...\n')
    
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
    console.log(`📊 Campos antes da limpeza: ${template.fields.length}`)
    
    // ETAPA 1: Remover duplicados imediatamente
    const cleanedFields = removeDuplicatesByLabel(template.fields)
    console.log(`✅ Campos após limpeza: ${cleanedFields.length}`)
    
    // ETAPA 2: Garantir IDs únicos
    const usedIds = new Set()
    const finalFields = cleanedFields.map((field, index) => {
      let uniqueId = field.id
      let counter = 1
      
      while (usedIds.has(uniqueId)) {
        uniqueId = `${field.id}_${counter}`
        counter++
      }
      
      usedIds.add(uniqueId)
      
      return {
        ...field,
        id: uniqueId,
        name: uniqueId // Garantir que name = id
      }
    })
    
    console.log(`🔧 IDs únicos garantidos: ${finalFields.length} campos`)
    
    // ETAPA 3: Salvar no banco
    const { error: updateError } = await supabase
      .from('form_templates')
      .update({ fields: finalFields })
      .eq('id', template.id)
    
    if (updateError) {
      throw updateError
    }
    
    console.log(`💾 Template limpo salvo no banco!`)
    
    // ETAPA 4: Verificação final
    const labelCounts = new Map()
    const idCounts = new Map()
    
    finalFields.forEach(field => {
      const label = field.label || 'SEM LABEL'
      const id = field.id || 'SEM ID'
      
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
      idCounts.set(id, (idCounts.get(id) || 0) + 1)
    })
    
    const duplicateLabels = Array.from(labelCounts.entries()).filter(([_, count]) => count > 1)
    const duplicateIds = Array.from(idCounts.entries()).filter(([_, count]) => count > 1)
    
    console.log(`\n📊 VERIFICAÇÃO FINAL:`)
    console.log(`✅ Campos únicos: ${finalFields.length}`)
    console.log(`✅ Labels únicos: ${labelCounts.size}`)
    console.log(`✅ IDs únicos: ${idCounts.size}`)
    console.log(`🔄 Labels duplicados: ${duplicateLabels.length}`)
    console.log(`🆔 IDs duplicados: ${duplicateIds.length}`)
    
    if (duplicateLabels.length === 0 && duplicateIds.length === 0) {
      console.log(`\n🎉 SUCESSO TOTAL!`)
      console.log(`✅ Template completamente limpo`)
      console.log(`✅ Nenhum campo duplicado`)
      console.log(`✅ Todos os campos únicos`)
      console.log(`✅ Pronto para uso sem problemas`)
      
      console.log(`\n📋 PRÓXIMOS PASSOS:`)
      console.log(`1. Recarregue a página do designer (F5)`)
      console.log(`2. Abra o template FGTS`)
      console.log(`3. Todos os ${finalFields.length} campos devem estar visíveis e únicos`)
      console.log(`4. Teste salvar/sair/entrar - deve persistir corretamente`)
      console.log(`5. Se precisar de mais campos, use "Reprocessar com IA" - agora sem duplicados`)
    } else {
      console.log(`\n⚠️ AINDA HÁ PROBLEMAS - isso não deveria acontecer!`)
    }
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanAndReprocess()
}

module.exports = { cleanAndReprocess }