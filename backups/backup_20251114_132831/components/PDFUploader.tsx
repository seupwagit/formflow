'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle, Zap } from 'lucide-react'

interface PDFUploaderProps {
  onFileUpload: (file: File) => void
  isLoading?: boolean
  processingStatus?: {
    stage: string
    progress: number
    method?: string
  }
}

export default function PDFUploader({ 
  onFileUpload, 
  isLoading, 
  processingStatus 
}: PDFUploaderProps) {
  const [dragError, setDragError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragError('')
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setDragError('Arquivo muito grande. Máximo: 50MB')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setDragError('Apenas arquivos PDF são aceitos')
      } else {
        setDragError('Arquivo inválido')
      }
      return
    }

    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isLoading,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDragEnter: () => setDragError(''),
  })

  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    }
    if (isDragReject || dragError) {
      return <AlertCircle className="h-12 w-12 text-red-400" />
    }
    if (isDragActive) {
      return <CheckCircle className="h-12 w-12 text-green-400" />
    }
    return <Upload className="h-12 w-12 text-gray-400" />
  }

  const getStatusText = () => {
    if (isLoading && processingStatus) {
      return {
        title: processingStatus.stage,
        subtitle: `${Math.round(processingStatus.progress)}% concluído${
          processingStatus.method ? ` • Método: ${processingStatus.method}` : ''
        }`
      }
    }
    if (isLoading) {
      return {
        title: 'Processando PDF...',
        subtitle: 'Convertendo páginas e detectando campos'
      }
    }
    if (dragError) {
      return {
        title: 'Erro no arquivo',
        subtitle: dragError
      }
    }
    if (isDragReject) {
      return {
        title: 'Arquivo não suportado',
        subtitle: 'Apenas arquivos PDF são aceitos'
      }
    }
    if (isDragActive) {
      return {
        title: 'Solte o arquivo aqui',
        subtitle: 'PDF será processado automaticamente'
      }
    }
    return {
      title: 'Arraste um PDF ou clique para selecionar',
      subtitle: 'Sistema inteligente com 3 métodos de conversão'
    }
  }

  const statusText = getStatusText()
  const borderColor = dragError || isDragReject 
    ? 'border-red-300' 
    : isDragActive 
      ? 'border-green-400' 
      : isLoading 
        ? 'border-primary-400' 
        : 'border-gray-300 hover:border-primary-400'

  const bgColor = dragError || isDragReject 
    ? 'bg-red-50' 
    : isDragActive 
      ? 'bg-green-50' 
      : isLoading 
        ? 'bg-primary-50' 
        : 'bg-white hover:bg-gray-50'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${borderColor} ${bgColor}
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className={`text-lg font-medium ${
              dragError || isDragReject ? 'text-red-700' : 
              isDragActive ? 'text-green-700' : 
              isLoading ? 'text-primary-700' : 'text-gray-900'
            }`}>
              {statusText.title}
            </p>
            <p className={`text-sm mt-1 ${
              dragError || isDragReject ? 'text-red-600' : 
              isDragActive ? 'text-green-600' : 
              isLoading ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {statusText.subtitle}
            </p>
          </div>
          
          {/* Progress Bar */}
          {isLoading && processingStatus && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingStatus.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Features */}
          {!isLoading && !dragError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 mt-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Conversão Rápida</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Múltiplas Páginas</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>3 Métodos Failover</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Method Info */}
      {isLoading && processingStatus?.method && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Zap className="h-4 w-4" />
            <span>Usando método: <strong>{processingStatus.method}</strong></span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Sistema de failover garante conversão mesmo se um método falhar
          </p>
        </div>
      )}
      
      {/* Success Message with Manual Redirect */}
      {processingStatus && processingStatus.progress === 100 && processingStatus.stage.includes('✅') && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>{processingStatus.stage}</span>
            </div>
            <button
              onClick={() => {
                const processingData = localStorage.getItem('current_processing')
                if (processingData) {
                  const data = JSON.parse(processingData)
                  const designerUrl = `/designer?processing=${encodeURIComponent(data.processingId)}`
                  window.location.href = designerUrl
                }
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Ir para o Editor →
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Se não foi redirecionado automaticamente, clique no botão acima
          </p>
        </div>
      )}
    </div>
  )
}