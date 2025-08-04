# variables.tf

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "legato"
}

variable "ec2_key_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = "my-legato-key"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for assets"
  type        = string
  default     = "your-legato-assets-bucket-12345"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "619577151605"
}
