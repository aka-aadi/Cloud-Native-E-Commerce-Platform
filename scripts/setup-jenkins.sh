#!/bin/bash

# Jenkins Setup Script for CI/CD Pipeline
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up Jenkins CI/CD Pipeline for MusicMart...${NC}"

# Create Jenkins directory structure
mkdir -p jenkins/{jobs,plugins,secrets}

echo -e "${YELLOW}📦 Creating Jenkins Docker Compose configuration...${NC}"

cat > jenkins/docker-compose.jenkins.yml << 'EOF'
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: musicmart-jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - ./jobs:/var/jenkins_home/jobs
      - ./plugins:/var/jenkins_home/plugins
    environment:
      - JENKINS_OPTS="--httpPort=8080"
      - JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
    networks:
      - jenkins

  jenkins-agent:
    image: jenkins/inbound-agent:latest
    container_name: musicmart-jenkins-agent
    restart: unless-stopped
    environment:
      - JENKINS_URL=http://jenkins:8080
      - JENKINS_AGENT_NAME=musicmart-agent
      - JENKINS_SECRET=${JENKINS_AGENT_SECRET}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - jenkins
    networks:
      - jenkins

volumes:
  jenkins_home:

networks:
  jenkins:
    driver: bridge
EOF

echo -e "${YELLOW}🔌 Creating Jenkins plugins list...${NC}"

cat > jenkins/plugins/plugins.txt << 'EOF'
ant:latest
antisamy-markup-formatter:latest
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
docker-workflow:latest
amazon-ecr:latest
pipeline-aws:latest
nodejs:latest
EOF

echo -e "${YELLOW}📋 Creating Jenkins job configuration...${NC}"

mkdir -p jenkins/jobs/musicmart-pipeline
cat > jenkins/jobs/musicmart-pipeline/config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions>
    <org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobAction plugin="pipeline-model-definition@1.8.5"/>
    <org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobPropertyTrackerAction plugin="pipeline-model-definition@1.8.5">
      <jobProperties/>
      <triggers/>
      <parameters/>
      <options/>
    </org.jenkinsci.plugins.pipeline.modeldefinition.actions.DeclarativeJobPropertyTrackerAction>
  </actions>
  <description>MusicMart E-commerce Platform CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.jira.JiraProjectProperty plugin="jira@3.1.1"/>
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
        <com.cloudbees.jenkins.plugins.BitBucketTrigger plugin="bitbucket@1.1.5">
          <spec></spec>
        </com.cloudbees.jenkins.plugins.BitBucketTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.2">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-username/musicmart.git</url>
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

echo -e "${YELLOW}🔒 Creating Jenkins initial configuration...${NC}"

cat > jenkins/init.groovy.d/basic-security.groovy << 'EOF'
#!groovy

import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Create admin user
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "musicmart123!")
instance.setSecurityRealm(hudsonRealm)

// Set authorization strategy
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
strategy.setAllowAnonymousRead(false)
instance.setAuthorizationStrategy(strategy)

// Enable CSRF protection
instance.setCrumbIssuer(new DefaultCrumbIssuer(true))

// Disable CLI over remoting
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Enable agent-to-master access control
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

instance.save()
EOF

echo -e "${YELLOW}🐳 Starting Jenkins container...${NC}"

cd jenkins
docker-compose -f docker-compose.jenkins.yml up -d

echo -e "${YELLOW}⏳ Waiting for Jenkins to start...${NC}"
sleep 30

# Wait for Jenkins to be ready
while ! curl -s http://localhost:8080/login > /dev/null; do
    echo -e "${YELLOW}⏳ Waiting for Jenkins to be ready...${NC}"
    sleep 10
done

echo -e "${GREEN}✅ Jenkins is now running!${NC}"
echo -e "${GREEN}🌐 Access Jenkins at: http://localhost:8080${NC}"
echo -e "${GREEN}👤 Username: admin${NC}"
echo -e "${GREEN}🔑 Password: musicmart123!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Configure GitHub webhook in your repository settings"
echo -e "2. Add AWS credentials in Jenkins (Manage Jenkins > Manage Credentials)"
echo -e "3. Add Docker Hub credentials if using Docker Hub registry"
echo -e "4. Update the Jenkinsfile with your specific repository and AWS account details"
echo -e "5. Configure environment variables for your deployment"

cd ..

echo -e "${GREEN}🎉 Jenkins CI/CD pipeline setup completed!${NC}"
