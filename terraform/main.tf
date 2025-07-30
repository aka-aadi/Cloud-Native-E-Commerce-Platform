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

# Variables
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "legato"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "AWS Key Pair name"
  type        = string
  default     = "legato-key"
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
    CostCenter  = "free-tier"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-igw-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
    Type        = "public"
  }
}

# Private Subnet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name        = "${var.project_name}-private-subnet-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
    Type        = "private"
  }
}

# Route Table for Public Subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-public-rt-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Route Table Association for Public Subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group for Application
resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-app-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for ${var.project_name} application"

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application port
  ingress {
    description = "App Port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-app-sg-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }
}

# S3 Bucket for Assets
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-assets-${random_string.suffix.result}"

  tags = {
    Name        = "${var.project_name}-assets-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
    Purpose     = "static-assets"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy for Public Read
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.assets.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.assets]
}

# IAM Role for EC2 Instance
resource "aws_iam_role" "app_role" {
  name = "${var.project_name}-app-role-${random_string.suffix.result}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-app-role-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }
}

# IAM Policy for S3 Access
resource "aws_iam_role_policy" "app_s3_policy" {
  name = "${var.project_name}-s3-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "app_profile" {
  name = "${var.project_name}-app-profile-${random_string.suffix.result}"
  role = aws_iam_role.app_role.name

  tags = {
    Name        = "${var.project_name}-app-profile-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Application EC2 Instance
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  subnet_id              = aws_subnet.public.id
  iam_instance_profile   = aws_iam_instance_profile.app_profile.name

  user_data = base64encode(templatefile("${path.module}/app-userdata.sh", {
    aws_region    = var.aws_region
    s3_bucket     = aws_s3_bucket.assets.bucket
    project_name  = var.project_name
    environment   = var.environment
  }))

  root_block_device {
    volume_type = "gp2"
    volume_size = 20
    encrypted   = true

    tags = {
      Name        = "${var.project_name}-app-root-volume"
      Project     = var.project_name
      Environment = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-app-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
    Type        = "application-server"
    CostCenter  = "free-tier"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Elastic IP for Application Server
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-app-eip-${random_string.suffix.result}"
    Project     = var.project_name
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

# Outputs
output "application_url" {
  description = "URL of the deployed application"
  value       = "http://${aws_eip.app.public_ip}"
}

output "application_ip" {
  description = "Public IP of the application server"
  value       = aws_eip.app.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the application server"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.app.public_ip}"
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for assets"
  value       = aws_s3_bucket.assets.bucket
}

output "s3_bucket_url" {
  description = "URL of the S3 bucket"
  value       = "https://${aws_s3_bucket.assets.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "database_connection" {
  description = "Database connection details"
  value       = "postgresql://legato_user:legato_secure_2024!@localhost:5432/legato_db"
  sensitive   = true
}

output "health_check_url" {
  description = "Health check endpoint"
  value       = "http://${aws_eip.app.public_ip}/api/health"
}

output "deployment_summary" {
  description = "Deployment summary"
  value = {
    project_name     = var.project_name
    environment      = var.environment
    region          = var.aws_region
    instance_type   = var.instance_type
    application_url = "http://${aws_eip.app.public_ip}"
    s3_bucket      = aws_s3_bucket.assets.bucket
    monthly_cost   = "$0.00 (AWS Free Tier)"
  }
}
