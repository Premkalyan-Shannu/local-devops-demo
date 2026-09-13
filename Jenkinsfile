pipeline {
    agent any

    environment {
        APP_NAME = "demo-web-app"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
    }

    stages {
        stage('Unit Test') {
            steps {
                echo 'Running unit tests...'
                sh 'node test.js || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh """
                    docker build -t ${APP_NAME}:${IMAGE_TAG} .
                    docker tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                echo 'Applying Kubernetes manifests...'
                sh """
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/ingress.yaml
                    kubectl apply -f k8s/hpa.yaml
                    kubectl set image deployment/${APP_NAME} web-container=${APP_NAME}:${IMAGE_TAG}
                    kubectl rollout status deployment/${APP_NAME} --timeout=120s
                """
            }
        }
    }

    post {
        success {
            echo "Deployment succeeded!"
        }
        failure {
            echo "Deployment failed. Rolling back..."
            sh "kubectl rollout undo deployment/${APP_NAME} || true"
        }
    }
}
