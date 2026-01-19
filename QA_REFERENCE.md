# Eurusys: Engineering & QA Excellence 🚀

> **Core Philosophy**: We don't just write code; we build systems that are observable, testable, and resilient.

## 🏗️ The "What, Why, How" of Eurusys

### 1. WHAT are we building?
We are building a **Microservices-based User Management & Analytics Platform**. 
- It handles authentication, secure storage, real-time event messaging.
- **Fault Tolerance**: Kafka handles message persistence; ClickHouse handles high-speed analytics.
- **Observability**: Real-time metrics via **Prometheus**, tracing via **Jaeger (OpenTelemetry)**.

---

## 🔍 Observability Stack (The Watchtower)

Our ecosystem uses a triple-layered observability approach:

1.  **Metrics (Prometheus + Grafana)**: 
    *   Every service (Node, Go, .NET) exposes a `/metrics` endpoint.
    *   Dashboards at `http://localhost:3000` provide visual health checks.
2.  **Tracing (OpenTelemetry + Jaeger)**:
    *   Implemented in Go and .NET services to track request flow across service boundaries.
    *   Trace UI available at `http://localhost:16686`.
3.  **Logs**: Structured JSON logging for indexability.

---

## 🛠️ Multi-Language Standards

| Language | Service | Role | Key QA Tool |
| :--- | :--- | :--- | :--- |
| **Node.js** | Auth / Analytics | Business Logic / Data | TypeORM + Scalar |
| **Go** | Inventory | Performance / High-throughput | Gin + OTEL |
| **.NET 8** | Shipment | Enterprise Integration | AWS SDK (S3) |

---
### 2. WHY are we building it this way?
- **Separation of Concerns**: By splitting Auth, Analytics, and Storage, a bug in one doesn't crash the entire platform.
- **Observability**: We use health probes (`/health/live`) so we know exactly when a service is failing before users do.
- **QA Integration**: Testing is not an afterthought. We build "testable code" from day one.

### 3. HOW are we building it?
- **Infrastructure**: Docker Compose manages our "Big 5" (Postgres, Redis, Kafka, MinIO, ClickHouse).
- **Communication**: Services talk via REST (sync) and Kafka events (async).
- **Data Integrity**: TypeORM ensures our database schema stays consistent across environments.

---

## 🧪 What is a **QA Role**?

**QA** stands for **Quality Assurance**.

> **A QA engineer ensures that the software works correctly, reliably, and meets requirements before users touch it.**

QA is not “finding bugs randomly” — it’s **systematic validation**.

---

## 🧠 What QA actually does (real responsibilities)

### 1️⃣ Understand the product

* Requirements
* User flows
* Edge cases
* Failure scenarios

QA thinks like:

* User
* Hacker
* Lazy person 😄

---

### 2️⃣ Test the application (core job)

#### 🔹 Functional Testing

* Does the feature work?
* API returns correct response?
* Validation works?

Example:

```
POST /login
✔ valid credentials → 200
❌ wrong password → 401
```

---

#### 🔹 API Testing (VERY IMPORTANT FOR BACKEND)

* REST endpoints
* Status codes
* Payload validation
* Error handling

Tools:

* Postman
* REST Client
* curl
* Automated test frameworks

---

#### 🔹 Integration Testing

* Service ↔ DB
* Service ↔ Kafka
* Service ↔ MinIO

Example:

> Upload file → event sent to Kafka → analytics stored

---

#### 🔹 Regression Testing

* New change doesn’t break old features

---

### 3️⃣ Non-functional testing (senior QA)

#### 🔹 Performance Testing

* How many requests per second?
* Slow APIs?
* Memory leaks?

#### 🔹 Load / Stress Testing

* What happens at 10k users?

#### 🔹 Security Testing

* Auth bypass?
* SQL injection?
* Invalid tokens?

---

### 4️⃣ Automation (modern QA = automation)

QA today **writes code**.

Examples:

* API test automation
* E2E tests
* CI pipeline tests

Tools:

* Playwright
* Cypress
* JUnit
* pytest
* k6 (load testing)

---

## 🧩 QA role in YOUR microservices stack

| Component     | QA responsibility    |
| ------------- | -------------------- |
| REST APIs     | Validate endpoints   |
| Kafka         | Check event delivery |
| MinIO         | File upload/download |
| PostgreSQL    | Data consistency     |
| Redis         | Cache correctness    |
| ClickHouse    | Analytics accuracy   |
| OpenTelemetry | Traces exist         |
| Prometheus    | Metrics available    |

👉 QA ensures **the system works as a whole**, not just individual services.

---

## 🗄️ Database Observability (QA Context)

Since you have **PostgreSQL** and **pgAdmin** locally, here is how a QA or Senior Dev interacts with them:

1. **Validation**: When a user registers via `/api/auth/register`, a QA engineer doesn't just trust the `201 Created` response. They check pgAdmin to verify the row exists and the password is correctly hashed.
2. **Schema Drift**: QA monitors if the database table structure matches the code (TypeORM entities).
3. **Data Integrity**: Ensuring that deleting a user also cleans up their related data (Cascading deletes).

---

## 📦 Storage Verification (QA Context)

Since we use **MinIO** for object storage, QA verification includes:

1. **Bucket Policy**: Verifying that the `profiles` bucket has the correct public-read policy so avatars can be displayed in the dashboard.
2. **File Persistence**: Checking the MinIO Console (`http://localhost:9011`) to ensure the file was actually uploaded and named correctly (`avatar-{uuid}.jpg`).
3. **MIME Validation**: Ensuring only image types are allowed (QA tries to upload a `.txt` file to test the `multer` filter).
4. **Link Integrity**: Verifying that the `avatarUrl` saved in PostgreSQL actually points to a reachable file in MinIO.

---

## 🆚 QA vs Developer (clear difference)

| Developer       | QA                |
| --------------- | ----------------- |
| Writes features | Verifies features |
| Happy path      | Breaks things     |
| Unit tests      | Integration & E2E |
| Moves fast      | Ensures stability |

📌 Good teams have **both**.

---

---

## 📖 API Documentation (The Contract)

In a microservices world, **API Documentation** is the "legal contract" between services. We use **Scalar** (an modern alternative to Swagger) for this:

1. **Validation**: QA uses the `/docs` UI to try out endpoints (Register, Login, Stats) without writing a single line of code.
2. **Schema Trust**: If the `/docs` say a field is required, the frontend must provide it.
3. **Debugging**: When a service fails, we check the docs to see if the "Request Shape" actually matches what the service expects.

> **Access points**:
> - Auth Service Docs: `http://localhost:4000/docs`
> - Analytics Service Docs: `http://localhost:4001/docs`

---

## 🎨 Frontend Quality (UX/QA Mindset)

When building the **Eurusys Dashboard**, we apply these QA checks:

1. **Error Boundaries**: Does the app crash if an API returns an error? Or does it show a graceful "Something went wrong" message?
2. **Loading States**: Are there skeletons or spinners during data fetching? (Don't let the user guess).
3. **Form Validation**: Immediate feedback on invalid email/password formats before the request hits the server.
4. **Responsive Design**: Does the analytics chart look good on a mobile phone? (Testing viewports).
5. **State Consistency**: If a user logs in, does the sidebar update immediately to show their avatar?

---

## 🚀 How YOU should present QA in interview

Since you’re a full-stack dev, say:

> “I follow a QA mindset — I test APIs, validate edge cases, add automated tests, and ensure observability metrics confirm system health.”

---

## ✅ Final truth

> **Modern QA is not a separate world — it’s part of engineering.**
