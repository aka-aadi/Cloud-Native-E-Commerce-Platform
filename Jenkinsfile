pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-ecr-registry-url'
        IMAGE_NAME = 'legato-marketplace'
        AWS_REGION = 'ap-south-1'
        ECS_CLUSTER = 'legato-cluster'
        ECS_SERVICE = 'legato-service'
        TASK_DEFINITION = 'legato-task-definition'
        S3_BUCKET = 'legato-assets'
        RDS_INSTANCE = 'legato-db'
        CLOUDFRONT_DISTRIBUTION_ID = 'your-cloudfront-distribution-id'
        DEPLOYMENT_WEBHOOK_URL = 'your-deployment-webhook-url'
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
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
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
                        sh 'npm run type-check'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'coverage/junit.xml'
                    publishCoverage adapters: [
                        istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')
                    ]
                }
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level moderate'
                // Add additional security scanning tools here
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${IMAGE_NAME}:${BUILD_TAG}")
                    env.DOCKER_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${BUILD_TAG}"
                }
            }
        }
        
        stage('Push to ECR') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
                        docker tag ${IMAGE_NAME}:${BUILD_TAG} ${DOCKER_IMAGE}
                        docker push ${DOCKER_IMAGE}
                    """
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh """
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER}-staging \
                            --service ${ECS_SERVICE}-staging \
                            --force-new-deployment \
                            --region ${AWS_REGION}
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Update task definition with new image
                    sh """
                        TASK_DEFINITION_ARN=\$(aws ecs describe-task-definition \
                            --task-definition ${TASK_DEFINITION} \
                            --region ${AWS_REGION} \
                            --query 'taskDefinition.taskDefinitionArn' \
                            --output text)
                        
                        NEW_TASK_DEFINITION=\$(aws ecs describe-task-definition \
                            --task-definition ${TASK_DEFINITION} \
                            --region ${AWS_REGION} \
                            --query 'taskDefinition' \
                            --output json | jq --arg IMAGE "${DOCKER_IMAGE}" \
                            '.containerDefinitions[0].image = \$IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.placementConstraints) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
                        
                        echo "\$NEW_TASK_DEFINITION" > new-task-definition.json
                        
                        aws ecs register-task-definition \
                            --cli-input-json file://new-task-definition.json \
                            --region ${AWS_REGION}
                        
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE} \
                            --task-definition ${TASK_DEFINITION} \
                            --region ${AWS_REGION}
                    """
                }
            }
        }
        
        stage('Health Check') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'production' : 'staging'
                    def healthUrl = env.BRANCH_NAME == 'main' ? 
                        'https://legato.com/api/health' : 
                        'https://staging.legato.com/api/health'
                    
                    timeout(time: 5, unit: 'MINUTES') {
                        waitUntil {
                            script {
                                def response = sh(
                                    script: "curl -s -o /dev/null -w '%{http_code}' ${healthUrl}",
                                    returnStdout: true
                                ).trim()
                                return response == '200'
                            }
                        }
                    }
                    
                    echo "✅ ${environment} deployment successful and healthy!"
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
            script {
                if (env.BRANCH_NAME == 'main') {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "✅ Legato Production Deployment Successful!\nBuild: ${BUILD_TAG}\nCommit: ${GIT_COMMIT_SHORT}"
                    )
                }
            }
        }
        
        failure {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ Legato Deployment Failed!\nBranch: ${BRANCH_NAME}\nBuild: ${BUILD_TAG}\nCommit: ${GIT_COMMIT_SHORT}"
                )
            }
        }
    }
}
