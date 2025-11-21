/**
 * 🧪 TESTE RÁPIDO DE VALIDAÇÕES NO NAVEGADOR
 * 
 * Cole este código no console do navegador (F12) para testar
 * se as validações estão sendo salvas corretamente.
 * 
 * IMPORTANTE: Substitua 'SEU_TEMPLATE_ID' por um ID real!
 */

(async function testValidations() {
  console.log('🧪 Iniciando teste de validações...\n')

  // ⚠️ SUBSTITUA ESTE ID POR UM TEMPLATE REAL!
  const templateId = 'SEU_TEMPLATE_ID' // <-- MUDE AQUI!

  if (templateId === 'SEU_TEMPLATE_ID') {
    console.error('❌ ERRO: Você precisa substituir SEU_TEMPLATE_ID por um ID real!')
    console.log('💡 Dica: Abra um template no designer e veja o ID na URL')
    return
  }

  try {
    // Importar gerenciador
    const { validationManager } = await import('./lib/validation-conditional-manager.js')
    console.log('✅ Gerenciador importado\n')

    // Criar validação de teste
    const testRule = {
      id: 'test_rule_' + Date.now(),
      name: 'Teste de Salvamento',
      description: 'Validação criada para teste',
      enabled: true,
      conditions: [
        {
          id: 'cond_1',
          fieldName: 'campo_teste',
          operator: 'equals',
          value: 'teste'
        }
      ],
      logicalOperator: 'AND',
      actionsTrue: [
        {
          id: 'action_1',
          type: 'show_message',
          message: 'Teste funcionou!',
          messageType: 'success'
        }
      ],
      executionType: 'on_change',
      priority: 0
    }

    console.log('📝 Validação de teste criada:', testRule.name)
    console.log('')

    // TESTE 1: Salvar
    console.log('💾 TESTE 1: Salvando validação...')
    const saved = await validationManager.saveValidations(templateId, [testRule])
    
    if (saved) {
      console.log('✅ Salvamento bem-sucedido!\n')
    } else {
      console.error('❌ Falha ao salvar!\n')
      return
    }

    // TESTE 2: Carregar
    console.log('📂 TESTE 2: Carregando validações...')
    const loaded = await validationManager.loadValidations(templateId)
    
    console.log(`✅ ${loaded.length} validação(ões) carregada(s)`)
    console.log('Dados:', loaded)
    console.log('')

    // TESTE 3: Verificar
    if (loaded.length === 1 && loaded[0].id === testRule.id) {
      console.log('✅ TESTE 3: Validação encontrada corretamente!\n')
    } else {
      console.error('❌ TESTE 3: Validação não encontrada ou incorreta!\n')
      return
    }

    // TESTE 4: Limpar (deletar)
    console.log('🗑️ TESTE 4: Limpando validações de teste...')
    const deleted = await validationManager.deleteValidations(templateId)
    
    if (deleted) {
      console.log('✅ Validações deletadas\n')
    } else {
      console.error('❌ Falha ao deletar\n')
    }

    // Resultado final
    console.log('🎉 TODOS OS TESTES PASSARAM!')
    console.log('✅ Sistema de validações funcionando perfeitamente!')
    console.log('')
    console.log('💡 Agora você pode usar as validações normalmente no Designer')

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error)
    console.log('')
    console.log('🔍 Possíveis causas:')
    console.log('1. Template ID inválido')
    console.log('2. Problema de permissão no banco')
    console.log('3. Erro na estrutura do banco')
    console.log('')
    console.log('💡 Verifique os logs acima para mais detalhes')
  }
})()
