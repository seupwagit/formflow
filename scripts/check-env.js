#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias estão configuradas
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const optionalEnvVars = [
  'GEMINI_MODEL',
  'NEXT_PUBLIC_MAX_FILE_SIZE',
  'PDF_QUALITY',
  'OCR_LANGUAGE',
];

console.log('🔍 Verificando variáveis de ambiente...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variáveis obrigatórias
console.log('📋 Variáveis Obrigatórias:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ❌ ${varName} - NÃO CONFIGURADA`);
    hasErrors = true;
  } else {
    const maskedValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
    console.log(`  ✅ ${varName} - ${maskedValue}`);
  }
});

// Verificar variáveis opcionais
console.log('\n📋 Variáveis Opcionais:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName} - Usando valor padrão`);
    hasWarnings = true;
  } else {
    console.log(`  ✅ ${varName} - ${value}`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ ERRO: Variáveis obrigatórias não configuradas!');
  console.log('Configure as variáveis no arquivo .env.local ou no Coolify.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  AVISO: Algumas variáveis opcionais não estão configuradas.');
  console.log('A aplicação funcionará com valores padrão.');
  process.exit(0);
} else {
  console.log('\n✅ Todas as variáveis estão configuradas corretamente!');
  process.exit(0);
}
