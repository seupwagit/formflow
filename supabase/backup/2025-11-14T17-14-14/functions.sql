
-- ============================================
-- BACKUP DE FUNCTIONS/RPC
-- Data: 2025-11-14T17:14:16.293Z
-- ============================================

-- Function: save_template_validations
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

-- Function: load_template_validations
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
