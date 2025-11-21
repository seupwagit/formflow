import { supabase } from './supabase'

export interface StorageImage {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: any
  publicUrl: string
}

export class StorageImageManager {
  /**
   * Lista todas as imagens no bucket processed-images
   */
  static async listProcessedImages(): Promise<StorageImage[]> {
    try {
      const { data, error } = await supabase.storage
        .from('processed-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('Erro ao listar imagens:', error)
        return []
      }

      // Converter para formato com URL pública
      const images: StorageImage[] = (data || []).map(file => {
        const { data: publicUrlData } = supabase.storage
          .from('processed-images')
          .getPublicUrl(file.name)

        return {
          ...file,
          publicUrl: publicUrlData.publicUrl
        }
      })

      return images
    } catch (error) {
      console.error('Erro ao listar imagens:', error)
      return []
    }
  }

  /**
   * Busca imagens relacionadas a um template específico
   */
  static async findImagesForTemplate(templateId: string, templateName?: string): Promise<string[]> {
    try {
      console.log(`🔍 Buscando imagens para template: ${templateName} (ID: ${templateId})`)
      
      // Primeiro, buscar no banco se o template tem created_at
      const { data: templateData } = await supabase
        .from('form_templates')
        .select('created_at, name')
        .eq('id', templateId)
        .single()
      
      const templateCreatedAt = (templateData as any)?.created_at
      console.log(`📅 Template criado em: ${templateCreatedAt}`)
      
      const images = await this.listProcessedImages()
      console.log(`📸 Total de imagens no storage: ${images.length}`)
      
      if (images.length === 0) {
        console.log('⚠️ Nenhuma imagem encontrada no storage')
        return []
      }
      
      // Estratégia 1: Buscar por timestamp próximo (±5 minutos)
      if (templateCreatedAt) {
        const templateTime = new Date(templateCreatedAt).getTime()
        const timeWindow = 5 * 60 * 1000 // 5 minutos em ms
        
        const timeBasedImages = images.filter(image => {
          const imageTime = new Date(image.created_at).getTime()
          const timeDiff = Math.abs(imageTime - templateTime)
          return timeDiff <= timeWindow
        })
        
        if (timeBasedImages.length > 0) {
          console.log(`✅ Encontradas ${timeBasedImages.length} imagem(ns) por timestamp`)
          timeBasedImages.sort((a, b) => a.name.localeCompare(b.name))
          return timeBasedImages.map(img => this.getPublicUrl(img.name))
        }
      }
      
      // Estratégia 2: Buscar por nome do template
      if (templateName) {
        const nameBasedImages = images.filter(image => {
          const fileName = image.name.toLowerCase()
          const templateNameLower = templateName.toLowerCase()
          
          return (
            fileName.includes(templateNameLower) ||
            fileName.includes(templateNameLower.replace(/\s+/g, '_')) ||
            fileName.includes(templateNameLower.replace(/\s+/g, ''))
          )
        })
        
        if (nameBasedImages.length > 0) {
          console.log(`✅ Encontradas ${nameBasedImages.length} imagem(ns) por nome`)
          nameBasedImages.sort((a, b) => a.name.localeCompare(b.name))
          return nameBasedImages.map(img => this.getPublicUrl(img.name))
        }
      }
      
      // Estratégia 3: Usar imagem mais recente
      console.log(`🔄 Usando estratégia de fallback: imagem mais recente`)
      const sortedByDate = images.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      const mostRecentImage = sortedByDate[0]
      if (mostRecentImage) {
        console.log(`✅ Usando imagem mais recente: ${mostRecentImage.name}`)
        return [this.getPublicUrl(mostRecentImage.name)]
      }
      
      console.log('❌ Nenhuma imagem adequada encontrada')
      return []
      
    } catch (error) {
      console.error('❌ Erro ao buscar imagens para template:', error)
      return []
    }
  }

