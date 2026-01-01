# EcoRestore 🌿
**Professional Carbon Tracking for Construction**

EcoRestore is a next-generation carbon assessment tool built to help the construction industry measure, track, and reduce embodied carbon. It combines a massive material database with intelligent logistics to provide precise, actionable sustainability data.

![Project Dashboard](./docs/dashboard_preview.png)
*(Note: Add a screenshot of your dashboard here)*

## 🚀 Key Features

### 1. 📊 Real-Time Carbon Dashboard
Visualize your project's impact instantly. The interactive dashboard breaks down emissions by **Category (Structure, Enclosure, Finishes)** and **Lifecycle Stage**, helping you spot hotspots immediately.

### 2. 🧱 Extensive Material Database
Access a library of **150+ construction materials**, covering:
*   **Structure**: Concrete (Standard vs eco-blends), Virgin & Recycled Steel, Timber.
*   **Infrastructure**: Asphalt, Aggregate, Sand, Diesel, HVO.
*   **Enclosure**: Performance Glass, Insulation (PIR, Mineral Wool).
*   **Finishes**: Gypsum, Paints, Flooring.

### 3. 🚚 Intelligent Logistics Engine
Most calculators guess transport emissions. EcoRestore calculates them precisely:
*   **Unit-Aware**: Automatically converts Volumes (m³) and Liquids (Liters) to Weight (Tonnes) using material-specific density.
*   **Multi-Modal**: Calculates impact differences between **Truck, Rail, and Ship** transport.

### 4. � Smart Recommendations
The system actively helps you reduce carbon. If you select a high-impact material (e.g., *Virgin Steel*), it suggests lower-carbon alternatives (e.g., *Recycled Steel*) and calculates the potential CO2 savings instantly.

### 5. 📄 Client-Ready Reporting
Generate professional PDF reports with a single click, summarizing the project's total carbon footprint, breakdown, and "Better Choice" opportunities.

---

## 🛠️ The Tech Stack
*   **Frontend**: Vue.js 3, TailwindCSS
*   **Backend**: Symfony 8 (PHP), API Platform
*   **Database**: PostgreSQL
*   **Infrastructure**: Docker

---

## 📖 Deployment & Setup
For developers looking to deploy or contribute, please refer to:
*   [**DEPLOY.md**](./DEPLOY.md) - For Production Deployment (Render + Neon).
