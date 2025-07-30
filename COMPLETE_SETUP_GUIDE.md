# Legato - Complete AWS Deployment Guide

## Overview
Legato is India's premier music marketplace built with Next.js, deployed on AWS using EC2, S3, RDS, and automated with Jenkins CI/CD pipeline.

## Architecture
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes with PostgreSQL
- **Database**: AWS RDS PostgreSQL with read replica
- **Storage**: AWS S3 for static assets and user uploads
- **CDN**: CloudFront for global content delivery
- **Compute**: AWS ECS Fargate for containerized deployment
- **CI/CD**: Jenkins on EC2 with Docker
- **Monitoring**: CloudWatch, ECS Container Insights

## Prerequisites
- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- SSH key pair for EC2 access
- Docker Hub account
- Basic knowledge of AWS, Docker, and CI/CD

## Step 1: Initial AWS Setup

### 1.1 Create AWS Resources
\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd legato

# Initialize Terraform
cd terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply
\`\`\`

### 1.2 Configure Domain (Optional)
If you have a domain name:
1. Update the `domain_name` variable in `terraform/main.tf`
2. Configure DNS to point to CloudFront distribution
3. Verify SSL certificate in AWS Certificate Manager

## Step 2: Database Setup

### 2.1 Connect to RDS Instance
\`\`\`bash
# Get RDS endpoint from Terraform output
terraform output database_endpoint

# Connect using psql (install if needed)
psql -h <rds-endpoint> -U legato_user -d legato_db
\`\`\`

### 2.2 Run Database Scripts
\`\`\`bash
# From the project root
npm install pg
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runScript(filename) {
  const sql = fs.readFileSync(filename, 'utf8');
  await pool.query(sql);
  console.log(\`Executed \${filename}\`);
}

async function main() {
  await runScript('scripts/database-schema.sql');
  await runScript('scripts/sample-data.sql');
  await pool.end();
}

main().catch(console.error);
"
\`\`\`

## Step 3: Jenkins Configuration

### 3.1 Access Jenkins
\`\`\`bash
# Get Jenkins public IP
terraform output jenkins_public_ip

# SSH to Jenkins server
ssh -i ~/.ssh/your-key.pem ec2-user@<jenkins-ip>

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
\`\`\`

### 3.2 Configure Jenkins
1. Open `http://<jenkins-ip>:8080`
2. Enter the initial admin password
3. Install suggested plugins
4. Create admin user
5. Configure system settings

### 3.3 Add Credentials
In Jenkins → Manage Jenkins → Manage Credentials:

1. **AWS Credentials**
   - Kind: AWS Credentials
   - ID: `aws-credentials`
   - Access Key ID: Your AWS Access Key
   - Secret Access Key: Your AWS Secret Key

