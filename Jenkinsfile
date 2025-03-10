node {
  stage('SCM') {
    checkout scm
  }
  stage('SonarQube Analysis') {
    def scannerHome = tool 'SonarScanner';
    withSonarQubeEnv('sonar-server') {
      sh "${scannerHome}/bin/sonar-scanner"
    }
  }
}