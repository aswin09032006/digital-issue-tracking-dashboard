# Architecture & Design Document

## 1. Technology Stack & Justification

We selected the **MERN Stack** (MongoDB, Express.js, React, Node.js) for the Digital Issue Tracking Dashboard.

-   **MongoDB (Database)**: A NoSQL database that offers flexibility for evolving data schemas (issues, comments, notifications). Its document-oriented structure maps directly to JSON, simplifying the data flow.
-   **Express.js (Backend Framework)**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies API creation and middleware management.
-   **React (Frontend Library)**: Facilitates the creation of interactive UIs with reusable components (Kanban Board, Issue Cards). Its Virtual DOM ensures high performance, and the ecosystem (Vite, Tailwind) accelerates development.
-   **Node.js (Runtime)**: Allows using JavaScript on both client and server, unifying the language stack and enabling high concurrency via its event-driven, non-blocking I/O model.
-   **Socket.io (Real-Time)**: Chosen over polling for its low-latency, bi-directional communication capabilities, essential for the live Kanban board and instant notifications.

### System Flow Diagram

```mermaid
graph TD
    User[User Client] <-->|HTTP/WebSocket| Nginx[Nginx Reverse Proxy]
    Nginx <-->|Proxy /api| Server[Node/Express Server]
    Nginx <-->|Serve Static| Client[React SPA]
    
    subgraph Backend
    Server -- Auth --> JWT[JWT Service]
    Server -- Data --> DB[(MongoDB Database)]
    Server -- Events --> Socket[Socket.io Manager]
    end
    
    subgraph Frontend
    Client -- State --> Context[Auth/Theme/Notification Context]
    Client -- Render --> UI[Pages & Components]
    end
```

## 2. Database Schema & Entity Design

### ER Diagram

```mermaid
erDiagram
    USER ||--o{ ISSUE : "reports"
    USER ||--o{ ISSUE : "assigned_to"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ NOTIFICATION : "receives"
    
    ISSUE ||--o{ COMMENT : "contains"
    ISSUE ||--o{ NOTIFICATION : "triggers"

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role "admin/user"
        boolean notifications
    }

    ISSUE {
        ObjectId _id PK
        string title
        string description
        string priority "Low/Medium/High"
        string status "Open/In Progress/Resolved"
        string category
        ObjectId createdBy FK
        string assignedTo "stored as name (legacy) or ID"
        date createdAt
        date updatedAt
    }

    COMMENT {
        string user
        string text
        date postedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string text
        ObjectId issue FK
        boolean isRead
        date createdAt
    }
```

## 3. Deployment Architecture

The application is containerized using **Docker**.
-   **Client Container**: Builds the React app and serves it via Nginx.
-   **Server Container**: Runs the Node.js API.
-   **Docker Compose**: Orchestrates the services, including the MongoDB instance (or connection to cloud Atlas).
