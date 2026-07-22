# 🛡️ TaskForge — Task Management REST API

![Build & Test Status](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=flat-square&logo=githubactions)
![Java Version](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen?style=flat-square&logo=springboot)
![Prisma ORM](https://img.shields.io/badge/Prisma-5.14.0-blue?style=flat-square&logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> A production-ready task management REST API built with **Java 21**, **Spring Boot 3.3**, **PostgreSQL**, **Prisma ORM**, **Docker**, **GitHub Actions**, **Docker Hub**, and **Render**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Folder Structure & Component Guide](#-folder-structure--component-guide)
- [Key Features & API Functionality](#-key-features--api-functionality)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Test Suite & Local Verification](#-test-suite--local-verification)
- [Environment Variables & Secrets Guide](#-environment-variables--secrets-guide)
  - [Render Environment Variables](#1-render-environment-variables-render-dashboard)
  - [GitHub Actions Secrets](#2-github-actions-secrets-github-repo-settings)
- [CI/CD & Tag-Based Deployment](#-cicd--tag-based-deployment)
- [Quick Start & Local Troubleshooting](#-quick-start--local-troubleshooting)

---

## 🚀 Overview

**TaskForge** is an enterprise-ready backend REST API designed for high-performance task tracking and workflow management. It enforces strict separation of concerns, comprehensive input validation, stateless JWT authentication, and automatic CI/CD deployment workflows.

### Tech Stack Highlights
- **Backend:** Java 21 LTS, Spring Boot 3.3.2 (Web, Data JPA, Security, Actuator, Validation)
- **Database Layer:** Prisma ORM for schema migrations & modeling, PostgreSQL for production persistence, H2 for sub-second test execution.
- **Security:** Spring Security 6 with stateless JWT Bearer token authentication & BCrypt password hashing.
- **Documentation:** Interactive OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`).
- **DevOps:** Multi-stage Docker build, Docker Compose orchestration, GitHub Actions CI/CD, Prisma CD migration, Docker Hub registry, and Render cloud hosting.

---

## 📁 Folder Structure & Component Guide

```
TaskForge/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline (CI tests + CD tag deploy)
├── .mvn/                       # Maven Wrapper configuration files
├── prisma/
│   └── schema.prisma           # Canonical database schema & migrations (User, Task, Enums)
├── src/
│   ├── main/
│   │   ├── java/com/taskforge/
│   │   │   ├── config/         # App configuration (SwaggerConfig)
│   │   │   ├── controller/     # REST Controllers (AuthController, TaskController, HealthController)
│   │   │   ├── dto/            # Request & Response Data Transfer Objects
│   │   │   │   ├── request/    # Input validation DTOs (Register, Login, CreateTask, UpdateTask)
│   │   │   │   └── response/   # JSON Response DTOs (AuthResponse, TaskResponse, PageResponse, ErrorResponse)
│   │   │   ├── exception/      # Global Exception Handler & Custom Runtime Exceptions
│   │   │   ├── model/          # JPA Entities (User, Task) and Enums (TaskStatus, TaskPriority)
│   │   │   ├── repository/     # Data Access Repositories (UserRepository, TaskRepository, PrismaTaskRepository)
│   │   │   ├── security/       # Security filters, JWT Provider, UserPrincipal, UserDetailsService
│   │   │   ├── service/        # Service interfaces & implementations (AuthService, TaskService)
│   │   │   └── TaskforgeApplication.java  # Spring Boot Main Entry Point
│   │   └── resources/
│   │       └── application.properties # Main production/dev application settings
│   └── test/
│       ├── java/com/taskforge/
│       │   ├── integration/    # Full Spring Boot MockMvc Integration Tests
│       │   └── unit/           # Unit tests for Service, Security, and Repository layers
│       └── resources/
│           └── application-test.properties # In-memory H2 DB properties for tests
├── Dockerfile                  # Multi-stage Docker production image configuration
├── docker-compose.yml          # Local container environment (Spring Boot + PostgreSQL 15)
├── mvnw                        # Executable Maven Wrapper script
├── package.json                # Prisma CLI and test script execution runner
├── pom.xml                     # Maven project descriptor and dependencies
├── run-tests.sh                # Collective test runner script (Fail-fast quality gate)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git tracking exclusion list
├── PRODUCT-IDEA.md             # Low-Level Design (LLD) & Architectural Specification
├── README.md                   # Primary project documentation
├── SETUP.md                    # Detailed step-by-step local setup guide
└── progress.MD                 # Feature progress log & verification status
```

---

## ⚡ Key Features & API Functionality

1. **User Authentication & Management**
   - User registration with unique email validation and password hashing.
   - User login returning a signed JWT Bearer token valid for 24 hours.

2. **Task Lifecycle Management**
   - Full CRUD support: Create, Read by ID, List/Filter, Update, Patch Status, Delete.
   - Automatic status handling (defaults to `PENDING`).
   - Priority levels: `LOW`, `MEDIUM`, `HIGH`.
   - Optional description and due date assignment.

3. **Dynamic Filtering, Searching & Pagination**
   - Filter by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
   - Filter by priority (`LOW`, `MEDIUM`, `HIGH`).
   - Case-insensitive search keyword across task title and description.
   - Customizable page number, page size, sort field, and sort direction.

4. **Centralized Exception Handling**
   - Standardized JSON error response body including timestamp, HTTP status, error category, message, and details list.

---

## 📑 REST API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **GET** | `/api/health` | Service health status check | ❌ No |
| **POST** | `/api/auth/register` | Register a new user account | ❌ No |
| **POST** | `/api/auth/login` | Login user & obtain JWT token | ❌ No |
| **GET** | `/api/tasks` | List, filter, search, & paginate tasks | 🔑 Bearer JWT |
| **GET** | `/api/tasks/{id}` | Get single task details by ID | 🔑 Bearer JWT |
| **POST** | `/api/tasks` | Create a new task | 🔑 Bearer JWT |
| **PUT** | `/api/tasks/{id}` | Update task details | 🔑 Bearer JWT |
| **PATCH**| `/api/tasks/{id}/status`| Update task status only | 🔑 Bearer JWT |
| **DELETE**| `/api/tasks/{id}` | Delete task by ID | 🔑 Bearer JWT |

---

## 🧪 Test Suite & Local Verification

The codebase comes equipped with a comprehensive test suite covering **unit tests** and **full-stack integration tests**.

### Test Summary
- **Total Test Cases:** 27
- **Passing Status:** ✅ **100% PASSING**
- **Test Execution Command:** `./run-tests.sh` or `npm test` or `./mvnw test`

---

## 🔐 Environment Variables & Secrets Guide

To prevent configuration confusion, environment variables are strictly categorized between **Render Web Service Environment Variables** and **GitHub Actions Secrets**.

### 1. Render Environment Variables (Render Dashboard)
Configure these in **Render Dashboard** -> **Web Services** -> **Your Service** -> **Environment**:

| Render Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL connection URL (Prisma format) | `postgresql://user:password@ep-xyz.neon.tech/taskforge?sslmode=require` |
| `SPRING_DATASOURCE_URL` | Production PostgreSQL JDBC connection URL | `jdbc:postgresql://ep-xyz.neon.tech:5432/taskforge?sslmode=require` |
| `DB_USERNAME` | Production PostgreSQL username | `postgres` or Neon username |
| `DB_PASSWORD` | Production PostgreSQL password | `<your-db-password>` |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 256 bits) | `9a4f2c8d7e1b5a3f6c8e0d2b4a6f8c1d3e5b7a9f0c2d4e6b8a0c2d4e6f8a0b2c` |
| `JWT_EXPIRATION_MS` | JWT token validity duration in milliseconds | `86400000` (24 Hours) |
| `PORT` | Listening server port for Render | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile for production | `prod` |

### 2. GitHub Actions Secrets (GitHub Repo Settings)
Configure these in **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions** -> **Repository Secrets**:

| GitHub Secret Name | Description | Where to Obtain |
| :--- | :--- | :--- |
| `DOCKER_USERNAME` | Your Docker Hub account username | Your Docker Hub account |
| `DOCKER_PASSWORD` | Docker Hub Access Token (PAT) | Docker Hub -> Account Settings -> Security -> New Access Token |
| `RENDER_DEPLOY_HOOK_URL` | Render Deploy Webhook URL | Render Dashboard -> Web Service -> Settings -> Deploy Hook |
| `DATABASE_URL` | Target production PostgreSQL DB URL | Used by CD job for `npx prisma migrate deploy` |

---

## 🚢 CI/CD & Tag-Based Deployment

GitHub Actions workflow is located at `.github/workflows/deploy.yml`.

### How Deployment Triggers Work
1. **Pull Requests & Code Pushes to `main`**:
   - Triggers the **CI Stage**.
   - Executes `./run-tests.sh`. If any test fails, the workflow aborts immediately.
2. **Git Tag Releases (e.g. `v1.0.0`)**:
   - Triggers **CI Stage** followed by the **CD Stage**.
   - **CD Steps:**
     1. Runs Prisma DB migrations on target DB (`npx prisma migrate deploy`).
     2. Packages Maven executable JAR (`./mvnw clean package -DskipTests`).
     3. Builds Docker image and tags it with `${TAG_NAME}` and `latest`.
     4. Pushes Docker image to Docker Hub using `DOCKER_USERNAME` and `DOCKER_PASSWORD`.
     5. Triggers deployment hook on Render Web Services via `RENDER_DEPLOY_HOOK_URL`.

#### Triggering a Release
To trigger a new production deployment:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 💻 Quick Start & Local Troubleshooting

### Quick Start
```bash
# 1. Clone & Install Dependencies
git clone https://github.com/yourusername/TaskForge.git
cd TaskForge
npm install

# 2. Start PostgreSQL Container
docker-compose up -d db

# 3. Run Application
./mvnw spring-boot:run
```

### Local Troubleshooting: `FATAL: password authentication failed for user "postgres"`
If you encounter this error when running `./mvnw spring-boot:run`:
1. **Cause:** Spring Boot is trying to connect to a local PostgreSQL instance on port 5432 where the password does not match `password`.
2. **Fix Option A (Recommended):** Start the project's Docker PostgreSQL container:
   ```bash
   docker-compose up -d db
   ```
3. **Fix Option B:** Update your local `.env` or environment variables to match your local PostgreSQL credentials:
   ```env
   DB_USERNAME=your_local_username
   DB_PASSWORD=your_local_password
   ```
