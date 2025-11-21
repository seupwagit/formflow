import { FormField } from './types'

/**
 * Motor de Cálculo para Campos Calculados
 * Suporta operações aritméticas e referências entre campos
 */
export class CalculatedFieldEngine {
  private static instance: CalculatedFieldEngine
  private fields: FormField[] = []
  private values: Record<string, any> = {}
  private calculationCache: Map<string, number> = new Map()
  private dependencyGraph: Map<string, Set<string>> = new Map()
  private calculationOrder: string[] = []

  private constructor() {}

  static getInstance(): CalculatedFieldEngine {
    if (!CalculatedFieldEngine.instance) {
      CalculatedFieldEngine.instance = new CalculatedFieldEngine()
    }
    return CalculatedFieldEngine.instance
  }

  /**
   * Inicializa o motor com campos e valores
   */
  initialize(fields: FormField[], values: Record<string, any> = {}): void {
    this.fields = fields
    this.values = { ...values }
    this.calculationCache.clear()
    this.buildDependencyGraph()
    this.calculateCalculationOrder()
    
    console.log('🧮 Motor de cálculo inicializado')
    console.log(`📊 ${fields.length} campos, ${Object.keys(values).length} valores`)
    console.log('🔗 Grafo de dependências:', this.dependencyGraph)
    console.log('📋 Ordem de cálculo:', this.calculationOrder)
  }

  /**
   * Atualiza um valor e recalcula campos dependentes
   */
  updateValue(fieldName: string, value: any): Record<string, any> {
    const oldValue = this.values[fieldName]
    this.values[fieldName] = value

    console.log(`📝 Valor atualizado: ${fieldName} = ${value} (era: ${oldValue})`)

    // Se o valor mudou, invalidar cache e recalcular
    if (oldValue !== value) {
      this.invalidateCache(fieldName)
      this.recalculateAll()
    }

    return { ...this.values }
  }

  /**
   * Obtém o valor calculado de um campo
   */
  getCalculatedValue(fieldName: string): number | null {
    const field = this.fields.find(f => f.name === fieldName)
    
    if (!field || field.type !== 'calculated') {
      return null
    }

    // Verificar cache primeiro
    if (this.calculationCache.has(fieldName)) {
      return this.calculationCache.get(fieldName)!
    }

    // Calcular valor
    const result = this.calculateField(field)
    this.calculationCache.set(fieldName, result)
    this.values[fieldName] = result

    return result
  }

  /**
   * Recalcula todos os campos calculados
   */
  recalculateAll(): Record<string, any> {
    console.log('🔄 Recalculando todos os campos calculados...')

    for (const fieldName of this.calculationOrder) {
      const field = this.fields.find(f => f.name === fieldName)
      if (field && field.type === 'calculated') {
        const result = this.calculateField(field)
        this.calculationCache.set(fieldName, result)
        this.values[fieldName] = result
        
        console.log(`🧮 ${fieldName} = ${result}`)
      }
    }

    return { ...this.values }
  }

  /**
   * Calcula o valor de um campo específico
   */
  private calculateField(field: FormField): number {
    if (!field.calculatedConfig?.formula) {
      console.warn(`⚠️ Campo ${field.name} não tem fórmula definida`)
      return 0
    }

    try {
      const result = this.evaluateFormula(field.calculatedConfig.formula)
      
      // Aplicar formatação se necessário
      if (field.calculatedConfig.decimalPlaces !== undefined) {
        return Number(result.toFixed(field.calculatedConfig.decimalPlaces))
      }

      return result
    } catch (error) {
      console.error(`❌ Erro ao calcular ${field.name}:`, error)
      return 0
    }
  }

  /**
   * Avalia uma fórmula matemática
   */
  private evaluateFormula(formula: string): number {
    console.log(`🔍 Avaliando fórmula: ${formula}`)
    console.log(`📊 Valores disponíveis:`, this.values)
    console.log(`📋 Campos disponíveis:`, this.fields.map(f => `${f.name} (${f.type})`))

    // Substituir referências de campos por valores
    let processedFormula = formula
    
    // Encontrar todas as referências de campos (formato: {campo_nome} ou campo_nome)
    const fieldReferences = formula.match(/\{([^}]+)\}/g) || []
    console.log(`🔗 Referências encontradas:`, fieldReferences)
    
