# 🎨 GUIA RÁPIDO - Ação Mudar Cor

## 🎯 O QUE FAZ

A ação **"Mudar Cor"** permite destacar campos visualmente baseado em condições, facilitando a identificação de:
- ❌ Erros e valores críticos
- ⚠️ Avisos e valores de atenção
- ✅ Valores corretos e aprovados
- ℹ️ Informações importantes

## 📋 COMO USAR

### 1. Criar Validação com Cor

1. Abra o **Designer**
2. Clique em **"Validações IF/ELSE"** ⚡
3. Clique em **"+ Nova Regra"**
4. Configure:
   - **Nome**: "Destacar Temperatura Crítica"
   - **Condição**: temperatura > 100
   - **Ação (IF)**: Mudar Cor
     - Campo: temperatura
     - Cor: `#EF4444` (vermelho)
   - **Ação (ELSE)**: Mudar Cor
     - Campo: temperatura
     - Cor: `#10B981` (verde)
5. Clique **"Fechar"**
6. ✅ **Salvo automaticamente!**

### 2. Testar no Formulário

1. Abra o formulário de coleta
2. Digite valor > 100 no campo temperatura
3. ✅ Campo fica **vermelho**
4. Digite valor ≤ 100
5. ✅ Campo fica **verde**

## 🎨 CORES RECOMENDADAS

### Por Tipo de Validação

```typescript
// ERROS E CRÍTICOS
'#EF4444'  // Vermelho - Erro grave
'#DC2626'  // Vermelho escuro - Crítico
'#F87171'  // Vermelho claro - Erro leve

// AVISOS
'#F59E0B'  // Laranja - Atenção
'#FBBF24'  // Amarelo - Aviso leve

// SUCESSO
'#10B981'  // Verde - Correto
'#34D399'  // Verde claro - Aprovado

// INFORMAÇÃO
'#3B82F6'  // Azul - Info
'#60A5FA'  // Azul claro - Dica

// NEUTRO
'#6B7280'  // Cinza - Desabilitado
'#FFFFFF'  // Branco - Normal
```

### Por Contexto

```typescript
// TEMPERATURA
temperatura < 0    → '#3B82F6' (azul - frio)
temperatura 0-50   → '#10B981' (verde - normal)
temperatura 50-80  → '#F59E0B' (laranja - quente)
temperatura > 80   → '#EF4444' (vermelho - crítico)

// STATUS
'pendente'   → '#F59E0B' (laranja)
'aprovado'   → '#10B981' (verde)
'rejeitado'  → '#EF4444' (vermelho)
'em_analise' → '#3B82F6' (azul)

// PRIORIDADE
'baixa'  → '#6B7280' (cinza)
'media'  → '#F59E0B' (laranja)
'alta'   → '#EF4444' (vermelho)
'urgente'→ '#DC2626' (vermelho escuro)
```

## 💡 EXEMPLOS PRÁTICOS

### Exemplo 1: Validação de Faixa
```typescript
{
  name: 'Temperatura por Faixa',
  conditions: [
    { fieldName: 'temperatura', operator: 'greater_than', value: 80 }
  ],
  actionsTrue: [
    { type: 'change_color', targetField: 'temperatura', color: '#EF4444' },
    { type: 'show_message', message: '🔥 Crítico!', messageType: 'error' }
  ],
  actionsFalse: [
    { type: 'change_color', targetField: 'temperatura', color: '#10B981' }
  ]
}
```

### Exemplo 2: Múltiplos Campos
```typescript
{
  name: 'Validação Completa',
  conditions: [
    { fieldName: 'status', operator: 'equals', value: 'erro' }
  ],
  actionsTrue: [
    { type: 'change_color', targetField: 'campo1', color: '#EF4444' },
    { type: 'change_color', targetField: 'campo2', color: '#EF4444' },
    { type: 'change_color', targetField: 'campo3', color: '#EF4444' },
    { type: 'show_message', message: 'Campos em vermelho precisam correção' }
  ]
}
```

