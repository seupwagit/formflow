/**
 * Script para detectar e corrigir IDs duplicados que causam comportamento espelhado
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

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

// Função para gerar ID único baseado em posição e timestamp
function generateUniqueId(label, position, existingIds) {
  const baseId = (label || 'field')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 20)
  
  // Usar posição se disponível, senão usar valores padrão
  const x = position?.x || Math.random() * 1000
  const y = position?.y || Math.random() * 1000
  const page = position?.page || 0
  
  const positionHash = `${Math.round(x)}_${Math.round(y)}_${page}`
  const timestamp = Date.now().toString().slice(-6)
  
  let uniqueId = `${baseId}_${positionHash}_${timestamp}`
  let counter = 1
  
  while (existingIds.has(uniqueId)) {
    uniqueId = `${baseId}_${positionHash}_${timestamp}_${counter}`
    counter++
  }
  
  return uniqueId
}

// Função principal
async function fixDuplicateIds() {
  try {
    console.log('🔍 Detectando campos com IDs duplicados...')
    
    // Buscar todos os templates
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, fields')
    
    if (error) {
      throw error
    }
    
    for (const template of templates) {
      if (!template.fields || !Array.isArray(template.fields)) {
        continue
      }
      
      console.log(`\\n📋 Analisando template: ${template.name}`)
      
      // Detectar IDs duplicados
      const idCounts = {}
      const duplicateIds = new Set()
      
      template.fields.forEach(field => {
        if (idCounts[field.id]) {
          idCounts[field.id]++
          duplicateIds.add(field.id)
        } else {
          idCounts[field.id] = 1
        }
      })
      
      if (duplicateIds.size === 0) {
        console.log(`✅ ${template.name}: Nenhum ID duplicado encontrado`)
        continue
      }
      
      console.log(`🚨 ${template.name}: ${duplicateIds.size} IDs duplicados encontrados:`)
      duplicateIds.forEach(id => {
        console.log(`  - "${id}" aparece ${idCounts[id]} vezes`)
      })
      
      // Corrigir IDs duplicados
      const existingIds = new Set()
      const correctedFields = []
      let correctionCount = 0
      
      template.fields.forEach(field => {
        if (duplicateIds.has(field.id) && existingIds.has(field.id)) {
          // Este é um ID duplicado, gerar novo ID único
          const newId = generateUniqueId(field.label, field.position, existingIds)
          const correctedField = { ...field, id: newId }
          
          console.log(`  🔧 Corrigindo: "${field.id}" → "${newId}" (${field.label})`)
          
          correctedFields.push(correctedField)
          existingIds.add(newId)
          correctionCount++
        } else {
          // ID único, manter como está
          correctedFields.push(field)
          existingIds.add(field.id)
        }
      })
      
      // Atualizar no banco se houve correções
      if (correctionCount > 0) {
        const { error: updateError } = await supabase
          .from('form_templates')
          .update({ fields: correctedFields })
          .eq('id', template.id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar ${template.name}:`, updateError)
        } else {
          console.log(`✅ ${template.name}: ${correctionCount} IDs duplicados corrigidos`)
          
          // Verificar se ainda há duplicatas
          const finalIdCounts = {}
          correctedFields.forEach(field => {
            finalIdCounts[field.id] = (finalIdCounts[field.id] || 0) + 1
          })
          
          const remainingDuplicates = Object.entries(finalIdCounts)
            .filter(([id, count]) => count > 1)
          
          if (remainingDuplicates.length > 0) {
            console.log(`⚠️ ${template.name}: Ainda há ${remainingDuplicates.length} IDs duplicados:`)
            remainingDuplicates.forEach(([id, count]) => {
              console.log(`  - "${id}" aparece ${count} vezes`)
            })
          } else {
            console.log(`🎉 ${template.name}: Todos os IDs agora são únicos!`)
          }
        }
      }
    }
    
    console.log('\\n🎉 Correção de IDs duplicados concluída!')
    
  } catch (error) {
    console.error('❌ Erro na correção:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixDuplicateIds()
}

module.exports = { fixDuplicateIds }