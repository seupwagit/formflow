'use client'

import { useState } from 'react'

export default function PDFTestSimple() {
  const [status, setStatus] = useState<string>('Pronto para testar')
  const [testing, setTesting] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const testPDFConversion = async (file: File) => {
    setTesting(true)
    setStatus('Iniciando teste...')
    setImages([])

    try {
      console.log('🔄 Iniciando teste de conversão PDF...')
      setStatus('Importando PDF.js...')

      // Importar PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      console.log('✅ PDF.js importado:', pdfjsLib.version)

      // Configurar worker SIMPLES
      const { forceLocalWorker } = await import('@/lib/pdf-worker-simple')
      const workerSrc = forceLocalWorker(pdfjsLib)
      setStatus(`Worker configurado: ${workerSrc}`)

      // Converter arquivo para ArrayBuffer
      setStatus('Lendo arquivo...')
      const arrayBuffer = await file.arrayBuffer()
      console.log(`📄 Arquivo lido: ${arrayBuffer.byteLength} bytes`)

      // Carregar PDF
      setStatus('Carregando PDF...')
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log(`📄 PDF carregado: ${pdf.numPages} páginas`)

      setStatus(`Convertendo ${pdf.numPages} páginas...`)
      const convertedImages: string[] = []

      // Converter cada página
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`🖼️ Convertendo página ${pageNum}/${pdf.numPages}`)
        setStatus(`Convertendo página ${pageNum}/${pdf.numPages}...`)

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })

        // Criar canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height

        // Renderizar página
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Converter para base64
        const imageData = canvas.toDataURL('image/png', 0.9)
        convertedImages.push(imageData)

        console.log(`✅ Página ${pageNum} convertida (${Math.round(imageData.length / 1024)}KB)`)
      }

      setImages(convertedImages)
      setStatus(`✅ Sucesso! ${convertedImages.length} páginas convertidas`)
      console.log('🎉 Conversão concluída com sucesso!')

    } catch (error) {
      console.error('❌ Erro na conversão:', error)
      setStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setTesting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      testPDFConversion(file)
    } else {
      setStatus('❌ Por favor, selecione um arquivo PDF')
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Teste Simples PDF.js</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Selecionar arquivo PDF:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={testing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <p className="font-medium">Status:</p>
          <p className={`p-3 rounded text-sm ${
            status.includes('✅') ? 'bg-green-100 text-green-800' :
            status.includes('❌') ? 'bg-red-100 text-red-800' :
            testing ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </p>
        </div>

        {testing && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Processando...</span>
          </div>
        )}

        {images.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Páginas Convertidas:</h3>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {images.map((image, index) => (
                <div key={index} className="border rounded p-2">
                  <p className="text-xs text-gray-600 mb-1">Página {index + 1}</p>
                  <img 
                    src={image} 
                    alt={`Página ${index + 1}`}
                    className="w-full h-auto max-h-32 object-contain border"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(image.length / 1024)}KB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}