### Exemplo 3: Comparação Entre Campos
```typescript
{
  name: 'Validar Datas',
  conditions: [
    { 
      fieldName: 'data_fim', 
      operator: 'less_than', 
      compareWithField: 'data_inicio' 
    }
  ],
  actionsTrue: [
    { type: 'change_color', targetField: 'data_fim', color: '#EF4444' },
    { type: 'show_message', message: 'Data final anterior à inicial' },
    { type: 'block_submit' }
  ],
  actionsFalse: [
    { type: 'change_color', targetField: 'data_fim', color: '#10B981' }
  ]
}
```

### Exemplo 4: Destaque Progressivo
```typescript
// Regra 1: Temperatura Normal
{
  name: 'Temp Normal',
  conditions: [
    { fieldName: 'temperatura', operator: 'less_or_equal', value: 50 }
  ],
  actionsTrue: [
    { type: 'change_color', targetField: 'temperatura', color: '#10B981' }
  ],
  priority: 0
}

// Regra 2: Temperatura Elevada
{
  name: 'Temp Elevada',
  conditions: [
    { fieldName: 'temperatura', operator: 'greater_than', value: 50 },
    { fieldName: 'temperatura', operator: 'less_or_equal', value: 80 }
  ],
  logicalOperator: 'AND',
  actionsTrue: [
    { type: 'change_color', targetField: 'temperatura', color: '#F59E0B' }
  ],
  priority: 1
}

// Regra 3: Temperatura Crítica
{
  name: 'Temp Crítica',
  conditions: [
    { fieldName: 'temperatura', operator: 'greater_than', value: 80 }
  ],
  actionsTrue: [
    { type: 'change_color', targetField: 'temperatura', color: '#EF4444' },
    { type: 'block_submit' }
  ],
  priority: 2
}
```

## 🎨 FORMATOS DE COR

### Hexadecimal (Recomendado)
```
#EF4444  ✅ Mais comum
#ef4444  ✅ Funciona
```

### RGB
```
rgb(239, 68, 68)  ✅ Funciona
```

### Nome
```
red    ✅ Funciona
green  ✅ Funciona
blue   ✅ Funciona
```

### Tailwind (Avançado)
```
bg-red-500    ⚠️ Requer configuração adicional
text-blue-600 ⚠️ Requer configuração adicional
```

## 🔧 COMBINAÇÕES ÚTEIS

### Erro + Bloqueio
```typescript
actionsTrue: [
  { type: 'change_color', targetField: 'campo', color: '#EF4444' },
  { type: 'show_message', message: 'Erro!', messageType: 'error' },
  { type: 'block_submit' }
]
```

### Aviso + Destaque
```typescript
actionsTrue: [
  { type: 'change_color', targetField: 'campo', color: '#F59E0B' },
  { type: 'show_message', message: 'Atenção!', messageType: 'warning' }
]
```

### Sucesso + Auto-preenchimento
```typescript
actionsTrue: [
  { type: 'change_color', targetField: 'status', color: '#10B981' },
  { type: 'set_field_value', targetField: 'data_aprovacao', value: '{{TODAY}}' },
  { type: 'show_message', message: 'Aprovado!', messageType: 'success' }
]
```

## 📊 BOAS PRÁTICAS

### ✅ FAÇA

- Use cores consistentes (vermelho = erro, verde = ok)
- Combine com mensagens explicativas
- Use ELSE para voltar à cor normal
- Teste com diferentes valores
- Use prioridades para regras múltiplas

### ❌ NÃO FAÇA

- Não use cores muito claras (difícil de ver)
- Não use muitas cores diferentes (confuso)
- Não esqueça de definir cor padrão no ELSE
- Não use apenas cor sem mensagem (acessibilidade)

## 🧪 TESTAR

### No Designer
1. Adicione validação com cor
2. Clique "Testar Validações"
3. Digite valores diferentes
4. Veja as cores mudarem em tempo real

### No Formulário
1. Abra formulário de coleta
2. Preencha campos
3. Veja cores mudarem automaticamente
4. Tente enviar com erro (deve bloquear)

## 🎉 RESULTADO

Com a ação "Mudar Cor" você pode:
- ✅ Destacar erros visualmente
- ✅ Guiar o usuário no preenchimento
- ✅ Indicar status de validação
- ✅ Melhorar experiência do usuário
- ✅ Reduzir erros de preenchimento

**Formulários mais intuitivos e fáceis de usar!** 🚀
