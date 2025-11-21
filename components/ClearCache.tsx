'use client'

export default function ClearCache() {
  const clearCache = async () => {
    try {
      // Limpar cache do navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('✅ Cache do navegador limpo')
      }

      // Limpar localStorage
      localStorage.clear()
      console.log('✅ localStorage limpo')

      // Limpar sessionStorage
      sessionStorage.clear()
      console.log('✅ sessionStorage limpo')

      // Recarregar a página
      window.location.reload()

    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
      alert('Erro ao limpar cache. Tente recarregar a página manualmente.')
    }
  }

  const hardReload = () => {
    // Força reload sem cache
    window.location.reload()
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-medium text-yellow-800 mb-2">Limpeza de Cache</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Se o PDF.js ainda estiver usando workers antigos, limpe o cache:
      </p>
      <div className="flex gap-2">
        <button
          onClick={clearCache}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
        >
          Limpar Cache Completo
        </button>
        <button
          onClick={hardReload}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  )
}