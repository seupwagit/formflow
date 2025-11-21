'use client'

import React, { useState } from 'react'
import { Keyboard, Move, Maximize2, Zap, Info } from 'lucide-react'

export default function PrecisionKeyboardHelp() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão para abrir ajuda */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 p-2 rounded"
        title="Atalhos de Precisão"
      >
        <Keyboard className="h-4 w-4" />
        <span>Precisão</span>
      </button>

      {/* Modal de Ajuda */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Move className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Controles de Precisão
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Movimentação */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Move className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Movimentação de Campos</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Shift</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">↑↓←→</kbd>
                    </div>
                    <span className="text-gray-600">Mover 1 pixel</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Alt</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Shift</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">↑↓←→</kbd>
                    </div>
                    <span className="text-gray-600">Mover 10 pixels (rápido)</span>
                  </div>
                </div>
              </div>

              {/* Redimensionamento */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Maximize2 className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-gray-900">Redimensionamento</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">↑↓←→</kbd>
                    </div>
                    <span className="text-gray-600">Redimensionar 1 pixel</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Alt</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-white border rounded text-xs">↑↓←→</kbd>
                    </div>
                    <span className="text-gray-600">Redimensionar 10 pixels (rápido)</span>
                  </div>
                </div>
              </div>

              {/* Direções */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Direções das Setas</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Movimentação:</h4>
                    <div className="space-y-1 text-xs">
                      <div>↑ = Mover para cima</div>
                      <div>↓ = Mover para baixo</div>
                      <div>← = Mover para esquerda</div>
                      <div>→ = Mover para direita</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Redimensionamento:</h4>
                    <div className="space-y-1 text-xs">
                      <div>↑ = Diminuir altura</div>
                      <div>↓ = Aumentar altura</div>
                      <div>← = Diminuir largura</div>
                      <div>→ = Aumentar largura</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Múltipla Seleção */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Múltipla Seleção</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded text-sm">
                  <p className="text-gray-700">
                    Todos os atalhos funcionam com múltiplos campos selecionados. 
                    Use <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+Click</kbd> para 
                    selecionar múltiplos campos e aplicar ajustes em todos simultaneamente.
                  </p>
                </div>
              </div>

              {/* Ferramentas Visuais */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Ferramentas Visuais</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700 mb-1">Barra de Ferramentas</div>
                    <p className="text-gray-600">
                      Use os botões de alinhamento na barra "Precisão" para alinhar múltiplos campos
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium text-gray-700 mb-1">Painel Lateral</div>
                    <p className="text-gray-600">
                      O painel "Controles de Precisão" mostra estatísticas e ferramentas avançadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Dicas */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">💡 Dicas Profissionais</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use Alt para movimentos rápidos de 10 pixels</li>
                  <li>• Selecione múltiplos campos para ajustar todos juntos</li>
                  <li>• Os ajustes são salvos automaticamente e podem ser desfeitos (Ctrl+Z)</li>
                  <li>• Use as ferramentas de alinhamento para posicionamento perfeito</li>
                  <li>• O painel mostra estatísticas em tempo real da seleção</li>
                </ul>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}