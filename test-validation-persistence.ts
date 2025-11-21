/**
 * 🧪 TESTE DE PERSISTÊNCIA DE VALIDAÇÕES CONDICIONAIS
 * 
 * Execute este arquivo para testar se as validações estão sendo
 * salvas e carregadas corretamente do banco de dados.
 */

import { validationManager } from './lib/validation-conditional-manager'
import { ValidationRule } from './lib/types/validation-rules'

async function testValidationPersistence() {
  console.log('🧪 Iniciando teste de persistência de validações...\n')

  // ID de template de teste (substitua por um ID real)
  const testTemplateId = 'seu-template-id-aqui'

  // Criar validações de teste
  const testRules: ValidationRule[] = [
    {
      id: 'test_rule_1',
      name: 'Teste de Temperatura',
      description: 'Validar temperatura mínima',
      enabled: true,
      conditions: [
        {
          id: 'cond_1',
          fieldName: 'temperatura',
          operator: 'less_than',
          value: 0
        }
      ],
      logicalOperator: 'AND',
      actionsTrue: [
        {
          id: 'action_1',
          type: 'show_message',
          message: 'Temperatura não pode ser menor que 0°C',
          messageType: 'error'
        },
        {
          id: 'action_2',
          type: 'block_submit'
        }
      ],
      executionType: 'on_change',
      priority: 0
    },
    {
      id: 'test_rule_2',
      name: 'Campo Obrigatório Condicional',
      description: 'Tornar observações obrigatório se tipo for completa',
      enabled: true,
      conditions: [
        {
          id: 'cond_2',
          fieldName: 'tipo_inspecao',
          operator: 'equals',
          value: 'completa'
        }
      ],
      logicalOperator: 'AND',
      actionsTrue: [
        {
          id: 'action_3',
          type: 'make_required',
          targetField: 'observacoes'
        }
      ],
      actionsFalse: [
        {
          id: 'action_4',
          type: 'make_optional',
          targetField: 'observacoes'
        }
      ],
      executionType: 'on_change',
      priority: 1
    }
  ]

  try {
    // TESTE 1: Salvar validações
    console.log('📝 TESTE 1: Salvando validações...')
    const saved = await validationManager.saveValidations(testTemplateId, testRules)
    
    if (saved) {
      console.log('✅ Validações salvas com sucesso\n')
    } else {
      console.error('❌ Falha ao salvar validações\n')
      return
    }

    // TESTE 2: Carregar validações
    console.log('📂 TESTE 2: Carregando validações...')
    const loaded = await validationManager.loadValidations(testTemplateId)
    
    if (loaded.length === testRules.length) {
      console.log(`✅ ${loaded.length} validações carregadas corretamente\n`)
    } else {
      console.error(`❌ Esperado ${testRules.length} validações, mas carregou ${loaded.length}\n`)
      return
    }

    // TESTE 3: Verificar integridade
    console.log('🔍 TESTE 3: Verificando integridade...')
    const validation = validationManager.validateRules(loaded)
    
    if (validation.valid) {
      console.log('✅ Validações íntegras\n')
    } else {
      console.error('❌ Validações com erros:', validation.errors, '\n')
      return
    }

    // TESTE 4: Contar validações
    console.log('🔢 TESTE 4: Contando validações...')
    const count = await validationManager.countValidations(testTemplateId)
    
    if (count === testRules.length) {
      console.log(`✅ Contagem correta: ${count} validações\n`)
    } else {
      console.error(`❌ Contagem incorreta: esperado ${testRules.length}, obtido ${count}\n`)
      return
    }

    // TESTE 5: Verificar existência
    console.log('✔️ TESTE 5: Verificando existência...')
    const hasValidations = await validationManager.hasValidations(testTemplateId)
    
    if (hasValidations) {
      console.log('✅ Template tem validações\n')
    } else {
      console.error('❌ Template deveria ter validações\n')
      return
    }

    // TESTE 6: Deletar validações
    console.log('🗑️ TESTE 6: Deletando validações...')
    const deleted = await validationManager.deleteValidations(testTemplateId)
    
    if (deleted) {
      console.log('✅ Validações deletadas com sucesso\n')
    } else {
      console.error('❌ Falha ao deletar validações\n')
      return
    }

    // TESTE 7: Verificar que foram deletadas
    console.log('🔍 TESTE 7: Verificando deleção...')
    const afterDelete = await validationManager.loadValidations(testTemplateId)
    
    if (afterDelete.length === 0) {
      console.log('✅ Validações deletadas corretamente\n')
    } else {
      console.error(`❌ Ainda existem ${afterDelete.length} validações após deleção\n`)
      return
    }

    console.log('🎉 TODOS OS TESTES PASSARAM! 🎉')
    console.log('✅ Sistema de persistência de validações funcionando perfeitamente!')

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error)
  }
}

// Executar teste
testValidationPersistence()
