'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, CheckCircle, AlertCircle, Eye, HelpCircle } from 'lucide-react'
import { FormField } from '@/lib/types'
import { CalculatedFieldEngine } from '@/lib/calculated-field-engine'

interface CalculatedFieldConfigProps {
  field: FormField
  allFields: FormField[]
  currentValues: Record<string, any>
  onUpdate: (updates: Partial<FormField>) => void
  onClose: () => void
}

export default function CalculatedFieldConfig({
  field,
  allFields,
  currentValues,
  onUpdate,
  onClose
}: CalculatedFieldConfigProps) {
  // Estados para configuração de cálculo
  const [formula, setFormula] = useState(field.calculatedConfig?.formula || '')
  const [formatType, setFormatType] = useState(field.calculatedConfig?.formatType || 'number')
  const [decimalPlaces, setDecimalPlaces] = useState(field.calculatedConfig?.decimalPlaces || 2)
  const [prefix, setPrefix] = useState(field.calculatedConfig?.prefix || '')
  const [suffix, setSuffix] = useState(field.calculatedConfig?.suffix || '')
  const [customFormat, setCustomFormat] = useState(field.calculatedConfig?.customFormat || '')
  
  // Estados para propriedades básicas do campo
  const [label, setLabel] = useState(field.label || '')
  const [placeholder, setPlaceholder] = useState(field.placeholder || '')
  const [helpText, setHelpText] = useState(field.helpText || '')
  const [required, setRequired] = useState(field.required || false)
  
  // Estados para alinhamento
  const [alignment, setAlignment] = useState(field.alignment || { 
    horizontal: 'left' as const, 
    vertical: 'middle' as const 
  })
  
  // Estados para estilo de fonte
  const [fontStyle, setFontStyle] = useState(field.fontStyle || {
    family: 'Arial' as const,
    size: 12,
    weight: 'normal' as const,
    style: 'normal' as const,
    decoration: 'none' as const,
    color: '#000000'
  })

  const [validation, setValidation] = useState<{
    isValid: boolean
    errors: string[]
    dependencies: string[]
  }>({ isValid: false, errors: [], dependencies: [] })

  const [previewValue, setPreviewValue] = useState<string>('0')
  const [showExamples, setShowExamples] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'calculation' | 'properties' | 'style'>('calculation')

  // Validar fórmula e calcular preview
  useEffect(() => {
    if (formula.trim()) {
      const engine = CalculatedFieldEngine.getInstance()
      const result = engine.validateFormula(formula, allFields)
      setValidation(result)

      // Calcular preview
      if (result.isValid) {
        try {
          // Criar engine temporário para preview
          const tempEngine = CalculatedFieldEngine.getInstance()
          const tempField: FormField = {
            ...field,
            calculatedConfig: {
              formula,
              dependencies: result.dependencies,
              formatType,
              decimalPlaces,
              prefix,
              suffix,
              customFormat
            }
          }
          
          tempEngine.initialize([...allFields, tempField], currentValues)
          const calculatedValue = tempEngine.getCalculatedValue(field.name)
          
          if (calculatedValue !== null) {
            const formatted = tempEngine.formatValue(calculatedValue, tempField.calculatedConfig)
            setPreviewValue(formatted)
          } else {
            setPreviewValue('0')
          }
        } catch (error) {
          setPreviewValue('Erro no cálculo')
        }
      } else {
        setPreviewValue('Fórmula inválida')
      }
    } else {
      setValidation({ isValid: false, errors: ['Fórmula é obrigatória'], dependencies: [] })
      setPreviewValue('Fórmula obrigatória')
    }
  }, [formula, allFields, currentValues, formatType, decimalPlaces, prefix, suffix, customFormat])

  // Função para salvar as configurações
  const handleSave = () => {
    console.log('🔄 CalculatedFieldConfig: handleSave chamado')
    console.log('📊 Validação:', validation)
    
    if (!validation.isValid) {
      console.warn('⚠️ Fórmula inválida, não salvando')
      return
    }

    console.log('💾 Iniciando salvamento...')
    setIsSaving(true)

    const calculatedConfig = {
      formula,
      dependencies: validation.dependencies,
      formatType,
      decimalPlaces,
      prefix,
      suffix,
      customFormat
    }

    const updateData = {
      label,
      placeholder,
      helpText,
      required,
      alignment,
      fontStyle,
      calculatedConfig
    }

    console.log('📦 Dados para salvar:', updateData)

    // Pequeno delay para mostrar o feedback
    setTimeout(() => {
      console.log('🚀 Chamando onUpdate...')
      onUpdate(updateData)

      setIsSaving(false)
      setSaveSuccess(true)
      console.log('✅ Salvamento concluído com sucesso!')

      // Mostrar sucesso por 2 segundos, mas não fechar automaticamente
      setTimeout(() => {
        setSaveSuccess(false)
        console.log('🔄 Estado de sucesso resetado')
        // Não fechar automaticamente - deixar o usuário decidir
      }, 2000)
    }, 500)
  }

  const insertField = (fieldName: string) => {
    const cursorPos = (document.getElementById('formula-input') as HTMLTextAreaElement)?.selectionStart || formula.length
    const newFormula = formula.slice(0, cursorPos) + `{${fieldName}}` + formula.slice(cursorPos)
    setFormula(newFormula)
    
    // Focar no textarea após inserir
    setTimeout(() => {
      const textarea = document.getElementById('formula-input') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(cursorPos + fieldName.length + 2, cursorPos + fieldName.length + 2)
      }
    }, 10)
  }

  const insertOperator = (operator: string) => {
    const cursorPos = (document.getElementById('formula-input') as HTMLTextAreaElement)?.selectionStart || formula.length
    const newFormula = formula.slice(0, cursorPos) + ` ${operator} ` + formula.slice(cursorPos)
    setFormula(newFormula)
    
    // Focar no textarea após inserir
    setTimeout(() => {
      const textarea = document.getElementById('formula-input') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(cursorPos + operator.length + 2, cursorPos + operator.length + 2)
      }
    }, 10)
  }

  const insertFunction = (functionName: string, syntax: string) => {
    const cursorPos = (document.getElementById('formula-input') as HTMLTextAreaElement)?.selectionStart || formula.length
    
    // Extrair a parte da função (ex: "ABS(número)" -> "ABS()")
    const funcPart = syntax.split('(')[0] + '()'
    const newFormula = formula.slice(0, cursorPos) + funcPart + formula.slice(cursorPos)
    setFormula(newFormula)
    
    // Focar no textarea e posicionar cursor dentro dos parênteses
    setTimeout(() => {
      const textarea = document.getElementById('formula-input') as HTMLTextAreaElement
      if (textarea) {
        textarea.focus()
        const newCursorPos = cursorPos + funcPart.length - 1 // Posicionar dentro dos parênteses
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 10)
  }

  // Funções para lidar com mudanças de propriedades
  const handleAlignmentChange = (
    type: 'horizontal' | 'vertical', 
    value: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ) => {
    setAlignment(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleFontStyleChange = (property: string, value: any) => {
    setFontStyle(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const examples = CalculatedFieldEngine.getFormulaExamples()
  const mathFunctions = CalculatedFieldEngine.getMathFunctions()

  // Componente para paleta de funções
  const FunctionPalette = ({ onInsertFunction }: { onInsertFunction: (name: string, syntax: string) => void }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('basic')
    const [showFunctions, setShowFunctions] = useState(false)

    const categories = [
      { id: 'basic', name: 'Básicas', icon: '🧮' },
      { id: 'trigonometry', name: 'Trigonometria', icon: '📐' },
      { id: 'logarithmic', name: 'Logarítmicas', icon: '📊' },
      { id: 'rounding', name: 'Arredondamento', icon: '🔢' },
      { id: 'statistical', name: 'Estatísticas', icon: '📈' },
      { id: 'logical', name: 'Lógicas', icon: '🤔' }
    ]

    const filteredFunctions = mathFunctions.filter(func => func.category === selectedCategory)

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Funções Matemáticas</span>
          <button
            onClick={() => setShowFunctions(!showFunctions)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showFunctions ? 'Ocultar' : 'Mostrar'} ({mathFunctions.length} funções)
          </button>
        </div>

        {showFunctions && (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            {/* Categorias */}
            <div className="flex flex-wrap gap-1 mb-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Funções da categoria selecionada */}
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {filteredFunctions.map(func => (
                <button
                  key={func.name}
                  onClick={() => onInsertFunction(func.name, func.syntax)}
                  className="text-left p-2 text-xs bg-white hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                  title={func.description}
                >
                  <div className="font-mono font-medium text-blue-700">{func.name}</div>
                  <div className="text-gray-500 truncate">{func.description}</div>
                </button>
              ))}
            </div>

            {/* Função selecionada - detalhes */}
            {selectedCategory && filteredFunctions.length > 0 && (
              <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                <div className="text-xs text-gray-600">
                  <strong>Dica:</strong> Clique em uma função para inserir na fórmula. 
                  Use as categorias acima para navegar entre diferentes tipos de funções.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Componente para exemplos organizados
  const ExamplesPalette = ({ examples, onUseExample }: { 
    examples: any[], 
    onUseExample: (formula: string) => void 
  }) => {
    const [selectedExampleCategory, setSelectedExampleCategory] = useState<string>('basic')
    const [showExamples, setShowExamples] = useState(false)

    const exampleCategories = [
      { id: 'basic', name: 'Básicos', icon: '➕' },
      { id: 'advanced', name: 'Avançados', icon: '🔬' },
      { id: 'trigonometry', name: 'Trigonometria', icon: '📐' },
      { id: 'statistical', name: 'Estatísticas', icon: '📊' }
    ]

    const filteredExamples = examples.filter(ex => ex.category === selectedExampleCategory)

    return (
      <div>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Ver Exemplos ({examples.length} fórmulas)</span>
        </button>

        {showExamples && (
          <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {/* Categorias de Exemplos */}
            <div className="flex flex-wrap gap-1 mb-3">
              {exampleCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedExampleCategory(category.id)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedExampleCategory === category.id
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Exemplos da categoria selecionada */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {filteredExamples.map((example, index) => (
                <div key={index} className="p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {example.name}
                      </div>
                      <div className="font-mono text-sm text-blue-600 mt-1 break-all">
                        {example.formula}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {example.description}
                      </div>
                    </div>
                    <button
                      onClick={() => onUseExample(example.formula)}
                      className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredExamples.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Nenhum exemplo disponível nesta categoria
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Configurar Campo Calculado</h3>
              <p className="text-sm text-gray-500">Configure fórmulas, propriedades e estilo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar com Abas */}
          <div className="w-64 bg-gray-50 border-r">
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('calculation')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'calculation'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🧮 Cálculo
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'properties'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📝 Propriedades
                </button>
                <button
                  onClick={() => setActiveTab('style')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'style'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🎨 Estilo
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Aba de Cálculo */}
              {activeTab === 'calculation' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Configuração de Cálculo</h4>

                  {/* Fórmula */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fórmula de Cálculo
                    </label>
                    <textarea
                      id="formula-input"
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      rows={3}
                      placeholder="Ex: {campo1} + {campo2} * 0.1"
                    />
                    
                    {/* Validação */}
                    <div className="mt-2">
                      {validation.isValid ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Fórmula válida</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {validation.errors.map((error, index) => (
                            <div key={index} className="flex items-center space-x-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">{error}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campos Disponíveis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campos Disponíveis
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {allFields
                        .filter(f => f.name !== field.name && ['number', 'calculated'].includes(f.type))
                        .map(f => (
                          <button
                            key={f.name}
                            onClick={() => insertField(f.name)}
                            className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                          >
                            {f.label} ({f.type})
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Operadores e Funções */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operadores e Funções
                    </label>
                    
                    {/* Operadores Básicos */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 mb-1 block">Operadores Básicos</span>
                      <div className="flex space-x-2">
                        {['+', '-', '*', '/', '(', ')'].map(op => (
                          <button
                            key={op}
                            onClick={() => insertOperator(op)}
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Funções Matemáticas */}
                    <FunctionPalette onInsertFunction={insertFunction} />
                  </div>

                  {/* Formatação */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Formatação
                      </label>
                      <select
                        value={formatType}
                        onChange={(e) => setFormatType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="number">Número</option>
                        <option value="currency">Moeda</option>
                        <option value="percentage">Porcentagem</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Casas Decimais
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={decimalPlaces}
                        onChange={(e) => setDecimalPlaces(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {formatType === 'custom' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prefixo
                        </label>
                        <input
                          type="text"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="R$ "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sufixo
                        </label>
                        <input
                          type="text"
                          value={suffix}
                          onChange={(e) => setSuffix(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder=" %"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato Personalizado
                        </label>
                        <input
                          type="text"
                          value={customFormat}
                          onChange={(e) => setCustomFormat(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="{value} unidades"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Preview</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {previewValue}
                    </div>
                  </div>

                  {/* Exemplos Organizados */}
                  <ExamplesPalette examples={examples} onUseExample={setFormula} />
                </div>
              )}

              {/* Aba de Propriedades */}
              {activeTab === 'properties' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Propriedades do Campo</h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rótulo do Campo
                      </label>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Nome do campo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Texto de exemplo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto de Ajuda
                      </label>
                      <textarea
                        value={helpText}
                        onChange={(e) => setHelpText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Informações adicionais sobre o campo"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={required}
                          onChange={(e) => setRequired(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Campo obrigatório</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba de Estilo */}
              {activeTab === 'style' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Estilo e Alinhamento</h4>

                  {/* Alinhamento */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Alinhamento Horizontal
                      </label>
                      <div className="flex space-x-2">
                        {[
                          { value: 'left', label: 'Esquerda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Direita' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleAlignmentChange('horizontal', option.value as 'left' | 'center' | 'right')}
                            className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                              alignment.horizontal === option.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Alinhamento Vertical
                      </label>
                      <div className="flex space-x-2">
                        {[
                          { value: 'top', label: 'Topo' },
                          { value: 'middle', label: 'Meio' },
                          { value: 'bottom', label: 'Base' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleAlignmentChange('vertical', option.value as 'top' | 'middle' | 'bottom')}
                            className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                              alignment.vertical === option.value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Estilo de Fonte */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Estilo de Fonte</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Família</label>
                        <select
                          value={fontStyle.family}
                          onChange={(e) => handleFontStyleChange('family', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times">Times</option>
                          <option value="Courier">Courier</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Tahoma">Tahoma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Tamanho</label>
                        <input
                          type="number"
                          value={fontStyle.size}
                          onChange={(e) => handleFontStyleChange('size', parseInt(e.target.value) || 12)}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                          min="8"
                          max="72"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Peso</label>
                        <select
                          value={fontStyle.weight}
                          onChange={(e) => handleFontStyleChange('weight', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrito</option>
                          <option value="lighter">Mais Leve</option>
                          <option value="bolder">Mais Pesado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Estilo</label>
                        <select
                          value={fontStyle.style}
                          onChange={(e) => handleFontStyleChange('style', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Itálico</option>
                          <option value="oblique">Oblíquo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Decoração</label>
                        <select
                          value={fontStyle.decoration}
                          onChange={(e) => handleFontStyleChange('decoration', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="none">Nenhuma</option>
                          <option value="underline">Sublinhado</option>
                          <option value="overline">Linha Superior</option>
                          <option value="line-through">Riscado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Cor</label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={fontStyle.color}
                            onChange={(e) => handleFontStyleChange('color', e.target.value)}
                            className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={fontStyle.color}
                            onChange={(e) => handleFontStyleChange('color', e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 font-mono"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview do Estilo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div
                      className="p-3 bg-white border rounded"
                      style={{
                        fontFamily: fontStyle.family,
                        fontSize: `${fontStyle.size}px`,
                        fontWeight: fontStyle.weight,
                        fontStyle: fontStyle.style,
                        textDecoration: fontStyle.decoration,
                        color: fontStyle.color,
                        textAlign: alignment.horizontal as any
                      }}
                    >
                      {previewValue || 'Texto de exemplo'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {validation.dependencies.length > 0 && (
              <span>Depende de: {validation.dependencies.join(', ')}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {saveSuccess ? 'Fechar' : 'Cancelar'}
            </button>
            <button
              onClick={handleSave}
              disabled={!validation.isValid || isSaving}
              className={`px-4 py-2 rounded-lg transition-colors ${
                saveSuccess 
                  ? 'bg-green-600 text-white' 
                  : isSaving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saveSuccess ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Salvo com Sucesso!</span>
                </div>
              ) : isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                'Salvar Configuração'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}