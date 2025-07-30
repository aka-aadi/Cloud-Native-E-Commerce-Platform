#!/bin/bash

# AWS Resource Cleanup Script for MusicMart
# This script helps you clean up AWS resources to avoid charges

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

PROJECT_NAME="musicmart"

echo -e "${PURPLE}🧹 AWS Resource Cleanup for MusicMart${NC}"
echo -e "${YELLOW}⚠️  This will destroy ALL resources created by the deployment${NC}"
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

# Check if Terraform is available
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📋 Account: ${ACCOUNT_ID}${NC}"
echo ""

# Function to cleanup with Terraform
cleanup_with_terraform() {
    echo -e "${BLUE}🏗️  Attempting Terraform cleanup...${NC}"
    
    if [ -d "terraform" ] && [ -f "terraform/main.tf" ]; then
        cd terraform
        
        # Initialize Terraform if needed
        if [ ! -d ".terraform" ]; then
            terraform init
        fi
        
        # Destroy resources
        echo -e "${YELLOW}⚠️  This will destroy all Terraform-managed resources${NC}"
        read -p "Continue with Terraform destroy? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform destroy -auto-approve
            echo -e "${GREEN}✅ Terraform resources destroyed${NC}"
        else
            echo -e "${YELLOW}⏸️  Terraform cleanup cancelled${NC}"
        fi
        
        cd ..
    else
        echo -e "${YELLOW}⚠️  No Terraform configuration found${NC}"
    fi
}

# Function to manually cleanup EC2 instances
cleanup_ec2_instances() {
    echo -e "${BLUE}🖥️  Cleaning up EC2 instances...${NC}"
    
    # Find instances with our project tag
    instances=$(aws ec2 describe-instances \
        --filters "Name=tag:Project,Values=${PROJECT_NAME}" "Name=instance-state-name,Values=running,stopped" \
        --query 'Reservations[].Instances[].InstanceId' \
        --output text)
    
    if [ -n "$instances" ]; then
        echo -e "${YELLOW}Found instances: $instances${NC}"
        read -p "Terminate these instances? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for instance in $instances; do
                echo -e "${BLUE}Terminating instance: $instance${NC}"
                aws ec2 terminate-instances --instance-ids $instance
            done
            echo -e "${GREEN}✅ EC2 instances terminated${NC}"
        else
            echo -e "${YELLOW}⏸️  EC2 cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No EC2 instances found to cleanup${NC}"
    fi
    echo ""
}

# Function to cleanup EBS volumes
cleanup_ebs_volumes() {
    echo -e "${BLUE}💾 Cleaning up EBS volumes...${NC}"
    
    # Find available volumes (not attached to instances)
    volumes=$(aws ec2 describe-volumes \
        --filters "Name=status,Values=available" \
        --query 'Volumes[].VolumeId' \
        --output text)
    
    if [ -n "$volumes" ]; then
        echo -e "${YELLOW}Found unattached volumes: $volumes${NC}"
        read -p "Delete these volumes? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for volume in $volumes; do
                echo -e "${BLUE}Deleting volume: $volume${NC}"
                aws ec2 delete-volume --volume-id $volume
            done
            echo -e "${GREEN}✅ EBS volumes deleted${NC}"
        else
            echo -e "${YELLOW}⏸️  EBS cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No unattached EBS volumes found${NC}"
    fi
    echo ""
}

# Function to cleanup S3 buckets
cleanup_s3_buckets() {
    echo -e "${BLUE}🪣 Cleaning up S3 buckets...${NC}"
    
    # Find buckets with our project name
    buckets=$(aws s3api list-buckets \
        --query "Buckets[?contains(Name, '${PROJECT_NAME}')].Name" \
        --output text)
    
    if [ -n "$buckets" ]; then
        echo -e "${YELLOW}Found buckets: $buckets${NC}"
        read -p "Delete these buckets and all contents? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for bucket in $buckets; do
                echo -e "${BLUE}Emptying bucket: $bucket${NC}"
                aws s3 rm s3://$bucket --recursive
                echo -e "${BLUE}Deleting bucket: $bucket${NC}"
                aws s3api delete-bucket --bucket $bucket
            done
            echo -e "${GREEN}✅ S3 buckets deleted${NC}"
        else
            echo -e "${YELLOW}⏸️  S3 cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No S3 buckets found to cleanup${NC}"
    fi
    echo ""
}

# Function to cleanup Elastic IPs
cleanup_elastic_ips() {
    echo -e "${BLUE}🌐 Cleaning up Elastic IPs...${NC}"
    
    # Find unassociated Elastic IPs
    eips=$(aws ec2 describe-addresses \
        --query 'Addresses[?!AssociationId].AllocationId' \
        --output text)
    
    if [ -n "$eips" ]; then
        echo -e "${YELLOW}Found unassociated Elastic IPs: $eips${NC}"
        read -p "Release these Elastic IPs? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for eip in $eips; do
                echo -e "${BLUE}Releasing Elastic IP: $eip${NC}"
                aws ec2 release-address --allocation-id $eip
            done
            echo -e "${GREEN}✅ Elastic IPs released${NC}"
        else
            echo -e "${YELLOW}⏸️  Elastic IP cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No unassociated Elastic IPs found${NC}"
    fi
    echo ""
}

