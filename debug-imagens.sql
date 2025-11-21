-- 🔍 DEBUG - VERIFICAR IMAGENS DO TEMPLATE

-- Verificar se o template tem image_paths
SELECT 
  id,
  name,
  image_paths,
  CASE 
    WHEN image_paths IS NULL THEN '❌ NULL'
    WHEN jsonb_array_length(image_paths::jsonb) = 0 THEN '❌ ARRAY VAZIO'
    ELSE '✅ ' || jsonb_array_length(image_paths::jsonb)::text || ' imagem(ns)'
  END as status_imagens
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';

-- Ver o conteúdo completo do image_paths
SELECT 
  id,
  name,
  image_paths
FROM form_templates
WHERE id = '77ce06e3-2373-42c5-8093-37f0e0ce25aa';
