# Development Guide

## Prerequisites
-   Node.js (v18+)
-   npm (v9+)
-   Docker (optional, for containerized testing)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/foofoo-2/pushstreak.git
    cd pushstreak
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Running Locally

Because the project consists of a separate frontend (Vite) and backend (Express), you typically run them in parallel for development to enable Hot Module Replacement (HMR).

### 1. Development Mode (Recommended)
This runs the backend on port **3001** and the frontend on port **5173**.

```bash
# Terminal 1: Start the Backend API
npm start

# Terminal 2: Start the Frontend Dev Server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### 2. Production Simulation
You can build the frontend and serve it statically via the backend (single port).

```bash
# Build the frontend to /dist
npm run build

# Start the server (serves API + static files)
npm start
```
Open [http://localhost:3001](http://localhost:3001).

## Docker

### Build and Run with Docker Compose
```bash
docker compose -f deploy/docker-compose.yml up --build -d
```
The app will be available at `http://localhost:3001`.

## Database
The SQLite database file `pushstreak.db` is created in the project root.
-   In Docker, it is mapped to the `data` volume (see `deploy/docker-compose.yml`).
-   To reset the database, simply delete `pushstreak.db` and restart the server.

## Deployment
Deployment is handled via GitHub Actions.
1.  Push changes to `main`.
2.  The workflow builds a Docker image and pushes it to GitHub Container Registry (GHCR).
3.  On your server, pull the new image and restart:
    ```bash
    docker compose -f deploy/docker-compose.yml pull
    docker compose -f deploy/docker-compose.yml up -d
    ```
