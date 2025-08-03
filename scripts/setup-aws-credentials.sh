#!/bin/bash

# AWS Credentials Setup Script for Legato E-commerce Platform
# This script configures AWS credentials for deployment

set -e

echo "🔧 Setting up AWS credentials for Legato deployment..."

# AWS Credentials (provided by user)
AWS_ACCESS_KEY_ID="AKIAZAQNNCB2TYMD5RYY"
AWS_SECRET_ACCESS_KEY="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"
AWS_DEFAULT_REGION="ap-south-1"

# Create AWS credentials directory
mkdir -p ~/.aws

# Configure AWS credentials
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
EOF

# Configure AWS config
cat > ~/.aws/config << EOF
[default]
region = $AWS_DEFAULT_REGION
output = json
EOF

# Set proper permissions
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config

echo "✅ AWS credentials configured successfully!"
echo "📍 Region: $AWS_DEFAULT_REGION"
echo "🔑 Access Key: ${AWS_ACCESS_KEY_ID:0:10}..."

# Verify credentials
echo "🔍 Verifying AWS credentials..."
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "✅ AWS credentials verified successfully!"
    aws sts get-caller-identity
else
    echo "❌ AWS credentials verification failed!"
    exit 1
fi

echo "🎉 AWS setup complete! You can now run the deployment script."
