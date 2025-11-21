
# BACKUP COMPLETO DO SUPABASE

**Data:** 2025-11-14T17:14:16.298Z
**Timestamp:** 2025-11-14T17-14-14

## 📊 RESUMO

- **Tabelas:** 8
- **Total de Registros:** 71
- **Arquivos Gerados:** 18

## 📁 ARQUIVOS

### Dados (JSON):
- form_templates.json
- form_responses.json
- companies.json
- contracts.json
- template_validation_rules.json
- template_background_versions.json
- file_uploads.json
- pdf_processing_log.json

### Dados (SQL):
- form_templates.sql
- form_responses.sql
- companies.sql
- contracts.sql
- template_validation_rules.sql
- template_background_versions.sql
- file_uploads.sql
- pdf_processing_log.sql

### Estrutura:
- functions.sql - Functions/RPC
- triggers.sql - Triggers
- RESTORE.sql - Script de restore completo

## 🔄 COMO RESTAURAR

### Opção 1: Restaurar Tudo
```bash
psql -h [host] -U [user] -d [database] -f RESTORE.sql
```

### Opção 2: Restaurar Tabela Específica
```bash
psql -h [host] -U [user] -d [database] -f form_templates.sql
```

### Opção 3: Usar JSON (via código)
```typescript
import data from './form_templates.json'
await supabase.from('form_templates').insert(data)
```

## ⚠️ IMPORTANTE

- Faça backup antes de restaurar
- Verifique se as tabelas existem
- Cuidado com conflitos de ID (UUID)
- Desabilite triggers se necessário

## 📋 DETALHES DAS TABELAS

### form_templates
- Arquivo JSON: form_templates.json
- Arquivo SQL: form_templates.sql

### form_responses
- Arquivo JSON: form_responses.json
- Arquivo SQL: form_responses.sql

### companies
- Arquivo JSON: companies.json
- Arquivo SQL: companies.sql

### contracts
- Arquivo JSON: contracts.json
- Arquivo SQL: contracts.sql

### template_validation_rules
- Arquivo JSON: template_validation_rules.json
- Arquivo SQL: template_validation_rules.sql

### template_background_versions
- Arquivo JSON: template_background_versions.json
- Arquivo SQL: template_background_versions.sql

### file_uploads
- Arquivo JSON: file_uploads.json
- Arquivo SQL: file_uploads.sql

### pdf_processing_log
- Arquivo JSON: pdf_processing_log.json
- Arquivo SQL: pdf_processing_log.sql

