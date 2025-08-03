#!/bin/bash

# Simplified Zero Cost E-commerce Platform Deployment
# No local npm install required - everything happens on the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting simplified deployment...${NC}"
echo -e "${GREEN}🎉 Simplified ZERO COST E-commerce Platform Deployment${NC}"
echo -e "${CYAN}💰 Monthly Cost: \$0.00 - No local npm install required!${NC}"

# Configuration
PROJECT_NAME="legato-free"
AWS_REGION="us-east-1"
ENVIRONMENT="development"
KEY_NAME="legato-key"

echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI is required but not installed.${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}❌ Terraform is required but not installed.${NC}"; exit 1; }
echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS credentials verified (Account: ${ACCOUNT_ID})${NC}"

# Check SSH key
echo -e "${YELLOW}🔑 Setting up SSH key pair...${NC}"
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}Creating SSH key pair...${NC}"
    aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text > ~/.ssh/"$KEY_NAME"
    chmod 600 ~/.ssh/"$KEY_NAME"
    echo -e "${GREEN}✅ SSH key pair created${NC}"
else
    echo -e "${GREEN}✅ SSH key pair already exists${NC}"
fi

# Skip local npm install
echo -e "${YELLOW}⏭️  Skipping local npm install (will install on server)${NC}"

# Setup SQLite database directory
echo -e "${YELLOW}📁 Setting up SQLite database directory...${NC}"
mkdir -p data
echo -e "${GREEN}✅ Database directory created${NC}"

# Use local Terraform state
echo -e "${YELLOW}🔧 Using local Terraform state (no S3 permissions needed)...${NC}"

# Update Terraform configuration for local state
echo -e "${YELLOW}🔧 Updating Terraform configuration for local state...${NC}"
cd terraform

# Remove S3 backend configuration if it exists
if grep -q "backend \"s3\"" main.tf; then
    sed -i '/backend "s3" {/,/}/d' main.tf
fi

echo -e "${GREEN}✅ Terraform configured for local state${NC}"

# Initialize Terraform
echo -e "${YELLOW}🏗️  Initializing Terraform...${NC}"
terraform init

echo -e "${GREEN}✅ Terraform initialized${NC}"

# Plan deployment
echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan -var="key_name=$KEY_NAME" -var="project_name=$PROJECT_NAME" -var="aws_region=$AWS_REGION" -var="environment=$ENVIRONMENT"

# Apply deployment
echo -e "${YELLOW}🚀 Deploying infrastructure...${NC}"
terraform apply -auto-approve -var="key_name=$KEY_NAME" -var="project_name=$PROJECT_NAME" -var="aws_region=$AWS_REGION" -var="environment=$ENVIRONMENT"

# Get outputs
echo -e "${YELLOW}📊 Getting deployment information...${NC}"
APPLICATION_URL=$(terraform output -raw application_url)
APPLICATION_IP=$(terraform output -raw application_ip)
SSH_COMMAND=$(terraform output -raw ssh_command)

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${CYAN}💰 Monthly Cost: \$0.00 (AWS Free Tier)${NC}"
echo ""
echo -e "${BLUE}🌐 Application URL: ${APPLICATION_URL}${NC}"
echo -e "${BLUE}🔗 Health Check: ${APPLICATION_URL}/api/health${NC}"
echo -e "${BLUE}🔑 SSH Command: ${SSH_COMMAND}${NC}"
echo ""
echo -e "${YELLOW}⏳ The application may take 5-10 minutes to fully initialize.${NC}"
echo -e "${YELLOW}📊 Check the health endpoint to verify when it's ready.${NC}"
echo ""
echo -e "${PURPLE}🎯 Perfect for learning, testing, and portfolio projects!${NC}"
EOF

chmod +x scripts/deploy-zero-cost-simple.sh
