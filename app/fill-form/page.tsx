'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormTemplate, FormField } from '@/lib/types'
import { ValidationRule } from '@/lib/types/validation-rules'
import { ValidationEngine } from '@/lib/validation-engine'
import { FileText, ArrowLeft, Save, Send, AlertCircle, CheckCircle, Info } from 'lucide-react'
import UnifiedFormView from '@/components/UnifiedFormView'
import ReportGenerator from '@/components/ReportGenerator'
import DynamicSelect from '@/components/DynamicSelect'

export default function FillFormPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [template, setTemplate] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<{[key: string]: any}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [validationMessages, setValidationMessages] = useState<Array<{id: string; message: string; type: string}>>([])
  const [canSubmit, setCanSubmit] = useState(true)
  const [fieldVisibility, setFieldVisibility] = useState<{[key: string]: boolean}>({})
  const [fieldRequired, setFieldRequired] = useState<{[key: string]: boolean}>({})
  const [fieldDisabled, setFieldDisabled] = useState<{[key: string]: boolean}>({})
  const [fieldColors, setFieldColors] = useState<{[key: string]: string}>({})
  const templateId = searchParams.get('template')
  const responseId = searchParams.get('response')

  // Recalcular campos calculados quando valores mudarem
  useEffect(() => {
    if (template?.fields && Array.isArray(template.fields)) {
      try {
        const { CalculatedFieldEngine } = require('@/lib/calculated-field-engine')
        const engine = CalculatedFieldEngine.getInstance()
        
        // Converter formData de field.id para field.name para o motor de cálculo
        const formDataByName: {[key: string]: any} = {}
        template.fields.forEach((field: FormField) => {
          if (field.id && field.name) {
            formDataByName[field.name] = formData[field.id]
          }
        })
        
        // Inicializar com todos os campos e valores atuais
        engine.initialize(template.fields, formDataByName)
        
        // Recalcular todos os campos calculados
        const updatedValuesByName = engine.recalculateAll()
        
        // Converter de volta para field.id
        const updatedValuesById: {[key: string]: any} = {}
        const calculatedFields = template.fields.filter(f => f.type === 'calculated')
        let hasUpdates = false
        
        calculatedFields.forEach(field => {
          if (field.name && updatedValuesByName[field.name] !== undefined) {
            updatedValuesById[field.id] = updatedValuesByName[field.name]
            if (updatedValuesByName[field.name] !== formData[field.id]) {
              hasUpdates = true
            }
          }
        })
        
        if (hasUpdates) {
          setFormData(prev => ({ ...prev, ...updatedValuesById }))
        }
      } catch (error) {
        console.error('❌ Erro ao recalcular campos:', error)
      }
    }
  }, [formData, template])

  // 🆕 Executar regras de validação quando valores mudarem
  useEffect(() => {
    if (!template || !Array.isArray(template.fields)) return

    // Verificar se o template tem regras de validação
    const validationRules = (template as any).validationRules as ValidationRule[] | undefined
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      
      // Converter formData de field.id para field.name
      const formDataByName: {[key: string]: any} = {}
      template.fields.forEach((field: FormField) => {
        if (field.id && field.name) {
          formDataByName[field.name] = formData[field.id]
        }
      })
      
      // Carregar regras e atualizar valores
      engine.loadRules(validationRules)
      engine.updateFieldValues(formDataByName)
      
      // Executar validações on_change e continuous
      const result = engine.execute('on_change', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação: ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (fieldName, value) => {
          // Encontrar field.id pelo field.name
          const field = template.fields.find(f => f.name === fieldName)
          if (field) {
            setFormData(prev => ({ ...prev, [field.id]: value }))
          }
        },
        onToggleFieldVisibility: (fieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [fieldName]: visible }))
        },
        onToggleFieldRequired: (fieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [fieldName]: required }))
        },
        onToggleFieldDisabled: (fieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [fieldName]: disabled }))
        },
        onChangeFieldColor: (fieldName, color) => {
          setFieldColors(prev => ({ ...prev, [fieldName]: color }))
        }
      })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações:', error)
    }
  }, [formData, template])

  useEffect(() => {
    if (templateId) {
      if (responseId) {
        setIsEditMode(true)
        loadExistingResponse(responseId)
      } else {
        loadTemplate(templateId)
      }
    } else {
      setIsLoading(false)
    }
  }, [templateId, responseId])

  const loadTemplate = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao carregar template:', error)
        return
      }

      setTemplate(data)
      
      // Carregar imagens do template
      if ((data as any).image_paths && Array.isArray((data as any).image_paths)) {
        console.log('🖼️ [FILL-FORM] Carregando imagens do template:', (data as any).image_paths)
        const imageUrls = await Promise.all(
          (data as any).image_paths.map(async (path: string) => {
            try {
              if (path.startsWith('http')) {
                console.log('✅ [FILL-FORM] Usando URL direta:', path)
                return path
              }
              const { data: urlData } = supabase.storage
                .from('processed-images')
                .getPublicUrl(path)
              console.log('✅ [FILL-FORM] URL construída:', urlData.publicUrl)
              return urlData.publicUrl
            } catch (error) {
              console.warn('⚠️ [FILL-FORM] Erro ao carregar imagem:', path, error)
              return null
            }
          })
        )
        const validImages = imageUrls.filter(url => url !== null) as string[]
        console.log(`📸 [FILL-FORM] Total de imagens carregadas: ${validImages.length}`)
        setPdfImages(validImages)
      } else {
        console.warn('⚠️ [FILL-FORM] Template sem image_paths ou não é array:', (data as any).image_paths)
      }
      
      // Inicializar formData com valores padrão ou vazios
      // 🔒 CRÍTICO: Usar field.id como chave para evitar perda de dados com nomes duplicados
      const initialData: {[key: string]: any} = {}
      if ((data as any).fields) {
        if (Array.isArray((data as any).fields)) {
          // Formato novo: array de campos
          (data as any).fields.forEach((field: FormField) => {
            if (field.id) {
              // 🆕 Usar defaultValue se existir, senão vazio
              initialData[field.id] = field.defaultValue ?? ''
            }
          })
        } else {
          // Formato antigo: objeto de campos
          Object.keys((data as any).fields).forEach(fieldName => {
            initialData[fieldName] = ''
          })
        }
      }
      setFormData(initialData)
      
      console.log('✅ Template carregado:', {
        name: (data as any).name,
        totalFields: Array.isArray((data as any).fields) ? (data as any).fields.length : Object.keys((data as any).fields || {}).length,
        fieldsInitialized: Object.keys(initialData).length,
        allFieldsPreserved: Array.isArray((data as any).fields) ? (data as any).fields.length === Object.keys(initialData).length : true
      })

      // 🆕 Executar validações on_load após carregar template
      const validationRules = (data as any).validationRules as ValidationRule[] | undefined
      if (validationRules && validationRules.length > 0) {
        try {
          const engine = ValidationEngine.getInstance()
          
          // Converter initialData de field.id para field.name
          const formDataByName: {[key: string]: any} = {}
          if (Array.isArray((data as any).fields)) {
            (data as any).fields.forEach((field: FormField) => {
              if (field.id && field.name) {
                formDataByName[field.name] = initialData[field.id]
              }
            })
          }
          
          engine.loadRules(validationRules)
          engine.updateFieldValues(formDataByName)
          
          // Executar validações on_load
          const result = engine.execute('on_load', {
            onShowMessage: (message, type) => {
              console.log(`📢 Validação (on_load): ${message} (${type})`)
            },
            onBlockSubmit: (blocked) => {
              setCanSubmit(!blocked)
            },
            onSetFieldValue: (targetFieldName, value) => {
              const field = (data as any).fields.find((f: FormField) => f.name === targetFieldName)
              if (field) {
                setFormData(prev => ({ ...prev, [field.id]: value }))
              }
            },
            onToggleFieldVisibility: (targetFieldName, visible) => {
              setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
            },
            onToggleFieldRequired: (targetFieldName, required) => {
              setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
            },
            onToggleFieldDisabled: (targetFieldName, disabled) => {
              setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
            },
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          })
          
          setValidationMessages(result.messages)
          
        } catch (error) {
          console.error('❌ Erro ao executar validações on_load:', error)
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingResponse = async (responseId: string) => {
    try {
      // Carregar a resposta existente
      const { data: responseData, error: responseError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('id', responseId)
        .single()

      if (responseError) {
        console.error('Erro ao carregar resposta:', responseError)
        return
      }

      setExistingResponse(responseData)

      // Carregar o template
      const { data: templateData, error: templateError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', (responseData as any).template_id)
        .single()

      if (templateError) {
        console.error('Erro ao carregar template:', templateError)
        return
      }

      setTemplate(templateData)
      
      // 🔒 Converter response_data de field.name para field.id
      const savedData = (responseData as any).response_data || {}
      const convertedData: {[key: string]: any} = {}
      
      if (Array.isArray((templateData as any).fields)) {
        (templateData as any).fields.forEach((field: FormField) => {
          if (field.id && field.name && savedData[field.name] !== undefined) {
            convertedData[field.id] = savedData[field.name]
          }
        })
      } else {
        Object.assign(convertedData, savedData)
      }
      
      setFormData(convertedData)
      
      // Carregar imagens do template
      let loadedImagesCount = 0
      if ((templateData as any).image_paths && Array.isArray((templateData as any).image_paths)) {
        console.log('🖼️ Carregando imagens do template:', (templateData as any).image_paths)
        const imageUrls = await Promise.all(
          (templateData as any).image_paths.map(async (path: string) => {
            try {
              if (path.startsWith('http')) {
                console.log('✅ Usando URL direta:', path)
                return path
              }
              const { data: urlData } = supabase.storage
                .from('processed-images')
                .getPublicUrl(path)
              console.log('✅ URL construída:', urlData.publicUrl)
              return urlData.publicUrl
            } catch (error) {
              console.warn('⚠️ Erro ao carregar imagem:', path, error)
              return null
            }
          })
        )
        const validImages = imageUrls.filter((url): url is string => url !== null)
        loadedImagesCount = validImages.length
        console.log(`📸 Total de imagens carregadas: ${loadedImagesCount}`)
        setPdfImages(validImages)
      } else {
        console.warn('⚠️ Template sem image_paths ou não é array:', (templateData as any).image_paths)
      }
      
      console.log('✅ Resposta carregada para edição:', {
        responseId,
        templateName: (templateData as any).name,
        totalFields: Array.isArray((templateData as any).fields) ? (templateData as any).fields.length : Object.keys((templateData as any).fields || {}).length,
        fieldsWithData: Object.keys((responseData as any).response_data || {}).length,
        imagesLoaded: loadedImagesCount
      })

      // 🆕 Executar validações on_load após carregar resposta para edição
      const validationRules = (templateData as any).validationRules as ValidationRule[] | undefined
      if (validationRules && validationRules.length > 0) {
        try {
          const engine = ValidationEngine.getInstance()
          
          // Converter convertedData de field.id para field.name
          const formDataByName: {[key: string]: any} = {}
          if (Array.isArray((templateData as any).fields)) {
            (templateData as any).fields.forEach((field: FormField) => {
              if (field.id && field.name) {
                formDataByName[field.name] = convertedData[field.id]
              }
            })
          }
          
          engine.loadRules(validationRules)
          engine.updateFieldValues(formDataByName)
          
          // Executar validações on_load
          const result = engine.execute('on_load', {
            onShowMessage: (message, type) => {
              console.log(`📢 Validação (on_load - edição): ${message} (${type})`)
            },
            onBlockSubmit: (blocked) => {
              setCanSubmit(!blocked)
            },
            onSetFieldValue: (targetFieldName, value) => {
              const field = (templateData as any).fields.find((f: FormField) => f.name === targetFieldName)
              if (field) {
                setFormData(prev => ({ ...prev, [field.id]: value }))
              }
            },
            onToggleFieldVisibility: (targetFieldName, visible) => {
              setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
            },
            onToggleFieldRequired: (targetFieldName, required) => {
              setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
            },
            onToggleFieldDisabled: (targetFieldName, disabled) => {
              setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
            },
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          })
          
          setValidationMessages(result.messages)
          
        } catch (error) {
          console.error('❌ Erro ao executar validações on_load na edição:', error)
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // 🆕 Handler para evento onBlur (ao sair do campo)
  const handleFieldBlur = (fieldName: string) => {
    if (!template || !Array.isArray(template.fields)) return

    const validationRules = (template as any).validationRules as ValidationRule[] | undefined
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      
      // Converter formData de field.id para field.name
      const formDataByName: {[key: string]: any} = {}
      template.fields.forEach((field: FormField) => {
        if (field.id && field.name) {
          formDataByName[field.name] = formData[field.id]
        }
      })
      
      engine.loadRules(validationRules)
      engine.updateFieldValues(formDataByName)
      
      // Executar validações on_blur
      const result = engine.execute('on_blur', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação (onBlur): ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (targetFieldName, value) => {
          const field = template.fields.find(f => f.name === targetFieldName)
          if (field) {
            setFormData(prev => ({ ...prev, [field.id]: value }))
          }
        },
        onToggleFieldVisibility: (targetFieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
        },
        onToggleFieldRequired: (targetFieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
        },
        onToggleFieldDisabled: (targetFieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
        },
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações onBlur:', error)
    }
  }

  // 🆕 Handler para evento onFocus (ao entrar no campo)
  const handleFieldFocus = (fieldName: string) => {
    if (!template || !Array.isArray(template.fields)) return

    const validationRules = (template as any).validationRules as ValidationRule[] | undefined
    if (!validationRules || validationRules.length === 0) return

    try {
      const engine = ValidationEngine.getInstance()
      
      // Converter formData de field.id para field.name
      const formDataByName: {[key: string]: any} = {}
      template.fields.forEach((field: FormField) => {
        if (field.id && field.name) {
          formDataByName[field.name] = formData[field.id]
        }
      })
      
      engine.loadRules(validationRules)
      engine.updateFieldValues(formDataByName)
      
      // Executar validações on_focus
      const result = engine.execute('on_focus', {
        onShowMessage: (message, type) => {
          console.log(`📢 Validação (onFocus): ${message} (${type})`)
        },
        onBlockSubmit: (blocked) => {
          setCanSubmit(!blocked)
        },
        onSetFieldValue: (targetFieldName, value) => {
          const field = template.fields.find(f => f.name === targetFieldName)
          if (field) {
            setFormData(prev => ({ ...prev, [field.id]: value }))
          }
        },
        onToggleFieldVisibility: (targetFieldName, visible) => {
          setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
        },
        onToggleFieldRequired: (targetFieldName, required) => {
          setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
        },
        onToggleFieldDisabled: (targetFieldName, disabled) => {
          setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
        },
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          })
      
      setValidationMessages(result.messages)
      setCanSubmit(result.isValid)
      
    } catch (error) {
      console.error('❌ Erro ao executar validações onFocus:', error)
    }
  }
  
  // 🔒 Criar mapeamento de field.name para field.id para compatibilidade com campos calculados
  const getFormDataByName = () => {
    if (!template?.fields || !Array.isArray(template.fields)) return formData
    
    const dataByName: {[key: string]: any} = {}
    template.fields.forEach((field: FormField) => {
      if (field.id && field.name) {
        dataByName[field.name] = formData[field.id]
      }
    })
    return dataByName
  }

  const handleSave = async (isDraft: boolean = true) => {
    if (!template) return

    // 🆕 Executar validações antes de salvar/submeter
    const validationRules = (template as any).validationRules as ValidationRule[] | undefined
    if (validationRules && validationRules.length > 0) {
      try {
        const engine = ValidationEngine.getInstance()
        
        // Converter formData de field.id para field.name
        const formDataByName: {[key: string]: any} = {}
        if (Array.isArray(template.fields)) {
          template.fields.forEach((field: FormField) => {
            if (field.id && field.name) {
              formDataByName[field.name] = formData[field.id]
            }
          })
        }
        
        engine.loadRules(validationRules)
        engine.updateFieldValues(formDataByName)
        
        // Executar validações on_submit (se não for rascunho) ou on_save (se for rascunho)
        const eventType = isDraft ? 'on_save' : 'on_submit'
        const result = engine.execute(eventType, {
          onShowMessage: (message, type) => {
            console.log(`📢 Validação (${eventType}): ${message} (${type})`)
            alert(`${type.toUpperCase()}: ${message}`)
          },
          onBlockSubmit: (blocked) => {
            setCanSubmit(!blocked)
          },
          onSetFieldValue: (targetFieldName, value) => {
            const field = template.fields.find((f: FormField) => f.name === targetFieldName)
            if (field) {
              setFormData(prev => ({ ...prev, [field.id]: value }))
            }
          },
          onToggleFieldVisibility: (targetFieldName, visible) => {
            setFieldVisibility(prev => ({ ...prev, [targetFieldName]: visible }))
          },
          onToggleFieldRequired: (targetFieldName, required) => {
            setFieldRequired(prev => ({ ...prev, [targetFieldName]: required }))
          },
          onToggleFieldDisabled: (targetFieldName, disabled) => {
            setFieldDisabled(prev => ({ ...prev, [targetFieldName]: disabled }))
          },
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          })
        
        // Se validação bloquear submit, não continuar
        if (!result.isValid && !isDraft) {
          console.warn('⚠️ Validação bloqueou o envio do formulário')
          alert('Não é possível enviar o formulário. Verifique os campos e tente novamente.')
          return
        }
        
      } catch (error) {
        console.error(`❌ Erro ao executar validações ${isDraft ? 'on_save' : 'on_submit'}:`, error)
      }
    }

    setIsSaving(true)
    try {
      // 🔒 Converter formData de field.id para field.name antes de salvar
      // Isso mantém compatibilidade com relatórios e garante que todos os campos sejam salvos
      const responseData: {[key: string]: any} = {}
      if (Array.isArray(template.fields)) {
        template.fields.forEach((field: FormField) => {
          if (field.id && field.name) {
            responseData[field.name] = formData[field.id]
          }
        })
      } else {
        // Formato antigo
        Object.assign(responseData, formData)
      }
      
      console.log('💾 Salvando resposta:', {
        totalFields: Array.isArray(template.fields) ? template.fields.length : Object.keys(template.fields || {}).length,
        fieldsSaved: Object.keys(responseData).length,
        allFieldsPreserved: Array.isArray(template.fields) ? template.fields.length === Object.keys(responseData).length : true
      })
      
      if (isEditMode && existingResponse) {
        // Atualizar resposta existente
        const { error } = await (supabase as any)
          .from('form_responses')
          .update({
            response_data: responseData,
            status: isDraft ? 'draft' : 'submitted',
            submitted_at: isDraft ? null : new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id)

        if (error) {
          console.error('Erro ao atualizar resposta:', error)
          alert('Erro ao salvar formulário')
          return
        }

        alert(isDraft ? 'Alterações salvas com sucesso!' : 'Formulário atualizado e enviado com sucesso!')
      } else {
        // Criar nova resposta - a herança de contract_id e company_id é automática via trigger
        const { data: newResponse, error } = await (supabase as any)
          .from('form_responses')
          .insert({
            template_id: template.id,
            response_data: responseData,
            status: isDraft ? 'draft' : 'submitted',
            submitted_at: isDraft ? null : new Date().toISOString()
          })
          .select(`
            *,
            template:form_templates(
              name,
              contract_id,
              contract:contracts(
                contract_number,
                company:companies(name, document)
              )
            )
          `)
          .single()

        if (error) {
          console.error('Erro ao salvar resposta:', error)
          alert('Erro ao salvar formulário')
          return
        }

        // Associar a resposta à versão atual da imagem de fundo
        if (newResponse) {
          try {
            const { TemplateBackgroundManager } = await import('@/lib/template-background-manager')
            const currentVersion = await TemplateBackgroundManager.getCurrentBackgroundVersion(template.id)
            
            if (currentVersion) {
              await TemplateBackgroundManager.associateResponseToBackgroundVersion(
                newResponse.id,
                currentVersion.id
              )
              console.log(`✅ Resposta associada à versão ${currentVersion.version_number} da imagem de fundo`)
            }
          } catch (error) {
            console.warn('⚠️ Erro ao associar resposta à versão da imagem:', error)
            // Não falhar o salvamento por causa disso
          }
        }

        // Mostrar mensagem com informações da hierarquia herdada
        const hierarchyInfo = newResponse?.template?.contract ? 
          `\n\nVinculado ao contrato: ${newResponse.template.contract.contract_number}\nEmpresa: ${newResponse.template.contract.company?.name}` : ''
        
        alert(isDraft ? 
          `Rascunho salvo com sucesso!${hierarchyInfo}` : 
          `Formulário enviado com sucesso!${hierarchyInfo}`
        )
      }
      
      if (!isDraft) {
        router.push('/templates')
      }
      
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      alert('Erro ao salvar formulário')
    } finally {
      setIsSaving(false)
    }
  }

  const renderField = (fieldName: string, fieldConfig: any) => {
    const { type, label, required, options } = fieldConfig
    const value = formData[fieldName] || ''

    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          >
            <option value="">Selecione uma opção</option>
            {options?.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'dynamic_list':
        return (
          <DynamicSelect
            fieldConfig={fieldConfig}
            value={value}
            onChange={(newValue) => handleInputChange(fieldName, newValue)}
            required={required}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {label}
            </label>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={required}
          />
        )
    }
  }

  // Renderização do componente
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Template não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            O template solicitado não existe ou foi removido.
          </p>
          <button
            onClick={() => router.push('/templates')}
            className="btn-primary"
          >
            Voltar aos Templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditMode ? 'Editar: ' : ''}{template.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {isEditMode 
                        ? 'Editando resposta existente' 
                        : (template.description || 'Preencha o formulário abaixo')
                      }
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    form_templates • form_responses
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🎯 COMPONENTE UNIFICADO - Substitui ~180 linhas de código duplicado */}
        <UnifiedFormView
          fields={template.fields && Array.isArray(template.fields) ? template.fields : []}
          formData={formData}
          pdfImages={pdfImages}
          mode="edit"
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
          onFocus={handleFieldFocus}
          showLabels={true}
          fieldColors={fieldColors}
          fieldVisibility={fieldVisibility}
          fieldRequired={fieldRequired}
          fieldDisabled={fieldDisabled}
        />

        {/* Validation Messages */}
          {validationMessages.length > 0 && (
            <div className="mt-6 space-y-2">
              {validationMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg ${
                    msg.type === 'error' ? 'bg-red-50 border border-red-200' :
                    msg.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    msg.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {msg.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  {msg.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                  {msg.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                  {msg.type === 'info' && <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      msg.type === 'error' ? 'text-red-800' :
                      msg.type === 'warning' ? 'text-yellow-800' :
                      msg.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowReportGenerator(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                title="📄 Gerar Relatório PDF com os dados preenchidos"
              >
                <FileText className="h-4 w-4" />
                <span>Gerar Relatório</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Rascunho</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving || !canSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canSubmit ? 'Corrija os erros de validação antes de enviar' : ''}
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Formulário</span>
                </button>
                
                {!canSubmit && (
                  <span className="text-sm text-red-600 font-medium">
                    ⚠️ Corrija os erros antes de enviar
                  </span>
                )}
              </div>
            </div>
        </main>

      {/* Report Generator */}
      {showReportGenerator && template && (
        <ReportGenerator
          fields={Array.isArray(template.fields) ? template.fields : Object.entries(template.fields || {}).map(([name, config]: [string, any]) => ({
            id: name,
            name: name,
            type: config.type || 'text',
            label: config.label || name,
            required: config.required || false,
            position: config.position || { x: 0, y: 0, width: 200, height: 35, page: 0 },
            options: config.options,
            placeholder: config.placeholder,
            helpText: config.helpText,
            validation: config.validation,
            // ✅ INCLUIR PROPRIEDADES DE ALINHAMENTO E FONTE
            alignment: config.alignment || { horizontal: 'left', vertical: 'middle' },
            fontStyle: config.fontStyle || { 
              family: 'Arial', 
              size: 12, 
              weight: 'normal', 
              style: 'normal', 
              decoration: 'none', 
              color: '#000000' 
            },
            calculatedConfig: config.calculatedConfig,
            dynamicConfig: config.dynamicConfig
          }))}
          templateImages={(template as any).image_paths || []}
          templateName={template.name}
          templateId={template.id}
          responseId={existingResponse?.id}
          initialData={formData}
          onClose={() => setShowReportGenerator(false)}
        />
      )}
    </div>
  )
}