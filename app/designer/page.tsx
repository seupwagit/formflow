'use client'
// @ts-nocheck

declare global {
  interface Window {
    autoSaveTimeout: NodeJS.Timeout
  }
}

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import NativeCanvas from '@/components/NativeCanvas'
import ResizableCanvas from '@/components/ResizableCanvas'
import FieldProperties from '@/components/FieldProperties'
import FieldStatistics from '@/components/FieldStatistics'
import KeyboardShortcuts, { KeyboardShortcutsHelp } from '@/components/KeyboardShortcuts'
import ExportDialog from '@/components/ExportDialog'
import OCRProgress from '@/components/OCRProgress'
import OCRSettings from '@/components/OCRSettings'
import { OCRConfig } from '@/lib/ocr-config'
import ReportGenerator from '@/components/ReportGenerator'
import CanvasDebug from '@/components/CanvasDebug'
import SimpleFieldEditor from '@/components/SimpleFieldEditor'
import GeminiTest from '@/components/GeminiTest'
import StorageStatus from '@/components/StorageStatus'
import ConnectivityTest from '@/components/ConnectivityTest'
import QuickFix from '@/components/QuickFix'
import PDFConversionSettings from '@/components/PDFConversionSettings'
import ExpectedFieldsConfig from '@/components/ExpectedFieldsConfig'
import TemplateEditGuide from '@/components/TemplateEditGuide'
import VisibilityReportModal from '@/components/VisibilityReportModal'
import FieldVisibilityIndicator from '@/components/FieldVisibilityIndicator'
import AlignmentTools from '@/components/AlignmentTools'
import MultiSelectionPanel from '@/components/MultiSelectionPanel'
import AlignmentShortcuts from '@/components/AlignmentShortcuts'
import AlignmentGuide from '@/components/AlignmentGuide'
import DuplicateFieldsIndicator from '@/components/DuplicateFieldsIndicator'
import ContentAlignmentTools from '@/components/ContentAlignmentTools'
import FontStyleTools from '@/components/FontStyleTools'
import UndoRedoTools from '@/components/UndoRedoTools'
import { HistoryManager } from '@/lib/history-manager'
import CopyPasteTools from '@/components/CopyPasteTools'
import { FieldClipboard } from '@/lib/field-clipboard'
import ClipboardNotification from '@/components/ClipboardNotification'
import PrecisionControls, { PrecisionToolbar } from '@/components/PrecisionControls'
import { FieldPrecisionControls } from '@/lib/field-precision-controls'
import PrecisionKeyboardHelp from '@/components/PrecisionKeyboardHelp'
import { FormField } from '@/lib/types'
import { ExpectedFieldsConfig as ExpectedFieldsConfigType } from '@/lib/hybrid-ai-ocr-processor'
import { PDFProcessor } from '@/lib/pdf-processor'
import { DatabaseManager } from '@/lib/database-manager'
import { supabase } from '@/lib/supabase'
import { generateUniqueFieldId, generateUniqueFieldName, detectDuplicateFields, fixDuplicateFields } from '@/lib/unique-field-generator'
import { useToast } from '@/components/ToastProvider'
import { Save, Eye, Plus, Settings, Download, Zap, Bug, Layout, List, FileText, Table, Grid } from 'lucide-react'
import ContractSelector from '@/components/ContractSelector'
import AddFieldMenu from '@/components/AddFieldMenu'
import { ContractSummary } from '@/lib/types/contracts'
import GridFieldCreator from '@/components/GridFieldCreator'
import ValidationRuleBuilder from '@/components/ValidationRuleBuilder'
import ValidationPreview from '@/components/ValidationPreview'
import { ValidationRule } from '@/lib/types/validation-rules'

