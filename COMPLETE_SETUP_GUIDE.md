# Legato - Complete Setup Guide

## 🎵 Overview

Legato is India's premier music marketplace built with modern technologies and deployed on AWS infrastructure. This guide will walk you through the complete setup process from development to production deployment.

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│  Load Balancer  │────│   ECS Fargate   │
│   (CDN/SSL)     │    │      (ALB)      │    │  (Next.js App)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │      S3         │             │
                       │  (File Storage) │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   ElastiCache   │────│   RDS PostgreSQL│
                       │    (Redis)      │    │   (Database)    │
                       └─────────────────┘    └─────────────────┘
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, PostgreSQL
- **Infrastructure**: AWS ECS Fargate, RDS, S3, CloudFront, ALB
- **CI/CD**: Jenkins, Docker, AWS ECR
- **Monitoring**: CloudWatch, AWS X-Ray
- **Caching**: Redis (ElastiCache)

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Domain name (for production)
- Jenkins server (will be set up via Terraform)
- Docker installed locally
- Node.js 18+ and npm

## 🚀 Quick Start (Development)

### 1. Clone and Setup

\`\`\`bash
git clone <repository-url>
cd legato-marketplace
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

### 3. Database Setup (Local)

\`\`\`bash
# Start PostgreSQL with Docker
docker run --name legato-postgres \
  -e POSTGRES_DB=legato_db \
  -e POSTGRES_USER=legato_user \
  -e POSTGRES_PASSWORD=legato_password \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
npm run db:migrate
npm run db:seed
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## ☁️ AWS Infrastructure Setup

### 1. Terraform Deployment

\`\`\`bash
cd terraform
terraform init
terraform plan
terraform apply
\`\`\`

This will create:
- VPC with public/private subnets
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- ECS Fargate cluster
- Application Load Balancer
- S3 bucket for file storage
- CloudFront distribution
- Jenkins EC2 instance

### 2. Domain Configuration

1. Update Route 53 hosted zone
2. Configure SSL certificate in ACM
3. Update CloudFront distribution

### 3. Database Migration

\`\`\`bash
# Connect to RDS instance
psql -h your-rds-endpoint -U legato_user -d legato_db

# Run schema and seed scripts
\i scripts/database-schema.sql
\i scripts/sample-data.sql
\`\`\`

## 🔧 Jenkins CI/CD Setup

### 1. Access Jenkins

- Jenkins will be available at `http://jenkins-instance-ip:8080`
- Initial admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

### 2. Install Required Plugins

- AWS Pipeline
- Docker Pipeline
- NodeJS
- Blue Ocean
- Slack Notification

### 3. Configure Credentials

Add the following credentials in Jenkins:
- AWS Access Key/Secret
- Docker Registry credentials
- Slack webhook (optional)
- GitHub/GitLab credentials

### 4. Create Pipeline

1. New Item → Pipeline
2. Pipeline script from SCM
3. Repository URL and credentials
4. Script path: `Jenkinsfile`

### 5. Environment Variables

