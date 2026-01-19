# 🚀 Eurusys Ecosystem: Full Startup & Testing Guide

This guide provides everything you need to run, test, and understand the Eurusys Polyglot Microservices Ecosystem.

---

## 🛠️ 1. Absolute Startup Sequence

Open **5 separate terminals** (or use VS Code Terminal tabs) and run these commands in order:

### Terminal 1: Infrastructure (Docker)
```powershell
# In the project root
docker-compose up -d
```
*Wait 30 seconds for Kafka and ClickHouse to be ready.*

### Terminal 2: Global Dashboard (Next.js)
```powershell
cd client
npm run dev
```
*Access at http://localhost:3001*

### Terminal 3: Auth & Analytics (Node.js)
```powershell
# Tab 3a
cd services/auth-service
npm run dev

# Tab 3b
cd services/analytics-service
npm run dev
```
*Auth: http://localhost:4000 | Analytics: http://localhost:4001*

### Terminal 4: Inventory Service (Go)
```powershell
cd services/inventory-service
go run main.go
```
*Access at http://localhost:8080*

### Terminal 5: Shipment Service (.NET 8)
```powershell
cd services/ShipmentService
dotnet run
```
*Access at http://localhost:5000*

---

## 🧪 2. Complete Testing Flow (E2E)

Follow this flow to see the entire ecosystem in action:

1.  **Identity Creation**: Go to [localhost:3001/auth/register](http://localhost:3001/auth/register) and create an account.
    *   *Result*: **Auth Service** saves to **Postgres** and emits a `user-registered` event to **Kafka**.
2.  **Analytics Intake**: **Analytics Service** consumes the Kafka event and saves it to **ClickHouse**.
3.  **Visual Confirmation**: Log in at [localhost:3001/auth/login](http://localhost:3001/auth/login).
    *   *Result*: Your Dashboard at [localhost:3001/dashboard](http://localhost:3001/dashboard) will show the "Total Users" and "Live Events" bars updating in real-time.
4.  **Go Logic**: Open [http://localhost:8080/items](http://localhost:8080/items).
    *   *Result*: Triggers a Go endpoint with a **Jaeger Trace**.
5.  **C# Manifest**: Use Postman or the Scalar UI to `POST` to `http://localhost:5000/api/shipping/manifest` with any JSON body.
    *   *Result*: **Shipment Service** saves a file to **MinIO** storage.

---

## 🔍 3. Monitoring & Observability
Check these URLs to see the "health" of your code:

- **Global Metrics (Grafana)**: [http://localhost:3002](http://localhost:3002) (Admin/Admin)
    *   *View*: Global Health Dashboard -> See through-put of Go and .NET services.
- **Trace Analysis (Jaeger)**: [http://localhost:16686](http://localhost:16686)
    *   *View*: Select "inventory-service" or "ShipmentService" to see exactly how long requests took.
- **Direct Metrics**: [http://localhost:9090](http://localhost:9090) (Prometheus)

---

## 🧠 4. How Everything Works (The Architecture)

1.  **Polyglot Logic**: We use the right tool for the job. Node.js for rapid API dev, Go for high-speed inventory, and .NET for enterprise S3 integration.
2.  **Event-Driven**: Services don't just "talk" to each other directly; they emit events to **Kafka**. This makes the system "Fault Tolerant"—if one service goes down, the message stays in the queue until it's back up.
3.  **The Watchtower**: Every service has an "OpenTelemetry" agent. This agent sends heartbeats to **Prometheus** and traces to **Jaeger**. **Grafana** then acts as the "Face" of the system, pulling all this data together.
4.  **Storage Layers**:
    *   **Postgres**: Source of truth for Users.
    *   **Redis**: High-speed caching.
    *   **ClickHouse**: OLAP database for sub-second analytics on millions of events.
    *   **MinIO**: Private S3-compatible cloud for actual files (avatars/manifests).
