# 🧪 GUIA RÁPIDO - TESTE DE EVENTOS CONDICIONAIS

## Como Testar Agora

### 1️⃣ Abrir o Designer
```
http://localhost:3000/designer
```

### 2️⃣ Criar Template de Teste
1. Criar novo template ou abrir existente
2. Adicionar 3 campos simples:
   - Campo A (text) - nome: `campo_a`
   - Campo B (text) - nome: `campo_b`
   - Campo C (number) - nome: `campo_c`

### 3️⃣ Configurar Validações
Clicar no botão "⚡ Validações IF/ELSE"

#### Teste on_blur (Ao sair do campo)
```
Nome: Teste onBlur
Quando Executar: 👋 Ao sair do campo
Condição: campo_a = "teste"
Ação THEN: 💬 Mostrar mensagem "Você digitou 'teste'!"
```

#### Teste on_focus (Ao entrar no campo)
```
Nome: Teste onFocus
Quando Executar: 👆 Ao entrar no campo
Condição: campo_b está vazio
Ação THEN: 💬 Mostrar mensagem "Preencha este campo"
```

#### Teste on_change (Ao mudar valor)
```
Nome: Teste onChange
Quando Executar: 🔄 Ao mudar valor
Condição: campo_c > 100
Ação THEN: 💬 Mostrar mensagem "Valor alto!"
```

### 4️⃣ Salvar Template

### 5️⃣ Abrir Formulário de Preenchimento
```
http://localhost:3000/fill-form?template=<ID_DO_TEMPLATE>
```

### 6️⃣ Testar Cada Evento

#### ✅ Teste on_blur
1. Digite "teste" no Campo A
2. **Clique fora do campo** (Tab ou clique em outro lugar)
3. ✅ Deve aparecer mensagem no console: `📢 Validação (on_blur): Você digitou 'teste'!`

#### ✅ Teste on_focus
1. **Clique dentro do Campo B** (sem digitar nada)
2. ✅ Deve aparecer mensagem no console: `📢 Validação (on_focus): Preencha este campo`

#### ✅ Teste on_change
1. Digite "150" no Campo C
2. ✅ Deve aparecer mensagem no console: `📢 Validação (on_change): Valor alto!`

### 7️⃣ Verificar Console do Navegador
Abrir DevTools (F12) e ver aba Console para confirmar os logs.

## 🐛 Se Não Funcionar

### Verificar:
1. ✅ Template tem regras de validação salvas?
2. ✅ Regras estão com "Ativa" marcado?
3. ✅ Nome dos campos nas condições está correto?
4. ✅ Console do navegador mostra erros?

### Logs Esperados:
```
✅ Regras de validação carregadas: 3
📢 Validação (on_blur): Você digitou 'teste'! (info)
📢 Validação (on_focus): Preencha este campo (info)
📢 Validação (on_change): Valor alto! (info)
```

## 🎯 Teste Completo de Todos os Eventos

### Criar Regra para Cada Evento:

1. **on_change** - Ao digitar
2. **on_blur** - Ao sair do campo (Tab ou clique fora)
3. **on_focus** - Ao entrar no campo (clique dentro)
4. **on_submit** - Ao clicar em "Enviar Formulário"
5. **on_save** - Ao clicar em "Salvar Rascunho"
6. **on_load** - Ao abrir o formulário (automático)

### Exemplo Completo:
```javascript
// on_load - Define valor inicial
Campo: campo_a
Ação: Definir valor = "Iniciado"

// on_focus - Mostra ajuda
Campo: campo_b
Condição: está vazio
Ação: Mostrar mensagem "Digite seu nome"

// on_change - Valida em tempo real
Campo: campo_c
Condição: > 100
Ação: Mostrar mensagem "Valor muito alto"

// on_blur - Valida ao sair
Campo: campo_a
Condição: está vazio
Ação: Mostrar mensagem "Campo obrigatório"

// on_save - Antes de salvar rascunho
Condição: campo_a está vazio
Ação: Bloquear envio

// on_submit - Antes de enviar
Condição: campo_b está vazio
Ação: Bloquear envio
```

## ✅ Checklist de Validação

- [ ] on_change funciona ao digitar
- [ ] on_blur funciona ao sair do campo
- [ ] on_focus funciona ao entrar no campo
- [ ] on_submit funciona ao enviar
- [ ] on_save funciona ao salvar rascunho
- [ ] on_load funciona ao abrir formulário
- [ ] Logs aparecem no console
- [ ] Mensagens são exibidas corretamente
- [ ] Bloqueio de envio funciona

## 🎉 Sucesso!
Se todos os eventos funcionarem, o problema está resolvido!
