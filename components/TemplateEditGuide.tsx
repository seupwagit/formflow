'use client'

import { useState } from 'react'
import { X, Edit, Image, Move, Settings, Save } from 'lucide-react'

interface TemplateEditGuideProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplateEditGuide({ isOpen, onClose }: TemplateEditGuideProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            🎨 Guia de Edição de Templates
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 O que você pode fazer ao editar um template:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Modificar posição e tamanho dos campos</li>
              <li>• Alterar tipos de campos (texto, número, data, etc.)</li>
              <li>• Adicionar ou remover campos</li>
              <li>• Trocar a imagem de fundo do formulário</li>
              <li>• Ajustar propriedades e validações</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Edit className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Editar Campos</h4>
              </div>
              <p className="text-sm text-gray-600">
                Clique em qualquer campo no canvas para selecioná-lo e editar suas propriedades no painel lateral.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Move className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Mover e Redimensionar</h4>
              </div>
              <p className="text-sm text-gray-600">
                Arraste os campos para reposicioná-los ou use as alças de redimensionamento nas bordas.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Image className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Trocar Fundo</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use o botão "Trocar Fundo" na toolbar para substituir a imagem mantendo todos os campos.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Save className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">Salvar Alterações</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use Ctrl+S para salvar rapidamente ou clique no botão "Salvar" na toolbar.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Dicas Importantes:
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Sempre salve suas alterações antes de sair</li>
              <li>• Teste o formulário após fazer mudanças</li>
              <li>• Use nomes descritivos para os campos</li>
              <li>• Configure validações adequadas para cada tipo de campo</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              🚀 Atalhos de Teclado:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
              <div><kbd className="bg-green-100 px-1 rounded">Ctrl+S</kbd> - Salvar</div>
              <div><kbd className="bg-green-100 px-1 rounded">Ctrl+Shift+S</kbd> - Salvar Como</div>
              <div><kbd className="bg-green-100 px-1 rounded">A</kbd> - Adicionar Campo</div>
              <div><kbd className="bg-green-100 px-1 rounded">Delete</kbd> - Excluir Campo</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entendi, vamos começar!
          </button>
        </div>
      </div>
    </div>
  )
}