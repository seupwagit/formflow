/**
 * PÁGINA DE BACKUP DO SISTEMA
 * 
 * Criado em: 14/11/2024
 * Rota: /admin/backup
 * 
 * ⚠️ ARQUIVO NOVO - NÃO ALTERA NADA DO SISTEMA EXISTENTE
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Download, ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface BackupResult {
  success: boolean
  timestamp: string
  backupDir: string
  summary: {
    tables: number
    totalRows: number
    files: number
    errors: number
  }
  files: string[]
  errors: string[]
}

export default function BackupPage() {
  const router = useRouter()
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [result, setResult] = useState<BackupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Storage backup
  const [isBackingUpStorage, setIsBackingUpStorage] = useState(false)
  const [storageResult, setStorageResult] = useState<any | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Erro ao fazer backup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleStorageBackup = async () => {
    setIsBackingUpStorage(true)
    setStorageError(null)
    setStorageResult(null)

    try {
      const response = await fetch('/api/backup/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStorageResult(data)
      } else {
        setStorageError(data.error || 'Erro ao fazer backup do storage')
      }
    } catch (err) {
      setStorageError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsBackingUpStorage(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Backup do Sistema
                </h1>
                <p className="text-sm text-gray-600">
                  Backup completo do banco de dados Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            📦 O que será incluído no backup?
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Todas as tabelas</strong> - form_templates, form_responses, companies, contracts, etc.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Todos os dados</strong> - Exportados em JSON e SQL</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Functions/RPC</strong> - save_template_validations, load_template_validations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Triggers</strong> - update_template_validation_rules_updated_at</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Script de Restore</strong> - Para restaurar tudo facilmente</span>
            </li>
          </ul>
        </div>

        {/* Backup Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Database Backup */}
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Backup do Banco de Dados
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Tabelas, dados, functions, triggers
            </p>
            <p className="text-gray-500 mb-6 text-xs">
              Salvo em: <code className="bg-gray-100 px-2 py-1 rounded">supabase/backup/</code>
            </p>
            
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isBackingUp ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Fazendo Backup...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Backup Banco</span>
                </>
              )}
            </button>
          </div>

          {/* Storage Backup */}
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Download className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Backup de Arquivos
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              PDFs, imagens do Storage
            </p>
            <p className="text-gray-500 mb-6 text-xs">
              Salvo em: <code className="bg-gray-100 px-2 py-1 rounded">supabase/backup/storage/</code>
            </p>
            
            <button
              onClick={handleStorageBackup}
              disabled={isBackingUpStorage}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isBackingUpStorage ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Baixando...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Backup Storage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Erro no Backup do Banco
                </h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {storageError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Erro no Backup do Storage
                </h3>
                <p className="text-red-800">{storageError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Backup Concluído com Sucesso!
                </h3>
                <p className="text-green-800 mb-4">
                  Backup salvo em: <code className="bg-green-100 px-2 py-1 rounded">{result.backupDir}</code>
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{result.summary.tables}</div>
                <div className="text-sm text-gray-600">Tabelas</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{result.summary.totalRows}</div>
                <div className="text-sm text-gray-600">Registros</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{result.summary.files}</div>
                <div className="text-sm text-gray-600">Arquivos</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{result.summary.errors}</div>
                <div className="text-sm text-gray-600">Erros</div>
              </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📁 Arquivos Gerados:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.files.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <code className="bg-gray-100 px-2 py-1 rounded">{file}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Errors List */}
            {result.errors && result.errors.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-yellow-900 mb-3">⚠️ Avisos:</h4>
                <ul className="space-y-1">
                  {result.errors.map((err, index) => (
                    <li key={index} className="text-sm text-yellow-800">• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Storage Success Result */}
        {storageResult && storageResult.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Backup de Arquivos Concluído!
                </h3>
                <p className="text-green-800 mb-4">
                  Arquivos salvos em: <code className="bg-green-100 px-2 py-1 rounded">{storageResult.backupDir}</code>
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{storageResult.summary.totalFiles}</div>
                <div className="text-sm text-gray-600">Arquivos</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{storageResult.summary.totalSize}</div>
                <div className="text-sm text-gray-600">Tamanho</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{storageResult.summary.buckets}</div>
                <div className="text-sm text-gray-600">Buckets</div>
              </div>
            </div>

            {/* Files by Bucket */}
            {storageResult.buckets && storageResult.buckets.map((bucket: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-gray-900 mb-2">
                  📦 Bucket: {bucket.name} ({bucket.files} arquivos)
                </h4>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">📖 Como Restaurar o Backup</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Opção 1: Restaurar Tudo</strong>
              <pre className="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
                psql -h [host] -U [user] -d [database] -f RESTORE.sql
              </pre>
            </div>
            <div>
              <strong>Opção 2: Restaurar Tabela Específica</strong>
              <pre className="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
                psql -h [host] -U [user] -d [database] -f form_templates.sql
              </pre>
            </div>
            <div>
              <strong>Opção 3: Usar JSON (via código)</strong>
              <pre className="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto">
{`import data from './form_templates.json'
await supabase.from('form_templates').insert(data)`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
