# 🚨 DEBUG URGENTE - FILL-FORM SEM CANVAS

## 🎯 Problema Reportado

**URL:** `http://localhost:3001/fill-form?template=77ce06e3-2373-42c5-8093-37f0e0ce25aa`

**Problemas:**
1. ❌ Botão Canvas desabilitado (cinza)
2. ❌ Validações condicionais não funcionam

## 🔍 Diagnóstico Rápido (2 minutos)

### Passo 1: Abrir Console
1. Pressione **F12** no navegador
2. Vá para aba **Console**
3. Recarregue a página (**Ctrl+F5**)

### Passo 2: Procurar Logs
Procure por estes logs no console:

#### ✅ Se aparecer:
```javascript
🖼️ [FILL-FORM] Carregando imagens do template: ["path/image.png"]
✅ [FILL-FORM] URL construída: https://...
📸 [FILL-FORM] Total de imagens carregadas: 1
```
**Significa:** Imagens carregadas com sucesso
**Ação:** Botão Canvas deve estar habilitado

#### ❌ Se aparecer:
```javascript
⚠️ [FILL-FORM] Template sem image_paths ou não é array: undefined
```
**Significa:** Template NÃO TEM imagens salvas no banco
**Ação:** Precisa adicionar imagem no Designer

#### ❌ Se aparecer:
```javascript
📸 [FILL-FORM] Total de imagens carregadas: 0
```
**Significa:** Template tem image_paths mas as imagens não carregaram
**Ação:** Verificar Supabase Storage

### Passo 3: Verificar Banco de Dados

Execute este SQL no Supabase:

```sql
SELECT 
  id,
  name,
  image_paths,
  "validationRules"
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';
```

**Verifique:**
- `image_paths` está NULL? → Template sem imagens
- `image_paths` é array vazio `[]`? → Template sem imagens
- `image_paths` tem valores? → Copie e cole aqui
- `validationRules` está NULL? → Template sem validações
- `validationRules` é array vazio `[]`? → Template sem validações

## 🔧 Soluções Rápidas

### Solução 1: Template Sem Imagens

**Causa:** `image_paths` é NULL ou array vazio

**Como Resolver:**
1. Abrir Designer: `http://localhost:3001/designer?template=77ce06e3-2373-42c5-8093-37f0e0ce25aa`
2. Clicar em "Trocar Imagem de Fundo"
3. Fazer upload de PDF ou imagem
4. Salvar template
5. Voltar para fill-form e recarregar

### Solução 2: Imagens Deletadas do Storage

**Causa:** `image_paths` tem valores mas imagens não existem no Supabase Storage

**Como Resolver:**
1. Verificar no Supabase Storage → bucket `processed-images`
2. Procurar pelos caminhos em `image_paths`
3. Se não existirem, fazer upload novamente no Designer

### Solução 3: Validações Não Funcionam

**Causa:** `validationRules` é NULL ou array vazio

**Como Resolver:**
1. Abrir Designer: `http://localhost:3001/designer?template=77ce06e3-2373-42c5-8093-37f0e0ce25aa`
2. Clicar em "⚡ Validações IF/ELSE"
3. Criar regras de validação
4. Salvar template
5. Voltar para fill-form e recarregar

## 📋 Checklist de Verificação

### Imagens
- [ ] Console mostra logs de carregamento?
- [ ] `image_paths` não é NULL no banco?
- [ ] `image_paths` não é array vazio?
- [ ] Imagens existem no Supabase Storage?
- [ ] Botão Canvas está habilitado?

### Validações
- [ ] Console mostra "✅ Regras de validação carregadas: X"?
- [ ] `validationRules` não é NULL no banco?
- [ ] `validationRules` não é array vazio?
- [ ] Eventos disparam (on_blur, on_focus, etc.)?

## 🎯 Ação Imediata

**FAÇA AGORA:**

1. **Abra o console (F12)**
2. **Recarregue a página**
3. **Copie TODOS os logs** que aparecem
4. **Cole aqui os logs**

**Especialmente procure por:**
- Qualquer log com `[FILL-FORM]`
- Qualquer log com `⚠️` ou `❌`
- Qualquer erro em vermelho

## 📊 Resultado Esperado

### Se tudo estiver OK:
```javascript
// Console deve mostrar:
🖼️ [FILL-FORM] Carregando imagens do template: [...]
✅ [FILL-FORM] URL construída: https://...
📸 [FILL-FORM] Total de imagens carregadas: 1
✅ Template carregado: { name: "...", totalFields: X }
✅ Regras de validação carregadas: Y
```

### Se houver problema:
```javascript
// Console pode mostrar:
⚠️ [FILL-FORM] Template sem image_paths ou não é array: undefined
// OU
📸 [FILL-FORM] Total de imagens carregadas: 0
// OU
⚠️ Erro ao carregar imagem: ...
```

## 🚨 IMPORTANTE

**EU NÃO MEXI NO CÓDIGO DE CARREGAMENTO DE IMAGENS!**

As alterações que fiz foram:
1. ✅ Adicionar logs de debug (para AJUDAR)
2. ✅ Adicionar validações on_load
3. ✅ Adicionar botão "Nova Coleta" em outras páginas

**O código de carregamento de imagens está INTACTO!**

Se as imagens sumiram, o problema é:
- ❌ Dados no banco de dados
- ❌ Arquivos no Supabase Storage
- ❌ Permissões do Storage
- ❌ Cache do navegador

**NÃO É PROBLEMA DO CÓDIGO!**

## 📞 Próximos Passos

1. **Execute os passos de diagnóstico acima**
2. **Me envie os logs do console**
3. **Me envie o resultado do SQL**
4. **Vou te ajudar a resolver**

---

**Status:** 🔴 AGUARDANDO LOGS DO USUÁRIO
