# 🚀 AWS Deployment Guide for MusicMart E-commerce Platform

This guide will walk you through deploying the MusicMart e-commerce platform on AWS with full CI/CD pipeline using Jenkins and Docker.

## 📋 Prerequisites

Before starting the deployment, ensure you have:

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed
- Terraform installed
- Node.js 18+ installed
- Git installed

## 🏗️ Architecture Overview

The deployment includes:

- **EC2**: Jenkins CI/CD server
- **ECS Fargate**: Container orchestration for the application
- **RDS PostgreSQL**: Database for user data and listings
- **S3**: File storage for images and static assets
- **ALB**: Application Load Balancer for high availability
- **ECR**: Container registry for Docker images
- **CloudWatch**: Monitoring and logging
- **Systems Manager**: Secure parameter storage

## 🔧 Step 1: Initial AWS Setup

### 1.1 Configure AWS CLI

\`\`\`bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-west-2
# Default output format: json
\`\`\`

### 1.2 Verify AWS Configuration

\`\`\`bash
aws sts get-caller-identity
\`\`\`

## 🏗️ Step 2: Deploy Infrastructure

### 2.1 Clone the Repository

\`\`\`bash
git clone <your-repository-url>
cd musicmart
\`\`\`

### 2.2 Run the Deployment Script

\`\`\`bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
\`\`\`

This script will:
- Create S3 bucket for Terraform state
- Deploy AWS infrastructure using Terraform
- Build and push Docker image to ECR
- Deploy the application to ECS

### 2.3 Manual Terraform Deployment (Alternative)

\`\`\`bash
cd terraform
terraform init
terraform plan
terraform apply
\`\`\`

## 🔄 Step 3: Set Up CI/CD Pipeline

### 3.1 Install Jenkins

\`\`\`bash
chmod +x scripts/setup-jenkins.sh
./scripts/setup-jenkins.sh
\`\`\`

### 3.2 Configure Jenkins

1. Access Jenkins at `http://localhost:8080`
2. Login with credentials:
   - **Username**: `admin`
   - **Password**: `musicmart123!`

3. Install required plugins:
   - Docker Pipeline
   - AWS Pipeline
   - GitHub Integration

### 3.3 Add Credentials in Jenkins

Go to **Manage Jenkins** > **Manage Credentials** and add:

1. **AWS Credentials**:
   - Kind: AWS Credentials
   - ID: `aws-credentials`
   - Access Key ID: Your AWS Access Key
   - Secret Access Key: Your AWS Secret Key

2. **GitHub Credentials**:
   - Kind: Username with password
   - ID: `github-credentials`
   - Username: Your GitHub username
   - Password: Your GitHub personal access token

3. **Docker Hub Credentials** (optional):
   - Kind: Username with password
   - ID: `dockerhub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password

## 🔐 Step 4: Environment Variables

### 4.1 Create Environment File

Copy `.env.example` to `.env` and update with your values:

\`\`\`bash
cp .env.example .env
\`\`\`

### 4.2 Update AWS Systems Manager Parameters

The Terraform deployment automatically creates secure parameters. To update them:

\`\`\`bash
# Update database URL
aws ssm put-parameter \
  --name "/musicmart/database_url" \
  --value "your-database-url" \
  --type "SecureString" \
  --overwrite

# Update NextAuth secret
aws ssm put-parameter \
  --name "/musicmart/nextauth_secret" \
  --value "your-nextauth-secret" \
  --type "SecureString" \
  --overwrite
\`\`\`

## 🗄️ Step 5: Database Setup

### 5.1 Connect to RDS Instance

\`\`\`bash
# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier musicmart-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
\`\`\`

### 5.2 Run Database Migrations

\`\`\`bash
# Connect to the database and run initial schema
psql -h your-rds-endpoint -U musicmart_user -d musicmart -f scripts/init.sql
\`\`\`

## 🚀 Step 6: Deploy Application

### 6.1 Trigger Deployment

Push code to your main branch to trigger the Jenkins pipeline:

\`\`\`bash
git add .
git commit -m "Deploy to production"
git push origin main
\`\`\`

### 6.2 Monitor Deployment

1. Check Jenkins pipeline: `http://localhost:8080`
2. Monitor ECS service: AWS Console > ECS > Services
3. Check application logs: AWS Console > CloudWatch > Log Groups

