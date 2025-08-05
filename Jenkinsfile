pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO_NAME = 'cloud-native-e-commerce-platform'
        AWS_ACCOUNT_ID = '619577151605' // Replace with your AWS Account ID
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
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """

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
                    def dbCredentials = sh(
                        returnStdout: true,
                        script: "aws secretsmanager get-secret-value --secret-id ${DB_SECRET_NAME} --query SecretString --output text --region ${AWS_REGION}"
                    ).trim()

                    // Parse DB credentials (JSON format)
                    def credsJson = new groovy.json.JsonSlurper().parseText(dbCredentials)
                    def dbUser = credsJson.username
                    def dbPassword = credsJson.password
                    def dbHost = credsJson.host
                    def dbPort = credsJson.port
                    def dbName = credsJson.dbname

                    def databaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"

                    // Get current task definition ARN
                    def taskDefArn = sh(
                        returnStdout: true,
                        script: "aws ecs describe-task-definition --task-definition ${ECS_SERVICE_NAME} --query 'taskDefinition.taskDefinitionArn' --output text --region ${AWS_REGION}"
                    ).trim()

                    // Update ECS service
                    sh """
                    aws ecs update-service \
                    --cluster ${ECS_CLUSTER_NAME} \
                    --service ${ECS_SERVICE_NAME} \
                    --force-new-deployment \
                    --task-definition ${taskDefArn} \
                    --region ${AWS_REGION}
                    """

                    // Update container environment variable (optional step, may need ECS task redefinition instead)
                    // This part assumes the task definition already includes environment override capability
                    sh """
                    aws ecs update-service \
                    --cluster ${ECS_CLUSTER_NAME} \
                    --service ${ECS_SERVICE_NAME} \
                    --force-new-deployment \
                    --region ${AWS_REGION} \
                    --cli-input-json '{
                        "service": "${ECS_SERVICE_NAME}",
                        "forceNewDeployment": true,
                        "taskDefinition": "${taskDefArn}",
                        "networkConfiguration": {
                            "awsvpcConfiguration": {
                                "assignPublicIp": "ENABLED",
                                "subnets": [],
                                "securityGroups": []
                            }
                        },
                        "deploymentConfiguration": {
                            "maximumPercent": 200,
                            "minimumHealthyPercent": 100
                        }
                    }'
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
