# Architecture Overview

## System Context
PushStreak is a progressive web application (PWA) designed to track a daily push-up challenge where the target reps increase with the day of the year. It uses a points system to normalize different push-up variations.

## Tech Stack

### Frontend
-   **Framework**: React 19 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS + Lucide React (Icons)
-   **Routing**: React Router DOM
-   **State Management**: React Hooks (Context API for global settings/variations)

### Backend
-   **Runtime**: Node.js
-   **Server Framework**: Express.js
-   **Database**: SQLite (via `better-sqlite3`)
-   **API**: RESTful JSON API

### Infrastructure
-   **Containerization**: Docker & Docker Compose
-   **CI/CD**: GitHub Actions (Build & Publish to GHCR)
-   **Deployment**: Linux server running Docker Compose

## Key Components

### 1. Client (`src/`)
-   **`components/`**: Reusable UI components (EntryForm, EntryList, Dashboard, Settings).
-   **`hooks/`**: Custom hooks for data fetching and logic (`useDailyEntries`, `useVariations`, `useSettings`).
-   **`api/`**: Axios client setup for communicating with the backend.
-   **`types/`**: Shared TypeScript definitions for domain entities (Entry, Variation, UserSettings).

### 2. Server (`server/`)
-   **`index.js`**: Main entry point.Configures Express, CORS, and API routes.
-   **`db.js`**: Database connection and initialization using `better-sqlite3`. Handles schema creation/migration on startup.
-   **API Routes**:
    -   `/api/entries`: CRUD for daily logs.
    -   `/api/variations`: Management of push-up variations and their point values.
    -   `/api/settings`: Application-wide settings (default reps, etc.).
    -   `/api/import` & `/api/export`: JSON backup and restore functionality.

### 3. Database (`pushstreak.db`)
-   **`entries` table**: Stores daily log entries (sets, reps, time, notes).
-   **`variations` table**: Stores defined exercise types and their point multipliers.
-   **`settings` table**: Key-value store for user preferences.

## Data Flow
1.  User interacts with the React frontend.
2.  Frontend calls API endpoints (e.g., `POST /api/entries`).
3.  Express server initializes a transaction (if needed) using `better-sqlite3`.
4.  Data is persisted to local `pushstreak.db`.
5.  Frontend updates local state/cache to reflect changes.

## Security
-   **Authentication**: Simple token-based authentication (UUID) for administrative actions, currently protected by a simplified login flow.
-   **Environment**: Secrets (like Admin Password) are managed via environment variables.
