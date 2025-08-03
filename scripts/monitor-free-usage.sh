#!/bin/bash

# AWS Free Tier Usage Monitor for MusicMart
# This script helps you monitor your AWS usage to stay within free tier limits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔍 AWS Free Tier Usage Monitor${NC}"
echo -e "${GREEN}💰 Monitoring your usage to keep costs at \$0.00${NC}"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo -e "${BLUE}📋 Account: ${ACCOUNT_ID}${NC}"
echo -e "${BLUE}📋 Region: ${REGION}${NC}"
echo ""

# Function to check EC2 usage
check_ec2_usage() {
    echo -e "${BLUE}🖥️  EC2 Instance Usage:${NC}"
    
    # Get running instances
    instances=$(aws ec2 describe-instances \
        --filters "Name=instance-state-name,Values=running" \
        --query 'Reservations[].Instances[].[InstanceId,InstanceType,LaunchTime,State.Name]' \
        --output table)
    
    if [ -n "$instances" ]; then
        echo "$instances"
        
        # Count t2.micro instances
        t2_micro_count=$(aws ec2 describe-instances \
            --filters "Name=instance-state-name,Values=running" "Name=instance-type,Values=t2.micro" \
            --query 'length(Reservations[].Instances[])')
        
        echo -e "${GREEN}✅ t2.micro instances running: ${t2_micro_count}${NC}"
        echo -e "${YELLOW}⚠️  Free tier limit: 750 hours/month (1 instance = ~720 hours)${NC}"
        
        if [ "$t2_micro_count" -gt 1 ]; then
            echo -e "${RED}⚠️  WARNING: Multiple t2.micro instances may exceed free tier${NC}"
        fi
    else
        echo -e "${YELLOW}No running EC2 instances found${NC}"
    fi
    echo ""
}

# Function to check EBS usage
check_ebs_usage() {
    echo -e "${BLUE}💾 EBS Volume Usage:${NC}"
    
    volumes=$(aws ec2 describe-volumes \
        --query 'Volumes[].[VolumeId,Size,VolumeType,State]' \
        --output table)
    
    if [ -n "$volumes" ]; then
        echo "$volumes"
        
        # Calculate total EBS storage
        total_size=$(aws ec2 describe-volumes \
            --query 'sum(Volumes[].Size)')
        
        echo -e "${GREEN}✅ Total EBS storage: ${total_size} GB${NC}"
        echo -e "${YELLOW}⚠️  Free tier limit: 30 GB (first year)${NC}"
        
        if [ "$total_size" -gt 30 ]; then
            echo -e "${RED}⚠️  WARNING: EBS usage exceeds free tier limit${NC}"
        fi
    else
        echo -e "${YELLOW}No EBS volumes found${NC}"
    fi
    echo ""
}

# Function to check S3 usage
check_s3_usage() {
    echo -e "${BLUE}🪣 S3 Storage Usage:${NC}"
    
    buckets=$(aws s3api list-buckets --query 'Buckets[].Name' --output text)
    
    if [ -n "$buckets" ]; then
        total_size=0
        for bucket in $buckets; do
            # Get bucket size (this is an approximation)
            size=$(aws s3 ls s3://$bucket --recursive --summarize 2>/dev/null | grep "Total Size" | awk '{print $3}' || echo "0")
            size_gb=$((size / 1024 / 1024 / 1024))
            echo -e "${GREEN}📁 $bucket: ~${size_gb} GB${NC}"
            total_size=$((total_size + size_gb))
        done
        
        echo -e "${GREEN}✅ Total S3 storage: ~${total_size} GB${NC}"
        echo -e "${YELLOW}⚠️  Free tier limit: 5 GB${NC}"
        
        if [ "$total_size" -gt 5 ]; then
            echo -e "${RED}⚠️  WARNING: S3 usage may exceed free tier limit${NC}"
        fi
    else
        echo -e "${YELLOW}No S3 buckets found${NC}"
    fi
    echo ""
}

# Function to check data transfer
check_data_transfer() {
    echo -e "${BLUE}🌐 Data Transfer (Estimated):${NC}"
    echo -e "${YELLOW}⚠️  Free tier limit: 15 GB outbound per month${NC}"
    echo -e "${BLUE}💡 Monitor actual usage in AWS Billing Console${NC}"
    echo ""
}

# Function to show cost optimization tips
show_optimization_tips() {
    echo -e "${PURPLE}💡 Cost Optimization Tips:${NC}"
    echo -e "${GREEN}✅ Stop instances when not needed${NC}"
    echo -e "${GREEN}✅ Use t2.micro for development/testing${NC}"
    echo -e "${GREEN}✅ Clean up unused EBS volumes${NC}"
    echo -e "${GREEN}✅ Delete old S3 objects${NC}"
    echo -e "${GREEN}✅ Monitor billing alerts${NC}"
    echo -e "${GREEN}✅ Use CloudWatch for monitoring${NC}"
    echo ""
}

# Function to check billing alerts
check_billing_alerts() {
    echo -e "${BLUE}💰 Billing Information:${NC}"
    
    # Try to get current month costs (requires billing permissions)
    current_month=$(date +%Y-%m-01)
    next_month=$(date -d "$current_month +1 month" +%Y-%m-01)
    
    cost_info=$(aws ce get-cost-and-usage \
        --time-period Start=$current_month,End=$next_month \
        --granularity MONTHLY \
        --metrics BlendedCost \
        --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
        --output text 2>/dev/null || echo "N/A")
    
    if [ "$cost_info" != "N/A" ]; then
        echo -e "${GREEN}💵 Current month cost: \$${cost_info}${NC}"
        
        # Check if cost is above $0
        if (( $(echo "$cost_info > 0" | bc -l) )); then
            echo -e "${YELLOW}⚠️  You have charges this month${NC}"
        else
            echo -e "${GREEN}✅ No charges this month${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Unable to retrieve billing information${NC}"
        echo -e "${BLUE}💡 Check AWS Billing Console manually${NC}"
    fi
    echo ""
}

# Function to show free tier status
show_free_tier_status() {
    echo -e "${PURPLE}🆓 Free Tier Status Summary:${NC}"
    echo -e "${GREEN}├── EC2 t2.micro: 750 hours/month${NC}"
    echo -e "${GREEN}├── EBS: 30 GB (first year)${NC}"
    echo -e "${GREEN}├── S3: 5 GB storage${NC}"
    echo -e "${GREEN}├── Data Transfer: 15 GB outbound${NC}"
    echo -e "${GREEN}└── VPC: Always free${NC}"
    echo ""
    echo -e "${BLUE}🔗 Monitor detailed usage: https://console.aws.amazon.com/billing/home#/freetier${NC}"
    echo ""
}

# Main execution
main() {
    check_ec2_usage
    check_ebs_usage
    check_s3_usage
    check_data_transfer
    check_billing_alerts
    show_free_tier_status
    show_optimization_tips
    
    echo -e "${GREEN}🎉 Monitoring complete!${NC}"
    echo -e "${BLUE}💡 Run this script regularly to stay within free tier limits${NC}"
}

# Run the main function
main
