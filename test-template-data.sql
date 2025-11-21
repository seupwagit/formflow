-- 🧪 SCRIPT DE TESTE - VERIFICAR DADOS DO TEMPLATE

-- 1. Listar todos os templates com informações sobre imagens e validações
SELECT 
  id,
  name,
  CASE 
    WHEN image_paths IS NULL THEN '❌ Sem imagens'
    WHEN jsonb_array_length(image_paths::jsonb) = 0 THEN '❌ Array vazio'
    ELSE '✅ ' || jsonb_array_length(image_paths::jsonb)::text || ' imagem(ns)'
  END as status_imagens,
  CASE 
    WHEN "validationRules" IS NULL THEN '❌ Sem regras'
    WHEN jsonb_array_length("validationRules"::jsonb) = 0 THEN '❌ Array vazio'
    ELSE '✅ ' || jsonb_array_length("validationRules"::jsonb)::text || ' regra(s)'
  END as status_validacoes,
  created_at
FROM form_templates
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver detalhes de um template específico (substitua 'TEMPLATE_ID' pelo ID real)
-- SELECT 
--   id,
--   name,
--   image_paths,
--   "validationRules",
--   fields
-- FROM form_templates
-- WHERE id = 'TEMPLATE_ID';

-- 3. Verificar respostas de um template
-- SELECT 
--   fr.id,
--   fr.status,
--   fr.created_at,
--   ft.name as template_name
-- FROM form_responses fr
-- JOIN form_templates ft ON fr.template_id = ft.id
-- WHERE fr.template_id = 'TEMPLATE_ID'
-- ORDER BY fr.created_at DESC;

-- 4. Contar templates com/sem imagens
SELECT 
  COUNT(*) FILTER (WHERE image_paths IS NOT NULL AND jsonb_array_length(image_paths::jsonb) > 0) as com_imagens,
  COUNT(*) FILTER (WHERE image_paths IS NULL OR jsonb_array_length(image_paths::jsonb) = 0) as sem_imagens,
  COUNT(*) as total
FROM form_templates;

-- 5. Contar templates com/sem validações
SELECT 
  COUNT(*) FILTER (WHERE "validationRules" IS NOT NULL AND jsonb_array_length("validationRules"::jsonb) > 0) as com_validacoes,
  COUNT(*) FILTER (WHERE "validationRules" IS NULL OR jsonb_array_length("validationRules"::jsonb) = 0) as sem_validacoes,
  COUNT(*) as total
FROM form_templates;
