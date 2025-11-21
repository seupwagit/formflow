-- ============================================
-- MIGRATION COMPLETA - EXECUTAR NO SUPABASE
-- Data: 14/11/2024
-- Autor: Sistema FormFlow
-- ============================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase SQL Editor
-- 2. Cole TODO este script
-- 3. Execute (Run)
-- 4. Verifique os resultados no final
-- ============================================

-- ============================================
-- 1. TABELA: template_validation_rules
-- ============================================
CREATE TABLE IF NOT EXISTS template_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  rule_data JSONB NOT NULL,
  rule_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_validation_rules_template_id 
ON template_validation_rules(template_id);

CREATE INDEX IF NOT EXISTS idx_template_validation_rules_enabled 
ON template_validation_rules(template_id, is_enabled);

COMMENT ON TABLE template_validation_rules IS 'Tabela dedicada para validações condicionais';

-- ============================================
-- 2. FUNÇÕES RPC: Validações
-- ============================================
CREATE OR REPLACE FUNCTION save_template_validations(
  p_template_id UUID,
  p_rules JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM template_validation_rules WHERE template_id = p_template_id;
  
  INSERT INTO template_validation_rules (template_id, rule_data, rule_order, is_enabled)
  SELECT 
    p_template_id,
    rule_item,
    (row_number() OVER ())::integer - 1 as rule_order,
    COALESCE((rule_item->>'enabled')::boolean, true)
  FROM jsonb_array_elements(p_rules) as rule_item;
END;
$$;

CREATE OR REPLACE FUNCTION load_template_validations(p_template_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(rule_data ORDER BY rule_order), '[]'::jsonb)
  INTO result
  FROM template_validation_rules
  WHERE template_id = p_template_id
  AND is_enabled = true;
  
  RETURN result;
END;
$$;

-- ============================================
-- 3. TRIGGER: Atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_template_validation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_template_validation_rules_updated_at ON template_validation_rules;

CREATE TRIGGER trigger_update_template_validation_rules_updated_at
BEFORE UPDATE ON template_validation_rules
FOR EACH ROW
EXECUTE FUNCTION update_template_validation_rules_updated_at();

-- ============================================
-- 4. VERIFICAR/CRIAR: template_background_versions
-- ============================================
CREATE TABLE IF NOT EXISTS template_background_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  image_paths TEXT[] NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_template_background_versions_template_id 
ON template_background_versions(template_id);

CREATE INDEX IF NOT EXISTS idx_template_background_versions_current 
ON template_background_versions(template_id, is_current);

COMMENT ON TABLE template_background_versions IS 'Versionamento de imagens de fundo dos templates';

-- ============================================
-- 5. ADICIONAR COLUNA: background_version_id em form_responses
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'form_responses' 
    AND column_name = 'background_version_id'
  ) THEN
    ALTER TABLE form_responses 
    ADD COLUMN background_version_id UUID REFERENCES template_background_versions(id);
    
    CREATE INDEX idx_form_responses_background_version 
    ON form_responses(background_version_id);
  END IF;
END $$;

-- ============================================
-- 6. MIGRAR TEMPLATES EXISTENTES
-- ============================================
-- Criar versões iniciais para templates que têm image_paths
INSERT INTO template_background_versions (template_id, version_number, image_paths, pdf_path, is_current)
SELECT 
  id as template_id,
  1 as version_number,
  COALESCE(image_paths, '{}') as image_paths,
  pdf_path,
  true as is_current
FROM form_templates
WHERE id NOT IN (SELECT DISTINCT template_id FROM template_background_versions)
AND (image_paths IS NOT NULL AND array_length(image_paths, 1) > 0);

-- ============================================
-- 7. VERIFICAÇÕES FINAIS
-- ============================================
DO $$
DECLARE
  v_validation_rules_count INTEGER;
  v_background_versions_count INTEGER;
  v_templates_count INTEGER;
  v_templates_with_versions INTEGER;
BEGIN
  -- Contar registros
  SELECT COUNT(*) INTO v_validation_rules_count FROM template_validation_rules;
  SELECT COUNT(*) INTO v_background_versions_count FROM template_background_versions;
  SELECT COUNT(*) INTO v_templates_count FROM form_templates;
  SELECT COUNT(DISTINCT template_id) INTO v_templates_with_versions FROM template_background_versions;
  
  -- Exibir resultados
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETA - RESULTADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Tabela template_validation_rules: OK';
  RAISE NOTICE '   - Registros: %', v_validation_rules_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tabela template_background_versions: OK';
  RAISE NOTICE '   - Registros: %', v_background_versions_count;
  RAISE NOTICE '   - Templates com versões: %/%', v_templates_with_versions, v_templates_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Funções RPC criadas:';
  RAISE NOTICE '   - save_template_validations()';
  RAISE NOTICE '   - load_template_validations()';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 8. TESTE RÁPIDO (OPCIONAL)
-- ============================================
-- Descomentar para testar:
/*
-- Testar salvamento de validação
SELECT save_template_validations(
  (SELECT id FROM form_templates LIMIT 1),
  '[{
    "id":"test_1",
    "name":"Teste",
    "enabled":true,
    "conditions":[],
    "actionsTrue":[{"id":"a1","type":"show_message","message":"Teste"}],
    "executionType":"on_change",
    "priority":0,
    "logicalOperator":"AND"
  }]'::jsonb
);

-- Verificar se foi salvo
SELECT * FROM template_validation_rules LIMIT 1;
*/
