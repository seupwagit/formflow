import './globals.css'
import { Inter } from 'next/font/google'
import ToastProvider from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema de Mapeamento de Formulários',
  description: 'Transforme PDFs em formulários digitais interativos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}