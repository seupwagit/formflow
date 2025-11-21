-- ============================================
-- MIGRATION: Criar tabela template_validation_rules
-- Data: 14/11/2024
-- Descrição: Tabela dedicada para validações condicionais
-- ============================================

-- 1. CRIAR TABELA
CREATE TABLE IF NOT EXISTS template_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  rule_data JSONB NOT NULL,
  rule_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_template_validation_rules_template_id 
ON template_validation_rules(template_id);

CREATE INDEX IF NOT EXISTS idx_template_validation_rules_enabled 
ON template_validation_rules(template_id, is_enabled);

-- 3. COMENTÁRIO
COMMENT ON TABLE template_validation_rules IS 'Tabela dedicada para validações condicionais - solução definitiva para persistência';

-- 4. FUNÇÃO PARA SALVAR VALIDAÇÕES
CREATE OR REPLACE FUNCTION save_template_validations(
  p_template_id UUID,
  p_rules JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar regras antigas
  DELETE FROM template_validation_rules WHERE template_id = p_template_id;
  
  -- Inserir novas regras
  INSERT INTO template_validation_rules (template_id, rule_data, rule_order, is_enabled)
  SELECT 
    p_template_id,
    rule_item,
    (row_number() OVER ())::integer - 1 as rule_order,
    COALESCE((rule_item->>'enabled')::boolean, true)
  FROM jsonb_array_elements(p_rules) as rule_item;
END;
$$;

-- 5. FUNÇÃO PARA CARREGAR VALIDAÇÕES
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

-- 6. TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_template_validation_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_template_validation_rules_updated_at
BEFORE UPDATE ON template_validation_rules
FOR EACH ROW
EXECUTE FUNCTION update_template_validation_rules_updated_at();

-- 7. TESTE (OPCIONAL - PODE COMENTAR SE NÃO QUISER EXECUTAR)
-- SELECT save_template_validations(
--   (SELECT id FROM form_templates LIMIT 1),
--   '[{"id":"test","name":"Teste","enabled":true,"conditions":[],"actionsTrue":[],"executionType":"on_change","priority":0,"logicalOperator":"AND"}]'::jsonb
-- );

-- 8. VERIFICAÇÃO
SELECT 
  'Tabela criada com sucesso!' as status,
  COUNT(*) as total_records
FROM template_validation_rules;
