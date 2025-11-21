'use client'

import { FormField } from '@/lib/types'
import DynamicSelect from './DynamicSelect'

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  onBlur?: () => void  // 🆕 Evento ao sair do campo
  onFocus?: () => void // 🆕 Evento ao entrar no campo
  showLabel?: boolean
  labelPosition?: 'top' | 'left' | 'floating'
  className?: string
  allFields?: FormField[] // Para campos calculados
  allValues?: {[key: string]: any} // Para campos calculados
  fieldColor?: string // 🆕 Cor do campo (validação condicional)
  isRequired?: boolean // 🆕 Campo obrigatório (validação condicional)
  isDisabled?: boolean // 🆕 Campo desabilitado (validação condicional)
}

export default function FormFieldRenderer({ 
  field, 
  value, 
  onChange,
  onBlur,
  onFocus,
  showLabel = true,
  labelPosition = 'top',
  className = '',
  allFields = [],
  allValues = {},
  fieldColor,
  isRequired,
  isDisabled
}: FormFieldRendererProps) {
  
  // Função para calcular valor de campo calculado
  const calculateFieldValue = (field: FormField, currentValue: any): string => {
    if (field.type !== 'calculated' || !field.calculatedConfig) {
      return currentValue || ''
    }

    try {
      // Importar o motor de cálculo
      const { CalculatedFieldEngine } = require('@/lib/calculated-field-engine')
      const engine = CalculatedFieldEngine.getInstance()
      
      // Inicializar com todos os campos e valores atuais
      engine.initialize(allFields, allValues)
      
      // Calcular valor
      const calculatedValue = engine.getCalculatedValue(field.name)
      
      if (calculatedValue !== null) {
        // Formatar o valor baseado na configuração
        return engine.formatValue(calculatedValue, field.calculatedConfig)
      } else {
        return '0'
      }
    } catch (error) {
      console.error('❌ Erro ao calcular campo:', error)
      return 'Erro no cálculo'
    }
  }
  
  const renderLabel = () => {
    if (!showLabel) return null
    
    const labelClasses = {
      top: 'block text-sm font-medium text-gray-700 mb-2',
      left: 'inline-block text-sm font-medium text-gray-700 mr-3 min-w-[120px]',
      floating: 'absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-gray-700'
    }
    
    const effectiveRequired = isRequired ?? field.required
    
    return (
      <label className={labelClasses[labelPosition]}>
        {field.label}
        {effectiveRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
    )
  }

  const getAlignmentClasses = () => {
    const alignment = field.alignment || { horizontal: 'left', vertical: 'middle' }
    
    const horizontalClasses = {
      left: 'text-left',
      center: 'text-center', 
      right: 'text-right'
    }
    
    const verticalClasses = {
      top: 'items-start',
      middle: 'items-center',
      bottom: 'items-end'
    }
    
    return `${horizontalClasses[alignment.horizontal]} ${verticalClasses[alignment.vertical]}`
  }

  const getFontStyles = () => {
    const fontStyle = field.fontStyle
    if (!fontStyle) return {}
    
    return {
      fontFamily: fontStyle.family || 'Arial',
      fontSize: `${fontStyle.size || 12}px`,
      fontWeight: fontStyle.weight || 'normal',
      fontStyle: fontStyle.style || 'normal',
      textDecoration: fontStyle.decoration || 'none',
      color: fontStyle.color || '#000000'
    }
  }

  // 🆕 Aplicar estilos de validação condicional
  const getValidationStyles = () => {
    const styles: React.CSSProperties = {}
    
    if (fieldColor) {
      styles.backgroundColor = fieldColor
      styles.borderColor = fieldColor
    }
    
    return styles
  }

  const renderInput = () => {
    const alignmentClasses = getAlignmentClasses()
    const fontStyles = getFontStyles()
    const validationStyles = getValidationStyles()
    const combinedStyles = { ...fontStyles, ...validationStyles }
    const baseClasses = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${alignmentClasses}`
    const effectiveRequired = isRequired ?? field.required
    const effectiveDisabled = isDisabled ?? false
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            className={baseClasses}
            style={combinedStyles}
            required={effectiveRequired}
            disabled={effectiveDisabled}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={field.placeholder || '0'}
            className={baseClasses}
            style={combinedStyles}
            required={effectiveRequired}
            disabled={effectiveDisabled}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'calculated':
        // Campo calculado é somente leitura
        const calculatedValue = calculateFieldValue(field, value)
        return (
          <input
            type="text"
            value={calculatedValue}
            readOnly
            className={`${baseClasses} bg-gray-50 cursor-not-allowed`}
            style={combinedStyles}
            title="Campo calculado automaticamente"
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            className={baseClasses}
            style={combinedStyles}
            required={effectiveRequired}
            disabled={effectiveDisabled}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            rows={4}
            className={baseClasses}
            style={combinedStyles}
            required={effectiveRequired}
            disabled={effectiveDisabled}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            className={baseClasses}
            style={combinedStyles}
            required={effectiveRequired}
            disabled={effectiveDisabled}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'dynamic_list':
        return (
          <DynamicSelect
            fieldConfig={field}
            value={value}
            onChange={onChange}
            required={effectiveRequired}
            disabled={effectiveDisabled}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center" style={validationStyles}>
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              onFocus={onFocus}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required={effectiveRequired}
              disabled={effectiveDisabled}
            />
            {!showLabel && (
              <label className="ml-2 text-sm text-gray-700">
                {field.label}
                {effectiveRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        )

      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <p className="mt-2 text-sm">Clique para assinar</p>
            </div>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            className={baseClasses}
            required={field.required}
          />
        )
    }
  }

  const containerClasses = {
    top: 'space-y-1',
    left: 'flex items-center space-x-3',
    floating: 'relative'
  }

  return (
    <div className={`${containerClasses[labelPosition]} ${className}`}>
      {labelPosition !== 'floating' && renderLabel()}
      <div className="relative flex-1">
        {labelPosition === 'floating' && renderLabel()}
        {renderInput()}
        {field.helpText && (
          <p className="mt-1 text-xs text-gray-500">
            {field.helpText}
          </p>
        )}
      </div>
    </div>
  )
}