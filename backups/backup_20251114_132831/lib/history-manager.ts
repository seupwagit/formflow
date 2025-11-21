import { FormField } from './types'

export interface HistoryAction {
  id: string
  type: 'add' | 'delete' | 'update' | 'move' | 'resize' | 'bulk_update'
  timestamp: number
  description: string
  beforeState: FormField[]
  afterState: FormField[]
  fieldIds?: string[] // IDs dos campos afetados
}

export class HistoryManager {
  private history: HistoryAction[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50
  private isUndoRedoOperation: boolean = false

  constructor(maxSize: number = 50) {
    this.maxHistorySize = maxSize
  }

  /**
   * Adiciona uma nova ação ao histórico
   */
  addAction(
    type: HistoryAction['type'],
    description: string,
    beforeState: FormField[],
    afterState: FormField[],
    fieldIds?: string[]
  ): void {
    // Não adicionar ao histórico se estamos fazendo undo/redo
    if (this.isUndoRedoOperation) {
      return
    }

    const action: HistoryAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      description,
      beforeState: JSON.parse(JSON.stringify(beforeState)), // Deep clone
      afterState: JSON.parse(JSON.stringify(afterState)),   // Deep clone
      fieldIds
    }

    // Se não estamos no final do histórico, remover ações futuras
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Adicionar nova ação
    this.history.push(action)
    this.currentIndex++

    // Manter tamanho máximo do histórico
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }

    console.log(`📝 Ação adicionada ao histórico: ${description}`)
    console.log(`📊 Histórico: ${this.currentIndex + 1}/${this.history.length}`)
  }

  /**
   * Desfaz a última ação (Undo)
   */
  undo(): { success: boolean; fields: FormField[] | null; description: string } {
    if (!this.canUndo()) {
      return {
        success: false,
        fields: null,
        description: 'Nenhuma ação para desfazer'
      }
    }

    const action = this.history[this.currentIndex]
    this.currentIndex--
    this.isUndoRedoOperation = true

    console.log(`↶ Desfazendo: ${action.description}`)
    console.log(`📊 Histórico: ${this.currentIndex + 1}/${this.history.length}`)

    // Resetar flag após um pequeno delay
    setTimeout(() => {
      this.isUndoRedoOperation = false
    }, 100)

    return {
      success: true,
      fields: JSON.parse(JSON.stringify(action.beforeState)),
      description: `Desfeito: ${action.description}`
    }
  }

  /**
   * Refaz a próxima ação (Redo)
   */
  redo(): { success: boolean; fields: FormField[] | null; description: string } {
    if (!this.canRedo()) {
      return {
        success: false,
        fields: null,
        description: 'Nenhuma ação para refazer'
      }
    }

    this.currentIndex++
    const action = this.history[this.currentIndex]
    this.isUndoRedoOperation = true

    console.log(`↷ Refazendo: ${action.description}`)
    console.log(`📊 Histórico: ${this.currentIndex + 1}/${this.history.length}`)

    // Resetar flag após um pequeno delay
    setTimeout(() => {
      this.isUndoRedoOperation = false
    }, 100)

    return {
      success: true,
      fields: JSON.parse(JSON.stringify(action.afterState)),
      description: `Refeito: ${action.description}`
    }
  }

  /**
   * Verifica se pode desfazer
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * Verifica se pode refazer
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Obtém informações sobre a próxima ação de undo
   */
  getUndoInfo(): { description: string; type: string } | null {
    if (!this.canUndo()) return null
    
    const action = this.history[this.currentIndex]
    return {
      description: action.description,
      type: action.type
    }
  }

  /**
   * Obtém informações sobre a próxima ação de redo
   */
  getRedoInfo(): { description: string; type: string } | null {
    if (!this.canRedo()) return null
    
    const action = this.history[this.currentIndex + 1]
    return {
      description: action.description,
      type: action.type
    }
  }

  /**
   * Limpa todo o histórico
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    console.log('🗑️ Histórico limpo')
  }

  /**
   * Obtém estatísticas do histórico
   */
  getStats(): {
    totalActions: number
    currentPosition: number
    canUndo: boolean
    canRedo: boolean
    memoryUsage: string
  } {
    const memoryUsage = JSON.stringify(this.history).length
    const memoryMB = (memoryUsage / 1024 / 1024).toFixed(2)

    return {
      totalActions: this.history.length,
      currentPosition: this.currentIndex + 1,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage: `${memoryMB} MB`
    }
  }

  /**
   * Obtém o histórico completo (para debug)
   */
  getHistory(): HistoryAction[] {
    return this.history.map(action => ({
      ...action,
      beforeState: [], // Não retornar estados completos por performance
      afterState: []
    }))
  }

  /**
   * Define se estamos em uma operação de undo/redo
   */
  setUndoRedoMode(isUndoRedo: boolean): void {
    this.isUndoRedoOperation = isUndoRedo
  }

  /**
   * Verifica se estamos em modo undo/redo
   */
  isInUndoRedoMode(): boolean {
    return this.isUndoRedoOperation
  }
}