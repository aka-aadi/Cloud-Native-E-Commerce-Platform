#!/bin/bash
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user # Add ec2-user to docker group
newgrp docker # Apply group changes immediately

# Install Java for Jenkins
sudo yum install -y java-17-amazon-corretto-devel

# Install Jenkins
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Allow Jenkins to run Docker commands
sudo usermod -a -G docker jenkins
sudo systemctl restart jenkins

# Passed from Terraform
RDS_ENDPOINT="${rds_endpoint}"
DB_USERNAME="${db_username}"
DB_PASSWORD="${db_password}"
DB_NAME="${db_name}"
S3_BUCKET="${s3_bucket}"
AWS_ACCOUNT_ID="${aws_account_id}"
AWS_REGION="${aws_region}"
ECR_REPO_URL="${ecr_repo_url}"

# Construct the DATABASE_URL for the application
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/${DB_NAME}"

# Set up application directory
mkdir -p /opt/legato
cd /opt/legato

# Create a .env file for the Docker container
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env
echo "AWS_REGION=${AWS_REGION}" >> .env
echo "S3_BUCKET_NAME=${S3_BUCKET}" >> .env
echo "DATABASE_URL=${DATABASE_URL}" >> .env
# Add any other environment variables your Next.js app needs

# Install AWS CLI if not already present for ECR login
sudo yum install -y aws-cli

# Login to ECR (this will be done by Jenkins later, but good for initial setup/testing)
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Initial pull and run of the Docker image (optional, Jenkins will handle subsequent deployments)
# You might want to remove this if you only want Jenkins to deploy
# docker pull ${ECR_REPO_URL}:latest || true # Pull if exists, ignore if not
# docker stop legato-app || true
# docker rm legato-app || true
# docker run -d \
#   --name legato-app \
#   -p 80:3000 \
#   --restart always \
#   --env-file /opt/legato/.env \
#   ${ECR_REPO_URL}:latest
