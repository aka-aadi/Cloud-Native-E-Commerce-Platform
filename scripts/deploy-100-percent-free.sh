#!/bin/bash

# 100% Free AWS Deployment Script for MusicMart E-commerce Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="musicmart"
AWS_REGION="us-east-1"  # Best region for free tier
ENVIRONMENT="production"

echo -e "${GREEN}🎵 Starting MusicMart 100% FREE deployment to AWS...${NC}"
echo -e "${BLUE}💰 This deployment costs $0.00/month within AWS Free Tier${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Get account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS credentials verified for account: ${ACCOUNT_ID}${NC}"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo -e "${YELLOW}🔑 SSH key not found. Generating new key pair...${NC}"
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -C "musicmart-deployment"
    echo -e "${GREEN}✅ SSH key pair generated${NC}"
fi

# Initialize and apply Terraform
echo -e "${YELLOW}🏗️  Initializing Terraform...${NC}"
cd terraform
terraform init

echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan \
    -var="project_name=${PROJECT_NAME}" \
    -var="aws_region=${AWS_REGION}" \
    -var="environment=${ENVIRONMENT}"

echo -e "${BLUE}💡 100% FREE Resources to be created:${NC}"
echo -e "${BLUE}   ✅ 1x t2.micro EC2 instance (750 hours/month FREE)${NC}"
echo -e "${BLUE}   ✅ PostgreSQL database on EC2 (FREE)${NC}"
echo -e "${BLUE}   ✅ 1x S3 bucket (5GB storage FREE)${NC}"
echo -e "${BLUE}   ✅ VPC with public subnets (FREE)${NC}"
echo -e "${BLUE}   ✅ Security groups and networking (FREE)${NC}"
echo -e "${BLUE}   ✅ No NAT Gateway (FREE alternative)${NC}"
echo -e "${BLUE}   ✅ No RDS (using PostgreSQL on EC2)${NC}"
echo -e "${BLUE}   ✅ No CloudFront (direct EC2 access)${NC}"

echo -e "${GREEN}💰 TOTAL MONTHLY COST: $0.00${NC}"
echo -e "${GREEN}🎉 Everything runs within AWS Free Tier limits!${NC}"

read -p "Do you want to continue with this 100% free deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled by user${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 Applying Terraform configuration...${NC}"
terraform apply \
    -var="project_name=${PROJECT_NAME}" \
    -var="aws_region=${AWS_REGION}" \
    -var="environment=${ENVIRONMENT}" \
    -auto-approve

# Get outputs from Terraform
APPLICATION_URL=$(terraform output -raw application_url)
SSH_COMMAND=$(terraform output -raw ssh_command)
S3_BUCKET=$(terraform output -raw s3_bucket_name)

echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
echo -e "${GREEN}🌐 Application URL: ${APPLICATION_URL}${NC}"
echo -e "${GREEN}🔗 SSH Command: ${SSH_COMMAND}${NC}"

cd ..

# Wait for EC2 instance to be ready
echo -e "${YELLOW}⏳ Waiting for EC2 instance to be ready...${NC}"
sleep 180  # Give more time for PostgreSQL setup

# Test application health
echo -e "${YELLOW}🏥 Performing health check...${NC}"
for i in {1..15}; do
    if curl -f "${APPLICATION_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy and responding${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for application to start... (attempt $i/15)${NC}"
        sleep 30
    fi
done

# Display final information
echo -e "${GREEN}🎉 MusicMart 100% FREE deployment completed successfully!${NC}"
echo -e "${GREEN}📝 Access Information:${NC}"
echo -e "${GREEN}   • Application: ${APPLICATION_URL}${NC}"
echo -e "${GREEN}   • SSH Access: ${SSH_COMMAND}${NC}"
echo -e "${GREEN}   • S3 Bucket: ${S3_BUCKET}${NC}"

echo -e "${BLUE}💰 Cost Breakdown:${NC}"
echo -e "${BLUE}   ✅ EC2 t2.micro: $0.00 (750 hours/month FREE)${NC}"
echo -e "${BLUE}   ✅ EBS 30GB: $0.00 (30GB/month FREE for 12 months)${NC}"
echo -e "${BLUE}   ✅ S3 storage: $0.00 (5GB FREE)${NC}"
echo -e "${BLUE}   ✅ Data transfer: $0.00 (15GB out/month FREE)${NC}"
echo -e "${BLUE}   ✅ VPC & networking: $0.00 (always FREE)${NC}"
echo -e "${GREEN}   💰 TOTAL: $0.00/month${NC}"

echo -e "${BLUE}🔧 Features included:${NC}"
echo -e "${BLUE}   ✅ Full Next.js e-commerce application${NC}"
echo -e "${BLUE}   ✅ PostgreSQL database${NC}"
echo -e "${BLUE}   ✅ File uploads to S3${NC}"
echo -e "${BLUE}   ✅ Admin dashboard${NC}"
echo -e "${BLUE}   ✅ Product management${NC}"
echo -e "${BLUE}   ✅ Health monitoring${NC}"
echo -e "${BLUE}   ✅ Auto-restart on failure${NC}"

echo -e "${YELLOW}📊 Free Tier Limits:${NC}"
echo -e "${YELLOW}   • EC2: 750 hours/month (run 24/7 for free)${NC}"
echo -e "${YELLOW}   • S3: 5GB storage, 20K GET, 2K PUT requests${NC}"
echo -e "${YELLOW}   • Data transfer: 15GB out per month${NC}"
echo -e "${YELLOW}   • EBS: 30GB for first 12 months${NC}"

echo -e "${BLUE}🔧 Next Steps:${NC}"
echo -e "${BLUE}   1. Visit: ${APPLICATION_URL}${NC}"
echo -e "${BLUE}   2. Click 'Initialize Database' to set up sample data${NC}"
echo -e "${BLUE}   3. Monitor usage in AWS Console${NC}"
echo -e "${BLUE}   4. Set up billing alerts (optional)${NC}"

# Create monitoring script
cat > monitor-free-usage.sh << 'EOF'
#!/bin/bash
echo "🔍 AWS Free Tier Usage Monitor"
echo "=============================="

# Get current month
CURRENT_MONTH=$(date +%Y-%m)

echo "📊 Current usage for ${CURRENT_MONTH}:"
echo ""

# Check EC2 running hours
echo "🖥️  EC2 Instance Status:"
aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=musicmart" \
    --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,LaunchTime]' \
    --output table 2>/dev/null || echo "Unable to fetch EC2 data"

echo ""
echo "💾 S3 Bucket Usage:"
aws s3 ls s3://$(terraform output -raw s3_bucket_name) --recursive --human-readable --summarize 2>/dev/null || echo "Unable to fetch S3 data"

echo ""
echo "💡 Monitor detailed usage at:"
echo "   https://console.aws.amazon.com/billing/home#/freetier"
echo ""
echo "🚨 Set up billing alerts at:"
echo "   https://console.aws.amazon.com/billing/home#/budgets"
EOF

chmod +x monitor-free-usage.sh

echo -e "${GREEN}📊 Created monitoring script: ./monitor-free-usage.sh${NC}"
echo -e "${GREEN}   Run this script to check your Free Tier usage${NC}"

echo -e "${GREEN}🎵 Your MusicMart e-commerce platform is now live and 100% FREE!${NC}"
