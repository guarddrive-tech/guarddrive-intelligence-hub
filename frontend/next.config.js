/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Rewrites de /api só são ativados em dev local.
  // Em produção (Vercel), a variável NEXT_PUBLIC_API_URL aponta para o backend real.
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8001/api/:path*',
        },
      ]
    },
  }),
}

module.exports = nextConfig
