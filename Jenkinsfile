pipeline {
    agent any

    tools {
        Maven 'Maven 3.9.9'
        JDK 'JDK 21'
        SonarQubeScanner 'SonarScanner'
        NodeJS 'NodeJS 23'
    }

    environment {
        SONARQUBE_SCANNER_PATH = tool name: 'SonarScanner', type: 'ToolType'
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                script {
                    dir('frontend') {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    dir('frontend') {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('sonar-server') {
                        bat "\"${SONARQUBE_SCANNER_PATH}/bin/sonar-scanner\""
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
