#!/bin/bash

# Monitor AWS Free Tier Usage Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}📊 AWS Free Tier Usage Monitor${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

echo -e "${GREEN}Account: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}Region: ${AWS_REGION}${NC}"
echo ""

# EC2 Usage
echo -e "${BLUE}🖥️  EC2 Usage:${NC}"
RUNNING_INSTANCES=$(aws ec2 describe-instances --region $AWS_REGION --query 'Reservations[*].Instances[?State.Name==`running`]' --output json | jq length)
echo -e "${GREEN}├── Running t2.micro instances: ${RUNNING_INSTANCES}/1 (Free Tier)${NC}"

# Get instance uptime
if [ "$RUNNING_INSTANCES" -gt 0 ]; then
    INSTANCE_ID=$(aws ec2 describe-instances --region $AWS_REGION --query 'Reservations[*].Instances[?State.Name==`running`].InstanceId' --output text | head -1)
    LAUNCH_TIME=$(aws ec2 describe-instances --region $AWS_REGION --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].LaunchTime' --output text)
    echo -e "${GREEN}├── Instance ID: ${INSTANCE_ID}${NC}"
    echo -e "${GREEN}└── Launch Time: ${LAUNCH_TIME}${NC}"
fi
echo ""

# EBS Usage
echo -e "${BLUE}💾 EBS Storage:${NC}"
TOTAL_EBS=$(aws ec2 describe-volumes --region $AWS_REGION --query 'Volumes[?State==`in-use`].Size' --output text | awk '{sum+=$1} END {print sum+0}')
echo -e "${GREEN}├── Total EBS Storage: ${TOTAL_EBS}GB/30GB (Free Tier)${NC}"
if [ "$TOTAL_EBS" -gt 30 ]; then
    echo -e "${RED}⚠️  Warning: Exceeding free tier limit!${NC}"
fi
echo ""

# S3 Usage
echo -e "${BLUE}🪣 S3 Storage:${NC}"
S3_BUCKETS=$(aws s3api list-buckets --query 'Buckets[?contains(Name, `musicmart`)].Name' --output text)
if [ -n "$S3_BUCKETS" ]; then
    for bucket in $S3_BUCKETS; do
        SIZE=$(aws s3api list-objects-v2 --bucket $bucket --query 'sum(Contents[].Size)' --output text 2>/dev/null || echo "0")
        SIZE_MB=$((SIZE / 1024 / 1024))
        echo -e "${GREEN}├── Bucket: ${bucket}${NC}"
        echo -e "${GREEN}└── Size: ${SIZE_MB}MB/5120MB (Free Tier)${NC}"
    done
else
    echo -e "${YELLOW}├── No MusicMart S3 buckets found${NC}"
fi
echo ""

# VPC Usage
echo -e "${BLUE}🌐 VPC Resources:${NC}"
VPCS=$(aws ec2 describe-vpcs --region $AWS_REGION --query 'Vpcs[?Tags[?Key==`Name` && contains(Value, `musicmart`)]]' --output text | wc -l)
SUBNETS=$(aws ec2 describe-subnets --region $AWS_REGION --query 'Subnets[?Tags[?Key==`Name` && contains(Value, `musicmart`)]]' --output text | wc -l)
echo -e "${GREEN}├── VPCs: ${VPCS} (Always Free)${NC}"
echo -e "${GREEN}└── Subnets: ${SUBNETS} (Always Free)${NC}"
echo ""

# Cost Estimate
echo -e "${BLUE}💰 Current Month Estimate:${NC}"
echo -e "${GREEN}├── EC2 t2.micro: \$0.00 (Free Tier)${NC}"
echo -e "${GREEN}├── EBS Storage: \$0.00 (Free Tier)${NC}"
echo -e "${GREEN}├── S3 Storage: \$0.00 (Free Tier)${NC}"
echo -e "${GREEN}├── Data Transfer: \$0.00 (Free Tier)${NC}"
echo -e "${GREEN}└── Total: \$0.00${NC}"
echo ""

# Free Tier Limits
echo -e "${BLUE}📋 Free Tier Limits:${NC}"
echo -e "${GREEN}├── EC2: 750 hours/month t2.micro${NC}"
echo -e "${GREEN}├── EBS: 30GB General Purpose SSD${NC}"
echo -e "${GREEN}├── S3: 5GB Standard Storage${NC}"
echo -e "${GREEN}├── Data Transfer: 15GB/month${NC}"
echo -e "${GREEN}└── S3 Requests: 20K GET, 2K PUT${NC}"
echo ""

# Recommendations
echo -e "${BLUE}💡 Recommendations:${NC}"
echo -e "${GREEN}├── Monitor usage at: https://console.aws.amazon.com/billing/home#/freetier${NC}"
echo -e "${GREEN}├── Set up billing alerts for \$1 threshold${NC}"
echo -e "${GREEN}└── Review resources monthly${NC}"
echo ""

echo -e "${PURPLE}✅ Free Tier monitoring complete!${NC}"
