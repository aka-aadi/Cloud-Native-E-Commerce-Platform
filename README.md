# Cloud-Native E-Commerce Platform Deployment Guide (AWS Free Tier Focused)

This guide provides step-by-step instructions to deploy your Next.js e-commerce application on AWS using EC2, S3, and RDS, with an automated CI/CD pipeline powered by Jenkins and Docker. This setup aims to leverage AWS Free Tier services where possible, but be mindful of usage limits to avoid unexpected costs.

## Table of Contents

1.  [Important Free Tier Considerations](#1-important-free-tier-considerations)
2.  [Prerequisites](#2-prerequisites)
3.  [Project Structure](#3-project-structure)
4.  [Step-by-Step Deployment Instructions](#4-step-by-step-deployment-instructions)
    *   [4.1. Dockerize Your Next.js Application](#41-dockerize-your-nextjs-application)
    *   [4.2. AWS Infrastructure Setup (Manual & Terraform)](#42-aws-infrastructure-setup-manual--terraform)
        *   [4.2.1. Manual AWS Setup](#421-manual-aws-setup)
        *   [4.2.2. Terraform Configuration Files](#422-terraform-configuration-files)
        *   [4.2.3. Run Terraform](#423-run-terraform)
    *   [4.3. Jenkins CI/CD Pipeline Configuration](#43-jenkins-cicd-pipeline-configuration)
        *   [4.3.1. Access Jenkins and Initial Setup](#431-access-jenkins-and-initial-setup)
        *   [4.3.2. Install Required Jenkins Plugins](#432-install-required-jenkins-plugins)
        *   [4.3.3. Configure Jenkins Credentials](#433-configure-jenkins-credentials)
        *   [4.3.4. Create Jenkins Pipeline Job](#434-create-jenkins-pipeline-job)
        *   [4.3.5. Configure Git Webhook (Optional but Recommended)](#435-configure-git-webhook-optional-but-recommended)
    *   [4.4. Application Environment Variables](#44-application-environment-variables)
5.  [Verification and Testing](#5-verification-and-testing)
6.  [Troubleshooting](#6-troubleshooting)
7.  [Next Steps & Improvements](#7-next-steps--improvements)

---

## 1. Important Free Tier Considerations

*   **AWS Free Tier:** This guide primarily uses services with a free tier (EC2 `t2.micro`/`t3.micro`, RDS `db.t2.micro`/`db.t3.micro`, S3 5GB, ECR).
*   **Usage Limits:** Exceeding the free tier limits (e.g., 750 hours/month for EC2/RDS instances) will incur costs. Monitor your AWS Billing Dashboard regularly.
*   **NAT Gateway:** A NAT Gateway is **not** free tier eligible and will incur significant costs. To avoid this, the EC2 instance is placed in a public subnet.
*   **Jenkins Server:** For a "free" setup, Jenkins is installed on the *same* EC2 instance that hosts your Next.js application. This is **not recommended for production** due to resource contention and security, but it helps stay within free tier limits.
*   **Data Transfer:** While some data transfer is free, large amounts of egress (data out of AWS) can incur costs.

## 2. Prerequisites

Before you begin, ensure you have the following:

*   **An AWS Account:** With administrative access.
*   **AWS CLI Installed and Configured:** On your local machine.
*   **Terraform Installed:** On your local machine.
*   **Git Installed:** On your local machine.
*   **An SSH Key Pair for EC2:**
    *   If you don't have one, go to the EC2 console > "Key Pairs" > "Create key pair".
    *   Give it a name (e.g., `my-legato-key`).
    *   Download the `.pem` file and keep it secure. You'll need its content for Jenkins and its name for Terraform.

## 3. Project Structure

Ensure your project has the following structure:

\`\`\`
.
├── Dockerfile
├── Jenkinsfile
├── terraform/
│   ├── main.tf
│   ├── rds.tf
│   └── app-userdata.sh
├── app/
│   └── ... (Your Next.js application files)
├── public/
│   └── ...
├── package.json
├── pnpm-lock.yaml
└── README.md (This file)
\`\`\`

## 4. Step-by-Step Deployment Instructions

### 4.1. Dockerize Your Next.js Application

The `Dockerfile` in your project root defines how your application is containerized. It builds your Next.js app and then creates a lightweight image to run it.

*   **Action:** Ensure the `Dockerfile` (provided in the previous response) is present in your project root.

### 4.2. AWS Infrastructure Setup (Manual & Terraform)

We'll first manually set up some foundational AWS resources, then use Terraform to provision the rest.

#### 4.2.1. Manual AWS Setup

Log in to your AWS Management Console and perform these steps:

1.  **Create a VPC:**
    *   Go to the **VPC** console.
    *   Click "Create VPC".
    *   Choose "VPC only".
    *   **Name tag:** `legato-vpc`
    *   **IPv4 CIDR block:** `10.0.0.0/16` (or your preferred range)
    *   Click "Create VPC".
2.  **Create Subnets:**
    *   Go to "Subnets" in the VPC console.
    *   Click "Create subnet".
    *   Select your `legato-vpc`.
    *   **Public Subnet (for EC2/Jenkins):**
        *   **Name tag:** `legato-public-subnet-az1`
        *   **Availability Zone:** Choose one (e.g., `ap-south-1a`).
        *   **IPv4 CIDR block:** `10.0.1.0/24`
        *   Click "Create subnet".
        *   **Important:** Select this public subnet, go to "Actions" > "Modify auto-assign IP settings", and enable "Enable auto-assign public IPv4 address". Save.
    *   **Private Subnet 1 (for RDS):**
        *   **Name tag:** `legato-private-subnet-az1`
        *   **Availability Zone:** Same as public subnet (e.g., `ap-south-1a`).
        *   **IPv4 CIDR block:** `10.0.2.0/24`
        *   Click "Create subnet".
    *   **Private Subnet 2 (for RDS - Multi-AZ):**
        *   **Name tag:** `legato-private-subnet-az2`
        *   **Availability Zone:** Choose a *different* AZ (e.g., `ap-south-1b`).
        *   **IPv4 CIDR block:** `10.0.3.0/24`
        *   Click "Create subnet".
3.  **Create Internet Gateway (IGW):**
    *   Go to "Internet Gateways" in the VPC console.
    *   Click "Create internet gateway".
    *   **Name tag:** `legato-igw`
    *   Click "Create internet gateway".
    *   Select your new IGW, go to "Actions" > "Attach to VPC", and select your `legato-vpc`.
4.  **Create Route Tables:**
    *   Go to "Route Tables" in the VPC console.
    *   **Public Route Table:**
        *   Click "Create route table".
        *   **Name tag:** `legato-public-rt`
        *   **VPC:** Select `legato-vpc`.
        *   Click "Create route table".
        *   Select `legato-public-rt`, go to "Routes" tab > "Edit routes" > "Add route".
            *   **Destination:** `0.0.0.0/0`
            *   **Target:** Select your `legato-igw`.
            *   Click "Save changes".
        *   Go to "Subnet associations" tab > "Edit subnet associations", and select `legato-public-subnet-az1`. Save.
    *   **Private Route Table:**
        *   Click "Create route table".
        *   **Name tag:** `legato-private-rt`
        *   **VPC:** Select `legato-vpc`.
        *   Click "Create route table".
        *   Go to "Subnet associations" tab > "Edit subnet associations", and select both `legato-private-subnet-az1` and `legato-private-subnet-az2`. Save.
5.  **Create Security Groups:**
    *   Go to **EC2** console > "Security Groups" (under "Network & Security").
    *   **EC2 Security Group (for App & Jenkins):**
        *   Click "Create security group".
        *   **Security group name:** `legato-ec2-sg`
        *   **Description:** `Allow HTTP, SSH to EC2`
        *   **VPC:** Select `legato-vpc`.
        *   **Inbound rules:**
            *   Add rule: Type `SSH`, Port `22`, Source `My IP` (or `0.0.0.0/0` for testing, but restrict later).
            *   Add rule: Type `HTTP`, Port `80`, Source `0.0.0.0/0`.
            *   Add rule: Type `Custom TCP`, Port `8080` (for Jenkins), Source `My IP` (or `0.0.0.0/0` for testing).
        *   **Outbound rules:** Default `0.0.0.0/0` (all traffic out).
        *   Click "Create security group".
    *   **RDS Security Group:**
        *   Click "Create security group".
        *   **Security group name:** `legato-rds-sg`
        *   **Description:** `Allow PostgreSQL traffic from EC2`
        *   **VPC:** Select `legato-vpc`.
        *   **Inbound rules:**
            *   Add rule: Type `PostgreSQL`, Port `5432`, Source `Custom` and select your `legato-ec2-sg` (by its ID or name). This ensures only your application server can connect.
        *   **Outbound rules:** Default `0.0.0.0/0` (all traffic out).
        *   Click "Create security group".
6.  **Create an S3 Bucket:**
    *   Go to the **S3** console.
    *   Click "Create bucket".
    *   **Bucket name:** `your-legato-assets-bucket-12345` (must be globally unique, use a random suffix).
    *   **AWS Region:** Select your desired region (e.g., `ap-south-1`).
    *   Keep other settings default for now. Click "Create bucket".
7.  **Create an ECR Repository:**
    *   Go to the **ECR** console.
    *   Click "Create repository".
    *   **Visibility settings:** `Private`.
    *   **Repository name:** `legato-ecommerce-app`
    *   Click "Create repository".
8.  **Create IAM Roles and Users:**
    *   Go to the **IAM** console.
    *   **EC2 Instance Role (for EC2 to access ECR/S3):**
        *   Go to "Roles" > "Create role".
        *   **Trusted entity type:** `AWS service`, **Use case:** `EC2`. Click "Next".
        *   **Permissions:** Search for and attach these policies:
            *   `AmazonEC2ContainerRegistryReadOnly` (to pull Docker images from ECR)
            *   `AmazonS3ReadOnlyAccess` (if your app needs to read from S3, or `AmazonS3FullAccess` if it uploads)
        *   Click "Next".
        *   **Role name:** `legato-ec2-role`
        *   Click "Create role".
    *   **Jenkins IAM User (for Jenkins to interact with AWS):**
        *   Go to "Users" > "Create user".
        *   **User name:** `jenkins-ci-user`
        *   Select `Provide user access to the AWS Management Console - Optional` (uncheck if you only need programmatic access).
        *   Select `I want to create an IAM user`.
        *   Click "Next".
        *   **Permissions options:** Select `Attach policies directly`.
        *   **Permissions policies:** Search for and attach these policies:
            *   `AmazonEC2ContainerRegistryPowerUser` (to push and pull images from ECR)
            *   `AmazonEC2FullAccess` (or more restricted permissions like `AmazonEC2InstanceConnect` and `AmazonEC2RunInstances` if you know exactly what you need for SSH deployment).
        *   Click "Next", then "Create user".
        *   After creation, click on the user name (`jenkins-ci-user`). Go to the "Security credentials" tab.
        *   Under "Access keys", click "Create access key". Select "Command Line Interface (CLI)".
        *   **Note down the Access Key ID and Secret Access Key.** These are crucial for Jenkins to authenticate with AWS. Keep them secure!

#### 4.2.2. Terraform Configuration Files

Ensure the `terraform` directory in your project root contains the `main.tf`, `rds.tf`, and `app-userdata.sh` files (provided in the previous response).

**Crucially, you must update the placeholders in these files with the actual IDs and names of the AWS resources you just created manually.**

*   **`terraform/rds.tf`:**
    *   `data "aws_vpc" "selected_vpc"`: Update `values = ["legato-vpc"]` if your VPC name tag is different.
    *   `data "aws_subnet" "private_az1"`: Update `values = ["legato-private-subnet-az1"]`.
    *   `data "aws_subnet" "private_az2"`: Update `values = ["legato-private-subnet-az2"]`.
    *   `data "aws_security_group" "rds_sg"`: Update `values = ["legato-rds-sg"]`.
    *   `password = "your_strong_rds_password"`: **Change this to a strong, unique password.**
*   **`terraform/main.tf`:**
    *   `provider "aws"`: Update `region = "ap-south-1"` to your AWS region.
    *   `data "aws_vpc" "selected_vpc"`: Update `values = ["legato-vpc"]`.
    *   `data "aws_subnet" "public_az1"`: Update `values = ["legato-public-subnet-az1"]`.
    *   `data "aws_security_group" "ec2_sg"`: Update `values = ["legato-ec2-sg"]`.
    *   `data "aws_s3_bucket" "legato_assets"`: Update `bucket = "your-legato-assets-bucket-12345"` to your S3 bucket name.
    *   `data "aws_iam_instance_profile" "legato_ec2_profile"`: Update `name = "legato-ec2-role"`.
    *   `ami = "ami-08a6efd148b1f7504"`: **Find a valid Amazon Linux 2 or 2023 AMI ID for your region.** You can find this in the EC2 console when launching an instance.
    *   `key_name = "my-legato-key"`: **Replace with the name of the EC2 Key Pair you created.**
    *   `aws_account_id = "619577151605"`: **Replace with your 12-digit AWS Account ID.**
    *   `aws_region = "us-east-1a"`: **Replace with your AWS Region.**
    *   `ecr_repo_url = "619577151605.dkr.ecr.us-east-1a.amazonaws.com/legato-ecommerce-app"`: **Replace `YOUR_AWS_ACCOUNT_ID` and `ap-south-1` with your actual values.**
*   **`terraform/app-userdata.sh`:**
    *   The placeholders here are automatically filled by Terraform from `main.tf`. Just ensure the `AWS_ACCOUNT_ID`, `AWS_REGION`, and `ECR_REPO_URL` variables are correctly passed from `main.tf`.

#### 4.2.3. Run Terraform

1.  Open your terminal and navigate to your project's `terraform/` directory.
2.  Initialize Terraform:
    \`\`\`bash
    terraform init
    \`\`\`
3.  Review the plan (this shows what Terraform will create/modify):
    \`\`\`bash
    terraform plan
    \`\`\`
    *   **Carefully review the output.** Ensure it aligns with what you expect to create.
4.  Apply the changes:
    \`\`\`bash
    terraform apply
    \`\`\`
    *   Type `yes` when prompted to confirm.
    *   This will provision your EC2 instance (which will also install Jenkins), RDS database, and other resources.
    *   **Note the `ec2_public_ip` output from Terraform.** This is the public IP address of your EC2 instance, which you'll need to access Jenkins and your application.

### 4.3. Jenkins CI/CD Pipeline Configuration

Now that your EC2 instance with Jenkins is running, let's configure Jenkins.

#### 4.3.1. Access Jenkins and Initial Setup

1.  Open your web browser and go to `http://34.229.99.59:8080`.
2.  You'll be prompted to unlock Jenkins.
3.  SSH into your EC2 instance using your `.pem` key:
    \`\`\`bash
    ssh -i /path/to/your-ssh-key-pair-name.pem ec2-user@<Your_EC2_Public_IP>
    \`\`\`
4.  Get the initial admin password from the EC2 instance:
    \`\`\`bash
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    \`\`\`
5.  Copy the password, paste it into the Jenkins unlock screen, and click "Continue".
6.  Choose "Install suggested plugins".
7.  Create your first admin user (remember these credentials!).
8.  Set the Jenkins URL (usually `http://<Your_EC2_Public_IP>:8080`).

#### 4.3.2. Install Required Jenkins Plugins

1.  In Jenkins, go to `Manage Jenkins` > `Plugins` > `Available plugins`.
2.  Search for and install these plugins:
    *   `Git`
    *   `Docker`
    *   `SSH Agent`
    *   `AWS Credentials`
    *   `Pipeline` (usually installed by default)
    *   `GitHub Integration` (if you want GitHub webhooks)
3.  Restart Jenkins if prompted.

#### 4.3.3. Configure Jenkins Credentials

1.  In Jenkins, go to `Manage Jenkins` > `Manage Credentials`.
2.  Click "Add Credentials" (under `Jenkins` scope).
    *   **AWS Credentials (for ECR access):**
        *   **Kind:** `AWS Credentials`
        *   **Scope:** `Global`
        *   **ID:** `your-aws-credentials-id` (This ID **must** match the `AWS_CREDENTIALS_ID` in your `Jenkinsfile`).
        *   **Access Key ID:** Paste the Access Key ID of your `jenkins-ci-user` IAM user.
        *   **Secret Access Key:** Paste the Secret Access Key of your `jenkins-ci-user` IAM user.
        *   **Description:** `AWS Credentials for CI/CD`
    *   **SSH Private Key (for EC2 Deployment):**
        *   **Kind:** `SSH Username with private key`
        *   **Scope:** `Global`
        *   **ID:** `your-ssh-key-id` (This ID **must** match the `SSH_CREDENTIALS_ID` in your `Jenkinsfile`).
        *   **Username:** `ec2-user`
        *   **Private Key:** Select `Enter directly` and paste the **entire content** of your `.pem` file (the private key you used to SSH into EC2).
        *   **Description:** `SSH key for EC2 deployment`

#### 4.3.4. Create Jenkins Pipeline Job

1.  On the Jenkins dashboard, click `New Item`.
2.  Enter an item name (e.g., `Legato-E-commerce-Pipeline`).
3.  Select `Pipeline` and click `OK`.
4.  In the job configuration:
    *   Under `General`, check `GitHub project` and enter your GitHub repository URL (e.g., `https://github.com/your-org/Cloud-Native-E-Commerce-Platform`).
    *   Under `Build Triggers`, select `GitHub hook trigger for GITScm polling`.
    *   Under the `Pipeline` section:
        *   **Definition:** `Pipeline script from SCM`
        *   **SCM:** `Git`
        *   **Repository URL:** `https://github.com/your-org/Cloud-Native-E-Commerce-Platform.git` (your actual Git repository URL).
        *   **Credentials:** Select your Git credentials if your repository is private (otherwise, leave blank).
        *   **Branches to build:** `*/main` (or your desired branch).
        *   **Script Path:** `Jenkinsfile` (assuming it's in the root of your repository).
5.  **Update the `Jenkinsfile` placeholders:**
    *   `AWS_REGION = 'us-east-1'`
    *   `AWS_ACCOUNT_ID = '619577151605'`
    *   `ECR_REPOSITORY_NAME = 'legato-ecommerce-app'`
    *   `EC2_INSTANCE_IP = '34.229.99.59'` (Get this from Terraform output)
    *   `SSH_CREDENTIALS_ID = 'your-ssh-key-id'` (The ID you set in Jenkins Credentials)
    *   `AWS_CREDENTIALS_ID = 'your-aws-credentials-id'` (The ID you set in Jenkins Credentials)
    *   `git branch: 'main', url: 'https://github.com/your-org/Cloud-Native-E-Commerce-Platform.git'` (Your actual Git repo URL)
6.  Click "Save".

#### 4.3.5. Configure Git Webhook (Optional but Recommended for Automation)

This step automates Jenkins builds whenever you push changes to your Git repository.

1.  Go to your GitHub repository on GitHub.com.
2.  Navigate to `Settings` > `Webhooks`.
3.  Click "Add webhook".
4.  **Payload URL:** `http://34.229.99.59:8080/github-webhook/`
5.  **Content type:** `application/json`.
6.  **Which events would you like to trigger this webhook?** Select `Just the push event`.
7.  Click "Add webhook".

### 4.4. Application Environment Variables

Your Next.js application needs to connect to the RDS database and potentially use S3. The `terraform/app-userdata.sh` script creates a `.env` file on the EC2 instance for your Docker container.

Ensure your Next.js application code accesses these variables correctly:

*   `process.env.DATABASE_URL`
*   `process.env.S3_BUCKET_NAME`
*   `process.env.AWS_REGION`

If your application uses other environment variables (e.g., API keys, authentication secrets), you'll need to add them to the `.env` file creation in `app-userdata.sh` as well.

## 5. Verification and Testing

1.  **Review all placeholders:** Double-check that you've replaced all `YOUR_...` values in `Dockerfile`, `terraform/rds.tf`, `terraform/main.tf`, `terraform/app-userdata.sh`, and `Jenkinsfile` with your actual AWS IDs, names, and credentials.
2.  **Test Terraform:** Ensure `terraform apply` runs successfully and all resources are created.
3.  **Access Jenkins:** Verify you can access Jenkins at `http://34.229.99.59:8080`.
4.  **Test Jenkins Credentials:** In Jenkins, go to `Manage Jenkins` > `Manage Credentials`. You can't directly "test" them here, but ensuring they are correctly entered is key.
5.  **Manual Jenkins Build:** Go to your pipeline job in Jenkins and click "Build Now". Observe the console output for any errors. This will trigger the build, push, and deploy process.
6.  **Access Your Application:** Once the Jenkins pipeline completes successfully, your Next.js application should be accessible at `http://34.229.99.59`.

## 6. Troubleshooting

*   **SSH Connection Issues:**
    *   Ensure your EC2 security group allows SSH (port 22) from your IP.
    *   Verify your `.pem` key permissions (`chmod 400 your-key.pem`).
    *   Check the `ec2-user` username.
*   **Jenkins Access Issues:**
    *   Ensure your EC2 security group allows port 8080 from your IP.
    *   Check if the Jenkins service is running on EC2 (`sudo systemctl status jenkins`).
*   **Docker Build/Push Issues:**
    *   Check Jenkins console output for Docker errors.
    *   Ensure the `jenkins-ci-user` IAM user has `AmazonEC2ContainerRegistryPowerUser` permissions.
    *   Verify ECR repository name and URL.
*   **Application Not Running on EC2:**
    *   SSH into EC2 and check Docker logs: `sudo docker ps -a`, `sudo docker logs legato-app`.
    *   Check if the container is running and healthy.
    *   Verify the `.env` file content on EC2 (`sudo cat /opt/legato/.env`).
    *   Ensure the EC2 security group allows HTTP (port 80) inbound.
*   **Database Connection Issues:**
    *   Ensure the RDS security group allows PostgreSQL (port 5432) from your `legato-ec2-sg`.
    *   Verify `DATABASE_URL` format and credentials in the `.env` file on EC2.
    *   Check RDS instance status in the AWS RDS console.

## 7. Next Steps & Improvements

*   **Monitor AWS Free Tier:** Set up billing alarms in AWS to notify you if you approach free tier limits.
*   **Database Migrations:** If your application uses a database ORM (like Prisma), integrate database migrations into your `Jenkinsfile`'s deploy stage (e.g., `docker run --rm --env-file /opt/legato/.env ${ECR_REPO_URL}:latest npx prisma migrate deploy`).
*   **HTTPS:** For production, set up an Application Load Balancer (ALB) and AWS Certificate Manager (ACM) for HTTPS. Note that ALB is **not** free tier eligible.
*   **Dedicated Jenkins Server:** For production, run Jenkins on a separate EC2 instance or consider managed CI/CD services like AWS CodePipeline/CodeBuild.
*   **Environment Management:** Use AWS Secrets Manager or Parameter Store for sensitive environment variables instead of hardcoding them or placing them directly in `.env` files.
*   **Logging & Monitoring:** Integrate AWS CloudWatch for application logs and metrics.
*   **Scalability:** Explore AWS Auto Scaling Groups for EC2 and RDS Multi-AZ for high availability as your application grows.
*   **Cost Optimization:** Regularly review your AWS resources and usage to identify areas for cost savings.
