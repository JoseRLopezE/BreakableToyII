# BreakableToyII: Full-Stack Flight Search App

## Overview
BreakableToyII is a full-stack, Dockerized flight search application that demonstrates modern web development, API integration, and cloud-native best practices. It features:

- **Backend:** Java 17+, Spring Boot REST API (no Amadeus SDK, pure REST)
- **Frontend:** React (TypeScript) SPA for searching and displaying flights
- **Amadeus API Integration:** Real-time flight offers, airport/city lookup, airline info, and price breakdowns
- **Dockerized:** Easy local or cloud deployment with Docker Compose

---

## Features
- **Flight Search:** Search for flights by city/airport, date, and passengers
- **Airport/City Autocomplete:** Fast lookup for IATA codes and names
- **Amenities & Airlines:** Display airline and amenities info
- **Fee Calculation:** Handles Amadeus sandbox limitation (fees always zero) by injecting "Estimated Fees" (difference between total and base)
- **Modern UI:** Clean, user-friendly React interface
- **Developer Friendly:** Easy onboarding, troubleshooting, and extensibility

---

## Architecture
```
[ React Frontend ]  <---->  [ Spring Boot Backend ]  <---->  [ Amadeus REST API ]
```
- **Frontend:** Communicates only with backend (no direct Amadeus calls)
- **Backend:** Proxies and enriches Amadeus API responses, handles CORS, fee logic, and error handling
- **Docker Compose:** Orchestrates both services with shared networking and environment

---

## Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose

---

## Setup & Run

### 1. Environment Variables
Set these in your shell or `.env` file (see `docker-compose.yml` for reference):
- `AMADEUS_CLIENT_ID` (required)
- `AMADEUS_CLIENT_SECRET` (required)
- `REACT_APP_API_BASE_URL` (frontend, defaults to `/api`)

### 2. Local Development
#### Backend
```
cd backend
./gradlew bootRun
```
#### Frontend
```
cd frontend
npm install
npm start
```

### 3. Docker Compose (Recommended)
```
docker-compose up --build
```
- Access frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

---

## Key Endpoints (Backend)
- `GET /api/flights` — Search for flight offers
- `GET /api/airports` — Airport/city autocomplete
- `GET /api/airline` — Airline info lookup
- `POST /api/price-offer` — Price/fee breakdown for a flight offer

---

## Amadeus API & Fee Logic
- **Sandbox Limitation:** Amadeus sandbox always returns zero/empty fees
- **Solution:** Backend injects `ESTIMATED_FEES` (total - base) if real fees are missing/zero
- **Frontend:** Clearly displays "Estimated Fees" when applicable

---

## Troubleshooting & Developer Notes
- **Certificates:** If behind Zscaler or similar, Dockerfiles and Compose handle cert injection
- **Networking:** Docker Compose sets up correct service-to-service networking
- **Logs:** Use `docker-compose logs backend` or `frontend` for debugging
- **API Testing:** Use `curl` or Postman against backend endpoints
- **Extending:** Add new endpoints or UI features as needed; see `AmadeusService.java` and React components

---

## Demo & Presentation Tips
- Show both local and Docker Compose workflows
- Highlight fee estimation logic and Amadeus API integration
- Discuss challenges (sandbox, certs, networking) and solutions
- Point to code structure and onboarding docs

---

## Folder Structure
- `backend/` — Spring Boot REST API
- `frontend/` — React app
- `docker-compose.yml` — Orchestrates both services

---

## License
MIT
