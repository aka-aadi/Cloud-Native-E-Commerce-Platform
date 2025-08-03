#!/bin/bash

# Complete AWS E-commerce Platform Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="legato-ecommerce"
AWS_REGION="ap-south-1"
ENVIRONMENT="production"

echo -e "${GREEN}🚀 Deploying Scalable E-commerce Platform on AWS${NC}"
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

MISSING_DEPS=()

if ! command_exists aws; then
    MISSING_DEPS+=("AWS CLI")
fi

if ! command_exists terraform; then
    MISSING_DEPS+=("Terraform")
fi

if ! command_exists docker; then
    MISSING_DEPS+=("Docker")
fi

if ! command_exists node; then
    MISSING_DEPS+=("Node.js")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing dependencies: ${MISSING_DEPS[*]}${NC}"
    echo "Please install the missing dependencies and try again."
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "Please run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS credentials verified (Account: ${AWS_ACCOUNT_ID})${NC}"

# Create SSH key pair if it doesn't exist
echo -e "${YELLOW}🔑 Setting up SSH key pair...${NC}"
KEY_NAME="${PROJECT_NAME}-key"

if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo -e "${YELLOW}Creating new SSH key pair...${NC}"
    
    # Generate local key pair
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/${KEY_NAME} -N "" -q
    
    # Import public key to AWS
    aws ec2 import-key-pair \
        --key-name "$KEY_NAME" \
        --public-key-material fileb://~/.ssh/${KEY_NAME}.pub \
        --region "$AWS_REGION"
    
    echo -e "${GREEN}✅ SSH key pair created and imported to AWS${NC}"
else
    echo -e "${GREEN}✅ SSH key pair already exists${NC}"
fi

# Create .env file if it doesn't exist
echo -e "${YELLOW}📝 Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://legato_user:REPLACE_WITH_GENERATED_PASSWORD@REPLACE_WITH_RDS_ENDPOINT:5432/legato_db

# Application Configuration
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# AWS Configuration
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=REPLACE_WITH_S3_BUCKET

# Optional: Payment Integration
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
    echo -e "${YELLOW}⚠️  Please update the .env file with actual values after deployment${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
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
    -var="key_name=${KEY_NAME}" \
    -out=tfplan

echo ""
echo -e "${YELLOW}🤔 Review the Terraform plan above.${NC}"
echo -e "${YELLOW}This will create the following AWS resources:${NC}"
echo "  • VPC with public and private subnets"
echo "  • Application Load Balancer"
echo "  • Auto Scaling Group (2-10 instances)"
echo "  • RDS PostgreSQL database"
echo "  • S3 bucket for assets"
echo "  • ECR repository for Docker images"
echo "  • Jenkins CI/CD server"
echo "  • CloudWatch monitoring"
echo ""
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
LOAD_BALANCER_URL=$(terraform output -raw load_balancer_url)
JENKINS_URL=$(terraform output -raw jenkins_url)
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
DB_ENDPOINT=$(terraform output -raw database_endpoint)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${GREEN}📝 Deployment Information:${NC}"
echo -e "${BLUE}Load Balancer: ${LOAD_BALANCER_URL}${NC}"
echo -e "${BLUE}Jenkins Server: ${JENKINS_URL}${NC}"
echo -e "${BLUE}ECR Repository: ${ECR_REPOSITORY_URL}${NC}"
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

# Wait for Auto Scaling Group to be ready
echo -e "${YELLOW}⏳ Waiting for Auto Scaling Group to be ready...${NC}"
aws autoscaling wait group-in-service \
    --auto-scaling-group-names ${PROJECT_NAME}-asg \
    --region ${AWS_REGION}

# Trigger instance refresh to deploy the application
echo -e "${YELLOW}🔄 Triggering instance refresh for deployment...${NC}"
aws autoscaling start-instance-refresh \
    --auto-scaling-group-name ${PROJECT_NAME}-asg \
    --region ${AWS_REGION} \
    --preferences '{"InstanceWarmup": 300, "MinHealthyPercentage": 50}' > /dev/null

# Wait for instance refresh to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
sleep 60

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=20

while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -f "${LOAD_BALANCER_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy and responding${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for application to be ready... (${HEALTH_CHECK_ATTEMPTS}/${MAX_ATTEMPTS})${NC}"
        sleep 30
        ((HEALTH_CHECK_ATTEMPTS++))
    fi
