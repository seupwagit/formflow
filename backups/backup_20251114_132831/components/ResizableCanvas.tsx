'use client'

import { useRef, useState, useEffect } from 'react'
import { FormField } from '@/lib/types'
import ResizableField from './ResizableField'
import { ChevronLeft, ChevronRight, Plus, Trash2, ZoomIn, ZoomOut, MousePointer, Move, Square, Settings, Copy } from 'lucide-react'

interface ResizableCanvasProps {
  pdfImages: string[]
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
  onOpenProperties?: () => void
}

type CanvasTool = 'select' | 'move' | 'resize' | 'add'

export default function ResizableCanvas({
  pdfImages,
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  onOpenProperties
}: ResizableCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [scale, setScale] = useState(1)
  const [currentTool, setCurrentTool] = useState<CanvasTool>('select')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [canvasSize] = useState({ width: 800, height: 1000 })

  const currentPageFields = fields.filter(f => f.position && f.position.page === currentPage)

  // Carregar imagem de fundo
  useEffect(() => {
    if (pdfImages && pdfImages[currentPage]) {
      setBackgroundImage(pdfImages[currentPage])
      console.log('🖼️ Imagem de fundo carregada:', pdfImages[currentPage])
    } else {
      setBackgroundImage(null)
    }
  }, [currentPage, pdfImages])

  // Adicionar novo campo
  const addNewField = () => {
    setCurrentTool('add')
  }

  const addNewFieldAtPosition = (x: number, y: number) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `campo_${currentPageFields.length + 1}`,
      type: 'text',
      label: 'Novo Campo',
      required: false,
      position: {
        x: Math.max(0, Math.min(x - 100, canvasSize.width - 200)),
        y: Math.max(0, Math.min(y - 17, canvasSize.height - 35)),
        width: 200,
        height: 35,
        page: currentPage
      }
    }

    onFieldsChange([...fields, newField])
    onFieldSelect(newField)
    setCurrentTool('select')
  }

  // Excluir campo selecionado
  const deleteSelectedField = () => {
    if (!selectedField) return
    
    const updatedFields = fields.filter(field => field.id !== selectedField.id)
    onFieldsChange(updatedFields)
    onFieldSelect(null)
  }

  // Duplicar campo selecionado
  const duplicateSelectedField = () => {
    if (!selectedField) return
    
    const newField: FormField = {
      ...selectedField,
      id: `field_${Date.now()}`,
      name: `${selectedField.name}_copy`,
      label: `${selectedField.label} (Cópia)`,
      position: {
        ...selectedField.position,
        x: selectedField.position.x + 20,
        y: selectedField.position.y + 20
      }
    }
    
    onFieldsChange([...fields, newField])
    onFieldSelect(newField)
  }

  // Navegação entre páginas
  const nextPage = () => {
    if (currentPage < pdfImages.length - 1) {
      setCurrentPage(currentPage + 1)
      onFieldSelect(null)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      onFieldSelect(null)
    }
  }

  // Zoom
  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, scale + delta))
    setScale(newScale)
  }

  // Clique no canvas vazio
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentTool === 'add') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left) / scale
        const y = (e.clientY - rect.top) / scale
        addNewFieldAtPosition(x, y)
      }
    } else {
      onFieldSelect(null)
    }
  }

  // Atualizar campo
  const handleFieldUpdate = (updatedField: FormField) => {
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    )
    onFieldsChange(updatedFields)
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('select')
            e.preventDefault()
          }
          break
        case 'm':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('move')
            e.preventDefault()
          }
          break
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('resize')
            e.preventDefault()
          }
          break
        case 'a':
          if (!e.ctrlKey && !e.metaKey) {
            setCurrentTool('add')
            e.preventDefault()
          }
          break
        case 'delete':
        case 'backspace':
          if (selectedField) {
            deleteSelectedField()
            e.preventDefault()
          }
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            duplicateSelectedField()
            e.preventDefault()
          }
          break
        case 'p':
          if (!e.ctrlKey && !e.metaKey && selectedField) {
            onOpenProperties?.()
            e.preventDefault()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedField])

  return (
    <div className="flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            {/* Ferramentas */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentTool('select')}
                className={`p-2 rounded ${currentTool === 'select' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="Selecionar (S)"
              >
                <MousePointer className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('move')}
                className={`p-2 rounded ${currentTool === 'move' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="Mover (M)"
              >
                <Move className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('resize')}
                className={`p-2 rounded ${currentTool === 'resize' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                title="Redimensionar (R)"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentTool('add')}
                className={`p-2 rounded ${currentTool === 'add' ? 'bg-green-500 text-white' : 'hover:bg-gray-200'}`}
                title="Adicionar Campo (A)"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Navegação */}
            <div className="flex items-center space-x-2 border-l pl-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="btn-secondary disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
                {currentPage + 1} / {pdfImages.length || 1}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === pdfImages.length - 1}
                className="btn-secondary disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-2 border-l pl-4">
              <button onClick={() => handleZoom(-0.2)} className="btn-secondary">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button onClick={() => handleZoom(0.2)} className="btn-secondary">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {selectedField && (
              <>
                <button
                  onClick={onOpenProperties}
                  className="flex items-center space-x-2 btn-secondary bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <Settings className="h-4 w-4" />
                  <span>Propriedades</span>
                </button>
                <button
                  onClick={duplicateSelectedField}
                  className="btn-secondary"
                  title="Duplicar (Ctrl+D)"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={deleteSelectedField}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                  title="Excluir (Delete)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-center p-4">
          <div
            ref={canvasRef}
            className="relative border border-gray-200 overflow-hidden"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              cursor: currentTool === 'add' ? 'crosshair' : 'default'
            }}
            onClick={handleCanvasClick}
          >
            {/* Imagem de fundo */}
            {backgroundImage && (
              <img
                src={backgroundImage}
                alt={`Página ${currentPage + 1}`}
                className="absolute inset-0 w-full h-full object-contain opacity-90 pointer-events-none"
                style={{ zIndex: 1 }}
              />
            )}

            {/* Grid de fundo quando não há imagem */}
            {!backgroundImage && (
              <div className="absolute inset-0" style={{ zIndex: 1 }}>
                <svg width="100%" height="100%" className="opacity-20">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Campos redimensionáveis */}
            {currentPageFields.map((field) => (
              <ResizableField
                key={field.id}
                field={field}
                isSelected={selectedField?.id === field.id}
                isResizeMode={currentTool === 'resize'}
                onFieldUpdate={handleFieldUpdate}
                onFieldSelect={onFieldSelect}
                scale={1} // Escala já aplicada no container
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div className="space-y-1">
            <div>
              <strong>Página {currentPage + 1}:</strong> {currentPageFields.length} campos
            </div>
            <div>
              <strong>Ferramenta:</strong> {
                currentTool === 'select' ? 'Selecionar' :
                currentTool === 'move' ? 'Mover' :
                currentTool === 'resize' ? 'Redimensionar' :
                'Adicionar Campo'
              }
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div><strong>Redimensionar:</strong> Selecione o campo e use a ferramenta Redimensionar (R)</div>
            <div><strong>Handles:</strong> Arraste os pontos azuis para redimensionar</div>
            <div><strong>Atalhos:</strong> S=Selecionar, M=Mover, R=Redimensionar, A=Adicionar, P=Propriedades</div>
          </div>
        </div>
      </div>
    </div>
  )
}