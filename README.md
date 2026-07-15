# 🎮 Game Wallet API

![Go](https://img.shields.io/badge/Go-1.24-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Gin](https://img.shields.io/badge/Gin-Framework-success)
![SQLC](https://img.shields.io/badge/SQLC-TypeSafe-orange)
![Status](https://img.shields.io/badge/status-in--progress-yellow)

A backend service that simulates an in-game virtual wallet system.

This project demonstrates production-oriented backend practices such as database transactions, row-level locking, concurrent transaction handling, and secure authentication using **Go**, **Gin**, **PostgreSQL**, and **SQLC**.

---

# ✨ Features

### Authentication

- ✅ Player registration
- ✅ Password hashing with bcrypt

### Wallet

- ✅ Deposit transaction
- ✅ Money transfer transaction

### Database

- ✅ PostgreSQL
- ✅ SQLC type-safe queries
- ✅ Database migrations

### Reliability

- ✅ ACID transactions
- ✅ Atomic balance updates
- ✅ Row-level locking (`FOR UPDATE`)
- ✅ Concurrent transfer tests
- ✅ Unit tests

### Planned Features

- 🔄 Player login
- 🔄 JWT Authentication
- 🔄 Wallet REST API
- 🔄 Transaction history
- 🔄 Item Shop
- 🔄 Inventory System
- 🔄 Docker image
- 🔄 GitHub Actions CI
- 🔄 Swagger/OpenAPI
- 🔄 Role-based Authorization

---

# 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| Go | Programming Language |
| Gin | HTTP Web Framework |
| PostgreSQL | Relational Database |
| SQLC | Type-safe SQL Code Generator |
| PGX | PostgreSQL Driver |
| Golang-Migrate | Database Migration |
| Docker Compose | Local Development |
| Bcrypt | Password Hashing |
| Testify | Unit Testing |

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
├── Makefile
├── docker-compose.yml
├── go.mod
├── sqlc.yaml
└── main.go
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/phambaoviet/game-wallet-api.git

cd game-wallet-api
```

---

## Start PostgreSQL

```bash
docker compose up -d
```

---

## Configure environment variables

Create a `.env` file.

```env
DATABASE_URL=postgres://username:password@localhost:5432/game_wallet?sslmode=disable
```

---

## Run database migrations

```bash
make migrate-up
```

---

## Generate SQLC code

```bash
make sqlc
```

---

## Run the server

```bash
make server
```

The server starts at

```text
http://localhost:8080
```

---

# 🧪 Testing

## Run tests

```bash
make test
```

Current unit tests cover:

### Transfer

- ✅ Successful transfer
- ✅ Insufficient balance
- ✅ Sender wallet not found
- ✅ Receiver wallet not found
- ✅ Concurrent transfers

### Deposit

- ✅ Successful deposit
- ✅ Invalid wallet ID
- ✅ Invalid deposit amount

---

# 🌐 Current API

## Player

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/players` | Register a new player |

---

# 🔥 Technical Highlights

This project focuses on backend engineering concepts beyond basic CRUD.

### Transactions

- ACID transactions
- Automatic rollback on failure
- Atomic balance updates

### Concurrency

- Row-level locking using `FOR UPDATE`
- Concurrent transfer tests

### Database

- SQLC generated queries
- Type-safe SQL execution
- PostgreSQL migrations

### Security

- Password hashing with bcrypt

---

# 🗄 Database

Current database tables:

- `players`
- `wallets`
- `wallet_transactions`

Relationships:

```text
players (1) -- (1) wallets
wallets (1) -- (*) wallet_transactions
```
---
# 📌 Project Status
🚧 **In Progress**

Current progress:

- ✅ Database Design
- ✅ SQLC Integration
- ✅ Store Layer
- ✅ Transaction Logic
- ✅ Unit Tests
- ✅ Password Hashing
- 🔄 REST API (Gin)
- 🔄 JWT Authentication
- 🔄 Inventory System
- 🔄 Item Shop
- 🔄 Docker
- 🔄 GitHub Actions

---
# 👨‍💻 Author

**Pham Bao Viet**

GitHub: https://github.com/phambaoviet