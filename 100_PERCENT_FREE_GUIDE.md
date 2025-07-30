# 🆓 100% Free AWS E-commerce Platform Guide

## Overview
This guide shows you how to deploy a complete e-commerce platform on AWS for **$0.00/month** using only free tier services.

## 💰 Cost Breakdown

### What's FREE (Always):
- ✅ **VPC & Networking**: Always free
- ✅ **Security Groups**: Always free  
- ✅ **IAM Roles**: Always free
- ✅ **Route Tables**: Always free

### What's FREE (12 months):
- ✅ **EC2 t2.micro**: 750 hours/month
- ✅ **EBS Storage**: 30GB General Purpose SSD
- ✅ **S3 Storage**: 5GB Standard Storage
- ✅ **Data Transfer**: 15GB/month outbound

### What's FREE (Always):
- ✅ **S3 Requests**: 20,000 GET, 2,000 PUT/month
- ✅ **CloudWatch**: 10 custom metrics, 10 alarms

## 🏗️ Architecture

\`\`\`
Internet
    ↓
EC2 t2.micro (Public Subnet)
├── Next.js Application (Port 3000)
├── PostgreSQL Database (Port 5432)
├── Nginx Reverse Proxy (Port 80)
├── PM2 Process Manager
└── Health Monitoring
    ↓
S3 Bucket (File Storage)
\`\`\`

## 🚀 Quick Start

### Prerequisites
1. **AWS Account** (free to create)
2. **AWS CLI** installed and configured
3. **Terraform** installed
4. **Git** installed

### Step 1: Clone Repository
\`\`\`bash
git clone <your-repository>
cd <your-repository>
\`\`\`

### Step 2: Deploy Infrastructure
\`\`\`bash
# Make script executable
chmod +x scripts/deploy-100-percent-free.sh

# Deploy (takes ~10 minutes)
./scripts/deploy-100-percent-free.sh
\`\`\`

### Step 3: Initialize Application
1. Visit the application URL provided after deployment
2. Click "Initialize Database" to create sample data
3. Start using your e-commerce platform!

## 📊 Monitoring Usage

### Check Free Tier Usage
\`\`\`bash
# Run monitoring script
chmod +x scripts/monitor-free-usage.sh
./scripts/monitor-free-usage.sh
\`\`\`

### AWS Console Monitoring
- Visit: https://console.aws.amazon.com/billing/home#/freetier
- Set up billing alerts for $1 threshold
- Monitor usage monthly

## 🔧 Platform Features

### E-commerce Functionality
- ✅ **Product Catalog**: Browse products by category
- ✅ **Database Management**: PostgreSQL with connection pooling
- ✅ **File Storage**: S3 integration for images
- ✅ **Admin Interface**: Manage products and categories
- ✅ **API Endpoints**: RESTful APIs for all operations
- ✅ **Health Monitoring**: Automatic health checks

### Technical Features
- ✅ **Next.js 14**: Modern React framework
- ✅ **TypeScript**: Type-safe development
- ✅ **PostgreSQL**: Reliable database
- ✅ **Nginx**: Reverse proxy and caching
- ✅ **PM2**: Process management and clustering
- ✅ **Auto-restart**: Automatic recovery from failures

## 🛠️ Customization

### Adding New Features
\`\`\`bash
# SSH into your server
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_IP

# Navigate to application directory
cd /opt/musicmart

# Make changes and rebuild
npm run build
pm2 restart musicmart
\`\`\`

### Database Management
\`\`\`bash
# Connect to PostgreSQL
sudo -u postgres psql -d musicmart_db

# View tables
\dt

# Query products
SELECT * FROM products;
\`\`\`

### File Uploads
The platform includes S3 integration for file uploads:
- Images are stored in S3
- Public read access configured
- IAM roles for secure access

## 📈 Scaling Options

### When You Outgrow Free Tier:

#### Option 1: Upgrade Instance
\`\`\`bash
# In terraform/main.tf, change:
instance_type = "t3.small"  # ~$15/month
\`\`\`

#### Option 2: Add Load Balancer
\`\`\`bash
# Add Application Load Balancer
# Enables high availability
# Cost: ~$18/month
\`\`\`

#### Option 3: Separate Database
\`\`\`bash
# Move to RDS PostgreSQL
# Better performance and backups
# Cost: ~$15/month for db.t3.micro
\`\`\`

## 🔒 Security Best Practices

### Current Security Features
- ✅ **Security Groups**: Restrict network access
- ✅ **IAM Roles**: Least privilege access
- ✅ **SSH Keys**: Secure server access
- ✅ **VPC**: Network isolation
- ✅ **Encrypted EBS**: Data encryption at rest

### Additional Security (Optional)
\`\`\`bash
# Add SSL certificate (free with Let's Encrypt)
sudo certbot --nginx -d yourdomain.com

# Configure firewall
sudo ufw enable
sudo ufw allow 22,80,443/tcp
\`\`\`

## 🚨 Important Limits

### Free Tier Limits
| Resource | Limit | Monitoring |
|----------|-------|------------|
| EC2 Hours | 750/month | Auto-stop if exceeded |
| EBS Storage | 30GB | Monitor with script |
| S3 Storage | 5GB | Check bucket sizes |
| Data Transfer | 15GB/month | Monitor CloudWatch |

### Avoiding Overages
1. **Set Billing Alerts**: $1, $5, $10 thresholds
2. **Monitor Weekly**: Run monitoring script
3. **Clean Up**: Remove unused resources
4. **Optimize**: Compress images, cache content

## 🆘 Troubleshooting

### Application Not Starting
\`\`\`bash
# Check application logs
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_IP
pm2 logs musicmart

# Restart application
pm2 restart musicmart
\`\`\`

### Database Connection Issues
\`\`\`bash
# Check PostgreSQL status
sudo systemctl status postgresql-15

# Restart PostgreSQL
sudo systemctl restart postgresql-15
\`\`\`

### High Resource Usage
\`\`\`bash
# Check system resources
htop

# Check disk usage
df -h

# Clean up logs
sudo journalctl --vacuum-time=7d
\`\`\`

## 📞 Support

### Getting Help
1. **Check Logs**: Application and system logs
2. **AWS Documentation**: Free tier limits and usage
3. **Community Forums**: AWS and Next.js communities
4. **Monitoring**: Use provided monitoring scripts

### Common Issues
- **Out of Memory**: Restart PM2 processes
- **Disk Full**: Clean up logs and temporary files
- **Network Issues**: Check security groups
- **Database Errors**: Restart PostgreSQL service

## 🎯 Success Metrics

### What You Get
- ✅ **Complete E-commerce Platform**
- ✅ **Production-Ready Architecture**
- ✅ **Scalable Foundation**
- ✅ **Zero Monthly Costs** (first 12 months)
- ✅ **Learning Experience**
- ✅ **Portfolio Project**

### Perfect For
- 🎓 **Students** learning cloud development
- 🚀 **Startups** with zero budget
- 💡 **Prototyping** new business ideas
- 📚 **Learning** AWS and e-commerce
- 🎨 **Portfolio** projects
- 🔬 **Experimentation** with new technologies

---

**🎉 Congratulations!** You now have a complete, production-ready e-commerce platform running on AWS for **$0.00/month**!
\`\`\`

```shellscript file="scripts/cleanup-resources.sh"
#!/bin/bash

