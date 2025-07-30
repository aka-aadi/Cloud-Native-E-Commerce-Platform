#!/bin/bash

# User data script for 100% free EC2 setup with PostgreSQL on same instance
set -e

# Variables from Terraform
AWS_REGION="${aws_region}"
S3_BUCKET="${s3_bucket}"

# Update system
yum update -y

# Install required packages
yum install -y git nginx

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install PostgreSQL 15
yum install -y postgresql15-server postgresql15

# Initialize PostgreSQL
/usr/pgsql-15/bin/postgresql-15-setup initdb

# Start and enable PostgreSQL
systemctl start postgresql-15
systemctl enable postgresql-15

# Configure PostgreSQL
sudo -u postgres psql << 'EOF'
CREATE DATABASE musicmart_db;
CREATE USER musicmart_user WITH PASSWORD 'musicmart_password_2024';
GRANT ALL PRIVILEGES ON DATABASE musicmart_db TO musicmart_user;
ALTER USER musicmart_user CREATEDB;
\q
EOF

# Configure PostgreSQL to accept connections
echo "host all all 127.0.0.1/32 md5" >> /var/lib/pgsql/15/data/pg_hba.conf
echo "listen_addresses = 'localhost'" >> /var/lib/pgsql/15/data/postgresql.conf

# Restart PostgreSQL
systemctl restart postgresql-15

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Create application directory
mkdir -p /opt/musicmart
cd /opt/musicmart

# Create package.json
cat > package.json << 'EOF'
{
  "name": "musicmart",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000",
    "dev": "next dev"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "pg": "^8.11.3",
    "@aws-sdk/client-s3": "^3.450.0",
    "next-auth": "^4.24.5",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
EOF

# Install dependencies
npm install

# Create basic Next.js app structure
mkdir -p app/api/health
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  user: 'musicmart_user',
  host: 'localhost',
  database: 'musicmart_db',
  password: 'musicmart_password_2024',
  port: 5432,
})

export async function GET() {
  try {
    // Test database connection
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      database: "connected",
      dbTime: result.rows[0].now
    })
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed"
    }, { status: 500 })
  }
}
EOF

# Create database initialization API
mkdir -p app/api/init-db
cat > app/api/init-db/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  user: 'musicmart_user',
  host: 'localhost',
  database: 'musicmart_db',
  password: 'musicmart_password_2024',
  port: 5432,
})

export async function POST() {
  try {
    const client = await pool.connect()
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Insert sample data
    await client.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Guitars', 'Electric and acoustic guitars'),
      ('Keyboards', 'Digital pianos and synthesizers'),
      ('Drums', 'Drum sets and percussion'),
      ('Audio Equipment', 'Microphones, speakers, and audio gear')
      ON CONFLICT DO NOTHING
    `)
    
    await client.query(`
      INSERT INTO products (name, description, price, category_id) VALUES 
      ('Electric Guitar Starter Pack', 'Perfect for beginners', 299.99, 1),
      ('Digital Piano 88-Key', 'Weighted keys, multiple sounds', 599.99, 2),
      ('5-Piece Drum Set', 'Complete acoustic drum kit', 899.99, 3),
      ('USB Microphone', 'Professional recording microphone', 149.99, 4)
      ON CONFLICT DO NOTHING
    `)
    
    // Create admin user
    await client.query(`
      INSERT INTO users (email, password, name, role) VALUES 
      ('admin@musicmart.com', 'hashed_password_here', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `)
    
    client.release()
    
    return NextResponse.json({
      status: "success",
      message: "Database initialized successfully"
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      status: "error",
      message: "Database initialization failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
EOF

# Create products API
mkdir -p app/api/products
cat > app/api/products/route.ts << 'EOF'
import { NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  user: 'musicmart_user',
  host: 'localhost',
  database: 'musicmart_db',
  password: 'musicmart_password_2024',
  port: 5432,
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `)
    client.release()
    
    return NextResponse.json({
      products: result.rows
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch products"
    }, { status: 500 })
  }
}
EOF

