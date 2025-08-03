# 🎵 MusicMart - 100% Free E-commerce Platform on AWS

## 💰 Total Cost: $0.00/month

This guide shows you how to deploy a complete e-commerce platform on AWS using **only** free tier services. No subscriptions, no hidden costs, no paid services.

## 🏗️ Architecture Overview

\`\`\`
Internet → EC2 t2.micro (Public Subnet)
├── Next.js Application (Port 3000)
├── PostgreSQL Database (Port 5432)
├── Nginx Reverse Proxy (Port 80)
├── PM2 Process Manager
└── S3 Bucket (File Storage)
\`\`\`

## 🆓 Free Tier Resources Used

| Service | Free Tier Limit | Our Usage | Cost |
|---------|----------------|-----------|------|
| EC2 t2.micro | 750 hours/month | 24/7 operation | $0.00 |
| EBS Storage | 30GB (first year) | 30GB | $0.00 |
| S3 Storage | 5GB | File uploads | $0.00 |
| S3 Requests | 20K GET, 2K PUT | API calls | $0.00 |
| Data Transfer | 15GB out/month | Web traffic | $0.00 |
| VPC & Networking | Always free | Full setup | $0.00 |

**Total Monthly Cost: $0.00**

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** (with free tier available)
2. **AWS CLI** installed and configured
3. **Terraform** installed
4. **Git** installed

### Installation

\`\`\`bash
# 1. Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Deploy the platform
./scripts/deploy-100-percent-free.sh
\`\`\`

### What Happens During Deployment

1. **AWS Credentials Check** - Verifies your AWS setup
2. **SSH Key Generation** - Creates key pair for EC2 access
3. **Infrastructure Creation** - Deploys VPC, EC2, S3, etc.
4. **Application Setup** - Installs Node.js, PostgreSQL, Nginx
5. **Health Verification** - Confirms everything is working

## 🔧 Features Included

### E-commerce Platform
- ✅ **Product Catalog** with categories
- ✅ **Admin Dashboard** for management
- ✅ **Database Management** with PostgreSQL
- ✅ **File Uploads** to S3
- ✅ **Responsive Design** for mobile/desktop
- ✅ **Health Monitoring** with auto-restart
- ✅ **API Endpoints** for products, categories, users

### Technical Features
- ✅ **Next.js 14** with TypeScript
- ✅ **PostgreSQL 15** database
- ✅ **Nginx** reverse proxy
- ✅ **PM2** process management
- ✅ **AWS S3** file storage
- ✅ **Health checks** every 5 minutes
- ✅ **Auto-restart** on failure
- ✅ **Security groups** and IAM roles

## 📊 Monitoring Your Usage

### Check Free Tier Usage
\`\`\`bash
# Run the monitoring script
./scripts/monitor-free-usage.sh
\`\`\`

### AWS Console Monitoring
- **Free Tier Dashboard**: https://console.aws.amazon.com/billing/home#/freetier
- **Billing Dashboard**: https://console.aws.amazon.com/billing/home
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch

### Set Up Billing Alerts
1. Go to AWS Billing Console
2. Create a budget for $1.00
3. Set up email notifications
4. Monitor monthly usage

## 🔒 Security Best Practices

### Network Security
- **VPC** with public subnets only (no NAT Gateway cost)
- **Security Groups** restrict access to necessary ports
- **SSH access** with key-based authentication
- **Database** accessible only from localhost

### Application Security
- **Environment variables** for sensitive data
- **IAM roles** with minimal permissions
- **HTTPS** ready (add SSL certificate)
- **Input validation** on all API endpoints

### Recommended Improvements
\`\`\`bash
# Add SSL certificate (free with Let's Encrypt)
sudo certbot --nginx -d yourdomain.com

# Restrict SSH access to your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
\`\`\`

## 🛠️ Customization Guide

### Adding New Features

1. **SSH into your server**:
\`\`\`bash
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_EC2_IP
\`\`\`

2. **Navigate to application directory**:
\`\`\`bash
cd /opt/musicmart
\`\`\`

3. **Make changes and rebuild**:
\`\`\`bash
npm run build
pm2 restart musicmart
\`\`\`

### Database Management

\`\`\`bash
# Connect to PostgreSQL
sudo -u postgres psql musicmart_db

# Create new tables
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Exit PostgreSQL
\q
\`\`\`

### Adding New API Endpoints

Create new files in `app/api/` directory:

\`\`\`typescript
// app/api/orders/route.ts
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
  // Your API logic here
}
\`\`\`

## 📈 Scaling Options

### When You Outgrow Free Tier

1. **Upgrade EC2 Instance**:
   - t2.micro → t2.small ($16.79/month)
   - Add Auto Scaling Group

2. **Add Load Balancer**:
   - Application Load Balancer ($16.20/month)
   - Multiple EC2 instances

3. **Upgrade Database**:
   - Move to RDS PostgreSQL
   - Add read replicas

4. **Add CDN**:
   - CloudFront distribution
   - Better global performance

5. **Add Caching**:
   - ElastiCache Redis
   - Improve response times

### Cost After Free Tier (12 months)

| Service | Monthly Cost |
|---------|-------------|
| EC2 t2.micro | $8.50 |
| EBS 30GB | $3.00 |
| S3 & Transfer | $1.00 |
| **Total** | **$12.50** |

## 🐛 Troubleshooting

### Common Issues

**1. Application not responding**
\`\`\`bash
# Check application status
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_IP
pm2 status
pm2 logs musicmart

# Restart if needed
pm2 restart musicmart
\`\`\`

**2. Database connection failed**
\`\`\`bash
# Check PostgreSQL status
sudo systemctl status postgresql-15
sudo systemctl restart postgresql-15
\`\`\`

**3. Nginx not working**
\`\`\`bash
# Check Nginx status
sudo systemctl status nginx
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
\`\`\`

**4. Out of disk space**
\`\`\`bash
# Check disk usage
df -h
# Clean up logs
sudo journalctl --vacuum-time=7d
\`\`\`

### Getting Help

1. **Check logs**:
\`\`\`bash
# Application logs
pm2 logs musicmart

# System logs
sudo journalctl -u nginx
sudo journalctl -u postgresql-15
\`\`\`

2. **Health check**:
\`\`\`bash
curl http://YOUR_IP/api/health
\`\`\`

3. **Monitor resources**:
\`\`\`bash
./scripts/monitor-free-usage.sh
\`\`\`

## 🎯 Use Cases

### Perfect For:
- ✅ **Startups** with zero budget
- ✅ **Learning** AWS and e-commerce development
- ✅ **Prototyping** new business ideas
- ✅ **Portfolio projects** for developers
- ✅ **Small businesses** getting started online
- ✅ **Development environments**
- ✅ **Educational projects**

### Not Suitable For:
- ❌ High-traffic production sites (>15GB transfer/month)
- ❌ Large file storage needs (>5GB)
- ❌ Mission-critical applications requiring 99.99% uptime
- ❌ Applications requiring multiple regions

## 🔄 Maintenance

### Regular Tasks

**Weekly**:
- Check application health
- Monitor free tier usage
- Review logs for errors

**Monthly**:
- Update system packages
- Check security updates
- Review AWS billing

**Quarterly**:
- Backup database
- Review and optimize performance
- Update application dependencies

### Backup Strategy

\`\`\`bash
# Database backup
pg_dump -h localhost -U musicmart_user musicmart_db > backup.sql

# Upload to S3
aws s3 cp backup.sql s3://your-bucket/backups/

# Restore from backup
psql -h localhost -U musicmart_user musicmart_db < backup.sql
\`\`\`

## 🎉 Success Stories

This architecture is perfect for:
- **Learning**: Understand AWS services without cost
- **Prototyping**: Test business ideas for free
- **Development**: Create staging environments
- **Small Scale**: Handle moderate traffic loads
- **Education**: Teach cloud computing concepts

## 📞 Support

### Community Resources
- **AWS Free Tier FAQ**: https://aws.amazon.com/free/
- **Next.js Documentation**: https://nextjs.org/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

### Monitoring Commands
\`\`\`bash
# Check all services
./scripts/monitor-free-usage.sh

# Application health
curl http://YOUR_IP/api/health

# Server resources
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_IP 'top -n 1'
\`\`\`

---

**🎵 Enjoy your completely FREE e-commerce platform on AWS!**

*Remember: This setup costs $0.00/month within AWS Free Tier limits. Monitor your usage to stay within these limits.*
\`\`\`

\`\`\`shellscript file="scripts/cleanup-resources.sh"
#!/bin/bash

# Cleanup script for MusicMart AWS resources
# Use this to destroy all resources and avoid any charges

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}🗑️  MusicMart Resource Cleanup${NC}"
echo -e "${YELLOW}⚠️  This will DESTROY all AWS resources created for MusicMart${NC}"
echo ""

# Check if terraform directory exists
if [ ! -d "terraform" ]; then
    echo -e "${RED}❌ Terraform directory not found${NC}"
    echo -e "${YELLOW}Make sure you're in the project root directory${NC}"
    exit 1
fi

# Check if terraform state exists
if [ ! -f "terraform/terraform.tfstate" ]; then
    echo -e "${YELLOW}⚠️  No Terraform state file found${NC}"
    echo -e "${YELLOW}Resources may have already been destroyed or never created${NC}"
    exit 0
fi

# Show what will be destroyed
echo -e "${BLUE}📋 Resources that will be destroyed:${NC}"
cd terraform
terraform show -no-color | grep -E "resource|data" | head -20
echo ""

# Confirm destruction
echo -e "${RED}⚠️  WARNING: This action cannot be undone!${NC}"
echo -e "${RED}All data, including your database, will be permanently lost.${NC}"
echo ""
read -p "Are you absolutely sure you want to destroy all resources? (type 'yes' to confirm): " -r

if [[ ! $REPLY == "yes" ]]; then
    echo -e "${YELLOW}⏸️  Cleanup cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🗑️  Starting resource destruction...${NC}"

# Destroy resources
terraform destroy -auto-approve

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All resources destroyed successfully${NC}"
    echo ""
    echo -e "${BLUE}📋 Cleanup Summary:${NC}"
    echo -e "${GREEN}├── EC2 instance: Terminated${NC}"
    echo -e "${GREEN}├── S3 bucket: Deleted${NC}"
    echo -e "${GREEN}├── VPC & networking: Removed${NC}"
    echo -e "${GREEN}├── Security groups: Deleted${NC}"
    echo -e "${GREEN}├── IAM roles: Removed${NC}"
    echo -e "${GREEN}└── SSH key pair: Deleted${NC}"
    echo ""
    echo -e "${GREEN}💰 Your AWS bill will return to $0.00/month${NC}"
    echo ""
    
    # Clean up local files
    echo -e "${BLUE}🧹 Cleaning up local files...${NC}"
    rm -f terraform.tfstate*
    rm -f tfplan
    rm -f .terraform.lock.hcl
    rm -rf .terraform/
    
    echo -e "${GREEN}✅ Local cleanup complete${NC}"
    
else
    echo ""
    echo -e "${RED}❌ Error occurred during resource destruction${NC}"
    echo -e "${YELLOW}Some resources may still exist. Check AWS Console.${NC}"
    echo ""
    echo -e "${BLUE}🔧 Manual cleanup may be required for:${NC}"
    echo -e "${YELLOW}├── EC2 instances${NC}"
    echo -e "${YELLOW}├── S3 buckets (if not empty)${NC}"
    echo -e "${YELLOW}├── VPC components${NC}"
    echo -e "${YELLOW}└── IAM roles${NC}"
    echo ""
    echo -e "${BLUE}Visit AWS Console to manually delete remaining resources:${NC}"
    echo -e "${BLUE}https://console.aws.amazon.com/ec2/v2/home${NC}"
    exit 1
fi

cd ..

# Remove deployment info file
if [ -f "deployment-info.txt" ]; then
    rm -f deployment-info.txt
    echo -e "${GREEN}✅ Deployment info file removed${NC}"
fi

echo ""
echo -e "${PURPLE}🎉 MusicMart cleanup completed!${NC}"
echo -e "${GREEN}All AWS resources have been destroyed.${NC}"
echo -e "${BLUE}You can now redeploy anytime with: ./scripts/deploy-100-percent-free.sh${NC}"