Configure these in Jenkins:
\`\`\`
DOCKER_REGISTRY=your-ecr-registry-url
AWS_REGION=ap-south-1
ECS_CLUSTER=legato-cluster
ECS_SERVICE=legato-service
\`\`\`

## 🗄️ Database Configuration

### Schema Overview

\`\`\`sql
-- Main tables
users           -- User accounts and profiles
categories      -- Instrument categories
products        -- Product listings
orders          -- Purchase orders
reviews         -- Product reviews
wishlists       -- User wishlists
messages        -- Buyer-seller communication
admin_stats     -- Dashboard analytics
\`\`\`

### Key Features

- **Full-text search** on products
- **Automatic rating updates** via triggers
- **Optimized indexes** for performance
- **UUID primary keys** for security
- **JSONB fields** for flexible data

### Backup Strategy

\`\`\`bash
# Daily automated backups
pg_dump -h rds-endpoint -U legato_user legato_db > backup_$(date +%Y%m%d).sql

# Point-in-time recovery enabled
# Retention: 7 days
\`\`\`

## 🔐 Security Configuration

### 1. Environment Variables

\`\`\`bash
# Production environment variables
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/legato_db
NEXTAUTH_SECRET=your-secure-secret-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
\`\`\`

### 2. AWS Security Groups

- **ALB**: Ports 80, 443 from 0.0.0.0/0
- **ECS**: Port 3000 from ALB security group
- **RDS**: Port 5432 from ECS security group
- **Redis**: Port 6379 from ECS security group

### 3. IAM Roles

- **ECS Task Role**: S3, SES permissions
- **Jenkins Role**: ECR, ECS deployment permissions

## 📊 Monitoring and Logging

### 1. CloudWatch Dashboards

- Application metrics (response time, error rate)
- Infrastructure metrics (CPU, memory, disk)
- Database performance metrics
- Custom business metrics

### 2. Alerts

\`\`\`bash
# High error rate alert
aws cloudwatch put-metric-alarm \
  --alarm-name "Legato-High-Error-Rate" \
  --alarm-description "Error rate > 5%" \
  --metric-name ErrorRate \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
\`\`\`

### 3. Log Aggregation

- Application logs → CloudWatch Logs
- Access logs → S3
- Database logs → CloudWatch Logs

## 🚀 Deployment Process

### 1. Development Workflow

\`\`\`bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
\`\`\`

### 2. Staging Deployment

\`\`\`bash
# Merge to develop branch
git checkout develop
git merge feature/new-feature
git push origin develop
# Jenkins automatically deploys to staging
\`\`\`

### 3. Production Deployment

\`\`\`bash
# Merge to main branch
git checkout main
git merge develop
git push origin main
# Jenkins automatically deploys to production
\`\`\`

### 4. Rollback Process

\`\`\`bash
# Quick rollback via ECS
aws ecs update-service \
  --cluster legato-cluster \
  --service legato-service \
  --task-definition legato-task-definition:PREVIOUS_REVISION
\`\`\`

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   \`\`\`bash
   # Check security groups
   # Verify connection string
   # Check RDS instance status
   \`\`\`

2. **ECS Service Not Starting**
   \`\`\`bash
   # Check task definition
   # Verify IAM roles
   # Check CloudWatch logs
   \`\`\`

3. **High Memory Usage**
   \`\`\`bash
   # Scale up ECS tasks
   # Optimize database queries
   # Implement caching
   \`\`\`

### Health Checks

\`\`\`bash
# Application health
curl https://legato.com/api/health

# Database health
psql -h rds-endpoint -U legato_user -c "SELECT 1"

# Redis health
redis-cli -h elasticache-endpoint ping
\`\`\`

## 📈 Performance Optimization

### 1. Database Optimization

\`\`\`sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 'uuid';
\`\`\`

### 2. Caching Strategy

- **Redis**: Session data, frequently accessed data
- **CloudFront**: Static assets, API responses
- **Application**: In-memory caching for categories

### 3. Image Optimization

\`\`\`bash
# S3 + CloudFront for images
# WebP format for modern browsers
# Lazy loading implementation
# Image resizing on upload
\`\`\`

## 🎯 Admin Panel Access

### Default Credentials

- **URL**: `https://legato.com/admin`
- **Email**: `admin@legato.com`
- **Password**: `Legato2024!Admin`

### Features

- Real-time analytics dashboard
- User and product management
- Order tracking and management
- Revenue and sales reports
- System health monitoring

## 📞 Support and Maintenance

### 1. Regular Maintenance

- **Weekly**: Database performance review
- **Monthly**: Security updates and patches
- **Quarterly**: Infrastructure cost optimization

### 2. Backup and Recovery

- **Database**: Daily automated backups
- **Files**: S3 versioning enabled
- **Code**: Git repository with multiple remotes

### 3. Scaling Guidelines

\`\`\`bash
# Auto-scaling based on CPU/Memory
# Database read replicas for high traffic
# CDN optimization for global users
# Load testing before major releases
\`\`\`

## 🎉 Go Live Checklist

- [ ] Domain configured with SSL
- [ ] Database migrated and seeded
- [ ] Environment variables set
- [ ] Jenkins pipeline working
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Admin panel accessible
- [ ] Payment gateway tested

## 📧 Contact

For technical support or questions:
- **Email**: tech@legato.com
- **Slack**: #legato-support
- **Documentation**: https://docs.legato.com

---

**🎵 Welcome to Legato - Where Music Meets Technology! 🎵**
