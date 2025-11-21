-- 🔍 VERIFICAÇÃO RÁPIDA DO TEMPLATE

-- Template específico que está com problema
SELECT 
  id,
  name,
  image_paths,
  "validationRules",
  CASE 
    WHEN image_paths IS NULL THEN '❌ SEM IMAGENS (NULL)'
    WHEN jsonb_array_length(image_paths::jsonb) = 0 THEN '❌ SEM IMAGENS (ARRAY VAZIO)'
    ELSE '✅ ' || jsonb_array_length(image_paths::jsonb)::text || ' IMAGEM(NS)'
  END as status_imagens,
  CASE 
    WHEN "validationRules" IS NULL THEN '❌ SEM VALIDAÇÕES (NULL)'
    WHEN jsonb_array_length("validationRules"::jsonb) = 0 THEN '❌ SEM VALIDAÇÕES (ARRAY VAZIO)'
    ELSE '✅ ' || jsonb_array_length("validationRules"::jsonb)::text || ' REGRA(S)'
  END as status_validacoes
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';

-- Ver conteúdo completo do image_paths
SELECT 
  'IMAGE_PATHS:' as tipo,
  image_paths
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';

-- Ver conteúdo completo das validationRules
SELECT 
  'VALIDATION_RULES:' as tipo,
  "validationRules"
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';
