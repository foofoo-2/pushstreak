---
description: Initialize Antigravity in the project by scanning the codebase and generating documentation.
---

1.  **Scan the Project Structure**: List all files and directories to understand the layout.
    ```bash
    ls -R
    ```
2.  **Read Key Configuration Files**: Read `package.json`, `tsconfig.json`, `docker-compose.yml`, and any existing `README.md` or `PRD.md`.
3.  **Generate Architecture Documentation**: Create an `ARCHITECTURE.md` file that describes:
    -   High-level system design.
    -   Tech stack (Frontend, Backend, Database).
    -   Key components and their interactions.
    -   Data flow.
4.  **Generate Development Guide**: Create a `DEVELOPMENT.md` file that describes:
    -   Prerequisites (Node version, Docker, etc.).
    -   Installation steps (`npm install`).
    -   Running local development (`npm run dev`, `npm start`).
    -   Building for production (`npm run build`).
    -   Deployment instructions (Docker).
5.  **Update README.md**: Rewrite the root `README.md` to:
    -   Introduce the project clearly.
    -   Link to `ARCHITECTURE.md` and `DEVELOPMENT.md`.
    -   List key features.
    -   Provide quick start commands.
