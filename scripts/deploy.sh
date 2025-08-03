#!/bin/bash

# AWS Deployment Script for MusicMart E-commerce Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="musicmart"
AWS_REGION="us-west-2"
ENVIRONMENT="production"

echo -e "${GREEN}🚀 Starting MusicMart deployment to AWS...${NC}"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials verified${NC}"

# Create S3 bucket for Terraform state (if it doesn't exist)
echo -e "${YELLOW}🪣 Creating S3 bucket for Terraform state...${NC}"
aws s3api create-bucket \
    --bucket "${PROJECT_NAME}-terraform-state" \
    --region ${AWS_REGION} \
    --create-bucket-configuration LocationConstraint=${AWS_REGION} \
    2>/dev/null || echo "Bucket already exists or creation failed"

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
    --bucket "${PROJECT_NAME}-terraform-state" \
    --versioning-configuration Status=Enabled

echo -e "${GREEN}✅ S3 bucket ready${NC}"

# Initialize and apply Terraform
echo -e "${YELLOW}🏗️  Initializing Terraform...${NC}"
cd terraform
terraform init

echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan -var="project_name=${PROJECT_NAME}" -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}"

echo -e "${YELLOW}🚀 Applying Terraform configuration...${NC}"
terraform apply -var="project_name=${PROJECT_NAME}" -var="aws_region=${AWS_REGION}" -var="environment=${ENVIRONMENT}" -auto-approve

# Get outputs from Terraform
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
LOAD_BALANCER_URL=$(terraform output -raw load_balancer_url)

echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
echo -e "${GREEN}📝 ECR Repository: ${ECR_REPOSITORY_URL}${NC}"
echo -e "${GREEN}🌐 Load Balancer URL: ${LOAD_BALANCER_URL}${NC}"

cd ..

# Build and push Docker image
echo -e "${YELLOW}🐳 Building Docker image...${NC}"
docker build -t ${PROJECT_NAME}:latest .

# Tag and push to ECR
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URL}

echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker tag ${PROJECT_NAME}:latest ${ECR_REPOSITORY_URL}:latest
docker push ${ECR_REPOSITORY_URL}:latest

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

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is available at: ${LOAD_BALANCER_URL}${NC}"
echo -e "${GREEN}👤 Admin credentials are stored in AWS Systems Manager Parameter Store${NC}"

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 30
if curl -f "${LOAD_BALANCER_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but deployment is complete. Please check logs.${NC}"
fi

echo -e "${GREEN}🎉 MusicMart deployment completed successfully!${NC}"
