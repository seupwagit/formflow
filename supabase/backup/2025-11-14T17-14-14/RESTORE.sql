
-- ============================================
-- SCRIPT DE RESTORE COMPLETO
-- Data: 2025-11-14T17:14:16.301Z
-- ============================================

-- INSTRUÇÕES:
-- 1. Execute este script em um banco de dados VAZIO
-- 2. Ou execute seção por seção conforme necessário

\echo '🔄 Restaurando Functions...'
\i functions.sql

\echo '🔄 Restaurando Triggers...'
\i triggers.sql

\echo '🔄 Restaurando Dados...'
\i form_templates.sql
\i form_responses.sql
\i companies.sql
\i contracts.sql
\i template_validation_rules.sql
\i template_background_versions.sql
\i file_uploads.sql
\i pdf_processing_log.sql

\echo '✅ Restore completo!'

-- Verificação
SELECT 
  'form_templates' as tabela,
  COUNT(*) as registros
FROM form_templates
UNION ALL
SELECT 'form_responses', COUNT(*) FROM form_responses
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'template_validation_rules', COUNT(*) FROM template_validation_rules
UNION ALL
SELECT 'template_background_versions', COUNT(*) FROM template_background_versions;
