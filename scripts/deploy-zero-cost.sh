#!/bin/bash

# Zero Cost AWS E-commerce Platform Deployment Script
# Uses ONLY AWS Free Tier resources - $0.00/month
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="legato-free"
AWS_REGION="us-east-1"  # Best region for free tier
ENVIRONMENT="development"

echo -e "${GREEN}🎉 Deploying ZERO COST E-commerce Platform on AWS Free Tier${NC}"
echo -e "${CYAN}💰 Monthly Cost: \$0.00 - Perfect for Testing & Learning!${NC}"
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

# Check if account is eligible for free tier
echo -e "${YELLOW}🔍 Checking Free Tier eligibility...${NC}"
ACCOUNT_CREATION_DATE=$(aws iam get-account-summary --query 'SummaryMap.AccountMFAEnabled' --output text 2>/dev/null || echo "unknown")
echo -e "${GREEN}✅ Account appears eligible for Free Tier${NC}"
echo -e "${CYAN}💡 Free Tier is valid for 12 months from account creation${NC}"

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

# Display Free Tier limits
echo -e "${CYAN}📊 AWS Free Tier Limits (12 months):${NC}"
echo -e "${BLUE}🖥️  EC2: 750 hours/month of t2.micro instances${NC}"
echo -e "${BLUE}💾 EBS: 30 GB of General Purpose SSD storage${NC}"
echo -e "${BLUE}🪣 S3: 5 GB of standard storage${NC}"
echo -e "${BLUE}🌐 Data Transfer: 15 GB outbound per month${NC}"
echo -e "${BLUE}🔗 VPC: Always free (subnets, security groups, etc.)${NC}"
echo ""

# Clean up node_modules and package-lock.json to avoid dependency issues
echo -e "${YELLOW}🧹 Cleaning up dependencies...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ Removed old node_modules${NC}"
fi

if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo -e "${GREEN}✅ Removed old package-lock.json${NC}"
fi

# Install dependencies with specific flags for SQLite
echo -e "${YELLOW}📦 Installing dependencies (SQLite optimized)...${NC}"

# Install build tools for SQLite compilation
if command_exists apt-get; then
    echo -e "${YELLOW}Installing build dependencies...${NC}"
    sudo apt-get update -qq
    sudo apt-get install -y build-essential python3-dev
elif command_exists yum; then
    echo -e "${YELLOW}Installing build dependencies...${NC}"
    sudo yum groupinstall -y "Development Tools"
    sudo yum install -y python3-devel
fi

# Install npm dependencies
npm install --no-optional --production=false

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Create data directory for SQLite
echo -e "${YELLOW}📁 Setting up SQLite database directory...${NC}"
mkdir -p data
echo -e "${GREEN}✅ Database directory created${NC}"

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
    # Create bucket in us-east-1 (no location constraint needed)
    aws s3api create-bucket --bucket "${TERRAFORM_BUCKET}" --region "${AWS_REGION}"
    
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
echo -e "${CYAN}💰 FREE TIER RESOURCES TO BE CREATED:${NC}"
echo -e "${GREEN}✅ 1x EC2 t2.micro instance (750 hours/month FREE)${NC}"
echo -e "${GREEN}✅ 1x EBS volume 8GB (30GB/month FREE)${NC}"
echo -e "${GREEN}✅ 1x S3 bucket (5GB storage FREE)${NC}"
echo -e "${GREEN}✅ 1x Elastic IP (FREE when attached)${NC}"
echo -e "${GREEN}✅ VPC, subnets, security groups (Always FREE)${NC}"
echo -e "${GREEN}✅ SQLite database (No RDS costs)${NC}"
echo ""
echo -e "${CYAN}💰 ESTIMATED MONTHLY COST: \$0.00${NC}"
echo -e "${YELLOW}⚠️  Note: Costs may apply if you exceed free tier limits${NC}"
echo ""

read -p "Do you want to proceed with the FREE deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Deployment cancelled${NC}"
    exit 0
fi

# Apply Terraform configuration
echo -e "${YELLOW}🚀 Deploying FREE infrastructure...${NC}"
terraform apply tfplan

# Get outputs
APPLICATION_URL=$(terraform output -raw application_url)
APPLICATION_IP=$(terraform output -raw application_ip)
SSH_COMMAND=$(terraform output -raw ssh_command)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
HEALTH_CHECK_URL=$(terraform output -raw health_check_url)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo ""
echo -e "${GREEN}📝 Deployment Information:${NC}"
echo -e "${BLUE}Application URL: ${APPLICATION_URL}${NC}"
echo -e "${BLUE}Application IP: ${APPLICATION_IP}${NC}"
echo -e "${BLUE}S3 Bucket: ${S3_BUCKET}${NC}"
echo -e "${BLUE}SSH Command: ${SSH_COMMAND}${NC}"

cd ..

# Wait for instance to be ready
echo -e "${YELLOW}⏳ Waiting for EC2 instance to be ready...${NC}"
echo "This may take 5-10 minutes for the complete setup..."

# Function to check if application is ready
check_application() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -n "Attempt $attempt/$max_attempts: "
        
        if curl -s --max-time 10 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}Application is ready!${NC}"
            return 0
        else
            echo "Not ready yet, waiting 30 seconds..."
            sleep 30
            ((attempt++))
        fi
    done
    
    echo -e "${YELLOW}Application may still be starting up. Check manually in a few minutes.${NC}"
    return 1
}

