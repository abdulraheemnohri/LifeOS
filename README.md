# LifeOS Sync Enterprise

LifeOS Sync Enterprise is a full-stack, offline-first SaaS for managing personal finance and productivity. It features a modern dark "Glass UI," background data synchronization, and an admin-controlled user system.

## 🧠 PRODUCT SUMMARY
- **Admin-controlled user creation** (no public signup)
- **Client app** with modern UI (Glass UI, Dark theme, Smooth animations)
- **Local storage + background sync** (Offline-first)
- **Central server (SQLite)**
- **GitHub-based update system** (Automatic client updates via Service Workers)

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

### 1. Prerequisites (All Platforms)
- Node.js (v16+)
- npm / yarn
- Git

### 2. Platform-Specific Setup

#### 🪟 Windows (Command Prompt / PowerShell)
1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Clone the repository:
   ```cmd
   git clone https://github.com/abdulraheemnohri/LifeOS.git
   cd LifeOS
   ```
3. Setup Server:
   ```cmd
   cd server
   npm install
   copy .env.example .env
   ```
4. Run Server:
   ```cmd
   node app.js
   ```

#### 🐧 Linux (Ubuntu/Debian/CentOS)
1. Install Node.js:
   ```bash
   sudo apt update
   sudo apt install nodejs npm -y
   ```
2. Clone & Setup:
   ```bash
   git clone https://github.com/abdulraheemnohri/LifeOS.git
   cd LifeOS/server
   npm install
   cp .env.example .env
   ```
3. Run Server:
   ```bash
   node app.js
   ```

#### 📱 Termux (Android)
1. Install Termux from F-Droid.
2. Update packages and install Node.js:
   ```bash
   pkg update && pkg upgrade
   pkg install git nodejs-lts -y
   ```
3. Clone & Setup:
   ```bash
   git clone https://github.com/abdulraheemnohri/LifeOS.git
   cd LifeOS/server
   npm install
   cp .env.example .env
   ```
4. Run Server:
   ```bash
   node app.js
   ```

### 3. Running Backend Tests
```bash
# From the server directory:
npm test
# OR
./node_modules/.bin/jest
```

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
