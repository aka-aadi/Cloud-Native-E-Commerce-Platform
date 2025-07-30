pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'your-dockerhub-username/legato'
        AWS_REGION = 'ap-south-1'
        ECR_REPOSITORY = 'legato'
        ECS_CLUSTER = 'legato-cluster'
        ECS_SERVICE = 'legato-service'
        TASK_DEFINITION = 'legato-task'
        S3_BUCKET = 'legato-assets'
        RDS_INSTANCE = 'legato-db'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        npm ci --only=production
                        npm audit --audit-level=high
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            sh 'npm run test:unit'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results/unit/*.xml'
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        script {
                            sh 'npm run test:integration'
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results/integration/*.xml'
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        script {
                            sh 'npm audit --audit-level=moderate'
                            sh 'npx snyk test --severity-threshold=high'
                        }
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    sh '''
                        export NODE_ENV=production
                        npm run build
                        npm run export
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${DOCKER_HUB_REPO}:${BUILD_TAG}")
                    
                    // Tag with latest
                    sh "docker tag ${DOCKER_HUB_REPO}:${BUILD_TAG} ${DOCKER_HUB_REPO}:latest"
                    
                    // Push to Docker Hub
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        image.push("${BUILD_TAG}")
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                script {
                    sh '''
                        # Login to ECR
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                        
                        # Tag and push to ECR
                        docker tag ${DOCKER_HUB_REPO}:${BUILD_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${BUILD_TAG}
                        docker tag ${DOCKER_HUB_REPO}:${BUILD_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
                        
                        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${BUILD_TAG}
                        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
                    '''
                }
            }
        }
        
        stage('Database Migration') {
            steps {
                script {
                    sh '''
                        # Run database migrations
                        export DATABASE_URL="${RDS_CONNECTION_STRING}"
                        npm run db:migrate
                        npm run db:seed:prod
                    '''
                }
            }
        }
        
        stage('Deploy to ECS') {
            steps {
                script {
                    sh '''
                        # Update task definition with new image
                        aws ecs describe-task-definition --task-definition ${TASK_DEFINITION} --query taskDefinition > task-def.json
                        
                        # Update image URI in task definition
                        jq --arg IMAGE "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${BUILD_TAG}" \
                           '.containerDefinitions[0].image = $IMAGE' task-def.json > updated-task-def.json
                        
                        # Register new task definition
                        aws ecs register-task-definition --cli-input-json file://updated-task-def.json
                        
                        # Update ECS service
                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE} \
                            --task-definition ${TASK_DEFINITION}:${BUILD_NUMBER} \
                            --region ${AWS_REGION}
                        
                        # Wait for deployment to complete
                        aws ecs wait services-stable \
                            --cluster ${ECS_CLUSTER} \
                            --services ${ECS_SERVICE} \
                            --region ${AWS_REGION}
                    '''
                }
            }
        }
        
        stage('Upload Assets to S3') {
            steps {
                script {
                    sh '''
                        # Sync static assets to S3
                        aws s3 sync ./public s3://${S3_BUCKET}/static/ --delete --cache-control max-age=31536000
                        aws s3 sync ./.next/static s3://${S3_BUCKET}/_next/static/ --delete --cache-control max-age=31536000
                        
                        # Invalidate CloudFront cache
                        aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        # Wait for the service to be healthy
                        sleep 60
                        
                        # Get the load balancer URL
                        LOAD_BALANCER_URL=$(aws elbv2 describe-load-balancers \
                            --names legato-alb \
                            --query 'LoadBalancers[0].DNSName' \
                            --output text \
                            --region ${AWS_REGION})
                        
                        # Health check with retry
                        for i in {1..10}; do
                            if curl -f -s "http://${LOAD_BALANCER_URL}/api/health"; then
                                echo "Health check passed"
                                break
                            else
                                echo "Health check failed, attempt $i/10"
                                sleep 30
                            fi
                            
                            if [ $i -eq 10 ]; then
                                echo "Health check failed after 10 attempts"
                                exit 1
                            fi
                        done
                        
                        # Performance test
                        curl -w "@curl-format.txt" -o /dev/null -s "http://${LOAD_BALANCER_URL}/"
                    '''
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                script {
                    sh '''
                        # Run smoke tests against production
                        export TEST_URL="http://${LOAD_BALANCER_URL}"
                        npm run test:smoke
                    '''
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results/smoke/*.xml'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up
            sh 'docker system prune -f'
            cleanWs()
        }
        success {
            script {
                // Send success notification
                slackSend(
                    channel: '#deployments',
                    color: 'good',
                    message: "✅ Legato deployment successful! Build: ${BUILD_TAG}\nURL: http://${LOAD_BALANCER_URL}"
                )
                
                // Update deployment status
                sh '''
                    curl -X POST "${DEPLOYMENT_WEBHOOK_URL}" \
                         -H "Content-Type: application/json" \
                         -d "{\"status\": \"success\", \"build\": \"${BUILD_TAG}\", \"url\": \"http://${LOAD_BALANCER_URL}\"}"
                '''
            }
        }
        failure {
            script {
                // Send failure notification
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ Legato deployment failed! Build: ${BUILD_TAG}\nCheck: ${BUILD_URL}"
                )
                
                // Rollback on failure
                sh '''
                    echo "Rolling back to previous version..."
                    aws ecs update-service \
                        --cluster ${ECS_CLUSTER} \
                        --service ${ECS_SERVICE} \
                        --task-definition ${TASK_DEFINITION}:$((BUILD_NUMBER-1)) \
                        --region ${AWS_REGION}
                '''
            }
        }
        unstable {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'warning',
                    message: "⚠️ Legato deployment unstable! Build: ${BUILD_TAG}\nSome tests failed but deployment continued."
                )
            }
        }
    }
}
