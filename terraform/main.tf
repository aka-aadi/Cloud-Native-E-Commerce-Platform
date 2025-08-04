# main.tf - Main configuration and EC2 resources
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources to reference existing VPC and subnets
data "aws_vpc" "selected_vpc" {
  filter {
    name   = "tag:Name"
    values = ["legato-vpc"] # Replace with the actual Name tag of your VPC
  }
}

# Example: Referencing existing public subnets for EC2
data "aws_subnet" "public_az1" {
  filter {
    name   = "tag:Name"
    values = ["legato-public-subnet-az1"] # Replace with your public subnet name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

data "aws_subnet" "private_az1" {
  filter {
    name   = "tag:Name"
    values = ["legato-private-subnet-az1"] # Replace with your private subnet name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

data "aws_subnet" "private_az2" {
  filter {
    name   = "tag:Name"
    values = ["legato-private-subnet-az2"] # Replace with your private subnet name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

# Data source to reference existing security groups
data "aws_security_group" "ec2_sg" {
  filter {
    name   = "group-name"
    values = ["legato-ec2-sg"]
  }
  
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.selected_vpc.id]
  }
}

data "aws_security_group" "rds_sg" {
  filter {
    name   = "group-name"
    values = ["legato-rds-sg"]
  }
  
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.selected_vpc.id]
  }
}

# Example: Referencing existing S3 bucket
data "aws_s3_bucket" "legato_assets" {
  bucket = "your-legato-assets-bucket-12345" # IMPORTANT: Replace with your S3 bucket name
}

# Data source to reference existing IAM Role for EC2
data "aws_iam_instance_profile" "legato_ec2_profile" {
  name = "legato-ec2-role" # IMPORTANT: Replace with the name of your EC2 IAM Role
}