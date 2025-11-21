# ✅ Correção Definitiva de IDs Duplicados

## 🔴 PROBLEMA IDENTIFICADO

**Sintoma:** Ao corrigir IDs duplicados, eles voltavam a aparecer ao reabrir o template.

**Causa Raiz:**
1. IDs eram gerados com `timestamp` que mudava toda vez
2. Função `fixDuplicateFields` REMOVIA campos ao invés de corrigir IDs
3. Names não tinham sufixos numéricos simples

## ✅ SOLUÇÕES IMPLEMENTADAS

### 1. IDs Consistentes (SEM Timestamp)

**ANTES (ERRADO):**
```typescript
// ID mudava toda vez por causa do timestamp
`razao_social_0_100_200_123456_1`
`razao_social_0_100_200_789012_1` // ← Diferente!
```

**AGORA (CORRETO):**
```typescript
// ID baseado apenas em label + posição
`razao_social_p0_x100_y200`
`razao_social_p0_x100_y200_1` // Se duplicado
```

**Benefício:** ID permanece o mesmo sempre que o campo está na mesma posição.

### 2. Names com Sufixos Numéricos Simples

**ANTES (ERRADO):**
```typescript
razao_social
razao_social_p0_x100_y350  // ← Complexo demais
razao_social_p0_x100_y400
```

**AGORA (CORRETO):**
```typescript
razao_social
razao_social_01  // ← Simples e lógico
razao_social_02
razao_social_03
```

**Benefício:** Names simples, fáceis de entender e usar.

### 3. Correção ao Invés de Remoção

**ANTES (ERRADO):**
```typescript
// Removia campos com IDs duplicados
30 campos → 15 campos (50% perdidos!)
```

**AGORA (CORRETO):**
```typescript
// Corrige IDs duplicados, mantém TODOS os campos
30 campos → 30 campos (0% perdidos!)
```

**Benefício:** Nenhum campo é perdido, apenas IDs são corrigidos.

## 📋 COMO FUNCIONA AGORA

### Geração de IDs

```typescript
function generateUniqueFieldId(label, existingFields, position) {
  // 1. Sanitizar label
  const baseName = sanitizeFieldName(label) // "razao_social"
  
  // 2. Criar ID base: nome_pagina_x_y
  const baseId = `${baseName}_p${position.page}_x${position.x}_y${position.y}`
  // Resultado: "razao_social_p0_x100_y200"
  
  // 3. Se não existe, usar ID base
  if (!exists(baseId)) return baseId
  
  // 4. Se existe, adicionar contador
  return `${baseId}_1` // "razao_social_p0_x100_y200_1"
}
```

### Geração de Names

```typescript
function generateUniqueFieldName(label, existingFields) {
  const baseName = sanitizeFieldName(label) // "razao_social"
  
  // Contar quantos já existem
  const count = existingFields.filter(f => 
    f.name === baseName || f.name.match(/^razao_social_\d+$/)
  ).length
  
  // Se é o primeiro
  if (count === 0) return baseName // "razao_social"
  
  // Se já existem, adicionar sufixo numérico
  return `${baseName}_01` // "razao_social_01"
  return `${baseName}_02` // "razao_social_02"
  return `${baseName}_03` // "razao_social_03"
}
```

### Correção de Duplicados

```typescript
function fixDuplicateFields(fields) {
  // 1. Detectar IDs duplicados
  const duplicates = findDuplicateIds(fields)
  
  // 2. Para cada ID duplicado
  duplicates.forEach(duplicateId => {
    // Manter o primeiro
    // Corrigir os outros gerando novos IDs
    fields[1].id = generateUniqueFieldId(...)
    fields[2].id = generateUniqueFieldId(...)
  })
  
  // 3. Retornar TODOS os campos (nenhum removido)
  return fields
}
```

## 🎯 TIPO DE CAMPO ARRAY/GRID

### Implementado: Tipo `table`

```typescript
{
  type: 'table',
  tableConfig: {
    rows: 5,                    // Número de linhas
    columns: 3,                 // Número de colunas
    columnHeaders: ['Nome', 'CPF', 'Data'],
    rowHeaders: ['Linha 1', 'Linha 2'],  // Opcional
    cellFields: [...],          // Campos dentro das células
    allowAddRows: true,         // Permitir adicionar linhas
    allowRemoveRows: true,      // Permitir remover linhas
    minRows: 1,                 // Mínimo de linhas
    maxRows: 50                 // Máximo de linhas
  }
}
```

### Como Usar

1. **Detectar campos normalmente** - Gemini detecta todos os campos
2. **Agrupar em tabela** - Use `TableFieldConfigurator` para agrupar
3. **Configurar** - Defina linhas, colunas, cabeçalhos
4. **Salvar** - Sistema cria estrutura de tabela

### Exemplo Prático

```
Formulário com tabela de dependentes:

┌─────────────┬─────────────┬─────────────┐
│ Nome        │ CPF         │ Data Nasc   │
├─────────────┼─────────────┼─────────────┤
│ [Campo 1]   │ [Campo 2]   │ [Campo 3]   │
│ [Campo 4]   │ [Campo 5]   │ [Campo 6]   │
│ [Campo 7]   │ [Campo 8]   │ [Campo 9]   │
└─────────────┴─────────────┴─────────────┘

Campos detectados:
- nome_01, cpf_01, data_nasc_01  (Linha 1)
- nome_02, cpf_02, data_nasc_02  (Linha 2)
- nome_03, cpf_03, data_nasc_03  (Linha 3)

Todos mantidos com names simples e lógicos!
```

## ✅ GARANTIAS

1. **IDs Consistentes** - Não mudam ao reabrir
2. **Names Simples** - Sufixos _01, _02, _03
3. **Nenhum Campo Perdido** - Correção ao invés de remoção
4. **Suporte a Tabelas** - Tipo `table` implementado
5. **Campos com Mesmo Label** - Permitidos em posições diferentes

## 🧪 TESTE

1. Crie template com campos de labels iguais
2. Clique em "Corrigir" quando aparecer aviso
3. Salve o template
4. Feche e reabra
5. ✅ Nenhum aviso deve aparecer
6. ✅ Todos os campos devem estar presentes

**Problema resolvido definitivamente! 🎉**
