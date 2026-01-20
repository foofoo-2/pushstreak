# PushStreak 

> **Day-of-Year Push-Up Challenge Tracker**

PushStreak is a progressive web application designed to help you track a daily push-up challenge. The daily target reps increase with the day of the year (e.g., Jan 1st = 1 point, Dec 31st = 365/366 points). It features a **points system** to normalize different push-up variations (e.g., knee push-ups vs. standard floor push-ups), enabling accessibility and progression for all fitness levels.

## Features
-   **Dynamic Daily Goal**: Targets automatically adjust based on the day of the year.
-   **Points System**: Weighted variations (Wall, Incline, Knees, Standard, Decline).
-   **Flexible Logging**: Log sets with uniform reps or individual counts.
-   **Progress Tracking**: Dashboard, Calendar, and Stats views.
-   **Data Ownership**: Export and Import your data at any time (JSON).
-   **PWA**: Installable on mobile devices.

## Documentation
-   [**Architecture**](docs/ARCHITECTURE.md): System design, tech stack, and data flow.
-   [**Development**](docs/DEVELOPMENT.md): Setup, installation, and running locally.
-   [**Product Requirements**](docs/PRD.md): Detailed feature specifications.

## Quick Start

1.  **Install**: `npm install`
2.  **Run Backend**: `npm start` (port 3001)
3.  **Run Frontend**: `npm run dev` (port 5173)

For detailed instructions, see the [Development Guide](docs/DEVELOPMENT.md).

## Deployment
This project is containerized with Docker and supports automated deployment via GitHub Actions to GHCR.
