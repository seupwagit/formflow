'use client'

import { useState } from 'react'
import PDFUploader from '@/components/PDFUploader'

export default function TestUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<string>('')

  const [processingStatus, setProcessingStatus] = useState<{
    stage: string
    progress: number
    method?: string
  } | undefined>()

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setResult('')
    setProcessingStatus({ stage: 'Iniciando teste...', progress: 0 })
    
    try {
      console.log('🔄 Testando processamento básico...')
      
      // Teste 1: Verificar arquivo
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Arquivo PDF inválido')
      }
      
      console.log('✅ Arquivo PDF válido')
      setProcessingStatus({ stage: 'Arquivo PDF válido', progress: 25 })
      
      // Teste 2: Verificar variáveis de ambiente
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY não configurada')
      }
      
      console.log('✅ Gemini API Key configurada')
      setProcessingStatus({ stage: 'Gemini API Key configurada', progress: 50 })
      
      // Teste 3: Verificar Supabase (sem usar)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variáveis Supabase não configuradas')
      }
      
      console.log('✅ Variáveis Supabase configuradas')
      setProcessingStatus({ stage: 'Variáveis Supabase configuradas', progress: 75 })
      
      // Teste 4: Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProcessingStatus({ stage: 'Teste concluído!', progress: 100 })
      setResult('Teste concluído com sucesso! Todas as variáveis estão configuradas.')
      
    } catch (error) {
      console.error('❌ Erro no teste:', error)
      setProcessingStatus({ stage: 'Erro no teste', progress: 0 })
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setResult(`Erro: ${errorMessage}`)
      
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setProcessingStatus(undefined)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Upload PDF</h1>
        
        <PDFUploader 
          onFileUpload={handleFileUpload} 
          isLoading={isUploading}
          processingStatus={processingStatus}
        />
        
        {result && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}