# Function to cleanup Security Groups
cleanup_security_groups() {
    echo -e "${BLUE}🔒 Cleaning up Security Groups...${NC}"
    
    # Find security groups with our project name (excluding default)
    sgs=$(aws ec2 describe-security-groups \
        --filters "Name=tag:Project,Values=${PROJECT_NAME}" \
        --query 'SecurityGroups[?GroupName!=`default`].GroupId' \
        --output text)
    
    if [ -n "$sgs" ]; then
        echo -e "${YELLOW}Found security groups: $sgs${NC}"
        read -p "Delete these security groups? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for sg in $sgs; do
                echo -e "${BLUE}Deleting security group: $sg${NC}"
                aws ec2 delete-security-group --group-id $sg 2>/dev/null || echo -e "${YELLOW}⚠️  Could not delete $sg (may be in use)${NC}"
            done
            echo -e "${GREEN}✅ Security groups cleanup attempted${NC}"
        else
            echo -e "${YELLOW}⏸️  Security group cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No security groups found to cleanup${NC}"
    fi
    echo ""
}

# Function to cleanup Key Pairs
cleanup_key_pairs() {
    echo -e "${BLUE}🔑 Cleaning up Key Pairs...${NC}"
    
    # Find key pairs with our project name
    keys=$(aws ec2 describe-key-pairs \
        --query "KeyPairs[?contains(KeyName, '${PROJECT_NAME}')].KeyName" \
        --output text)
    
    if [ -n "$keys" ]; then
        echo -e "${YELLOW}Found key pairs: $keys${NC}"
        read -p "Delete these key pairs? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for key in $keys; do
                echo -e "${BLUE}Deleting key pair: $key${NC}"
                aws ec2 delete-key-pair --key-name $key
            done
            echo -e "${GREEN}✅ Key pairs deleted${NC}"
        else
            echo -e "${YELLOW}⏸️  Key pair cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No key pairs found to cleanup${NC}"
    fi
    echo ""
}

# Function to cleanup VPC resources
cleanup_vpc_resources() {
    echo -e "${BLUE}🏢 Cleaning up VPC resources...${NC}"
    
    # Find VPCs with our project tag
    vpcs=$(aws ec2 describe-vpcs \
        --filters "Name=tag:Project,Values=${PROJECT_NAME}" \
        --query 'Vpcs[].VpcId' \
        --output text)
    
    if [ -n "$vpcs" ]; then
        echo -e "${YELLOW}Found VPCs: $vpcs${NC}"
        read -p "Delete VPC and associated resources? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for vpc in $vpcs; do
                echo -e "${BLUE}Cleaning up VPC: $vpc${NC}"
                
                # Delete subnets
                subnets=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc" --query 'Subnets[].SubnetId' --output text)
                for subnet in $subnets; do
                    echo -e "${BLUE}  Deleting subnet: $subnet${NC}"
                    aws ec2 delete-subnet --subnet-id $subnet 2>/dev/null || true
                done
                
                # Delete route tables (except main)
                route_tables=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpc" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text)
                for rt in $route_tables; do
                    echo -e "${BLUE}  Deleting route table: $rt${NC}"
                    aws ec2 delete-route-table --route-table-id $rt 2>/dev/null || true
                done
                
                # Delete internet gateway
                igws=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpc" --query 'InternetGateways[].InternetGatewayId' --output text)
                for igw in $igws; do
                    echo -e "${BLUE}  Detaching and deleting internet gateway: $igw${NC}"
                    aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpc 2>/dev/null || true
                    aws ec2 delete-internet-gateway --internet-gateway-id $igw 2>/dev/null || true
                done
                
                # Delete VPC
                echo -e "${BLUE}  Deleting VPC: $vpc${NC}"
                aws ec2 delete-vpc --vpc-id $vpc 2>/dev/null || echo -e "${YELLOW}⚠️  Could not delete VPC $vpc${NC}"
            done
            echo -e "${GREEN}✅ VPC resources cleanup attempted${NC}"
        else
            echo -e "${YELLOW}⏸️  VPC cleanup cancelled${NC}"
        fi
    else
        echo -e "${GREEN}✅ No VPCs found to cleanup${NC}"
    fi
    echo ""
}

# Function to show final cost check
final_cost_check() {
    echo -e "${PURPLE}💰 Final Cost Check${NC}"
    echo -e "${BLUE}🔗 Please verify in AWS Console:${NC}"
    echo -e "${BLUE}├── EC2 Dashboard: https://console.aws.amazon.com/ec2/v2/home${NC}"
    echo -e "${BLUE}├── S3 Console: https://console.aws.amazon.com/s3/home${NC}"
    echo -e "${BLUE}├── VPC Console: https://console.aws.amazon.com/vpc/home${NC}"
    echo -e "${BLUE}└── Billing Dashboard: https://console.aws.amazon.com/billing/home${NC}"
    echo ""
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
    echo -e "${YELLOW}⚠️  Please check AWS Console to verify all resources are deleted${NC}"
}

# Main execution
main() {
    echo -e "${RED}⚠️  WARNING: This will delete ALL MusicMart resources!${NC}"
    echo -e "${YELLOW}This action cannot be undone!${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⏸️  Cleanup cancelled${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${BLUE}🧹 Starting cleanup process...${NC}"
    echo ""
    
    # Try Terraform cleanup first
    cleanup_with_terraform
    
    # Manual cleanup for any remaining resources
    cleanup_ec2_instances
    cleanup_ebs_volumes
    cleanup_s3_buckets
    cleanup_elastic_ips
    cleanup_security_groups
    cleanup_key_pairs
    cleanup_vpc_resources
    
    final_cost_check
}

# Run the main function
main
