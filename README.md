# Kubernetes Todo App

I submitted this project in 2024 as part of the Devops with Kubernetes course from the university of Helsinki. The project requirements specified what the app had to do but not how. So I repurposed an old Frontend Mentor project I did for the frontend of the todo list. I also used this project as my first foray into Golang development. The efficiency of Golang made it too tempting not to try it.

## Gitops

In line with the gitops tradition, I have the source code in this directory and the kubernetes manifests in a separate repository. This creates a separation between application development and deployment. Pushes to main trigger a deployment to the staging namespace, while only tagged versions trigger deployments to the production environment. Using ArgoCD, the cluster pulls in updates from the deployment repo. This is more secure than having various people with admin access to the cluster. Only those with push permissions to the deployment repo can update the cluster.

## Technologies used

### Frontend

- React
- Golang (serve static files)

### API

Golang (Gin framework)

### Database

PostgreSQL (Stateful set)

### Message Queue

NATS

### Service mesh

Linkerd
