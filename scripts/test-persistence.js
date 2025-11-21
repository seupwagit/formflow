/**
 * Script para testar se as correções de IDs duplicados estão sendo persistidas
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

async function testPersistence() {
  try {
    console.log('🔍 Verificando persistência de correções de IDs...\n')
    
    // Buscar template FGTS
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, fields')
      .ilike('name', '%FGTS%')
    
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
    
    // Verificar IDs duplicados
    const idCounts = {}
    const duplicateIds = []
    
    template.fields.forEach(field => {
      if (idCounts[field.id]) {
        idCounts[field.id]++
        if (idCounts[field.id] === 2) {
          duplicateIds.push(field.id)
        }
      } else {
        idCounts[field.id] = 1
      }
    })
    
    console.log(`🔍 IDs únicos: ${Object.keys(idCounts).length}`)
    console.log(`🚨 IDs duplicados: ${duplicateIds.length}`)
    
    if (duplicateIds.length > 0) {
      console.log('\n❌ PROBLEMA: Ainda há IDs duplicados:')
      duplicateIds.forEach(id => {
        console.log(`  - "${id}" aparece ${idCounts[id]} vezes`)
      })
      
      // Mostrar campos duplicados
      console.log('\n📋 Campos com IDs duplicados:')
      template.fields.forEach((field, index) => {
        if (duplicateIds.includes(field.id)) {
          console.log(`  ${index + 1}. ID: "${field.id}" | Label: "${field.label}" | Posição: (${field.position?.x || 0}, ${field.position?.y || 0})`)
        }
      })
    } else {
      console.log('\n✅ SUCESSO: Todos os IDs são únicos!')
      
      // Mostrar alguns exemplos de IDs únicos
      console.log('\n📋 Exemplos de IDs únicos:')
      template.fields.slice(0, 5).forEach((field, index) => {
        console.log(`  ${index + 1}. ID: "${field.id}" | Label: "${field.label}"`)
      })
    }
    
    // Verificar nomes duplicados
    const nameCounts = {}
    const duplicateNames = []
    
    template.fields.forEach(field => {
      if (nameCounts[field.name]) {
        nameCounts[field.name]++
        if (nameCounts[field.name] === 2) {
          duplicateNames.push(field.name)
        }
      } else {
        nameCounts[field.name] = 1
      }
    })
    
    console.log(`\n🔍 Nomes únicos: ${Object.keys(nameCounts).length}`)
    console.log(`🚨 Nomes duplicados: ${duplicateNames.length}`)
    
    if (duplicateNames.length > 0) {
      console.log('\n❌ PROBLEMA: Ainda há nomes duplicados:')
      duplicateNames.forEach(name => {
        console.log(`  - "${name}" aparece ${nameCounts[name]} vezes`)
      })
    } else {
      console.log('\n✅ SUCESSO: Todos os nomes são únicos!')
    }
    
    // Resumo final
    console.log('\n📊 RESUMO:')
    console.log(`Total de campos: ${template.fields.length}`)
    console.log(`IDs únicos: ${Object.keys(idCounts).length} ${duplicateIds.length === 0 ? '✅' : '❌'}`)
    console.log(`Nomes únicos: ${Object.keys(nameCounts).length} ${duplicateNames.length === 0 ? '✅' : '❌'}`)
    
    if (duplicateIds.length === 0 && duplicateNames.length === 0) {
      console.log('\n🎉 TEMPLATE ESTÁ CORRETO: Todos os campos são únicos!')
    } else {
      console.log('\n⚠️ TEMPLATE PRECISA DE CORREÇÃO: Há campos duplicados')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar persistência:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testPersistence()
}

module.exports = { testPersistence }