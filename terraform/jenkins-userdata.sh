#!/bin/bash

# Jenkins CI/CD Server Setup Script
set -e

# Configuration variables from Terraform
AWS_REGION="${aws_region}"
PROJECT_NAME="${project_name}"
ECR_REPO="${ecr_repo}"

# Logging setup
LOG_FILE="/var/log/jenkins-setup.log"
exec 1> >(tee -a $LOG_FILE)
exec 2>&1

echo "=== Jenkins CI/CD Setup Started at $(date) ==="
echo "AWS Region: $AWS_REGION"
echo "Project: $PROJECT_NAME"
echo "ECR Repository: $ECR_REPO"

# Update system packages
echo "📦 Updating system packages..."
yum update -y

# Install Java 11 (required for Jenkins)
echo "☕ Installing Java 11..."
yum install -y java-11-amazon-corretto-headless

# Install Jenkins
echo "🔧 Installing Jenkins..."
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install -y jenkins

# Install Docker
echo "🐳 Installing Docker..."
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker jenkins

# Install Docker Compose
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install AWS CLI v2
echo "📦 Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Install Terraform
echo "🏗️ Installing Terraform..."
yum install -y yum-utils
yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
yum install -y terraform

# Configure AWS CLI for Jenkins
mkdir -p /var/lib/jenkins/.aws
cat > /var/lib/jenkins/.aws/config << EOF
[default]
region = $AWS_REGION
output = json
EOF

chown -R jenkins:jenkins /var/lib/jenkins/.aws

# Start and enable Jenkins
echo "🚀 Starting Jenkins..."
systemctl start jenkins
systemctl enable jenkins

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to initialize..."
sleep 60

# Get initial admin password
JENKINS_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)

# Store Jenkins password in SSM Parameter Store
aws ssm put-parameter \
    --name "/$PROJECT_NAME/jenkins/initial-password" \
    --value "$JENKINS_PASSWORD" \
    --type "SecureString" \
    --region $AWS_REGION \
    --overwrite

echo "🔑 Jenkins initial password stored in SSM Parameter Store"

# Create Jenkins configuration directory
mkdir -p /var/lib/jenkins/init.groovy.d

# Create initial Jenkins configuration script
cat > /var/lib/jenkins/init.groovy.d/basic-security.groovy << 'EOF'
#!groovy

import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Create admin user
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", System.getenv("JENKINS_ADMIN_PASSWORD") ?: "admin123")
instance.setSecurityRealm(hudsonRealm)

// Set authorization strategy
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// Disable CLI over remoting
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Enable Agent to master security subsystem
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

// Save configuration
instance.save()
EOF

# Create Jenkins job configuration
mkdir -p /var/lib/jenkins/jobs/legato-ecommerce-pipeline/

cat > /var/lib/jenkins/jobs/legato-ecommerce-pipeline/config.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>Legato E-commerce Platform CI/CD Pipeline</description>
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
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script>
pipeline {
    agent any
    
    environment {
        AWS_REGION = '$AWS_REGION'
        ECR_REPOSITORY = '$ECR_REPO'
        PROJECT_NAME = '$PROJECT_NAME'
        IMAGE_TAG = "\${BUILD_NUMBER}-\${GIT_COMMIT.take(7)}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint and Type Check') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('TypeScript Check') {
                    steps {
                        sh 'npx tsc --noEmit'
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("\${ECR_REPOSITORY}:\${IMAGE_TAG}")
                    env.DOCKER_IMAGE = "\${ECR_REPOSITORY}:\${IMAGE_TAG}"
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region \${AWS_REGION} | docker login --username AWS --password-stdin \${ECR_REPOSITORY}
                        docker push \${DOCKER_IMAGE}
                        docker tag \${DOCKER_IMAGE} \${ECR_REPOSITORY}:latest
                        docker push \${ECR_REPOSITORY}:latest
                    """
                }
            }
        }
        
        stage('Deploy to Auto Scaling Group') {
            steps {
                script {
                    sh """
                        # Trigger deployment on all instances in the Auto Scaling Group
                        aws autoscaling start-instance-refresh \\
                            --auto-scaling-group-name $PROJECT_NAME-asg \\
                            --region \${AWS_REGION} \\
                            --preferences '{"InstanceWarmup": 300, "MinHealthyPercentage": 50}'
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Get load balancer URL
                    def lbUrl = sh(
                        script: "aws elbv2 describe-load-balancers --names $PROJECT_NAME-alb --region \${AWS_REGION} --query 'LoadBalancers[0].DNSName' --output text",
                        returnStdout: true
                    ).trim()
                    
                    echo "Load Balancer URL: http://\${lbUrl}"
                    
                    // Wait for deployment and health check
                    timeout(time: 10, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def response = sh(
                                    script: "curl -s -o /dev/null -w '%{http_code}' http://\${lbUrl}/api/health",
                                    returnStdout: true
                                ).trim()
                                return response == '200'
                            }
                        }
                    }
                    
                    echo "✅ Deployment successful and healthy!"
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
            sh 'docker system prune -f'
        }
        
        success {
            echo "🎉 Pipeline completed successfully!"
        }
        
        failure {
            echo "❌ Pipeline failed!"
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
chown -R jenkins:jenkins /var/lib/jenkins/

# Restart Jenkins to apply configurations
systemctl restart jenkins

# Wait for Jenkins to restart
sleep 30

# Create startup script
cat > /etc/systemd/system/jenkins-setup.service << 'EOF'
[Unit]
Description=Jenkins Setup Service
After=jenkins.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/jenkins-post-setup.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Create post-setup script
cat > /usr/local/bin/jenkins-post-setup.sh << 'JENKINS_POST_SETUP_EOF'
#!/bin/bash

# Wait for Jenkins to be fully ready
sleep 60

# Install Jenkins plugins via CLI
JENKINS_URL="http://localhost:8080"
JENKINS_CLI="/var/lib/jenkins/jenkins-cli.jar"

# Download Jenkins CLI
curl -s "${JENKINS_URL}/jnlpJars/jenkins-cli.jar" -o $JENKINS_CLI

# Function to run Jenkins CLI commands
jenkins_cli() {
    java -jar $JENKINS_CLI -s $JENKINS_URL -auth admin:$(cat /var/lib/jenkins/secrets/initialAdminPassword) "$@"
}

# Install essential plugins
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
)

