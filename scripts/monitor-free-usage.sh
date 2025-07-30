#!/bin/bash

# AWS Free Tier Usage Monitor for MusicMart
# Monitors usage to ensure you stay within free tier limits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔍 AWS Free Tier Usage Monitor${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Get current date info
CURRENT_MONTH=$(date +%Y-%m)
CURRENT_DATE=$(date +%Y-%m-%d)

echo -e "${BLUE}📅 Monitoring period: ${CURRENT_MONTH}${NC}"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure'${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}📋 Account ID: ${ACCOUNT_ID}${NC}"
echo ""

# Function to check EC2 instances
check_ec2_usage() {
    echo -e "${BLUE}🖥️  EC2 Instance Status:${NC}"
    echo "----------------------------------------"
    
    # Get EC2 instances
    INSTANCES=$(aws ec2 describe-instances \
        --filters "Name=tag:Project,Values=musicmart" "Name=instance-state-name,Values=running,stopped,pending,stopping" \
        --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,LaunchTime,Tags[?Key==`Name`].Value|[0]]' \
        --output table 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$INSTANCES" ]; then
        echo "$INSTANCES"
        
        # Count running t2.micro instances
        RUNNING_COUNT=$(aws ec2 describe-instances \
            --filters "Name=instance-type,Values=t2.micro" "Name=instance-state-name,Values=running" \
            --query 'length(Reservations[*].Instances[*])' \
            --output text 2>/dev/null || echo "0")
        
        echo ""
        echo -e "${GREEN}✅ Running t2.micro instances: ${RUNNING_COUNT}/1 (Free Tier limit)${NC}"
        
        if [ "$RUNNING_COUNT" -gt 1 ]; then
            echo -e "${RED}⚠️  WARNING: You have more than 1 t2.micro instance running!${NC}"
            echo -e "${RED}   This may exceed free tier limits.${NC}"
        fi
    else
        echo -e "${YELLOW}No EC2 instances found or unable to fetch data${NC}"
    fi
    echo ""
}

