pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'server/docker-compose.yml'
        IMAGE_NAMESPACE = 'gobikar'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker compose -f ${COMPOSE_FILE} build
                '''
            }
        }

        stage('Run Containers') {
            steps {
                sh '''
                docker compose -f ${COMPOSE_FILE} up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                for i in {1..20}; do
                  if curl -s http://localhost:5000/health > /dev/null; then
                    echo "App is running ✅"
                    exit 0
                  fi
                  echo "Waiting..."
                  sleep 5
                done
                echo "App failed ❌"
                exit 1
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin

                    docker tag allcollegeevents-server:latest gobikar/allcollegeevents-server:latest
                    docker tag allcollegeevents-client:latest gobikar/allcollegeevents-client:latest

                    docker push gobikar/allcollegeevents-server:latest
                    docker push gobikar/allcollegeevents-client:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
            docker compose -f ${COMPOSE_FILE} down -v
            '''
        }
    }
}