for plugin in "${PLUGINS[@]}"; do
    echo "Installing plugin: ${plugin}"
    jenkins_cli install-plugin "${plugin}" || echo "Plugin ${plugin} may already be installed"
done

# Restart Jenkins to load plugins
jenkins_cli restart

echo "Jenkins setup completed!"
JENKINS_POST_SETUP_EOF

chmod +x /usr/local/bin/jenkins-post-setup.sh

# Enable and start the setup service
systemctl enable jenkins-setup.service
systemctl start jenkins-setup.service

# Configure firewall (if needed)
# firewall-cmd --permanent --add-port=8080/tcp
# firewall-cmd --reload

# Create health check script
cat > /usr/local/bin/jenkins-health-check.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/jenkins-health.log"

echo "$(date): Jenkins health check started" >> $LOG_FILE

if systemctl is-active --quiet jenkins; then
    echo "$(date): Jenkins service is running" >> $LOG_FILE
    
    if curl -s http://localhost:8080/login > /dev/null; then
        echo "$(date): Jenkins web interface is accessible" >> $LOG_FILE
    else
        echo "$(date): Jenkins web interface is not accessible" >> $LOG_FILE
    fi
else
    echo "$(date): Jenkins service is not running, attempting restart" >> $LOG_FILE
    systemctl restart jenkins
fi

if systemctl is-active --quiet docker; then
    echo "$(date): Docker service is running" >> $LOG_FILE
else
    echo "$(date): Docker service is not running, attempting restart" >> $LOG_FILE
    systemctl restart docker
fi

echo "$(date): Jenkins health check completed" >> $LOG_FILE
EOF

chmod +x /usr/local/bin/jenkins-health-check.sh

# Setup health check cron job
echo "*/10 * * * * /usr/local/bin/jenkins-health-check.sh" | crontab -

# Create welcome message
cat > /etc/motd << 'EOF'

🔧 Welcome to Jenkins CI/CD Server! 🔧

This server provides continuous integration and deployment for the Legato e-commerce platform.

Services:
- Jenkins (Port 8080)
- Docker
- AWS CLI
- Terraform
- Node.js

Quick Commands:
- Check Jenkins status: systemctl status jenkins
- View Jenkins logs: journalctl -u jenkins -f
- Check Docker: docker ps
- Jenkins CLI: java -jar /var/lib/jenkins/jenkins-cli.jar

Access Jenkins: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080

EOF

echo "=== Jenkins CI/CD Setup Completed at $(date) ==="
echo "🎉 Jenkins server is ready!"
echo "🌐 Access Jenkins at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "🔑 Initial password: $JENKINS_PASSWORD"
echo "📋 Password also stored in SSM Parameter Store: /$PROJECT_NAME/jenkins/initial-password"

# Log completion
echo "Jenkins setup completed successfully at $(date)" >> $LOG_FILE