2. **Docker Hub Credentials**
   - Kind: Username with password
   - ID: `dockerhub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password

3. **Database URL**
   - Kind: Secret text
   - ID: `database-url`
   - Secret: Your RDS connection string

### 3.4 Create Pipeline Job
1. New Item → Pipeline
2. Name: `legato-deploy`
3. Pipeline → Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: Your Git repository
6. Script Path: `Jenkinsfile`

## Step 4: Environment Configuration

### 4.1 Update Environment Variables
Create `.env.production` file:
\`\`\`bash
# Database
DATABASE_URL=postgresql://legato_user:password@rds-endpoint:5432/legato_db

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-s3-bucket

# Payment Gateway (Razorpay for India)
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_secret

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
\`\`\`

### 4.2 Update SSM Parameters
\`\`\`bash
# Update database URL
aws ssm put-parameter \
  --name "/legato/database_url" \
  --value "postgresql://legato_user:password@rds-endpoint:5432/legato_db" \
  --type "SecureString" \
  --overwrite

# Update other secrets
aws ssm put-parameter \
  --name "/legato/razorpay_key_id" \
  --value "rzp_live_your_key" \
  --type "SecureString" \
  --overwrite

aws ssm put-parameter \
  --name "/legato/razorpay_key_secret" \
  --value "your_secret" \
  --type "SecureString" \
  --overwrite
\`\`\`

## Step 5: Application Deployment

### 5.1 Build and Push Initial Image
\`\`\`bash
# Build Docker image
docker build -t legato:latest .

# Tag for ECR
docker tag legato:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/legato:latest

# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Push to ECR
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/legato:latest
\`\`\`

### 5.2 Deploy via Jenkins
1. Go to Jenkins dashboard
2. Click on `legato-deploy` job
3. Click "Build Now"
4. Monitor the build progress

### 5.3 Verify Deployment
\`\`\`bash
# Check ECS service status
aws ecs describe-services \
  --cluster legato-cluster \
  --services legato-service

# Check application health
curl -f https://your-domain.com/api/health
\`\`\`

## Step 6: Domain and SSL Setup

### 6.1 Configure Route 53 (if using AWS DNS)
\`\`\`bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name your-domain.com \
  --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://route53-change.json
\`\`\`

### 6.2 Verify SSL Certificate
1. Go to AWS Certificate Manager
2. Verify certificate status is "Issued"
3. If pending, complete DNS validation

## Step 7: Monitoring and Logging

### 7.1 CloudWatch Dashboards
\`\`\`bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "Legato-Monitoring" \
  --dashboard-body file://cloudwatch-dashboard.json
\`\`\`

### 7.2 Set Up Alarms
\`\`\`bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "Legato-High-CPU" \
  --alarm-description "Alarm when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Database connection alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "Legato-DB-Connections" \
  --alarm-description "Alarm when DB connections exceed 80%" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
\`\`\`

## Step 8: Security Configuration

### 8.1 Update Security Groups
\`\`\`bash
# Restrict SSH access to your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-jenkins \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Remove default SSH access
aws ec2 revoke-security-group-ingress \
  --group-id sg-jenkins \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
\`\`\`

### 8.2 Enable AWS Config
\`\`\`bash
# Enable Config for compliance monitoring
aws configservice put-configuration-recorder \
  --configuration-recorder name=legato-config-recorder,roleARN=arn:aws:iam::account:role/config-role \
  --recording-group allSupported=true,includeGlobalResourceTypes=true
\`\`\`

## Step 9: Backup and Disaster Recovery

### 9.1 RDS Automated Backups
- Backup retention: 30 days (configured in Terraform)
- Backup window: 03:00-04:00 UTC
- Maintenance window: Sunday 04:00-05:00 UTC

### 9.2 S3 Versioning and Lifecycle
\`\`\`bash
# Configure S3 lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket legato-assets \
  --lifecycle-configuration file://s3-lifecycle.json
\`\`\`

## Step 10: Performance Optimization

### 10.1 CloudFront Optimization
- Enable Gzip compression
- Set appropriate cache headers
- Configure custom error pages

### 10.2 Database Optimization
\`\`\`sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_products_search ON products USING gin(search_vector);
CREATE INDEX CONCURRENTLY idx_products_location ON products(state, city);
CREATE INDEX CONCURRENTLY idx_orders_status_date ON orders(status, created_at);
\`\`\`

## Step 11: Testing and Validation

### 11.1 Load Testing
\`\`\`bash
# Install Apache Bench
sudo yum install httpd-tools

# Run load test
ab -n 1000 -c 10 https://your-domain.com/
\`\`\`

### 11.2 Security Testing
\`\`\`bash
# Run security scan
npm audit
npx snyk test
\`\`\`

## Step 12: Go Live Checklist

- [ ] Database is populated with real data
- [ ] SSL certificate is valid and configured
- [ ] Domain DNS is properly configured
- [ ] Payment gateway is configured with live keys
- [ ] Email service is configured
- [ ] Monitoring and alerts are set up
- [ ] Backup strategy is implemented
- [ ] Security groups are properly configured
- [ ] Load testing is completed
- [ ] Error pages are configured
- [ ] Analytics tracking is set up

## Admin Access

### Default Admin Credentials
- **Email**: admin@legato.com
- **Password**: Legato2024!Admin

**⚠️ Important**: Change these credentials immediately after first login!

### Admin Panel Features
- Dashboard with real-time analytics
- User management
- Product/listing moderation
- Order management
- Revenue tracking
- System health monitoring

## Maintenance

### Regular Tasks
1. **Weekly**: Review CloudWatch logs and metrics
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and optimize database performance
4. **Annually**: Review and update disaster recovery procedures

### Scaling Considerations
- ECS Auto Scaling is configured (2-10 instances)
- RDS can be scaled vertically as needed
- CloudFront provides global CDN coverage
- S3 scales automatically

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check ECS task logs in CloudWatch
   - Verify environment variables in SSM
   - Check database connectivity

2. **High response times**
   - Check CloudWatch metrics
   - Review database query performance
   - Verify CloudFront cache hit ratio

3. **Database connection errors**
   - Check RDS instance status
   - Verify security group rules
   - Check connection pool settings

4. **Jenkins build failures**
   - Check Jenkins logs
   - Verify AWS credentials
   - Check Docker daemon status

### Support Contacts
- AWS Support: Use AWS Support Center
- Application Issues: Check GitHub issues
- Database Issues: Review RDS logs in CloudWatch

## Cost Optimization

### Monthly Cost Estimate (USD)
- ECS Fargate (3 tasks): ~$45
- RDS db.t3.medium: ~$35
- Application Load Balancer: ~$20
- CloudFront: ~$10
- S3 Storage (100GB): ~$3
- EC2 Jenkins (t3.medium): ~$25
- **Total**: ~$138/month

### Cost Optimization Tips
1. Use Reserved Instances for predictable workloads
2. Enable S3 Intelligent Tiering
3. Set up CloudWatch billing alarms
4. Review and optimize unused resources monthly

---

## Conclusion

Your Legato marketplace is now fully deployed on AWS with enterprise-grade infrastructure, automated CI/CD, and comprehensive monitoring. The platform is ready to handle thousands of users and can scale automatically based on demand.

For any issues or questions, refer to the troubleshooting section or check the application logs in CloudWatch.

**Happy Selling! 🎵**
