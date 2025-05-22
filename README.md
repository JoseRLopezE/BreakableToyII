# BreakableToyII

## Overview
This project is a monorepo containing:
- `backend`: Java, Gradle, Spring Boot REST API (proxy to Amadeus REST API, no SDK)
- `frontend`: React (TypeScript) app for flight search and display

## Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose

## Setup & Run

### Backend
```
cd backend
./gradlew bootRun
```

### Frontend
```
cd frontend
npm install
npm start
```

### Docker Compose (Recommended)
```
docker-compose up --build
```

## Folder Structure
- `backend/` - Spring Boot REST API
- `frontend/` - React app

## Notes
- No database required
- All configuration for Amadeus API should be set via environment variables

---

## Docker
- Each service has its own Dockerfile
- Use `docker-compose.yml` at the root to run both services

---

## License
MIT
