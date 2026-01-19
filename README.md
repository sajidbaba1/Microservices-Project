# Microrservises Project 🚀

A full-stack microservices application with a focus on reliability and high-quality standards.

## 🛠 Tech Stack
- **Persistence**: PostgreSQL
- **Caching**: Redis
- **Messaging**: Kafka
- **Object Storage**: MinIO
- **Analytics**: ClickHouse
- **Infrastructure**: Docker Compose

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Docker and Docker Compose installed.

### 2. Start Infrastructure
Run the following command to start all backend services:
```bash
docker-compose up -d
```

### 3. Verification
- **Dashboard (Next.js)**: http://localhost:3001
- **Auth Service**: http://localhost:4000
- **Analytics Service**: http://localhost:4001
- **MinIO Console**: http://localhost:9011
- **ClickHouse HTTP**: http://localhost:8123
- **PostgreSQL**: `localhost:5433`

## 🧪 Quality Assurance (QA)
Refer to [QA_REFERENCE.md](./QA_REFERENCE.md) for our testing philosophy.
Check the `/tests` directory for automated test suites.
