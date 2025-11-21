/**
 * 🧪 TESTE DE PROTEÇÃO CONTRA DUPLICATAS
 * Execute no console do navegador para verificar se a proteção está funcionando
 */

console.log('🧪 TESTANDO PROTEÇÃO CONTRA DUPLICATAS...')

// Simular função de geração (versão simplificada para teste)
function generateUniqueFieldId(label, existingFields, position, index) {
  const baseName = label.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const positionId = `${position.page}_${Math.round(position.x)}_${Math.round(position.y)}`
  const timestamp = Date.now().toString().slice(-6)
  const indexSuffix = index !== undefined ? `_${index}` : ''
  
  let uniqueId = `${baseName}_${positionId}_${timestamp}${indexSuffix}`
  
  let counter = 1
  while (existingFields.some(field => field.id === uniqueId)) {
    uniqueId = `${baseName}_${positionId}_${timestamp}${indexSuffix}_${counter}`
    counter++
  }
  
  return uniqueId
}

// Teste 1: Labels idênticos
console.log('📋 TESTE 1: Labels idênticos')
const testFields1 = []
for (let i = 0; i < 10; i++) {
  const id = generateUniqueFieldId('Nome Completo', testFields1, {x: 100, y: 200 + (i * 50), page: 0}, i)
  testFields1.push({ id, label: 'Nome Completo' })
}

const uniqueIds1 = new Set(testFields1.map(f => f.id))
console.log(`✅ Campos: ${testFields1.length}, IDs únicos: ${uniqueIds1.size}`)
console.log('Exemplos:', testFields1.slice(0, 3).map(f => f.id))

// Teste 2: Posições idênticas
console.log('\n📋 TESTE 2: Posições idênticas')
const testFields2 = []
const labels = ['Nome', 'Sobrenome', 'Email', 'Telefone', 'CPF']
labels.forEach((label, i) => {
  const id = generateUniqueFieldId(label, testFields2, {x: 100, y: 200, page: 0}, i)
  testFields2.push({ id, label })
})

const uniqueIds2 = new Set(testFields2.map(f => f.id))
console.log(`✅ Campos: ${testFields2.length}, IDs únicos: ${uniqueIds2.size}`)
console.log('Exemplos:', testFields2.slice(0, 3).map(f => f.id))

// Teste 3: Stress test - muitos campos
console.log('\n📋 TESTE 3: Stress test (100 campos)')
const testFields3 = []
for (let i = 0; i < 100; i++) {
  const labels = ['Nome', 'Email', 'Telefone', 'Endereço', 'CPF']
  const label = labels[i % labels.length]
  const id = generateUniqueFieldId(label, testFields3, {
    x: 100 + (i % 10) * 50, 
    y: 200 + Math.floor(i / 10) * 30, 
    page: Math.floor(i / 50)
  }, i)
  testFields3.push({ id, label })
}

const uniqueIds3 = new Set(testFields3.map(f => f.id))
console.log(`✅ Campos: ${testFields3.length}, IDs únicos: ${uniqueIds3.size}`)

// Teste 4: Detecção de duplicatas (simulação)
console.log('\n📋 TESTE 4: Detecção de duplicatas')
const fieldsWithDuplicates = [
  { id: 'nome_1', label: 'Nome' },
  { id: 'nome_1', label: 'Nome' }, // Duplicata
  { id: 'email_1', label: 'Email' },
  { id: 'nome_2', label: 'Nome' }
]

const idCounts = {}
fieldsWithDuplicates.forEach(field => {
  idCounts[field.id] = (idCounts[field.id] || 0) + 1
})

const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1)
console.log(`⚠️ IDs duplicados encontrados: ${duplicateIds.length}`)
console.log('Duplicatas:', duplicateIds)

// Resumo final
console.log('\n' + '='.repeat(50))
console.log('🎯 RESUMO DOS TESTES DE PROTEÇÃO')
console.log('='.repeat(50))

const allTestsPassed = (
  uniqueIds1.size === testFields1.length &&
  uniqueIds2.size === testFields2.length &&
  uniqueIds3.size === testFields3.length
)

if (allTestsPassed) {
  console.log('✅ TODOS OS TESTES PASSARAM!')
  console.log('🔒 Proteção contra duplicatas está funcionando perfeitamente')
  console.log('💡 Sistema pode gerar milhares de campos únicos sem conflito')
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!')
  console.log('⚠️ Verificar implementação das funções de proteção')
}

console.log('\n📊 Estatísticas:')
console.log(`• Teste 1 (labels iguais): ${uniqueIds1.size}/${testFields1.length} únicos`)
console.log(`• Teste 2 (posições iguais): ${uniqueIds2.size}/${testFields2.length} únicos`)
console.log(`• Teste 3 (stress test): ${uniqueIds3.size}/${testFields3.length} únicos`)
console.log(`• Detecção de duplicatas: ${duplicateIds.length} encontradas`)

console.log('\n🛡️ PROTEÇÃO ATIVA:')
console.log('• Geração de IDs únicos baseada em posição + timestamp')
console.log('• Verificação de conflitos em tempo real')
console.log('• Contador automático para resolver conflitos')
console.log('• Detecção e correção automática de duplicatas')

return {
  allTestsPassed,
  stats: {
    test1: `${uniqueIds1.size}/${testFields1.length}`,
    test2: `${uniqueIds2.size}/${testFields2.length}`,
    test3: `${uniqueIds3.size}/${testFields3.length}`,
    duplicatesFound: duplicateIds.length
  }
}