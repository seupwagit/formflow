# 📦 BACKUP DE ARQUIVOS DO STORAGE

## 🎯 O que é?

Sistema **SEPARADO** para fazer backup dos arquivos físicos do Supabase Storage (PDFs, imagens, uploads).

## 🔄 Como usar?

### 1. Acesse a página de backup:
```
http://localhost:3000/admin/backup
```

### 2. Clique no botão:
```
"Backup Storage" (botão verde)
```

### 3. Aguarde o download:
- O sistema baixa TODOS os arquivos de TODOS os buckets
- Salva em: `supabase/backup/storage/[timestamp]/`

## 📁 Estrutura do Backup

```
supabase/backup/storage/2025-11-14T17-14-14/
├── bucket-name-1/
│   ├── arquivo1.pdf
│   ├── arquivo2.jpg
│   └── ...
├── bucket-name-2/
│   ├── arquivo3.png
│   └── ...
└── README.md
```

## ⚠️ IMPORTANTE

### Por que separado do backup de banco?

1. **Evita gastos desnecessários** - Arquivos podem ser grandes
2. **Backup sob demanda** - Só baixa quando você precisa
3. **Flexibilidade** - Pode fazer backup do banco sem baixar arquivos

### O que NÃO está incluído:

- ❌ Dados das tabelas (use o backup de banco)
- ❌ Functions, triggers (use o backup de banco)
- ❌ Estrutura do banco (use o backup de banco)

### O que ESTÁ incluído:

- ✅ Todos os arquivos de todos os buckets
- ✅ PDFs, imagens, documentos
- ✅ Estrutura de pastas preservada

## 🔄 Como Restaurar

### Opção 1: Via Supabase Dashboard
1. Acesse o Storage no dashboard
2. Selecione o bucket
3. Faça upload dos arquivos

### Opção 2: Via API
```typescript
import { readFile } from 'fs/promises'

const file = await readFile('supabase/backup/storage/[timestamp]/bucket-name/file.pdf')

await supabase.storage
  .from('bucket-name')
  .upload('file.pdf', file)
```

### Opção 3: Script de Restore (criar se necessário)
```typescript
// Restaurar todos os arquivos de um bucket
const files = await fs.readdir('supabase/backup/storage/[timestamp]/bucket-name')

for (const file of files) {
  const fileData = await fs.readFile(`supabase/backup/storage/[timestamp]/bucket-name/${file}`)
  await supabase.storage.from('bucket-name').upload(file, fileData)
}
```

## 🔒 Segurança

### Arquivos protegidos no Git:
```gitignore
supabase/backup/storage/*
!supabase/backup/storage/.gitkeep
```

### Nunca vão para o repositório:
- ❌ PDFs de contratos
- ❌ Imagens de templates
- ❌ Uploads de usuários
- ❌ Qualquer arquivo do Storage

## 📊 Informações do Backup

O backup mostra:
- Total de arquivos baixados
- Tamanho total (em MB/GB)
- Arquivos por bucket
- Erros (se houver)

## 💡 Dicas

1. **Faça backup regular** - Especialmente antes de mudanças grandes
2. **Verifique o espaço em disco** - Arquivos podem ser grandes
3. **Mantenha backups antigos** - Pelo menos 3 versões
4. **Teste o restore** - Garanta que consegue restaurar

## 🚀 Próximos Passos

Se precisar de backup automático:
1. Criar script de agendamento
2. Configurar cron job
3. Enviar para cloud storage (S3, Google Drive)
