pipeline {
    agent any
    stages {
        stage("Checkout") {
            steps {
                checkout scm
            }
        }
        stage("Deploy to Hostinger") {
            steps {
                sshagent(credentials: ["dms-hostinger-deploy-key"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no dms-deploy@187.124.99.1 "
                            cd /home/dms-deploy/DMS-Frontend &&
                            git pull origin main &&
                            docker build --no-cache --build-arg VITE_API_URL=http://187.124.99.1:9107 -t dms-frontend . &&
                            docker stop dms-frontend || true &&
                            docker rm dms-frontend || true &&
                            docker run -d --name dms-frontend --restart unless-stopped -p 9106:80 dms-frontend
                        "
                    """
                }
            }
        }
        stage("Verify") {
            steps {
                sshagent(credentials: ["dms-hostinger-deploy-key"]) {
                    sh """
                        sleep 5
                        ssh -o StrictHostKeyChecking=no dms-deploy@187.124.99.1 "
                            curl -s -o /dev/null -w \\"Frontend: %{http_code}\\n\\" http://127.0.0.1:9106
                        "
                    """
                }
            }
        }
    }
}
