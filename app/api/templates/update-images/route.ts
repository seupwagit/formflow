import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TemplateBackgroundManager } from '@/lib/template-background-manager'

export async function POST(request: NextRequest) {
  try {
    const { templateId, imagePaths } = await request.json()
    
    if (!templateId || !imagePaths || !Array.isArray(imagePaths)) {
      return NextResponse.json({
        success: false,
        message: 'templateId e imagePaths são obrigatórios'
      }, { status: 400 })
    }
    
    console.log(`🔧 Atualizando template ${templateId} com ${imagePaths.length} imagens`)
    
    // Garantir que todas as imagens sejam URLs públicas completas
    const publicImageUrls = imagePaths.map(path => {
      // Se já é uma URL completa, usar como está
      if (path.startsWith('http')) {
        return path
      }
      
      // Se é um caminho relativo, converter para URL pública
      const { data } = supabase.storage
        .from('processed-images')
        .getPublicUrl(path)
      
      return data.publicUrl
    })

    console.log(`📸 URLs públicas garantidas:`)
    publicImageUrls.forEach((url, index) => {
      console.log(`   Página ${index + 1}: ${url}`)
    })
    
    // Atualizar template com URLs públicas
    const { error: updateError } = await (supabase as any)
      .from('form_templates')
      .update({
        image_paths: publicImageUrls, // ✅ SEMPRE URLs PÚBLICAS
        pdf_pages: publicImageUrls.length, // Atualizar número de páginas
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
    
    if (updateError) {
      console.error('❌ Erro ao atualizar template:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Erro ao atualizar template',
        error: updateError.message
      }, { status: 500 })
    }
    
    console.log('✅ Template atualizado no banco com URLs públicas')
    
    // Criar versão no sistema de versionamento
    try {
      const newVersion = await TemplateBackgroundManager.createNewBackgroundVersion(
        templateId,
        publicImageUrls // Usar URLs públicas no versionamento também
      )
      
      if (newVersion) {
        console.log(`✅ Nova versão criada: ${newVersion.version_number}`)
      }
    } catch (versionError) {
      console.warn('⚠️ Erro ao criar versão:', versionError)
      // Não falhar a operação por causa disso
    }
    
    return NextResponse.json({
      success: true,
      message: `Template atualizado com sucesso! ${publicImageUrls.length} página(s) salva(s).`,
      templateId,
      imagePaths: publicImageUrls, // Retornar URLs públicas
      totalPages: publicImageUrls.length
    })
    
  } catch (error) {
    console.error('❌ Erro na API:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}