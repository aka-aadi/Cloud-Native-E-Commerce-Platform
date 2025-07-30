#!/bin/bash

# Legato E-commerce Platform Setup Script
# This script sets up a complete e-commerce platform on Amazon Linux 2
# Cost: $0.00/month (AWS Free Tier)

set -e

# Configuration variables from Terraform
AWS_REGION="${aws_region}"
S3_BUCKET="${s3_bucket}"
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"

# Application configuration
APP_NAME="legato"
APP_DIR="/opt/$APP_NAME"
APP_USER="ec2-user"
NODE_VERSION="18"
POSTGRES_VERSION="15"

# Logging setup
LOG_FILE="/var/log/legato-setup.log"
exec 1> >(tee -a $LOG_FILE)
exec 2>&1

echo "=== Legato Setup Started at $(date) ==="
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
    postgresql15-server \
    postgresql15 \
    postgresql15-contrib \
    amazon-cloudwatch-agent

# Install Node.js 18
echo "📦 Installing Node.js $NODE_VERSION..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js installed: $node_version"
echo "✅ npm installed: $npm_version"

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql

# Configure PostgreSQL
echo "🔧 Configuring PostgreSQL..."
sudo -u postgres psql << 'EOF'
CREATE USER legato_user WITH PASSWORD 'legato_secure_2024!';
CREATE DATABASE legato_db OWNER legato_user;
GRANT ALL PRIVILEGES ON DATABASE legato_db TO legato_user;
ALTER USER legato_user CREATEDB;
\q
EOF

# Configure PostgreSQL for local connections
echo "🔧 Configuring PostgreSQL authentication..."
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
cp $PG_HBA $PG_HBA.backup
sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" $PG_HBA
systemctl restart postgresql

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Clone application code (using a simple approach for demo)
echo "📥 Setting up application code..."
cd $APP_DIR

