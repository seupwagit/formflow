import { NextRequest, NextResponse } from 'next/server'
import { ImageLoaderUtils } from '@/lib/image-loader-utils'

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json()
    
    if (!templateId) {
      return NextResponse.json({
        success: false,
        message: 'templateId é obrigatório'
      }, { status: 400 })
    }
    
    console.log(`🔧 Iniciando correção do template: ${templateId}`)
    
    // 1. Diagnóstico
    const diagnosis = await ImageLoaderUtils.diagnoseTemplateImages(templateId)
    
    // 2. Correção se necessário
    let correctionApplied = false
    if (diagnosis.inaccessibleImages.length > 0 || diagnosis.imageCount === 0) {
      // URL correta para o template FGTS
      const correctImageUrl = 'https://fzbjggdfmdabimsfruqy.supabase.co/storage/v1/object/public/processed-images/processed/proc_1762090081005_w43335805_page_1.png'
      
      const isAccessible = await ImageLoaderUtils.checkUrlAccessibility(correctImageUrl)
      
      if (isAccessible) {
        const success = await ImageLoaderUtils.forceUpdateTemplateImages(
          templateId,
          [correctImageUrl]
        )
        correctionApplied = success
      }
    }
    
    // 3. Diagnóstico final
    const finalDiagnosis = await ImageLoaderUtils.diagnoseTemplateImages(templateId)
    
    return NextResponse.json({
      success: true,
      message: 'Diagnóstico e correção concluídos',
      diagnosis: {
        initial: diagnosis,
        final: finalDiagnosis,
        correctionApplied
      }
    })
    
  } catch (error) {
    console.error('Erro na correção do template:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

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
    
    // Apenas diagnóstico
    const diagnosis = await ImageLoaderUtils.diagnoseTemplateImages(templateId)
    
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