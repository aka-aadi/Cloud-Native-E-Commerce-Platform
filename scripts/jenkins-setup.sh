#!/bin/bash

# Jenkins Setup and Configuration Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up Jenkins CI/CD Pipeline...${NC}"

# Get Jenkins IP from Terraform output
if [ -f terraform/terraform.tfstate ]; then
    JENKINS_IP=$(cd terraform && terraform output -raw jenkins_public_ip 2>/dev/null || echo "")
fi

if [ -z "$JENKINS_IP" ]; then
    echo -e "${RED}❌ Could not get Jenkins IP from Terraform output${NC}"
    read -p "Please enter Jenkins server IP: " JENKINS_IP
fi

JENKINS_URL="http://${JENKINS_IP}:8080"

echo -e "${BLUE}Jenkins URL: ${JENKINS_URL}${NC}"

# Wait for Jenkins to be ready
echo -e "${YELLOW}⏳ Waiting for Jenkins to be ready...${NC}"
timeout=300
counter=0

while ! curl -s "${JENKINS_URL}/login" > /dev/null; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Timeout waiting for Jenkins to start${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⏳ Jenkins not ready yet, waiting... (${counter}s/${timeout}s)${NC}"
    sleep 10
    counter=$((counter + 10))
done

echo -e "${GREEN}✅ Jenkins is ready!${NC}"

# Get initial admin password
echo -e "${YELLOW}🔑 Getting Jenkins initial admin password...${NC}"
INITIAL_PASSWORD=$(aws ssm get-parameter \
    --name "/legato-ecommerce/jenkins/initial-password" \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text 2>/dev/null || echo "")

if [ -z "$INITIAL_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  Could not retrieve password from SSM${NC}"
    echo -e "${YELLOW}Please SSH into Jenkins server and run:${NC}"
    echo "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
    read -p "Enter the initial admin password: " INITIAL_PASSWORD
fi

# Create Jenkins CLI configuration
mkdir -p ~/.jenkins-cli
cat > ~/.jenkins-cli/jenkins-cli.jar << 'EOF'
# Jenkins CLI will be downloaded automatically
EOF

# Download Jenkins CLI
echo -e "${YELLOW}📥 Downloading Jenkins CLI...${NC}"
curl -s "${JENKINS_URL}/jnlpJars/jenkins-cli.jar" -o ~/.jenkins-cli/jenkins-cli.jar

# Function to run Jenkins CLI commands
jenkins_cli() {
    java -jar ~/.jenkins-cli/jenkins-cli.jar -s "${JENKINS_URL}" -auth "admin:${INITIAL_PASSWORD}" "$@"
}

# Install required plugins
echo -e "${YELLOW}🔌 Installing Jenkins plugins...${NC}"
PLUGINS=(
    "git"
    "github"
    "pipeline-stage-view"
    "workflow-aggregator"
    "docker-workflow"
    "amazon-ecr"
    "pipeline-aws"
    "nodejs"
    "build-timeout"
    "credentials-binding"
    "timestamper"
    "ws-cleanup"
    "ant"
    "gradle"
    "email-ext"
    "slack"
)

for plugin in "${PLUGINS[@]}"; do
    echo -e "${YELLOW}Installing plugin: ${plugin}${NC}"
    jenkins_cli install-plugin "${plugin}" || echo -e "${YELLOW}⚠️  Plugin ${plugin} may already be installed${NC}"
done

# Restart Jenkins to load plugins
echo -e "${YELLOW}🔄 Restarting Jenkins to load plugins...${NC}"
jenkins_cli restart

# Wait for Jenkins to come back online
echo -e "${YELLOW}⏳ Waiting for Jenkins to restart...${NC}"
sleep 30

timeout=300
counter=0
while ! curl -s "${JENKINS_URL}/login" > /dev/null; do
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ Timeout waiting for Jenkins to restart${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⏳ Waiting for Jenkins restart... (${counter}s/${timeout}s)${NC}"
    sleep 10
    counter=$((counter + 10))
done

echo -e "${GREEN}✅ Jenkins restarted successfully${NC}"

# Create credentials
echo -e "${YELLOW}🔐 Setting up credentials...${NC}"

# GitHub credentials (if you have a token)
read -p "Do you have a GitHub personal access token? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    read -s -p "Enter your GitHub personal access token: " GITHUB_TOKEN
    echo
    
    # Create GitHub credentials
    cat > github-credentials.xml << EOF
<com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>github-credentials</id>
  <description>GitHub credentials for repository access</description>
  <username>${GITHUB_USERNAME}</username>
  <password>${GITHUB_TOKEN}</password>
</com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
EOF
    
    jenkins_cli create-credentials-by-xml system::system::jenkins _ < github-credentials.xml
    rm github-credentials.xml
    echo -e "${GREEN}✅ GitHub credentials created${NC}"
fi

# AWS credentials
echo -e "${YELLOW}🔐 Setting up AWS credentials...${NC}"
AWS_ACCESS_KEY=$(aws configure get aws_access_key_id)
AWS_SECRET_KEY=$(aws configure get aws_secret_access_key)

cat > aws-credentials.xml << EOF
<com.cloudbees.jenkins.plugins.awscredentials.AWSCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>aws-credentials</id>
  <description>AWS credentials for deployment</description>
  <accessKey>${AWS_ACCESS_KEY}</accessKey>
  <secretKey>${AWS_SECRET_KEY}</secretKey>
</com.cloudbees.jenkins.plugins.awscredentials.AWSCredentialsImpl>
EOF

jenkins_cli create-credentials-by-xml system::system::jenkins _ < aws-credentials.xml
rm aws-credentials.xml
echo -e "${GREEN}✅ AWS credentials created${NC}"

# Create pipeline job
echo -e "${YELLOW}📋 Creating pipeline job...${NC}"
cat > pipeline-job.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>E-commerce Platform CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <jenkins.model.BuildDiscarderProperty>
      <strategy class="hudson.tasks.LogRotator">
        <daysToKeep>30</daysToKeep>
        <numToKeep>10</numToKeep>
        <artifactDaysToKeep>-1</artifactDaysToKeep>
        <artifactNumToKeep>-1</artifactNumToKeep>
      </strategy>
    </jenkins.model.BuildDiscarderProperty>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <com.cloudbees.jenkins.plugins.BitBucketTrigger plugin="bitbucket">
          <spec></spec>
        </com.cloudbees.jenkins.plugins.BitBucketTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-username/your-repo.git</url>
          <credentialsId>github-credentials</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

jenkins_cli create-job "ecommerce-pipeline" < pipeline-job.xml
rm pipeline-job.xml
echo -e "${GREEN}✅ Pipeline job created${NC}"

# Configure global settings
echo -e "${YELLOW}⚙️  Configuring global settings...${NC}"

# Set up Node.js installation
cat > nodejs-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<jenkins.plugins.nodejs.tools.NodeJSInstallation_-DescriptorImpl>
  <installations>
    <jenkins.plugins.nodejs.tools.NodeJSInstallation>
      <name>NodeJS-18</name>
      <home></home>
      <properties>
        <jenkins.plugins.nodejs.tools.NodeJSInstallation_-InstallSourceProperty>
          <installers>
            <jenkins.plugins.nodejs.tools.NodeJSInstaller>
              <id>18.17.0</id>
              <npmPackages>npm@latest</npmPackages>
            </jenkins.plugins.nodejs.tools.NodeJSInstaller>
          </installers>
        </jenkins.plugins.nodejs.tools.NodeJSInstallation_-InstallSourceProperty>
      </properties>
    </jenkins.plugins.nodejs.tools.NodeJSInstallation>
  </installations>
</jenkins.plugins.nodejs.tools.NodeJSInstallation_-DescriptorImpl>
EOF

# Apply configuration (this might need manual setup in Jenkins UI)
echo -e "${YELLOW}⚠️  Node.js configuration needs to be set up manually in Jenkins UI${NC}"

# Create webhook URL
WEBHOOK_URL="${JENKINS_URL}/github-webhook/"

echo ""
echo -e "${GREEN}🎉 Jenkins setup completed successfully!${NC}"
echo ""
echo -e "${GREEN}📋 Jenkins Information:${NC}"
echo -e "${BLUE}URL: ${JENKINS_URL}${NC}"
echo -e "${BLUE}Username: admin${NC}"
echo -e "${BLUE}Password: ${INITIAL_PASSWORD}${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Log into Jenkins at: ${JENKINS_URL}"
echo "2. Complete the initial setup wizard"
echo "3. Configure Node.js installation in Global Tool Configuration"
echo "4. Update the pipeline job with your GitHub repository URL"
echo "5. Set up GitHub webhook: ${WEBHOOK_URL}"
echo "6. Configure Slack notifications (optional)"
echo ""
echo -e "${GREEN}🔗 GitHub Webhook URL: ${WEBHOOK_URL}${NC}"
echo -e "${YELLOW}Add this URL to your GitHub repository webhooks with 'application/json' content type${NC}"

# Save Jenkins info
cat > jenkins-info.txt << EOF
Jenkins Configuration
====================
Date: $(date)
URL: ${JENKINS_URL}
Username: admin
Password: ${INITIAL_PASSWORD}

Webhook URL: ${WEBHOOK_URL}

Installed Plugins:
$(printf '%s\n' "${PLUGINS[@]}")

Next Steps:
1. Complete Jenkins initial setup
2. Configure Node.js in Global Tool Configuration
3. Update pipeline job repository URL
4. Set up GitHub webhook
5. Configure notifications
EOF

echo -e "${GREEN}📄 Jenkins information saved to jenkins-info.txt${NC}"
