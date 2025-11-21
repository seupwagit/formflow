'use client'

import { SelectionBox as SelectionBoxType } from '@/lib/useMultiSelection'

interface SelectionBoxProps {
  selectionBox: SelectionBoxType
}

export default function SelectionBox({ selectionBox }: SelectionBoxProps) {
  if (!selectionBox.isActive) return null

  const minX = Math.min(selectionBox.startX, selectionBox.currentX)
  const minY = Math.min(selectionBox.startY, selectionBox.currentY)
  const width = Math.abs(selectionBox.currentX - selectionBox.startX)
  const height = Math.abs(selectionBox.currentY - selectionBox.startY)

  return (
    <div
      className="absolute pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-20 z-50"
      style={{
        left: minX,
        top: minY,
        width,
        height,
        borderStyle: 'dashed'
      }}
    />
  )
}