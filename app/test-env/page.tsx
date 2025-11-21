'use client'

export default function TestEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Variáveis de Ambiente</h1>
      <div className="space-y-2">
        <p><strong>SUPABASE_URL:</strong> {supabaseUrl ? '✅ Definida' : '❌ Não definida'}</p>
        <p><strong>SUPABASE_KEY:</strong> {supabaseKey ? '✅ Definida' : '❌ Não definida'}</p>
        <p><strong>URL:</strong> {supabaseUrl}</p>
        <p><strong>KEY (primeiros 20 chars):</strong> {supabaseKey?.substring(0, 20)}...</p>
      </div>
    </div>
  )
}