# 🚀 TESTE RÁPIDO - EDIÇÃO DE FORMULÁRIO

## O que foi corrigido?

1. ✅ **Validações on_load** agora funcionam ao editar resposta
2. ✅ **Logs de debug** adicionados para rastrear problemas
3. ✅ **Todos os eventos** (on_blur, on_focus, etc.) funcionam na edição

## Teste em 3 Passos

### 1️⃣ Abrir Console (F12)
Pressione F12 no navegador para abrir o console

### 2️⃣ Editar uma Resposta
Clique no botão de editar (✏️) em qualquer resposta

### 3️⃣ Verificar Logs

**O que você deve ver:**

```javascript
// ✅ BOM - Template com imagens:
🖼️ Carregando imagens do template: ["path/image.png"]
✅ URL construída: https://...
📸 Total de imagens carregadas: 1
✅ Resposta carregada para edição: { imagesLoaded: 1 }

// ❌ PROBLEMA - Template sem imagens:
⚠️ Template sem image_paths ou não é array: undefined
📸 Total de imagens carregadas: 0
```

## Problemas e Soluções

### ❌ Botão Canvas Desabilitado (Cinza)

**Causa:** Template não tem imagens
**Solução:**
1. Abrir template no Designer
2. Clicar "Trocar Imagem de Fundo"
3. Fazer upload de PDF/imagem
4. Salvar
5. Tentar editar novamente

### ❌ Validações Não Funcionam

**Causa:** Template não tem regras de validação
**Solução:**
1. Abrir template no Designer
2. Clicar "⚡ Validações IF/ELSE"
3. Criar regra de teste:
   - Evento: "📂 Ao carregar formulário"
   - Ação: Mostrar mensagem "Teste"
4. Salvar
5. Tentar editar novamente

**Verificar console:**
```javascript
✅ Regras de validação carregadas: 1
📢 Validação (on_load - edição): Teste (info)
```

## Teste Completo de Eventos

### Criar Regras de Teste:

1. **on_load** - Ao abrir formulário
   ```
   Evento: 📂 Ao carregar formulário
   Ação: Mostrar mensagem "Formulário carregado"
   ```

2. **on_focus** - Ao clicar no campo
   ```
   Evento: 👆 Ao entrar no campo
   Condição: campo_teste está vazio
   Ação: Mostrar mensagem "Digite algo"
   ```

3. **on_blur** - Ao sair do campo
   ```
   Evento: 👋 Ao sair do campo
   Condição: campo_teste = "teste"
   Ação: Mostrar mensagem "Você digitou teste!"
   ```

4. **on_change** - Ao digitar
   ```
   Evento: 🔄 Ao mudar valor
   Condição: campo_numero > 100
   Ação: Mostrar mensagem "Valor alto!"
   ```

### Testar:
1. Editar resposta
2. Verificar console para cada evento
3. Todos devem mostrar logs

## Checklist Rápido

- [ ] Console aberto (F12)
- [ ] Editou uma resposta
- [ ] Viu logs de carregamento
- [ ] Botão Canvas habilitado (se template tem imagem)
- [ ] Validações executadas (se template tem regras)

## Reportar Problema

Se ainda não funcionar, copie e cole os logs do console:

```
Exemplo:
⚠️ Template sem image_paths ou não é array: undefined
📸 Total de imagens carregadas: 0
```

E informe:
- Nome do template
- ID da resposta sendo editada
- O que não está funcionando
