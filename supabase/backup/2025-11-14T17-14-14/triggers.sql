
-- ============================================
-- BACKUP DE TRIGGERS
-- Data: 2025-11-14T17:14:16.294Z
-- ============================================

-- Trigger: update_template_validation_rules_updated_at
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
