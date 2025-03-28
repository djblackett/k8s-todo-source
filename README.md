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

Project Overview: React Todo Application with Go Backend

Frontend (React)

Built using React with TypeScript.

Implements a drag-and-drop feature for reordering todo items using react-beautiful-dnd.

State management utilizes React Query (@tanstack/react-query) to handle server state and data fetching.

Supports optimistic UI updates for seamless user interaction, preventing flicker and providing instant feedback when dragging todos.

Uses Redux for managing UI state (such as color modes and data filters).

Provides filtering functionality ("all", "active", "completed") for todos.

UI responds dynamically to user preferences (e.g., dark/light mode).

Web Server (Go)

Serves frontend static assets and may provide additional web services (exact responsibilities [...]).

Likely deployed on Kubernetes infrastructure or similar.

Backend API Server (Go)

Built using the Gin web framework for HTTP request handling.

Database interactions handled by GORM, interfacing with PostgreSQL.

Uses UUIDs (strings) as primary keys for todo items.

Implements CRUD operations: creation, retrieval, updating, deletion of todos.

Provides endpoints to update the order of todos in batch.

Includes detailed logging for error handling and debugging.

Implements transaction handling in database updates to maintain consistency and atomicity.

Publishes events via NATS messaging system upon certain operations (e.g., creating, updating, or deleting a todo).

Development and Deployment

Frontend and backend developed separately, communicating through clearly defined RESTful API endpoints.

Backend may be deployed separately from frontend assets ([exact deployment details here...]).

Infrastructure potentially leverages Kubernetes, ArgoCD, Fly.io, or GitHub Actions for CI/CD pipelines and deployment automation ([confirm or expand as needed]).

Future improvements or pending features include [...].
