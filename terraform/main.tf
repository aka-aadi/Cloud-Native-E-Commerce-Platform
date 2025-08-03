resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890" # Replace with a valid Amazon Linux 2 AMI for your region
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer_key.key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  user_data     = templatefile("${path.module}/app-userdata.sh", {
    project_name = var.project_name
    s3_bucket    = aws_s3_bucket.app_bucket.id
    aws_region   = var.aws_region
    PORT         = var.app_port
  })
  tags = {
    Name = "${var.project_name}-web-server"
  }
}

resource "aws_eip" "web_eip" {
  instance = aws_instance.web.id
  vpc      = true
  tags = {
    Name = "${var.project_name}-web-eip"
  }
}

resource "aws_security_group" "web_sg" {
  name        = "${var.project_name}-web-sg"
  description = "Allow HTTP, HTTPS, and SSH inbound traffic"
  vpc_id      = var.vpc_id # Assuming vpc_id is passed as a variable

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this in production
  }

  # Allow traffic on the application port (e.g., 3000 or 8080) from localhost (Nginx)
  ingress {
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["127.0.0.1/32"] # Only allow from localhost for internal communication
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
  }
}

resource "aws_s3_bucket" "app_bucket" {
  bucket = "${var.project_name}-assets-${random_string.bucket_suffix.result}"
  acl    = "private" # Keep private, accessed by EC2 instance
  tags = {
    Name = "${var.project_name}-app-assets"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
  numeric = true
}

resource "aws_iam_role" "ec2_s3_access_role" {
  name = "${var.project_name}-ec2-s3-access-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
      },
    ],
  })
}

resource "aws_iam_policy" "s3_read_policy" {
  name        = "${var.project_name}-s3-read-policy"
  description = "IAM policy for EC2 to read from S3 bucket"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Effect   = "Allow",
        Resource = [
          aws_s3_bucket.app_bucket.arn,
          "${aws_s3_bucket.app_bucket.arn}/*"
        ],
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "attach_s3_read_policy" {
  role       = aws_iam_role.ec2_s3_access_role.name
  policy_arn = aws_iam_policy.s3_read_policy.arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_s3_access_role.name
}

resource "aws_key_pair" "deployer_key" {
  key_name   = "${var.project_name}-deployer-key"
  public_key = file("~/.ssh/id_rsa.pub") # Ensure this path is correct for your public key
}

variable "project_name" {
  description = "Name of the e-commerce project"
  type        = string
  default     = "legato-free"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "ID of the VPC to deploy into"
  type        = string
  # You might need to set a default here or fetch it dynamically
  # For example, data "aws_vpc" "default" { default = true }
  # default = data.aws_vpc.default.id
}

variable "app_port" {
  description = "Port on which the Node.js application will listen"
  type        = number
  default     = 3000 # Default port for the Express app
}

output "app_public_ip" {
  description = "The public IP address of the web server"
  value       = aws_eip.web_eip.public_ip
}

output "app_url" {
  description = "The URL to access the deployed application"
  value       = "http://${aws_eip.web_eip.public_ip}"
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket created for application assets"
  value       = aws_s3_bucket.app_bucket.id
}
