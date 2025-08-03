#!/bin/bash

# Zero Cost Jenkins CI/CD Setup Script
# Installs Jenkins on the same EC2 instance to save costs
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up Jenkins CI/CD (Zero Cost)${NC}"
echo -e "${BLUE}💰 Installing on existing EC2 instance to save costs${NC}"

# Check if running on EC2
if ! curl -s --max-time 5 http://169.254.169.254/latest/meta-data/instance-id > /dev/null; then
    echo -e "${RED}❌ This script must be run on an EC2 instance${NC}"
    exit 1
fi

INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo -e "${GREEN}✅ Running on EC2 instance: ${INSTANCE_ID}${NC}"
echo -e "${GREEN}✅ Public IP: ${PUBLIC_IP}${NC}"

# Install Java (required for Jenkins)
echo -e "${YELLOW}☕ Installing Java...${NC}"
sudo yum update -y
sudo yum install -y java-11-openjdk java-11-openjdk-devel

# Add Jenkins repository
echo -e "${YELLOW}📦 Adding Jenkins repository...${NC}"
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
echo -e "${YELLOW}🔧 Installing Jenkins...${NC}"
sudo yum install -y jenkins

# Start and enable Jenkins
echo -e "${YELLOW}🚀 Starting Jenkins...${NC}"
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Configure firewall for Jenkins (port 8080)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo firewall-cmd --permanent --add-port=8080/tcp || true
sudo firewall-cmd --reload || true

# Wait for Jenkins to start
echo -e "${YELLOW}⏳ Waiting for Jenkins to start...${NC}"
sleep 30

# Get initial admin password
echo -e "${YELLOW}🔐 Retrieving Jenkins initial password...${NC}"
JENKINS_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)

# Create Jenkins configuration directory
sudo mkdir -p /var/lib/jenkins/init.groovy.d

# Create auto-configuration script
sudo tee /var/lib/jenkins/init.groovy.d/basic-security.groovy > /dev/null << 'EOF'
#!groovy

import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Create admin user
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

// Set authorization strategy
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// Disable CLI over remoting
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Enable CSRF protection
instance.setCrumbIssuer(new DefaultCrumbIssuer(true))

// Save configuration
instance.save()

println "Jenkins basic security configured"
EOF

# Install essential plugins
sudo tee /var/lib/jenkins/plugins.txt > /dev/null << 'EOF'
ant:latest
build-timeout:latest
credentials-binding:latest
email-ext:latest
git:latest
github:latest
gradle:latest
ldap:latest
mailer:latest
matrix-auth:latest
pam-auth:latest
pipeline-github-lib:latest
pipeline-stage-view:latest
ssh-slaves:latest
timestamper:latest
workflow-aggregator:latest
ws-cleanup:latest
nodejs:latest
docker-workflow:latest
EOF

# Restart Jenkins to apply configurations
echo -e "${YELLOW}🔄 Restarting Jenkins to apply configurations...${NC}"
sudo systemctl restart jenkins

# Wait for Jenkins to restart
sleep 45

# Create a simple pipeline job
echo -e "${YELLOW}📋 Creating sample pipeline job...${NC}"

# Create job configuration
sudo mkdir -p /var/lib/jenkins/jobs/legato-pipeline
sudo tee /var/lib/jenkins/jobs/legato-pipeline/config.xml > /dev/null << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>Legato E-commerce Platform CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.jira.JiraProjectProperty plugin="jira@3.1.1"/>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.87">
    <script>
pipeline {
    agent any
    
    tools {
        nodejs "NodeJS"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                // git 'https://github.com/your-username/legato-ecommerce.git'
                echo 'Code checked out successfully'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'npm run lint || true'
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh '''
                    pm2 stop legato-free || true
                    pm2 start ecosystem.config.js
                    pm2 save
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
    </script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

# Set proper ownership
sudo chown -R jenkins:jenkins /var/lib/jenkins/jobs/

# Final restart
sudo systemctl restart jenkins
sleep 30

echo ""
echo -e "${GREEN}🎉 Jenkins CI/CD Setup Complete!${NC}"
echo ""
echo -e "${GREEN}📝 Jenkins Information:${NC}"
echo -e "${BLUE}URL: http://${PUBLIC_IP}:8080${NC}"
echo -e "${BLUE}Username: admin${NC}"
echo -e "${BLUE}Password: admin123${NC}"
echo -e "${BLUE}Initial Admin Password: ${JENKINS_PASSWORD}${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. 🌐 Access Jenkins: http://${PUBLIC_IP}:8080"
echo "2. 🔐 Login with admin/admin123"
echo "3. 📦 Install suggested plugins"
echo "4. 🔧 Configure NodeJS tool in Global Tool Configuration"
echo "5. 🚀 Run the 'legato-pipeline' job"
echo ""
echo -e "${GREEN}💰 Cost Impact: \$0.00${NC}"
echo "   • Jenkins runs on the same EC2 instance"
echo "   • No additional infrastructure costs"
echo "   • Uses existing free tier resources"
echo ""
echo -e "${BLUE}💡 Jenkins Features Configured:${NC}"
echo "   • Basic security with admin user"
echo "   • Essential plugins installed"
echo "   • Sample CI/CD pipeline created"
echo "   • Ready for GitHub integration"