  /**
   * Obtém URL pública de uma imagem específica
   */
  static getPublicUrl(imagePath: string): string {
    // Se já é uma URL completa, retornar como está
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath
    }

    // Se é um caminho relativo, construir URL pública
    const { data } = supabase.storage
      .from('processed-images')
      .getPublicUrl(imagePath)

    return data.publicUrl
  }

  /**
   * Verifica se uma imagem existe no storage
   */
  static async imageExists(imagePath: string): Promise<boolean> {
    try {
      // Extrair nome do arquivo da URL se necessário
      let fileName = imagePath
      if (imagePath.includes('/processed-images/')) {
        fileName = imagePath.split('/processed-images/').pop() || imagePath
      }

      const { data, error } = await supabase.storage
        .from('processed-images')
        .list('', {
          search: fileName
        })

      return !error && data && data.length > 0
    } catch (error) {
      console.error('Erro ao verificar existência da imagem:', error)
      return false
    }
  }

  /**
   * Migra templates existentes associando imagens do storage
   */
  static async migrateTemplateImages(): Promise<void> {
    try {
      console.log('🔄 Iniciando migração de imagens de templates...')

      // Buscar todos os templates
      const { data: templates, error } = await supabase
        .from('form_templates')
        .select('id, name, image_paths, pdf_path')

      if (error) {
        console.error('Erro ao buscar templates:', error)
        return
      }

      for (const template of templates || []) {
        console.log(`📋 Processando template: ${(template as any).name} (${(template as any).id})`)

        // Se já tem imagens válidas, pular
        if ((template as any).image_paths && (template as any).image_paths.length > 0) {
          const hasValidImages = await Promise.all(
            (template as any).image_paths.map((path: string) => this.imageExists(path))
          )
          
          if (hasValidImages.some(valid => valid)) {
            console.log(`✅ Template ${(template as any).name} já tem imagens válidas`)
            continue
          }
        }

        // Buscar imagens relacionadas no storage
        const relatedImages = await this.findImagesForTemplate((template as any).id, (template as any).name)

        if (relatedImages.length > 0) {
          console.log(`📸 Encontradas ${relatedImages.length} imagens para ${(template as any).name}`)

          // Atualizar template com as imagens encontradas
          const { error: updateError } = await (supabase as any)
            .from('form_templates')
            .update({
              image_paths: relatedImages,
              updated_at: new Date().toISOString()
            })
            .eq('id', (template as any).id)

          if (updateError) {
            console.error(`❌ Erro ao atualizar template ${(template as any).name}:`, updateError)
          } else {
            console.log(`✅ Template ${(template as any).name} atualizado com ${relatedImages.length} imagens`)
          }
        } else {
          console.log(`⚠️ Nenhuma imagem encontrada para template ${(template as any).name}`)
        }
      }

      console.log('✅ Migração de imagens concluída!')
    } catch (error) {
      console.error('❌ Erro na migração de imagens:', error)
    }
  }

  /**
   * Busca imagens por padrão de nome
   */
  static async findImagesByPattern(pattern: string): Promise<StorageImage[]> {
    try {
      const allImages = await this.listProcessedImages()
      
      return allImages.filter(image => 
        image.name.toLowerCase().includes(pattern.toLowerCase())
      )
    } catch (error) {
      console.error('Erro ao buscar imagens por padrão:', error)
      return []
    }
  }

  /**
   * Associa imagens específicas a um template
   */
  static async associateImagesToTemplate(
    templateId: string, 
    imageNames: string[]
  ): Promise<boolean> {
    try {
      // Converter nomes para URLs públicas
      const imageUrls = imageNames.map(name => {
        const { data } = supabase.storage
          .from('processed-images')
          .getPublicUrl(name)
        return data.publicUrl
      })

      // Atualizar template
      const { error } = await (supabase as any)
        .from('form_templates')
        .update({
          image_paths: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) {
        console.error('Erro ao associar imagens ao template:', error)
        return false
      }

      console.log(`✅ ${imageUrls.length} imagens associadas ao template`)
      return true
    } catch (error) {
      console.error('Erro ao associar imagens ao template:', error)
      return false
    }
  }

  /**
   * Busca e salva TODAS as páginas de um template no banco de dados
   * Garante que formulários multi-página tenham todas as imagens salvas
   */
  static async ensureAllPagesAreSaved(templateId: string, templateName?: string): Promise<{
    success: boolean
    totalPages: number
    savedPages: string[]
    message: string
  }> {
    try {
      console.log(`🔍 Garantindo que todas as páginas do template ${templateName} sejam salvas...`)
      
      // Buscar template atual
      const { data: template, error: templateError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        return {
          success: false,
          totalPages: 0,
          savedPages: [],
          message: 'Template não encontrado'
        }
      }

      // Buscar TODAS as imagens relacionadas ao template por timestamp e nome
      const templateTime = new Date((template as any).created_at).getTime()
      const timeWindow = 10 * 60 * 1000 // 10 minutos para ser mais flexível
      
      const allImages = await this.listProcessedImages()
      
      // Filtrar imagens por múltiplos critérios
      const candidateImages = allImages.filter(image => {
        const imageTime = new Date(image.created_at).getTime()
        const timeDiff = Math.abs(imageTime - templateTime)
        const fileName = image.name.toLowerCase()
        const templateNameLower = (templateName || '').toLowerCase()
        
        // Critérios de busca:
        // 1. Timestamp próximo (±10 minutos)
        // 2. Nome do template no arquivo
        // 3. Padrão de página (page_1, page_2, etc.)
        // 4. Mesmo ID de processamento
        
        const matchesTime = timeDiff <= timeWindow
        const matchesName = templateNameLower && (
          fileName.includes(templateNameLower) ||
          fileName.includes(templateNameLower.replace(/\s+/g, '_')) ||
          fileName.includes(templateNameLower.replace(/\s+/g, ''))
        )
        const isPageFile = fileName.includes('page_') || fileName.includes('_page_')
        
        // Extrair ID de processamento do nome do arquivo (proc_TIMESTAMP_ID_page_N)
        const procMatch = fileName.match(/proc_(\d+)_([^_]+)/)
        const hasSameProcessId = procMatch && (template as any).image_paths?.some((path: string) => 
          path.includes(procMatch[1]) || path.includes(procMatch[2])
        )
        
        return matchesTime || matchesName || isPageFile || hasSameProcessId
      })

      console.log(`📸 Encontradas ${candidateImages.length} imagens candidatas`)
      
      if (candidateImages.length === 0) {
        return {
          success: false,
          totalPages: 0,
          savedPages: [],
          message: 'Nenhuma imagem encontrada para o template'
        }
      }

      // Agrupar por ID de processamento para identificar páginas do mesmo documento
      const imageGroups = new Map<string, StorageImage[]>()
      
      candidateImages.forEach(image => {
        // Extrair ID de processamento (proc_TIMESTAMP_ID)
        const match = image.name.match(/proc_(\d+)_([^_]+)/)
        if (match) {
          const processId = `${match[1]}_${match[2]}`
          if (!imageGroups.has(processId)) {
            imageGroups.set(processId, [])
          }
          imageGroups.get(processId)!.push(image)
        }
      })

      console.log(`📊 Encontrados ${imageGroups.size} grupo(s) de processamento`)

      // Selecionar o grupo com mais páginas (mais provável de ser o correto)
      let bestGroup: StorageImage[] = []
      let bestGroupId = ''
      
      for (const [groupId, images] of Array.from(imageGroups.entries())) {
        console.log(`   Grupo ${groupId}: ${images.length} página(s)`)
        if (images.length > bestGroup.length) {
          bestGroup = images
          bestGroupId = groupId
        }
      }

      // Se não encontrou grupos, usar todas as imagens candidatas
      if (bestGroup.length === 0) {
        bestGroup = candidateImages
        bestGroupId = 'mixed'
      }

      // Ordenar páginas por número (page_1, page_2, etc.)
      bestGroup.sort((a, b) => {
        const pageA = a.name.match(/page_(\d+)/)
        const pageB = b.name.match(/page_(\d+)/)
        
        if (pageA && pageB) {
          return parseInt(pageA[1]) - parseInt(pageB[1])
        }
        
        // Fallback: ordenar por nome
        return a.name.localeCompare(b.name)
      })

      // Converter para URLs públicas
      const pageUrls = bestGroup.map(img => this.getPublicUrl(img.name))
      
      console.log(`📄 Salvando ${pageUrls.length} página(s) no banco:`)
      pageUrls.forEach((url, index) => {
        console.log(`   Página ${index + 1}: ${url}`)
      })

      // Salvar no banco de dados
      const { error: updateError } = await (supabase as any)
        .from('form_templates')
        .update({
          image_paths: pageUrls,
          pdf_pages: pageUrls.length, // Atualizar número de páginas
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (updateError) {
        console.error('❌ Erro ao salvar páginas no banco:', updateError)
        return {
          success: false,
          totalPages: pageUrls.length,
          savedPages: [],
          message: `Erro ao salvar: ${updateError.message}`
        }
      }

      console.log(`✅ ${pageUrls.length} página(s) salva(s) com sucesso no banco de dados`)
      
      return {
        success: true,
        totalPages: pageUrls.length,
        savedPages: pageUrls,
        message: `${pageUrls.length} página(s) salva(s) com sucesso (Grupo: ${bestGroupId})`
      }

    } catch (error) {
      console.error('❌ Erro ao garantir salvamento de páginas:', error)
      return {
        success: false,
        totalPages: 0,
        savedPages: [],
        message: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Verifica e corrige templates que podem ter páginas faltando
   */
  static async auditAndFixAllTemplates(): Promise<{
    processed: number
    fixed: number
    errors: string[]
  }> {
    try {
      console.log('🔍 Iniciando auditoria de todos os templates...')
      
      const { data: templates, error } = await supabase
        .from('form_templates')
        .select('id, name, image_paths, pdf_pages, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Erro ao buscar templates: ${error.message}`)
      }

      let processed = 0
      let fixed = 0
      const errors: string[] = []

      for (const template of templates || []) {
        processed++
        console.log(`\n📋 Auditando template: ${(template as any).name}`)
        
        try {
          // Verificar se precisa de correção
          const templateData = template as any
          const needsFix = !templateData.image_paths || 
                          templateData.image_paths.length === 0 ||
                          templateData.image_paths.some((path: string) => !path || path === '')

          if (needsFix) {
            console.log(`🔧 Template ${templateData.name} precisa de correção`)
            
            const result = await this.ensureAllPagesAreSaved(templateData.id, templateData.name)
            
            if (result.success) {
              console.log(`✅ Template ${templateData.name} corrigido: ${result.totalPages} página(s)`)
              fixed++
            } else {
              const errorMsg = `Template ${templateData.name}: ${result.message}`
              console.log(`❌ ${errorMsg}`)
              errors.push(errorMsg)
            }
          } else {
            console.log(`✅ Template ${templateData.name} já está correto (${templateData.image_paths.length} página(s))`)
          }
        } catch (templateError) {
          const errorMsg = `Erro no template ${(template as any).name}: ${templateError instanceof Error ? templateError.message : 'Erro desconhecido'}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
        }
      }

      console.log(`\n📊 Auditoria concluída:`)
      console.log(`   📋 Templates processados: ${processed}`)
      console.log(`   🔧 Templates corrigidos: ${fixed}`)
      console.log(`   ❌ Erros: ${errors.length}`)

      return { processed, fixed, errors }

    } catch (error) {
      console.error('❌ Erro na auditoria:', error)
      return {
        processed: 0,
        fixed: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido na auditoria']
      }
    }
  }
}