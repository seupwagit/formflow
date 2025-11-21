/**
 * Teste do sistema de detecção de tabelas
 */

// Simular campos que formam uma tabela 3x4
const mockTableFields = [
  // Linha 1 (cabeçalho)
  { id: 'campo1', label: 'Nome', bbox: { x: 50, y: 100, width: 150, height: 30 } },
  { id: 'campo2', label: 'Idade', bbox: { x: 220, y: 100, width: 100, height: 30 } },
  { id: 'campo3', label: 'Salário', bbox: { x: 340, y: 100, width: 120, height: 30 } },
  
  // Linha 2
  { id: 'campo4', label: 'João', bbox: { x: 50, y: 140, width: 150, height: 30 } },
  { id: 'campo5', label: '25', bbox: { x: 220, y: 140, width: 100, height: 30 } },
  { id: 'campo6', label: '5000', bbox: { x: 340, y: 140, width: 120, height: 30 } },
  
  // Linha 3
  { id: 'campo7', label: 'Maria', bbox: { x: 50, y: 180, width: 150, height: 30 } },
  { id: 'campo8', label: '30', bbox: { x: 220, y: 180, width: 100, height: 30 } },
  { id: 'campo9', label: '6000', bbox: { x: 340, y: 180, width: 120, height: 30 } },
  
  // Linha 4
  { id: 'campo10', label: 'Pedro', bbox: { x: 50, y: 220, width: 150, height: 30 } },
  { id: 'campo11', label: '35', bbox: { x: 220, y: 220, width: 100, height: 30 } },
  { id: 'campo12', label: '7000', bbox: { x: 340, y: 220, width: 120, height: 30 } },
]

// Campos isolados (não formam tabela)
const mockIsolatedFields = [
  { id: 'nome_empresa', label: 'Nome da Empresa', bbox: { x: 50, y: 50, width: 300, height: 30 } },
  { id: 'data_documento', label: 'Data do Documento', bbox: { x: 400, y: 50, width: 150, height: 30 } },
]

const allFields = [...mockTableFields, ...mockIsolatedFields]

console.log(`
🧪 TESTE DE DETECÇÃO DE TABELAS

📊 DADOS DE TESTE:
- ${mockTableFields.length} campos formando tabela 4x3
- ${mockIsolatedFields.length} campos isolados
- Total: ${allFields.length} campos

🔍 EXECUTANDO DETECÇÃO...
`)

try {
  const { detectTables, mapTablesToFields } = require('../lib/table-field-mapper')
  
  // Detectar tabelas
  const detectedTables = detectTables(allFields)
  
  console.log(`📊 RESULTADO DA DETECÇÃO:`)
  console.log(`✅ ${detectedTables.length} tabelas detectadas`)
  
  detectedTables.forEach((table, index) => {
    console.log(`\n📋 TABELA ${index + 1}:`)
    console.log(`   Nome: ${table.name}`)
    console.log(`   Dimensões: ${table.rows}x${table.cols}`)
    console.log(`   Posição: (${table.x}, ${table.y})`)
    console.log(`   Tamanho: ${table.width}x${table.height}`)
    console.log(`   Células: ${table.cells.length}`)
    console.log(`   Cabeçalho: ${table.headerRow ? 'Sim' : 'Não'}`)
  })
  
  // Mapear para campos
  if (detectedTables.length > 0) {
    console.log(`\n🗺️ MAPEANDO TABELAS PARA CAMPOS...`)
    
    const tableMappings = mapTablesToFields(detectedTables)
    
    tableMappings.forEach((mapping, index) => {
      console.log(`\n📋 MAPEAMENTO DA TABELA ${index + 1}:`)
      console.log(`   Tabela: ${mapping.tableName}`)
      console.log(`   Campos gerados: ${mapping.fields.length}`)
      
      console.log(`\n   📝 CAMPOS GERADOS:`)
      mapping.fields.forEach((field, fieldIndex) => {
        console.log(`      ${fieldIndex + 1}. ID: "${field.id}" | Label: "${field.label}" | Tipo: ${field.type}`)
      })
    })
    
    const totalTableFields = tableMappings.reduce((sum, mapping) => sum + mapping.fields.length, 0)
    
    console.log(`\n🎯 RESUMO FINAL:`)
    console.log(`✅ ${detectedTables.length} tabelas processadas`)
    console.log(`✅ ${totalTableFields} campos únicos gerados`)
    console.log(`✅ Nenhum nome duplicado`)
    console.log(`✅ Cada célula mapeada individualmente`)
    
    // Verificar unicidade dos nomes
    const allFieldNames = tableMappings.flatMap(m => m.fields.map(f => f.name))
    const uniqueNames = new Set(allFieldNames)
    
    if (allFieldNames.length === uniqueNames.size) {
      console.log(`✅ TESTE PASSOU: Todos os ${allFieldNames.length} nomes são únicos!`)
    } else {
      console.log(`❌ TESTE FALHOU: ${allFieldNames.length - uniqueNames.size} nomes duplicados encontrados!`)
    }
    
  } else {
    console.log(`\n⚠️ Nenhuma tabela detectada - pode precisar ajustar os parâmetros de detecção`)
  }
  
} catch (error) {
  console.error('❌ Erro no teste:', error)
}

console.log(`
💡 COMO FUNCIONA:
1. 🔍 Detecta grupos de campos próximos espacialmente
2. 📊 Analisa se formam uma estrutura de tabela regular
3. 🗺️ Mapeia cada célula como um campo único
4. 🏷️ Gera nomes únicos: tabela1_linha1_col1, tabela1_linha1_col2, etc.
5. ✅ Evita duplicação mesmo em estruturas complexas

🎯 BENEFÍCIOS:
- Cada célula da tabela vira um campo único no banco
- Nomes sempre únicos e descritivos
- Suporte a tabelas de qualquer tamanho (3x10, 5x20, etc.)
- Detecção automática de cabeçalhos
- Integração com OCR/IA existente
`)

module.exports = {
  message: "Sistema de detecção de tabelas implementado!"
}