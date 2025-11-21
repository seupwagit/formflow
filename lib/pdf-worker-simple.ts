/**
 * Configuração SIMPLES do worker PDF.js - apenas usa o worker local
 */

export async function setupSimplePDFWorker(pdfjsLib: any): Promise<string> {
  const localWorkerUrl = '/pdf.worker.min.js'
  
  console.log('🔧 Configurando worker PDF.js SIMPLES...')
  console.log(`🎯 Usando worker local: ${localWorkerUrl}`)
  
  // Configurar PDF.js diretamente
  pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl
  
  console.log('✅ Worker configurado com sucesso!')
  return localWorkerUrl
}

/**
 * Versão ainda mais direta - apenas define o worker sem testes
 */
export function forceLocalWorker(pdfjsLib: any): string {
  const localWorkerUrl = '/pdf.worker.min.js'
  
  console.log(`🎯 FORÇANDO worker local: ${localWorkerUrl}`)
  
  // Configurar PDF.js diretamente
  pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl
  
  console.log(`✅ Worker FORÇADO para: ${localWorkerUrl}`)
  return localWorkerUrl
}