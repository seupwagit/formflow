'use client'

import { useEffect, useState } from 'react'
import PDFWorkerTest from '@/components/PDFWorkerTest'
import PDFDebugInfo from '@/components/PDFDebugInfo'
import PDFTestSimple from '@/components/PDFTestSimple'
import ClearCache from '@/components/ClearCache'

export default function SimpleTest() {
  const [status, setStatus] = useState('Carregando...')

  useEffect(() => {
    const testSupabase = async () => {
      try {
        setStatus('Testando variáveis...')
        
        // Verificar variáveis
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url) {
          setStatus('❌ NEXT_PUBLIC_SUPABASE_URL não definida')
          return
        }
        
        if (!key) {
          setStatus('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não definida')
          return
        }
        
        setStatus('Importando Supabase...')
        
        // Importar createClient diretamente
        const { createClient } = await import('@supabase/supabase-js')
        
        setStatus('Criando cliente...')
        
        // Criar cliente diretamente
        const supabase = createClient(url, key)
        
        setStatus('Testando conexão...')
        
        // Testar conexão simples
        const { data, error } = await supabase.from('form_templates').select('count').limit(1)
        
        if (error) {
          setStatus(`❌ Erro: ${error.message}`)
        } else {
          setStatus('✅ Supabase funcionando!')
        }
        
      } catch (error) {
        setStatus(`❌ Erro geral: ${error instanceof Error ? error.message : 'Desconhecido'}`)
      }
    }
    
    testSupabase()
  }, [])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Teste Simples Supabase</h1>
        <p className="text-lg">{status}</p>
      </div>
      
      <ClearCache />
      
      <PDFTestSimple />
      
      <PDFWorkerTest />
      
      <PDFDebugInfo />
    </div>
  )
}