# Cleanup AWS Resources Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}🗑️  AWS Resources Cleanup Script${NC}"
echo -e "${YELLOW}⚠️  This will destroy ALL MusicMart resources${NC}"
echo ""

# Check if terraform directory exists
if [ ! -d "terraform" ]; then
    echo -e "${RED}❌ Terraform directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

cd terraform

# Check if terraform state exists
if [ ! -f "terraform.tfstate" ]; then
    echo -e "${YELLOW}⚠️  No Terraform state found${NC}"
    echo "Resources may have been already destroyed or deployed differently"
    exit 0
fi

# Show what will be destroyed
echo -e "${BLUE}📋 Resources to be destroyed:${NC}"
terraform show -json | jq -r '.values.root_module.resources[].address' 2>/dev/null || echo "Unable to parse state file"
echo ""

# Confirm destruction
echo -e "${RED}⚠️  WARNING: This action cannot be undone!${NC}"
echo -e "${RED}All data will be permanently lost!${NC}"
echo ""
read -p "Are you sure you want to destroy all resources? (type 'yes' to confirm): " -r
if [[ ! $REPLY == "yes" ]]; then
    echo -e "${YELLOW}⏸️  Cleanup cancelled${NC}"
    exit 0
fi

# Destroy resources
echo -e "${BLUE}🗑️  Destroying infrastructure...${NC}"
terraform destroy -auto-approve

# Clean up local files
echo -e "${BLUE}🧹 Cleaning up local files...${NC}"
rm -f terraform.tfstate*
rm -f tfplan
rm -rf .terraform/
rm -f .terraform.lock.hcl

# Clean up deployment info
cd ..
rm -f deployment-info.txt

echo ""
echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo -e "${GREEN}All AWS resources have been destroyed${NC}"
echo -e "${GREEN}No charges will be incurred${NC}"
echo ""
echo -e "${BLUE}💡 To redeploy, run: ./scripts/deploy-100-percent-free.sh${NC}"