## 🔍 Step 7: Verification

### 7.1 Health Check

\`\`\`bash
# Replace with your actual load balancer URL
curl http://your-load-balancer-url/api/health
\`\`\`

### 7.2 Admin Access

1. Navigate to: `http://your-load-balancer-url/admin`
2. Login with:
   - **Email**: `admin@musicmart.com`
   - **Password**: `MusicMart2024!Admin`

## 📊 Step 8: Monitoring and Maintenance

### 8.1 CloudWatch Dashboards

Access monitoring dashboards:
- Application metrics: AWS Console > CloudWatch > Dashboards
- ECS service health: AWS Console > ECS > Clusters
- Database performance: AWS Console > RDS > Performance Insights

### 8.2 Log Analysis

View application logs:
\`\`\`bash
aws logs describe-log-groups --log-group-name-prefix "/ecs/musicmart"
aws logs tail /ecs/musicmart --follow
\`\`\`

### 8.3 Scaling

Scale the application:
\`\`\`bash
# Scale ECS service
aws ecs update-service \
  --cluster musicmart-cluster \
  --service musicmart-service \
  --desired-count 4
\`\`\`

## 🔒 Security Considerations

### 8.1 Update Admin Credentials

**Important**: Change default admin credentials after first login:

1. Go to Admin Panel > Users
2. Update admin account with strong password
3. Enable 2FA if available

### 8.2 SSL/TLS Configuration

Add SSL certificate to ALB:

\`\`\`bash
# Request certificate from ACM
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-west-2
\`\`\`

### 8.3 Security Groups

Review and tighten security group rules:
- Allow only necessary ports
- Restrict source IP ranges where possible
- Enable VPC Flow Logs

## 🚨 Troubleshooting

### Common Issues

1. **ECS Service Won't Start**
   - Check CloudWatch logs
   - Verify environment variables
   - Ensure ECR image exists

2. **Database Connection Failed**
   - Verify RDS security groups
   - Check parameter store values
   - Test network connectivity

3. **Load Balancer Health Check Failed**
   - Verify health check endpoint
   - Check application startup time
   - Review security group rules

### Useful Commands

\`\`\`bash
# Check ECS service status
aws ecs describe-services --cluster musicmart-cluster --services musicmart-service

# View recent logs
aws logs tail /ecs/musicmart --since 1h

# Force new deployment
aws ecs update-service --cluster musicmart-cluster --service musicmart-service --force-new-deployment
\`\`\`

## 💰 Cost Optimization

### 8.1 Resource Rightsizing

- Monitor CPU/Memory usage in CloudWatch
- Adjust ECS task definitions based on actual usage
- Use smaller RDS instance for development

### 8.2 Auto Scaling

Enable ECS Auto Scaling:

\`\`\`bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/musicmart-cluster/musicmart-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
\`\`\`

## 📞 Support

For deployment issues:

1. Check AWS CloudWatch logs
2. Review Jenkins build logs
3. Consult AWS documentation
4. Contact your DevOps team

## 🎉 Success!

Your MusicMart e-commerce platform is now deployed on AWS with:

- ✅ Scalable container-based architecture
- ✅ Automated CI/CD pipeline
- ✅ Secure database and file storage
- ✅ Load balancing and high availability
- ✅ Comprehensive monitoring
- ✅ Modern UI with light/dark mode

**Access URLs:**
- **Application**: `http://your-load-balancer-url`
- **Admin Panel**: `http://your-load-balancer-url/admin`
- **Jenkins**: `http://localhost:8080`

**Admin Credentials:**
- **Username**: admin@musicmart.com
- **Password**: MusicMart2024!Admin

Remember to change the admin password after first login for security!
