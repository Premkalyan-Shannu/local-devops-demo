pipeline {
    agent any

    environment {
        APP_NAME = "demo-web-app"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        PROJECT_DIR = "/projects/local-devops-demo"
    }

    stages {
        stage('Unit Test') {
            steps {
                echo 'Running tests...'
                sh "node ${PROJECT_DIR}/test.js || true"
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building image...'
                sh """
                    docker build -t ${APP_NAME}:${IMAGE_TAG} ${PROJECT_DIR}
                    docker tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                echo 'Push detected on main branch. Deploying to Minikube...'
                sh """
                    kubectl apply -f ${PROJECT_DIR}/k8s/deployment.yaml
                    kubectl apply -f ${PROJECT_DIR}/k8s/ingress.yaml
                    kubectl apply -f ${PROJECT_DIR}/k8s/hpa.yaml
                    kubectl set image deployment/${APP_NAME} web-container=${APP_NAME}:${IMAGE_TAG}
                    kubectl rollout status deployment/${APP_NAME} --timeout=120s
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline run completed successfully."
        }
        failure {
            echo "Pipeline failed. Rolling back..."
            sh "kubectl rollout undo deployment/${APP_NAME} || true"
        }
    }
}
