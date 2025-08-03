# AWS Deployment Guide for E-commerce Platform

This guide will help you deploy the e-commerce platform on AWS with a complete CI/CD pipeline using Jenkins and Docker.

## Prerequisites

Before starting, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Terraform** installed (v1.0+)
4. **Docker** installed and running
5. **Node.js** installed (v18+)
6. **Git** installed
7. **SSH key pair** for EC2 access

## Quick Start

### 1. Clone and Setup

\`\`\`bash
git clone <your-repository>
cd <your-repository>
chmod +x scripts/*.sh
\`\`\`

### 2. Configure Environment Variables

\`\`\`bash
cp .env.example .env
# Edit .env with your actual values
nano .env
\`\`\`

### 3. Run Automated Setup

\`\`\`bash
./scripts/setup-aws-deployment.sh
\`\`\`

This script will:
- Verify prerequisites
- Set up AWS infrastructure with Terraform
- Build and deploy the Docker container
- Configure the ECS service

### 4. Setup Jenkins CI/CD

\`\`\`bash
./scripts/jenkins-setup.sh
\`\`\`

## Manual Setup Steps

If you prefer manual setup or need to troubleshoot:

### Step 1: AWS CLI Configuration

\`\`\`bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., ap-south-1)
# Enter default output format (json)
\`\`\`

### Step 2: Environment Variables

Create a `.env` file with the following variables:

\`\`\`bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database
DATABASE_HOST=your-rds-endpoint
DATABASE_PORT=5432
DATABASE_NAME=legato_db
DATABASE_USER=legato_user
DATABASE_PASSWORD=your_secure_password

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-character-secret

# AWS
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-s3-bucket
CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-id

# Payment
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# Application
NODE_ENV=production
PORT=3000
\`\`\`

### Step 3: Infrastructure Deployment

\`\`\`bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="project_name=legato-ecommerce" -var="aws_region=ap-south-1"

# Apply configuration
terraform apply
\`\`\`

### Step 4: Build and Deploy Application

\`\`\`bash
# Build Docker image
docker build -t legato-ecommerce:latest .

# Get ECR login
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ecr-url>

# Tag and push image
docker tag legato-ecommerce:latest <ecr-url>:latest
docker push <ecr-url>:latest

# Update ECS service
aws ecs update-service --cluster legato-ecommerce-cluster --service legato-ecommerce-service --force-new-deployment
\`\`\`

## Infrastructure Components

### AWS Services Used

1. **VPC** - Virtual Private Cloud with public/private subnets
2. **EC2** - Jenkins server for CI/CD
3. **ECS Fargate** - Container orchestration for the application
4. **RDS PostgreSQL** - Database with read replica
5. **S3** - Static asset storage
6. **CloudFront** - CDN for global content delivery
7. **Application Load Balancer** - Traffic distribution
8. **ECR** - Docker container registry
9. **Systems Manager** - Secure parameter storage
10. **CloudWatch** - Monitoring and logging

### Architecture Overview

\`\`\`
Internet → CloudFront → ALB → ECS Fargate → RDS
                              ↓
                         S3 (Assets)
                              ↓
                      Jenkins (CI/CD)
\`\`\`

## CI/CD Pipeline

### Jenkins Pipeline Stages

1. **Checkout** - Pull code from repository
2. **Install Dependencies** - npm install
3. **Lint & Type Check** - Code quality checks
4. **Run Tests** - Unit and integration tests
5. **Build Application** - Next.js build
6. **Security Scan** - Vulnerability scanning
7. **Build Docker Image** - Container creation
8. **Push to ECR** - Image registry upload
9. **Deploy to ECS** - Service update
10. **Health Check** - Verify deployment

### Webhook Configuration

Add the following webhook to your GitHub repository:

- **URL**: `http://<jenkins-ip>:8080/github-webhook/`
- **Content Type**: `application/json`
- **Events**: Push, Pull Request

## Environment-Specific Configurations

### Development
- Single AZ deployment
- Smaller instance sizes
- Basic monitoring

### Staging
- Multi-AZ deployment
- Production-like setup
- Enhanced monitoring

### Production
- Multi-AZ with auto-scaling
- Enhanced security
- Full monitoring and alerting
- Backup and disaster recovery

## Security Best Practices

