'use client'

import { useState } from 'react'
import { 
  Plus, Trash2, Copy, HelpCircle, AlertCircle, CheckCircle, Info,
  ChevronDown, ChevronUp, Zap, X
} from 'lucide-react'
import {
  ValidationRule, ValidationCondition, ValidationAction,
  ComparisonOperator, ActionType, VALIDATION_RULE_EXAMPLES
} from '@/lib/types/validation-rules'

interface ValidationRuleBuilderProps {
  fields: { name: string; label: string; type: string }[]
  rules: ValidationRule[]
  onChange: (rules: ValidationRule[]) => void
}

export default function ValidationRuleBuilder({
  fields, rules, onChange
}: ValidationRuleBuilderProps) {
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const operatorLabels: Record<ComparisonOperator, string> = {
    equals: '= Igual a', not_equals: '≠ Diferente de',
    greater_than: '> Maior que', less_than: '< Menor que',
    greater_or_equal: '≥ Maior ou igual', less_or_equal: '≤ Menor ou igual',
    contains: 'Contém', not_contains: 'Não contém',
    starts_with: 'Começa com', ends_with: 'Termina com',
    is_empty: 'Está vazio', is_not_empty: 'Não está vazio'
  }

  const actionLabels: Record<ActionType, string> = {
    show_message: '💬 Mostrar mensagem', block_submit: '🚫 Bloquear envio',
    set_field_value: '✏️ Definir valor', clear_field: '🗑️ Limpar campo',
    show_field: '👁️ Mostrar campo', hide_field: '🙈 Esconder campo',
    make_required: '⚠️ Tornar obrigatório', make_optional: '✓ Tornar opcional',
    disable_field: '🔒 Desabilitar campo', enable_field: '🔓 Habilitar campo',
    change_color: '🎨 Mudar cor'
  }

  const executionTypes = [
    { value: 'on_change', label: '🔄 Ao mudar valor' },
    { value: 'on_blur', label: '👋 Ao sair do campo' },
    { value: 'on_focus', label: '👆 Ao entrar no campo' },
    { value: 'on_submit', label: '📤 Ao enviar formulário' },
    { value: 'on_save', label: '💾 Ao salvar rascunho' },
    { value: 'on_load', label: '📂 Ao carregar formulário' },
    { value: 'continuous', label: '⚡ Tempo real (contínuo)' }
  ]

  const addNewRule = () => {
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}`,
      name: 'Nova Regra',
      enabled: true,
      conditions: [],
      logicalOperator: 'AND',
      actionsTrue: [],
      executionType: 'on_change',
      priority: 0
    }
    onChange([...rules, newRule])
    setExpandedRule(newRule.id)
  }

  const duplicateRule = (rule: ValidationRule) => {
    onChange([...rules, { ...rule, id: `rule_${Date.now()}`, name: `${rule.name} (cópia)` }])
  }

  const deleteRule = (ruleId: string) => onChange(rules.filter(r => r.id !== ruleId))

  const updateRule = (ruleId: string, updates: Partial<ValidationRule>) => {
    onChange(rules.map(r => r.id === ruleId ? { ...r, ...updates } : r))
  }

  const addCondition = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    
    const newCondition: ValidationCondition = {
      id: `cond_${Date.now()}`,
      fieldName: fields[0]?.name || '',
      operator: 'equals',
      value: ''
    }
    updateRule(ruleId, { conditions: [...rule.conditions, newCondition] })
  }

  const updateCondition = (ruleId: string, condId: string, updates: Partial<ValidationCondition>) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    
    updateRule(ruleId, {
      conditions: rule.conditions.map(c => c.id === condId ? { ...c, ...updates } : c)
    })
  }

  const deleteCondition = (ruleId: string, condId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    updateRule(ruleId, { conditions: rule.conditions.filter(c => c.id !== condId) })
  }

  const addAction = (ruleId: string, isTrue: boolean) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    
    const newAction: ValidationAction = {
      id: `action_${Date.now()}`,
      type: 'show_message',
      message: 'Mensagem de validação'
    }
    
    if (isTrue) {
      updateRule(ruleId, { actionsTrue: [...rule.actionsTrue, newAction] })
    } else {
      updateRule(ruleId, { actionsFalse: [...(rule.actionsFalse || []), newAction] })
    }
  }

  const updateAction = (ruleId: string, actionId: string, updates: Partial<ValidationAction>, isTrue: boolean) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    
    if (isTrue) {
      updateRule(ruleId, {
        actionsTrue: rule.actionsTrue.map(a => a.id === actionId ? { ...a, ...updates } : a)
      })
    } else {
      updateRule(ruleId, {
        actionsFalse: (rule.actionsFalse || []).map(a => a.id === actionId ? { ...a, ...updates } : a)
      })
    }
  }

  const deleteAction = (ruleId: string, actionId: string, isTrue: boolean) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return
    
    if (isTrue) {
      updateRule(ruleId, { actionsTrue: rule.actionsTrue.filter(a => a.id !== actionId) })
    } else {
      updateRule(ruleId, { actionsFalse: (rule.actionsFalse || []).filter(a => a.id !== actionId) })
    }
  }

  const loadExample = (example: Partial<ValidationRule>) => {
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}`,
      name: example.name || 'Regra de Exemplo',
      description: example.description,
      enabled: true,
      conditions: example.conditions || [],
      logicalOperator: example.logicalOperator || 'AND',
      actionsTrue: example.actionsTrue || [],
      actionsFalse: example.actionsFalse,
      executionType: example.executionType || 'on_change',
      priority: 0
    }
    onChange([...rules, newRule])
    setShowExamples(false)
    setExpandedRule(newRule.id)
  }

  return (
    <div className="space-y-4">
      {/* Header com Ajuda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Regras de Validação</h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            📚 Exemplos
          </button>
          <button onClick={addNewRule} className="btn-primary text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Regra
          </button>
        </div>
      </div>

      {/* Ajuda Rápida */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Como Funciona</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Condições (IF):</strong> Quando o campo atende a condição</p>
            <p>• <strong>Ações THEN:</strong> O que fazer se condição for verdadeira</p>
            <p>• <strong>Ações ELSE:</strong> O que fazer se condição for falsa (opcional)</p>
            <p>• <strong>Evento:</strong> Quando executar a regra (ao mudar, ao sair, etc.)</p>
          </div>
        </div>
      )}

      {/* Exemplos */}
      {showExamples && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-3">Exemplos Prontos</h4>
          <div className="space-y-2">
            {VALIDATION_RULE_EXAMPLES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 border border-purple-200"
              >
                <div className="font-medium text-purple-900">{example.name}</div>
                <div className="text-sm text-purple-700 mt-1">{example.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Regras */}
      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
          <Zap className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhuma regra configurada</p>
          <p className="text-sm mt-2">Clique em "Nova Regra" ou escolha um exemplo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="border-2 rounded-lg bg-white">
              {/* Header da Regra */}
              <div className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedRule === rule.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                    className="font-medium text-gray-900 border px-2 py-1 rounded flex-1"
                    placeholder="Nome da regra"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Ativa</span>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => duplicateRule(rule)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Duplicar">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {expandedRule === rule.id && (
                <div className="p-4 space-y-6 border-t">
                  {/* Configurações Básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quando Executar</label>
                      <select
                        value={rule.executionType}
                        onChange={(e) => updateRule(rule.id, { executionType: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {executionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operador Lógico</label>
                      <select
                        value={rule.logicalOperator}
                        onChange={(e) => updateRule(rule.id, { logicalOperator: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="AND">AND (todas as condições)</option>
                        <option value="OR">OR (pelo menos uma)</option>
                      </select>
                    </div>
                  </div>

                  {/* Condições (IF) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">IF - Condições ({rule.conditions.length})</h4>
                      <button
                        onClick={() => addCondition(rule.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Adicionar Condição
                      </button>
                    </div>
                    {rule.conditions.length === 0 ? (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                        Nenhuma condição. Clique em "Adicionar Condição"
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rule.conditions.map((cond, idx) => (
                          <div key={cond.id} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                            {idx > 0 && (
                              <span className="text-xs font-bold text-blue-700 px-2 py-1 bg-blue-200 rounded">
                                {rule.logicalOperator}
                              </span>
                            )}
                            <select
                              value={cond.fieldName}
                              onChange={(e) => updateCondition(rule.id, cond.id, { fieldName: e.target.value })}
                              className="flex-1 px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Selecione campo...</option>
                              {fields.map(f => (
                                <option key={f.name} value={f.name}>{f.label}</option>
                              ))}
                            </select>
                            <select
                              value={cond.operator}
                              onChange={(e) => updateCondition(rule.id, cond.id, { operator: e.target.value as ComparisonOperator })}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              {Object.entries(operatorLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                            {!['is_empty', 'is_not_empty'].includes(cond.operator) && (
                              <input
                                type="text"
                                value={cond.value || ''}
                                onChange={(e) => updateCondition(rule.id, cond.id, { value: e.target.value })}
                                placeholder="Valor..."
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              />
                            )}
                            <button
                              onClick={() => deleteCondition(rule.id, cond.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações THEN */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-900">THEN - Ações se Verdadeiro ({rule.actionsTrue.length})</h4>
                      <button
                        onClick={() => addAction(rule.id, true)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Adicionar Ação
                      </button>
                    </div>
                    {rule.actionsTrue.length === 0 ? (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                        Nenhuma ação. Clique em "Adicionar Ação"
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rule.actionsTrue.map(action => (
                          <div key={action.id} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                            <select
                              value={action.type}
                              onChange={(e) => updateAction(rule.id, action.id, { type: e.target.value as ActionType }, true)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              {Object.entries(actionLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                            {action.type === 'show_message' && (
                              <>
                                <input
                                  type="text"
                                  value={action.message || ''}
                                  onChange={(e) => updateAction(rule.id, action.id, { message: e.target.value }, true)}
                                  placeholder="Mensagem..."
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                />
                                <select
                                  value={action.messageType || 'info'}
                                  onChange={(e) => updateAction(rule.id, action.id, { messageType: e.target.value as any }, true)}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="info">Info</option>
                                  <option value="warning">Aviso</option>
                                  <option value="error">Erro</option>
                                  <option value="success">Sucesso</option>
                                </select>
                              </>
                            )}
                            {['set_field_value', 'clear_field', 'show_field', 'hide_field', 'make_required', 'make_optional', 'disable_field', 'enable_field', 'change_color'].includes(action.type) && (
                              <select
                                value={action.targetField || ''}
                                onChange={(e) => updateAction(rule.id, action.id, { targetField: e.target.value }, true)}
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              >
                                <option value="">Campo alvo...</option>
                                {fields.map(f => (
                                  <option key={f.name} value={f.name}>{f.label}</option>
                                ))}
                              </select>
                            )}
                            {action.type === 'set_field_value' && (
                              <input
                                type="text"
                                value={action.value || ''}
                                onChange={(e) => updateAction(rule.id, action.id, { value: e.target.value }, true)}
                                placeholder="Valor..."
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              />
                            )}
                            {action.type === 'change_color' && (
                              <input
                                type="color"
                                value={action.color || '#FFFFFF'}
                                onChange={(e) => updateAction(rule.id, action.id, { color: e.target.value }, true)}
                                className="px-2 py-1 border rounded"
                                title="Escolha a cor"
                              />
                            )}
                            <button
                              onClick={() => deleteAction(rule.id, action.id, true)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações ELSE (Opcional) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-orange-900">ELSE - Ações se Falso (opcional) ({rule.actionsFalse?.length || 0})</h4>
                      <button
                        onClick={() => addAction(rule.id, false)}
                        className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Adicionar Ação
                      </button>
                    </div>
                    {(!rule.actionsFalse || rule.actionsFalse.length === 0) ? (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                        Nenhuma ação ELSE (opcional)
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rule.actionsFalse.map(action => (
                          <div key={action.id} className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                            <select
                              value={action.type}
                              onChange={(e) => updateAction(rule.id, action.id, { type: e.target.value as ActionType }, false)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              {Object.entries(actionLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                            {action.type === 'show_message' && (
                              <>
                                <input
                                  type="text"
                                  value={action.message || ''}
                                  onChange={(e) => updateAction(rule.id, action.id, { message: e.target.value }, false)}
                                  placeholder="Mensagem..."
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                />
                                <select
                                  value={action.messageType || 'info'}
                                  onChange={(e) => updateAction(rule.id, action.id, { messageType: e.target.value as any }, false)}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="info">Info</option>
                                  <option value="warning">Aviso</option>
                                  <option value="error">Erro</option>
                                  <option value="success">Sucesso</option>
                                </select>
                              </>
                            )}
                            {['set_field_value', 'clear_field', 'show_field', 'hide_field', 'make_required', 'make_optional', 'disable_field', 'enable_field', 'change_color'].includes(action.type) && (
                              <select
                                value={action.targetField || ''}
                                onChange={(e) => updateAction(rule.id, action.id, { targetField: e.target.value }, false)}
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              >
                                <option value="">Campo alvo...</option>
                                {fields.map(f => (
                                  <option key={f.name} value={f.name}>{f.label}</option>
                                ))}
                              </select>
                            )}
                            {action.type === 'set_field_value' && (
                              <input
                                type="text"
                                value={action.value || ''}
                                onChange={(e) => updateAction(rule.id, action.id, { value: e.target.value }, false)}
                                placeholder="Valor..."
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              />
                            )}
                            {action.type === 'change_color' && (
                              <input
                                type="color"
                                value={action.color || '#FFFFFF'}
                                onChange={(e) => updateAction(rule.id, action.id, { color: e.target.value }, false)}
                                className="px-2 py-1 border rounded"
                                title="Escolha a cor"
                              />
                            )}
                            <button
                              onClick={() => deleteAction(rule.id, action.id, false)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
