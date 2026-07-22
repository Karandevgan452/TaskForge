# 🛠️ TaskForge — Local Setup & Development Guide

This document provides step-by-step instructions for configuring, running, and testing TaskForge on your local development machine.

---

## 📋 Prerequisites

Ensure your system has the following software installed:

1. **Java 21 JDK** (e.g. OpenJDK 21 or Eclipse Temurin)
   - Verify with: `java -version`
2. **Node.js v22+ & npm 10+**
   - Verify with: `node -v` and `npm -v`
3. **Docker Engine & Docker Compose** (Optional, for containerized run)
   - Verify with: `docker --version` and `docker-compose --version`
4. **Git**
   - Verify with: `git --version`

---

## 🚀 Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/TaskForge.git
cd TaskForge

# Install Node.js dependencies (Prisma CLI & client)
npm install
```

---

## ⚙️ Step 2: Environment Variables Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Default `.env` contents:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskforge
DB_USERNAME=postgres
DB_PASSWORD=password
JWT_SECRET=9a4f2c8d7e1b5a3f6c8e0d2b4a6f8c1d3e5b7a9f0c2d4e6b8a0c2d4e6f8a0b2c
JWT_EXPIRATION_MS=86400000
PORT=8080
```

---

## 🗄️ Step 3: Database & Prisma ORM Setup

TaskForge uses **Prisma ORM** for database schema definition and migration tracking.

### Option A: Running PostgreSQL with Docker Compose
Start PostgreSQL container locally:
```bash
docker-compose up -d db
```

### Option B: Local PostgreSQL Service
Ensure PostgreSQL is running locally on port `5432` with a database named `taskforge`.

### Run Prisma Migrations
Execute the following Prisma CLI commands:

```bash
# Generate Prisma Client JS definitions
npm run prisma:generate

# Push schema directly to PostgreSQL database
npm run prisma:push

# Or create a SQL migration file (in dev mode)
npm run prisma:migrate:dev --name init
```

---

## 🧪 Step 4: Running Unit & Integration Tests

The test suite runs against an **in-memory H2 database** profile (`application-test.properties`) and requires no external PostgreSQL connection.

To run all 27 unit & integration tests:

```bash
# Using collective bash script runner
./run-tests.sh

# Or using Maven Wrapper
./mvnw clean test

# Or using npm script runner
npm test
```

### Expected Output:
```text
[INFO] Results:
[INFO] 
[INFO] Tests run: 27, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
=====================================================
 SUCCESS: All Unit and Integration Tests Passed!     
=====================================================
```

---

## 💻 Step 5: Running the Application Locally

### Method 1: Using Maven Wrapper (Local Dev Mode)
```bash
./mvnw spring-boot:run
```
The application will start on `http://localhost:8080`.

### Method 2: Using Docker Compose (Full Containerized Stack)
```bash
docker-compose up --build
```
This builds the Spring Boot app multi-stage Docker container and launches both PostgreSQL and the Spring Boot service simultaneously.

---

## 🔍 Step 6: Accessing API Documentation & Endpoints

Once the application is running:
- **Swagger UI Playground:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Docs:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **Health Check Endpoint:** `GET http://localhost:8080/api/health`

---

## 🔧 Common Troubleshooting & FAQ

### Issue 1: `mvn: command not found`
**Solution:** Always use the included executable Maven Wrapper `./mvnw` instead of system `mvn`.

### Issue 2: `Database connection refused on port 5432`
**Solution:** Ensure PostgreSQL is running (`docker-compose up -d db`) and matches credentials in `.env`.

### Issue 3: `401 Unauthorized when requesting /api/tasks`
**Solution:** Ensure you pass `Authorization: Bearer <YOUR_JWT_TOKEN>` header obtained from `/api/auth/login` or `/api/auth/register`.
