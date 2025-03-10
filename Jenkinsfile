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
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[url: 'https://github.com/ChellaVigneshKP/movie-recommendation.git']],
                        extensions: [[$class: 'CloneOption', depth: 1]]
                    ])
                }
            }
        }

        stage('Frontend Build & Test') {
            parallel {
                stage('Install Dependencies') {
                    steps {
                        dir('frontend') {
                            retry(3) {
                                sh 'npm install'
                            }
                        }
                    }
                }
                stage('Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Test') {
                    steps {
                        dir('frontend') {
                            sh 'npm run coverage'
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
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

        stage('Free Memory') {
            steps {
                script {
                    try {
                        bat 'taskkill /F /IM node.exe /T'
                        bat 'taskkill /F /IM java.exe /T'
                    } catch (Exception e) {
                        echo 'No running processes to kill.'
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
