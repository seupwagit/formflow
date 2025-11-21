import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando correção de todos os templates...')
    
    // Buscar todos os templates
    const { data: templates, error: fetchError } = await supabase
      .from('form_templates')
      .select('id, name, image_paths')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error(`Erro ao buscar templates: ${fetchError.message}`)
    }

    let processed = 0
    let fixed = 0
    let errors: string[] = []

    for (const template of templates || []) {
      processed++
      
      try {
        console.log(`\n📋 Processando template: ${(template as any).name} (${(template as any).id})`)
        
        if (!(template as any).image_paths || (template as any).image_paths.length === 0) {
          console.log(`⚠️ Template ${(template as any).name} sem imagens - pulando`)
          continue
        }

        // Verificar se alguma imagem não é URL pública completa
        const needsFix = (template as any).image_paths.some((path: string) => 
          !path.startsWith('http')
        )

        if (!needsFix) {
          console.log(`✅ Template ${(template as any).name} já está correto`)
          continue
        }

        console.log(`🔧 Corrigindo template ${(template as any).name}...`)

        // Converter todos os caminhos para URLs públicas
        const publicUrls = (template as any).image_paths.map((path: string) => {
          if (path.startsWith('http')) {
            return path // Já é URL pública
          }

          // Converter caminho relativo para URL pública
          const { data } = supabase.storage
            .from('processed-images')
            .getPublicUrl(path)

          return data.publicUrl
        })

        console.log(`📸 Convertendo ${(template as any).image_paths.length} imagem(ns):`)
        publicUrls.forEach((url: string, index: number) => {
          console.log(`   ${index + 1}. ${url}`)
        })

        // Atualizar template no banco
        const { error: updateError } = await (supabase as any)
          .from('form_templates')
          .update({
            image_paths: publicUrls,
            pdf_pages: publicUrls.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', (template as any).id)

        if (updateError) {
          const errorMsg = `Erro ao atualizar ${(template as any).name}: ${updateError.message}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
        } else {
          console.log(`✅ Template ${(template as any).name} corrigido com sucesso`)
          fixed++
        }

      } catch (templateError) {
        const errorMsg = `Erro no template ${(template as any).name}: ${templateError instanceof Error ? templateError.message : 'Erro desconhecido'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    const summary = {
      processed,
      fixed,
      errors: errors.length,
      errorDetails: errors
    }

    console.log(`\n📊 Correção concluída:`)
    console.log(`   📋 Templates processados: ${processed}`)
    console.log(`   🔧 Templates corrigidos: ${fixed}`)
    console.log(`   ❌ Erros: ${errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Correção concluída: ${fixed} templates corrigidos de ${processed} processados`,
      summary
    })

  } catch (error) {
    console.error('❌ Erro na correção geral:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apenas verificar quantos templates precisam de correção
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('id, name, image_paths')

    if (error) {
      throw new Error(`Erro ao buscar templates: ${error.message}`)
    }

    let total = 0
    let needsFix = 0
    let withoutImages = 0

    for (const template of templates || []) {
      total++
      
      if (!(template as any).image_paths || (template as any).image_paths.length === 0) {
        withoutImages++
        continue
      }

      const hasRelativePaths = (template as any).image_paths.some((path: string) => 
        !path.startsWith('http')
      )

      if (hasRelativePaths) {
        needsFix++
      }
    }

    return NextResponse.json({
      success: true,
      analysis: {
        total,
        needsFix,
        withoutImages,
        alreadyCorrect: total - needsFix - withoutImages
      },
      message: `Análise: ${needsFix} templates precisam de correção de ${total} totais`
    })

  } catch (error) {
    console.error('❌ Erro na análise:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}