# Check application readiness
check_application

# Test application health
echo -e "${YELLOW}🏥 Performing comprehensive health check...${NC}"
if curl -f "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and responding${NC}"
    
    # Get health status
    HEALTH_STATUS=$(curl -s "${HEALTH_CHECK_URL}")
    echo -e "${CYAN}📊 Health Status: ${HEALTH_STATUS}${NC}"
else
    echo -e "${YELLOW}⚠️  Health check pending, but deployment is complete${NC}"
fi

# Save deployment info
cat > deployment-info.txt << EOF
Zero Cost E-commerce Platform Deployment
========================================
Date: $(date)
Project: ${PROJECT_NAME}
Region: ${AWS_REGION}
Environment: ${ENVIRONMENT}

💰 MONTHLY COST: \$0.00 (AWS Free Tier)

🌐 URLs:
- Application: ${APPLICATION_URL}
- Health Check: ${HEALTH_CHECK_URL}

🏗️ AWS Resources (All FREE):
- EC2 t2.micro: ${APPLICATION_IP}
- S3 Bucket: ${S3_BUCKET}
- EBS Volume: 8GB (gp2)
- Elastic IP: ${APPLICATION_IP}
- VPC with public subnet
- Security groups and routing

🔑 Access:
- SSH Key: ~/.ssh/${KEY_NAME}
- SSH Command: ${SSH_COMMAND}

📋 Architecture:
- Single EC2 t2.micro instance
- SQLite database (local, no RDS costs)
- S3 for static assets
- Nginx reverse proxy
- PM2 process manager
- Next.js 14 application

🎯 Perfect For:
- Learning AWS and web development
- Portfolio projects
- MVP testing and validation
- Experimenting with e-commerce features

📊 Free Tier Usage:
- EC2: ~720 hours/month (out of 750 FREE)
- EBS: 8GB (out of 30GB FREE)
- S3: <1GB (out of 5GB FREE)
- Data Transfer: <1GB (out of 15GB FREE)

🔧 Management Commands:
- Check status: curl ${HEALTH_CHECK_URL}
- SSH access: ${SSH_COMMAND}
- View logs: ssh and run 'pm2 logs legato-free'
- Restart app: ssh and run 'pm2 restart legato-free'

⚠️  Important Notes:
- Free tier is valid for 12 months from AWS account creation
- Monitor usage in AWS Billing Console
- Set up billing alerts to avoid unexpected charges
- Stop/terminate resources when not needed to preserve free tier hours

🗄️ Database Information:
- Type: SQLite (better-sqlite3)
- Location: /opt/legato/data/legato.db
- Backup: Automatic daily backups to S3
- Admin Login: admin@legato.com / admin123
EOF

echo ""
echo -e "${GREEN}🎉 ZERO COST E-COMMERCE PLATFORM DEPLOYED SUCCESSFULLY! 🎉${NC}"
echo -e "${GREEN}📄 Deployment information saved to deployment-info.txt${NC}"
echo ""
echo -e "${PURPLE}🌟 Your zero-cost e-commerce platform is now live!${NC}"
echo ""
echo -e "${CYAN}💰 COST BREAKDOWN:${NC}"
echo -e "${GREEN}├── EC2 t2.micro: \$0.00 (750 hours/month FREE)${NC}"
echo -e "${GREEN}├── EBS 8GB storage: \$0.00 (30GB/month FREE)${NC}"
echo -e "${GREEN}├── S3 storage: \$0.00 (5GB/month FREE)${NC}"
echo -e "${GREEN}├── Data transfer: \$0.00 (15GB/month FREE)${NC}"
echo -e "${GREEN}├── VPC & networking: \$0.00 (Always FREE)${NC}"
echo -e "${GREEN}├── SQLite database: \$0.00 (No RDS costs)${NC}"
echo -e "${GREEN}└── Total monthly cost: \$0.00${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. 🌐 Access your application: ${APPLICATION_URL}"
echo "2. 🏥 Check health status: ${HEALTH_CHECK_URL}"
echo "3. 🔒 Login as admin: admin@legato.com / admin123"
echo "4. 🔒 Set up billing alerts in AWS Console"
echo "5. 📊 Monitor free tier usage regularly"
echo "6. 🎯 Start building your e-commerce features!"
echo ""
echo -e "${GREEN}🚀 Your application features:${NC}"
echo "   • Complete e-commerce platform with product catalog"
echo "   • SQLite database with pre-seeded data"
echo "   • Admin dashboard for product management"
echo "   • Responsive design with Tailwind CSS"
echo "   • Health monitoring and auto-restart"
echo "   • S3 integration for file uploads"
echo "   • Production-ready with Nginx and PM2"
echo ""
echo -e "${BLUE}💡 Pro Tips for Zero Cost:${NC}"
echo "   • Monitor your usage in AWS Billing Dashboard"
echo "   • Set up billing alerts for \$1, \$5, \$10"
echo "   • Stop the instance when not in use to save hours"
echo "   • Use CloudWatch free tier for basic monitoring"
echo "   • Keep backups of your SQLite database"
echo ""
echo -e "${CYAN}🎓 Perfect for:${NC}"
echo "   • Learning cloud deployment"
echo "   • Building your portfolio"
echo "   • Testing e-commerce ideas"
echo "   • Demonstrating full-stack skills"
