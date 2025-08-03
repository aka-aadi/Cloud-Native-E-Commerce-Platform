#!/bin/bash

# Zero Cost E-commerce Platform Setup Script
# Optimized for AWS Free Tier t2.micro instance

set -e

# Configuration
PROJECT_NAME="${project_name}"
S3_BUCKET="${s3_bucket}"
AWS_REGION="${aws_region}"
APP_DIR="/opt/legato"
DATA_DIR="/opt/legato/data"
LOG_FILE="/var/log/legato-setup.log"
PORT="${PORT}" # Use the PORT variable passed from Terraform

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "\ud83d\ude80 Starting Zero Cost E-commerce Platform setup..."
log "Project: $PROJECT_NAME"
log "S3 Bucket: $S3_BUCKET"
log "AWS Region: $AWS_REGION"
log "Application Port: $PORT"

# Update system
log "\ud83d\udce6 Updating system packages..."
yum update -y

# Install Node.js 18 (LTS)
log "\ud83d\udce6 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install additional packages (excluding nginx from yum)
log "\ud83d\udce6 Installing additional packages..."
yum install -y git python3 python3-pip gcc-c++ make sqlite

# Install Nginx from Amazon Linux Extras
log "\ud83d\udce6 Installing Nginx from Amazon Linux Extras..."
amazon-linux-extras install nginx1 -y

# Install PM2 globally
log "\ud83d\udce6 Installing PM2 process manager..."
npm install -g pm2

# Create application directory
log "\ud83d\udcc1 Creating application directories..."
mkdir -p "$APP_DIR"
mkdir -p "$DATA_DIR"
mkdir -p /var/log/legato

# Create legato user
log "\ud83d\udc64 Creating legato user..."
useradd -r -s /bin/bash -d "$APP_DIR" legato || true
chown -R legato:legato "$APP_DIR"
chown -R legato:legato /var/log/legato

# Create environment variables
cat > "$APP_DIR/.env" << EOF
PORT=$PORT
JWT_SECRET=changeme
EOF

# Setup system environment
log "\ud83d\udd27 Exporting environment variables..."
echo "export PORT=$PORT" >> /etc/profile.d/legato.sh
echo 'export JWT_SECRET=changeme' >> /etc/profile.d/legato.sh
chmod +x /etc/profile.d/legato.sh

# Setup application files
log "\ud83d\udce5 Downloading application from S3 if exists..."
if aws s3 ls "s3://$S3_BUCKET/$PROJECT_NAME/app/" --region "$AWS_REGION" >/dev/null 2>&1; then
    aws s3 cp --recursive "s3://$S3_BUCKET/$PROJECT_NAME/app/" "$APP_DIR" --region "$AWS_REGION"
    log "✅ Application downloaded from S3."
else
    log "⚠️ No application found in S3. Creating a minimal Express server..."
    cd "$APP_DIR"
    
    # Create a minimal package.json for the server
    cat > package.json << 'EOF'
{
  "name": "legato-server",
  "version": "1.0.0",
  "description": "Zero cost e-commerce platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^8.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  }
}
EOF

    # Install server dependencies
    log "📦 Installing server dependencies..."
    npm install

    # Create a simple Express server
    cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt'); // Changed to bcrypt
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from /opt/legato/public

// Database setup
const dbPath = '/opt/legato/data/legato.db';
const db = new Database(dbPath);

