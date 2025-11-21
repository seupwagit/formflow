/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar standalone output para Docker
  output: 'standalone',
  
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
}

module.exports = nextConfig