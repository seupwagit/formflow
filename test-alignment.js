// Script de teste para verificar se o alinhamento está funcionando
console.log('🧪 Teste de Alinhamento - Verificação das Propriedades dos Campos')

// Simular um campo com alinhamento
const testField = {
  id: 'test-field',
  name: 'campo_teste',
  type: 'text',
  label: 'Campo de Teste',
  required: false,
  position: { x: 100, y: 150, width: 200, height: 40, page: 0 },
  alignment: { horizontal: 'center', vertical: 'middle' },
  fontStyle: { 
    family: 'Arial', 
    size: 14, 
    weight: 'bold', 
    style: 'normal', 
    decoration: 'none', 
    color: '#0066CC' 
  }
}

console.log('📋 Campo de teste criado:')
console.log('   📍 Posição:', testField.position)
console.log('   🎯 Alinhamento:', testField.alignment)
console.log('   🎨 Fonte:', testField.fontStyle)

// Simular a lógica do ReportGenerator
const { alignment, fontStyle, position } = testField
const textAlign = alignment?.horizontal || 'left'
const verticalAlign = alignment?.vertical || 'middle'

console.log('\n🎯 Aplicação do Alinhamento:')
console.log('   Horizontal:', textAlign)
console.log('   Vertical:', verticalAlign)

// Simular conversão para coordenadas PDF
const x = (position.x * 210) / 794 // Proporção para largura A4 (210mm)
const y = (position.y * 297) / 1123 // Proporção para altura A4 (297mm)
const width = (position.width * 210) / 794
const height = (position.height * 297) / 1123

console.log('\n📐 Coordenadas PDF:')
console.log(`   X: ${x.toFixed(1)}mm`)
console.log(`   Y: ${y.toFixed(1)}mm`)
console.log(`   Largura: ${width.toFixed(1)}mm`)
console.log(`   Altura: ${height.toFixed(1)}mm`)

// Simular cálculo de posição do texto
let textX = x
let alignOption = undefined

switch (textAlign) {
  case 'center':
    textX = x + (width / 2)
    alignOption = { align: 'center' }
    break
  case 'right':
    textX = x + width - 1
    alignOption = { align: 'right' }
    break
  case 'left':
  default:
    textX = x + 1
    alignOption = { align: 'left' }
    break
}

let textY = y
const fontSize = fontStyle?.size || 12

switch (verticalAlign) {
  case 'middle':
    textY = y + (height / 2) + (fontSize * 0.15)
    break
  case 'bottom':
    textY = y + height - (fontSize * 0.3)
    break
  case 'top':
  default:
    textY = y + (fontSize * 0.7)
    break
}

console.log('\n📝 Posição Final do Texto:')
console.log(`   X: ${textX.toFixed(1)}mm`)
console.log(`   Y: ${textY.toFixed(1)}mm`)
console.log('   Opção de Alinhamento:', alignOption)

console.log('\n✅ Teste concluído! Verifique se estes valores fazem sentido.')
console.log('💡 Dica: Execute este script no console do navegador para testar.')