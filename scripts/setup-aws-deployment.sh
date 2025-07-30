#!/bin/bash

# AWS E-commerce Platform Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="legato-ecommerce"
AWS_REGION="ap-south-1"
ENVIRONMENT="production"

echo -e "${GREEN}🚀 Setting up AWS E-commerce Platform Deployment...${NC}"
echo -e "${BLUE}Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists aws; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

if ! command_exists terraform; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    echo "Install: https://learn.hashicorp.com/tutorials/terraform/install-cli"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    echo "Install: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
    echo "Install: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Please run: aws configure"
    echo "You'll need:"
    echo "- AWS Access Key ID"
    echo "- AWS Secret Access Key"
    echo "- Default region name (${AWS_REGION})"
    echo "- Default output format (json)"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS credentials verified (Account: ${AWS_ACCOUNT_ID})${NC}"

# Generate SSH key pair if it doesn't exist
echo -e "${YELLOW}🔑 Setting up SSH key pair...${NC}"
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}Generating new SSH key pair...${NC}"
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo -e "${GREEN}✅ SSH key pair generated${NC}"
else
    echo -e "${GREEN}✅ SSH key pair already exists${NC}"
fi

# Create .env file from template
echo -e "${YELLOW}📝 Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update the .env file with your actual values before proceeding${NC}"
    echo -e "${YELLOW}⚠️  Pay special attention to:${NC}"
    echo "   - Database credentials"
    echo "   - NextAuth secret (generate with: openssl rand -base64 32)"
    echo "   - Razorpay keys"
    echo "   - AWS credentials"
    echo ""
    read -p "Press Enter after updating .env file..."
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build
echo -e "${GREEN}✅ Application built successfully${NC}"

# Create S3 bucket for Terraform state
echo -e "${YELLOW}🪣 Setting up Terraform state bucket...${NC}"
TERRAFORM_BUCKET="${PROJECT_NAME}-terraform-state-${AWS_ACCOUNT_ID}"

if aws s3api head-bucket --bucket "${TERRAFORM_BUCKET}" 2>/dev/null; then
    echo -e "${GREEN}✅ Terraform state bucket already exists${NC}"
else
    if [ "${AWS_REGION}" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "${TERRAFORM_BUCKET}" --region "${AWS_REGION}"
    else
        aws s3api create-bucket \
            --bucket "${TERRAFORM_BUCKET}" \
            --region "${AWS_REGION}" \
            --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "${TERRAFORM_BUCKET}" \
        --versioning-configuration Status=Enabled
    
    # Enable server-side encryption
    aws s3api put-bucket-encryption \
        --bucket "${TERRAFORM_BUCKET}" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    echo -e "${GREEN}✅ Terraform state bucket created and configured${NC}"
fi

# Update Terraform backend configuration
echo -e "${YELLOW}🔧 Updating Terraform configuration...${NC}"
sed -i.bak "s/legato-terraform-state/${TERRAFORM_BUCKET}/g" terraform/main.tf
sed -i.bak "s/ap-south-1/${AWS_REGION}/g" terraform/main.tf
echo -e "${GREEN}✅ Terraform configuration updated${NC}"

# Initialize Terraform
echo -e "${YELLOW}🏗️  Initializing Terraform...${NC}"
cd terraform
terraform init
echo -e "${GREEN}✅ Terraform initialized${NC}"

# Plan Terraform deployment
echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan \
    -var="project_name=${PROJECT_NAME}" \
    -var="aws_region=${AWS_REGION}" \
    -var="environment=${ENVIRONMENT}" \
    -out=tfplan

echo -e "${YELLOW}🤔 Review the Terraform plan above.${NC}"
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
    exit 0
fi

# Apply Terraform configuration
echo -e "${YELLOW}🚀 Applying Terraform configuration...${NC}"
terraform apply tfplan

# Get outputs
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
LOAD_BALANCER_URL=$(terraform output -raw load_balancer_url)
JENKINS_IP=$(terraform output -raw jenkins_public_ip)
S3_BUCKET=$(terraform output -raw s3_bucket_name)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${GREEN}📝 Deployment Information:${NC}"
echo -e "${BLUE}ECR Repository: ${ECR_REPOSITORY_URL}${NC}"
echo -e "${BLUE}Load Balancer: ${LOAD_BALANCER_URL}${NC}"
echo -e "${BLUE}Jenkins Server: http://${JENKINS_IP}:8080${NC}"
echo -e "${BLUE}S3 Bucket: ${S3_BUCKET}${NC}"

cd ..

# Build and push Docker image
echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URL}

# Build image
docker build -t ${PROJECT_NAME}:latest .

# Tag and push
docker tag ${PROJECT_NAME}:latest ${ECR_REPOSITORY_URL}:latest
docker push ${ECR_REPOSITORY_URL}:latest

echo -e "${GREEN}✅ Docker image pushed to ECR${NC}"

# Update ECS service
echo -e "${YELLOW}🔄 Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${PROJECT_NAME}-cluster \
    --service ${PROJECT_NAME}-service \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

echo -e "${YELLOW}⏳ Waiting for service to stabilize...${NC}"
aws ecs wait services-stable \
    --cluster ${PROJECT_NAME}-cluster \
    --services ${PROJECT_NAME}-service \
    --region ${AWS_REGION}

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 30
if curl -f "${LOAD_BALANCER_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but deployment is complete${NC}"
    echo -e "${YELLOW}   Check ECS logs for more information${NC}"
fi

# Save deployment info
cat > deployment-info.txt << EOF
Deployment Information
=====================
Date: $(date)
Project: ${PROJECT_NAME}
Region: ${AWS_REGION}
Environment: ${ENVIRONMENT}

URLs:
- Application: ${LOAD_BALANCER_URL}
- Jenkins: http://${JENKINS_IP}:8080
- ECR Repository: ${ECR_REPOSITORY_URL}
- S3 Bucket: ${S3_BUCKET}

Next Steps:
1. Configure domain name and SSL certificate
2. Set up Jenkins CI/CD pipeline
3. Configure monitoring and alerting
4. Set up backup and disaster recovery
5. Configure auto-scaling policies

Important Files:
- .env: Environment variables
- terraform/: Infrastructure as code
- Dockerfile: Container configuration
- docker-compose.yml: Local development
EOF

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📄 Deployment information saved to deployment-info.txt${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Configure your domain name to point to: ${LOAD_BALANCER_URL}"
echo "2. Set up Jenkins CI/CD pipeline at: http://${JENKINS_IP}:8080"
echo "3. Configure SSL certificate in AWS Certificate Manager"
echo "4. Set up monitoring and alerting"
echo "5. Configure backup policies"
echo ""
echo -e "${GREEN}🌐 Your application is now live at: ${LOAD_BALANCER_URL}${NC}"
