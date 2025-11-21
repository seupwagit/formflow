import { NextRequest, NextResponse } from 'next/server'
import { TemplateBackgroundManager } from '@/lib/template-background-manager'
import { StorageImageManager } from '@/lib/storage-image-manager'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando correção de imagens de templates...')
    
    // 1. Listar imagens disponíveis no storage
    console.log('📋 Listando imagens disponíveis no storage...')
    const availableImages = await StorageImageManager.listProcessedImages()
    console.log(`📸 Encontradas ${availableImages.length} imagens no storage`)
    
    // 2. Executar migração completa
    console.log('🔄 Executando migração completa...')
    await TemplateBackgroundManager.migrateExistingTemplates()

    // 3. Verificar resultado
    console.log('✅ Verificando resultado da migração...')
    
    const { supabase } = await import('@/lib/supabase')
    
    const { data: templates } = await supabase
      .from('form_templates')
      .select('id, name, image_paths')

    const results = templates?.map(template => ({
      id: (template as any).id,
      name: (template as any).name,
      imageCount: (template as any).image_paths?.length || 0,
      images: (template as any).image_paths || []
    })) || []

    console.log('🎯 Correção concluída!')
    
    return NextResponse.json({
      success: true,
      message: 'Migração concluída com sucesso',
      availableImages: availableImages.length,
      templates: results
    })
    
  } catch (error) {
    console.error('❌ Erro na correção:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro na migração',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Listar status atual dos templates
    const { supabase } = await import('@/lib/supabase')
    
    const { data: templates } = await supabase
      .from('form_templates')
      .select('id, name, image_paths, created_at')

    const availableImages = await StorageImageManager.listProcessedImages()

    return NextResponse.json({
      templates: templates?.map(template => ({
        id: (template as any).id,
        name: (template as any).name,
        imageCount: (template as any).image_paths?.length || 0,
        images: (template as any).image_paths || [],
        hasImages: ((template as any).image_paths?.length || 0) > 0,
        created_at: (template as any).created_at
      })) || [],
      availableImages: availableImages.map(img => ({
        name: img.name,
        url: img.publicUrl,
        created_at: img.created_at
      }))
    })
  } catch (error) {
    console.error('Erro ao obter status:', error)
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}