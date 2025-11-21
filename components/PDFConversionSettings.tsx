'use client'

import { useState } from 'react'
import { FileImage, Settings, RefreshCw, CheckCircle } from 'lucide-react'

export default function PDFConversionSettings() {
  const [isTestingConversion, setIsTestingConversion] = useState(false)
  const [conversionResult, setConversionResult] = useState<any>(null)

  const testPDFConversion = async () => {
    setIsTestingConversion(true)
    setConversionResult(null)

    try {
      // Criar um PDF de teste simples
      const testPDF = await createTestPDF()
      
      // Testar conversão
      const { PDFConverterFailover } = await import('@/lib/pdf-converter-failover')
      const converter = new PDFConverterFailover()
      
      const result = await converter.convertPDFToImages(testPDF, (method, progress) => {
        console.log(`Testando ${method}: ${progress}%`)
      })
      
      setConversionResult(result)
      
    } catch (error) {
      setConversionResult({
        success: false,
        error: (error as Error).message,
        method: 'none'
      })
    } finally {
      setIsTestingConversion(false)
    }
  }

  const createTestPDF = async (): Promise<File> => {
    // Criar um canvas com texto de teste
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 800
    const ctx = canvas.getContext('2d')!
    
    // Fundo branco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Texto de teste
    ctx.fillStyle = 'black'
    ctx.font = '20px Arial'
    ctx.fillText('TESTE DE CONVERSÃO PDF', 50, 100)
    ctx.fillText('Nome: ________________', 50, 200)
    ctx.fillText('Data: ________________', 50, 300)
    ctx.fillText('Assinatura: ________________', 50, 400)
    
    // Converter canvas para blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png')
    })
    
    // Simular um arquivo PDF (na verdade é PNG, mas para teste)
    return new File([blob], 'test.pdf', { type: 'application/pdf' })
  }

  const conversionConfig = {
    failoverOrder: process.env.OCR_FAILOVER_ORDER || 'localjs,pdf-to-img,pdftoimg-js',
    pdfQuality: process.env.PDF_QUALITY || '0.9',
    pdfScale: process.env.PDF_SCALE || '2.0',
    maxWidth: process.env.PDF_MAX_WIDTH || '1200',
    maxHeight: process.env.PDF_MAX_HEIGHT || '1600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Configurações de Conversão PDF</h3>
        </div>
        
        <button
          onClick={testPDFConversion}
          disabled={isTestingConversion}
          className="flex items-center space-x-2 btn-secondary"
        >
          {isTestingConversion ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          <span>{isTestingConversion ? 'Testando...' : 'Testar Conversão'}</span>
        </button>
      </div>

      {/* Configurações Atuais */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Ordem de Failover</h4>
          <div className="space-y-1 text-sm">
            {conversionConfig.failoverOrder.split(',').map((method, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="w-4 h-4 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-700">{method}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Parâmetros</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Qualidade: {conversionConfig.pdfQuality}</div>
            <div>Escala: {conversionConfig.pdfScale}x</div>
            <div>Max Width: {conversionConfig.maxWidth}px</div>
            <div>Max Height: {conversionConfig.maxHeight}px</div>
          </div>
        </div>
      </div>

      {/* Resultado do Teste */}
      {conversionResult && (
        <div className={`p-3 rounded-lg ${
          conversionResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {conversionResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Settings className="h-4 w-4 text-red-500" />
            )}
            <span className={`font-medium ${
              conversionResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {conversionResult.success ? 'Conversão Bem-sucedida' : 'Falha na Conversão'}
            </span>
          </div>
          
          {conversionResult.success ? (
            <div className="text-sm text-green-700">
              <div>Método usado: <strong>{conversionResult.method}</strong></div>
              <div>Páginas convertidas: <strong>{conversionResult.pages}</strong></div>
              <div>Imagens geradas: <strong>{conversionResult.images?.length || 0}</strong></div>
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <div>Erro: {conversionResult.error}</div>
              <div>Método tentado: {conversionResult.method}</div>
            </div>
          )}
        </div>
      )}

      {/* Descrição dos Métodos */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-gray-900 mb-2">Métodos de Conversão</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <strong>localjs (PDF.js):</strong> Biblioteca JavaScript local, mais confiável
          </div>
          <div>
            <strong>pdf-to-img:</strong> Serviço de conversão alternativo
          </div>
          <div>
            <strong>pdftoimg-js:</strong> Biblioteca de fallback final
          </div>
        </div>
      </div>

      {/* Fluxo Completo */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="text-sm text-blue-700">
          <div className="font-medium mb-1">Fluxo Completo:</div>
          <div className="space-y-1 text-xs">
            <div>1. 📄 Conversão PDF → PNG (com failover)</div>
            <div>2. ☁️ Upload para Supabase Storage</div>
            <div>3. 🤖 OCR com Gemini Vision API</div>
            <div>4. 📝 Detecção inteligente de campos</div>
            <div>5. 💾 Salvamento no banco de dados</div>
          </div>
        </div>
      </div>
    </div>
  )
}