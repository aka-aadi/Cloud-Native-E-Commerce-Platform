pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1' // IMPORTANT: Your AWS region
        AWS_ACCOUNT_ID = 'YOUR_AWS_ACCOUNT_ID' // IMPORTANT: Your AWS Account ID
        ECR_REPOSITORY_NAME = 'legato-ecommerce-app' // IMPORTANT: Name of your ECR repository
        ECR_REPO_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"
        EC2_INSTANCE_IP = 'YOUR_EC2_PUBLIC_IP' // IMPORTANT: Public IP of your EC2 instance (from Terraform output)
        EC2_SSH_USER = 'ec2-user' // Default user for Amazon Linux AMIs
        SSH_CREDENTIALS_ID = 'your-ssh-key-id' // IMPORTANT: Jenkins credential ID for SSH key
        AWS_CREDENTIALS_ID = 'your-aws-credentials-id' // IMPORTANT: Jenkins credential ID for AWS access key/secret key
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-org/Cloud-Native-E-Commerce-Platform.git' // IMPORTANT: Replace with your Git repository URL
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${ECR_REPOSITORY_NAME}:${env.BUILD_NUMBER} ."
                    sh "docker tag ${ECR_REPOSITORY_NAME}:${env.BUILD_NUMBER} ${ECR_REPO_URL}:${env.BUILD_NUMBER}"
                    sh "docker tag ${ECR_REPOSITORY_NAME}:${env.BUILD_NUMBER} ${ECR_REPO_URL}:latest"
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                withCredentials([aws(credentialsId: env.AWS_CREDENTIALS_ID, roleBindings: [])]) {
                    script {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                        sh "docker push ${ECR_REPO_URL}:${env.BUILD_NUMBER}"
                        sh "docker push ${ECR_REPO_URL}:latest"
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY')]) {
                    script {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i \$SSH_KEY ${EC2_SSH_USER}@${EC2_INSTANCE_IP} << 'EOF'
                                # Login to ECR on EC2 instance
                                aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                                # Pull the latest image
                                docker pull ${ECR_REPO_URL}:latest

                                # Stop and remove old container if it exists
                                docker stop legato-app || true
                                docker rm legato-app || true

                                # Run the new container
                                docker run -d \
                                  --name legato-app \
                                  -p 80:3000 \
                                  --restart always \
                                  --env-file /opt/legato/.env \
                                  ${ECR_REPO_URL}:latest

                                # Optional: Run database migrations (if your app has them)
                                # Example: docker run --rm --env-file /opt/legato/.env ${ECR_REPO_URL}:latest npx prisma migrate deploy
                            EOF
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}
