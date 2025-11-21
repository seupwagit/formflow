# 🐛 DEBUG - EDIÇÃO DE FORMULÁRIO

## Problemas Reportados

1. ❌ Botão Canvas não funciona ao editar formulário
2. ❌ Condicional não funciona no modo de edição

## Correções Aplicadas

### 1. ✅ Validações on_load na Edição
**Problema:** Validações não eram executadas ao carregar resposta para edição
**Solução:** Adicionada execução de validações `on_load` na função `loadExistingResponse`

### 2. ✅ Logs de Debug para Imagens
**Problema:** Não havia visibilidade se as imagens estavam sendo carregadas
**Solução:** Adicionados logs detalhados no carregamento de imagens

## Como Testar

### Teste 1: Verificar Carregamento de Imagens

1. **Abrir Console do Navegador** (F12)
2. **Editar uma resposta existente**
3. **Verificar logs esperados:**

```javascript
// Logs esperados:
🖼️ Carregando imagens do template: ["caminho/imagem1.png", ...]
✅ Usando URL direta: https://...
✅ URL construída: https://...
📸 Total de imagens carregadas: 1
✅ Resposta carregada para edição: {
  responseId: "...",
  templateName: "...",
  totalFields: X,
  fieldsWithData: Y,
  imagesLoaded: 1  // 🆕 Novo campo
}
```

4. **Se aparecer:**
```javascript
⚠️ Template sem image_paths ou não é array: undefined
```
**Significa:** O template não tem imagens salvas

### Teste 2: Verificar Validações na Edição

1. **Criar regra de validação on_load:**
   - Evento: "📂 Ao carregar formulário"
   - Condição: Sempre (sem condições)
   - Ação: Mostrar mensagem "Formulário carregado!"

2. **Editar uma resposta**

3. **Verificar console:**
```javascript
📢 Validação (on_load - edição): Formulário carregado! (info)
```

### Teste 3: Verificar Botão Canvas

1. **Editar resposta**
2. **Verificar se botão Canvas está habilitado**
3. **Se estiver desabilitado:**
   - Verificar console: `imagesLoaded: 0`
   - Significa que o template não tem imagens

## Possíveis Causas do Problema

### Botão Canvas Desabilitado

**Causa 1: Template sem imagens**
```javascript
// Verificar no console:
⚠️ Template sem image_paths ou não é array
```
**Solução:** O template precisa ter imagens. Abrir o designer e adicionar imagem de fundo.

**Causa 2: Imagens não carregadas**
```javascript
// Verificar no console:
📸 Total de imagens carregadas: 0
```
**Solução:** Verificar se as imagens existem no Supabase Storage.

### Validações Não Funcionam

**Causa 1: Template sem regras**
```javascript
// Verificar no console:
// Não aparece nenhum log de validação
```
**Solução:** Abrir o designer e configurar regras de validação.

**Causa 2: Regras desabilitadas**
**Solução:** No designer, verificar se as regras estão com "Ativa" marcado.

**Causa 3: Nomes de campos incorretos**
**Solução:** Verificar se os nomes dos campos nas condições correspondem aos nomes reais.

## Checklist de Debug

### Para Botão Canvas:
- [ ] Console mostra "🖼️ Carregando imagens do template"?
- [ ] Console mostra "📸 Total de imagens carregadas: X" com X > 0?
- [ ] Botão Canvas está habilitado (não cinza)?
- [ ] Ao clicar em Canvas, a imagem aparece?

### Para Validações:
- [ ] Console mostra "✅ Regras de validação carregadas: X" com X > 0?
- [ ] Console mostra "📢 Validação (on_load - edição): ..."?
- [ ] Console mostra "📢 Validação (on_blur): ..." ao sair do campo?
- [ ] Console mostra "📢 Validação (on_focus): ..." ao entrar no campo?
- [ ] Console mostra "📢 Validação (on_change): ..." ao digitar?

## Comandos SQL para Verificar Dados

### Verificar se template tem imagens:
```sql
SELECT id, name, image_paths 
FROM form_templates 
WHERE id = 'SEU_TEMPLATE_ID';
```

### Verificar se template tem regras de validação:
```sql
SELECT id, name, "validationRules" 
FROM form_templates 
WHERE id = 'SEU_TEMPLATE_ID';
```

### Verificar resposta existente:
```sql
SELECT id, template_id, response_data, status 
FROM form_responses 
WHERE id = 'SEU_RESPONSE_ID';
```

## Solução Rápida

### Se botão Canvas não funciona:

1. **Abrir o template no Designer**
2. **Clicar em "Trocar Imagem de Fundo"**
3. **Fazer upload de uma imagem**
4. **Salvar template**
5. **Tentar editar resposta novamente**

### Se validações não funcionam:

1. **Abrir o template no Designer**
2. **Clicar em "⚡ Validações IF/ELSE"**
3. **Criar uma regra de teste:**
   - Nome: "Teste"
   - Evento: "🔄 Ao mudar valor"
   - Condição: campo_teste = "teste"
   - Ação: Mostrar mensagem "Funcionou!"
4. **Salvar template**
5. **Editar resposta e testar**

## Logs Completos Esperados

```javascript
// Ao abrir formulário para edição:
🖼️ Carregando imagens do template: ["path/to/image.png"]
✅ URL construída: https://supabase.co/storage/v1/...
📸 Total de imagens carregadas: 1
✅ Resposta carregada para edição: {
  responseId: "abc123",
  templateName: "Meu Template",
  totalFields: 5,
  fieldsWithData: 5,
  imagesLoaded: 1
}
✅ Regras de validação carregadas: 2
📢 Validação (on_load - edição): Formulário carregado! (info)

// Ao interagir com campos:
📢 Validação (on_focus): Digite seu nome (info)
📢 Validação (on_change): Valor válido! (success)
📢 Validação (on_blur): Campo preenchido corretamente (success)
```

## Status
🟡 AGUARDANDO TESTE DO USUÁRIO

Após testar, verificar os logs do console e reportar o que aparece.
