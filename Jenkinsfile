pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO_NAME = 'cloud-native-e-commerce-platform'
        ECS_CLUSTER_NAME = 'ecommerce-cluster'
        ECS_SERVICE_NAME = 'ecommerce-service'
        DB_SECRET_NAME = 'ecommerce-db-credentials' // Name of the secret in AWS Secrets Manager
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/aka-aadi/Cloud-Native-E-Commerce-Platform.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Login to ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    
                    // Build Docker image
                    sh "docker build -t ${ECR_REPO_NAME} ."
                    
                    // Tag Docker image
                    sh "docker tag ${ECR_REPO_NAME}:latest ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest"
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                script {
                    sh "docker push ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest"
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    // Get DB credentials from AWS Secrets Manager
                    def dbCredentials = sh(returnStdout: true, script: "aws secretsmanager get-secret-value --secret-id ${DB_SECRET_NAME} --query SecretString --output text --region ${AWS_REGION}").trim()
                    
                    // Parse DB credentials (assuming JSON format)
                    def dbUser = new groovy.json.JsonSlurper().parseText(dbCredentials).username
                    def dbPassword = new groovy.json.JsonSlurper().parseText(dbCredentials).password
                    def dbHost = new groovy.json.JsonSlurper().parseText(dbCredentials).host
                    def dbPort = new groovy.json.JsonSlurper().parseText(dbCredentials).port
                    def dbName = new groovy.json.JsonSlurper().parseText(dbCredentials).dbname

                    // Construct DATABASE_URL for Next.js application
                    def databaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"

                    // Update ECS service with new image and environment variables
                    sh """
                    aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${ECS_SERVICE_NAME} --force-new-deployment \
                    --task-definition $(aws ecs describe-task-definition --task-definition ${ECS_SERVICE_NAME} --query 'taskDefinition.taskDefinitionArn' --output text) \
                    --container-overrides '[{"name":"${ECR_REPO_NAME}","environment":[{"name":"DATABASE_URL","value":"${databaseUrl}"}]}]' \
                    --region ${AWS_REGION}
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
