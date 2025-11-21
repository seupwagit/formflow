# 🔄 Campos Duplicados e Suporte a Tabelas

## 📋 MUDANÇA CRÍTICA: Campos com Mesmo Label São VÁLIDOS

### ❌ COMPORTAMENTO ANTERIOR (INCORRETO)
```
Campo 1: Label "Nome", Posição (100, 200) → MANTIDO
Campo 2: Label "Nome", Posição (100, 400) → ❌ REMOVIDO (considerado duplicado)
```

### ✅ COMPORTAMENTO NOVO (CORRETO)
```
Campo 1: Label "Nome", Posição (100, 200) → ✅ MANTIDO
Campo 2: Label "Nome", Posição (100, 400) → ✅ MANTIDO (posição diferente = campo diferente)
```

## 🎯 QUANDO UM CAMPO É DUPLICADO?

### Duplicado REAL (será removido):
- ✅ Mesmo label
- ✅ Mesma posição (x, y, página)
- ✅ Detectado múltiplas vezes pelo Gemini

### NÃO é duplicado (será mantido):
- ✅ Mesmo label
- ❌ Posições diferentes
- **Exemplo:** Tabela com coluna "Nome" em cada linha

## 🔍 CASOS DE USO COMUNS

### 1. Tabelas
```
┌─────────────┬─────────────┬─────────────┐
│ Nome        │ CPF         │ Data        │
├─────────────┼─────────────┼─────────────┤
│ [Campo 1]   │ [Campo 2]   │ [Campo 3]   │ ← Linha 1
│ [Campo 4]   │ [Campo 5]   │ [Campo 6]   │ ← Linha 2
│ [Campo 7]   │ [Campo 8]   │ [Campo 9]   │ ← Linha 3
└─────────────┴─────────────┴─────────────┘

Todos os campos têm labels iguais ("Nome", "CPF", "Data")
mas posições diferentes → TODOS SÃO VÁLIDOS
```

### 2. Formulários Repetidos
```
Dependente 1:
  Nome: [Campo 1] (100, 200)
  CPF:  [Campo 2] (100, 250)

Dependente 2:
  Nome: [Campo 3] (100, 400)  ← Mesmo label "Nome", posição diferente
  CPF:  [Campo 4] (100, 450)  ← Mesmo label "CPF", posição diferente

TODOS OS 4 CAMPOS SÃO VÁLIDOS
```

### 3. Seções Múltiplas
```
Seção A:
  Valor: [Campo 1] (100, 100)
  
Seção B:
  Valor: [Campo 2] (500, 100)  ← Mesmo label, posição diferente

AMBOS OS CAMPOS SÃO VÁLIDOS
```

## 🆕 NOVO RECURSO: Configuração de Tabelas

### Tipos de Campo Adicionados:
- `table` - Tabela com linhas e colunas
- `repeatable_group` - Grupo de campos que se repete

### Configuração de Tabela:
```typescript
{
  type: 'table',
  tableConfig: {
    rows: 5,
    columns: 3,
    columnHeaders: ['Nome', 'CPF', 'Data'],
    cellFields: [...],  // Campos dentro das células
    allowAddRows: true,
    allowRemoveRows: true,
    minRows: 1,
    maxRows: 50
  }
}
```

### Configuração de Grupo Repetível:
```typescript
{
  type: 'repeatable_group',
  repeatableConfig: {
    minInstances: 1,
    maxInstances: 10,
    fields: [...],  // Campos que se repetem
    addButtonLabel: 'Adicionar Dependente',
    removeButtonLabel: 'Remover'
  }
}
```

## 🔧 COMO USAR NO DESIGNER

### 1. Detectar Campos Normalmente
- Gemini detecta todos os campos
- Campos com mesmo label mas posições diferentes são mantidos

### 2. Agrupar em Tabela (Opcional)
1. Selecione os campos que formam a tabela
2. Clique em "Configurar Tabela"
3. Defina:
   - Número de linhas e colunas
   - Cabeçalhos das colunas
   - Se permite adicionar/remover linhas
4. Sistema agrupa os campos em uma estrutura de tabela

### 3. Preencher Formulário
- **Modo Lista:** Campos aparecem sequencialmente
- **Modo Canvas:** Campos aparecem nas posições exatas
- **Modo Tabela:** Campos agrupados em tabela interativa

## 📊 ESTRUTURA DE DADOS

### Salvamento no Banco:
```json
{
  "field_nome_linha1": "João Silva",
  "field_cpf_linha1": "123.456.789-00",
  "field_nome_linha2": "Maria Santos",
  "field_cpf_linha2": "987.654.321-00"
}
```

### Cada campo mantém:
- ✅ ID único (field.id)
- ✅ Name único ou repetido (field.name)
- ✅ Posição única (field.position)
- ✅ Label pode ser repetido

## 🎯 BENEFÍCIOS

1. **Flexibilidade Total**
   - Suporta qualquer layout de formulário
   - Tabelas, listas, seções repetidas

2. **Sem Perda de Dados**
   - Todos os campos são preservados
   - Nenhum campo é removido incorretamente

3. **Organização Opcional**
   - Pode agrupar campos em tabelas
   - Ou deixar como campos individuais

4. **Compatibilidade**
   - Sistema usa field.id internamente
   - field.name pode ser duplicado sem problemas

## ⚠️ IMPORTANTE

- **Campos com mesmo label e posições diferentes são VÁLIDOS**
- **Não serão removidos automaticamente**
- **Sistema usa field.id (único) para identificação**
- **field.name pode ser duplicado (normal em tabelas)**

## 🚀 PRÓXIMOS PASSOS

1. ✅ Detecção de campos preserva duplicados válidos
2. ✅ Sistema usa field.id para evitar conflitos
3. 🔄 Implementar UI para configurar tabelas (TableFieldConfigurator)
4. 🔄 Implementar renderização de tabelas no formulário
5. 🔄 Implementar grupos repetíveis dinâmicos
