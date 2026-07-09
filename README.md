# Azure IoT Smart Home Energy Management System

A production-ready full-stack web application designed for a Microsoft Azure **AZ-900 (Azure Fundamentals)** course project. This application provides real-time monitoring and control of simulated home appliances, tracks power metrics, projects utility bills based on customizable tariffs, and automates grid safety alert generation.

It runs locally with a zero-configuration SQLite setup (or Docker Compose orchestration) and includes structural templates to connect directly with Azure IoT Hub, Azure SQL Database, Azure Functions, and App Service.

---

## 🏛️ Project Architecture

```mermaid
graph TD
    subgraph Local Environment (Zero Hardware)
        S[IoT Telemetry Simulator] -- Every 5s / POST --> B[Express.js API Server]
        R[React Client Dashboard] -- GET/POST HTTP --> B
        B -- Read/Write SQL --> DB[(Local SQLite DB)]
    end

    subgraph Azure Cloud Production Environment
        Hub[Azure IoT Hub] -- Telemetry Event Trigger --> Fn[Azure Function]
        Fn -- SQL Driver --> AzureSQL[(Azure SQL Database)]
        App[Azure App Service] -- Runs Node API + React Client --> AzureSQL
        App -- Logs & Metrics --> Mon[Azure Monitor / App Insights]
    end
```

---

## 📁 Folder Structure

```text
azure_course_project/
├── backend/                  # Node.js + Express API server
│   ├── src/
│   │   ├── config/           # SQLite connection & database auto-seeding
│   │   ├── controllers/      # Route controllers (Auth, Dashboard, Devices, Energy, Alerts)
│   │   ├── routes/           # API router mappings
│   │   └── index.js          # Express server entry (Serves React in production)
│   ├── .env.example          # Template environment configurations
│   ├── Dockerfile            # Production Node image builder
│   └── package.json
├── frontend/                 # React (Vite SPA) + Tailwind CSS client
│   ├── src/
│   │   ├── components/       # Reusable layout UI (Sidebar, Navbar, Cards, Charts)
│   │   ├── pages/            # Login, Dashboard, Devices, Analytics, Alerts
│   │   ├── App.jsx           # Main routing and session gatekeeper
│   │   └── main.jsx
│   ├── tailwind.config.js    # Tailwind layout utility configurations
│   ├── nginx.conf            # Nginx config for Client Routing support in Docker
│   ├── Dockerfile            # Multi-stage client builder (Node to Nginx)
│   └── package.json
├── database/                 # SQL script folders
│   ├── schema.sql            # Schema definitions (SQLite & Azure SQL)
│   └── seed.sql              # Core devices and admin user seeding query
├── simulator/                # Node-based telemetry generator (IoT Mock)
│   ├── index.js              # Polls active devices and sends random readings every 5s
│   ├── Dockerfile            # Standalone Node simulator container
│   └── package.json
├── azure-functions/          # Azure Cloud serverless integration template
│   ├── host.json
│   └── IoTHubTrigger/        # Node-based IoT Hub direct ingestion function
│       ├── function.json
│       └── index.js
├── docker-compose.yml        # Multi-container local orchestration script
├── .github/                  # CI/CD pipelines
│   └── workflows/
│       └── azure-deploy.yml  # Deploys built app to Azure App Service
└── README.md                 # Project Documentation
```

---

## ⚡ Quick Start - Running Locally

### Option A: Using Docker Compose (Recommended)
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. Clone the repository and navigate to the project root:
   ```bash
   cd azure_course_project
   ```
2. Build and launch all three services:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and access the services:
   * **React Client Dashboard:** [http://localhost:3000](http://localhost:3000)
   * **Express Backend API:** [http://localhost:5000/health](http://localhost:5000/health)
4. Log in using the default credentials:
   * **Email:** `admin@smarthome.com`
   * **Password:** `admin123`

---

### Option B: Running without Docker (Manual Installation)

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
*The database file is automatically created and seeded under `database/smarthome.db` on server launch.*

#### 2. Setup Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Visit the client URL shown in the console (usually [http://localhost:5173](http://localhost:5173)).*

#### 3. Setup Simulator
In a third terminal window:
```bash
cd simulator
npm install
npm start
```
*The simulator will poll the backend for active devices and push telemetry updates every 5 seconds.*

---

## 🔌 API Documentation

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Simple credentials login check | `{"email": "admin...", "password": "..."}` |
| **GET** | `/dashboard` | Gets combined KPIs, recent alerts & tariff | *None* |
| **GET** | `/devices` | Retrieves status of the 5 home appliances | *None* |
| **POST** | `/devices/:id/toggle` | Toggles status (`ON` / `OFF`) | *None* |
| **GET** | `/energy` | Aggregates logs (`?range=hourly/daily/weekly/monthly/top-devices`) | *None* |
| **POST** | `/energy` | Simulator telemetry ingestion endpoint | `{"device_id": 1, "voltage": 230, "current": 2.5, "power": 575, "energy": 0.00079}` |
| **GET** | `/alerts` | Retrieves list of all generated safety/overload warnings | *None* |
| **DELETE**| `/alerts/clear` | Clears safety alert log history | *None* |
| **POST** | `/settings/tariff` | Updates electricity tariff rate per kWh | `{"tariff": 9.5}` |

---

## ☁️ Azure Cloud Deployment Guide

This project is prepared to scale seamlessly into Microsoft Azure Services for an AZ-900 project demo:

### 1. Database: Azure SQL Database
1. Deploy an **Azure SQL Database** in your Resource Group.
2. Open the SQL firewall to allow access from Azure App Service.
3. Run the schema queries in `database/schema.sql` using the Query Editor on the Azure portal.
4. Add the connection environment variables (`AZURE_SQL_SERVER`, `AZURE_SQL_USER`, `AZURE_SQL_PASSWORD`, `AZURE_SQL_DATABASE`) to your App Service config.

### 2. Backend Hosting: Azure App Service
1. Create an **App Service** (Node.js 18 Linux runtime stack).
2. Configure **Environment Variables** (Application Settings):
   * `NODE_ENV = production`
   * `PORT = 8080` (App Service defaults)
   * Configure Azure SQL environment settings.
3. Hook up your GitHub Repository to App Service using the Deployment Center or use the provided GitHub Actions workflow.

### 3. Serverless Integration: Azure Functions
For actual IoT ingestion (bypassing Express endpoint in cloud environment):
1. Deploy a **Function App** (Node.js programming model).
2. Configure `IoTHubTrigger` with the event hub connection string from your IoT Hub.
3. Deploy the code from `azure-functions/`.

### 4. Telemetry Stream: Azure IoT Hub
1. Create an **Azure IoT Hub** in the portal.
2. Register 5 devices corresponding to the appliances.
3. Copy device connection strings and run the simulator using these connection strings to transmit data over MQTT/AMQP directly to Azure.

---

## 🏆 Future Enhancements
* **App Insights Instrumentation:** Deep telemetry monitoring of Express routes using Azure Monitor.
* **Role-Based Access Control (RBAC):** True JWT-based token generation for distinct tenant levels.
* **Predictive AI Modeling:** Azure Machine Learning forecasting future energy usage based on historical weather patterns.
