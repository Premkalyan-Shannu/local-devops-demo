pipeline {
    agent any

    environment {
        APP_NAME = "demo-web-app"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
    }

    stages {
        stage('Unit Test') {
            steps {
                sh 'echo "Running unit test..."'
                sh 'node test.js || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    echo "Building Docker image ${APP_NAME}:${IMAGE_TAG}..."
                    docker build -t ${APP_NAME}:${IMAGE_TAG} .
                    docker tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest

                    echo "Saving and importing image into Minikube containerd cache..."
                    docker save -o /tmp/${APP_NAME}-${IMAGE_TAG}.tar ${APP_NAME}:${IMAGE_TAG}
                    docker cp /tmp/${APP_NAME}-${IMAGE_TAG}.tar minikube:/tmp/app.tar
                    docker exec minikube ctr -n k8s.io images import /tmp/app.tar
                    rm -f /tmp/${APP_NAME}-${IMAGE_TAG}.tar
                    docker exec minikube rm -f /tmp/app.tar
                """
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
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
            echo "Pipeline and Deployment succeeded!"
        }
        failure {
            echo "Deployment failed. Rolling back..."
            sh "kubectl rollout undo deployment/${APP_NAME} || true"
        }
    }
}