# 📦 SISTEMA DE BACKUP COMPLETO

**Criado em:** 14/11/2024  
**Status:** ✅ PRONTO PARA USO  
**Rota:** `/admin/backup`

---

## 🎯 FUNCIONALIDADE

Sistema completo de backup do banco de dados Supabase com um clique.

### O que é feito backup:

1. ✅ **Todas as Tabelas e Dados**
   - form_templates
   - form_responses
   - companies
   - contracts
   - template_validation_rules
   - template_background_versions
   - file_uploads
   - pdf_processing_log

2. ✅ **Functions/RPC**
   - save_template_validations()
   - load_template_validations()

3. ✅ **Triggers**
   - update_template_validation_rules_updated_at

4. ✅ **Scripts de Restore**
   - RESTORE.sql (restaurar tudo)
   - README.md (instruções)

---

## 📁 ARQUIVOS CRIADOS (NOVOS)

### Backend:
1. **`lib/services/backup-service.ts`** - Serviço de backup
2. **`app/api/backup/route.ts`** - API endpoint

### Frontend:
3. **`app/admin/backup/page.tsx`** - Página de administração

### Documentação:
4. **`docs/SISTEMA_BACKUP.md`** - Este arquivo

**⚠️ NENHUM ARQUIVO EXISTENTE FOI ALTERADO!**

---

## 🚀 COMO USAR

### 1. Acessar a Página

Navegue para: **`/admin/backup`**

### 2. Clicar no Botão

Clique em **"Iniciar Backup"**

### 3. Aguardar

O sistema irá:
- Conectar no Supabase
- Exportar todas as tabelas
- Gerar arquivos JSON e SQL
- Salvar em `supabase/backup/[timestamp]/`

### 4. Verificar Resultado

Você verá:
- ✅ Número de tabelas
- ✅ Total de registros
- ✅ Arquivos gerados
- ✅ Erros (se houver)

---

## 📂 ESTRUTURA DO BACKUP

```
supabase/backup/2024-11-14T15-30-00/
├── README.md                           # Instruções
├── RESTORE.sql                         # Script de restore completo
├── functions.sql                       # Functions/RPC
├── triggers.sql                        # Triggers
├── form_templates.json                 # Dados em JSON
├── form_templates.sql                  # Dados em SQL
├── form_responses.json
├── form_responses.sql
├── companies.json
├── companies.sql
├── contracts.json
├── contracts.sql
├── template_validation_rules.json
├── template_validation_rules.sql
├── template_background_versions.json
├── template_background_versions.sql
├── file_uploads.json
├── file_uploads.sql
├── pdf_processing_log.json
└── pdf_processing_log.sql
```

---

## 🔄 COMO RESTAURAR

### Opção 1: Restaurar Tudo (PostgreSQL)

```bash
cd supabase/backup/2024-11-14T15-30-00/
psql -h [host] -U [user] -d [database] -f RESTORE.sql
```

### Opção 2: Restaurar Tabela Específica

```bash
psql -h [host] -U [user] -d [database] -f form_templates.sql
```

### Opção 3: Usar JSON (via código)

```typescript
import data from './supabase/backup/2024-11-14T15-30-00/form_templates.json'

// Restaurar todos os registros
await supabase.from('form_templates').insert(data)

// Ou restaurar um por um
for (const row of data) {
  await supabase.from('form_templates').upsert(row)
}
```

### Opção 4: Supabase Dashboard

1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Copiar conteúdo de `RESTORE.sql`
4. Executar

---

## ⚙️ CONFIGURAÇÃO

### Adicionar ao Menu Principal

Edite o arquivo de navegação e adicione:

```typescript
{
  name: 'Backup',
  href: '/admin/backup',
  icon: Database,
  description: 'Backup completo do sistema'
}
```

### Proteger com Autenticação (Opcional)

Adicione verificação de admin em `app/admin/backup/page.tsx`:

```typescript
// No início do componente
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }
  checkAuth()
}, [])
```

---

## 🔒 SEGURANÇA

### Boas Práticas:

1. ✅ **Proteger a rota** `/admin/backup` com autenticação
2. ✅ **Limitar acesso** apenas para administradores
3. ✅ **Fazer backup regularmente** (diário, semanal)
4. ✅ **Armazenar backups** em local seguro
5. ✅ **Testar restore** periodicamente

### Adicionar ao .gitignore:

```
# Backups
supabase/backup/*
!supabase/backup/.gitkeep
```

---

## 📊 FORMATO DOS ARQUIVOS

### JSON (form_templates.json)
```json
[
  {
    "id": "uuid-here",
    "name": "Template Name",
    "fields": [...],
    "created_at": "2024-11-14T15:30:00Z"
  }
]
```

### SQL (form_templates.sql)
```sql
-- ============================================
-- BACKUP DE DADOS: form_templates
-- Data: 2024-11-14T15:30:00Z
-- Total de registros: 1
-- ============================================

INSERT INTO form_templates (id, name, fields, created_at) 
VALUES ('uuid-here', 'Template Name', '[]'::jsonb, '2024-11-14T15:30:00Z');
```

---

## 🔧 MANUTENÇÃO

### Backup Automático (Opcional)

Criar um cron job ou scheduled task:

```bash
# Linux/Mac (crontab)
0 2 * * * curl -X POST http://localhost:3000/api/backup

# Windows (Task Scheduler)
# Criar tarefa que executa:
curl -X POST http://localhost:3000/api/backup
```

### Limpeza de Backups Antigos

```bash
# Manter apenas últimos 7 dias
find supabase/backup -type d -mtime +7 -exec rm -rf {} +
```

---

## ❓ FAQ

### P: O backup inclui arquivos do Storage?
R: Não, apenas dados do banco. Para backup de arquivos, use o Supabase Storage API.

### P: Quanto tempo demora?
R: Depende do volume de dados. Geralmente 10-30 segundos.

### P: Posso fazer backup durante o uso?
R: Sim, o backup não bloqueia o sistema.

### P: O backup é incremental?
R: Não, é sempre completo. Cada backup é independente.

### P: Posso agendar backups automáticos?
R: Sim, use cron job ou Task Scheduler (ver seção Manutenção).

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot write file"
**Solução:** Verificar permissões da pasta `supabase/backup/`

### Erro: "Supabase connection failed"
**Solução:** Verificar variáveis de ambiente (NEXT_PUBLIC_SUPABASE_URL, etc.)

### Erro: "Table not found"
**Solução:** Verificar se a tabela existe no banco

### Backup muito lento
**Solução:** Fazer backup de tabelas específicas ao invés de todas

---

## 📝 CHANGELOG

### v1.0.0 (14/11/2024)
- ✅ Backup completo de todas as tabelas
- ✅ Export em JSON e SQL
- ✅ Backup de Functions e Triggers
- ✅ Script de restore automático
- ✅ Interface web com um clique
- ✅ README gerado automaticamente

---

## 🎯 PRÓXIMAS MELHORIAS

- [ ] Backup incremental
- [ ] Compressão de arquivos (.zip)
- [ ] Upload automático para cloud (S3, Google Drive)
- [ ] Agendamento de backups
- [ ] Notificação por email
- [ ] Restore via interface web
- [ ] Backup de Storage (arquivos)
- [ ] Histórico de backups

---

**Criado em:** 14/11/2024  
**Última atualização:** 14/11/2024  
**Status:** ✅ PRONTO PARA USO
