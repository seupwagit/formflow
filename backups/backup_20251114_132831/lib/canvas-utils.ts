/**
 * Utilitários para trabalhar com Canvas de forma segura
 */

export interface CanvasProcessingOptions {
  scale?: number
  enhanceContrast?: boolean
  binarize?: boolean
  quality?: number
}

/**
 * Carrega uma imagem no canvas de forma segura, evitando problemas de CORS
 */
export async function loadImageToCanvas(
  imageUrl: string, 
  options: CanvasProcessingOptions = {}
): Promise<string> {
  try {
    // Se for data URL, processar diretamente
    if (imageUrl.startsWith('data:')) {
      return processDataUrlImage(imageUrl, options)
    }

    // Para URLs externas, tentar com CORS
    return await processExternalImage(imageUrl, options)
    
  } catch (error) {
    console.warn('⚠️ Erro no processamento de imagem, retornando original:', error)
    return imageUrl
  }
}

/**
 * Processa imagem data URL
 */
async function processDataUrlImage(
  dataUrl: string, 
  options: CanvasProcessingOptions
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        const scale = options.scale || 1
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Aplicar filtros se necessário
        if (options.enhanceContrast) {
          ctx.filter = 'contrast(150%) brightness(110%)'
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Aplicar binarização se configurado
        if (options.binarize) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          binarizeImageData(imageData)
          ctx.putImageData(imageData, 0, 0)
        }
        
        const quality = options.quality || 1.0
        resolve(canvas.toDataURL('image/png', quality))
        
      } catch (error) {
        console.warn('⚠️ Erro no processamento do canvas:', error)
        resolve(dataUrl)
      }
    }
    
    img.onerror = () => {
      console.warn('⚠️ Erro ao carregar data URL')
      resolve(dataUrl)
    }
    
    img.src = dataUrl
  })
}

/**
 * Processa imagem externa com CORS
 */
async function processExternalImage(
  imageUrl: string, 
  options: CanvasProcessingOptions
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        const scale = options.scale || 1
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Aplicar filtros se necessário
        if (options.enhanceContrast) {
          ctx.filter = 'contrast(150%) brightness(110%)'
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Aplicar binarização se configurado
        if (options.binarize) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          binarizeImageData(imageData)
          ctx.putImageData(imageData, 0, 0)
        }
        
        const quality = options.quality || 1.0
        resolve(canvas.toDataURL('image/png', quality))
        
      } catch (error) {
        console.warn('⚠️ Canvas tainted, retornando URL original:', error)
        resolve(imageUrl)
      }
    }
    
    img.onerror = () => {
      console.warn('⚠️ Erro ao carregar imagem externa')
      resolve(imageUrl)
    }
    
    // Configurar CORS
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
}

/**
 * Aplica binarização em ImageData
 */
function binarizeImageData(imageData: ImageData): void {
  const data = imageData.data
  const threshold = 128
  
  for (let i = 0; i < data.length; i += 4) {
    // Converter para escala de cinza
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    
    // Aplicar threshold
    const binary = gray > threshold ? 255 : 0
    
    data[i] = binary     // R
    data[i + 1] = binary // G
    data[i + 2] = binary // B
    // data[i + 3] permanece o mesmo (alpha)
  }
}

/**
 * Converte blob para data URL de forma segura
 */
export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      resolve(reader.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao converter blob para data URL'))
    }
    
    reader.readAsDataURL(blob)
  })
}

/**
 * Verifica se uma URL é um data URL
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:')
}

/**
 * Verifica se uma imagem pode ser processada sem problemas de CORS
 */
export async function canProcessImage(imageUrl: string): Promise<boolean> {
  if (isDataUrl(imageUrl)) {
    return true
  }
  
  try {
    // Tentar fazer um fetch HEAD para verificar CORS
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors'
    })
    return response.ok
  } catch {
    return false
  }
}