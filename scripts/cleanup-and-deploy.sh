#!/bin/bash

echo "🧹 Performing complete cleanup..."

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Remove Terraform state files
rm -rf terraform/.terraform terraform/.terraform.lock.hcl terraform/terraform.tfstate* terraform/tfplan

echo "✅ Cleanup completed"

# Run the simplified deployment
echo "🚀 Starting simplified deployment..."
./scripts/deploy-zero-cost-simple.sh