# Create package.json
cat > package.json << 'EOF'
{
  "name": "legato",
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
    "pg": "^8.11.3",
    "@types/pg": "^8.10.7",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.4",
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.3",
    "aws-sdk": "^2.1490.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
EOF

# Create basic Next.js configuration
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
EOF

# Create TypeScript configuration
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

# Create Tailwind CSS configuration
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

# Create PostCSS configuration
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

# Create app directory structure
mkdir -p app/api/{health,products,init-db}
mkdir -p lib
mkdir -p public

# Create global CSS
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
EOF

# Create database connection
cat > lib/db.ts << 'EOF'
import { Pool } from 'pg'

const pool = new Pool({
  user: 'legato_user',
  host: 'localhost',
  database: 'legato_db',
  password: 'legato_secure_2024!',
  port: 5432,
})

export default pool
EOF

# Create health check API
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      version: '1.0.0'
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
import pool from '@/lib/db'

export async function POST() {
  try {
    const client = await pool.connect()
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(500),
        stock_quantity INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Insert sample categories
    await client.query(`
      INSERT INTO categories (name, description) VALUES
      ('Guitars', 'Electric and acoustic guitars'),
      ('Keyboards', 'Digital pianos and synthesizers'),
      ('Drums', 'Drum sets and percussion instruments'),
      ('Audio', 'Recording and sound equipment')
      ON CONFLICT (name) DO NOTHING
    `)
    
    // Insert sample products
    await client.query(`
      INSERT INTO products (name, description, price, category, image_url, stock_quantity, featured) VALUES
      ('Electric Guitar Pro', 'Professional electric guitar with premium pickups', 899.99, 'Guitars', '/placeholder.svg?height=300&width=300&text=Electric+Guitar', 15, true),
      ('Digital Piano 88', '88-key weighted digital piano', 1299.99, 'Keyboards', '/placeholder.svg?height=300&width=300&text=Digital+Piano', 8, true),
      ('Drum Set Complete', '5-piece acoustic drum set', 799.99, 'Drums', '/placeholder.svg?height=300&width=300&text=Drum+Set', 5, false),
      ('Studio Microphone', 'Professional condenser microphone', 299.99, 'Audio', '/placeholder.svg?height=300&width=300&text=Microphone', 20, true),
      ('Bass Guitar', '4-string electric bass guitar', 649.99, 'Guitars', '/placeholder.svg?height=300&width=300&text=Bass+Guitar', 12, false),
      ('Synthesizer', 'Analog modeling synthesizer', 1599.99, 'Keyboards', '/placeholder.svg?height=300&width=300&text=Synthesizer', 6, true)
      ON CONFLICT DO NOTHING
    `)
    
    client.release()
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
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
import pool from '@/lib/db'

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT * FROM products 
      ORDER BY featured DESC, created_at DESC
    `)
    client.release()
    
    return NextResponse.json({
      products: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
EOF

# Create main layout
cat > app/layout.tsx << 'EOF'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Legato - Your Music Store',
  description: 'Professional music instruments and equipment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">🎵 Legato</h1>
            <p className="text-blue-100">Your Professional Music Store</p>
          </div>
        </nav>
        {children}
        <footer className="bg-gray-800 text-white p-8 mt-12">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 Legato. Powered by AWS Free Tier.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
EOF

# Create main page
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

  useEffect(() => {
    fetchProducts()
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!dbInitialized || products.length === 0) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Legato!</h2>
          <p className="text-gray-600 mb-8">Initialize the database to get started</p>
          <button
            onClick={initializeDatabase}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Initialize Database
          </button>
        </div>
      </main>
    )
  }

  const featuredProducts = products.filter(p => p.featured)
  const regularProducts = products.filter(p => !p.featured)

  return (
    <main className="container mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">🎵 Welcome to Legato</h2>
        <p className="text-xl text-gray-600">Your one-stop shop for professional music equipment</p>
        <div className="mt-4 p-4 bg-green-100 rounded-lg inline-block">
          <p className="text-green-800 font-semibold">✅ Running on AWS Free Tier - $0.00/month</p>
        </div>
      </div>

      {featuredProducts.length > 0 && (
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">⭐ Featured Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-200">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h4 className="text-xl font-semibold mb-2">{product.name}</h4>
                <p className="text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {regularProducts.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-6">🎼 All Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="text-lg font-semibold mb-2">{product.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">${product.price}</span>
                  <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                </div>
                <button className="w-full mt-3 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 text-center">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🚀 Deployment Status</h3>
          <p className="text-gray-600">
            This e-commerce platform is running on AWS Free Tier with PostgreSQL database,
            Next.js frontend, and complete management system.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded">
              <strong>Database:</strong> PostgreSQL 15
            </div>
            <div className="bg-white p-3 rounded">
              <strong>Frontend:</strong> Next.js 14
            </div>
            <div className="bg-white p-3 rounded">
              <strong>Hosting:</strong> AWS EC2 Free Tier
            </div>
          </div>
        </div>
      </div>
    </main>
  )
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
      PORT: 3000,
      AWS_REGION: '$AWS_REGION',
      S3_BUCKET: '$S3_BUCKET'
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
        return 200 "healthy\n";
        add_header Content-Type text/plain;
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
    echo "$(date): nginx is not running" >> $LOG_FILE
fi

# Check postgresql
if systemctl is-active --quiet postgresql; then
    echo "$(date): postgresql is running" >> $LOG_FILE
else
    echo "$(date): postgresql is not running" >> $LOG_FILE
fi

# Check application - simple approach without curl format strings
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "$(date): application is healthy" >> $LOG_FILE
else
    echo "$(date): application is unhealthy" >> $LOG_FILE
fi

echo "$(date): Health check completed" >> $LOG_FILE
HEALTH_SCRIPT_EOF

chmod +x /usr/local/bin/health-check.sh

# Setup health check cron job
echo "*/5 * * * * /usr/local/bin/health-check.sh" | crontab -

# Create startup script
cat > /etc/systemd/system/legato.service << 'EOF'
[Unit]
Description=Legato E-commerce Application
After=network.target postgresql.service

[Service]
Type=forking
User=ec2-user
WorkingDirectory=/opt/legato
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable legato

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
EOF

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

# Final system optimization
echo "⚡ Optimizing system..."

# Configure swap (helps with memory management)
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Optimize PostgreSQL for small instance
sudo -u postgres psql << 'EOF'
ALTER SYSTEM SET shared_buffers = '128MB';
ALTER SYSTEM SET effective_cache_size = '512MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
\q
EOF

# Create welcome message
cat > /etc/motd << 'EOF'

🎵 Welcome to Legato E-commerce Platform! 🎵

This server is running a complete e-commerce solution:
- Next.js 14 frontend
- PostgreSQL 15 database
- Nginx reverse proxy
- PM2 process manager
- AWS Free Tier optimized

Quick Commands:
- Check app status: pm2 status
- View app logs: pm2 logs legato
- Restart app: pm2 restart legato
- Check health: curl localhost/api/health
- Database access: sudo -u postgres psql -d legato_db

Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

Cost: $0.00/month (AWS Free Tier)

EOF

# Final status check
echo "🔍 Running final health checks..."
sleep 10

# Check if services are running
systemctl is-active --quiet nginx && echo "✅ Nginx is running" || echo "❌ Nginx failed"
systemctl is-active --quiet postgresql && echo "✅ PostgreSQL is running" || echo "❌ PostgreSQL failed"
sudo -u $APP_USER pm2 list | grep -q "online" && echo "✅ Application is running" || echo "❌ Application failed"

# Test application endpoint
sleep 5
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
fi

echo "=== Legato Setup Completed at $(date) ==="
echo "🎉 Your e-commerce platform is ready!"
echo "💰 Monthly cost: $0.00 (AWS Free Tier)"
echo "🌐 Access your store at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📋 Check status: curl http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/health"

# Log completion
echo "Setup completed successfully at $(date)" >> $LOG_FILE
