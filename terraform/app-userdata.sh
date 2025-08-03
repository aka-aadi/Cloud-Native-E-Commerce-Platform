#!/bin/bash

# Zero-Cost E-commerce Platform Setup Script
# Uses only AWS Free Tier resources - $0.00/month
set -e

# Configuration variables from Terraform
AWS_REGION="${aws_region}"
S3_BUCKET="${s3_bucket}"
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"

# Application configuration
APP_NAME="legato-free"
APP_DIR="/opt/$APP_NAME"
APP_USER="ec2-user"

# Logging setup
LOG_FILE="/var/log/legato-setup.log"
exec 1> >(tee -a $LOG_FILE)
exec 2>&1

echo "=== Zero-Cost Legato Setup Started at $(date) ==="
echo "💰 Monthly Cost: \$0.00 (AWS Free Tier Only)"
echo "AWS Region: $AWS_REGION"
echo "S3 Bucket: $S3_BUCKET"
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"

# Update system packages
echo "📦 Updating system packages..."
yum update -y

# Install essential packages
echo "🔧 Installing essential packages..."
yum install -y \
    git \
    curl \
    wget \
    unzip \
    htop \
    nginx \
    postgresql \
    docker

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Verify installations
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js installed: $node_version"
echo "✅ npm installed: $npm_version"

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Start and enable Docker
echo "🐳 Setting up Docker..."
systemctl start docker
systemctl enable docker
usermod -a -G docker $APP_USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
echo "📦 Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Configure AWS CLI for the instance
mkdir -p /home/$APP_USER/.aws
cat > /home/$APP_USER/.aws/config << EOF
[default]
region = $AWS_REGION
output = json
EOF

chown -R $APP_USER:$APP_USER /home/$APP_USER/.aws

# Setup local SQLite database (free alternative to RDS)
echo "🗄️ Setting up SQLite database..."
mkdir -p $APP_DIR/data
chown $APP_USER:$APP_USER $APP_DIR/data

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Create environment file
echo "📝 Creating environment configuration..."
cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=3000
AWS_REGION=$AWS_REGION
S3_BUCKET=$S3_BUCKET

# Database Configuration (SQLite for zero cost)
DATABASE_URL=sqlite:$APP_DIR/data/database.sqlite

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# AWS Configuration
AWS_S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# Create application files
cd $APP_DIR

# Create package.json
cat > package.json << 'EOF'
{
  "name": "legato-free-ecommerce",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000",
    "dev": "next dev",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "sqlite3": "^5.1.6",
    "better-sqlite3": "^9.2.2",
    "@types/better-sqlite3": "^7.6.8",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.4",
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.3",
    "aws-sdk": "^2.1490.0",
    "@aws-sdk/client-s3": "^3.450.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10",
    "postcss": "^8"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
EOF

# Create Dockerfile for local development
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]
EOF

# Create Next.js configuration
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
EOF

# Create basic application structure
mkdir -p app/api/{health,products,init-db}
mkdir -p lib
mkdir -p public

# Create database connection utility (SQLite)
cat > lib/db.ts << 'EOF'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/opt/legato-free/data/database.sqlite'
  : path.join(process.cwd(), 'data', 'database.sqlite')

let db: Database.Database

try {
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  console.log('✅ SQLite database connected')
} catch (error) {
  console.error('❌ SQLite connection failed:', error)
  throw error
}

export default db
EOF

# Create health check API
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const result = db.prepare('SELECT datetime("now") as now').get()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      cost: '$0.00/month (AWS Free Tier)',
      database_type: 'SQLite'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
EOF

