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
rds_endpoint="${rds_endpoint}"
db_username="${db_username}"
db_password="${db_password}"
db_name="${db_name}"
s3_bucket="${s3_bucket}"
aws_account_id="${aws_account_id}"
aws_region="${aws_region}"
ecr_repo_url="${ecr_repo_url}"

# Construct the DATABASE_URL for the application
database_url="postgresql://${db_username}:${db_password}@${rds_endpoint}:5432/${db_name}"

# Set up application directory
mkdir -p /opt/legato
cd /opt/legato

# Create a .env file for the Docker container
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env
echo "AWS_REGION=${aws_region}" >> .env
echo "S3_BUCKET_NAME=${s3_bucket}" >> .env
echo "DATABASE_URL=${database_url}" >> .env
# Add any other environment variables your Next.js app needs

# Install AWS CLI if not already present for ECR login
sudo yum install -y aws-cli

# Login to ECR (this will be done by Jenkins later, but good for initial setup/testing)
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com

# Initial pull and run of the Docker image (optional, Jenkins will handle subsequent deployments)
# You might want to remove this if you only want Jenkins to deploy
# docker pull ${ecr_repo_url}:latest || true # Pull if exists, ignore if not
# docker stop legato-app || true
# docker rm legato-app || true
# docker run -d \
#   --name legato-app \
#   -p 80:3000 \
#   --restart always \
#   --env-file /opt/legato/.env \
#   ${ecr_repo_url}:latest