// Initialize database
function initDatabase() {
  console.log('🗄️ Initializing SQLite database...');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INTEGER,
      status TEXT DEFAULT 'approved',
      stock_quantity INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // Insert sample data
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    console.log('🌱 Seeding database with sample data...');
    
    // Insert categories
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCategory.run('Guitars', 'Acoustic and electric guitars');
    insertCategory.run('Keyboards', 'Pianos and keyboards');
    insertCategory.run('Drums', 'Drum sets and percussion');
    
    // Insert admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const insertUser = db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)');
    insertUser.run('admin@legato.com', adminPassword, 'Admin User', 'admin');
    
    // Insert sample products (no image_url as S3 is removed)
    const insertProduct = db.prepare('INSERT INTO products (name, description, price, category_id, featured, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)');
    insertProduct.run('Acoustic Guitar Starter Pack', 'Perfect for beginners', 299.99, 1, true, 15);
    insertProduct.run('Electric Guitar Pro', 'Professional electric guitar', 599.99, 1, true, 8);
    insertProduct.run('Digital Piano 88-Key', 'Full-size weighted keys', 899.99, 2, true, 5);
    insertProduct.run('Professional Drum Set', '5-piece drum set', 1299.99, 3, false, 3);
    
    console.log('✅ Database seeded successfully');
  }
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Legato - Zero Cost E-commerce Platform</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2.5em; color: #2563eb; margin-bottom: 10px; }
        .tagline { color: #666; font-size: 1.2em; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .feature { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .feature h3 { color: #2563eb; margin-top: 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        .cost-banner { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .api-links { margin: 30px 0; }
        .api-links a { display: inline-block; margin: 5px 10px; padding: 10px 15px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
        .api-links a:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎵 Legato</div>
          <div class="tagline">Zero Cost E-commerce Platform on AWS Free Tier</div>
        </div>
        
        <div class="cost-banner">
          <h2>💰 Monthly Cost: $0.00</h2>
          <p>Running entirely on AWS Free Tier resources!</p>
        </div>
        
        <div class="features">
          <div class="feature">
            <h3>🏗️ Architecture</h3>
            <ul>
              <li>EC2 t2.micro instance</li>
              <li>SQLite database</li>
              <li>Local static assets</li>
              <li>Nginx reverse proxy</li>
              <li>PM2 process manager</li>
            </ul>
          </div>
          
          <div class="feature">
            <h3>🎯 Perfect For</h3>
            <ul>
              <li>Learning cloud deployment</li>
              <li>Portfolio projects</li>
              <li>MVP testing</li>
              <li>E-commerce experimentation</li>
            </ul>
          </div>
          
          <div class="feature">
            <h3>🚀 Features</h3>
            <ul>
              <li>Product catalog</li>
              <li>User authentication</li>
              <li>Admin dashboard</li>
              <li>RESTful API</li>
              <li>Responsive design</li>
            </ul>
          </div>
        </div>
        
        <div class="api-links">
          <h3>🔗 API Endpoints</h3>
          <a href="/api/health">Health Check</a>
          <a href="/api/products">Products</a>
          <a href="/api/categories">Categories</a>
          <a href="/api/stats">Statistics</a>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-number" id="products-count">-</div>
            <div>Products</div>
          </div>
          <div class="stat">
            <div class="stat-number" id="categories-count">-</div>
            <div>Categories</div>
          </div>
          <div class="stat">
            <div class="stat-number" id="users-count">-</div>
            <div>Users</div>
          </div>
        </div>
      </div>
      
      <script>
        // Load stats
        fetch('/api/stats')
          .then(res => res.json())
          .then(data => {
            document.getElementById('products-count').textContent = data.totalProducts || 0;
            document.getElementById('categories-count').textContent = data.totalCategories || 0;
            document.getElementById('users-count').textContent = data.totalUsers || 0;
          })
          .catch(err => console.error('Failed to load stats:', err));
      </script>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    cost: '$0.00/month'
  });
});

app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
    `).all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    res.json({
      totalProducts,
      totalCategories,
      totalUsers,
      cost: '$0.00/month',
      platform: 'AWS Free Tier'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Legato server running on port ${PORT}`);
  console.log(`💰 Monthly cost: $0.00 (AWS Free Tier)`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
});
EOF
    log "✅ Minimal Express server created and configured."
fi

# Fix permissions
chown -R legato:legato "$APP_DIR"

# Configure Nginx
log "\ud83c\udf10 Configuring Nginx..."
cat > /etc/nginx/conf.d/legato.conf << EOF
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
        proxy_pass http://127.0.0.1:$PORT; # Use the dynamic PORT variable
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

systemctl restart nginx
systemctl enable nginx

# PM2 configuration
log "\u2699\ufe0f Setting up PM2..."
cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'legato-free',
    script: 'server.js',
    cwd: '/opt/legato',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT # Use the dynamic PORT variable
    },
    log_file: '/var/log/legato/combined.log',
    out_file: '/var/log/legato/out.log',
    error_file: '/var/log/legato/error.log',
    time: true,
    max_memory_restart: '200M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Start app with PM2
cd "$APP_DIR"
sudo -u legato pm2 start ecosystem.config.js
sudo -u legato pm2 save
sudo -u legato pm2 startup systemd -u legato --hp /opt/legato

# Log rotation
log "\ud83d\udcdc Setting up log rotation..."
cat > /etc/logrotate.d/legato << 'EOF'
/var/log/legato/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 legato legato
    postrotate
        sudo -u legato pm2 reloadLogs
    endscript
}
EOF

log "\ud83c\udf89 Setup completed successfully."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Legato deployed at: http://$PUBLIC_IP"