export default function DesignerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [selectedFields, setSelectedFields] = useState<FormField[]>([])
  const [clipboard] = useState(() => FieldClipboard.getInstance())
  const [clipboardNotification, setClipboardNotification] = useState<{
    type: 'copy' | 'paste' | 'duplicate' | 'cut'
    count: number
  } | null>(null)
  const [precisionControls] = useState(() => FieldPrecisionControls.getInstance())
  const [isLoading, setIsLoading] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [showVisibilityModal, setShowVisibilityModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showFieldProperties, setShowFieldProperties] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showOCRSettings, setShowOCRSettings] = useState(false)
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [gridSize, setGridSize] = useState(10) // Tamanho da grade em pixels
  const [showGridCreator, setShowGridCreator] = useState(false)
  const [showValidationBuilder, setShowValidationBuilder] = useState(false)
  const [validationRules, setValidationRules] = useState<any[]>([])
  const [showValidationPreview, setShowValidationPreview] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [expectedFieldsConfig, setExpectedFieldsConfig] = useState<ExpectedFieldsConfigType>({})
  const [historyManager] = useState(() => new HistoryManager(50))
  const [ocrProgress, setOcrProgress] = useState({
    isProcessing: false,
    currentPage: 0,
    totalPages: 0,
    stage: 'converting' as 'converting' | 'ocr' | 'analyzing' | 'complete',
    fieldsDetected: 0
  })
  const [showEditGuide, setShowEditGuide] = useState(false)
  const [ocrConfig, setOcrConfig] = useState<OCRConfig>({
    language: 'por+eng',
    pageSegMode: '6',
    ocrEngineMode: '1',
    dpi: 300,
    enablePreprocessing: true,
    confidenceThreshold: 60
  })
  
  // Estados para hierarquia de contratos
  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null)
  const [contractRequired, setContractRequired] = useState(true)
  const [showContractSelector, setShowContractSelector] = useState(false)
  const [ocrConfigWarning, setOcrConfigWarning] = useState<any>(null)
  


  const pdfProcessor = new PDFProcessor()
  const dbManager = new DatabaseManager()

  // Função para carregar contrato pré-selecionado
  const loadPreselectedContract = async (contractId: string) => {
    try {
      const { ContractService } = await import('@/lib/services/contract-service')
      const contract = await ContractService.getContractById(contractId)
      
      if (contract) {
        // Converter para ContractSummary format
        const contractSummary: ContractSummary = {
          ...contract,
          company_name: contract.company?.name || '',
          company_document: contract.company?.document || '',
          company_document_type: contract.company?.document_type || 'CNPJ',
          company_status: contract.company?.status || 'active',
          template_count: 0,
          response_count: 0,
          active_template_count: 0
        }
        
        setSelectedContract(contractSummary)
        setContractRequired(false) // Já tem contrato selecionado
        setShowContractSelector(false)
        
        console.log('✅ Contrato pré-selecionado carregado:', contract.contract_number)
        showSuccess('Contrato Selecionado', `Template será vinculado ao contrato ${contract.contract_number}`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contrato pré-selecionado:', error)
      showWarning('Contrato não encontrado', 'Selecione um contrato para continuar')
      setShowContractSelector(true)
    }
  }

  useEffect(() => {
    // 🔒 VERIFICAR AVISOS DE CONFIGURAÇÃO OCR AO CARREGAR
    const checkOCRWarnings = async () => {
      try {
        const { getOCRConfigWarning } = await import('@/lib/ocr-config')
        const warning = getOCRConfigWarning()
        if (warning) {
          setOcrConfigWarning(warning)
          showWarning(
            'Configuração OCR Alterada', 
            'A configuração OCR foi alterada e pode reduzir a detecção de campos. Verifique as configurações.'
          )
        }
      } catch (error) {
        console.warn('⚠️ Erro ao verificar avisos OCR:', error)
      }
    }
    
    checkOCRWarnings()
    
    const fileName = searchParams.get('file')
    const processingId = searchParams.get('processing')
    const templateId = searchParams.get('template')
    const contractId = searchParams.get('contract')
    
    // Se há um contrato pré-selecionado, carregar e definir
    if (contractId) {
      loadPreselectedContract(contractId)
    }
    
    if (processingId) {
      // Carregar processamento do Supabase Storage
      loadFromSupabaseStorage(processingId)
    } else if (fileName) {
      // Fallback: carregar do localStorage (compatibilidade)
      loadFileFromStorage(fileName)
    } else if (templateId) {
      // Carregar template existente
      loadExistingTemplate(templateId)
    } else {
      // Criar novo formulário vazio - mostrar seletor de contrato
      setShowContractSelector(true)
      loadInitialFields()
    }
  }, [searchParams])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      // Ctrl+S ou Cmd+S - Salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      
      // Ctrl+Shift+S ou Cmd+Shift+S - Salvar Como
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        handleSaveAs()
      }
      
      // Ctrl+Z ou Cmd+Z - Desfazer
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      
      // Ctrl+Y ou Cmd+Y ou Ctrl+Shift+Z - Refazer
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
      
      // Ctrl+C ou Cmd+C - Copiar
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        const fieldsToSelect = selectedField ? [selectedField] : selectedFields
        if (fieldsToSelect.length > 0) {
          handleCopyFields(fieldsToSelect)
        }
      }
      
      // Ctrl+V ou Cmd+V - Colar
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        const pastedFields = clipboard.paste(currentPage, 20, 20, fields)
        if (pastedFields.length > 0) {
          handlePasteFields(pastedFields)
        }
      }
      
      // Ctrl+X ou Cmd+X - Cortar
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault()
        const fieldsToSelect = selectedField ? [selectedField] : selectedFields
        if (fieldsToSelect.length > 0) {
          // Copiar primeiro
          clipboard.copyMultiple(fieldsToSelect)
          
          // Remover campos cortados
          const beforeState = [...fields]
          const remainingFields = fields.filter(f => !fieldsToSelect.some(sf => sf.id === f.id))
          
          // Adicionar ao histórico
          historyManager.addAction(
            'delete',
            `${fieldsToSelect.length} campo(s) cortado(s)`,
            beforeState,
            remainingFields,
            fieldsToSelect.map(f => f.id)
          )
          
          setFields(remainingFields)
          setSelectedField(null)
          setSelectedFields([])
          setHasUnsavedChanges(true)
          
          // Salvar no banco
          if (currentTemplateId) {
            saveFieldsToDatabase(remainingFields, `${fieldsToSelect.length} campo(s) cortado(s)`)
          }
          
          setClipboardNotification({ type: 'cut', count: fieldsToSelect.length })
          showInfo('Campos Cortados', `${fieldsToSelect.length} campo(s) cortado(s) e copiado(s) para o clipboard`)
        }
      }
      
      // Ctrl+D ou Cmd+D - Duplicar
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        const fieldsToSelect = selectedField ? [selectedField] : selectedFields
        if (fieldsToSelect.length > 0) {
          const duplicatedFields = clipboard.duplicateMultiple(fieldsToSelect, currentPage, 20, 20, fields)
          handleDuplicateFields(duplicatedFields)
        }
      }

      // Controles de Precisão com Setas do Teclado
      const fieldsToAdjust = selectedField ? [selectedField] : selectedFields
      if (fieldsToAdjust.length > 0) {
        let adjustedFields: FormField[] | null = null
        const isFastMode = e.altKey

        // Shift + Setas - Ajustar Posição
        if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
          switch (e.key) {
            case 'ArrowUp':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'position', 'up', isFastMode)
              break
            case 'ArrowDown':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'position', 'down', isFastMode)
              break
            case 'ArrowLeft':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'position', 'left', isFastMode)
              break
            case 'ArrowRight':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'position', 'right', isFastMode)
              break
          }
        }

        // Ctrl + Setas - Ajustar Tamanho
        if (e.ctrlKey && !e.shiftKey) {
          switch (e.key) {
            case 'ArrowUp':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'size', 'up', isFastMode)
              break
            case 'ArrowDown':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'size', 'down', isFastMode)
              break
            case 'ArrowLeft':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'size', 'left', isFastMode)
              break
            case 'ArrowRight':
              e.preventDefault()
              adjustedFields = precisionControls.adjustMultipleFields(fieldsToAdjust, 'size', 'right', isFastMode)
              break
          }
        }

        // Aplicar ajustes se houver
        if (adjustedFields) {
          handlePrecisionFieldsUpdate(adjustedFields)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTemplateId, templateName, hasUnsavedChanges])

  const loadFileFromStorage = async (fileName: string) => {
    setIsLoading(true)
    setOcrProgress({ isProcessing: true, currentPage: 0, totalPages: 0, stage: 'converting', fieldsDetected: 0 })
    
    try {
      // Tentar diferentes variações do nome do arquivo
      let storedFile = localStorage.getItem(`pdf_file_${fileName}`)
      
      // Se não encontrar, tentar com extensão .pdf
      if (!storedFile) {
        storedFile = localStorage.getItem(`pdf_file_${fileName}.pdf`)
      }
      
      // Se não encontrar, tentar com extensão .PDF
      if (!storedFile) {
        storedFile = localStorage.getItem(`pdf_file_${fileName}.PDF`)
      }
      
      if (storedFile) {
        // Converter base64 de volta para File
        const response = await fetch(storedFile)
        const blob = await response.blob()
        const file = new File([blob], fileName, { type: 'application/pdf' })
        
        setPdfFile(file)
        
        // Processar PDF com Gemini Vision OCR
        const { GeminiOCRProcessor } = await import('@/lib/gemini-ocr-processor')
        const geminiProcessor = new GeminiOCRProcessor()
        
        // Simular progresso do OCR
        setOcrProgress(prev => ({ ...prev, stage: 'ocr', totalPages: 1 }))
        
        const result = await geminiProcessor.loadPDF(file)
        
        setOcrProgress(prev => ({ ...prev, stage: 'analyzing', fieldsDetected: result.detectedFields.length }))
        
        const detectedFields = geminiProcessor.convertToFormFields(result.detectedFields)
        
        // Converter campos do formato de detecção para o formato do designer
        const { convertFieldsFromDetection } = await import('@/lib/field-utils')
        const convertedFields = convertFieldsFromDetection(detectedFields)
        
        setPdfFile(file)
        setPdfImages(result.imageUrls)
        setFields(convertedFields)
        
        setOcrProgress(prev => ({ ...prev, stage: 'complete', fieldsDetected: detectedFields.length }))
        
        // Aguardar um pouco para mostrar o resultado
        setTimeout(() => {
          setOcrProgress(prev => ({ ...prev, isProcessing: false }))
        }, 2000)
        
        console.log(`✅ PDF processado: ${result.pages} páginas, ${detectedFields.length} campos detectados`)
        showSuccess('PDF Processado com Gemini Vision', `${result.pages} páginas e ${detectedFields.length} campos detectados automaticamente`)
        
      } else {
        // Fallback para campos simulados
        console.warn('⚠️ Arquivo não encontrado no localStorage, usando campos simulados')
        showWarning('Arquivo não encontrado', 'Usando campos de demonstração')
        setOcrProgress(prev => ({ ...prev, isProcessing: false }))
        loadInitialFields()
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error)
      showError('Erro ao processar PDF', 'Usando campos de demonstração como fallback')
      setOcrProgress(prev => ({ ...prev, isProcessing: false }))
      // Fallback para campos simulados em caso de erro
      loadInitialFields()
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingTemplate = async (templateId: string) => {
    setIsLoading(true)
    setOcrProgress({ isProcessing: true, currentPage: 0, totalPages: 0, stage: 'converting', fieldsDetected: 0 })
    
    try {
      console.log('📋 Carregando template para edição:', templateId)
      
      // Carregar template diretamente do Supabase
      const { data: template, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error || !template) {
        console.warn('⚠️ Template não encontrado:', error)
        showWarning('Template não encontrado', 'Criando novo formulário')
        loadInitialFields()
        return
      }

      console.log('✅ Template encontrado:', template)
      setOcrProgress(prev => ({ ...prev, stage: 'ocr', totalPages: 1 }))
      
      // Restaurar informações básicas do template
      setTemplateName((template as any).name || 'Template sem nome')
      setCurrentTemplateId(templateId)
      setHasUnsavedChanges(false)
      
      // 🔧 CARREGAR CONTRATO ASSOCIADO AO TEMPLATE
      if ((template as any).contract_id) {
        try {
          console.log('📋 Carregando contrato associado:', (template as any).contract_id)
          const { ContractService } = await import('@/lib/services/contract-service')
          const contract = await ContractService.getContractById((template as any).contract_id)
          
          if (contract) {
            // Converter para ContractSummary format
            const contractSummary: ContractSummary = {
              ...contract,
              company_name: contract.company?.name || '',
              company_document: contract.company?.document || '',
              company_document_type: contract.company?.document_type || 'CNPJ',
              company_status: contract.company?.status || 'active',
              template_count: 0,
              response_count: 0,
              active_template_count: 0
            }
            
            setSelectedContract(contractSummary)
            setContractRequired(false)
            setShowContractSelector(false)
            
            console.log('✅ Contrato do template carregado:', contract.contract_number)
          } else {
            console.warn('⚠️ Contrato não encontrado, mostrando seletor')
            setShowContractSelector(true)
          }
        } catch (error) {
          console.error('❌ Erro ao carregar contrato do template:', error)
          setShowContractSelector(true)
        }
      } else {
        console.warn('⚠️ Template sem contrato associado, mostrando seletor')
        setShowContractSelector(true)
      }
      
      // Converter campos do formato do banco para o formato do designer
      const { convertFieldsFromDatabase, fixInvalidFieldNames, forceCorrectFieldNames } = await import('@/lib/field-utils')
      const convertedFields = convertFieldsFromDatabase((template as any).fields)
      
      // FORÇAR correção para usar ID como name
      const forceCorrectedFields = forceCorrectFieldNames(convertedFields)
      
      // Aplicar correção adicional aos nomes dos campos
      const correctedFields = fixInvalidFieldNames(forceCorrectedFields)
      
      // Verificar e CORRIGIR duplicados automaticamente no carregamento
      const { detectDuplicateFields, fixDuplicateFields } = await import('@/lib/unique-field-generator')
      const duplicates = detectDuplicateFields(correctedFields)
      
      let finalFields = correctedFields
      if (duplicates.duplicateIds.length > 0 || duplicates.duplicateNames.length > 0) {
        console.log(`🔧 CORRIGINDO automaticamente: ${duplicates.duplicateIds.length} IDs duplicados + labels duplicados`)
        
        // Aplicar correção automática que REMOVE duplicados
        finalFields = fixDuplicateFields(correctedFields)
        
        // Salvar correção no banco imediatamente
        await saveFieldsToDatabase(finalFields, `Correção automática no carregamento: ${correctedFields.length - finalFields.length} duplicados removidos`)
        
        showSuccess(
          'Duplicados Corrigidos', 
          `${correctedFields.length - finalFields.length} campos duplicados foram removidos automaticamente ao carregar o template.`
        )
      }
      
      setFields(finalFields)
      setOcrProgress(prev => ({ ...prev, stage: 'analyzing', fieldsDetected: convertedFields.length }))
      
      // Carregar imagens do template
      let imageUrls: string[] = []
      
      // Tentar diferentes formatos de armazenamento de imagens
      if ((template as any).image_paths && Array.isArray((template as any).image_paths)) {
        console.log('🖼️ Carregando imagens do template:', (template as any).image_paths)
        
        imageUrls = await Promise.all(
          (template as any).image_paths.map(async (path: string) => {
            try {
              // Se já é uma URL completa, usar diretamente
              if (path.startsWith('http')) {
                console.log('✅ Usando URL direta:', path)
                return path
              }
              
              // Se é um caminho relativo, construir URL pública
              const { data } = supabase.storage
                .from('processed-images')
                .getPublicUrl(path)
              console.log('✅ URL construída:', data.publicUrl)
              return data.publicUrl
            } catch (error) {
              console.warn('⚠️ Erro ao carregar imagem:', path, error)
              return null
            }
          })
        )
        
        // Filtrar URLs válidas
        imageUrls = imageUrls.filter(url => url !== null) as string[]
        console.log(`📸 Total de imagens carregadas: ${imageUrls.length}`)
        
        // Log do resultado
        if (imageUrls.length === 0) {
          console.warn('⚠️ Nenhuma imagem válida encontrada no template')
        }
      }
      
      // Se não há imagens, tentar carregar do localStorage como fallback
      if (imageUrls.length === 0) {
        console.log('🔄 Tentando carregar imagens do cache local...')
        const cachedData = localStorage.getItem('current_processing')
        if (cachedData) {
          const data = JSON.parse(cachedData)
          if (data.imagePublicUrls && data.imagePublicUrls.length > 0) {
            imageUrls = data.imagePublicUrls
            console.log('✅ Imagens carregadas do cache local')
          }
        }
      }
      
      // Se ainda não há imagens, criar uma imagem placeholder
      if (imageUrls.length === 0) {
        console.log('🖼️ Criando imagem placeholder para edição')
        imageUrls = [createPlaceholderImage((template as any).name)]
      }
      
      setPdfImages(imageUrls)
      setOcrProgress(prev => ({ ...prev, stage: 'complete', fieldsDetected: convertedFields.length }))
      
      // 🔒 CARREGAR VALIDAÇÕES CONDICIONAIS
      try {
        const { validationManager } = await import('@/lib/validation-conditional-manager')
        const loadedValidations = await validationManager.loadValidations(templateId)
        setValidationRules(loadedValidations)
        console.log(`✅ ${loadedValidations.length} validação(ões) condicional(is) carregada(s)`)
      } catch (error) {
        console.error('❌ Erro ao carregar validações condicionais:', error)
        setValidationRules([])
      }
      
      setTimeout(() => {
        setOcrProgress(prev => ({ ...prev, isProcessing: false }))
      }, 1000)
      
      showSuccess(
        'Template Carregado para Edição', 
        `${(template as any).name} com ${convertedFields.length} campos e ${imageUrls.length} página(s)`
      )
      
      // Mostrar guia de edição se for a primeira vez
      const hasSeenEditGuide = localStorage.getItem('hasSeenEditGuide')
      if (!hasSeenEditGuide) {
        setTimeout(() => setShowEditGuide(true), 2000)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar template:', error)
      showError('Erro ao carregar template', 'Criando novo formulário')
      loadInitialFields()
    } finally {
      setIsLoading(false)
    }
  }
  
  // Função auxiliar para criar imagem placeholder
  const createPlaceholderImage = (templateName: string): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 794  // A4 width
    canvas.height = 1123 // A4 height
    const ctx = canvas.getContext('2d')!
    
    // Fundo branco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Borda
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Título
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('TEMPLATE EM EDIÇÃO', canvas.width / 2, 100)
    
    // Nome do template
    ctx.font = '18px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(templateName, canvas.width / 2, 140)
    
    // Instruções
    ctx.font = '14px Arial'
    ctx.fillText('Imagem original não disponível', canvas.width / 2, 200)
    ctx.fillText('Use "Trocar Imagem de Fundo" para atualizar', canvas.width / 2, 230)
    ctx.fillText('Os campos existentes serão preservados', canvas.width / 2, 260)
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const loadInitialFields = async () => {
    setIsLoading(true)
    try {
      // Campos simulados para demonstração
      const mockFields: FormField[] = [
        {
          id: 'field_1',
          name: 'inspector_name',
          type: 'text',
          label: 'Nome do Inspetor',
          required: true,
          position: { x: 220, y: 95, width: 200, height: 25, page: 0 }
        },
        {
          id: 'field_2',
          name: 'inspection_date',
          type: 'date',
          label: 'Data da Inspeção',
          required: true,
          position: { x: 220, y: 145, width: 150, height: 25, page: 0 }
        },
        {
          id: 'field_3',
          name: 'temperature',
          type: 'number',
          label: 'Temperatura',
          required: false,
          position: { x: 220, y: 195, width: 100, height: 25, page: 0 },
          validation: { min: -50, max: 200 }
        }
      ]
      
      setFields(mockFields)
      console.log('📝 Usando campos simulados para demonstração')
      
    } catch (error) {
      console.error('Erro ao carregar campos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldSelect = (field: FormField | null) => {
    setSelectedField(field)
    // NÃO abrir propriedades automaticamente
  }
  
  const openFieldProperties = () => {
    console.log('🖱️ Abrindo propriedades do campo:', selectedField?.label || selectedField?.name)
    
    if (selectedField) {
      setShowFieldProperties(true)
    } else {
      console.warn('⚠️ Nenhum campo selecionado para abrir propriedades')
    }
  }





  const handleFieldUpdate = async (updatedField: FormField) => {
    console.log('🔄 Atualizando campo:', updatedField)
    
    const beforeState = [...fields]
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    )
    
    // Adicionar ao histórico
    historyManager.addAction(
      'update',
      `Propriedade atualizada: ${updatedField.label || updatedField.name}`,
      beforeState,
      updatedFields,
      [updatedField.id]
    )
    
    setFields(updatedFields)
    setSelectedField(updatedField)
    setHasUnsavedChanges(true)
    
    console.log('✅ Campo atualizado no estado')
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      try {
        await saveFieldsToDatabase(updatedFields, `Propriedade atualizada: ${updatedField.label || updatedField.name}`)
        console.log('✅ Propriedade salva automaticamente no banco')
      } catch (error) {
        console.error('❌ Erro ao salvar propriedade:', error)
      }
    }
  }

  // Função para atualizar múltiplos campos (para alinhamento)
  const handleMultipleFieldsUpdate = (updatedFields: FormField[]) => {
    console.log('🔄 Atualizando múltiplos campos:', updatedFields.length)
    
    const updatedFieldsMap = new Map(updatedFields.map(field => [field.id, field]))
    
    const newFields = fields.map(field => 
      updatedFieldsMap.has(field.id) ? updatedFieldsMap.get(field.id)! : field
    )
    
    setFields(newFields)
    setHasUnsavedChanges(true)
    
    console.log('✅ Múltiplos campos atualizados')
  }

  // Função para gerenciar seleção múltipla
  const handleFieldSelection = (field: FormField, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      const isAlreadySelected = selectedFields.some(f => f.id === field.id)
      
      if (isAlreadySelected) {
        // Remover da seleção
        const newSelection = selectedFields.filter(f => f.id !== field.id)
        setSelectedFields(newSelection)
        
        // Se não há mais campos selecionados, limpar selectedField
        if (newSelection.length === 0) {
          setSelectedField(null)
        }
      } else {
        // Adicionar à seleção
        setSelectedFields([...selectedFields, field])
        setSelectedField(field) // Manter o último selecionado como principal
      }
    } else {
      // Seleção única - NÃO abrir propriedades automaticamente
      setSelectedField(field)
      setSelectedFields([field])
      // Remover abertura automática: setShowFieldProperties(true)
    }
  }

  // Limpar seleção múltipla
  const clearMultiSelection = () => {
    setSelectedFields([])
    setSelectedField(null)
  }

  // Funções de alinhamento individuais
  const alignLeft = () => {
    if (selectedFields.length < 2) return
    const leftmostX = Math.min(...selectedFields.map(f => f.position.x))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, x: leftmostX }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const alignRight = () => {
    if (selectedFields.length < 2) return
    const rightmostX = Math.max(...selectedFields.map(f => f.position.x + f.position.width))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, x: rightmostX - field.position.width }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const alignCenter = () => {
    if (selectedFields.length < 2) return
    const leftmost = Math.min(...selectedFields.map(f => f.position.x))
    const rightmost = Math.max(...selectedFields.map(f => f.position.x + f.position.width))
    const centerX = leftmost + (rightmost - leftmost) / 2
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, x: centerX - field.position.width / 2 }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const alignTop = () => {
    if (selectedFields.length < 2) return
    const topmostY = Math.min(...selectedFields.map(f => f.position.y))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, y: topmostY }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const alignBottom = () => {
    if (selectedFields.length < 2) return
    const bottommostY = Math.max(...selectedFields.map(f => f.position.y + f.position.height))
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, y: bottommostY - field.position.height }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const alignMiddle = () => {
    if (selectedFields.length < 2) return
    const topmost = Math.min(...selectedFields.map(f => f.position.y))
    const bottommost = Math.max(...selectedFields.map(f => f.position.y + f.position.height))
    const centerY = topmost + (bottommost - topmost) / 2
    const alignedFields = selectedFields.map(field => ({
      ...field,
      position: { ...field.position, y: centerY - field.position.height / 2 }
    }))
    handleMultipleFieldsUpdate(alignedFields)
  }

  const distributeHorizontally = () => {
    if (selectedFields.length < 3) return
    const sortedFields = [...selectedFields].sort((a, b) => a.position.x - b.position.x)
    const leftmost = sortedFields[0].position.x
    const rightmost = sortedFields[sortedFields.length - 1].position.x + sortedFields[sortedFields.length - 1].position.width
    const totalSpace = rightmost - leftmost
    const totalFieldsWidth = sortedFields.reduce((sum, field) => sum + field.position.width, 0)
    const availableSpace = totalSpace - totalFieldsWidth
    const spacing = availableSpace / (sortedFields.length - 1)
    
    let currentX = leftmost
    const distributedFields = sortedFields.map(field => {
      const newField = { ...field, position: { ...field.position, x: currentX } }
      currentX += field.position.width + spacing
      return newField
    })
    
    handleMultipleFieldsUpdate(distributedFields)
  }

  const distributeVertically = () => {
    if (selectedFields.length < 3) return
    const sortedFields = [...selectedFields].sort((a, b) => a.position.y - b.position.y)
    const topmost = sortedFields[0].position.y
    const bottommost = sortedFields[sortedFields.length - 1].position.y + sortedFields[sortedFields.length - 1].position.height
    const totalSpace = bottommost - topmost
    const totalFieldsHeight = sortedFields.reduce((sum, field) => sum + field.position.height, 0)
    const availableSpace = totalSpace - totalFieldsHeight
    const spacing = availableSpace / (sortedFields.length - 1)
    
    let currentY = topmost
    const distributedFields = sortedFields.map(field => {
      const newField = { ...field, position: { ...field.position, y: currentY } }
      currentY += field.position.height + spacing
      return newField
    })
    
    handleMultipleFieldsUpdate(distributedFields)
  }

  // 🆕 Função para aplicar Snap to Grid
  const applySnapToGrid = () => {
    if (selectedFields.length === 0) {
      showWarning('Nenhum Campo Selecionado', 'Selecione campos para aplicar snap to grid')
      return
    }

    const snappedFields = selectedFields.map(field => ({
      ...field,
      position: {
        ...field.position,
        x: Math.round(field.position.x / gridSize) * gridSize,
        y: Math.round(field.position.y / gridSize) * gridSize,
        width: Math.round(field.position.width / gridSize) * gridSize,
        height: Math.round(field.position.height / gridSize) * gridSize
      }
    }))

    handleMultipleFieldsUpdate(snappedFields)
    showSuccess('Snap to Grid Aplicado', `${selectedFields.length} campo(s) alinhado(s) à grade de ${gridSize}px`)
  }

  // Função para detectar e remover campos duplicados
  const handleFixDuplicateIds = async () => {
    console.log('🔍 Detectando campos duplicados...')
    
    // Usar a nova função de correção que remove duplicados
    const { fixDuplicateFields } = await import('@/lib/unique-field-generator')
    
    const originalCount = fields.length
    const correctedFields = fixDuplicateFields(fields)
    const duplicatesRemoved = originalCount - correctedFields.length
    
    if (duplicatesRemoved === 0) {
      showSuccess('Sem Duplicados', 'Todos os campos são únicos')
      return
    }
    
    console.log(`✅ ${duplicatesRemoved} campos duplicados removidos`)
    
    setFields(correctedFields)
    setHasUnsavedChanges(true)
    
    // Salvar automaticamente no banco de dados
    if (currentTemplateId) {
      await saveFieldsToDatabase(correctedFields, `Campos duplicados removidos: ${duplicatesRemoved} campos`)
    }
    
    showSuccess(
      'Duplicados Removidos', 
      `${duplicatesRemoved} campos duplicados foram removidos e as alterações foram salvas automaticamente!`
    )
    
    // Limpar seleção para evitar problemas
    setSelectedField(null)
    setSelectedFields([])
  }

  // Função para salvar campos no banco de dados
  const saveFieldsToDatabase = async (fieldsToSave: FormField[], description: string) => {
    if (!currentTemplateId) {
      console.log('⚠️ Não há template atual para salvar')
      return
    }

    try {
      console.log(`💾 Salvando ${fieldsToSave.length} campos no banco: ${description}`)
      
      // Criar backup das posições antes de salvar
      const { createPositionBackup, validateFieldPositions } = await import('@/lib/position-backup')
      
      // Validar integridade das posições
      if (!validateFieldPositions(fieldsToSave)) {
        throw new Error('Posições dos campos estão corrompidas!')
      }
      
      // Criar backup das posições
      await createPositionBackup(currentTemplateId, templateName, fieldsToSave)
      
      // Preparar dados para atualizar - SIMPLIFICADO
      const updateData: any = {
        fields: fieldsToSave,
        updated_at: new Date().toISOString()
      }

      // Adicionar imagens se existirem
      if (pdfImages && pdfImages.length > 0) {
        updateData.image_paths = pdfImages
        updateData.pdf_pages = pdfImages.length
      }

      // Adicionar validações se existirem
      if (validationRules && validationRules.length > 0) {
        updateData.validationRules = validationRules
      }

      // Atualizar no banco
      const { error } = await supabase
        .from('form_templates')
        .update(updateData)
        .eq('id', currentTemplateId)

      if (error) {
        throw new Error(`Erro ao salvar: ${error.message}`)
      }

      console.log('✅ Campos salvos no banco com sucesso:', currentTemplateId)
      setHasUnsavedChanges(false)
      
    } catch (error) {
      console.error('❌ Erro ao salvar campos no banco:', error)
      showError('Erro ao Salvar', `Não foi possível salvar as correções: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // Função para regenerar TODOS os IDs de forma robusta
  const handleRegenerateAllIds = async () => {
    console.log('🔄 Regenerando TODOS os IDs para garantir unicidade...')
    
    try {
      const { generateUniqueFieldId, generateUniqueFieldName } = await import('@/lib/unique-field-generator')
      
      const regeneratedFields: FormField[] = []
      
      fields.forEach((field, index) => {
        // Gerar novos IDs únicos para TODOS os campos
        const newId = generateUniqueFieldId(field.label, regeneratedFields, field.position, index)
        const newName = generateUniqueFieldName(field.label, regeneratedFields, field.position, index)
        
        const regeneratedField: FormField = {
          ...field,
          id: newId,
          name: newName
        }
        
        console.log(`🔄 Regenerando: "${field.id}" → "${newId}" | "${field.name}" → "${newName}"`)
        regeneratedFields.push(regeneratedField)
      })
      
      setFields(regeneratedFields)
      setHasUnsavedChanges(true)
      
      // Salvar automaticamente no banco de dados
      if (currentTemplateId) {
        await saveFieldsToDatabase(regeneratedFields, `Todos os IDs regenerados: ${fields.length} campos`)
      }
      
      // Limpar seleção para evitar problemas
      setSelectedField(null)
      setSelectedFields([])
      
      showSuccess(
        'IDs Regenerados', 
        `Todos os ${fields.length} campos agora têm IDs únicos e foram salvos automaticamente!`
      )
      
    } catch (error) {
      console.error('❌ Erro ao regenerar IDs:', error)
      showError('Erro', 'Não foi possível regenerar os IDs. Tente novamente.')
    }
  }

  const handleFieldDelete = async (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId)
    setFields(updatedFields)
    setSelectedField(null)
    setShowFieldProperties(false)
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      await saveFieldsToDatabase(updatedFields, `Campo removido: ${fieldId}`)
    }
  }

  const handleFieldDuplicate = async (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Cópia)`,
      position: {
        ...field.position,
        x: field.position.x + 20,
        y: field.position.y + 20
      }
    }
    
    const updatedFields = [...fields, duplicatedField]
    setFields(updatedFields)
    setSelectedField(duplicatedField)
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      await saveFieldsToDatabase(updatedFields, `Campo duplicado: ${field.label}`)
    }
    
    showInfo('Campo Duplicado', `${field.label} foi duplicado`)
  }

  const addNewField = (fieldType: string = 'text') => {
    const pageFields = fields.filter(f => f.position.page === currentPage)
    const baseX = 80 + (pageFields.length * 30)
    const baseY = 80 + (pageFields.length * 30)
    
    // Definir altura padrão baseada no tipo
    const defaultHeight = fieldType === 'textarea' ? 80 : fieldType === 'table' ? 150 : 35
    
    // Definir label baseado no tipo
    const typeLabels: {[key: string]: string} = {
      text: 'Novo Campo de Texto',
      number: 'Novo Campo Numérico',
      date: 'Nova Data',
      select: 'Nova Lista',
      checkbox: 'Nova Caixa de Seleção',
      textarea: 'Nova Área de Texto',
      calculated: 'Novo Campo Calculado',
      dynamic_list: 'Nova Lista Dinâmica',
      table: 'Nova Tabela'
    }
    
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_p${currentPage + 1}_${pageFields.length + 1}`,
      type: fieldType as any,
      label: typeLabels[fieldType] || 'Novo Campo',
      required: false,
      position: {
        x: Math.min(baseX, 600), // Não sair do canvas
        y: Math.min(baseY, 800),
        width: 200,
        height: defaultHeight,
        page: currentPage
      }
    }

    console.log(`➕ Adicionando campo na página ${currentPage + 1}:`, newField.name)
    
    const beforeState = [...fields]
    const updatedFields = [...fields, newField]
    
    // Adicionar ao histórico
    historyManager.addAction(
      'add',
      `Campo adicionado: ${newField.label}`,
      beforeState,
      updatedFields,
      [newField.id]
    )
    
    setFields(updatedFields)
    setSelectedField(newField)
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      saveFieldsToDatabase(updatedFields, `Novo campo adicionado: ${newField.label}`)
    }
    
    showSuccess('Campo Adicionado', 'Novo campo criado na página atual')
  }

  const deleteSelectedField = () => {
    if (!selectedField) return
    
    const beforeState = [...fields]
    const updatedFields = fields.filter(field => field.id !== selectedField.id)
    
    // Adicionar ao histórico
    historyManager.addAction(
      'delete',
      `Campo removido: ${selectedField.label}`,
      beforeState,
      updatedFields,
      [selectedField.id]
    )
    
    setFields(updatedFields)
    setSelectedField(null)
    setShowFieldProperties(false)
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      saveFieldsToDatabase(updatedFields, `Campo removido: ${selectedField.label}`)
    }
    
    showInfo('Campo Excluído', `${selectedField.label} foi removido`)
  }

  const duplicateSelectedField = () => {
    if (!selectedField) return
    handleFieldDuplicate(selectedField)
  }

  const loadDataFromSupabase = async (processingId: string) => {
    try {
      // Primeiro tentar carregar do form_templates (novo formato)
      const { data: templateData, error: templateError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('processing_id', processingId)
        .single()

      if (templateData && !templateError) {
        console.log('✅ Template encontrado:', (templateData as any).name)
        
        // Obter URLs públicas das imagens do storage
        const imageUrls = await Promise.all(
          ((templateData as any).image_paths || []).map(async (path: string) => {
            // Se já é uma URL completa, usar diretamente
            if (path.startsWith('http')) {
              console.log('✅ Usando URL direta:', path)
              return path
            }
            
            // Se é um caminho relativo, construir URL pública
            const { data } = supabase.storage
              .from('processed-images')
              .getPublicUrl(path)
            console.log('🖼️ URL construída:', data.publicUrl)
            return data.publicUrl
          })
        )

        return {
          imageUrls,
          detectedFields: (templateData as any).fields || [],
          pages: (templateData as any).pdf_pages || 1
        }
      }

      // Fallback: tentar carregar do pdf_processing_log (formato antigo)
      const { data: logData, error: logError } = await supabase
        .from('pdf_processing_log')
        .select('*')
        .eq('processing_id', processingId)
        .single()

      if (logError || !logData) {
        throw new Error('Processamento não encontrado no banco')
      }

      // Obter URLs públicas das imagens
      const imageUrls = await Promise.all(
        ((logData as any).image_paths || []).map(async (path: string) => {
          // Se já é uma URL completa, usar diretamente
          if (path.startsWith('http')) {
            console.log('✅ Usando URL direta:', path)
            return path
          }
          
          // Se é um caminho relativo, construir URL pública
          const { data } = supabase.storage
            .from('processed-images')
            .getPublicUrl(path)
          console.log('🖼️ URL construída:', data.publicUrl)
          return data.publicUrl
        })
      )

      console.log(`✅ Carregadas ${imageUrls.length} imagens do storage`)

      return {
        imageUrls,
        detectedFields: [], // Campos de exemplo por enquanto
        pages: (logData as any).pages_count
      }

    } catch (error) {
      console.error('❌ Erro ao carregar do Supabase:', error)
      return null
    }
  }

  const loadFromSupabaseStorage = async (processingId: string) => {
    setIsLoading(true)
    setOcrProgress({ isProcessing: true, currentPage: 0, totalPages: 0, stage: 'converting', fieldsDetected: 0 })
    
    try {
      console.log('📥 Carregando processamento do Supabase:', processingId)
      
      // Primeiro tentar carregar do localStorage (mais rápido)
      const cachedData = localStorage.getItem('current_processing')
      if (cachedData) {
        const data = JSON.parse(cachedData)
        if (data.processingId === processingId) {
          console.log('✅ Dados encontrados no cache local')
          
          // Usar SEMPRE as imagens PNG convertidas, nunca o PDF original
          const imageUrls = data.imagePublicUrls || data.imageUrls || []
          console.log('🖼️ URLs das imagens PNG do localStorage:', imageUrls)
          
          if (imageUrls.length === 0) {
            console.warn('⚠️ Nenhuma imagem PNG encontrada! Isso pode causar problemas no OCR.')
          }
          setPdfImages(imageUrls)
          
          // Converter campos para o formato esperado
          const convertedFields = (data.detectedFields || []).map((field: any) => ({
            id: field.id || `field_${Date.now()}`,
            name: field.label?.toLowerCase().replace(/\s+/g, '_') || 'campo',
            type: field.type || 'text',
            label: field.label || 'Campo',
            required: false,
            position: {
              x: field.x || 100,
              y: field.y || 100,
              width: field.width || 200,
              height: field.height || 30,
              page: (field.page || 1) - 1
            }
          }))
          
          setFields(convertedFields)
          
          setOcrProgress(prev => ({ ...prev, stage: 'complete', fieldsDetected: data.detectedFields.length }))
          
          setTimeout(() => {
            setOcrProgress(prev => ({ ...prev, isProcessing: false }))
          }, 1000)
          
          showSuccess('Formulário Carregado', `${data.detectedFields.length} campos carregados do cache`)
          setIsLoading(false)
          return
        }
      }
      
      // Se não estiver no cache, carregar do Supabase
      setOcrProgress(prev => ({ ...prev, stage: 'ocr', totalPages: 1 }))
      
      const result = await loadDataFromSupabase(processingId)
      
      if (result) {
        console.log('✅ Dados carregados do Supabase:', result)
        
        // Debug do storage
        const { StorageHelper } = await import('@/lib/storage-helper')
        await StorageHelper.debugStorage(processingId)
        
        setPdfImages(result.imageUrls)
        
        // Converter campos para o formato esperado
        const convertedFields = (result.detectedFields || []).map((field: any) => ({
          id: field.id || `field_${Date.now()}`,
          name: field.label?.toLowerCase().replace(/\s+/g, '_') || 'campo',
          type: field.type || 'text',
          label: field.label || 'Campo',
          required: false,
          position: {
            x: field.x || 100,
            y: field.y || 100,
            width: field.width || 200,
            height: field.height || 30,
            page: (field.page || 1) - 1
          }
        }))
        
        setFields(convertedFields)
        
        setOcrProgress(prev => ({ ...prev, stage: 'complete', fieldsDetected: result.detectedFields.length }))
        
        setTimeout(() => {
          setOcrProgress(prev => ({ ...prev, isProcessing: false }))
        }, 1000)
        
        showSuccess('Formulário Carregado', `${result.detectedFields.length} campos carregados do Supabase`)
      } else {
        throw new Error('Processamento não encontrado no Supabase')
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar do Supabase:', error)
      showError('Erro ao carregar', 'Não foi possível carregar o processamento. Usando campos de demonstração.')
      setOcrProgress(prev => ({ ...prev, isProcessing: false }))
      loadInitialFields()
    } finally {
      setIsLoading(false)
    }
  }

  const handleOCRConfigApply = async (newConfig: OCRConfig) => {
    console.log('💾 Salvando configurações OCR:', newConfig)
    
    try {
      // 🔒 USAR FUNÇÃO SEGURA PARA SALVAR
      const { saveOCRConfigSafely, getOCRConfigWarning } = await import('@/lib/ocr-config')
      
      // Salvar com verificação de segurança
      saveOCRConfigSafely(newConfig)
      
      // Salvar no estado
      setOcrConfig(newConfig)
      
      // Verificar se há novos avisos após salvar
      const warning = getOCRConfigWarning()
      setOcrConfigWarning(warning)
      
      // Fechar o modal
      setShowOCRSettings(false)
      
      // Mostrar mensagem apropriada
      if (warning) {
        showWarning(
          'Configuração OCR Salva', 
          'Configuração salva, mas pode reduzir a detecção de campos. Use o preset "Formulários" para máxima precisão.'
        )
      } else {
        showSuccess('Configurações OCR', 'Configuração testada aplicada com sucesso!')
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações OCR:', error)
      showError('Erro', 'Não foi possível salvar as configurações OCR')
    }
  }

  // Reorganizar campos ocultos
  const handleReorganizeHiddenFields = async () => {
    try {
      const { reorganizeHiddenFields, analyzeFieldVisibility } = await import('@/lib/field-organizer')
      
      // Analisar campos antes da reorganização
      const beforeAnalysis = analyzeFieldVisibility(fields)
      const hiddenBefore = beforeAnalysis.filter(a => !a.isVisible).length
      
      if (hiddenBefore === 0) {
        showSuccess('Todos Visíveis', 'Todos os campos já estão visíveis no canvas')
        return
      }
      
      // Reorganizar campos ocultos
      const reorganizedFields = reorganizeHiddenFields(fields)
      
      // Analisar após reorganização
      const afterAnalysis = analyzeFieldVisibility(reorganizedFields)
      const hiddenAfter = afterAnalysis.filter(a => !a.isVisible).length
      
      // Atualizar campos
      setFields(reorganizedFields)
      setHasUnsavedChanges(true)
      
      // Salvar automaticamente no banco de dados
      if (currentTemplateId) {
        await saveFieldsToDatabase(reorganizedFields, `Reorganização de campos: ${hiddenBefore - hiddenAfter} campos movidos`)
      }
      
      const recovered = hiddenBefore - hiddenAfter
      showSuccess(
        'Campos Reorganizados', 
        `${recovered} campos ocultos foram movidos para posições visíveis e salvos automaticamente!`
      )
      
    } catch (error) {
      console.error('Erro ao reorganizar campos:', error)
      showError('Erro na Reorganização', 'Não foi possível reorganizar os campos ocultos')
    }
  }

  // Mostrar relatório de visibilidade
  const handleShowVisibilityReport = () => {
    setShowVisibilityModal(true)
  }

  const reprocessWithOCR = async () => {
    if (!pdfImages || pdfImages.length === 0) {
      showWarning('Nenhuma imagem', 'Carregue um PDF primeiro para gerar as imagens PNG')
      return
    }

    setOcrProgress({ isProcessing: true, currentPage: 0, totalPages: pdfImages.length, stage: 'converting', fieldsDetected: 0 })
    
    try {
      // 🔒 CARREGAR CONFIGURAÇÕES OCR SEGURAS
      const { loadSafeOCRConfig } = await import('@/lib/ocr-config')
      const ocrConfig = loadSafeOCRConfig()
      console.log('✅ Usando configurações OCR seguras:', ocrConfig)
      
      /**
       * 🎯 GEMINI VISION - DETECÇÃO PADRÃO (SEM BORDAS AUTOMÁTICAS)
       * 
       * ⚡ MODO RÁPIDO:
       * - Detecção básica de campos para velocidade
       * - Sem análise de bordas automática (evita lentidão)
       * - Usuário pode usar Varinha Mágica depois para ajuste preciso
       * 
       * 🪄 VARINHA MÁGICA:
       * - Funcionalidade de bordas movida para dentro do canvas
       * - Usuário ensina com um campo → sistema ajusta todos
       * - Mais controle e precisão
       * 
       * 📚 DOCUMENTAÇÃO: docs/border-detection-system.md
       */
      console.log('🎯 USANDO GEMINI VISION - MODO RÁPIDO (Varinha Mágica disponível no canvas)')
      

      
      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!geminiKey) {
        throw new Error('Chave do Gemini não configurada')
      }

      const allDetectedFields: any[] = []
      
      for (let i = 0; i < pdfImages.length; i++) {
        const imageUrl = pdfImages[i]
        
        setOcrProgress(prev => ({ 
          ...prev, 
          stage: 'analyzing', 
          currentPage: i,
          fieldsDetected: allDetectedFields.length 
        }))
        
        console.log(`🔍 Analisando página ${i + 1}/${pdfImages.length} com Gemini Vision...`)
        
        // Converter URL para base64 se necessário
        let base64Image: string
        if (imageUrl.startsWith('data:')) {
          base64Image = imageUrl.split(',')[1]
        } else {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          base64Image = dataUrl.split(',')[1]
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Analise esta imagem de formulário PDF e identifique TODOS os campos de entrada de dados possíveis.

INSTRUÇÕES RÁPIDAS:
1. Procure por campos de entrada:
   - Caixas de texto vazias ou com bordas
   - Linhas para preenchimento manual (____)
   - Checkboxes (□) e radio buttons (○)
   - Campos de data, números, texto
   - Áreas de texto maiores

2. Para cada campo encontrado:
   - Posição aproximada (x, y em pixels)
   - Dimensões estimadas (width, height)
   - Tipo mais apropriado
   - Label/rótulo próximo ao campo

3. SEJA RÁPIDO mas COMPLETO:
   - Detecte o máximo de campos possível
   - Use estimativas razoáveis para posição/tamanho
   - Inclua campos mesmo que pequenos
   - Analise toda a imagem

RESPONDA APENAS com um array JSON válido no formato:
[
  {
    "type": "text|number|date|checkbox|select|textarea|signature",
    "label": "Nome do campo baseado no texto próximo",
    "x": 100,
    "y": 200,
    "width": 200,
    "height": 30,
    "confidence": 0.9
  }
]

IMPORTANTE: Retorne APENAS o JSON, sem explicações adicionais.`
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 4096,
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          const content = result.candidates?.[0]?.content?.parts?.[0]?.text

          if (content) {
            try {
              console.log(`🤖 Resposta Gemini Vision página ${i + 1}:`, content.substring(0, 200) + '...')
              
              const jsonMatch = content.match(/\[[\s\S]*\]/)
              if (jsonMatch) {
                const fields = JSON.parse(jsonMatch[0])
                
                console.log(`✅ Gemini Vision detectou ${fields.length} campos na página ${i + 1}`)
                
                fields.forEach((field: any, index: number) => {
                  const position = {
                    x: Math.max(0, field.x || 100),
                    y: Math.max(0, field.y || 100),
                    page: i
                  }
                  
                  // 🔒 USAR FUNÇÕES DE SEGURANÇA PARA EVITAR DUPLICATAS
                  const uniqueId = generateUniqueFieldId(field.label || `Campo ${index + 1}`, allDetectedFields, position, index)
                  const uniqueName = generateUniqueFieldName(field.label || `Campo ${index + 1}`, allDetectedFields, position, index)
                  
                  allDetectedFields.push({
                    id: uniqueId,
                    name: uniqueName,
                    type: field.type || 'text',
                    label: field.label || `Campo ${index + 1}`,
                    required: false,
                    position: {
                      x: position.x,
                      y: position.y,
                      width: Math.max(50, field.width || 200),
                      height: Math.max(20, field.height || 30),
                      page: i
                    }
                  })
                })
              }
            } catch (parseError) {
              console.warn(`❌ Erro ao parsear resposta do Gemini página ${i + 1}:`, parseError)
            }
          }
        }
      }
      
      // 🔒 VERIFICAÇÃO FINAL DE DUPLICATAS NO DESIGNER
      let finalFields = allDetectedFields
      if (allDetectedFields.length > 0) {
        const duplicates = detectDuplicateFields(allDetectedFields)
        
        if (duplicates.duplicateIds.length > 0 || duplicates.duplicateNames.length > 0) {
          console.warn(`⚠️ Designer: Detectados ${duplicates.duplicateIds.length} IDs duplicados`)
          console.log('🔧 Designer: Aplicando correção automática de duplicatas...')
          
          finalFields = fixDuplicateFields(allDetectedFields)
          console.log(`✅ Designer: Duplicatas corrigidas: ${allDetectedFields.length} → ${finalFields.length} campos`)
        }
      }
      
      const result = {
        success: finalFields.length > 0,
        detectedFields: finalFields,
        confidence: finalFields.length > 0 ? 0.9 : 0,
        message: `🎯 Gemini Vision detectou ${finalFields.length} campos únicos! Use a Varinha Mágica 🪄 para ajuste preciso.`
      }
      
      if (result.success) {
        // Converter campos do formato de detecção para o formato do designer
        const { convertFieldsFromDetection } = await import('@/lib/field-utils')
        const convertedFields = convertFieldsFromDetection(result.detectedFields)
        
        setFields(convertedFields)
        setHasUnsavedChanges(true)
        
        setOcrProgress(prev => ({ 
          ...prev, 
          stage: 'complete', 
          fieldsDetected: result.detectedFields.length 
        }))
        
        setTimeout(() => {
          setOcrProgress(prev => ({ ...prev, isProcessing: false }))
        }, 2000)
        
        const confidencePercent = Math.round(result.confidence * 100)
        
        showSuccess(
          '🎯 Detecção Rápida Concluída!', 
          `${result.detectedFields.length} campos detectados com ${confidencePercent}% de confiança. Use a Varinha Mágica 🪄 para ajuste preciso!`
        )
        
        console.log('✅ Reprocessamento OCR + Gemini concluído:', {
          campos: result.detectedFields.length,
          confianca: confidencePercent,
          mensagem: result.message
        })
      } else {
        throw new Error(result.message)
      }
      
    } catch (error) {
      console.error('❌ Erro ao reprocessar com OCR + Gemini:', error)
      showError('Erro no OCR + IA', `Não foi possível reprocessar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setOcrProgress(prev => ({ ...prev, isProcessing: false }))
    }
  }



  // Função addNewField movida para o FabricCanvas

  // Marcar como alterado quando campos mudarem
  const handleFieldsChange = async (updatedFields: FormField[]) => {
    // Verificar se houve mudança real
    const hasChanges = JSON.stringify(fields) !== JSON.stringify(updatedFields)
    if (!hasChanges) return
    
    // Adicionar ao histórico apenas se não estamos em modo undo/redo
    if (!historyManager.isInUndoRedoMode()) {
      historyManager.addAction(
        'move',
        'Campos movidos/redimensionados',
        fields,
        updatedFields
      )
    }
    
    setFields(updatedFields)
    setHasUnsavedChanges(true)
    
    // Salvar automaticamente no banco quando campos são movidos/redimensionados
    if (currentTemplateId) {
      // Usar debounce para evitar muitas chamadas durante arrastar
      clearTimeout(window.autoSaveTimeout)
      window.autoSaveTimeout = setTimeout(async () => {
        try {
          await saveFieldsToDatabase(updatedFields, 'Posições atualizadas pelo usuário')
          console.log('✅ Posições salvas automaticamente')
        } catch (error) {
          console.error('❌ Erro ao salvar posições automaticamente:', error)
        }
      }, 1000) // Salvar 1 segundo após parar de mover
    }
  }

  // Função para atualizar um campo individual (para alinhamento de conteúdo)
  const handleSingleFieldUpdate = async (updatedField: FormField) => {
    const beforeState = [...fields]
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    )
    
    // Adicionar ao histórico
    historyManager.addAction(
      'update',
      `Propriedade atualizada: ${updatedField.label || updatedField.name}`,
      beforeState,
      updatedFields,
      [updatedField.id]
    )
    
    setFields(updatedFields)
    setHasUnsavedChanges(true)
    
    // Atualizar o campo selecionado também
    if (selectedField && selectedField.id === updatedField.id) {
      setSelectedField(updatedField)
    }
    
    // Salvar automaticamente no banco
    if (currentTemplateId) {
      try {
        await saveFieldsToDatabase(updatedFields, `Propriedade atualizada: ${updatedField.label || updatedField.name}`)
        console.log('✅ Propriedade salva automaticamente')
      } catch (error) {
        console.error('❌ Erro ao salvar propriedade:', error)
      }
    }
  }

  // Função para desfazer ação
  const handleUndo = async () => {
    const result = historyManager.undo()
    
    if (result.success && result.fields) {
      console.log(`↶ ${result.description}`)
      setFields(result.fields)
      setHasUnsavedChanges(true)
      
      // Salvar no banco
      if (currentTemplateId) {
        try {
          await saveFieldsToDatabase(result.fields, result.description)
        } catch (error) {
          console.error('❌ Erro ao salvar undo:', error)
        }
      }
      
      showInfo('Ação Desfeita', result.description)
    } else {
      showWarning('Desfazer', result.description)
    }
  }

  // Função para refazer ação
  const handleRedo = async () => {
    const result = historyManager.redo()
    
    if (result.success && result.fields) {
      console.log(`↷ ${result.description}`)
      setFields(result.fields)
      setHasUnsavedChanges(true)
      
      // Salvar no banco
      if (currentTemplateId) {
        try {
          await saveFieldsToDatabase(result.fields, result.description)
        } catch (error) {
          console.error('❌ Erro ao salvar redo:', error)
        }
      }
      
      showInfo('Ação Refeita', result.description)
    } else {
      showWarning('Refazer', result.description)
    }
  }

  // Função para copiar campos
  const handleCopyFields = (fieldsToCopy: FormField[]) => {
    clipboard.copyMultiple(fieldsToCopy)
    setClipboardNotification({ type: 'copy', count: fieldsToCopy.length })
    showInfo('Campos Copiados', `${fieldsToCopy.length} campo(s) copiado(s) para o clipboard`)
  }

  // Função para colar campos
  const handlePasteFields = async (pastedFields: FormField[]) => {
    if (pastedFields.length === 0) {
      showWarning('Colar', 'Nenhum campo para colar')
      return
    }

    const beforeState = [...fields]
    const updatedFields = [...fields, ...pastedFields]
    
    // Adicionar ao histórico
    historyManager.addAction(
      'add',
      `${pastedFields.length} campo(s) colado(s)`,
      beforeState,
      updatedFields,
      pastedFields.map(f => f.id)
    )
    
    setFields(updatedFields)
    setHasUnsavedChanges(true)
    
    // Selecionar campos colados
    setSelectedFields(pastedFields)
    if (pastedFields.length === 1) {
      setSelectedField(pastedFields[0])
    }
    
    // Salvar no banco
    if (currentTemplateId) {
      try {
        await saveFieldsToDatabase(updatedFields, `${pastedFields.length} campo(s) colado(s)`)
      } catch (error) {
        console.error('❌ Erro ao salvar campos colados:', error)
      }
    }
    
    setClipboardNotification({ type: 'paste', count: pastedFields.length })
    showSuccess('Campos Colados', `${pastedFields.length} campo(s) adicionado(s) à página ${currentPage + 1}`)
  }

  // Função para duplicar campos
  const handleDuplicateFields = async (duplicatedFields: FormField[]) => {
    if (duplicatedFields.length === 0) {
      showWarning('Duplicar', 'Nenhum campo para duplicar')
      return
    }

    const beforeState = [...fields]
    const updatedFields = [...fields, ...duplicatedFields]
    
    // Adicionar ao histórico
    historyManager.addAction(
      'add',
      `${duplicatedFields.length} campo(s) duplicado(s)`,
      beforeState,
      updatedFields,
      duplicatedFields.map(f => f.id)
    )
    
    setFields(updatedFields)
    setHasUnsavedChanges(true)
    
    // Selecionar campos duplicados
    setSelectedFields(duplicatedFields)
    if (duplicatedFields.length === 1) {
      setSelectedField(duplicatedFields[0])
    }
    
    // Salvar no banco
    if (currentTemplateId) {
      try {
        await saveFieldsToDatabase(updatedFields, `${duplicatedFields.length} campo(s) duplicado(s)`)
      } catch (error) {
        console.error('❌ Erro ao salvar campos duplicados:', error)
      }
    }
    
    setClipboardNotification({ type: 'duplicate', count: duplicatedFields.length })
    showSuccess('Campos Duplicados', `${duplicatedFields.length} campo(s) duplicado(s) na página ${currentPage + 1}`)
  }

  // Função para atualizar campos com controles de precisão
  const handlePrecisionFieldsUpdate = async (updatedFields: FormField[]) => {
    const beforeState = [...fields]
    
    // Atualizar campos no estado
    const newFields = fields.map(field => {
      const updatedField = updatedFields.find(uf => uf.id === field.id)
      return updatedField || field
    })
    
    // Adicionar ao histórico
    historyManager.addAction(
      'update',
      `Ajuste de precisão em ${updatedFields.length} campo(s)`,
      beforeState,
      newFields,
      updatedFields.map(f => f.id)
    )
    
    setFields(newFields)
    setHasUnsavedChanges(true)
    
    // Atualizar seleção
    setSelectedFields(updatedFields)
    if (updatedFields.length === 1) {
      setSelectedField(updatedFields[0])
    }
    
    // Salvar no banco
    if (currentTemplateId) {
      try {
        await saveFieldsToDatabase(newFields, `Ajuste de precisão em ${updatedFields.length} campo(s)`)
      } catch (error) {
        console.error('❌ Erro ao salvar ajustes de precisão:', error)
      }
    }
  }

  // Função para corrigir nomes de campos existentes
  const fixExistingFieldNames = async () => {
    const { fixInvalidFieldNames, forceCorrectFieldNames } = await import('@/lib/field-utils')
    
    // FORÇAR correção para usar ID como name
    const forceCorrectedFields = forceCorrectFieldNames(fields)
    
    // Aplicar correção adicional
    const correctedFields = fixInvalidFieldNames(forceCorrectedFields)
    
    setFields(correctedFields)
    setHasUnsavedChanges(true)
    showSuccess('Campos Corrigidos', 'Nomes dos campos foram corrigidos para PostgreSQL')
  }

  // Trocar imagem de fundo mantendo os campos
  const handleChangeBackground = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && file.type === 'application/pdf') {
        await processNewBackground(file)
      }
    }
    input.click()
  }

  const processNewBackground = async (file: File) => {
    setIsLoading(true)
    setOcrProgress({ isProcessing: true, currentPage: 0, totalPages: 0, stage: 'converting', fieldsDetected: fields.length })
    
    try {
      console.log('🖼️ Processando nova imagem de fundo:', file.name)
      showInfo('Processando Nova Imagem', 'Convertendo PDF para imagem...')
      
      // Salvar campos atuais
      const currentFields = [...fields]
      
      // Usar o processador de PDF para converter apenas as imagens
      const { CompleteStorageProcessor } = await import('@/lib/complete-storage-processor')
      const processor = new CompleteStorageProcessor()
      
      setOcrProgress(prev => ({ ...prev, stage: 'ocr', totalPages: 1 }))
      
      const result = await processor.processFile(file, (stage, progress) => {
        setOcrProgress(prev => ({ 
          ...prev, 
          stage: stage.includes('Convertendo') ? 'converting' : 'ocr',
          progress,
          fieldsDetected: currentFields.length
        }))
      })
      
      if (result.success && result.imagePublicUrls && result.imagePublicUrls.length > 0) {
        // Atualizar apenas as imagens, manter os campos
        setPdfImages(result.imagePublicUrls)
        setPdfFile(file)
        
        // Restaurar campos existentes
        setFields(currentFields)
        
        setOcrProgress(prev => ({ ...prev, stage: 'complete', fieldsDetected: currentFields.length }))
        
        setTimeout(() => {
          setOcrProgress(prev => ({ ...prev, isProcessing: false }))
        }, 1000)
        
        showSuccess(
          'Imagem de Fundo Atualizada', 
          `Nova imagem carregada mantendo ${currentFields.length} campos existentes`
        )
        
        setHasUnsavedChanges(true)
        
      } else {
        throw new Error(result.message || 'Falha na conversão da imagem')
      }
      
    } catch (error) {
      console.error('❌ Erro ao trocar imagem de fundo:', error)
      showError('Erro ao Trocar Imagem', `Não foi possível processar a nova imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setOcrProgress(prev => ({ ...prev, isProcessing: false }))
    } finally {
      setIsLoading(false)
    }
  }

  // SALVAR - Salva no template atual ou abre dialog se for novo
  const handleSave = () => {
    if (currentTemplateId && templateName) {
      // Já tem um template salvo, apenas atualiza
      handleUpdateTemplate()
    } else {
      // Primeiro salvamento, abre dialog
      setShowSaveDialog(true)
    }
  }

  // SALVAR COMO - Sempre abre dialog para novo nome
  const handleSaveAs = () => {
    setShowSaveAsDialog(true)
  }

  // Salvar novo template (primeira vez)
  const handleSaveTemplate = async (name: string) => {
    if (!name.trim()) {
      showWarning('Nome obrigatório', 'Por favor, insira um nome para o modelo')
      return
    }

    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      // Verificar se já existe um template com esse nome
      const { data: existingTemplate, error: checkError } = await supabase
        .from('form_templates')
        .select('id, name')
        .eq('name', name.trim())
        .single()

      if (existingTemplate) {
        showError(
          'Nome já existe', 
          `Já existe um template chamado "${name}". Por favor, escolha um nome diferente.`
        )
        setSaveStatus('idle')
        setIsLoading(false)
        return
      }

      // Validar integridade das posições antes de salvar
      const { validateFieldPositions } = await import('@/lib/position-backup')
      
      if (!validateFieldPositions(fields)) {
        throw new Error('Posições dos campos estão corrompidas!')
      }
      
      const tableName = `form_${name.toLowerCase().replace(/\s+/g, '_')}`
      
      // Verificar se há contrato selecionado
      if (!selectedContract) {
        showError('Contrato Obrigatório', 'É necessário selecionar um contrato antes de salvar o template')
        setSaveStatus('idle')
        setIsLoading(false)
        setShowContractSelector(true)
        return
      }

      // Preparar dados para salvar - SIMPLIFICADO
      const templateData: any = {
        name: name.trim(),
        description: 'Formulário criado automaticamente',
        table_name: tableName,
        version: 1,
        is_active: true,
        contract_id: selectedContract.id,
        template_category: 'form',
        template_version: '1.0',
        is_template_active: true
      }

      // Adicionar campos obrigatórios
      if (fields && fields.length > 0) {
        templateData.fields = fields
      }

      // Adicionar imagens se existirem
      if (pdfImages && pdfImages.length > 0) {
        templateData.pdf_url = pdfImages[0]
        templateData.pdf_pages = pdfImages.length
        templateData.image_paths = pdfImages
      } else {
        templateData.pdf_url = 'placeholder_url'
        templateData.pdf_pages = 1
      }

      // Adicionar validações se existirem
      if (validationRules && validationRules.length > 0) {
        templateData.validationRules = validationRules
      }
      
      console.log('💾 Salvando template:', {
        name: templateData.name,
        fields: fields.length,
        images: pdfImages.length,
        validations: validationRules.length
      })
      
      const { data, error } = await supabase
        .from('form_templates')
        .insert(templateData)
        .select('id')
        .single()

      if (error) {
        console.error('❌ Erro ao salvar template:', error)
        // Verificar se é erro de nome duplicado
        if (error.message.includes('duplicate') || error.message.includes('unique') || error.code === '23505') {
          showError(
            'Nome já existe', 
            `Já existe um template chamado "${name}". Por favor, escolha um nome diferente.`
          )
        } else {
          showError('Erro ao salvar', `Erro: ${error.message}`)
        }
        setSaveStatus('error')
        setIsLoading(false)
        return
      }

      const newId = (data as any)?.id
      console.log('✅ Template salvo com ID:', newId)
      
      // Criar backup das posições após salvar
      const { createPositionBackup } = await import('@/lib/position-backup')
      await createPositionBackup(newId, name, fields)
      
      // 🔒 VERIFICAR E GARANTIR QUE VALIDAÇÕES FORAM SALVAS
      if (validationRules && validationRules.length > 0) {
        try {
          const { validationManager } = await import('@/lib/validation-conditional-manager')
          const loadedValidations = await validationManager.loadValidations(newId)
          
          if (loadedValidations.length !== validationRules.length) {
            console.warn(`⚠️ Inconsistência: salvou ${validationRules.length} validações mas carregou ${loadedValidations.length}`)
            // Tentar salvar novamente
            await validationManager.saveValidations(newId, validationRules)
            console.log('✅ Validações salvas novamente com sucesso')
          } else {
            console.log(`✅ ${validationRules.length} validação(ões) verificada(s) no banco`)
          }
        } catch (validationError) {
          console.error('❌ Erro ao verificar validações:', validationError)
        }
      }
      
      // Atualizar estado
      setCurrentTemplateId(newId)
      setTemplateName(name)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setShowSaveDialog(false)
      setShowSaveAsDialog(false)
      
      showSuccess('Modelo Salvo', `${name} foi salvo com ${fields.length} campos e ${validationRules.length} validação(ões) (posições protegidas)`)
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Erro ao salvar modelo:', error)
      showError('Erro ao salvar', 'Não foi possível salvar o modelo. Tente novamente.')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar template existente
  const handleUpdateTemplate = async () => {
    if (!currentTemplateId) return

    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      // Criar backup das posições antes de salvar
      const { createPositionBackup, validateFieldPositions } = await import('@/lib/position-backup')
      
      // Validar integridade das posições
      if (!validateFieldPositions(fields)) {
        throw new Error('Posições dos campos estão corrompidas!')
      }
      
      // Criar backup das posições
      await createPositionBackup(currentTemplateId, templateName, fields)
      
      // Verificar se há contrato selecionado
      if (!selectedContract) {
        showError('Contrato Obrigatório', 'É necessário selecionar um contrato antes de atualizar o template')
        setSaveStatus('idle')
        setIsLoading(false)
        setShowContractSelector(true)
        return
      }

      // @ts-ignore
      const { error } = await (supabase as any)
        .from('form_templates')
        .update({
          fields: fields,
          pdf_pages: pdfImages.length || 1,
          contract_id: selectedContract.id, // Atualizar contrato também
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTemplateId)

      if (error) {
        throw new Error(`Erro ao atualizar: ${error.message}`)
      }

      // 🔒 SALVAR VALIDAÇÕES CONDICIONAIS AUTOMATICAMENTE
      try {
        const { validationManager } = await import('@/lib/validation-conditional-manager')
        const validationsSaved = await validationManager.saveValidations(currentTemplateId, validationRules)
        
        if (validationsSaved) {
          console.log(`✅ ${validationRules.length} validação(ões) condicional(is) salva(s) automaticamente`)
        } else {
          console.warn('⚠️ Falha ao salvar validações condicionais')
        }
      } catch (validationError) {
        console.error('❌ Erro ao salvar validações condicionais:', validationError)
        // Não bloquear o salvamento do template por erro nas validações
      }

      console.log('✅ Template atualizado com backup de posições:', currentTemplateId)
      
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      
      showSuccess('Modelo Atualizado', `${templateName} foi atualizado com ${fields.length} campos e ${validationRules.length} validação(ões) (posições protegidas)`)
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error)
      showError('Erro ao atualizar', 'Não foi possível atualizar o modelo. Tente novamente.')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar como (duplicar com novo nome)
  const handleSaveAsTemplate = async (newName: string) => {
    if (!newName.trim()) {
      showWarning('Nome obrigatório', 'Por favor, insira um nome para o modelo')
      return
    }

    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      // Verificar se já existe um template com esse nome
      const { data: existingTemplate, error: checkError } = await supabase
        .from('form_templates')
        .select('id, name')
        .eq('name', newName.trim())
        .single()

      if (existingTemplate) {
        showError(
          'Nome já existe', 
          `Já existe um template chamado "${newName}". Por favor, escolha um nome diferente.`
        )
        setSaveStatus('idle')
        setIsLoading(false)
        return
      }

      const tableName = `form_${newName.toLowerCase().replace(/\s+/g, '_')}`
      
      // Verificar se há contrato selecionado
      if (!selectedContract) {
        showError('Contrato Obrigatório', 'É necessário selecionar um contrato antes de salvar o template')
        setSaveStatus('idle')
        setIsLoading(false)
        setShowContractSelector(true)
        return
      }

      // Preparar dados para salvar - SIMPLIFICADO
      const templateData: any = {
        name: newName.trim(),
        description: 'Formulário criado automaticamente',
        table_name: tableName,
        version: 1,
        is_active: true,
        contract_id: selectedContract.id,
        template_category: 'form',
        template_version: '1.0',
        is_template_active: true
      }

      // Adicionar campos obrigatórios
      if (fields && fields.length > 0) {
        templateData.fields = fields
      }

      // Adicionar imagens se existirem
      if (pdfImages && pdfImages.length > 0) {
        templateData.pdf_url = pdfImages[0]
        templateData.pdf_pages = pdfImages.length
        templateData.image_paths = pdfImages
      } else {
        templateData.pdf_url = 'placeholder_url'
        templateData.pdf_pages = 1
      }

      // Adicionar validações se existirem
      if (validationRules && validationRules.length > 0) {
        templateData.validationRules = validationRules
      }
      
      console.log('💾 Salvando como:', {
        name: templateData.name,
        fields: fields.length,
        images: pdfImages.length,
        validations: validationRules.length
      })
      
      const { data, error } = await supabase
        .from('form_templates')
        .insert(templateData as any)
        .select('id')
        .single()

      if (error) {
        // Verificar se é erro de nome duplicado
        if (error.message.includes('duplicate') || error.message.includes('unique') || error.code === '23505') {
          showError(
            'Nome já existe', 
            `Já existe um template chamado "${newName}". Por favor, escolha um nome diferente.`
          )
        } else {
          throw new Error(`Erro ao salvar: ${error.message}`)
        }
        return
      }

      const newId = (data as any)?.id
      console.log('✅ Template duplicado com ID:', newId)
      
      // 🔒 VERIFICAR E GARANTIR QUE VALIDAÇÕES FORAM SALVAS
      if (validationRules && validationRules.length > 0) {
        try {
          const { validationManager } = await import('@/lib/validation-conditional-manager')
          const loadedValidations = await validationManager.loadValidations(newId)
          
          if (loadedValidations.length !== validationRules.length) {
            console.warn(`⚠️ Inconsistência: salvou ${validationRules.length} validações mas carregou ${loadedValidations.length}`)
            // Tentar salvar novamente
            await validationManager.saveValidations(newId, validationRules)
            console.log('✅ Validações salvas novamente com sucesso')
          } else {
            console.log(`✅ ${validationRules.length} validação(ões) verificada(s) no banco`)
          }
        } catch (validationError) {
          console.error('❌ Erro ao verificar validações:', validationError)
        }
      }
      
      // Mudar para o novo template
      setCurrentTemplateId(newId)
      setTemplateName(newName)
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setShowSaveAsDialog(false)
      
      showSuccess('Modelo Duplicado', `${newName} foi criado com ${fields.length} campos e ${validationRules.length} validação(ões)`)
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Erro ao duplicar modelo:', error)
      showError('Erro ao duplicar', 'Não foi possível duplicar o modelo. Tente novamente.')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    // Salvar estado atual no localStorage para preview
    localStorage.setItem('preview_fields', JSON.stringify(fields))
    localStorage.setItem('preview_images', JSON.stringify(pdfImages))
    
    // Abrir preview em nova aba para não sair do canvas
    window.open('/preview', '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Atalhos de Teclado */}
      <KeyboardShortcuts
        onAddField={addNewField}
        onSave={() => setShowSaveDialog(true)}
        onPreview={handlePreview}
        onDeleteSelected={deleteSelectedField}
        selectedField={selectedField}
        onDuplicateSelected={duplicateSelectedField}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Primeira linha - Título e navegação */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <span>←</span>
                <span>Voltar</span>
              </button>
              <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-semibold text-gray-900">
                  Designer de Formulários
                  {templateName && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      - {templateName}
                      {hasUnsavedChanges && <span className="text-orange-600">*</span>}
                    </span>
                  )}
                  {selectedContract && (
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      • {selectedContract.contract_number}
                    </span>
                  )}
                </h1>
                <div className="text-xs text-gray-400 font-mono">
                  form_templates • file_uploads
                </div>
              </div>
            </div>
            
            {/* Botões de Salvar - sempre visíveis */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (!selectedContract) {
                    showWarning('Contrato Obrigatório', 'Selecione um contrato antes de salvar')
                    setShowContractSelector(true)
                    return
                  }
                  handleSave()
                }}
                className={`flex items-center space-x-2 transition-colors ${
                  saveStatus === 'saved' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : selectedContract 
                      ? 'btn-primary'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                } disabled:opacity-50`}
                disabled={isLoading || saveStatus === 'saving'}
                title={selectedContract ? "Salvar modelo (Ctrl+S)" : "Selecione um contrato primeiro"}
              >
                <Save className="h-4 w-4" />
                <span>
                  {saveStatus === 'saving' ? 'Salvando...' : 
                   saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (!selectedContract) {
                    showWarning('Contrato Obrigatório', 'Selecione um contrato antes de salvar')
                    setShowContractSelector(true)
                    return
                  }
                  handleSaveAs()
                }}
                className={`flex items-center space-x-2 ${
                  selectedContract ? 'btn-secondary' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={isLoading || saveStatus === 'saving' || !selectedContract}
                title={selectedContract ? "Salvar como novo modelo (Ctrl+Shift+S)" : "Selecione um contrato primeiro"}
              >
                <Plus className="h-4 w-4" />
                <span>Salvar Como</span>
              </button>
            </div>
          </div>

          {/* Segunda linha - Ferramentas organizadas em grupos */}
          <div className="flex items-center justify-start flex-wrap gap-3 lg:justify-between">
            {/* Grupo 0: Undo/Redo */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">Histórico:</span>
              <UndoRedoTools
                historyManager={historyManager}
                onUndo={handleUndo}
                onRedo={handleRedo}
                disabled={ocrProgress.isProcessing}
              />
            </div>

            {/* Grupo 0.5: Copiar/Colar/Duplicar */}
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-blue-600 font-medium">Edição:</span>
              <CopyPasteTools
                selectedFields={selectedField ? [selectedField] : selectedFields}
                allFields={fields}
                currentPage={currentPage}
                onCopy={handleCopyFields}
                onPaste={handlePasteFields}
                onDuplicate={handleDuplicateFields}
                disabled={ocrProgress.isProcessing}
              />
            </div>

            {/* Grupo 0.6: Controles de Precisão */}
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-purple-600 font-medium">Precisão:</span>
              <PrecisionToolbar
                selectedFields={selectedField ? [selectedField] : selectedFields}
                onFieldsUpdate={handlePrecisionFieldsUpdate}
                disabled={ocrProgress.isProcessing}
              />
              <PrecisionKeyboardHelp />
            </div>



            {/* Grupo 1: Visualização */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">Visualizar:</span>
              <button
                onClick={handlePreview}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title="👁️ Visualizar Formulário"
              >
                <Eye className="h-4 w-4" />
                <span>Ver</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'canvas' ? 'list' : 'canvas')}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title={viewMode === 'canvas' ? '📋 Modo Lista' : '🎨 Modo Canvas'}
              >
                {viewMode === 'canvas' ? <List className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
                <span>{viewMode === 'canvas' ? 'Lista' : 'Canvas'}</span>
              </button>
            </div>

            {/* 🆕 Grupo 1.5: Recursos Avançados */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-lg border-2 border-purple-200">
              <span className="text-xs text-purple-700 font-bold">Avançado:</span>
              
              {/* Botão Grid/Tabela */}
              <button
                onClick={() => setShowGridCreator(true)}
                className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg hover:from-teal-600 hover:to-cyan-600 text-sm font-medium shadow-md transition-all"
                title="📊 Criar Grid/Tabela - Define linhas, colunas e tipos automaticamente"
                disabled={ocrProgress.isProcessing}
              >
                <Grid className="h-4 w-4" />
                <span>Grid/Tabela</span>
              </button>

              {/* Botão Validações Condicionais */}
              <button
                onClick={() => setShowValidationBuilder(true)}
                className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg hover:from-purple-600 hover:to-indigo-600 text-sm font-medium shadow-md transition-all"
                title="⚡ Validações Condicionais - IF/ELSE/THEN para campos"
                disabled={ocrProgress.isProcessing}
              >
                <Zap className="h-4 w-4" />
                <span>Validações IF/ELSE</span>
                {validationRules.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white text-purple-600 rounded-full text-xs font-bold">
                    {validationRules.length}
                  </span>
                )}
              </button>
            </div>

            {/* Grupo 2: Ferramentas de Campo */}
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-blue-600 font-medium">Campos:</span>
              
              {/* Menu de Adicionar Campo */}
              <AddFieldMenu
                onAddField={(type) => addNewField(type)}
                disabled={ocrProgress.isProcessing}
              />
              
              <button
                onClick={handleReorganizeHiddenFields}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title="🔄 Reorganizar Campos Ocultos"
                disabled={ocrProgress.isProcessing}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reorganizar</span>
              </button>

              <button
                onClick={handleShowVisibilityReport}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title="📊 Relatório de Visibilidade"
                disabled={ocrProgress.isProcessing}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Ver Ocultos</span>
              </button>

              <button
                onClick={handleFixDuplicateIds}
                className="flex items-center space-x-1 btn-warning text-sm"
                title="🔧 Corrigir IDs Duplicados - Elimina campos espelhados que se selecionam juntos"
                disabled={ocrProgress.isProcessing}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Corrigir IDs</span>
              </button>

              <button
                onClick={handleRegenerateAllIds}
                className="flex items-center space-x-1 btn-danger text-sm"
                title="🔄 Regenerar TODOS os IDs - Cria IDs completamente novos para todos os campos, garantindo unicidade total"
                disabled={ocrProgress.isProcessing}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerar Todos</span>
              </button>

              {/* Botão Propriedades do Campo */}
              {selectedField && (
                <button
                  onClick={() => setShowFieldProperties(true)}
                  className="flex items-center space-x-1 btn-primary text-sm"
                  title="⚙️ Propriedades do Campo"
                  disabled={ocrProgress.isProcessing}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Propriedades</span>
                </button>
              )}
            </div>

            {/* Grupo 4: Alinhamento de Conteúdo */}
            {selectedField && (
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-purple-600 font-medium">Alinhamento:</span>
                <ContentAlignmentTools
                  selectedField={selectedField}
                  onUpdateField={handleSingleFieldUpdate}
                  disabled={ocrProgress.isProcessing}
                />
              </div>
            )}

            {/* Grupo 5: Formatação de Fonte */}
            {selectedField && (
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-orange-600 font-medium">Fonte:</span>
                <FontStyleTools
                  selectedField={selectedField}
                  onUpdateField={handleSingleFieldUpdate}
                  disabled={ocrProgress.isProcessing}
                />
              </div>
            )}

            {/* Grupo 3: Processamento */}
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-green-600 font-medium">Processar:</span>
              <button
                onClick={() => setShowOCRSettings(true)}
                className={`flex items-center space-x-1 btn-secondary text-sm relative ${
                  ocrConfigWarning ? 'border-yellow-400 bg-yellow-50' : ''
                }`}
                title={ocrConfigWarning ? '⚠️ ATENÇÃO: Configuração OCR alterada!' : '⚙️ Configurações OCR'}
              >
                <Settings className="h-4 w-4" />
                <span>OCR</span>
                {ocrConfigWarning && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </button>

              {pdfFile && (
                <button
                  onClick={reprocessWithOCR}
                  className="flex items-center space-x-1 btn-secondary text-sm"
                  title="🤖 Reprocessar com IA"
                  disabled={ocrProgress.isProcessing}
                >
                  <Zap className="h-4 w-4" />
                  <span>IA</span>
                </button>
              )}

              <button
                onClick={handleChangeBackground}
                className="flex items-center space-x-1 btn-secondary text-sm"
                disabled={isLoading}
                title="🖼️ Trocar Imagem de Fundo"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Trocar Fundo</span>
              </button>
            </div>

            {/* Grupo 4: Exportar e Configurações */}
            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-purple-600 font-medium">Sistema:</span>
              <button
                onClick={() => setShowExportDialog(true)}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title="📥 Exportar Formulário"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>

              <button
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-1 btn-secondary text-sm"
                title="🔧 Configurações Avançadas"
              >
                <Settings className="h-4 w-4" />
                <span>Config</span>
              </button>


            </div>
          </div>
        </div>
      </header>

      {/* Contract Selection */}
      {(showContractSelector || !selectedContract) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Seleção de Contrato Obrigatória
              </h3>
              <p className="text-blue-700 text-sm">
                Todos os templates devem estar vinculados a um contrato ativo. 
                Selecione o contrato ao qual este template pertencerá.
              </p>
            </div>
            
            <ContractSelector
              selectedContractId={selectedContract?.id}
              onSelect={(contract) => {
                setSelectedContract(contract)
                setShowContractSelector(false)
                setContractRequired(false)
                showSuccess('Contrato Selecionado', `Template será vinculado ao contrato ${contract.contract_number}`)
              }}
              onClear={() => {
                setSelectedContract(null)
                setContractRequired(true)
              }}
              required={true}
              className="max-w-2xl"
            />
            
            {selectedContract && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-blue-700">
                  ✅ Template será vinculado ao contrato <strong>{selectedContract.contract_number}</strong>
                </div>
                <button
                  onClick={() => setShowContractSelector(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Info Bar */}
      {selectedContract && !showContractSelector && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-blue-700">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Contrato: {selectedContract.contract_number} • {selectedContract.company_name}
                </span>
              </div>
              <button
                onClick={() => setShowContractSelector(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Alterar Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {saveStatus === 'saved' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <span className="text-sm font-medium">
                ✅ Modelo salvo com sucesso! Continue editando seus campos no canvas abaixo.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            {/* Configuração de Campos Esperados */}
            {pdfImages && pdfImages.length > 0 && (
              <ExpectedFieldsConfig
                totalPages={pdfImages.length}
                onConfigChange={setExpectedFieldsConfig}
                initialConfig={expectedFieldsConfig}
              />
            )}



            {viewMode === 'canvas' ? (
              <div className="bg-white rounded-lg shadow">
                {/* Debug das imagens */}
                <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b">
                  Debug: {pdfImages ? `${pdfImages.length} imagens` : 'Sem imagens'} | 
                  URLs: {pdfImages?.map((url, i) => `${i}: ${url.substring(0, 30)}...`).join(' | ')}
                </div>
                
                {pdfImages && pdfImages.length > 0 ? (
                  <NativeCanvas
                    pdfImages={pdfImages}
                    fields={fields}
                    onFieldsChange={handleFieldsChange}
                    onFieldSelect={handleFieldSelect}
                    selectedField={selectedField}
                    onOpenProperties={openFieldProperties}
                  />
                ) : (
                  <div className="p-8 text-center">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processando PDF com OCR...</p>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Canvas do Designer</h3>
                        <p className="text-gray-600 mb-4">
                          Faça upload de um PDF para começar a mapear campos
                        </p>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => router.push('/')}
                            className="btn-primary"
                          >
                            Fazer Upload de PDF
                          </button>
                          
                          {/* Botão para testar com imagem de exemplo */}
                          <button
                            onClick={() => {
                              // Criar uma imagem de teste A4 realística
                              const canvas = document.createElement('canvas')
                              canvas.width = 794
                              canvas.height = 1123
                              const ctx = canvas.getContext('2d')!
                              
                              // Fundo branco
                              ctx.fillStyle = '#ffffff'
                              ctx.fillRect(0, 0, canvas.width, canvas.height)
                              
                              // Borda do formulário
                              ctx.strokeStyle = '#000000'
                              ctx.lineWidth = 1
                              ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
                              
                              // Cabeçalho
                              ctx.fillStyle = '#000000'
                              ctx.font = 'bold 20px Arial'
                              ctx.textAlign = 'center'
                              ctx.fillText('RELATÓRIO DE INSPEÇÃO TÉCNICA', canvas.width / 2, 80)
                              
                              // Campos do formulário
                              ctx.font = '14px Arial'
                              ctx.textAlign = 'left'
                              
                              // Nome do Inspetor
                              ctx.fillText('Nome do Inspetor:', 50, 150)
                              ctx.strokeRect(200, 135, 300, 25)
                              
                              // Data
                              ctx.fillText('Data da Inspeção:', 50, 200)
                              ctx.strokeRect(200, 185, 150, 25)
                              
                              // Local
                              ctx.fillText('Local:', 400, 200)
                              ctx.strokeRect(450, 185, 200, 25)
                              
                              // Equipamento
                              ctx.fillText('Equipamento:', 50, 250)
                              ctx.strokeRect(200, 235, 400, 25)
                              
                              // Status (checkboxes)
                              ctx.fillText('Status:', 50, 300)
                              ctx.strokeRect(150, 285, 15, 15)
                              ctx.fillText('Aprovado', 175, 297)
                              ctx.strokeRect(270, 285, 15, 15)
                              ctx.fillText('Reprovado', 295, 297)
                              ctx.strokeRect(390, 285, 15, 15)
                              ctx.fillText('Pendente', 415, 297)
                              
                              // Observações
                              ctx.fillText('Observações:', 50, 350)
                              ctx.strokeRect(50, 360, 650, 100)
                              
                              // Assinatura
                              ctx.fillText('Assinatura do Inspetor:', 50, 500)
                              ctx.strokeRect(50, 510, 300, 50)
                              
                              const testImageUrl = canvas.toDataURL('image/png', 1.0)
                              setPdfImages([testImageUrl])
                              showInfo('Teste', 'Formulário de teste PNG carregado - Agora você pode posicionar campos!')
                            }}
                            className="btn-secondary"
                          >
                            🧪 Carregar Formulário PNG de Teste
                          </button>
                          
                          {/* Botão para testar conversão PDF */}
                          <button
                            onClick={async () => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = '.pdf'
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  try {
                                    showInfo('Teste', 'Testando conversão PDF para PNG...')
                                    const { CompleteStorageProcessor } = await import('@/lib/complete-storage-processor')
                                    const processor = new CompleteStorageProcessor()
                                    
                                    // Testar apenas a conversão
                                    const result = await processor.processFile(file, (stage, progress) => {
                                      console.log(`🔄 ${stage}: ${progress}%`)
                                    })
                                    
                                    if (result.success && result.imagePublicUrls.length > 0) {
                                      setPdfImages(result.imagePublicUrls)
                                      showSuccess('Teste', `PDF convertido em ${result.imagePublicUrls.length} imagens PNG!`)
                                    } else {
                                      showError('Teste', 'Falha na conversão PDF para PNG')
                                    }
                                  } catch (error) {
                                    console.error('Erro no teste:', error)
                                    showError('Teste', `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`)
                                  }
                                }
                              }
                              input.click()
                            }}
                            className="btn-secondary"
                          >
                            🔧 Testar Conversão PDF
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <SimpleFieldEditor
                fields={fields}
                onFieldsChange={handleFieldsChange}
                onFieldSelect={handleFieldSelect}
                selectedField={selectedField}
                currentPage={currentPage}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campos */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Campos ({fields.length})
                </h3>
              </div>
              
              {/* Indicador de Visibilidade */}
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <FieldVisibilityIndicator fields={fields} />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fields.map(field => {
                  const isSelected = selectedField?.id === field.id
                  const isInMultiSelection = selectedFields.some(f => f.id === field.id)
                  
                  return (
                    <div
                      key={field.id}
                      onClick={(e) => handleFieldSelection(field, e.ctrlKey || e.metaKey)}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-100 border border-primary-300'
                          : isInMultiSelection
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-sm">{field.label}</div>
                            {isInMultiSelection && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {field.type} • Página {(field.position?.page || 0) + 1}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-400">
                            {field.position?.width || 0}×{field.position?.height || 0}
                          </div>
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowFieldProperties(true)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Abrir Propriedades"
                            >
                              ⚙️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Painel de Seleção Múltipla */}
            {selectedFields.length > 0 && (
              <MultiSelectionPanel
                selectedFields={selectedFields}
                onClearSelection={clearMultiSelection}
              />
            )}

            {/* Ferramentas de Alinhamento */}
            {selectedFields.length > 0 && (
              <AlignmentTools
                selectedFields={selectedFields}
                onUpdateFields={handleMultipleFieldsUpdate}
                disabled={ocrProgress.isProcessing}
              />
            )}

            {/* 🆕 Snap to Grid */}
            {selectedFields.length > 0 && (
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Layout className="h-4 w-4 mr-2" />
                  Snap to Grid
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Tamanho da grade:</label>
                    <input
                      type="number"
                      value={gridSize}
                      onChange={(e) => setGridSize(parseInt(e.target.value) || 10)}
                      min="1"
                      max="50"
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </div>
                  <button
                    onClick={applySnapToGrid}
                    disabled={ocrProgress.isProcessing}
                    className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    Aplicar Snap to Grid
                  </button>
                  <p className="text-xs text-gray-500">
                    Alinha {selectedFields.length} campo(s) à grade de {gridSize}px
                  </p>
                </div>
              </div>
            )}

            {/* Controles de Precisão */}
            {(selectedField || selectedFields.length > 0) && (
              <PrecisionControls
                selectedFields={selectedField ? [selectedField] : selectedFields}
                onFieldsUpdate={handlePrecisionFieldsUpdate}
                disabled={ocrProgress.isProcessing}
              />
            )}

            {/* Indicador de Campos Duplicados */}
            <DuplicateFieldsIndicator
              fields={fields}
              onFixDuplicates={handleFixDuplicateIds}
              onRegenerateAll={handleRegenerateAllIds}
            />

            {/* Guia de Alinhamento */}
            <div className="card p-3">
              <AlignmentGuide />
            </div>

            {/* Estatísticas Avançadas */}
            <FieldStatistics 
              fields={fields} 
              currentPage={currentPage} 
              totalPages={pdfImages.length} 
            />

            {/* Atalhos de Teclado */}
            <KeyboardShortcutsHelp />
          </div>
        </div>
      </div>

      {/* Field Properties Modal */}
      {showFieldProperties && selectedField && (
        <FieldProperties
          field={selectedField}
          onFieldUpdate={handleFieldUpdate}
          onFieldDelete={handleFieldDelete}
          onFieldDuplicate={handleFieldDuplicate}
          allFields={fields}
          showSuccess={showSuccess}
          onClose={() => {
            console.log('🔒 Fechando painel de propriedades')
            setShowFieldProperties(false)
            // NÃO limpar selectedField para manter seleção
            // setSelectedField(null)
          }}
        />
      )}

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportDialog
          fields={fields}
          templateName={templateName || 'Formulário'}
          onClose={() => setShowExportDialog(false)}
        />
      )}



      {/* OCR Progress */}
      <OCRProgress {...ocrProgress} />

      {/* OCR Settings */}
      {showOCRSettings && (
        <OCRSettings
          onClose={() => setShowOCRSettings(false)}
          onApply={handleOCRConfigApply}
        />
      )}

      {/* 🆕 Grid Field Creator */}
      {showGridCreator && (
        <GridFieldCreator
          onCreateGrid={(gridFields, gridConfig) => {
            // Adicionar todos os campos do grid
            const newFields = [...fields, ...gridFields]
            setFields(newFields)
            setHasUnsavedChanges(true)
            setShowGridCreator(false)
            
            // Salvar automaticamente no banco
            if (currentTemplateId) {
              saveFieldsToDatabase(newFields, `Grid criado: ${gridConfig.name} (${gridConfig.rows}x${gridConfig.columns.length} = ${gridFields.length} campos)`)
            }
            
            showSuccess(
              'Grid Criado!', 
              `${gridFields.length} campos criados (${gridConfig.rows} linhas × ${gridConfig.columns.length} colunas)`
            )
          }}
          onClose={() => setShowGridCreator(false)}
          startPosition={{
            x: 100,
            y: 100 + (fields.length * 10), // Offset baseado em campos existentes
            page: currentPage
          }}
        />
      )}

      {/* 🆕 Validation Rule Builder */}
      {showValidationBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold">Validações Condicionais</h2>
                <p className="text-sm text-gray-600 mt-1">Configure regras IF/ELSE para validar campos automaticamente</p>
              </div>
              <button
                onClick={() => setShowValidationBuilder(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ValidationRuleBuilder
                fields={fields.map(f => ({
                  name: f.name,
                  label: f.label,
                  type: f.type
                }))}
                rules={validationRules}
                onChange={(rules) => setValidationRules(rules)}
              />
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {validationRules.length} regra(s) configurada(s)
              </div>
              <div className="flex space-x-3">
                {validationRules.length > 0 && (
                  <button
                    onClick={() => setShowValidationPreview(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Testar Validações</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    // 🔒 SALVAR VALIDAÇÕES NO BANCO AUTOMATICAMENTE
                    if (currentTemplateId) {
                      try {
                        const { validationManager } = await import('@/lib/validation-conditional-manager')
                        const saved = await validationManager.saveValidations(currentTemplateId, validationRules)
                        
                        if (saved) {
                          showSuccess('Validações Salvas', `${validationRules.length} regra(s) de validação salva(s) no banco de dados`)
                        } else {
                          showError('Erro ao Salvar', 'Não foi possível salvar as validações. Tente novamente.')
                        }
                      } catch (error) {
                        console.error('❌ Erro ao salvar validações:', error)
                        showError('Erro ao Salvar', 'Erro inesperado ao salvar validações')
                      }
                    } else {
                      showWarning('Template não salvo', 'Salve o template primeiro antes de configurar validações')
                    }
                    
                    setShowValidationBuilder(false)
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Validation Preview - Testar validações */}
      {showValidationPreview && (
        <ValidationPreview
          fields={fields}
          validationRules={validationRules}
          onClose={() => setShowValidationPreview(false)}
        />
      )}

      {/* Save Dialog - Primeiro salvamento */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Salvar Novo Modelo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Modelo
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Relatório de Solda"
                  className="input-field"
                  autoFocus
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Este modelo será salvo com {fields.length} campos e estará disponível para criar novas inspeções.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveTemplate(templateName)}
                disabled={isLoading || !templateName.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save As Dialog - Salvar como novo */}
      {showSaveAsDialog && (
        <SaveAsDialog 
          currentName={templateName}
          fieldsCount={fields.length}
          onSave={handleSaveAsTemplate}
          onCancel={() => setShowSaveAsDialog(false)}
          isLoading={isLoading}
        />
      )}

      {/* Template Edit Guide */}
      <TemplateEditGuide
        isOpen={showEditGuide}
        onClose={() => {
          setShowEditGuide(false)
          localStorage.setItem('hasSeenEditGuide', 'true')
        }}
      />

      {/* Visibility Report Modal */}
      <VisibilityReportModal
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        fields={fields}
        onReorganize={handleReorganizeHiddenFields}
      />

      {/* Atalhos de Alinhamento */}
      <AlignmentShortcuts
        selectedFields={selectedFields}
        onAlignLeft={alignLeft}
        onAlignRight={alignRight}
        onAlignCenter={alignCenter}
        onAlignTop={alignTop}
        onAlignBottom={alignBottom}
        onAlignMiddle={alignMiddle}
        onDistributeHorizontally={distributeHorizontally}
        onDistributeVertically={distributeVertically}
      />

      {/* Notificação de Clipboard */}
      {clipboardNotification && (
        <ClipboardNotification
          type={clipboardNotification.type}
          count={clipboardNotification.count}
          onClose={() => setClipboardNotification(null)}
        />
      )}
    </div>
  )
}

// Componente para o dialog "Salvar Como"
function SaveAsDialog({ 
  currentName, 
  fieldsCount, 
  onSave, 
  onCancel, 
  isLoading 
}: {
  currentName: string
  fieldsCount: number
  onSave: (name: string) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [newName, setNewName] = useState(currentName ? `${currentName} - Cópia` : '')
  const [isChecking, setIsChecking] = useState(false)
  const [nameExists, setNameExists] = useState(false)
  const [checkMessage, setCheckMessage] = useState('')

  // Verificar se o nome já existe
  const checkNameExists = async (name: string) => {
    if (!name.trim()) {
      setNameExists(false)
      setCheckMessage('')
      return
    }

    setIsChecking(true)
    try {
      const { data: existingTemplate } = await supabase
        .from('form_templates')
        .select('id, name')
        .eq('name', name.trim())
        .single()

      if (existingTemplate) {
        setNameExists(true)
        setCheckMessage(`❌ O nome "${name}" já está em uso. Escolha outro nome.`)
      } else {
        setNameExists(false)
        setCheckMessage(`✅ O nome "${name}" está disponível.`)
      }
    } catch (error) {
      // Se não encontrou, o nome está disponível
      setNameExists(false)
      setCheckMessage(`✅ O nome "${name}" está disponível.`)
    } finally {
      setIsChecking(false)
    }
  }

  // Verificar nome com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newName.trim()) {
        checkNameExists(newName.trim())
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [newName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && !nameExists && !isChecking) {
      onSave(newName.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Salvar Como Novo Modelo</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Novo Modelo
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Relatório de Solda - Versão 2"
              className={`input-field ${nameExists ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
                checkMessage.includes('✅') ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}`}
              autoFocus
            />
            
            {/* Feedback de validação */}
            {isChecking && (
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Verificando disponibilidade...
              </div>
            )}
            
            {checkMessage && !isChecking && (
              <div className={`mt-2 text-sm ${nameExists ? 'text-red-600' : 'text-green-600'}`}>
                {checkMessage}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Será criado um novo modelo com {fieldsCount} campos. O modelo atual permanecerá inalterado.</p>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !newName.trim() || nameExists || isChecking}
              className="btn-primary disabled:opacity-50"
              title={nameExists ? 'Nome já existe, escolha outro' : ''}
            >
              {isLoading ? 'Salvando...' : 
               isChecking ? 'Verificando...' :
               nameExists ? 'Nome já existe' :
               'Salvar Como'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}