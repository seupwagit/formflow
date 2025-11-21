# 🚀 GUIA RÁPIDO - VALIDAÇÕES CONDICIONAIS

## ✅ PROBLEMA RESOLVIDO

As validações condicionais agora são **SEMPRE** salvas no banco de dados automaticamente!

## 📋 COMO USAR

### 1. Criar Validações

1. Abra o **Designer** de formulários
2. Clique no botão **"Validações IF/ELSE"** (ícone de raio ⚡)
3. Clique em **"+ Nova Regra"**
4. Configure:
   - **Nome da regra**
   - **Condições** (IF)
   - **Ações quando verdadeiro** (THEN)
   - **Ações quando falso** (ELSE) - opcional
5. Clique em **"Fechar"**
6. ✅ **Validações salvas automaticamente!**

### 2. Editar Validações

1. Abra o template no Designer
2. Clique em **"Validações IF/ELSE"**
3. As validações existentes aparecem automaticamente
4. Edite conforme necessário
5. Clique em **"Fechar"**
6. ✅ **Mudanças salvas automaticamente!**

### 3. Salvar Template

Ao salvar o template (Ctrl+S ou botão Salvar):
- ✅ Campos são salvos
- ✅ Imagens são salvas
- ✅ **Validações são salvas automaticamente**

## 🔍 VERIFICAR SE SALVOU

### No Console do Navegador (F12)

Procure por mensagens:
```
✅ [VALIDATION-MANAGER] 3 validação(ões) salva(s) com sucesso
✅ 3 validação(ões) condicional(is) carregada(s)
```

### No Banco de Dados

Execute no Supabase SQL Editor:
```sql
SELECT 
  id, 
  name, 
  jsonb_pretty(template->'validationRules') as validations
FROM intelligent_templates 
WHERE name = 'Nome do Seu Template';
```

## 🎯 EXEMPLOS DE VALIDAÇÕES

### Exemplo 1: Validar Valor Mínimo
```
Nome: Temperatura Mínima
Condição: temperatura < 0
Ação (IF): Mostrar erro "Temperatura não pode ser menor que 0°C"
Ação (IF): Bloquear envio
```

### Exemplo 2: Campo Obrigatório Condicional
```
Nome: Observações Obrigatórias
Condição: tipo_inspecao = "completa"
Ação (IF): Tornar campo "observacoes" obrigatório
Ação (ELSE): Tornar campo "observacoes" opcional
```

### Exemplo 3: Comparar Dois Campos
```
Nome: Validar Datas
Condição: data_fim < data_inicio
Ação (IF): Mostrar erro "Data final não pode ser anterior à inicial"
Ação (IF): Bloquear envio
```

### Exemplo 4: Auto-preenchimento
```
Nome: Preencher Data Aprovação
Condição: status = "aprovado"
Ação (IF): Definir campo "data_aprovacao" = {{TODAY}}
```

## 🛠️ TIPOS DE CONDIÇÕES

- `equals` (=) - Igual a
- `not_equals` (≠) - Diferente de
- `greater_than` (>) - Maior que
- `less_than` (<) - Menor que
- `greater_or_equal` (≥) - Maior ou igual
- `less_or_equal` (≤) - Menor ou igual
- `contains` - Contém texto
- `not_contains` - Não contém texto
- `starts_with` - Começa com
- `ends_with` - Termina com
- `is_empty` - Está vazio
- `is_not_empty` - Não está vazio

## 🎬 TIPOS DE AÇÕES

### Mensagens
- `show_message` - Mostrar mensagem (info/warning/error/success)

### Controle de Envio
- `block_submit` - Bloquear envio do formulário

### Manipulação de Campos
- `set_field_value` - Definir valor automaticamente
- `clear_field` - Limpar campo
- `show_field` - Mostrar campo
- `hide_field` - Esconder campo
- `make_required` - Tornar obrigatório
- `make_optional` - Tornar opcional
- `disable_field` - Desabilitar campo
- `enable_field` - Habilitar campo

## ⚡ QUANDO AS VALIDAÇÕES SÃO EXECUTADAS

- `on_change` - Quando campo muda
- `on_blur` - Ao sair do campo
- `on_focus` - Ao entrar no campo
- `on_submit` - Ao tentar enviar
- `on_save` - Ao salvar rascunho
- `on_load` - Ao carregar formulário
- `continuous` - Continuamente (tempo real)

## 🔧 OPERADORES LÓGICOS

- `AND` - Todas as condições devem ser verdadeiras
- `OR` - Pelo menos uma condição deve ser verdadeira

## 📊 PRIORIDADE

Regras com maior prioridade executam primeiro.
- Prioridade 0 = Normal
- Prioridade 1 = Alta
- Prioridade 2 = Muito Alta

## ⚠️ DICAS IMPORTANTES

1. ✅ **Sempre teste suas validações** usando o botão "Testar Validações"
2. ✅ **Use nomes descritivos** para facilitar manutenção
3. ✅ **Combine múltiplas condições** com AND/OR
4. ✅ **Use ELSE** para ações alternativas
5. ✅ **Defina prioridades** quando houver dependências

## 🐛 SOLUÇÃO DE PROBLEMAS

### Validações não aparecem ao recarregar?
1. Verifique o console (F12) por erros
2. Confirme que clicou em "Fechar" após editar
3. Verifique se o template foi salvo (Ctrl+S)

### Validações não estão funcionando no formulário?
1. Verifique se a regra está **habilitada**
2. Confirme que o **tipo de execução** está correto
3. Teste no modo "Testar Validações"

### Erro ao salvar?
1. Verifique se o template tem um ID válido
2. Confirme que está conectado ao banco
3. Veja os logs no console para detalhes

## 📞 SUPORTE

Se encontrar problemas:
1. Abra o console do navegador (F12)
2. Procure por mensagens com `[VALIDATION-MANAGER]`
3. Copie os logs de erro
4. Reporte o problema com os logs

## 🎉 PRONTO!

Agora você pode criar validações condicionais complexas que são **sempre salvas** no banco de dados!

**Aproveite! 🚀**
