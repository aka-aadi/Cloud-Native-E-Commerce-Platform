#!/bin/bash

# Free Tier AWS Deployment Script for MusicMart E-commerce Platform
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

echo -e "${GREEN}🎵 Starting MusicMart Free Tier deployment to AWS...${NC}"
echo -e "${BLUE}💰 This deployment is optimized for AWS Free Tier limits${NC}"

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

# Check free tier eligibility
echo -e "${YELLOW}🔍 Checking Free Tier eligibility...${NC}"
ACCOUNT_AGE=$(aws support describe-trusted-advisor-checks --language en --query 'checks[?name==`Service Limits`].id' --output text 2>/dev/null || echo "unknown")

if [ "$ACCOUNT_AGE" == "unknown" ]; then
    echo -e "${YELLOW}⚠️  Cannot verify account age. Proceeding with Free Tier deployment.${NC}"
else
    echo -e "${GREEN}✅ Account appears eligible for Free Tier${NC}"
fi

# Create S3 bucket for Terraform state (if it doesn't exist)
echo -e "${YELLOW}🪣 Creating S3 bucket for Terraform state...${NC}"
BUCKET_NAME="${PROJECT_NAME}-terraform-state-$(date +%s)"

aws s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region ${AWS_REGION} \
    2>/dev/null || echo "Bucket creation attempted"

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled 2>/dev/null || true

echo -e "${GREEN}✅ S3 bucket ready: ${BUCKET_NAME}${NC}"

# Update Terraform backend configuration
sed -i.bak "s/musicmart-terraform-state/${BUCKET_NAME}/g" terraform/main.tf

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

echo -e "${BLUE}💡 Free Tier Resources to be created:${NC}"
echo -e "${BLUE}   • 1x t2.micro EC2 instance (750 hours/month free)${NC}"
echo -e "${BLUE}   • 1x db.t3.micro RDS PostgreSQL (750 hours/month free)${NC}"
echo -e "${BLUE}   • 1x S3 bucket (5GB storage free)${NC}"
echo -e "${BLUE}   • 1x CloudFront distribution (1TB transfer free)${NC}"
echo -e "${BLUE}   • VPC, subnets, security groups (free)${NC}"
echo -e "${BLUE}   • 1x NAT Gateway (⚠️  ~$45/month - not free)${NC}"

echo -e "${YELLOW}⚠️  WARNING: NAT Gateway will incur charges (~$45/month)${NC}"
echo -e "${YELLOW}   Alternative: Use public subnets only (less secure)${NC}"

read -p "Do you want to continue with this deployment? (y/N): " -n 1 -r
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
CLOUDFRONT_URL=$(terraform output -raw cloudfront_url)
SSH_COMMAND=$(terraform output -raw ssh_command)
S3_BUCKET=$(terraform output -raw s3_bucket_name)

echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
echo -e "${GREEN}🌐 Application URL: ${APPLICATION_URL}${NC}"
echo -e "${GREEN}🌐 CloudFront URL: ${CLOUDFRONT_URL}${NC}"
echo -e "${GREEN}🔗 SSH Command: ${SSH_COMMAND}${NC}"

cd ..

# Wait for EC2 instance to be ready
echo -e "${YELLOW}⏳ Waiting for EC2 instance to be ready...${NC}"
sleep 120

# Test application health
echo -e "${YELLOW}🏥 Performing health check...${NC}"
for i in {1..10}; do
    if curl -f "${APPLICATION_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy and responding${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for application to start... (attempt $i/10)${NC}"
        sleep 30
    fi
done

# Display cost information
echo -e "${BLUE}💰 Free Tier Usage Summary:${NC}"
echo -e "${BLUE}   ✅ EC2 t2.micro: 750 hours/month (FREE)${NC}"
echo -e "${BLUE}   ✅ RDS db.t3.micro: 750 hours/month (FREE)${NC}"
echo -e "${BLUE}   ✅ S3 storage: Up to 5GB (FREE)${NC}"
echo -e "${BLUE}   ✅ CloudFront: 1TB data transfer (FREE)${NC}"
echo -e "${BLUE}   ⚠️  NAT Gateway: ~$45/month (PAID)${NC}"
echo -e "${BLUE}   ⚠️  EBS storage: 30GB gp2 (FREE for first year)${NC}"

echo -e "${YELLOW}📊 Estimated monthly cost: $45-50 (mostly NAT Gateway)${NC}"

# Display management information
echo -e "${GREEN}🎉 MusicMart Free Tier deployment completed successfully!${NC}"
echo -e "${GREEN}📝 Management Information:${NC}"
echo -e "${GREEN}   • Application: ${APPLICATION_URL}${NC}"
echo -e "${GREEN}   • CloudFront: ${CLOUDFRONT_URL}${NC}"
echo -e "${GREEN}   • SSH Access: ${SSH_COMMAND}${NC}"
echo -e "${GREEN}   • S3 Bucket: ${S3_BUCKET}${NC}"

echo -e "${BLUE}🔧 Next Steps:${NC}"
echo -e "${BLUE}   1. Access your application at: ${APPLICATION_URL}${NC}"
echo -e "${BLUE}   2. Configure your domain to point to CloudFront${NC}"
echo -e "${BLUE}   3. Monitor usage in AWS Billing Dashboard${NC}"
echo -e "${BLUE}   4. Set up billing alerts to avoid unexpected charges${NC}"

# Create monitoring script
cat > monitor-free-tier.sh << 'EOF'
#!/bin/bash
echo "🔍 Free Tier Usage Monitor"
echo "=========================="

# Check EC2 usage
echo "EC2 t2.micro hours this month:"
aws cloudwatch get-metric-statistics \
    --namespace AWS/EC2 \
    --metric-name CPUUtilization \
    --dimensions Name=InstanceType,Value=t2.micro \
    --start-time $(date -d "$(date +%Y-%m-01)" -u +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 3600 \
    --statistics Average \
    --query 'length(Datapoints)' \
    --output text 2>/dev/null || echo "Unable to fetch data"

# Check RDS usage
echo "RDS db.t3.micro hours this month:"
aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name CPUUtilization \
    --dimensions Name=DBInstanceClass,Value=db.t3.micro \
    --start-time $(date -d "$(date +%Y-%m-01)" -u +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 3600 \
    --statistics Average \
    --query 'length(Datapoints)' \
    --output text 2>/dev/null || echo "Unable to fetch data"

echo "💡 Monitor your usage at: https://console.aws.amazon.com/billing/home#/freetier"
EOF

chmod +x monitor-free-tier.sh

echo -e "${GREEN}📊 Created monitoring script: ./monitor-free-tier.sh${NC}"
echo -e "${GREEN}   Run this script to check your Free Tier usage${NC}"