# Create main page
mkdir -p app
cat > app/page.tsx << 'EOF'
'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category_name: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dbInitialized, setDbInitialized] = useState(false)

  const initializeDatabase = async () => {
    try {
      const response = await fetch('/api/init-db', { method: 'POST' })
      if (response.ok) {
        setDbInitialized(true)
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🎵 MusicMart - Loading...</h1>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#2563eb', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🎵 MusicMart
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>
          Your 100% Free Music Marketplace on AWS
        </p>
        <div style={{ 
          background: '#10b981', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.5rem',
          display: 'inline-block',
          marginTop: '1rem'
        }}>
          ✅ Running on AWS Free Tier - $0/month
        </div>
      </header>

      {!dbInitialized && products.length === 0 && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={initializeDatabase}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            Initialize Database
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {products.map((product) => (
          <div key={product.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              {product.name}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                background: '#f3f4f6', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                {product.category_name}
              </span>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#059669' 
              }}>
                ${product.price}
              </span>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            No products found. Click "Initialize Database" to add sample products.
          </p>
        </div>
      )}

      <footer style={{ 
        marginTop: '4rem', 
        textAlign: 'center', 
        padding: '2rem',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          🆓 100% Free AWS Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Compute:</strong><br />
            EC2 t2.micro (750h/month free)
          </div>
          <div>
            <strong>Database:</strong><br />
            PostgreSQL on EC2 (free)
          </div>
          <div>
            <strong>Storage:</strong><br />
            S3 (5GB free)
          </div>
          <div>
            <strong>Network:</strong><br />
            VPC + Public subnets (free)
          </div>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Total monthly cost: <strong style={{ color: '#059669' }}>$0.00</strong> 
          (within AWS Free Tier limits)
        </p>
      </footer>
    </div>
  )
}
EOF

cat > app/layout.tsx << 'EOF'
export const metadata = {
  title: 'MusicMart - Free Music Marketplace',
  description: 'Your 100% free music marketplace running on AWS Free Tier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#f9fafb' }}>
        {children}
      </body>
    </html>
  )
}
EOF

# Create next.config.js
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

export default nextConfig
EOF

# Create TypeScript config
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
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create environment file
cat > .env.local << EOF
NODE_ENV=production
DATABASE_URL=postgresql://musicmart_user:musicmart_password_2024@localhost:5432/musicmart_db
AWS_REGION=${AWS_REGION}
S3_BUCKET_NAME=${S3_BUCKET}
EOF

# Set proper permissions
chown -R ec2-user:ec2-user /opt/musicmart
chmod +x /opt/musicmart

# Build the application
sudo -u ec2-user bash -c "cd /opt/musicmart && npm run build"

# Create PM2 ecosystem file
cat > /opt/musicmart/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'musicmart',
    script: 'npm',
    args: 'start',
    cwd: '/opt/musicmart',
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

# Configure Nginx as reverse proxy
cat > /etc/nginx/conf.d/musicmart.conf << 'EOF'
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
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Remove default Nginx config
rm -f /etc/nginx/conf.d/default.conf

# Restart Nginx
systemctl restart nginx

# Start the application with PM2
sudo -u ec2-user bash -c "cd /opt/musicmart && pm2 start ecosystem.config.js"
sudo -u ec2-user bash -c "pm2 startup"
sudo -u ec2-user bash -c "pm2 save"

# Create a simple health check script - Fixed the curl command
cat > /opt/musicmart/health-check.sh << 'HEALTH_EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -eq 200 ]; then
    echo "$(date): Application is healthy"
else
    echo "$(date): Application is unhealthy, restarting..."
    pm2 restart musicmart
fi
HEALTH_EOF

chmod +x /opt/musicmart/health-check.sh

# Add health check to crontab
echo "*/5 * * * * /opt/musicmart/health-check.sh >> /var/log/health-check.log 2>&1" | crontab -

# Log completion
echo "$(date): MusicMart 100% free application setup completed successfully" >> /var/log/user-data.log
