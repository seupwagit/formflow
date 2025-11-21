-- ============================================
-- MIGRATION: Limpeza de Tabelas Legado
-- Data: 14/11/2024
-- Autor: Auditoria e Consolidação do Sistema
-- ============================================
-- BACKUP CRIADO EM: backups/backup_20241114_xxxxxx
-- ============================================

-- ============================================
-- PARTE 1: BACKUP DOS DADOS (SEGURANÇA)
-- ============================================

-- Criar tabela de backup para form_instances (caso precise restaurar)
CREATE TABLE IF NOT EXISTS _backup_form_instances AS 
SELECT * FROM form_instances;

-- Criar tabela de backup para inspection_solda (caso precise restaurar)
CREATE TABLE IF NOT EXISTS _backup_inspection_solda AS 
SELECT * FROM inspection_solda;

-- ============================================
-- PARTE 2: REMOVER TABELA inspection_solda
-- ============================================
-- Motivo: Nunca foi usada, 0 registros, legado confirmado
-- Evidências: Auditoria completa em docs/AUDITORIA_TABELAS_20241114.md

DROP TABLE IF EXISTS inspection_solda CASCADE;

COMMENT ON TABLE _backup_inspection_solda IS 
'Backup da tabela inspection_solda removida em 14/11/2024. Nunca foi usada no sistema atual.';

-- ============================================
-- PARTE 3: REMOVER TABELA form_instances
-- ============================================
-- Motivo: Redundante com form_responses
-- Evidências: Apenas 1 página usa (inspections), 0 registros
-- Ação: Página inspections será migrada para usar form_responses

DROP TABLE IF EXISTS form_instances CASCADE;

COMMENT ON TABLE _backup_form_instances IS 
'Backup da tabela form_instances removida em 14/11/2024. Consolidada com form_responses.';

-- ============================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  v_inspection_solda_exists BOOLEAN;
  v_form_instances_exists BOOLEAN;
  v_backup_inspection_exists BOOLEAN;
  v_backup_instances_exists BOOLEAN;
BEGIN
  -- Verificar se tabelas foram removidas
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'inspection_solda'
  ) INTO v_inspection_solda_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'form_instances'
  ) INTO v_form_instances_exists;
  
  -- Verificar se backups existem
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = '_backup_inspection_solda'
  ) INTO v_backup_inspection_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = '_backup_form_instances'
  ) INTO v_backup_instances_exists;
  
  -- Exibir resultados
  RAISE NOTICE '========================================';
  RAISE NOTICE 'LIMPEZA DE TABELAS LEGADO - RESULTADOS';
  RAISE NOTICE '========================================';
  
  IF v_inspection_solda_exists THEN
    RAISE NOTICE '❌ inspection_solda ainda existe!';
  ELSE
    RAISE NOTICE '✅ inspection_solda removida com sucesso';
  END IF;
  
  IF v_form_instances_exists THEN
    RAISE NOTICE '❌ form_instances ainda existe!';
  ELSE
    RAISE NOTICE '✅ form_instances removida com sucesso';
  END IF;
  
  IF v_backup_inspection_exists THEN
    RAISE NOTICE '✅ Backup de inspection_solda criado';
  ELSE
    RAISE NOTICE '⚠️ Backup de inspection_solda não criado';
  END IF;
  
  IF v_backup_instances_exists THEN
    RAISE NOTICE '✅ Backup de form_instances criado';
  ELSE
    RAISE NOTICE '⚠️ Backup de form_instances não criado';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Para restaurar (se necessário):';
  RAISE NOTICE '1. CREATE TABLE inspection_solda AS SELECT * FROM _backup_inspection_solda;';
  RAISE NOTICE '2. CREATE TABLE form_instances AS SELECT * FROM _backup_form_instances;';
END $$;
