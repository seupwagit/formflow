-- ============================================
-- BACKUP DE DADOS: template_validation_rules
-- Data: 2025-11-14T17:14:15.948Z
-- Total de registros: 1
-- ============================================

INSERT INTO template_validation_rules (id, template_id, rule_data, rule_order, is_enabled, created_at, updated_at) VALUES ('83b146a0-1f88-417a-814a-dc857a1f6cb2', 'ad2ef918-224e-4de4-888f-da8d5e64ac58', '{"id":"rule_1763134507079","name":"Nova Regra","enabled":true,"priority":0,"conditions":[{"id":"cond_1763134515223","value":"","operator":"is_empty","fieldName":"razao_social_nome"}],"actionsTrue":[{"id":"action_1763134525511","type":"show_message","message":"Mensagem de validação"}],"actionsFalse":[{"id":"action_1763134532239","type":"change_color","color":"#bf1d1d","message":"Mensagem de validação","targetField":"razao_social_nome"}],"executionType":"on_change","logicalOperator":"AND"}'::jsonb, 0, true, '2025-11-14T17:01:02.723614+00:00', '2025-11-14T17:01:02.723614+00:00');

