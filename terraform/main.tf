provider "aws" {
  region = "ap-south-1" # IMPORTANT: Your AWS Region
}

# This is a simplified example. You should define your VPC, subnets,
# and security groups here or reference existing ones.

# Example: Referencing an existing VPC
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

# Example: Referencing existing security group for EC2
data "aws_security_group" "ec2_sg" {
  filter {
    name   = "tag:Name"
    values = ["legato-ec2-sg"] # Replace with your EC2 security group name
  }
  vpc_id = data.aws_vpc.selected_vpc.id
}

# Example: Referencing existing S3 bucket
data "aws_s3_bucket" "legato_assets" {
  bucket = "your-legato-assets-bucket-12345" # IMPORTANT: Replace with your S3 bucket name
}

# Data source to reference existing IAM Role for EC2
data "aws_iam_instance_profile" "legato_ec2_profile" {
  name = "legato-ec2-role" # IMPORTANT: Replace with the name of your EC2 IAM Role
}

module "rds" {
  source = "./" # Refers to the current directory where rds.tf is located
}

resource "aws_instance" "legato_app_server" {
  ami           = "ami-0abcdef1234567890" # IMPORTANT: Use a valid Amazon Linux 2 or 2023 AMI ID for your region
  instance_type = "t2.micro" # Free tier eligible: t2.micro or t3.micro
  key_name      = "your-ssh-key-pair-name" # IMPORTANT: Replace with your EC2 Key Pair name
  subnet_id     = data.aws_subnet.public_az1.id # Deploy in the public subnet
  vpc_security_group_ids = [data.aws_security_group.ec2_sg.id]
  associate_public_ip_address = true # Assign a public IP for direct access and Jenkins SSH

  iam_instance_profile = data.aws_iam_instance_profile.legato_ec2_profile.name

  user_data = templatefile("${path.module}/app-userdata.sh", {
    rds_endpoint = module.rds.rds_endpoint
    db_username  = aws_db_instance.legato_db.username
    db_password  = aws_db_instance.legato_db.password
    db_name      = aws_db_instance.legato_db.db_name
    s3_bucket    = data.aws_s3_bucket.legato_assets.bucket
    aws_account_id = "YOUR_AWS_ACCOUNT_ID" # IMPORTANT: Your AWS Account ID
    aws_region     = "ap-south-1" # IMPORTANT: Your AWS Region
    ecr_repo_url   = "YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/legato-ecommerce-app" # IMPORTANT: Your ECR Repo URL
  })

  tags = {
    Name = "legato-app-jenkins-server"
  }
}

output "ec2_public_ip" {
  value       = aws_instance.legato_app_server.public_ip
  description = "The public IP address of the EC2 instance"
}
