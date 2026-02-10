# Digital Issue Tracking Dashboard

This project is a full-stack issue tracking dashboard built with React (Client) and Node.js/Express (Server), using MongoDB as the database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Docker](https://www.docker.com/) & Docker Compose
- [MongoDB](https://www.mongodb.com/) (if running locally without Docker)

## Getting Started

### Option 1: Development Mode (Local)

Run the client and server separately for development with hot-reloading.

1.  **Server Setup**
    ```bash
    cd server
    npm install
    # Ensure you have a .env file or local MongoDB running
    npm run dev
    ```

2.  **Client Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    The client runs on `http://localhost:5173`. API requests are proxied not `http://localhost:5000`.

### Option 2: Production Mode (Docker)

Run the entire stack (Client + Server + Database) using Docker Compose.

1.  **Build and Run**
    ```bash
    docker-compose up --build
    ```

2.  **Access Application**
    -   Frontend: [http://localhost](http://localhost)
    -   API: Accessible internally via Nginx proxy at `/api`

## Architecture

-   **Client**: React, Vite, Tailwind CSS. Served via Nginx in executing.
-   **Server**: Node.js, Express, Mongoose.
-   **Database**: MongoDB.
-   **Reverse Proxy**: Nginx (handles routing and API proxying in Docker).

## CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml` to build and test the application on push/pull requests.
