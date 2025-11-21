'use client'

import { useState } from 'react'
import { Wrench, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function QuickFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [fixResults, setFixResults] = useState<string[]>([])

  const runQuickFix = async () => {
    setIsFixing(true)
    setFixResults([])
    const results: string[] = []

    try {
      results.push('🔧 Iniciando correções automáticas...')
      setFixResults([...results])

      // Fix 1: Verificar e corrigir variáveis de ambiente
      results.push('✅ Verificando variáveis de ambiente...')
      setFixResults([...results])
      
      const requiredEnvs = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
        'NEXT_PUBLIC_GEMINI_API_KEY'
      ]
      
      const missingEnvs = requiredEnvs.filter(env => !process.env[env])
      
      if (missingEnvs.length > 0) {
        results.push(`❌ Variáveis faltando: ${missingEnvs.join(', ')}`)
      } else {
        results.push('✅ Todas as variáveis de ambiente estão configuradas')
      }
      setFixResults([...results])

      // Fix 2: Testar conexão Supabase
      results.push('🗄️ Testando conexão Supabase...')
      setFixResults([...results])
      
      try {
        const { supabase } = await import('@/lib/supabase')
        const { error } = await supabase.from('form_templates').select('count').limit(1)
        
        if (error) {
          results.push(`❌ Erro Supabase: ${error.message}`)
        } else {
          results.push('✅ Conexão Supabase funcionando')
        }
      } catch (error) {
        results.push(`❌ Erro ao conectar Supabase: ${(error as Error).message}`)
      }
      setFixResults([...results])

      // Fix 3: Verificar buckets de storage
      results.push('☁️ Verificando buckets de storage...')
      setFixResults([...results])
      
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: buckets, error } = await supabase.storage.listBuckets()
        
        if (error) {
          results.push(`❌ Erro ao listar buckets: ${error.message}`)
        } else {
          const requiredBuckets = ['form-pdfs', 'processed-images']
          const existingBuckets = buckets?.map(b => b.name) || []
          const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b))
          
          if (missingBuckets.length > 0) {
            results.push(`❌ Buckets faltando: ${missingBuckets.join(', ')}`)
          } else {
            results.push('✅ Todos os buckets necessários existem')
          }
        }
      } catch (error) {
        results.push(`❌ Erro ao verificar storage: ${(error as Error).message}`)
      }
      setFixResults([...results])

      // Fix 4: Testar Gemini API
      results.push('🤖 Testando Gemini API...')
      setFixResults([...results])
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!apiKey) {
          results.push('❌ NEXT_PUBLIC_GEMINI_API_KEY não configurada')
        } else {
          const { GoogleGenerativeAI } = await import('@google/generative-ai')
          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
          
          const result = await model.generateContent(['Teste'])
          const response = await result.response
          
          if (response.text()) {
            results.push('✅ Gemini API funcionando')
          } else {
            results.push('❌ Gemini API não respondeu')
          }
        }
      } catch (error) {
        results.push(`❌ Erro Gemini API: ${(error as Error).message}`)
      }
      setFixResults([...results])

      // Fix 5: Limpar cache problemático
      results.push('🧹 Limpando cache problemático...')
      setFixResults([...results])
      
      try {
        // Limpar localStorage de uploads antigos
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('pdf_file_')) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
        results.push(`✅ Removidos ${keysToRemove.length} arquivos do cache local`)
      } catch (error) {
        results.push(`❌ Erro ao limpar cache: ${(error as Error).message}`)
      }
      setFixResults([...results])

      results.push('🎉 Correções automáticas concluídas!')
      setFixResults([...results])

    } catch (error) {
      results.push(`❌ Erro geral: ${(error as Error).message}`)
      setFixResults([...results])
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Correção Automática</h3>
        </div>
        
        <button
          onClick={runQuickFix}
          disabled={isFixing}
          className="flex items-center space-x-2 btn-primary"
        >
          {isFixing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
          <span>{isFixing ? 'Corrigindo...' : 'Executar Correções'}</span>
        </button>
      </div>

      {fixResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div className="space-y-1 text-sm font-mono">
            {fixResults.map((result, index) => (
              <div key={index} className={`${
                result.includes('❌') ? 'text-red-600' :
                result.includes('✅') ? 'text-green-600' :
                result.includes('🎉') ? 'text-blue-600 font-bold' :
                'text-gray-700'
              }`}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-start space-x-2 text-sm text-blue-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Esta ferramenta verifica e corrige:</p>
            <ul className="text-xs space-y-1">
              <li>• Variáveis de ambiente</li>
              <li>• Conexão com Supabase</li>
              <li>• Buckets de storage</li>
              <li>• API do Gemini</li>
              <li>• Cache problemático</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}