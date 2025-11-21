import { NextRequest, NextResponse } from 'next/server'
import { TemplateImageResolver } from '@/lib/template-image-resolver'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    
    if (!templateId) {
      return NextResponse.json({
        success: false,
        message: 'templateId é obrigatório'
      }, { status: 400 })
    }
    
    // Diagnóstico completo
    const diagnosis = await TemplateImageResolver.diagnoseTemplate(templateId)
    
    return NextResponse.json({
      success: true,
      diagnosis
    })
    
  } catch (error) {
    console.error('Erro no diagnóstico:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, autoFix } = await request.json()
    
    if (!templateId) {
      return NextResponse.json({
        success: false,
        message: 'templateId é obrigatório'
      }, { status: 400 })
    }
    
    console.log(`🔧 Processando template: ${templateId}`)
    
    if (autoFix) {
      // Garantir que o template tenha imagens válidas
      const resolution = await TemplateImageResolver.ensureTemplateHasImages(templateId)
      
      return NextResponse.json({
        success: resolution.success,
        message: resolution.message,
        images: resolution.images,
        wasFixed: resolution.wasFixed
      })
    } else {
      // Apenas resolver imagens
      const resolution = await TemplateImageResolver.resolveTemplateImages(templateId)
      
      return NextResponse.json({
        success: resolution.success,
        message: resolution.message,
        images: resolution.images,
        template: resolution.template
      })
    }
    
  } catch (error) {
    console.error('Erro no processamento:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}