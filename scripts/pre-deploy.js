#!/usr/bin/env node

/**
 * Script de verificação pré-deploy
 * Executa várias verificações antes de fazer deploy no Coolify
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Verificação Pré-Deploy\n');
console.log('='.repeat(50));

let hasErrors = false;
let hasWarnings = false;

// 1. Verificar se .env.local não está commitado
console.log('\n📁 Verificando arquivos sensíveis...');
const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
if (gitignoreContent.includes('.env.local')) {
  console.log('  ✅ .env.local está no .gitignore');
} else {
  console.log('  ❌ .env.local NÃO está no .gitignore!');
  hasErrors = true;
}

// 2. Verificar se package.json existe e está válido
console.log('\n📦 Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('  ✅ package.json válido');
  
  // Verificar scripts necessários
  const requiredScripts = ['build', 'start'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ Script "${script}" encontrado`);
    } else {
      console.log(`  ❌ Script "${script}" não encontrado!`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('  ❌ Erro ao ler package.json:', error.message);
  hasErrors = true;
}

// 3. Verificar next.config.js
console.log('\n⚙️  Verificando next.config.js...');
try {
  const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
  if (nextConfigContent.includes("output: 'standalone'")) {
    console.log('  ✅ Output standalone configurado');
  } else {
    console.log('  ⚠️  Output standalone não configurado (recomendado para Docker)');
    hasWarnings = true;
  }
} catch (error) {
  console.log('  ❌ Erro ao ler next.config.js:', error.message);
  hasErrors = true;
}

// 4. Verificar Dockerfile
console.log('\n🐳 Verificando Dockerfile...');
if (fs.existsSync('Dockerfile')) {
  console.log('  ✅ Dockerfile encontrado');
} else {
  console.log('  ❌ Dockerfile não encontrado!');
  hasErrors = true;
}

// 5. Verificar .dockerignore
console.log('\n🚫 Verificando .dockerignore...');
if (fs.existsSync('.dockerignore')) {
  console.log('  ✅ .dockerignore encontrado');
} else {
  console.log('  ⚠️  .dockerignore não encontrado (recomendado)');
  hasWarnings = true;
}

// 6. Verificar arquivos públicos importantes
console.log('\n📄 Verificando arquivos públicos...');
const publicFiles = ['public/pdf.worker.min.js'];
publicFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} encontrado`);
  } else {
    console.log(`  ⚠️  ${file} não encontrado (execute: npm run setup-pdf)`);
    hasWarnings = true;
  }
});

// 7. Verificar node_modules
console.log('\n📚 Verificando dependências...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules existe');
} else {
  console.log('  ⚠️  node_modules não encontrado (execute: npm install)');
  hasWarnings = true;
}

// 8. Verificar arquivos de documentação
console.log('\n📖 Verificando documentação...');
const docFiles = ['README.md', 'coolify-deploy.md'];
docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} encontrado`);
  } else {
    console.log(`  ⚠️  ${file} não encontrado`);
    hasWarnings = true;
  }
});

// Resumo final
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ FALHA: Corrija os erros antes de fazer deploy!');
  console.log('\nPróximos passos:');
  console.log('1. Corrija os erros listados acima');
  console.log('2. Execute este script novamente: npm run pre-deploy');
  console.log('3. Faça o deploy no Coolify');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  AVISOS: Algumas recomendações não foram seguidas.');
  console.log('O deploy pode funcionar, mas é recomendado corrigir os avisos.');
  console.log('\nPróximos passos:');
  console.log('1. (Opcional) Corrija os avisos listados acima');
  console.log('2. Faça o deploy no Coolify');
  process.exit(0);
} else {
  console.log('\n✅ SUCESSO: Projeto pronto para deploy!');
  console.log('\nPróximos passos:');
  console.log('1. Commit e push para o repositório Git');
  console.log('2. Configure as variáveis de ambiente no Coolify');
  console.log('3. Faça o deploy!');
  console.log('\nConsulte: coolify-deploy.md para instruções detalhadas');
  process.exit(0);
}
