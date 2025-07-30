/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker and serverless deployments
  output: 'standalone',
  
  // Optimize for production
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      's3.amazonaws.com',
      'your-s3-bucket.s3.amazonaws.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // Experimental features
  experimental: {
    // Server actions
    serverActions: true,
    // App directory
    appDir: true,
    // Optimize CSS
    optimizeCss: true,
    // Optimize server components
    serverComponentsExternalPackages: ['pg'],
  },
  
  // TypeScript configuration
  typescript: {
    // Ignore build errors in production (not recommended for production)
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during builds (not recommended for production)
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