### 1. Network Security
- Private subnets for application and database
- Security groups with minimal required access
- VPC endpoints for AWS services

### 2. Data Security
- RDS encryption at rest
- S3 bucket encryption
- SSL/TLS for all communications

### 3. Access Control
- IAM roles with least privilege
- No hardcoded credentials
- Secrets stored in Systems Manager

### 4. Monitoring
- CloudWatch logs and metrics
- Security group monitoring
- Failed login attempt alerts

## Monitoring and Logging

### CloudWatch Dashboards
- Application metrics
- Infrastructure health
- Database performance
- Error rates and response times

### Log Groups
- Application logs: `/ecs/legato-ecommerce`
- Jenkins logs: `/var/log/jenkins`
- Database logs: RDS enhanced monitoring

### Alerts
- High CPU/Memory usage
- Database connection issues
- Application errors
- Failed deployments

## Backup and Disaster Recovery

### Database Backups
- Automated daily backups (30-day retention)
- Point-in-time recovery enabled
- Cross-region backup replication

### Application Backups
- S3 versioning enabled
- Cross-region replication
- Infrastructure as Code (Terraform)

### Recovery Procedures
1. Database recovery from backup
2. Application rollback via ECS
3. Infrastructure recreation via Terraform

## Scaling Configuration

### Auto Scaling Policies
- **Target CPU**: 70%
- **Min Capacity**: 2 instances
- **Max Capacity**: 10 instances
- **Scale Out**: +2 instances
- **Scale In**: -1 instance

### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization

## Cost Optimization

### Strategies
1. **Right-sizing** - Monitor and adjust instance sizes
2. **Reserved Instances** - For predictable workloads
3. **Spot Instances** - For development/testing
4. **S3 Lifecycle Policies** - Archive old data
5. **CloudFront Caching** - Reduce origin requests

### Cost Monitoring
- AWS Cost Explorer
- Budget alerts
- Resource tagging for cost allocation

## Troubleshooting

### Common Issues

#### 1. ECS Service Won't Start
\`\`\`bash
# Check service events
aws ecs describe-services --cluster legato-ecommerce-cluster --services legato-ecommerce-service

# Check task definition
aws ecs describe-task-definition --task-definition legato-ecommerce-task

# Check logs
aws logs get-log-events --log-group-name /ecs/legato-ecommerce --log-stream-name <stream-name>
\`\`\`

#### 2. Database Connection Issues
\`\`\`bash
# Test database connectivity
psql -h <rds-endpoint> -U legato_user -d legato_db

# Check security groups
aws ec2 describe-security-groups --group-ids <security-group-id>
\`\`\`

#### 3. Jenkins Build Failures
\`\`\`bash
# Check Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# Check Docker daemon
sudo systemctl status docker

# Check AWS credentials
aws sts get-caller-identity
\`\`\`

### Health Checks

#### Application Health
\`\`\`bash
curl -f https://your-domain.com/api/health
\`\`\`

#### Database Health
\`\`\`bash
aws rds describe-db-instances --db-instance-identifier legato-ecommerce-db
\`\`\`

#### ECS Service Health
\`\`\`bash
aws ecs describe-services --cluster legato-ecommerce-cluster --services legato-ecommerce-service
\`\`\`

## Maintenance

### Regular Tasks
1. **Security Updates** - Monthly OS and dependency updates
2. **Database Maintenance** - Weekly performance tuning
3. **Log Cleanup** - Automated via CloudWatch retention
4. **Backup Verification** - Monthly restore tests
5. **Cost Review** - Monthly cost optimization

### Update Procedures
1. Test changes in staging environment
2. Create deployment plan
3. Schedule maintenance window
4. Execute deployment
5. Verify functionality
6. Monitor for issues

## Support and Documentation

### Resources
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Next.js Documentation](https://nextjs.org/docs)

### Getting Help
1. Check application logs in CloudWatch
2. Review Jenkins build logs
3. Check AWS service health dashboard
4. Contact AWS support for infrastructure issues

## Conclusion

This deployment guide provides a production-ready setup for the e-commerce platform on AWS. The infrastructure is designed for scalability, security, and reliability with automated CI/CD pipelines for efficient development workflows.

For questions or issues, refer to the troubleshooting section or check the project documentation.
