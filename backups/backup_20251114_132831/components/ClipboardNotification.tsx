'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Copy, Clipboard, Files, Scissors, X } from 'lucide-react'

interface NotificationProps {
  type: 'copy' | 'paste' | 'duplicate' | 'cut'
  count: number
  onClose: () => void
}

export default function ClipboardNotification({ type, count, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Aguardar animação
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'copy': return <Copy className="h-5 w-5 text-blue-600" />
      case 'paste': return <Clipboard className="h-5 w-5 text-green-600" />
      case 'duplicate': return <Files className="h-5 w-5 text-purple-600" />
      case 'cut': return <Scissors className="h-5 w-5 text-orange-600" />
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'copy': return `${count} campo(s) copiado(s)`
      case 'paste': return `${count} campo(s) colado(s)`
      case 'duplicate': return `${count} campo(s) duplicado(s)`
      case 'cut': return `${count} campo(s) cortado(s)`
    }
  }

  const getColor = () => {
    switch (type) {
      case 'copy': return 'bg-blue-50 border-blue-200'
      case 'paste': return 'bg-green-50 border-green-200'
      case 'duplicate': return 'bg-purple-50 border-purple-200'
      case 'cut': return 'bg-orange-50 border-orange-200'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg ${getColor()}`}>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {getMessage()}
          </p>
          <p className="text-xs text-gray-600">
            Operação realizada com sucesso
          </p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}