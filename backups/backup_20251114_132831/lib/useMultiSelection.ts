/**
 * Hook para gerenciar seleção múltipla de campos
 */

import { useState, useCallback, useRef } from 'react'
import { FormField } from './types'

export interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isActive: boolean
}

export interface MultiSelectionState {
  selectedFields: FormField[]
  selectionBox: SelectionBox
  isDragging: boolean
  dragOffset: { x: number; y: number }
}

export function useMultiSelection() {
  const [selectedFields, setSelectedFields] = useState<FormField[]>([])
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isActive: false
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLDivElement>(null)

  // Iniciar seleção por arrastar
  const startSelection = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSelectionBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      isActive: true
    })
    
    // Limpar seleção anterior se não estiver segurando Ctrl
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedFields([])
    }
  }, [])

  // Atualizar seleção durante o arrastar
  const updateSelection = useCallback((e: React.MouseEvent, allFields: FormField[], currentPage: number) => {
    if (!selectionBox.isActive || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    setSelectionBox(prev => ({
      ...prev,
      currentX,
      currentY
    }))
    
    // Calcular área de seleção
    const minX = Math.min(selectionBox.startX, currentX)
    const maxX = Math.max(selectionBox.startX, currentX)
    const minY = Math.min(selectionBox.startY, currentY)
    const maxY = Math.max(selectionBox.startY, currentY)
    
    // Encontrar campos dentro da área de seleção
    const fieldsInSelection = allFields.filter(field => {
      if (field.position.page !== currentPage) return false
      
      const fieldCenterX = field.position.x + field.position.width / 2
      const fieldCenterY = field.position.y + field.position.height / 2
      
      return fieldCenterX >= minX && fieldCenterX <= maxX &&
             fieldCenterY >= minY && fieldCenterY <= maxY
    })
    
    setSelectedFields(prev => {
      // Se estiver segurando Ctrl, adicionar à seleção existente
      if (e.ctrlKey || e.metaKey) {
        const newFields = fieldsInSelection.filter(field => 
          !prev.some(selected => selected.id === field.id)
        )
        return [...prev, ...newFields]
      }
      return fieldsInSelection
    })
  }, [selectionBox])

  // Finalizar seleção
  const endSelection = useCallback(() => {
    setSelectionBox(prev => ({ ...prev, isActive: false }))
  }, [])

  // Adicionar/remover campo individual da seleção
  const toggleFieldSelection = useCallback((field: FormField, isCtrlPressed: boolean) => {
    setSelectedFields(prev => {
      const isSelected = prev.some(selected => selected.id === field.id)
      
      if (isCtrlPressed) {
        // Ctrl pressionado: adicionar/remover da seleção
        if (isSelected) {
          return prev.filter(selected => selected.id !== field.id)
        } else {
          return [...prev, field]
        }
      } else {
        // Ctrl não pressionado: selecionar apenas este campo
        return isSelected ? [] : [field]
      }
    })
  }, [])

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedFields([])
  }, [])

  // Verificar se um campo está selecionado
  const isFieldSelected = useCallback((field: FormField) => {
    return selectedFields.some(selected => selected.id === field.id)
  }, [selectedFields])

  // Iniciar arrastar campos selecionados
  const startDragging = useCallback((e: React.MouseEvent, clickedField: FormField) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Se o campo clicado não estiver selecionado, selecionar apenas ele
    if (!isFieldSelected(clickedField)) {
      setSelectedFields([clickedField])
    }
    
    setIsDragging(true)
    setDragOffset({
      x: mouseX - clickedField.position.x,
      y: mouseY - clickedField.position.y
    })
  }, [isFieldSelected])

  // Atualizar posição durante o arrastar
  const updateDragging = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    return {
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y
    }
  }, [isDragging, dragOffset])

  // Finalizar arrastar
  const endDragging = useCallback(() => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  // Mover campos selecionados
  const moveSelectedFields = useCallback((deltaX: number, deltaY: number, allFields: FormField[]) => {
    if (selectedFields.length === 0) return allFields
    
    return allFields.map(field => {
      const isSelected = selectedFields.some(selected => selected.id === field.id)
      if (!isSelected) return field
      
      return {
        ...field,
        position: {
          ...field.position,
          x: Math.max(0, field.position.x + deltaX),
          y: Math.max(0, field.position.y + deltaY)
        }
      }
    })
  }, [selectedFields])

  return {
    selectedFields,
    selectionBox,
    isDragging,
    canvasRef,
    startSelection,
    updateSelection,
    endSelection,
    toggleFieldSelection,
    clearSelection,
    isFieldSelected,
    startDragging,
    updateDragging,
    endDragging,
    moveSelectedFields
  }
}