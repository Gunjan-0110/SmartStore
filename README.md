# SmartStock OS 📦📈

**SmartStock OS** is a premium, full-stack Inventory Management System built to orchestrate warehouse tracking, complex user permission environments, and deep operational analytics. It is engineered with a modern React frontend and a highly secure Express/MongoDB backend architecture.

---

## 🌟 Key Features

### 1. Robust Access Control & Permission Workflows
The backbone of SmartStock is its granular security and role-management system. 
- **Roles:** Clear `Admin` vs `User` boundaries. 
- **Granular Editing Permissions:** Standard Users can be granted or restricted specific CRUD operations (`Read`, `Edit`, `Delete`, `Add`).
- **Request Cycle:** Users can dynamically trigger automated "Permission Requests" to Admins if they encounter a restricted barrier.
- **Admin Hub:** Admins have a dedicated dashboard to Approve/Reject privilege escalation requests and instantly elevate trusted floor managers.

### 2. Deep Interactive Analytics
The SmartStock dashboard goes far beyond simple counting. Powered by `recharts`, it renders multiple high-level insights instantly:
- **Asset vs. Safety Threshold Matrix:** A composed graph simultaneously tracking current asset volumes against their critical "Minimum Safety Limits", immediately exposing vulnerabilities.
- **Stock Health & Category Density:** Real-time semantic distribution of warehouse footprint (e.g., Electronics vs. Furniture) and pure health metrics (Healthy vs. Low Stock vs. Out of Stock).

### 3. Absolute Audit Accountability
No action occurs blindly. The system possesses a strictly enforced **Audit Log** schema traversing the backend infrastructure. Every modification, creation, deletion, or permission adjustment executed by any user is permanently logged with exact timestamps and target tracking.

### 4. Enterprise UI/UX
Designed meticulously without massive CSS frameworks, the platform features a highly custom, native CSS variables experience. It boasts:
- Custom Glassmorphism and micro-animations.
- **Native Light/Dark Mode** tracking that binds dynamically directly to the chart SVGs.
- Optimistic UI updates ensuring no lag behind network requests.

---

## 🛠 Tech Stack
- **Frontend Engine:** React 18 (Vite Bundler), React Router v6, Axios
- **Data Visualizations:** Recharts
- **Backend Architecture:** Node.js, Express 4.x
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs`
- **Database:** MongoDB via Mongoose

---

## 📂 Project Structure

```
smartstock/
├── backend/
│   ├── models/         # Mongoose Schemas: User, Asset, AuditLog, PermissionRequest
│   ├── routes/         # REST API definitions (auth, assets, logs, requests)
│   ├── middleware/     # JWT protection & Role-based gatekeepers
│   ├── server.js       # Express entry point & auto-database seeder
│   └── .env            # Environment config (Mongo URI, Secret Keys)
├── frontend/
│   ├── src/
│   │   ├── components/ # Core reusable shells (Sidebar, Layout, Topbar)
│   │   ├── context/    # Global State mgmt (AuthContext, ThemeContext)
│   │   ├── pages/      # The views (Dashboard, Inventory, AccessControl)
│   │   └── services/   # Axios API client & JWT interceptors
│   ├── index.css       # The entire native design token system
│   └── vite.config.js
└── package.json        # Root Concurrency driver
```

---

## 🚀 Quick Start Guide

### 1. Initial Setup
Ensure you have Node.js and MongoDB installed locally (or a remote URI).

To install dependencies across both systems concurrently:
```bash
npm run install-all
```

### 2. Configure Environment
Head into the `/backend` directory and create your `.env` file! A template is provided.

```bash
cp backend/.env.example backend/.env
```
Ensure you provide a valid MongoDB connection string and a secure JWT Secret:
```env
PORT=5002
MONGODB_URI=mongodb://localhost:27017/smartstock
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Boot the Matrix
SmartStock utilizes `concurrently` to launch the API and the React Client simultaneously from the root directory.

```bash
npm run dev
```
- **React Frontend:** http://localhost:5173
- **Express API:** http://localhost:5002

---

## 🔑 Default Authorization
When the backend server first connects to the database, it will autonomously inject seed data if it finds no users.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@smartstock.io` | `admin123` |
| **Standard User** | `demo@smartstock.io` | `demo123` |

Log in immediately with the Admin credentials to test pending permission thresholds and explore the Audit interface!
