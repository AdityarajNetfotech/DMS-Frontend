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
                    withCredentials([
                        usernamePassword(credentialsId: "dms-github-credentials", usernameVariable: "GH_USER", passwordVariable: "GH_PAT")
                    ]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no dms-deploy@187.124.99.1 "
                                if [ -d /home/dms-deploy/DMS-Frontend/.git ]; then
                                    cd /home/dms-deploy/DMS-Frontend && git pull origin main
                                else
                                    git clone https://${GH_USER}:${GH_PAT}@github.com/AdityarajNetfotech/DMS-Frontend.git /home/dms-deploy/DMS-Frontend
                                fi &&
                                cd /home/dms-deploy/DMS-Frontend &&
                                docker build --no-cache --build-arg VITE_API_URL=https://dms.intellinexa.in -t dms-frontend . &&
                                docker stop dms-frontend || true &&
                                docker rm dms-frontend || true &&
                                docker run -d --name dms-frontend --restart unless-stopped -p 9106:80 dms-frontend
                            "
                        """
                    }
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
