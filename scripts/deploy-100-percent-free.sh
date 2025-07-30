#!/bin/bash

# 100% Free AWS E-commerce Platform Deployment Script
# Total Cost: $0.00/month (within AWS Free Tier)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="musicmart"
AWS_REGION="us-east-1"

echo -e "${PURPLE}🎵 Starting MusicMart 100% FREE deployment to AWS...${NC}"
echo -e "${GREEN}💰 This deployment costs \$0.00/month within AWS Free Tier${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    echo "Visit: https://learn.hashicorp.com/tutorials/terraform/install-cli"
    exit 1
fi

# Check AWS credentials
echo -e "${BLUE}📋 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS credentials verified for account: ${ACCOUNT_ID}${NC}"

# Check/Generate SSH key
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}🔑 SSH key not found. Generating new key pair...${NC}"
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "${PROJECT_NAME}-deployment"
    echo -e "${GREEN}✅ SSH key pair generated${NC}"
else
    echo -e "${GREEN}✅ SSH key found at ${SSH_KEY_PATH}${NC}"
fi

# Create terraform directory if it doesn't exist
mkdir -p terraform
cd terraform

# Initialize Terraform
echo -e "${BLUE}🏗️  Initializing Terraform...${NC}"
terraform init

# Plan deployment
echo -e "${BLUE}📋 Planning Terraform deployment...${NC}"
terraform plan \
    -var="aws_region=${AWS_REGION}" \
    -var="project_name=${PROJECT_NAME}" \
    -out=tfplan

# Show cost estimate
echo ""
echo -e "${GREEN}💰 COST BREAKDOWN (AWS Free Tier):${NC}"
echo -e "${GREEN}├── EC2 t2.micro: \$0.00/month (750 hours free)${NC}"
echo -e "${GREEN}├── EBS 30GB: \$0.00/month (first year free)${NC}"
echo -e "${GREEN}├── S3 5GB: \$0.00/month (always free)${NC}"
echo -e "${GREEN}├── VPC & Networking: \$0.00/month (always free)${NC}"
echo -e "${GREEN}└── Data Transfer 15GB: \$0.00/month (always free)${NC}"
echo -e "${GREEN}📊 TOTAL: \$0.00/month${NC}"
echo ""

# Confirm deployment
read -p "🚀 Deploy the infrastructure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
    exit 0
fi

# Apply Terraform
echo -e "${BLUE}🚀 Deploying infrastructure...${NC}"
terraform apply tfplan

# Get outputs
echo -e "${BLUE}📋 Getting deployment information...${NC}"
APP_URL=$(terraform output -raw application_url)
SSH_COMMAND=$(terraform output -raw ssh_command)
S3_BUCKET=$(terraform output -raw s3_bucket_name)

# Display success information
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${PURPLE}📱 Application Information:${NC}"
echo -e "${BLUE}├── Application URL: ${APP_URL}${NC}"
echo -e "${BLUE}├── SSH Command: ${SSH_COMMAND}${NC}"
echo -e "${BLUE}└── S3 Bucket: ${S3_BUCKET}${NC}"
echo ""

# Wait for application to be ready
echo -e "${YELLOW}⏳ Waiting for application to start (this may take 5-10 minutes)...${NC}"
for i in {1..30}; do
    if curl -s "${APP_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 20
done

echo ""
echo -e "${GREEN}🎵 MusicMart is now running!${NC}"
echo ""
echo -e "${PURPLE}🔗 Quick Links:${NC}"
echo -e "${BLUE}├── Application: ${APP_URL}${NC}"
echo -e "${BLUE}├── Health Check: ${APP_URL}/api/health${NC}"
echo -e "${BLUE}├── Initialize DB: ${APP_URL}/api/init-db (POST request)${NC}"
echo -e "${BLUE}└── Products API: ${APP_URL}/api/products${NC}"
echo ""

echo -e "${PURPLE}📋 Next Steps:${NC}"
echo -e "${BLUE}1. Visit ${APP_URL} to see your application${NC}"
echo -e "${BLUE}2. Click 'Initialize Database' to set up sample data${NC}"
echo -e "${BLUE}3. Start customizing your e-commerce platform${NC}"
echo ""

echo -e "${GREEN}💰 Monthly Cost: \$0.00 (within AWS Free Tier limits)${NC}"
echo -e "${YELLOW}⚠️  Monitor your usage at: https://console.aws.amazon.com/billing/home#/freetier${NC}"
echo ""

# Save deployment info
cat > ../deployment-info.txt << EOF
MusicMart Deployment Information
================================
Deployment Date: $(date)
Application URL: ${APP_URL}
SSH Command: ${SSH_COMMAND}
S3 Bucket: ${S3_BUCKET}
AWS Region: ${AWS_REGION}
Account ID: ${ACCOUNT_ID}

Cost: $0.00/month (AWS Free Tier)

Quick Commands:
- Check health: curl ${APP_URL}/api/health
- Initialize DB: curl -X POST ${APP_URL}/api/init-db
- SSH to server: ${SSH_COMMAND}
EOF

echo -e "${GREEN}📄 Deployment info saved to deployment-info.txt${NC}"
echo -e "${PURPLE}🎉 Happy coding with your FREE e-commerce platform!${NC}"
