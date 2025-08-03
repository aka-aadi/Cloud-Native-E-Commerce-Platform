# Prerequisites Setup Guide

This comprehensive guide will help you install and configure all the necessary tools and services required for the e-commerce platform deployment.

## Table of Contents

1. [AWS Account Setup](#aws-account-setup)
2. [AWS CLI Installation](#aws-cli-installation)
3. [Terraform Installation](#terraform-installation)
4. [Docker Installation](#docker-installation)
5. [Node.js Installation](#nodejs-installation)
6. [Git Installation](#git-installation)
7. [SSH Key Pair Setup](#ssh-key-pair-setup)
8. [Additional Tools](#additional-tools)
9. [Verification](#verification)

---

## 1. AWS Account Setup

### Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and phone number
5. Add a payment method (required even for free tier)

### Create IAM User for Deployment
1. Log into AWS Console
2. Navigate to IAM service
3. Click "Users" → "Add users"
4. Username: `legato-deployment-user`
5. Select "Programmatic access"
6. Attach policies:
   - `AmazonEC2FullAccess`
   - `AmazonECSFullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AmazonVPCFullAccess`
   - `IAMFullAccess`
   - `AmazonSSMFullAccess`
   - `AmazonRoute53FullAccess`
   - `AWSCertificateManagerFullAccess`

7. Save the Access Key ID and Secret Access Key

### Enable Required AWS Services
Ensure these services are available in your region:
- EC2
- ECS
- RDS
- S3
- CloudFront
- Application Load Balancer
- Systems Manager
- Certificate Manager

---

## 2. AWS CLI Installation

### Windows
\`\`\`powershell
# Download and run the installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Or using Chocolatey
choco install awscli

# Or using Scoop
scoop install aws
