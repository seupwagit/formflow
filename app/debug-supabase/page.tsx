'use client'

import { useState } from 'react'

export default function DebugSupabase() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testSupabase = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Teste 1: Verificar variáveis de ambiente
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setResult(prev => prev + `✅ URL: ${url ? 'OK' : 'MISSING'}\n`)
      setResult(prev => prev + `✅ KEY: ${key ? 'OK' : 'MISSING'}\n`)
      
      if (!url || !key) {
        setResult(prev => prev + `❌ Variáveis de ambiente faltando\n`)
        return
      }
      
      // Teste 2: Importar Supabase
      setResult(prev => prev + `🔄 Importando Supabase...\n`)
      const { supabase } = await import('../../lib/supabase')
      setResult(prev => prev + `✅ Supabase importado com sucesso\n`)
      
      // Teste 3: Testar conexão
      setResult(prev => prev + `🔄 Testando conexão...\n`)
      const { data, error } = await supabase.from('form_templates').select('count').limit(1)
      
      if (error) {
        setResult(prev => prev + `❌ Erro na conexão: ${error.message}\n`)
      } else {
        setResult(prev => prev + `✅ Conexão OK\n`)
      }
      
      // Teste 4: Testar storage
      setResult(prev => prev + `🔄 Testando storage...\n`)
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
      
      if (storageError) {
        setResult(prev => prev + `❌ Erro no storage: ${storageError.message}\n`)
      } else {
        setResult(prev => prev + `✅ Storage OK - ${buckets?.length || 0} buckets\n`)
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Supabase</h1>
      
      <button 
        onClick={testSupabase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Supabase'}
      </button>
      
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {result || 'Clique no botão para testar'}
      </pre>
    </div>
  )
}