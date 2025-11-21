// Script simples para associar imagens ao template
// Execute no console do navegador na página http://localhost:3001

async function fixTemplateImages() {
  console.log('🔧 Iniciando correção manual de imagens...')
  
  try {
    // URL da imagem que sabemos que existe
    const imageUrl = 'https://fzbjggdfmdabimsfruqy.supabase.co/storage/v1/object/public/processed-images/processed'
    
    // ID do template fgts
    const templateId = '6689f861-1e8a-4fa2-868a-6c90cb7459c6'
    
    // Fazer requisição para atualizar o template
    const response = await fetch('/api/templates/update-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateId: templateId,
        imagePaths: [imageUrl]
      })
    })
    
    if (response.ok) {
      console.log('✅ Template atualizado com sucesso!')
    } else {
      console.error('❌ Erro ao atualizar template')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

// Executar
fixTemplateImages()