# ✅ CHECKLIST DE TESTE - USUÁRIO

## 🎯 O que foi implementado?

1. ✅ Eventos condicionais (on_blur, on_focus, etc.)
2. ✅ Validações na edição de formulários
3. ✅ Botão "Nova Coleta" na grid de relatórios

---

## 📋 TESTE 1: Eventos Condicionais (5 minutos)

### Preparação
- [ ] Abrir console do navegador (F12)
- [ ] Ir para `/designer`

### Criar Template de Teste
- [ ] Criar novo template ou abrir existente
- [ ] Adicionar 2 campos:
  - Campo: `campo_teste` (text)
  - Campo: `campo_numero` (number)

### Configurar Validação on_blur
- [ ] Clicar em "⚡ Validações IF/ELSE"
- [ ] Criar nova regra:
  - Nome: "Teste onBlur"
  - Evento: "👋 Ao sair do campo"
  - Condição: `campo_teste` = "teste"
  - Ação: Mostrar mensagem "Funcionou!"
- [ ] Salvar template

### Testar
- [ ] Abrir formulário de preenchimento
- [ ] Digite "teste" no campo_teste
- [ ] **Pressione Tab ou clique fora do campo**
- [ ] ✅ Verificar console: `📢 Validação (on_blur): Funcionou!`

### Resultado
- [ ] ✅ PASSOU - Mensagem apareceu no console
- [ ] ❌ FALHOU - Nenhuma mensagem apareceu

---

## 📋 TESTE 2: Edição de Formulário (3 minutos)

### Preparação
- [ ] Abrir console do navegador (F12)
- [ ] Ter pelo menos 1 resposta salva

### Editar Resposta
- [ ] Ir para `/reports`
- [ ] Selecionar um template
- [ ] Clicar em ✏️ (editar) em qualquer resposta

### Verificar Logs
- [ ] ✅ Console mostra: `🖼️ Carregando imagens do template`
- [ ] ✅ Console mostra: `📸 Total de imagens carregadas: X`
- [ ] ✅ Console mostra: `✅ Resposta carregada para edição`

### Verificar Botão Canvas
- [ ] ✅ Botão Canvas está habilitado (não cinza)
- [ ] ❌ Botão Canvas está desabilitado (cinza)
  - Se desabilitado: Template não tem imagens

### Resultado
- [ ] ✅ PASSOU - Logs aparecem e botão funciona
- [ ] ❌ FALHOU - Sem logs ou botão desabilitado

---

## 📋 TESTE 3: Botão Nova Coleta (2 minutos)

### Verificar Botão
- [ ] Ir para `/reports`
- [ ] Selecionar um template
- [ ] ✅ Botão azul "📄 Nova Coleta" aparece no header
- [ ] ✅ Botão está à esquerda de "Trocar Template"

### Testar Funcionalidade
- [ ] Clicar no botão "Nova Coleta"
- [ ] ✅ Abre página de preenchimento
- [ ] ✅ Formulário está em branco
- [ ] ✅ Título mostra nome do template

### Testar Fluxo Completo
- [ ] Preencher alguns campos
- [ ] Clicar em "Salvar Rascunho"
- [ ] ✅ Salva com sucesso
- [ ] Voltar para `/reports`
- [ ] ✅ Nova coleta aparece na grid

### Resultado
- [ ] ✅ PASSOU - Botão funciona e cria nova coleta
- [ ] ❌ FALHOU - Botão não aparece ou não funciona

---

## 📊 RESUMO DOS TESTES

### Teste 1: Eventos Condicionais
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU
- [ ] ⚠️ PARCIAL

**Observações:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

### Teste 2: Edição de Formulário
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU
- [ ] ⚠️ PARCIAL

**Observações:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

### Teste 3: Botão Nova Coleta
- [ ] ✅ PASSOU
- [ ] ❌ FALHOU
- [ ] ⚠️ PARCIAL

**Observações:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🐛 Se Algo Falhar

### Eventos não funcionam
1. Verificar se regra está "Ativa" (checkbox marcado)
2. Verificar se nome do campo está correto
3. Copiar logs do console e reportar

### Botão Canvas desabilitado
1. Verificar logs: `📸 Total de imagens carregadas: 0`
2. Template precisa de imagem de fundo
3. Abrir Designer → "Trocar Imagem de Fundo"

### Botão Nova Coleta não aparece
1. Recarregar página (Ctrl+F5)
2. Verificar se está em `/reports?template=ID`
3. Tirar screenshot e reportar

---

## 📸 Screenshots Úteis

### Onde tirar screenshots se houver problemas:

1. **Console com logs**
   - F12 → Aba Console
   - Mostrar todos os logs

2. **Botão Nova Coleta**
   - Header da página de relatórios
   - Mostrar botão azul

3. **Validações no Designer**
   - Tela de configuração de regras
   - Mostrar regra criada

---

## ✅ Resultado Final

### Todos os testes passaram?
- [ ] ✅ SIM - Tudo funcionando!
- [ ] ❌ NÃO - Alguns problemas encontrados

### Feedback Geral
```
O que está funcionando bem:
_________________________________________________
_________________________________________________

O que precisa de ajustes:
_________________________________________________
_________________________________________________

Sugestões de melhorias:
_________________________________________________
_________________________________________________
```

---

## 📞 Reportar Problemas

Se encontrar problemas, forneça:

1. **Qual teste falhou?**
   - [ ] Teste 1 (Eventos)
   - [ ] Teste 2 (Edição)
   - [ ] Teste 3 (Botão)

2. **Logs do console**
   ```
   Cole aqui os logs do console (F12)
   ```

3. **Screenshots**
   - Anexar imagens do problema

4. **Descrição**
   ```
   Descreva o que aconteceu e o que era esperado
   ```

---

## 🎉 Conclusão

Após completar todos os testes, você terá validado:
- ✅ 7 eventos de validação funcionando
- ✅ Validações na edição de formulários
- ✅ Botão rápido para criar novas coletas

**Tempo total estimado:** 10 minutos

**Boa sorte nos testes! 🚀**
