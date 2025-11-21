# 📝 VERSIONAMENTO GIT - O QUE VAI E O QUE NÃO VAI

**Criado em:** 14/11/2024  
**Arquivo:** `.gitignore`

---

## ✅ O QUE VAI PARA O GIT (VERSIONADO)

### Código Fonte:
- ✅ `app/` - Todas as páginas e componentes
- ✅ `lib/` - Serviços e utilitários
- ✅ `components/` - Componentes React
- ✅ `public/` - Arquivos públicos
- ✅ `styles/` - CSS e estilos

### Configuração:
- ✅ `package.json` - Dependências
- ✅ `tsconfig.json` - Config TypeScript
- ✅ `next.config.js` - Config Next.js
- ✅ `tailwind.config.ts` - Config Tailwind

### Migrations:
- ✅ `migrations/*.sql` - Scripts SQL de migração
- ✅ `sql/*.sql` - Scripts SQL iniciais

### Documentação:
- ✅ `docs/*.md` - Toda a documentação
- ✅ `README.md` - Documentação principal

### Estrutura de Pastas:
- ✅ `supabase/backup/.gitkeep` - Mantém pasta no Git
- ✅ `backups/.gitkeep` - Mantém pasta no Git

---

## ❌ O QUE NÃO VAI PARA O GIT (IGNORADO)

### 🔒 Dados Sensíveis:

#### Backups do Supabase:
```
❌ supabase/backup/*
```
**Motivo:** Contém dados reais do banco (empresas, contratos, respostas)

#### Backups de Código:
```
❌ backups/backup_*/
```
**Motivo:** Podem ser grandes e são temporários

#### Arquivos de Backup:
```
❌ *.backup
❌ *.bak
❌ *.dump
❌ *.sql.gz
```

### 🔧 Arquivos de Build:

```
❌ .next/
❌ out/
❌ build/
❌ dist/
❌ node_modules/
```
**Motivo:** Gerados automaticamente, não precisam ser versionados

### 🔐 Variáveis de Ambiente:

```
❌ .env
❌ .env*.local
```
**Motivo:** Contém chaves secretas (Supabase URL, API Keys)

### 🗑️ Arquivos Temporários:

```
❌ test-*.js
❌ test-*.sql
❌ VERIFICAR-*.sql
❌ check-*.js
❌ *.log
```
**Motivo:** Arquivos de teste e debug temporários

---

## 🎯 POR QUE ISSO É IMPORTANTE?

### Segurança:
- ❌ **Não versionar dados sensíveis** (CNPJ, emails, contratos)
- ❌ **Não versionar chaves secretas** (API keys, tokens)
- ❌ **Não versionar backups** (podem conter dados de produção)

### Performance:
- ❌ **Não versionar node_modules** (muito grande, reinstalável)
- ❌ **Não versionar .next** (gerado automaticamente)
- ❌ **Não versionar backups** (podem ser muito grandes)

### Limpeza:
- ❌ **Não versionar arquivos temporários** (test-*, check-*)
- ❌ **Não versionar logs** (*.log)
- ❌ **Não versionar cache** (.cache/)

---

## 📋 CHECKLIST ANTES DE COMMIT

Antes de fazer `git commit`, verifique:

- [ ] Nenhum arquivo `.env` está sendo commitado
- [ ] Nenhum backup de dados está sendo commitado
- [ ] Nenhum arquivo temporário (test-*, check-*) está sendo commitado
- [ ] Apenas código fonte e documentação estão sendo commitados

### Comando para verificar:
```bash
git status
```

Se aparecer algo como:
- ❌ `supabase/backup/2024-11-14/` - **NÃO COMMITAR!**
- ❌ `.env.local` - **NÃO COMMITAR!**
- ❌ `backups/backup_20241114/` - **NÃO COMMITAR!**

---

## 🔄 COMO FUNCIONA O BACKUP

### Backups Locais (Não Versionados):
```
supabase/backup/2024-11-14T15-30-00/  ← Ignorado pelo Git
├── form_templates.json               ← Dados reais
├── form_responses.json               ← Dados reais
└── ...
```

### Código de Backup (Versionado):
```
lib/services/backup-service.ts        ← Versionado
app/api/backup/route.ts               ← Versionado
app/admin/backup/page.tsx             ← Versionado
```

**Resumo:** O **código** que faz backup vai para o Git, mas os **dados** do backup não vão.

---

## 🚀 BOAS PRÁTICAS

### 1. Sempre Verificar .gitignore
Antes de adicionar novos tipos de arquivo, verifique se devem ser ignorados.

### 2. Backups em Local Seguro
Backups de produção devem ser armazenados em:
- ✅ Cloud privado (S3, Google Drive)
- ✅ Servidor de backup
- ❌ Nunca no Git público

### 3. Documentação Sempre Versionada
- ✅ Todos os `.md` em `docs/` vão para o Git
- ✅ Migrations SQL vão para o Git
- ✅ Scripts de setup vão para o Git

### 4. Separar Dados de Código
- ✅ Código: Versionado
- ❌ Dados: Não versionado
- ✅ Estrutura: Versionada (migrations)
- ❌ Conteúdo: Não versionado (backups)

---

## 📊 RESUMO VISUAL

```
GIT (Versionado)                    LOCAL (Não Versionado)
├── app/                            ├── supabase/backup/
├── lib/                            │   └── 2024-11-14/
├── components/                     │       ├── *.json (dados)
├── docs/                           │       └── *.sql (dados)
├── migrations/                     ├── backups/
├── .gitignore                      │   └── backup_20241114/
└── README.md                       ├── .env.local
                                    ├── .next/
                                    └── node_modules/
```

---

## ✅ STATUS ATUAL

- ✅ `.gitignore` criado
- ✅ Backups protegidos (não vão para Git)
- ✅ Código versionado (vai para Git)
- ✅ Documentação versionada (vai para Git)
- ✅ Dados sensíveis protegidos (não vão para Git)

**Tudo configurado corretamente! 🎉**

---

**Criado em:** 14/11/2024  
**Última atualização:** 14/11/2024  
**Status:** ✅ CONFIGURADO
