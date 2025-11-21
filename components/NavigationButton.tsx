'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface NavigationButtonProps {
  href: string
  children: ReactNode
  className?: string
  title?: string
  onClick?: () => void
}

export default function NavigationButton({ 
  href, 
  children, 
  className = '', 
  title,
  onClick 
}: NavigationButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Executar callback personalizado se fornecido
    if (onClick) {
      onClick()
    }
    
    // Tentar navegação programática primeiro
    try {
      console.log(`🔄 Navegando para: ${href}`)
      router.push(href)
    } catch (error) {
      console.warn('⚠️ Navegação programática falhou, usando fallback:', error)
      // Fallback: navegação direta
      window.location.href = href
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      title={title}
    >
      {children}
    </Link>
  )
}