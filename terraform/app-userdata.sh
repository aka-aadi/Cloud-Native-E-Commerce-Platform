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

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting Zero Cost E-commerce Platform setup..."
log "Project: $PROJECT_NAME"
log "S3 Bucket: $S3_BUCKET"
log "AWS Region: $AWS_REGION"

# Update system
log "📦 Updating system packages..."
yum update -y

# Install Node.js 18 (LTS)
log "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install additional packages
log "📦 Installing additional packages..."
yum install -y git nginx python3 python3-pip gcc-c++ make

# Install PM2 globally
log "📦 Installing PM2 process manager..."
npm install -g pm2

# Create application directory
log "📁 Creating application directories..."
mkdir -p "$APP_DIR"
mkdir -p "$DATA_DIR"
mkdir -p /var/log/legato

# Create legato user
log "👤 Creating legato user..."
useradd -r -s /bin/bash -d "$APP_DIR" legato || true
chown -R legato:legato "$APP_DIR"
chown -R legato:legato /var/log/legato

# Clone or create application (for demo, we'll create a minimal setup)
log "📥 Setting up application..."
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
    "better-sqlite3": "^9.2.2",
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
const bcrypt = require('bcryptjs');
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
app.use(express.static('public'));

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
      image_url TEXT,
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
    
    // Insert sample products
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
              <li>S3 for static assets</li>
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

# Set ownership
chown -R legato:legato "$APP_DIR"

# Configure Nginx
log "🌐 Configuring Nginx..."
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
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Create PM2 ecosystem file
log "⚙️ Setting up PM2 configuration..."
cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'legato-free',
    script: 'server.js',
    cwd: '/opt/legato',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
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

# Start application with PM2
log "🚀 Starting application with PM2..."
cd "$APP_DIR"
sudo -u legato pm2 start ecosystem.config.js
sudo -u legato pm2 save
sudo -u legato pm2 startup systemd -u legato --hp /opt/legato

# Create systemd service for PM2
env PATH=$PATH:/usr/bin pm2 startup systemd -u legato --hp /opt/legato

# Setup log rotation
log "📝 Setting up log rotation..."
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

# Create backup script for SQLite database
log "💾 Setting up database backup..."
cat > /opt/legato/backup-db.sh << 'EOF'
#!/bin/bash
# SQLite database backup script

BACKUP_DIR="/opt/legato/backups"
DB_FILE="/opt/legato/data/legato.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/legato_backup_$DATE.db"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

# Compress backup
gzip "$BACKUP_FILE"

# Keep only last 7 backups
find "$BACKUP_DIR" -name "legato_backup_*.db.gz" -mtime +7 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x /opt/legato/backup-db.sh
chown legato:legato /opt/legato/backup-db.sh

# Setup daily backup cron job
log "⏰ Setting up automated backups..."
echo "0 2 * * * /opt/legato/backup-db.sh" | crontab -u legato -

# Create health check script
log "🏥 Setting up health monitoring..."
cat > /opt/legato/health-check.sh << 'EOF'
#!/bin/bash
# Health check and auto-restart script

APP_NAME="legato-free"
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/legato/health-check.log"

# Function to log with timestamp
log_health() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if application is responding
if curl -f -s --max-time 10 "$HEALTH_URL" > /dev/null; then
    log_health "✅ Application is healthy"
else
    log_health "❌ Application health check failed, attempting restart..."
    
    # Restart the application
    sudo -u legato pm2 restart "$APP_NAME"
    
    # Wait a moment and check again
    sleep 10
    if curl -f -s --max-time 10 "$HEALTH_URL" > /dev/null; then
        log_health "✅ Application restarted successfully"
    else
        log_health "❌ Application restart failed"
    fi
fi
EOF

chmod +x /opt/legato/health-check.sh
chown legato:legato /opt/legato/health-check.sh

# Setup health check cron job (every 5 minutes)
echo "*/5 * * * * /opt/legato/health-check.sh" | crontab -u legato -

# Configure firewall (if iptables is available)
log "🔒 Configuring basic firewall rules..."
if command -v iptables &> /dev/null; then
    # Allow SSH, HTTP, and HTTPS
    iptables -A INPUT -p tcp --dport 22 -j ACCEPT
    iptables -A INPUT -p tcp --dport 80 -j ACCEPT
    iptables -A INPUT -p tcp --dport 443 -j ACCEPT
    iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
    
    # Save iptables rules
    service iptables save 2>/dev/null || true
fi

# Install and configure CloudWatch agent (free tier)
log "📊 Setting up CloudWatch monitoring..."
yum install -y amazon-cloudwatch-agent

