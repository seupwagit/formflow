const fs = require('fs')
const path = require('path')

/**
 * Script para configurar o worker PDF.js corretamente
 */

const sourceFile = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs')
const targetFile = path.join(__dirname, '..', 'public', 'pdf.worker.min.js')

console.log('🔧 Configurando worker PDF.js...')
console.log(`📂 Origem: ${sourceFile}`)
console.log(`📂 Destino: ${targetFile}`)

try {
  // Verificar se o arquivo fonte existe
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Arquivo fonte não encontrado:', sourceFile)
    process.exit(1)
  }

  // Copiar o arquivo
  fs.copyFileSync(sourceFile, targetFile)
  
  console.log('✅ Worker PDF.js configurado com sucesso!')
  console.log(`📄 Arquivo copiado: ${targetFile}`)
  
  // Verificar o tamanho do arquivo
  const stats = fs.statSync(targetFile)
  console.log(`📊 Tamanho: ${Math.round(stats.size / 1024)}KB`)
  
} catch (error) {
  console.error('❌ Erro ao configurar worker:', error.message)
  process.exit(1)
}