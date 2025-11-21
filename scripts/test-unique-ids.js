/**
 * Script para testar a geração de IDs únicos
 */

const { generateUniqueFieldId, generateUniqueFieldName } = require('../lib/unique-field-generator')

// Simular campos com labels iguais
const testFields = []
const testLabels = [
  'RAZAO SOCIAL/NOME',
  'RAZAO SOCIAL/NOME', // Duplicado
  'DDD/TELEFONE',
  'DDD/TELEFONE', // Duplicado
  'FPAS',
  'FPAS', // Duplicado
]

console.log('🧪 Testando geração de IDs únicos...\n')

testLabels.forEach((label, index) => {
  const position = {
    x: 100 + (index * 50),
    y: 200 + (index * 30),
    page: 0
  }
  
  const uniqueId = generateUniqueFieldId(label, testFields, position, index)
  const uniqueName = generateUniqueFieldName(label, testFields, position, index)
  
  const field = {
    id: uniqueId,
    name: uniqueName,
    type: 'text',
    label: label,
    required: false,
    position: position,
    confidence: 0.9
  }
  
  testFields.push(field)
  
  console.log(`Campo ${index + 1}:`)
  console.log(`  Label: "${label}"`)
  console.log(`  ID: "${uniqueId}"`)
  console.log(`  Name: "${uniqueName}"`)
  console.log(`  Posição: (${position.x}, ${position.y})`)
  console.log('')
})

// Verificar se todos os IDs são únicos
const ids = testFields.map(f => f.id)
const names = testFields.map(f => f.name)
const uniqueIds = new Set(ids)
const uniqueNames = new Set(names)

console.log('📊 Resultados:')
console.log(`Total de campos: ${testFields.length}`)
console.log(`IDs únicos: ${uniqueIds.size}`)
console.log(`Nomes únicos: ${uniqueNames.size}`)

if (uniqueIds.size === testFields.length && uniqueNames.size === testFields.length) {
  console.log('✅ SUCESSO: Todos os IDs e nomes são únicos!')
} else {
  console.log('❌ FALHA: Há IDs ou nomes duplicados!')
  
  // Mostrar duplicatas
  const idCounts = {}
  const nameCounts = {}
  
  ids.forEach(id => {
    idCounts[id] = (idCounts[id] || 0) + 1
  })
  
  names.forEach(name => {
    nameCounts[name] = (nameCounts[name] || 0) + 1
  })
  
  Object.entries(idCounts).forEach(([id, count]) => {
    if (count > 1) {
      console.log(`  ID duplicado: "${id}" aparece ${count} vezes`)
    }
  })
  
  Object.entries(nameCounts).forEach(([name, count]) => {
    if (count > 1) {
      console.log(`  Nome duplicado: "${name}" aparece ${count} vezes`)
    }
  })
}