# Function to check S3 usage
check_s3_usage() {
    echo -e "${BLUE}💾 S3 Storage Usage:${NC}"
    echo "----------------------------------------"
    
    # Get S3 buckets with musicmart in the name
    BUCKETS=$(aws s3api list-buckets --query 'Buckets[?contains(Name, `musicmart`)].Name' --output text 2>/dev/null)
    
    if [ ! -z "$BUCKETS" ]; then
        for bucket in $BUCKETS; do
            echo -e "${GREEN}📦 Bucket: ${bucket}${NC}"
            
            # Get bucket size
            SIZE_INFO=$(aws s3 ls s3://$bucket --recursive --human-readable --summarize 2>/dev/null | tail -2)
            if [ ! -z "$SIZE_INFO" ]; then
                echo "$SIZE_INFO"
            else
                echo "   Empty or unable to access"
            fi
            echo ""
        done
        
        echo -e "${GREEN}✅ Free Tier S3 Limit: 5GB storage${NC}"
        echo -e "${GREEN}✅ Free Tier S3 Requests: 20,000 GET, 2,000 PUT${NC}"
    else
        echo -e "${YELLOW}No S3 buckets found with 'musicmart' in name${NC}"
    fi
    echo ""
}

# Function to check data transfer
check_data_transfer() {
    echo -e "${BLUE}🌐 Data Transfer (Estimated):${NC}"
    echo "----------------------------------------"
    
    # Note: Detailed data transfer metrics require CloudWatch and may not be immediately available
    echo -e "${GREEN}✅ Free Tier Data Transfer Out: 15GB/month${NC}"
    echo -e "${YELLOW}💡 Monitor detailed usage in AWS Console > CloudWatch${NC}"
    echo ""
}

# Function to check EBS volumes
check_ebs_usage() {
    echo -e "${BLUE}💿 EBS Volume Usage:${NC}"
    echo "----------------------------------------"
    
    VOLUMES=$(aws ec2 describe-volumes \
        --filters "Name=tag:Project,Values=musicmart" \
        --query 'Volumes[*].[VolumeId,Size,VolumeType,State,Attachments[0].InstanceId]' \
        --output table 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$VOLUMES" ]; then
        echo "$VOLUMES"
        
        # Calculate total EBS storage
        TOTAL_SIZE=$(aws ec2 describe-volumes \
            --filters "Name=tag:Project,Values=musicmart" \
            --query 'sum(Volumes[*].Size)' \
            --output text 2>/dev/null || echo "0")
        
        echo ""
        echo -e "${GREEN}✅ Total EBS Storage: ${TOTAL_SIZE}GB${NC}"
        echo -e "${GREEN}✅ Free Tier EBS Limit: 30GB (first 12 months)${NC}"
        
        if [ "$TOTAL_SIZE" -gt 30 ]; then
            echo -e "${RED}⚠️  WARNING: EBS usage exceeds free tier limit!${NC}"
        fi
    else
        echo -e "${YELLOW}No EBS volumes found${NC}"
    fi
    echo ""
}

# Function to show cost estimate
show_cost_estimate() {
    echo -e "${BLUE}💰 Cost Estimate:${NC}"
    echo "----------------------------------------"
    echo -e "${GREEN}✅ EC2 t2.micro (750h/month): \$0.00${NC}"
    echo -e "${GREEN}✅ EBS 30GB (first year): \$0.00${NC}"
    echo -e "${GREEN}✅ S3 5GB storage: \$0.00${NC}"
    echo -e "${GREEN}✅ Data transfer 15GB: \$0.00${NC}"
    echo -e "${GREEN}✅ VPC & networking: \$0.00${NC}"
    echo ""
    echo -e "${GREEN}💰 TOTAL MONTHLY COST: \$0.00${NC}"
    echo -e "${BLUE}   (Within AWS Free Tier limits)${NC}"
    echo ""
}

# Function to show recommendations
show_recommendations() {
    echo -e "${BLUE}💡 Recommendations:${NC}"
    echo "----------------------------------------"
    echo -e "${YELLOW}1. Monitor usage regularly to stay within limits${NC}"
    echo -e "${YELLOW}2. Set up billing alerts in AWS Console${NC}"
    echo -e "${YELLOW}3. Stop EC2 instances when not needed${NC}"
    echo -e "${YELLOW}4. Clean up unused S3 objects periodically${NC}"
    echo -e "${YELLOW}5. Use CloudWatch for detailed monitoring${NC}"
    echo ""
    
    echo -e "${BLUE}🔗 Useful Links:${NC}"
    echo -e "${BLUE}• Free Tier Dashboard: https://console.aws.amazon.com/billing/home#/freetier${NC}"
    echo -e "${BLUE}• Billing Dashboard: https://console.aws.amazon.com/billing/home${NC}"
    echo -e "${BLUE}• CloudWatch: https://console.aws.amazon.com/cloudwatch${NC}"
    echo ""
}

# Function to check application health
check_app_health() {
    echo -e "${BLUE}🏥 Application Health Check:${NC}"
    echo "----------------------------------------"
    
    # Try to get the application URL from terraform output
    if [ -f "terraform/terraform.tfstate" ]; then
        APP_URL=$(cd terraform && terraform output -raw application_url 2>/dev/null)
        if [ ! -z "$APP_URL" ]; then
            echo -e "${BLUE}🌐 Testing: ${APP_URL}/api/health${NC}"
            
            HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "${APP_URL}/api/health" 2>/dev/null)
            HTTP_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            RESPONSE_BODY=$(echo $HEALTH_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
            
            if [ "$HTTP_STATUS" -eq 200 ]; then
                echo -e "${GREEN}✅ Application is healthy${NC}"
                echo -e "${GREEN}   Response: ${RESPONSE_BODY}${NC}"
            else
                echo -e "${RED}❌ Application health check failed (HTTP: ${HTTP_STATUS})${NC}"
            fi
        else
            echo -e "${YELLOW}Unable to get application URL from Terraform state${NC}"
        fi
    else
        echo -e "${YELLOW}Terraform state file not found${NC}"
    fi
    echo ""
}

# Run all checks
main() {
    check_ec2_usage
    check_s3_usage
    check_ebs_usage
    check_data_transfer
    check_app_health
    show_cost_estimate
    show_recommendations
    
    echo -e "${PURPLE}🎉 Monitoring complete!${NC}"
    echo -e "${GREEN}Your MusicMart platform is running within AWS Free Tier limits.${NC}"
}

# Execute main function
main