# Create database initialization API
cat > app/api/init-db/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST() {
  try {
    // Create products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        image_url TEXT,
        stock_quantity INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create orders table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create order_items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `)
    
    // Insert sample categories
    const insertCategory = db.prepare(`
      INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)
    `)
    
    insertCategory.run('Guitars', 'Electric and acoustic guitars')
    insertCategory.run('Keyboards', 'Digital pianos and synthesizers')
    insertCategory.run('Drums', 'Drum sets and percussion instruments')
    insertCategory.run('Audio', 'Recording and sound equipment')
    
    // Insert sample products
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (name, description, price, category, image_url, stock_quantity, featured) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertProduct.run('Electric Guitar Pro', 'Professional electric guitar with premium pickups', 899.99, 'Guitars', '/placeholder.svg?height=300&width=300&text=Electric+Guitar', 15, 1)
    insertProduct.run('Digital Piano 88', '88-key weighted digital piano', 1299.99, 'Keyboards', '/placeholder.svg?height=300&width=300&text=Digital+Piano', 8, 1)
    insertProduct.run('Drum Set Complete', '5-piece acoustic drum set', 799.99, 'Drums', '/placeholder.svg?height=300&width=300&text=Drum+Set', 5, 0)
    insertProduct.run('Studio Microphone', 'Professional condenser microphone', 299.99, 'Audio', '/placeholder.svg?height=300&width=300&text=Microphone', 20, 1)
    insertProduct.run('Bass Guitar', '4-string electric bass guitar', 649.99, 'Guitars', '/placeholder.svg?height=300&width=300&text=Bass+Guitar', 12, 0)
    insertProduct.run('Synthesizer', 'Analog modeling synthesizer', 1599.99, 'Keyboards', '/placeholder.svg?height=300&width=300&text=Synthesizer', 6, 1)
    
    return NextResponse.json({
      success: true,
      message: 'SQLite database initialized successfully - Zero Cost!',
      timestamp: new Date().toISOString(),
      database_type: 'SQLite',
      cost: '$0.00/month'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
EOF

# Create products API
cat > app/api/products/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    const products = db.prepare(`
      SELECT * FROM products 
      ORDER BY featured DESC, created_at DESC
    `).all()
    
    return NextResponse.json({
      products: products,
      count: products.length
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, category, image_url, stock_quantity, featured } = body
    
    const insert = db.prepare(`
      INSERT INTO products (name, description, price, category, image_url, stock_quantity, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = insert.run(name, description, price, category, image_url, stock_quantity, featured ? 1 : 0)
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
    
    return NextResponse.json({
      success: true,
      product: product
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
EOF

# Create main application layout and pages
mkdir -p app
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

.cost-badge {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: bold;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
EOF

cat > app/layout.tsx << 'EOF'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Legato - Zero Cost E-commerce Platform',
  description: 'Professional music instruments - Powered by AWS Free Tier ($0.00/month)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎵 Legato</h1>
              <p className="text-green-100">Zero Cost E-commerce Platform</p>
            </div>
            <div className="cost-badge">
              💰 $0.00/month
            </div>
          </div>
        </nav>
        {children}
        <footer className="bg-gray-800 text-white p-8 mt-12">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 Legato. Powered by AWS Free Tier - Zero Cost!</p>
            <p className="text-sm text-gray-400 mt-2">
              EC2 t2.micro • SQLite Database • S3 Storage • 100% Free Tier
            </p>
            <div className="mt-4 text-green-400 font-bold">
              🎉 Monthly Cost: $0.00 - Perfect for Testing & Learning!
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  featured: boolean
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
    fetchHealthStatus()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.products) {
        setProducts(data.products)
        setDbInitialized(true)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error('Error fetching health status:', error)
    }
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        await fetchProducts()
        setDbInitialized(true)
      }
    } catch (error) {
      console.error('Error initializing database:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading zero-cost e-commerce platform...</p>
        </div>
      </main>
    )
  }

  if (!dbInitialized || products.length === 0) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🚀 Welcome to Legato!
          </h2>
          <p className="text-xl text-gray-600 mb-8">Zero Cost E-commerce Platform on AWS Free Tier</p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl mb-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-green-800">💰 100% FREE AWS Infrastructure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <h4 className="font-bold text-green-700">🖥️ Compute</h4>
                <p className="text-gray-600">EC2 t2.micro</p>
                <p className="text-green-600 font-semibold">750 hrs/month FREE</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-700">🗄️ Database</h4>
                <p className="text-gray-600">SQLite Local</p>
                <p className="text-green-600 font-semibold">100% FREE</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-700">📦 Storage</h4>
                <p className="text-gray-600">S3 + EBS</p>
                <p className="text-green-600 font-semibold">5GB + 30GB FREE</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                <h4 className="font-bold text-orange-700">🌐 Network</h4>
                <p className="text-gray-600">Data Transfer</p>
                <p className="text-green-600 font-semibold">15GB/month FREE</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <h4 className="font-bold text-green-800 text-lg">🎯 Perfect for:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                <div className="text-green-700">✅ Learning & Testing</div>
                <div className="text-green-700">✅ Portfolio Projects</div>
                <div className="text-green-700">✅ MVP Development</div>
              </div>
            </div>
          </div>

          {healthStatus && (
            <div className="bg-green-50 p-6 rounded-lg mb-6 max-w-md mx-auto border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">🏥 System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Database:</span>
                  <span className="font-semibold text-green-800">{healthStatus.database_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Environment:</span>
                  <span className="font-semibold text-green-800">{healthStatus.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Uptime:</span>
                  <span className="font-semibold text-green-800">{Math.floor(healthStatus.uptime)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Monthly Cost:</span>
                  <span className="font-bold text-green-600">{healthStatus.cost}</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={initializeDatabase}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
          >
            🚀 Initialize SQLite Database (FREE)
          </button>
          
          <p className="mt-4 text-sm text-gray-600">
            No RDS charges • No additional costs • Perfect for testing!
          </p>
        </div>
      </main>
    )
  }

  const featuredProducts = products.filter(p => p.featured)
  const regularProducts = products.filter(p => !p.featured)

  return (
    <main className="container mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🎵 Legato Music Store
        </h2>
        <p className="text-xl text-gray-600 mb-6">Zero Cost E-commerce Platform</p>
        
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl max-w-4xl mx-auto mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">🎉 Running 100% FREE on AWS!</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-bold text-green-600">$0.00/month</h4>
              <p className="text-sm text-gray-600">AWS Free Tier</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-bold text-blue-600">750 Hours</h4>
              <p className="text-sm text-gray-600">EC2 t2.micro FREE</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl mb-2">📦</div>
              <h4 className="font-bold text-purple-600">35GB Storage</h4>
              <p className="text-sm text-gray-600">S3 + EBS FREE</p>
            </div>
          </div>
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <section className="mb-12">
          <h3 className="text-3xl font-bold mb-6 text-center">⭐ Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200 hover:shadow-xl transition-all hover:scale-105">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h4 className="text-xl font-semibold mb-2">{product.name}</h4>
                <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">${product.price}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {regularProducts.length > 0 && (
        <section>
          <h3 className="text-3xl font-bold mb-6 text-center">🎼 All Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-105">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-lg font-semibold mb-2">{product.name}</h4>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.stock_quantity}
                  </span>
                </div>
                <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl shadow-lg">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">🏗️ Zero Cost Architecture</h3>
          <p className="text-gray-700 mb-6 text-lg">
            This e-commerce platform runs entirely on AWS Free Tier resources,
            making it perfect for learning, testing, and portfolio projects.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 mb-3 text-lg">🖥️ Compute</h4>
              <ul className="text-left space-y-2">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>EC2 t2.micro</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>750 hours/month</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>1 vCPU, 1GB RAM</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-600 mb-3 text-lg">🗄️ Database</h4>
              <ul className="text-left space-y-2">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>SQLite Local</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>No RDS costs</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Perfect for testing</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h4 className="font-bold text-purple-600 mb-3 text-lg">📦 Storage</h4>
              <ul className="text-left space-y-2">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>S3: 5GB free</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>EBS: 30GB free</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Static assets</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <h4 className="font-bold text-orange-600 mb-3 text-lg">🌐 Network</h4>
              <ul className="text-left space-y-2">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>15GB transfer</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Elastic IP</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>VPC included</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <h4 className="text-xl font-bold text-gray-800 mb-4">🎯 Why This Architecture?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🎓</div>
                <h5 className="font-semibold text-gray-700">Perfect for Learning</h5>
                <p className="text-gray-600">Experiment without costs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💼</div>
                <h5 className="font-semibold text-gray-700">Portfolio Ready</h5>
                <p className="text-gray-600">Showcase your skills</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h5 className="font-semibold text-gray-700">MVP Development</h5>
                <p className="text-gray-600">Test ideas quickly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
EOF

# Create Tailwind and other config files
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
EOF

cat > postcss.config.mjs << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Set ownership
chown -R $APP_USER:$APP_USER $APP_DIR

# Install dependencies
echo "📦 Installing application dependencies..."
cd $APP_DIR
sudo -u $APP_USER npm install

# Build the application
echo "🔨 Building application..."
sudo -u $APP_USER npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application with PM2
echo "🚀 Starting application..."
cd $APP_DIR
sudo -u $APP_USER pm2 start ecosystem.config.js
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/conf.d/legato.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default Nginx configuration
rm -f /etc/nginx/conf.d/default.conf

# Test and start Nginx
nginx -t
systemctl enable nginx
systemctl start nginx

# Create health check script
cat > /usr/local/bin/health-check.sh << 'HEALTH_SCRIPT_EOF'
#!/bin/bash

LOG_FILE="/var/log/health-check.log"

echo "$(date): Starting health check..." >> $LOG_FILE

# Check nginx
if systemctl is-active --quiet nginx; then
    echo "$(date): nginx is running" >> $LOG_FILE
else
    echo "$(date): nginx is not running, attempting restart" >> $LOG_FILE
    systemctl restart nginx
fi

# Check application
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "$(date): application is healthy" >> $LOG_FILE
else
    echo "$(date): application is unhealthy, attempting restart" >> $LOG_FILE
    sudo -u $APP_USER pm2 restart $APP_NAME
fi

echo "$(date): Health check completed" >> $LOG_FILE
HEALTH_SCRIPT_EOF

chmod +x /usr/local/bin/health-check.sh

# Setup health check cron job
echo "*/5 * * * * /usr/local/bin/health-check.sh" | crontab -

# Configure log rotation
cat > /etc/logrotate.d/legato << 'EOF'
/var/log/health-check.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}

/var/log/legato-setup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

# Create welcome message
cat > /etc/motd << 'EOF'

🎵 Welcome to Legato Zero-Cost E-commerce Platform! 🎵

💰 Monthly Cost: $0.00 (AWS Free Tier Only)

This server is running a complete e-commerce solution:
- Next.js 14 with TypeScript
- SQLite database (local, no RDS costs)
- Docker containerization
- Nginx reverse proxy
- PM2 process manager
- AWS Free Tier optimized

Quick Commands:
- Check app status: pm2 status
- View app logs: pm2 logs legato-free
- Restart app: pm2 restart legato-free
- Check health: curl localhost/api/health

Free Tier Resources Used:
- EC2 t2.micro (750 hours/month FREE)
- EBS 8GB storage (30GB/month FREE)
- S3 storage (5GB/month FREE)
- Data transfer (15GB/month FREE)

Perfect for:
🎓 Learning and experimentation
💼 Portfolio projects
🚀 MVP development and testing

EOF

# Final status check
echo "🔍 Running final health checks..."
sleep 10

# Check if services are running
systemctl is-active --quiet nginx && echo "✅ Nginx is running" || echo "❌ Nginx failed"
sudo -u $APP_USER pm2 list | grep -q "online" && echo "✅ Application is running" || echo "❌ Application failed"

# Test application endpoint
sleep 5
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
fi

echo "=== Zero-Cost Legato Setup Completed at $(date) ==="
echo "🎉 Your zero-cost e-commerce platform is ready!"
echo "💰 Monthly cost: \$0.00 (AWS Free Tier)"
echo "🌐 Access your store at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📋 Health check: curl http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/health"
echo "🎯 Perfect for testing, learning, and portfolio projects!"

# Log completion
echo "Zero-cost setup completed successfully at $(date)" >> $LOG_FILE
