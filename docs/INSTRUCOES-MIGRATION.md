# 🚨 INSTRUÇÕES PARA EXECUTAR MIGRATION NO SUPABASE

## ⚠️ IMPORTANTE

O MCP do Supabase não está funcionando corretamente. Você precisa executar o SQL manualmente.

## 📋 PASSO A PASSO

### 1. Abrir o Supabase

1. Acesse: https://supabase.com
2. Faça login
3. Selecione seu projeto
4. Vá em **SQL Editor** (menu lateral esquerdo)

### 2. Executar o Script

1. Abra o arquivo: `migrations/EXECUTAR_NO_SUPABASE.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou F5)

### 3. Verificar Resultados

Você deve ver uma mensagem assim:

```
========================================
MIGRATION COMPLETA - RESULTADOS
========================================
✅ Tabela template_validation_rules: OK
   - Registros: 0

✅ Tabela template_background_versions: OK
   - Registros: X
   - Templates com versões: X/X

✅ Funções RPC criadas:
   - save_template_validations()
   - load_template_validations()

========================================
MIGRATION CONCLUÍDA COM SUCESSO!
========================================
```

### 4. Verificar Tabelas Criadas

No Supabase, vá em **Table Editor** e verifique se aparecem:

- ✅ `template_validation_rules`
- ✅ `template_background_versions`

## 🔍 O QUE FOI CRIADO

### 1. Tabela: template_validation_rules

Armazena as regras de validação condicional dos templates.

**Colunas:**
- `id` - UUID (chave primária)
- `template_id` - UUID (FK para form_templates)
- `rule_data` - JSONB (dados da regra)
- `rule_order` - INTEGER (ordem de execução)
- `is_enabled` - BOOLEAN (se está ativa)
- `created_at`, `updated_at` - TIMESTAMPTZ

### 2. Tabela: template_background_versions

Armazena versões das imagens de fundo dos templates.

**Colunas:**
- `id` - UUID (chave primária)
- `template_id` - UUID (FK para form_templates)
- `version_number` - INTEGER (número da versão)
- `image_paths` - TEXT[] (array de caminhos das imagens)
- `pdf_path` - TEXT (caminho do PDF original)
- `is_current` - BOOLEAN (se é a versão atual)
- `created_at` - TIMESTAMPTZ
- `created_by` - UUID (FK para auth.users)

### 3. Funções RPC

- `save_template_validations(template_id, rules)` - Salva validações
- `load_template_validations(template_id)` - Carrega validações

### 4. Coluna Adicionada

- `form_responses.background_version_id` - Referência à versão da imagem usada

## 🧪 TESTAR

Após executar, teste no SQL Editor:

```sql
-- Ver tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('template_validation_rules', 'template_background_versions');

-- Ver funções criadas
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%validation%';

-- Ver dados migrados
SELECT COUNT(*) as total FROM template_background_versions;
```

## ❌ SE DER ERRO

### Erro: "relation already exists"

Significa que a tabela já existe. Tudo bem, o script usa `IF NOT EXISTS`.

### Erro: "permission denied"

Você precisa ter permissões de admin no projeto Supabase.

### Erro: "foreign key constraint"

Verifique se a tabela `form_templates` existe e tem dados.

## ✅ APÓS EXECUTAR

1. Recarregue a página do Supabase
2. Verifique se as tabelas aparecem
3. Teste criar uma validação no sistema
4. Verifique se foi salva no banco

## 📞 PROBLEMAS?

Se continuar com problemas:

1. Tire um print da mensagem de erro
2. Verifique se você é admin do projeto
3. Tente executar o script em partes (uma seção por vez)

---

**Criado em:** 14/11/2024
**Arquivo SQL:** `migrations/EXECUTAR_NO_SUPABASE.sql`
