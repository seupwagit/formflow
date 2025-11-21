import { NextRequest, NextResponse } from 'next/server'
import { StorageImageManager } from '@/lib/storage-image-manager'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando auditoria de templates...')
    
    const result = await StorageImageManager.auditAndFixAllTemplates()
    
    return NextResponse.json({
      success: true,
      audit: result,
      message: `Auditoria concluída: ${result.processed} templates processados, ${result.fixed} corrigidos`
    })
    
  } catch (error) {
    console.error('❌ Erro na auditoria:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, templateName } = await request.json()
    
    if (!templateId) {
      return NextResponse.json({
        success: false,
        message: 'templateId é obrigatório'
      }, { status: 400 })
    }
    
    console.log(`🔧 Garantindo todas as páginas para template: ${templateName || templateId}`)
    
    const result = await StorageImageManager.ensureAllPagesAreSaved(templateId, templateName)
    
    return NextResponse.json({
      success: result.success,
      totalPages: result.totalPages,
      savedPages: result.savedPages,
      message: result.message
    })
    
  } catch (error) {
    console.error('❌ Erro ao processar template:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}