# 🎮 Game Wallet API

![Go](https://img.shields.io/badge/Go-1.25-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Gin](https://img.shields.io/badge/Gin-Framework-success)
![SQLC](https://img.shields.io/badge/SQLC-TypeSafe-orange)
![Status](https://img.shields.io/badge/status-active-brightgreen)

A backend service that simulates an in-game virtual wallet system.

This project demonstrates production-oriented backend practices such as database transactions, row-level locking, concurrent transaction handling, and secure authentication using **Go**, **Gin**, **PostgreSQL**, and **SQLC**.

---

# ✨ Features

## Authentication

- ✅ Player Registration
- ✅ Player Login
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)

## Wallet

- ✅ Create Wallet
- ✅ Deposit
- ✅ Transfer
- ✅ Transaction History

## Database

- ✅ PostgreSQL
- ✅ SQLC
- ✅ Database Migration
- ✅ ACID Transactions
- ✅ Row-level Locking
- ✅ Concurrent-safe Transfers

## DevOps

- ✅ Docker
- ✅ Docker Compose

## Testing

- ✅ Unit Tests
- ✅ Concurrency Tests

# 🏗 Architecture

```text
Client
   │
   ▼
REST API (Gin)
   │
   ▼
JWT Middleware
   │
   ▼
Handlers
   │
   ▼
Store (Transaction Layer)
   │
   ▼
SQLC
   │
   ▼
PostgreSQL
```

# 🛠 Tech Stack

| Technology     | Description                  |
|----------------|------------------------------|
| Go             | Programming Language         |
| Gin            | HTTP Web Framework           |
| PostgreSQL     | Relational Database          |
| SQLC           | Type-safe SQL Code Generator |
| PGX            | PostgreSQL Driver            |
| Golang-Migrate | Database Migration           |
| Docker Compose | Multi-container orchestration|
| Bcrypt         | Password Hashing             |
| Testify        | Unit Testing                 |
| JWT            | Authentication               |
| Docker         | Containerization             |
---

# 📁 Project Structure

```text
.
├── api/
├── config/
├── internal/
│   └── db/
│       ├── migrations/
│       ├── query/
│       └── sqlc/
├── token/
├── util/
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── go.mod
├── app.env.example
└── main.go
```

---

# 🐳 Run with Docker

This project is fully containerized using Docker Compose.

### Services

- Backend API
- PostgreSQL

### Start

```bash
docker compose up --build
```

The application will be available at:

- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5433

### Stop

```bash
docker compose down
```

---

# 🚀 Getting Started

## 1. Clone the project

```bash
git clone https://github.com/phambaoviet/game-wallet-api.git
cd game-wallet-api
```

---

## 2. Configure Environment

Copy the example environment file:

```bash
cp app.env.example app.docker.env
```

Then update the configuration if needed:

```env
DB_DRIVER=postgres

DB_SOURCE=postgresql://root:your_password@db:5432/game_wallet_db?sslmode=disable

SERVER_ADDRESS=0.0.0.0:8080

TOKEN_KEY=your_secret_key

ACCESS_TOKEN_DURATION=15m
```
---

## 3. Start Docker Services

```bash
docker compose up --build
```

---

## 4. Run Database Migrations

```bash
make migrate-up
```

This command creates all required database tables.

---

## 5. Access the Application

After the containers are running:

- Backend API: http://localhost:8080
- PostgreSQL: localhost:5433

---

## 6. Run Unit Tests

```bash
make test
```

# 🌐 REST API

## Player

| Method | Endpoint         | Description |
|--------|------------------|-------------|
| POST   | `/players`       | Register a new player |
| POST   | `/players/login` | Login and receive a JWT token. |
| GET    | `/players/me`    | Get the current authenticated player. |
| POST   | `/transfers`     | Transfer funds between wallets atomically.|

---

# 🔥 Technical Highlights

This project focuses on backend engineering concepts beyond basic CRUD.
- ACID Transactions
- Atomic Balance Updates
- Concurrent-safe Transfers
- Row-level Locking (`FOR UPDATE`)
- SQLC Generated Queries
- Dockerized Deployment
- JWT Authentication
- Password Hashing

---

# 🗄 Database

Current database tables:

- `players`
- `wallets`
- `wallet_transactions`

Relationships:

```text
players
    │
    │ 1 : 1
    ▼
wallets
    │
    │ 1 : n
    ▼
wallet_transactions
```
---
# 📌 Project Status

## Completed

- Database Design
- SQLC Integration
- Transaction Layer
- JWT Authentication
- REST API
- Docker
- Unit Testing

## Next Milestones

- Inventory Service
- Item Shop
- Swagger/OpenAPI
- GitHub Actions
- Frontend (React)

---
# 👨‍💻 Author

**Pham Bao Viet**

GitHub: https://github.com/phambaoviet

# 📄 License

This project is for educational and portfolio purposes.