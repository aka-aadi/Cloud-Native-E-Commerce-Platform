# Legato - 100% Free E-commerce Platform on AWS

A complete, production-ready e-commerce platform that runs entirely on AWS Free Tier - **$0.00/month cost**.

## 🎵 About Legato

Legato is a modern music instrument e-commerce platform built with:
- **Next.js 14** - React-based frontend framework
- **PostgreSQL 15** - Robust database system
- **AWS Free Tier** - 100% free cloud infrastructure
- **Terraform** - Infrastructure as Code
- **Docker** - Containerization support

## 💰 Cost Breakdown

| Service | Usage | Cost |
|---------|-------|------|
| EC2 t2.micro | 750 hours/month | $0.00 |
| EBS Storage | 30GB | $0.00 |
| S3 Storage | 5GB + 20K requests | $0.00 |
| VPC & Networking | Standard usage | $0.00 |
| Elastic IP | When attached | $0.00 |
| Data Transfer | 15GB/month | $0.00 |
| **Total** | | **$0.00/month** |

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** with Free Tier eligibility
2. **AWS CLI** installed and configured
3. **Terraform** installed (v1.0+)
4. **Git** for cloning the repository

### 1. Setup AWS Credentials

\`\`\`bash
# Run the credential setup script
chmod +x scripts/setup-aws-credentials.sh
./scripts/setup-aws-credentials.sh
\`\`\`

Or configure manually:
\`\`\`bash
aws configure
# AWS Access Key ID: AKIAZAQNNCB2TYMD5RYY
# AWS Secret Access Key: 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
# Default region: ap-south-1
# Default output format: json
\`\`\`

### 2. Deploy the Platform

\`\`\`bash
# Make the deployment script executable
chmod +x scripts/deploy-100-percent-free.sh

# Run the deployment
./scripts/deploy-100-percent-free.sh
\`\`\`

### 3. Access Your Store

After deployment (5-10 minutes), you'll get:
- **Application URL**: `http://YOUR-IP-ADDRESS`
- **Admin Panel**: `http://YOUR-IP-ADDRESS/admin`
- **Health Check**: `http://YOUR-IP-ADDRESS/api/health`

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │    Application   │    │   PostgreSQL    │
│   (Optional)    │───▶│   EC2 t2.micro   │───▶│   Database      │
│                 │    │   Next.js App    │    │   (Local)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   S3 Bucket     │
                       │   Static Assets │
                       └─────────────────┘
\`\`\`

## 📁 Project Structure

\`\`\`
legato/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   ├── marketplace/       # Product listings
│   └── components/        # React components
├── terraform/             # Infrastructure as Code
│   ├── main.tf           # Main Terraform configuration
│   └── app-userdata.sh   # EC2 setup script
├── scripts/              # Deployment scripts
│   ├── deploy-100-percent-free.sh
│   └── setup-aws-credentials.sh
└── components/           # Shared UI components
\`\`\`

## 🛠️ Features

### E-commerce Features
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Order management
- ✅ Admin dashboard
- ✅ Inventory tracking
- ✅ Search and filtering

### Technical Features
- ✅ Server-side rendering (SSR)
- ✅ API routes with Next.js
- ✅ PostgreSQL database
- ✅ File upload to S3
- ✅ Responsive design
- ✅ Health monitoring
- ✅ Auto-scaling ready

## 🔧 Configuration

### Environment Variables

The application uses these environment variables:

\`\`\`bash
NODE_ENV=production
PORT=3000
AWS_REGION=ap-south-1
S3_BUCKET=legato-assets-xxxxx
DATABASE_URL=postgresql://legato_user:password@localhost:5432/legato_db
\`\`\`

### Database Schema

The platform includes these main tables:
- `products` - Product information
- `categories` - Product categories
- `users` - User accounts
- `orders` - Order tracking
- `order_items` - Order details

## 📊 Monitoring

### Health Checks
- Application: `GET /api/health`
- Database: Included in health check
- System: Automated monitoring script

### Logs
\`\`\`bash
# Application logs
pm2 logs legato

# System logs
tail -f /var/log/legato-setup.log

# Health check logs
tail -f /var/log/health-check.log
\`\`\`

## 🔒 Security

- ✅ HTTPS ready (SSL certificate setup)
- ✅ Environment variable protection
- ✅ Database password encryption
- ✅ IAM role-based permissions
- ✅ VPC network isolation
- ✅ Security group restrictions

## 📈 Scaling

### Free Tier Limits
- **EC2**: 750 hours/month (t2.micro)
- **Storage**: 30GB EBS + 5GB S3
- **Bandwidth**: 15GB/month outbound
- **Database**: PostgreSQL on EC2

### Scaling Options
1. **Vertical**: Upgrade to larger EC2 instances
2. **Horizontal**: Add load balancer + multiple instances
3. **Database**: Migrate to RDS PostgreSQL
4. **CDN**: Add CloudFront distribution
5. **Storage**: Expand S3 usage

## 🛡️ Backup & Recovery

### Automated Backups
\`\`\`bash
# Database backup
pg_dump legato_db > backup_$(date +%Y%m%d).sql

# File backup to S3
aws s3 sync /opt/legato s3://legato-backups/app/
\`\`\`

### Disaster Recovery
1. Infrastructure: Terraform state backup
2. Database: Daily PostgreSQL dumps
3. Application: Git repository
4. Assets: S3 cross-region replication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Deployment fails with permission errors:**
\`\`\`bash
# Check AWS credentials
aws sts get-caller-identity

# Verify IAM permissions
aws iam get-user
\`\`\`

**Application not accessible:**
\`\`\`bash
# Check security groups
aws ec2 describe-security-groups

# Verify instance status
aws ec2 describe-instances
\`\`\`

**Database connection issues:**
\`\`\`bash
# SSH to instance and check
ssh -i ~/.ssh/id_rsa ec2-user@YOUR-IP
sudo systemctl status postgresql
\`\`\`

### Getting Help

- 📧 Email: support@legato-ecommerce.com
- 💬 Discord: [Join our community](https://discord.gg/legato)
- 📖 Documentation: [docs.legato-ecommerce.com](https://docs.legato-ecommerce.com)
- 🐛 Issues: [GitHub Issues](https://github.com/legato/issues)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Multi-vendor marketplace
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] International shipping
- [ ] Multi-language support

---

**Built with ❤️ for the music community**

*Legato - Where music meets technology*
