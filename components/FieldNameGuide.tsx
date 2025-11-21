'use client'

import { useState } from 'react'
import { HelpCircle, CheckCircle, XCircle, Lightbulb } from 'lucide-react'

export default function FieldNameGuide() {
  const [showGuide, setShowGuide] = useState(false)

  const validExamples = [
    { input: 'Nome Completo', output: 'nome_completo', reason: 'Espaços → underscore' },
    { input: 'E-mail', output: 'email', reason: 'Hífen removido' },
    { input: 'Data de Nascimento', output: 'data_de_nascimento', reason: 'Espaços → underscore' },
    { input: 'CPF', output: 'cpf', reason: 'Minúsculas' },
    { input: 'Endereço', output: 'endereco', reason: 'Acento removido' },
    { input: '1º Nome', output: 'field_1_nome', reason: 'Não pode começar com número' }
  ]

  const invalidExamples = [
    { input: 'user', reason: 'Palavra reservada do PostgreSQL' },
    { input: 'select', reason: 'Palavra reservada do PostgreSQL' },
    { input: 'table', reason: 'Palavra reservada do PostgreSQL' },
    { input: 'campo-especial', reason: 'Hífen não permitido' },
    { input: 'campo com espaços', reason: 'Espaços não permitidos' },
    { input: '123campo', reason: 'Não pode começar com número' }
  ]

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Guia de Nomes de Campos</span>
      </button>

      {showGuide && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">📋 Regras para Nomes de Campos</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exemplos Válidos */}
            <div>
              <h5 className="flex items-center space-x-2 text-sm font-medium text-green-800 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span>Exemplos Válidos</span>
              </h5>
              <div className="space-y-2">
                {validExamples.map((example, index) => (
                  <div key={index} className="bg-white p-2 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">"{example.input}"</span>
                      <span className="text-sm font-mono text-green-600">{example.output}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{example.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exemplos Inválidos */}
            <div>
              <h5 className="flex items-center space-x-2 text-sm font-medium text-red-800 mb-2">
                <XCircle className="h-4 w-4" />
                <span>Exemplos Inválidos</span>
              </h5>
              <div className="space-y-2">
                {invalidExamples.map((example, index) => (
                  <div key={index} className="bg-white p-2 rounded border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-red-600">"{example.input}"</span>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-xs text-red-700 mt-1">{example.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <h6 className="text-sm font-medium text-yellow-800 mb-1">💡 Dicas Importantes:</h6>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Use apenas letras (a-z), números (0-9) e underscore (_)</li>
                  <li>• Sempre comece com uma letra</li>
                  <li>• Use snake_case (palavras separadas por underscore)</li>
                  <li>• Evite acentos e caracteres especiais</li>
                  <li>• Máximo de 63 caracteres</li>
                  <li>• Evite palavras reservadas do PostgreSQL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}