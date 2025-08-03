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

log "\ud83d\ude80 Starting Zero Cost E-commerce Platform setup..."
log "Project: $PROJECT_NAME"
log "S3 Bucket: $S3_BUCKET"
log "AWS Region: $AWS_REGION"

# Update system
log "\ud83d\udce6 Updating system packages..."
yum update -y

# Install Node.js 18 (LTS)
log "\ud83d\udce6 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install additional packages
log "\ud83d\udce6 Installing additional packages..."
yum install -y git nginx python3 python3-pip gcc-c++ make sqlite

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
PORT=3000
JWT_SECRET=changeme
EOF

# Setup system environment
log "\ud83d\udd27 Exporting environment variables..."
echo 'export PORT=3000' >> /etc/profile.d/legato.sh
echo 'export JWT_SECRET=changeme' >> /etc/profile.d/legato.sh
chmod +x /etc/profile.d/legato.sh

# Setup application files
log "\ud83d\udce5 Downloading application from S3 if exists..."
if aws s3 ls "s3://$S3_BUCKET/$PROJECT_NAME/app/" --region "$AWS_REGION" | grep -q 'server.js'; then
    aws s3 cp --recursive "s3://$S3_BUCKET/$PROJECT_NAME/app/" "$APP_DIR" --region "$AWS_REGION"
else
    log "⚠️ No application found in S3. Proceeding with default setup..."
    # [Insert default application setup here, if needed]
fi

# Fix permissions
chown -R legato:legato "$APP_DIR"

# Install dependencies
log "\ud83d\udce6 Installing Node.js dependencies..."
cd "$APP_DIR"
sudo -u legato npm install

# Configure Nginx
log "\ud83c\udf10 Configuring Nginx..."
cat > /etc/nginx/conf.d/legato.conf << 'EOF'
server {
    listen 80;
    server_name _;
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
}
EOF

systemctl restart nginx
systemctl enable nginx

# PM2 configuration
log "\u2699\ufe0f Setting up PM2..."
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