    for (const ref of fieldReferences) {
      const fieldName = ref.replace(/[{}]/g, '') // Remove chaves
      console.log(`🔍 Processando referência: ${fieldName}`)
      
      // Verificar se é uma referência de campo válida
      const referencedField = this.fields.find(f => f.name === fieldName)
      if (referencedField) {
        const value = this.getFieldValue(fieldName)
        console.log(`✅ Campo encontrado: ${fieldName} = ${value}`)
        
        // Substituir na fórmula
        const regex = new RegExp(`\\{${fieldName}\\}`, 'g')
        processedFormula = processedFormula.replace(regex, value.toString())
        
        console.log(`🔄 Fórmula após substituir ${fieldName}: ${processedFormula}`)
      } else {
        console.warn(`⚠️ Campo não encontrado: ${fieldName}`)
      }
    }

    console.log(`📐 Fórmula final processada: ${processedFormula}`)

    // Avaliar expressão matemática de forma segura
    const result = this.safeEvaluate(processedFormula)
    console.log(`🧮 Resultado do cálculo: ${result}`)
    
    return result
  }

  /**
   * Obtém o valor de um campo (numérico)
   */
  private getFieldValue(fieldName: string): number {
    const rawValue = this.values[fieldName]
    
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return 0
    }

    // Se é um campo calculado, obter valor calculado
    const field = this.fields.find(f => f.name === fieldName)
    if (field?.type === 'calculated') {
      return this.getCalculatedValue(fieldName) || 0
    }

    // Converter para número
    const numValue = Number(rawValue)
    return isNaN(numValue) ? 0 : numValue
  }

  /**
   * Avalia expressão matemática de forma segura com funções avançadas
   */
  private safeEvaluate(expression: string): number {
    try {
      // Substituir funções matemáticas por implementações JavaScript
      let processedExpression = this.replaceMathFunctions(expression)
      
      if (!processedExpression.trim()) {
        return 0
      }

      // Verificar se a expressão é válida
      if (!this.isValidMathExpression(processedExpression)) {
        throw new Error('Expressão matemática inválida')
      }

      // Avaliar usando Function (mais seguro que eval)
      const result = new Function(`"use strict"; return (${processedExpression})`)()
      
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Resultado não é um número válido')
      }

      return result
    } catch (error) {
      console.error('❌ Erro na avaliação:', error)
      return 0
    }
  }

  /**
   * Substitui funções matemáticas por implementações JavaScript
   */
  private replaceMathFunctions(expression: string): string {
    const functions = {
      // Funções básicas
      'ABS': 'Math.abs',
      'SQRT': 'Math.sqrt',
      'POW': 'Math.pow',
      'EXP': 'Math.exp',
      'LOG': 'Math.log',
      'LOG10': 'Math.log10',
      'LN': 'Math.log',
      
      // Funções trigonométricas
      'SIN': 'Math.sin',
      'COS': 'Math.cos',
      'TAN': 'Math.tan',
      'ASIN': 'Math.asin',
      'ACOS': 'Math.acos',
      'ATAN': 'Math.atan',
      'ATAN2': 'Math.atan2',
      
      // Funções de arredondamento
      'ROUND': 'Math.round',
      'CEIL': 'Math.ceil',
      'FLOOR': 'Math.floor',
      'TRUNC': 'Math.trunc',
      
      // Constantes
      'PI': 'Math.PI',
      'E': 'Math.E',
      
      // Funções estatísticas básicas
      'MIN': 'Math.min',
      'MAX': 'Math.max',
      'RANDOM': 'Math.random'
    }

    let result = expression

    // Substituir funções
    for (const [funcName, jsFunc] of Object.entries(functions)) {
      const regex = new RegExp(`\\b${funcName}\\b`, 'gi')
      result = result.replace(regex, jsFunc)
    }

    // Tratar funções especiais que precisam de lógica customizada
    result = this.handleSpecialFunctions(result)

    return result
  }

  /**
   * Trata funções especiais que precisam de lógica customizada
   */
  private handleSpecialFunctions(expression: string): string {
    let result = expression

    // MOD(a, b) -> a % b
    result = result.replace(/MOD\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, '($1 % $2)')

    // SIGN(x) -> (x > 0 ? 1 : x < 0 ? -1 : 0)
    result = result.replace(/SIGN\s*\(\s*([^)]+)\s*\)/gi, '(($1) > 0 ? 1 : ($1) < 0 ? -1 : 0)')

    // IF(condition, true_value, false_value) -> (condition ? true_value : false_value)
    result = result.replace(/IF\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi, '(($1) ? ($2) : ($3))')

    // DEGREES(radians) -> radians * 180 / Math.PI
    result = result.replace(/DEGREES\s*\(\s*([^)]+)\s*\)/gi, '(($1) * 180 / Math.PI)')

    // RADIANS(degrees) -> degrees * Math.PI / 180
    result = result.replace(/RADIANS\s*\(\s*([^)]+)\s*\)/gi, '(($1) * Math.PI / 180)')

    return result
  }

  /**
   * Verifica se uma expressão matemática é válida
   */
  private isValidMathExpression(expression: string): boolean {
    // Verificar parênteses balanceados
    let parenthesesCount = 0
    for (const char of expression) {
      if (char === '(') parenthesesCount++
      if (char === ')') parenthesesCount--
      if (parenthesesCount < 0) return false
    }
    
    if (parenthesesCount !== 0) return false

    // Permitir funções matemáticas, números, operadores e parênteses
    const allowedPattern = /^[0-9+\-*/.,()\s\w]+$/
    if (!allowedPattern.test(expression)) return false

    return true
  }

  /**
   * Constrói o grafo de dependências entre campos
   */
  private buildDependencyGraph(): void {
    this.dependencyGraph.clear()

    for (const field of this.fields) {
      if (field.type === 'calculated' && field.calculatedConfig?.dependencies) {
        this.dependencyGraph.set(field.name, new Set(field.calculatedConfig.dependencies))
      }
    }
  }

  /**
   * Calcula a ordem de cálculo baseada nas dependências
   */
  private calculateCalculationOrder(): void {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (fieldName: string) => {
      if (visiting.has(fieldName)) {
        throw new Error(`Dependência circular detectada: ${fieldName}`)
      }
      
      if (visited.has(fieldName)) {
        return
      }

      visiting.add(fieldName)
      
      const dependencies = this.dependencyGraph.get(fieldName) || new Set()
      // Converter Set para Array para compatibilidade
      const depsArray = Array.from(dependencies)
      for (const dep of depsArray) {
        visit(dep)
      }
      
      visiting.delete(fieldName)
      visited.add(fieldName)
      order.push(fieldName)
    }

    // Visitar todos os campos calculados
    for (const field of this.fields) {
      if (field.type === 'calculated') {
        visit(field.name)
      }
    }

    this.calculationOrder = order
  }

  /**
   * Invalida o cache de um campo e seus dependentes
   */
  private invalidateCache(fieldName: string): void {
    this.calculationCache.delete(fieldName)

    // Invalidar campos que dependem deste
    // Converter Map para Array para compatibilidade
    const graphEntries = Array.from(this.dependencyGraph.entries())
    for (const [calcField, dependencies] of graphEntries) {
      if (dependencies.has(fieldName)) {
        this.invalidateCache(calcField)
      }
    }
  }

  /**
   * Valida uma fórmula
   */
  validateFormula(formula: string, availableFields: FormField[]): {
    isValid: boolean
    errors: string[]
    dependencies: string[]
  } {
    const errors: string[] = []
    const dependencies: string[] = []

    try {
      // Encontrar referências de campos
      const fieldReferences = formula.match(/\{([^}]+)\}|([a-zA-Z_][a-zA-Z0-9_]*)/g) || []
      
      for (const ref of fieldReferences) {
        const fieldName = ref.replace(/[{}]/g, '')
        
        // Verificar se é uma função matemática ou constante
        const mathFunctions = [
          'ABS', 'SQRT', 'POW', 'EXP', 'LOG', 'LOG10', 'LN',
          'SIN', 'COS', 'TAN', 'ASIN', 'ACOS', 'ATAN', 'ATAN2',
          'ROUND', 'CEIL', 'FLOOR', 'TRUNC', 'MOD', 'SIGN',
          'MIN', 'MAX', 'PI', 'E', 'RANDOM', 'IF', 'DEGREES', 'RADIANS'
        ]
        
        if (mathFunctions.includes(fieldName.toUpperCase())) {
          continue
        }

        const referencedField = availableFields.find(f => f.name === fieldName)
        if (referencedField) {
          if (!dependencies.includes(fieldName)) {
            dependencies.push(fieldName)
          }

          // Verificar se o campo referenciado é numérico ou calculado
          if (!['number', 'calculated'].includes(referencedField.type)) {
            errors.push(`Campo '${fieldName}' não é numérico`)
          }
        } else {
          // Verificar se não é um número
          if (isNaN(Number(fieldName))) {
            errors.push(`Campo '${fieldName}' não encontrado`)
          }
        }
      }

      // Testar a fórmula com valores de exemplo
      let testFormula = formula
      for (const dep of dependencies) {
        const regex = new RegExp(`\\{${dep}\\}|\\b${dep}\\b`, 'g')
        testFormula = testFormula.replace(regex, '1')
      }

      if (!this.isValidMathExpression(testFormula)) {
        errors.push('Sintaxe matemática inválida')
      }

    } catch (error) {
      errors.push(`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      dependencies
    }
  }

  /**
   * Obtém exemplos de fórmulas
   */
  static getFormulaExamples(): Array<{
    name: string
    formula: string
    description: string
    category: 'basic' | 'advanced' | 'trigonometry' | 'statistical'
  }> {
    return [
      // Básicas
      {
        name: 'Soma Simples',
        formula: '{campo1} + {campo2}',
        description: 'Soma dois campos',
        category: 'basic'
      },
      {
        name: 'Subtração',
        formula: '{total} - {desconto}',
        description: 'Subtrai desconto do total',
        category: 'basic'
      },
      {
        name: 'Multiplicação',
        formula: '{quantidade} * {preco_unitario}',
        description: 'Calcula valor total',
        category: 'basic'
      },
      {
        name: 'Divisão',
        formula: '{total} / {parcelas}',
        description: 'Calcula valor da parcela',
        category: 'basic'
      },
      {
        name: 'Percentual',
        formula: '{valor} * 0.1',
        description: 'Calcula 10% do valor',
        category: 'basic'
      },
      {
        name: 'Média',
        formula: '({nota1} + {nota2} + {nota3}) / 3',
        description: 'Calcula média de três notas',
        category: 'basic'
      },
      
      // Avançadas
      {
        name: 'Valor Absoluto',
        formula: 'ABS({diferenca})',
        description: 'Valor absoluto (sempre positivo)',
        category: 'advanced'
      },
      {
        name: 'Raiz Quadrada',
        formula: 'SQRT({area})',
        description: 'Raiz quadrada de um número',
        category: 'advanced'
      },
      {
        name: 'Potência',
        formula: 'POW({base}, {expoente})',
        description: 'Eleva um número a uma potência',
        category: 'advanced'
      },
      {
        name: 'Arredondamento',
        formula: 'ROUND({valor}, 2)',
        description: 'Arredonda para 2 casas decimais',
        category: 'advanced'
      },
      {
        name: 'Máximo',
        formula: 'MAX({valor1}, {valor2}, {valor3})',
        description: 'Retorna o maior valor',
        category: 'advanced'
      },
      {
        name: 'Mínimo',
        formula: 'MIN({valor1}, {valor2}, {valor3})',
        description: 'Retorna o menor valor',
        category: 'advanced'
      },
      {
        name: 'Resto da Divisão',
        formula: 'MOD({dividendo}, {divisor})',
        description: 'Resto da divisão (módulo)',
        category: 'advanced'
      },
      {
        name: 'Condicional',
        formula: 'IF({idade} >= 18, {valor_adulto}, {valor_menor})',
        description: 'Valor condicional (se-então-senão)',
        category: 'advanced'
      },
      
      // Trigonométricas
      {
        name: 'Seno',
        formula: 'SIN(RADIANS({angulo_graus}))',
        description: 'Seno de um ângulo em graus',
        category: 'trigonometry'
      },
      {
        name: 'Cosseno',
        formula: 'COS(RADIANS({angulo_graus}))',
        description: 'Cosseno de um ângulo em graus',
        category: 'trigonometry'
      },
      {
        name: 'Tangente',
        formula: 'TAN(RADIANS({angulo_graus}))',
        description: 'Tangente de um ângulo em graus',
        category: 'trigonometry'
      },
      {
        name: 'Hipotenusa',
        formula: 'SQRT(POW({cateto1}, 2) + POW({cateto2}, 2))',
        description: 'Teorema de Pitágoras',
        category: 'trigonometry'
      },
      
      // Estatísticas
      {
        name: 'Área do Círculo',
        formula: 'PI * POW({raio}, 2)',
        description: 'Área de um círculo',
        category: 'statistical'
      },
      {
        name: 'Juros Compostos',
        formula: '{capital} * POW(1 + {taxa}/100, {tempo})',
        description: 'Cálculo de juros compostos',
        category: 'statistical'
      },
      {
        name: 'IMC',
        formula: '{peso} / POW({altura}, 2)',
        description: 'Índice de Massa Corporal',
        category: 'statistical'
      },
      {
        name: 'Desvio Percentual',
        formula: 'ABS(({valor_real} - {valor_esperado}) / {valor_esperado}) * 100',
        description: 'Desvio percentual entre valores',
        category: 'statistical'
      }
    ]
  }

  /**
   * Obtém lista de funções matemáticas disponíveis
   */
  static getMathFunctions(): Array<{
    name: string
    syntax: string
    description: string
    category: 'basic' | 'trigonometry' | 'logarithmic' | 'rounding' | 'statistical' | 'logical'
    examples: string[]
  }> {
    return [
      // Básicas
      {
        name: 'ABS',
        syntax: 'ABS(número)',
        description: 'Retorna o valor absoluto',
        category: 'basic',
        examples: ['ABS(-5) = 5', 'ABS({diferenca})']
      },
      {
        name: 'SQRT',
        syntax: 'SQRT(número)',
        description: 'Retorna a raiz quadrada',
        category: 'basic',
        examples: ['SQRT(16) = 4', 'SQRT({area})']
      },
      {
        name: 'POW',
        syntax: 'POW(base, expoente)',
        description: 'Eleva um número a uma potência',
        category: 'basic',
        examples: ['POW(2, 3) = 8', 'POW({base}, {exp})']
      },
      {
        name: 'EXP',
        syntax: 'EXP(número)',
        description: 'Retorna e elevado ao número',
        category: 'basic',
        examples: ['EXP(1) = 2.718', 'EXP({taxa})']
      },
      
      // Trigonométricas
      {
        name: 'SIN',
        syntax: 'SIN(radianos)',
        description: 'Retorna o seno',
        category: 'trigonometry',
        examples: ['SIN(PI/2) = 1', 'SIN(RADIANS({graus}))']
      },
      {
        name: 'COS',
        syntax: 'COS(radianos)',
        description: 'Retorna o cosseno',
        category: 'trigonometry',
        examples: ['COS(0) = 1', 'COS(RADIANS({graus}))']
      },
      {
        name: 'TAN',
        syntax: 'TAN(radianos)',
        description: 'Retorna a tangente',
        category: 'trigonometry',
        examples: ['TAN(PI/4) = 1', 'TAN(RADIANS({graus}))']
      },
      {
        name: 'RADIANS',
        syntax: 'RADIANS(graus)',
        description: 'Converte graus para radianos',
        category: 'trigonometry',
        examples: ['RADIANS(180) = PI', 'RADIANS({angulo})']
      },
      {
        name: 'DEGREES',
        syntax: 'DEGREES(radianos)',
        description: 'Converte radianos para graus',
        category: 'trigonometry',
        examples: ['DEGREES(PI) = 180', 'DEGREES({radianos})']
      },
      
      // Logarítmicas
      {
        name: 'LOG',
        syntax: 'LOG(número)',
        description: 'Logaritmo natural (base e)',
        category: 'logarithmic',
        examples: ['LOG(E) = 1', 'LOG({valor})']
      },
      {
        name: 'LOG10',
        syntax: 'LOG10(número)',
        description: 'Logaritmo base 10',
        category: 'logarithmic',
        examples: ['LOG10(100) = 2', 'LOG10({valor})']
      },
      
      // Arredondamento
      {
        name: 'ROUND',
        syntax: 'ROUND(número)',
        description: 'Arredonda para o inteiro mais próximo',
        category: 'rounding',
        examples: ['ROUND(3.7) = 4', 'ROUND({valor})']
      },
      {
        name: 'CEIL',
        syntax: 'CEIL(número)',
        description: 'Arredonda para cima',
        category: 'rounding',
        examples: ['CEIL(3.1) = 4', 'CEIL({valor})']
      },
      {
        name: 'FLOOR',
        syntax: 'FLOOR(número)',
        description: 'Arredonda para baixo',
        category: 'rounding',
        examples: ['FLOOR(3.9) = 3', 'FLOOR({valor})']
      },
      {
        name: 'TRUNC',
        syntax: 'TRUNC(número)',
        description: 'Remove a parte decimal',
        category: 'rounding',
        examples: ['TRUNC(3.9) = 3', 'TRUNC({valor})']
      },
      
      // Estatísticas
      {
        name: 'MIN',
        syntax: 'MIN(num1, num2, ...)',
        description: 'Retorna o menor valor',
        category: 'statistical',
        examples: ['MIN(1, 5, 3) = 1', 'MIN({a}, {b}, {c})']
      },
      {
        name: 'MAX',
        syntax: 'MAX(num1, num2, ...)',
        description: 'Retorna o maior valor',
        category: 'statistical',
        examples: ['MAX(1, 5, 3) = 5', 'MAX({a}, {b}, {c})']
      },
      {
        name: 'MOD',
        syntax: 'MOD(dividendo, divisor)',
        description: 'Resto da divisão',
        category: 'statistical',
        examples: ['MOD(10, 3) = 1', 'MOD({total}, {grupo})']
      },
      {
        name: 'SIGN',
        syntax: 'SIGN(número)',
        description: 'Retorna o sinal (-1, 0, 1)',
        category: 'statistical',
        examples: ['SIGN(-5) = -1', 'SIGN({diferenca})']
      },
      
      // Lógicas
      {
        name: 'IF',
        syntax: 'IF(condição, se_verdadeiro, se_falso)',
        description: 'Retorna valor baseado em condição',
        category: 'logical',
        examples: ['IF({idade} >= 18, 100, 50)', 'IF({nota} >= 7, "Aprovado", "Reprovado")']
      }
    ]
  }

  /**
   * Formata valor baseado na configuração do campo
   */
  formatValue(value: number, config: FormField['calculatedConfig']): string {
    if (!config) return value.toString()

    let formattedValue = value

    // Aplicar casas decimais
    if (config.decimalPlaces !== undefined) {
      formattedValue = Number(value.toFixed(config.decimalPlaces))
    }

    let result = formattedValue.toString()

    // Aplicar formatação por tipo
    switch (config.formatType) {
      case 'currency':
        result = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(formattedValue)
        break

      case 'percentage':
        result = `${(formattedValue * 100).toFixed(config.decimalPlaces || 2)}%`
        break

      case 'number':
        result = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: config.decimalPlaces || 0,
          maximumFractionDigits: config.decimalPlaces || 2
        }).format(formattedValue)
        break

      case 'custom':
        if (config.customFormat) {
          result = config.customFormat.replace('{value}', result)
        }
        break
    }

    // Aplicar prefixo e sufixo
    if (config.prefix) result = config.prefix + result
    if (config.suffix) result = result + config.suffix

    return result
  }

  /**
   * Obtém estatísticas do motor de cálculo
   */
  getStats(): {
    totalFields: number
    calculatedFields: number
    dependencies: number
    cacheSize: number
    lastCalculation: string
  } {
    const calculatedFields = this.fields.filter(f => f.type === 'calculated').length
    const totalDependencies = Array.from(this.dependencyGraph.values())
      .reduce((sum, deps) => sum + deps.size, 0)

    return {
      totalFields: this.fields.length,
      calculatedFields,
      dependencies: totalDependencies,
      cacheSize: this.calculationCache.size,
      lastCalculation: new Date().toLocaleTimeString()
    }
  }
}