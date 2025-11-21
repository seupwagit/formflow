'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PDFCanvas from '@/components/PDFCanvas'
import FormFieldRenderer from '@/components/FormFieldRenderer'
import { FormField } from '@/lib/types'
import { ArrowLeft, Play } from 'lucide-react'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [fields, setFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState<'canvas' | 'form'>('form')

  useEffect(() => {
    // Carregar campos do localStorage (vindo do designer) ou da URL (template existente)
    const templateId = searchParams.get('template')
    
    if (templateId) {
      // Carregar template existente
      loadTemplate(templateId)
    } else {
      // Carregar do localStorage (preview do designer)
      const savedFields = localStorage.getItem('preview_fields')
      if (savedFields) {
        setFields(JSON.parse(savedFields))
      }
    }
  }, [searchParams])

  const loadTemplate = async (templateId: string) => {
    // Em uma implementação real, carregaria do Supabase
    // Por enquanto, usar dados mock
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
        position: { x: 220, y: 195, width: 100, height: 25, page: 0 }
      }
    ]
    setFields(mockFields)
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    
    const labelStyle = {
      position: 'absolute' as const,
      left: field.position.x,
      top: field.position.y - 20, // Label acima do campo
      fontSize: '12px',
      fontWeight: '500' as const,
      color: '#374151',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '2px 4px',
      borderRadius: '2px',
      whiteSpace: 'nowrap' as const,
      zIndex: 10
    }
    
    const baseStyle = {
      position: 'absolute' as const,
      left: field.position.x,
      top: field.position.y,
      width: field.position.width,
      height: field.position.height,
      fontSize: '14px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '4px 8px',
      backgroundColor: 'white',
      zIndex: 5
    }

    const renderLabel = () => (
      <div key={`${field.id}-label`} style={labelStyle}>
        {field.label}
        {field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </div>
    )

    switch (field.type) {
      case 'text':
      case 'number':
        return [
          renderLabel(),
          <input
            key={field.id}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}`}
            required={field.required}
            style={baseStyle}
          />
        ]
      
      case 'date':
        return [
          renderLabel(),
          <input
            key={field.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            style={baseStyle}
          />
        ]
      
      case 'textarea':
        return [
          renderLabel(),
          <textarea
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}`}
            required={field.required}
            style={{
              ...baseStyle,
              resize: 'none' as const,
              height: Math.max(field.position.height, 60)
            }}
          />
        ]
      
      case 'select':
        return [
          renderLabel(),
          <select
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            style={baseStyle}
          >
            <option value="">Selecione...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ]
      
      case 'checkbox':
        return (
          <label
            key={field.id}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </span>
          </label>
        )
      
      default:
        return null
    }
  }

  const handleSubmit = () => {
    // Validar campos obrigatórios
    const requiredFields = fields.filter(f => f.required)
    const missingFields = requiredFields.filter(f => !formData[f.id])
    
    if (missingFields.length > 0) {
      alert(`Campos obrigatórios não preenchidos: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    // Salvar dados
    console.log('Dados do formulário:', formData)
    alert('Formulário salvo com sucesso!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Visualização do Formulário
                </h1>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                form_templates • preview
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('form')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'form' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Formulário
              </button>
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'canvas' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🎨 Canvas
              </button>
            </div>
            
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 btn-primary"
            >
              <Play className="h-4 w-4" />
              <span>Salvar Inspeção</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Formulário Interativo
            </h2>
            <p className="text-sm text-gray-600">
              Preencha os campos abaixo para completar a inspeção
            </p>
          </div>
          
          <div className="relative overflow-auto" style={{ height: '600px' }}>
            {viewMode === 'form' ? (
              /* Modo Formulário - Com labels visíveis */
              <div className="max-w-2xl mx-auto p-6 space-y-6">
                {fields.map(field => (
                  <FormFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    showLabel={true}
                    labelPosition="top"
                  />
                ))}
              </div>
            ) : (
              /* Modo Canvas - Campos sobre o PDF */
              <div 
                className="relative bg-gray-100 mx-auto"
                style={{ 
                  width: '800px', 
                  height: '1000px',
                  backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {/* Simular conteúdo do PDF */}
                <div className="absolute inset-0 bg-white m-4 p-8 shadow-sm">
                  <h1 className="text-xl font-bold mb-6">RELATÓRIO DE INSPEÇÃO</h1>
                  <div className="space-y-8">
                    <div>Nome do Inspetor: ________________</div>
                    <div>Data da Inspeção: ________________</div>
                    <div>Temperatura (°C): ________________</div>
                  </div>
                </div>
                
                {/* Campos interativos */}
                {fields.map(renderField)}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {fields.length} campos • {Object.keys(formData).length} preenchidos
              </span>
              <span>
                Campos obrigatórios: {fields.filter(f => f.required).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}