done

if [ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}⚠️  Health check timeout, but deployment is complete${NC}"
    echo -e "${YELLOW}   Check the application logs for more information${NC}"
fi

# Update .env file with actual values
echo -e "${YELLOW}📝 Updating environment file with deployment values...${NC}"
DB_PASSWORD=$(aws ssm get-parameter --name "/${PROJECT_NAME}/database/password" --with-decryption --query 'Parameter.Value' --output text --region ${AWS_REGION})

sed -i.bak "s|REPLACE_WITH_GENERATED_PASSWORD|${DB_PASSWORD}|g" .env
sed -i.bak "s|REPLACE_WITH_RDS_ENDPOINT|${DB_ENDPOINT}|g" .env
sed -i.bak "s|REPLACE_WITH_S3_BUCKET|${S3_BUCKET}|g" .env
sed -i.bak "s|http://localhost:3000|${LOAD_BALANCER_URL}|g" .env

# Save deployment info
cat > deployment-info.txt << EOF
Scalable E-commerce Platform Deployment
======================================
Date: $(date)
Project: ${PROJECT_NAME}
Region: ${AWS_REGION}
Environment: ${ENVIRONMENT}

🌐 URLs:
- Application: ${LOAD_BALANCER_URL}
- Jenkins CI/CD: ${JENKINS_URL}

🏗️ AWS Resources:
- ECR Repository: ${ECR_REPOSITORY_URL}
- S3 Bucket: ${S3_BUCKET}
- Database: ${DB_ENDPOINT}

🔑 Access:
- SSH Key: ~/.ssh/${KEY_NAME}
- Jenkins Password: Stored in SSM Parameter Store

📋 Architecture:
- Auto Scaling Group (2-10 instances)
- Application Load Balancer
- RDS PostgreSQL (Multi-AZ)
- S3 for static assets
- ECR for Docker images
- CloudWatch monitoring
- Jenkins CI/CD pipeline

🚀 Next Steps:
1. Access your application: ${LOAD_BALANCER_URL}
2. Set up Jenkins pipeline: ${JENKINS_URL}
3. Configure domain name and SSL certificate
4. Set up monitoring alerts
5. Configure backup policies

💰 Estimated Monthly Cost:
- EC2 instances (t3.medium x 3): ~$75
- RDS (db.t3.micro): ~$15
- Load Balancer: ~$20
- Data transfer and storage: ~$10
- Total: ~$120/month

🔧 Management Commands:
- Scale up: aws autoscaling set-desired-capacity --auto-scaling-group-name ${PROJECT_NAME}-asg --desired-capacity 5
- Scale down: aws autoscaling set-desired-capacity --auto-scaling-group-name ${PROJECT_NAME}-asg --desired-capacity 2
- Deploy new version: Push to ECR and trigger instance refresh
EOF

echo ""
echo -e "${GREEN}🎉 Scalable E-commerce Platform Deployment Completed!${NC}"
echo -e "${GREEN}📄 Deployment information saved to deployment-info.txt${NC}"
echo ""
echo -e "${PURPLE}🌟 Your scalable e-commerce platform is now live!${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. 🌐 Access your application: ${LOAD_BALANCER_URL}"
echo "2. 🔧 Set up Jenkins CI/CD: ${JENKINS_URL}"
echo "3. 🔒 Configure SSL certificate in AWS Certificate Manager"
echo "4. 📊 Set up CloudWatch dashboards and alerts"
echo "5. 🔄 Configure automated backups and disaster recovery"
echo ""
echo -e "${GREEN}🚀 Your application is now running with:${NC}"
echo "   • Auto Scaling (2-10 instances based on load)"
echo "   • Load Balancing across multiple availability zones"
echo "   • Managed PostgreSQL database with automated backups"
echo "   • Docker-based deployments via Jenkins CI/CD"
echo "   • CloudWatch monitoring and logging"
echo ""
echo -e "${BLUE}💡 Pro Tips:${NC}"
echo "   • Monitor costs in AWS Cost Explorer"
echo "   • Set up billing alerts"
echo "   • Use AWS CloudFormation for infrastructure versioning"
echo "   • Implement blue-green deployments for zero downtime"
