'use client'

import { useState, useEffect } from 'react'
import { Database, HardDrive, Image, FileText, Trash2, Brain, CheckCircle, XCircle } from 'lucide-react'

export default function StorageStatus() {
  const [stats, setStats] = useState({
    totalPDFs: 0,
    totalImages: 0,
    totalSize: 0,
    recentProcessings: [] as any[]
  })
  const [aiStatus, setAiStatus] = useState({
    isOnline: false,
    manufacturer: 'Google',
    model: 'Gemini 1.5 Flash',
    version: '1.5',
    lastCheck: null as Date | null,
    responseTime: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAI, setIsCheckingAI] = useState(false)

  const checkAIStatus = async () => {
    setIsCheckingAI(true)
    const startTime = Date.now()
    
    try {
      // Verificar se a API key está configurada
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('API Key não configurada')
      }

      // Fazer uma chamada simples para testar a API
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Teste simples
      const result = await model.generateContent('Responda apenas: OK')
      const response = await result.response
      const text = response.text()
      
      const responseTime = Date.now() - startTime
      
      setAiStatus({
        isOnline: text.includes('OK'),
        manufacturer: 'Google',
        model: 'Gemini 1.5 Flash',
        version: '1.5',
        lastCheck: new Date(),
        responseTime
      })
      
    } catch (error) {
      console.error('❌ Erro ao verificar status da IA:', error)
      setAiStatus(prev => ({
        ...prev,
        isOnline: false,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      }))
    } finally {
      setIsCheckingAI(false)
    }
  }

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const { CompletePDFProcessor } = await import('@/lib/complete-pdf-processor')
      const processor = new CompletePDFProcessor()
      
      const [storageStats, recentProcessings] = await Promise.all([
        processor.getStorageStats(),
        processor.listRecentProcessings(5)
      ])
      
      setStats({
        ...storageStats,
        recentProcessings
      })
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const cleanupOldFiles = async () => {
    if (!confirm('Tem certeza que deseja limpar arquivos antigos (mais de 7 dias)?')) {
      return
    }
    
    try {
      const { SupabaseStorageManager } = await import('@/lib/supabase-storage')
      const storage = new SupabaseStorageManager()
      
      await storage.cleanupOldFiles()
      await loadStats() // Recarregar estatísticas
      
      alert('Limpeza concluída com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error)
      alert('Erro na limpeza de arquivos')
    }
  }

  useEffect(() => {
    loadStats()
    checkAIStatus()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Status do Supabase Storage</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={checkAIStatus}
            disabled={isCheckingAI}
            className="btn-secondary text-xs"
          >
            {isCheckingAI ? 'Testando IA...' : 'Testar IA'}
          </button>
          
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="btn-secondary text-xs"
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
          
          <button
            onClick={cleanupOldFiles}
            className="flex items-center space-x-1 btn-secondary text-xs text-red-600"
          >
            <Trash2 className="h-3 w-3" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FileText className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-lg font-bold text-gray-900">{stats.totalPDFs}</span>
          </div>
          <div className="text-xs text-gray-600">PDFs</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Image className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-lg font-bold text-gray-900">{stats.totalImages}</span>
          </div>
          <div className="text-xs text-gray-600">Imagens</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <HardDrive className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-lg font-bold text-gray-900">{formatFileSize(stats.totalSize)}</span>
          </div>
          <div className="text-xs text-gray-600">Tamanho</div>
        </div>
      </div>

      {/* Processamentos Recentes */}
      {stats.recentProcessings.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Processamentos Recentes</h4>
          <div className="space-y-1">
            {stats.recentProcessings.map((processing, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {processing.file_name}
                  </div>
                  <div className="text-gray-500">
                    {processing.fields_count} campos • {processing.pages_count} páginas
                  </div>
                </div>
                <div className="text-gray-400 ml-2">
                  {new Date(processing.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status da IA */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <h4 className="font-medium text-gray-900 text-sm">Status da IA</h4>
          </div>
          <div className="flex items-center space-x-2">
            {aiStatus.isOnline ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${aiStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {aiStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Fabricante:</span>
                <span className="font-medium text-gray-900">{aiStatus.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modelo:</span>
                <span className="font-medium text-gray-900">{aiStatus.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Versão:</span>
                <span className="font-medium text-gray-900">{aiStatus.version}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo Resposta:</span>
                <span className="font-medium text-gray-900">
                  {aiStatus.responseTime > 0 ? `${aiStatus.responseTime}ms` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última Verificação:</span>
                <span className="font-medium text-gray-900">
                  {aiStatus.lastCheck ? aiStatus.lastCheck.toLocaleTimeString('pt-BR') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${aiStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {aiStatus.isOnline ? '🟢 Operacional' : '🔴 Indisponível'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status dos Buckets */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-gray-700 mb-1">Buckets Configurados:</div>
            <div className="space-y-1 text-gray-600">
              <div>✅ form-pdfs (PDFs originais)</div>
              <div>✅ processed-images (Imagens PNG)</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">Recursos:</div>
            <div className="space-y-1 text-gray-600">
              <div className={`flex items-center space-x-1 ${aiStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {aiStatus.isOnline ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                <span>Gemini Vision OCR</span>
              </div>
              <div>☁️ Supabase Storage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}