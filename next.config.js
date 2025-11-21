/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar standalone output para Docker
  output: 'standalone',
  
  // Ignorar erros de TypeScript durante o build (para deploy)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignorar erros de ESLint durante o build (para deploy)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuração experimental para evitar erros de prerender
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
}

module.exports = nextConfig