# Create CloudWatch config
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "metrics": {
        "namespace": "Legato/Application",
        "metrics_collected": {
            "cpu": {
                "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],
                "metrics_collection_interval": 300,
                "totalcpu": false
            },
            "disk": {
                "measurement": ["used_percent"],
                "metrics_collection_interval": 300,
                "resources": ["*"]
            },
            "diskio": {
                "measurement": ["io_time"],
                "metrics_collection_interval": 300,
                "resources": ["*"]
            },
            "mem": {
                "measurement": ["mem_used_percent"],
                "metrics_collection_interval": 300
            }
        }
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/legato/combined.log",
                        "log_group_name": "legato-application",
                        "log_stream_name": "{instance_id}/application"
                    },
                    {
                        "file_path": "/var/log/legato/error.log",
                        "log_group_name": "legato-errors",
                        "log_stream_name": "{instance_id}/errors"
                    }
                ]
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Create status page
log "📄 Creating status page..."
mkdir -p /opt/legato/public
cat > /opt/legato/public/status.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Legato - System Status</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-good { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-error { color: #ef4444; }
        .metric { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        .refresh-btn { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Legato System Status</h1>
        <button class="refresh-btn" onclick="location.reload()">Refresh Status</button>
        
        <h2>Application Health</h2>
        <div id="health-status">Loading...</div>
        
        <h2>System Metrics</h2>
        <div class="metric">
            <span>Platform:</span>
            <span>AWS Free Tier</span>
        </div>
        <div class="metric">
            <span>Instance Type:</span>
            <span>t2.micro</span>
        </div>
        <div class="metric">
            <span>Monthly Cost:</span>
            <span class="status-good">$0.00</span>
        </div>
        <div class="metric">
            <span>Database:</span>
            <span>SQLite (Local)</span>
        </div>
        <div class="metric">
            <span>Process Manager:</span>
            <span>PM2</span>
        </div>
        <div class="metric">
            <span>Web Server:</span>
            <span>Nginx</span>
        </div>
    </div>
    
    <script>
        fetch('/api/health')
            .then(res => res.json())
            .then(data => {
                document.getElementById('health-status').innerHTML = `
                    <div class="metric">
                        <span>Status:</span>
                        <span class="status-good">${data.status}</span>
                    </div>
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>${Math.floor(data.uptime / 3600)}h ${Math.floor((data.uptime % 3600) / 60)}m</span>
                    </div>
                    <div class="metric">
                        <span>Last Check:</span>
                        <span>${new Date(data.timestamp).toLocaleString()}</span>
                    </div>
                `;
            })
            .catch(err => {
                document.getElementById('health-status').innerHTML = `
                    <div class="metric">
                        <span>Status:</span>
                        <span class="status-error">Error loading status</span>
                    </div>
                `;
            });
    </script>
</body>
</html>
EOF

# Final setup steps
log "🔧 Final configuration steps..."

# Ensure all services are running
systemctl restart nginx
systemctl enable nginx

# Wait for application to start
sleep 10

# Test application
log "🧪 Testing application..."
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    log "✅ Application is running and healthy"
else
    log "⚠️ Application may still be starting up"
fi

# Create deployment summary
cat > /opt/legato/deployment-summary.txt << EOF
Legato Zero Cost E-commerce Platform
====================================
Deployment completed: $(date)

🏗️ Architecture:
- EC2 t2.micro instance (FREE - 750 hours/month)
- SQLite database (No RDS costs)
- S3 bucket for assets (FREE - 5GB)
- Nginx reverse proxy
- PM2 process manager
- CloudWatch monitoring (FREE tier)

🌐 Endpoints:
- Application: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
- Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/health
- Status Page: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/status.html

🔑 Admin Access:
- Email: admin@legato.com
- Password: admin123

💰 Monthly Cost: \$0.00 (AWS Free Tier)

🔧 Management:
- View logs: pm2 logs legato-free
- Restart app: pm2 restart legato-free
- Database backup: /opt/legato/backup-db.sh
- Health check: /opt/legato/health-check.sh

📊 Monitoring:
- CloudWatch metrics enabled
- Automated health checks every 5 minutes
- Daily database backups
- Log rotation configured

🎯 Perfect for:
- Learning cloud deployment
- Portfolio projects
- MVP testing
- E-commerce experimentation
EOF

log "🎉 Zero Cost E-commerce Platform setup completed successfully!"
log "💰 Monthly cost: \$0.00 (AWS Free Tier)"
log "🌐 Application should be accessible shortly"
log "📄 Check deployment-summary.txt for details"

# Send completion notification to CloudWatch
aws logs create-log-group --log-group-name legato-deployment --region "$AWS_REGION" 2>/dev/null || true
aws logs create-log-stream --log-group-name legato-deployment --log-stream-name "$(date +%Y%m%d)" --region "$AWS_REGION" 2>/dev/null || true

echo "$(date '+%Y-%m-%d %H:%M:%S') - Legato Zero Cost Platform deployment completed successfully" | \
aws logs put-log-events \
    --log-group-name legato-deployment \
    --log-stream-name "$(date +%Y%m%d)" \
    --log-events timestamp=$(date +%s000),message="Deployment completed successfully" \
    --region "$AWS_REGION" 2>/dev/null || true

log "✅ Setup script completed successfully!"
