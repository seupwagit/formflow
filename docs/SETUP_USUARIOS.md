# Configuração do Sistema de Usuários

## Passo 1: Executar Migration no Supabase

Acesse o **SQL Editor** no painel do Supabase e execute o arquivo:
```
sql/user-profiles-migration.sql
```

Ou copie e cole o conteúdo diretamente no SQL Editor.

## Passo 2: Criar Primeiro Usuário Admin

### Opção A: Criar via Interface do Supabase

1. Acesse **Authentication > Users** no painel do Supabase
2. Clique em **Add User**
3. Preencha:
   - Email: seu-email@exemplo.com
   - Password: sua-senha-segura
   - Auto Confirm User: ✅ (marque esta opção)
4. Clique em **Create User**
5. Copie o **User ID** (UUID) que aparece na lista

### Opção B: Criar via SQL

Execute no SQL Editor:
```sql
-- Substitua os valores abaixo
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@exemplo.com',
  crypt('sua-senha-aqui', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

## Passo 3: Tornar o Usuário Admin

Execute no SQL Editor (substitua o email pelo seu):

```sql
-- Atualizar perfil para admin
UPDATE user_profiles 
SET role = 'admin', 
    full_name = 'Administrador do Sistema'
WHERE email = 'seu-email@exemplo.com';

-- Verificar se funcionou
SELECT id, email, role, is_active 
FROM user_profiles 
WHERE email = 'seu-email@exemplo.com';
```

## Passo 4: Fazer Login

1. Acesse a aplicação
2. Faça login com o email e senha criados
3. Acesse `/users` para gerenciar usuários

## Estrutura de Permissões

### Roles Disponíveis:

- **admin**: Acesso total ao sistema
  - Gerenciar usuários
  - Criar/editar/excluir templates
  - Ver todos os dados
  - Configurar sistema

- **user**: Usuário padrão
  - Criar e editar seus próprios templates
  - Preencher formulários
  - Ver seus próprios dados

- **viewer**: Apenas visualização
  - Ver templates
  - Ver dados (sem editar)

## Funcionalidades da Página de Usuários

✅ Listar todos os usuários do sistema
✅ Criar novos usuários com email e senha
✅ Editar nome e função dos usuários
✅ Ativar/desativar usuários
✅ Buscar usuários por email ou nome
✅ Proteção: apenas admins podem acessar
✅ Não é possível excluir a si mesmo

## Verificação de Acesso

A página `/users` verifica automaticamente:
1. Se o usuário está autenticado
2. Se o usuário tem role = 'admin'
3. Redireciona para home se não tiver permissão

## Troubleshooting

### Erro: "Acesso negado"
- Verifique se executou a migration
- Confirme que seu usuário tem role = 'admin'
- Execute: `SELECT * FROM user_profiles WHERE email = 'seu-email';`

### Erro: "Tabela não existe"
- Execute a migration: `sql/user-profiles-migration.sql`

### Não consigo criar usuários
- Verifique se você é admin
- Confirme que o Supabase Auth está habilitado
- Verifique as políticas RLS

### Usuários não aparecem
- Verifique se as políticas RLS estão ativas
- Execute: `SELECT * FROM user_profiles;` como admin

## Segurança

🔒 **Row Level Security (RLS)** está habilitado
🔒 Apenas admins podem ver todos os usuários
🔒 Usuários comuns só veem seu próprio perfil
🔒 Senhas são criptografadas pelo Supabase Auth
🔒 Trigger automático cria perfil ao criar usuário

## Próximos Passos

Após configurar o sistema de usuários, você pode:
1. Criar usuários para sua equipe
2. Definir permissões apropriadas
3. Implementar login/logout na aplicação
4. Adicionar controle de acesso em outras páginas
