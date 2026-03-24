# LifeOS Sync Enterprise

LifeOS Sync Enterprise is a full-stack, offline-first SaaS for managing personal finance and productivity. It features a modern dark "Glass UI," background data synchronization, and an admin-controlled user system.

## 🧠 PRODUCT SUMMARY
- **Admin-controlled user creation** (no public signup)
- **Client app** with modern UI (Glass UI, Dark theme, Smooth animations)
- **Local storage + background sync** (Offline-first)
- **Central server (SQLite)**
- **GitHub-based update system** (mocked)

## 🏗️ SYSTEM ARCHITECTURE
```
Client App (Offline First UI)
    ↓ ↑ (Sync API)
Node.js Server (Admin Panel + API)
    ↓
SQLite Database
    ↑
GitHub (version.json updates)
```

## ⚙️ TECH STACK
### Server
- Node.js + Express
- SQLite3
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

### Client
- HTML5 / CSS3 (Modern Glass UI / Dark theme)
- Vanilla JavaScript
- Chart.js for data visualization
- LocalStorage for persistence

## 📁 STRUCTURE
```
.
├── client/              # Frontend client application
│   ├── components/      # UI components (dashboard, income, notes, etc.)
│   ├── index.html       # Main entry point
│   ├── styles.css       # Glass UI styling
│   └── app.js           # Core application logic
├── server/              # Backend server (API + Admin Panel)
│   ├── admin-panel/     # Static admin interface
│   ├── config/          # Server configuration
│   ├── middleware/      # Auth & Admin middleware
│   ├── routes/          # API endpoints
│   ├── services/        # Sync & Update services
│   ├── app.js           # Main server entry
│   └── db.js            # Database initialization
└── README.md
```

## 🚀 INSTALLATION & RUNNING

### 1. Prerequisites
- Node.js (v14+)
- npm

### 2. Server Setup
```bash
cd server
npm install
```

### 3. Running the Server
```bash
# From the server directory:
node app.js
```
The server will start on `http://localhost:3000`.

### 4. Client Setup & Running
The client is a static application. You can serve it using any static file server or simply open `client/index.html` in your browser.

**Using `serve` (optional):**
```bash
npm install -g serve
serve client -p 5000
```
Open `http://localhost:5000` in your browser.

### 5. Admin Panel Access
The admin panel is accessible at `http://localhost:3000/admin-panel/index.html`.
You'll need to create an initial admin user in the database to log in.

## 🗄️ DATABASE DESIGN
The system uses SQLite with the following tables:
- **users**: `id, username, password, role (admin/user), created_at`
- **income, bills, loans, notes, experience**: `id, user_id, created_at, updated_at, synced, deleted, [data fields]`

## 🔄 SYNC SYSTEM
- **Offline**: Data is saved to `localStorage` immediately.
- **Online**: Background sync pushes local changes to the server and pulls new data.
- **Conflict Resolution**: The record with the latest `updated_at` timestamp wins. Deletions are handled via a `deleted` flag.

## 🔐 SECURITY
- JWT required for all APIs (except login).
- Admin role middleware for sensitive operations.
- bcrypt password hashing for all user accounts.
