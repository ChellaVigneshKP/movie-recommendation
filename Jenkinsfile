pipeline {
    agent any

    tools {
        maven 'Maven 3.9.9'
        jdk 'JDK 21'
        nodejs 'NodeJS 23'
    }

    options{
        buildDiscarder(logRotator(
            daysToKeepStr: '10',
            numToKeepStr: '10'
        ))
    }

    environment {
        FRONTEND_DIR = 'frontend'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Clone Repository') {
            steps {
                script {
                    checkout scm
                    echo 'Repository cloned successfully!'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    dir(FRONTEND_DIR) {
                        bat 'npm install'
                    }
                    echo 'Dependencies installed successfully!'
                }
            }
        }

        stage('Build & Test Frontend') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            dir(FRONTEND_DIR) {
                                bat 'npm run build'
                            }
                            echo 'Frontend build completed!'
                        }
                    }
                }

                stage('Lint Frontend') {
                    steps {
                        script {
                            dir(FRONTEND_DIR) {
                                bat 'npm run lint'
                            }
                            echo 'Frontend linting completed!'
                        }
                    }
                }

                stage('Run Frontend Tests') {
                    steps {
                        script {
                            dir(FRONTEND_DIR) {
                                bat 'npm run coverage'
                            }
                            echo 'Frontend tests executed successfully!'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    dir(FRONTEND_DIR) {
                        withCredentials([string(credentialsId: 'SonarQube-Token', variable: 'SONARQUBE_TOKEN')]) {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                timeout(time: 10, unit: 'MINUTES') {
                                    bat 'npm run sonar:scan -- -Dsonar.token=%SONARQUBE_TOKEN%'
                                }
                            }
                        }
                    }
                    echo 'SonarQube analysis completed!'
                }
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for details.'
        }
        always {
            cleanWs()
            echo 'Workspace cleaned after build.'
        }
    }
}
