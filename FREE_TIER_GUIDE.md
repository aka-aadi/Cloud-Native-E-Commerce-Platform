# AWS Free Tier Deployment Guide

This guide explains how to deploy the MusicMart e-commerce platform using AWS Free Tier resources to minimize costs.

## 🆓 Free Tier Resources Used

### Compute
- **EC2 t2.micro**: 750 hours/month (FREE for 12 months)
- **Application hosting**: Single instance with PM2 process manager

### Database
- **RDS db.t3.micro**: 750 hours/month (FREE for 12 months)
- **PostgreSQL**: 20GB storage included
- **Automated backups**: 7 days retention

### Storage
- **S3 Standard**: 5GB storage (FREE)
- **Data transfer**: 15GB out per month (FREE)

### Content Delivery
- **CloudFront**: 1TB data transfer out (FREE for 12 months)
- **50GB data transfer out to origin** (FREE)

### Networking
- **VPC**: Unlimited (FREE)
- **Elastic IP**: 1 free when attached to running instance
- **Data Transfer**: 1GB out per month (FREE)

## 💰 Cost Breakdown

### Free Components (First 12 Months)
- EC2 t2.micro: $0
- RDS db.t3.micro: $0
- S3 (5GB): $0
- CloudFront (1TB): $0
- VPC components: $0

### Paid Components
- **NAT Gateway**: ~$45/month (biggest cost)
- **EBS Storage**: 30GB gp2 (~$3/month after first year)
- **Data transfer**: Overage charges if limits exceeded

### **Total Estimated Cost: $45-50/month**

## 🏗️ Architecture

\`\`\`
Internet
    ↓
CloudFront (CDN)
    ↓
EC2 t2.micro (Application)
    ↓
RDS db.t3.micro (Database)
    ↓
S3 (Static Assets)
\`\`\`

## 🚀 Quick Deployment

### Prerequisites
\`\`\`bash
# Install required tools
./scripts/install-prerequisites.sh

# Configure AWS CLI
aws configure
\`\`\`

### Deploy
\`\`\`bash
# Run free tier deployment
./scripts/deploy-free-tier.sh
\`\`\`

## 📊 Monitoring Free Tier Usage

### AWS Console
1. Go to [AWS Billing Console](https://console.aws.amazon.com/billing/home#/freetier)
2. Monitor your Free Tier usage
3. Set up billing alerts

### Command Line
\`\`\`bash
# Run the monitoring script
./monitor-free-tier.sh
\`\`\`

### CloudWatch Metrics
- CPU utilization
- Memory usage
- Network traffic
- Database connections

## ⚠️ Free Tier Limitations

### EC2 Limitations
- **750 hours/month**: ~31 days of continuous running
- **t2.micro only**: 1 vCPU, 1GB RAM
- **Limited network performance**

### RDS Limitations
- **750 hours/month**: ~31 days of continuous running
- **db.t3.micro only**: 2 vCPU, 1GB RAM
- **20GB storage maximum**
- **Single AZ deployment**

### S3 Limitations
- **5GB storage**
- **20,000 GET requests/month**
- **2,000 PUT requests/month**

### CloudFront Limitations
- **1TB data transfer out**
- **10,000,000 HTTP requests**
- **2,000,000 CloudFront function invocations**

## 🔧 Optimization Tips

### Reduce Costs
1. **Remove NAT Gateway**: Use public subnets only (less secure)
2. **Stop instances when not needed**: Saves compute hours
3. **Use S3 Intelligent Tiering**: Optimize storage costs
4. **Enable CloudFront compression**: Reduce bandwidth usage

### Performance Optimization
1. **Use CloudFront caching**: Reduce origin requests
2. **Optimize images**: Compress before uploading to S3
3. **Database connection pooling**: Reduce RDS load
4. **Enable gzip compression**: Reduce bandwidth

### Security Best Practices
1. **Restrict security groups**: Limit access to necessary ports
2. **Use IAM roles**: Avoid hardcoded credentials
3. **Enable CloudTrail**: Monitor API calls (additional cost)
4. **Regular security updates**: Keep EC2 instance updated

## 📈 Scaling Beyond Free Tier

### When to Upgrade
- **Traffic exceeds free tier limits**
- **Need high availability**
- **Require better performance**
- **Need additional features**

### Upgrade Path
1. **Multi-AZ RDS**: For high availability
2. **Auto Scaling Group**: For traffic spikes
3. **Application Load Balancer**: For multiple instances
4. **ElastiCache**: For caching layer

## 🚨 Billing Alerts

### Set Up Alerts
\`\`\`bash
# Create billing alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "Free-Tier-Billing-Alert" \
    --alarm-description "Alert when charges exceed $10" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 86400 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=Currency,Value=USD \
    --evaluation-periods 1
\`\`\`

### Monitor Usage
- Check AWS Billing Dashboard daily
- Review Free Tier usage weekly
- Set up SNS notifications for alerts

## 🔄 Maintenance Tasks

### Daily
- Check application health
- Monitor error logs
- Verify backup completion

### Weekly
- Review Free Tier usage
- Check security group rules
- Update application dependencies

### Monthly
- Review billing statement
- Analyze performance metrics
- Plan for scaling needs

## 🆘 Troubleshooting

### Common Issues

#### Application Not Starting
\`\`\`bash
# SSH into EC2 instance
ssh -i ~/.ssh/id_rsa ec2-user@YOUR_IP

# Check PM2 status
pm2 status

# Check logs
pm2 logs musicmart
\`\`\`

#### Database Connection Issues
\`\`\`bash
# Test database connectivity
psql -h YOUR_RDS_ENDPOINT -U musicmart_user -d musicmart_db

# Check security groups
aws ec2 describe-security-groups --group-names musicmart-db-sg
\`\`\`

#### High Costs
1. Check NAT Gateway usage
2. Review data transfer charges
3. Monitor S3 requests
4. Check CloudFront usage

### Getting Help
- AWS Free Tier FAQ
- AWS Support (Basic plan included)
- Community forums
- Documentation

## 📚 Additional Resources

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/)

## 🎯 Next Steps

1. **Deploy the application**
2. **Configure monitoring**
3. **Set up billing alerts**
4. **Test all functionality**
5. **Plan for production scaling**

Remember: The Free Tier is perfect for development, testing, and small-scale production workloads. Monitor your usage carefully to avoid unexpected charges!
