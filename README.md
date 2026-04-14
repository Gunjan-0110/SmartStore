# SmartStock OS — React + Express + MongoDB

Inventory Management System rebuilt from jQuery/HTML into a modern full-stack app.

## Tech Stack
- **Frontend:** React 18, React Router v6, Axios, Vite
- **Backend:** Node.js, Express 4, JWT auth, bcryptjs
- **Database:** MongoDB via Mongoose

## Project Structure
```
smartstock/
├── backend/
│   ├── models/         User.js | Asset.js | AuditLog.js
│   ├── routes/         auth.js | assets.js | users.js | logs.js
│   ├── middleware/     auth.js  (JWT protect + adminOnly)
│   ├── server.js       Express entry point + DB seed
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/    AuthContext.jsx
    │   ├── services/   api.js  (Axios + JWT interceptor)
    │   ├── components/ Sidebar.jsx | Layout.jsx
    │   └── pages/      Login | Dashboard | Inventory | AddAsset | AuditLog | AccessControl
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup & Run

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev       # nodemon on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # Vite on port 5173
```

Open **http://localhost:5173**

## Default Credentials (auto-seeded)
| Email | Password | Role |
|---|---|---|
| admin@smartstock.io | admin123 | Admin |
| demo@smartstock.io | demo123 | User |

## API Endpoints
```
POST   /api/auth/login       Login, returns JWT
GET    /api/auth/me          Get current user

GET    /api/assets           List all assets
POST   /api/assets           Create asset
PUT    /api/assets/:id       Update asset
DELETE /api/assets/:id       Delete asset

GET    /api/users            List users
POST   /api/users            Add user (Admin)
PUT    /api/users/:id        Update user (Admin)
DELETE /api/users/:id        Delete user (Admin)

GET    /api/logs             Get audit logs
```

## Key Improvements Over Original
| Feature | Before | After |
|---|---|---|
| Auth | jQuery AJAX + users.json | JWT + bcrypt |
| Frontend | Multi-page HTML | React SPA |
| State | sessionStorage | React Context |
| API calls | $.ajax / fetch | Axios + interceptors |
| Routing | HTML page links | React Router (protected) |
| Passwords | Plaintext | bcryptjs hashed |
