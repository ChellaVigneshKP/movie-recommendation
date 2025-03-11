pipeline {
    agent any

    tools {
        maven 'Maven 3.9.9'
        jdk 'JDK 21'
        nodejs 'NodeJS 23'
    }

    environment {
        SONARQUBE_SCANNER_PATH = tool 'SonarScanner'
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

        stage('Run Frontend Tests') {
            steps {
                script {
                    dir('frontend') {
                        sh 'npm run coverage'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    dir('frontend') {
                        withSonarQubeEnv('sonar-server') {
                            withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONARQUBE_TOKEN')]) {
                                sh 'npm run sonar:scan -- -Dsonar.token=$SONARQUBE_TOKEN'
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
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
