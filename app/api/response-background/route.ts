import { NextRequest, NextResponse } from 'next/server'
import { ResponseBackgroundManager } from '@/lib/response-background-manager'

export async function POST(request: NextRequest) {
  try {
    const { action, responseId, templateId } = await request.json()
    
    if (!action) {
      return NextResponse.json({
        success: false,
        message: 'action é obrigatório'
      }, { status: 400 })
    }
    
    switch (action) {
      case 'associate':
        if (!responseId || !templateId) {
          return NextResponse.json({
            success: false,
            message: 'responseId e templateId são obrigatórios para associação'
          }, { status: 400 })
        }
        
        const result = await ResponseBackgroundManager.associateResponseWithCurrentBackground(
          responseId,
          templateId
        )
        
        return NextResponse.json(result)
      
      case 'migrate':
        const migration = await ResponseBackgroundManager.migrateExistingResponses()
        
        return NextResponse.json({
          success: true,
          message: `Migração concluída: ${migration.migrated}/${migration.processed} respostas`,
          migration
        })
      
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação não reconhecida'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ Erro na API:', error)
    
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
    const responseId = searchParams.get('responseId')
    
    if (!responseId) {
      return NextResponse.json({
        success: false,
        message: 'responseId é obrigatório'
      }, { status: 400 })
    }
    
    const result = await ResponseBackgroundManager.getResponseBackgroundVersion(responseId)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Erro na API:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}