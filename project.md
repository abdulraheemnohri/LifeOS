# 🚀 MASTER PROJECT PROMPT: LifeOS Sync Enterprise

## 🧠 PRODUCT SUMMARY
Build a full-stack offline-first SaaS system with:
- **Admin-controlled user creation** (no public signup)
- **Client app** with modern UI
- **Local storage + background sync**
- **Central server** (SQLite)
- **GitHub-based update system** (client + server)

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

## 📦 REPOSITORIES

### 🖥️ REPO 1: SERVER (ADMIN + API)
#### ⚙️ TECH STACK
- Node.js + Express
- SQLite
- JWT Auth
- bcrypt
- Admin Panel (HTML/JS)

#### 📁 STRUCTURE
```bash
server/
│
├── app.js
├── db.js
├── config/
│   └── config.js
│
├── middleware/
│   ├── auth.js
│   ├── admin.js
│
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── sync.js
│   ├── dashboard.js
│   └── update.js
│
├── services/
│   ├── syncService.js
│   └── updateService.js
│
├── admin-panel/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
└── database.sqlite
```

#### 🗄️ DATABASE DESIGN
**USERS**
- id INTEGER PRIMARY KEY
- username TEXT UNIQUE
- password TEXT
- role TEXT (admin/user)
- created_at TEXT

**COMMON DATA STRUCTURE**
Each table (income, bills, loans, notes, experience):
- id TEXT PRIMARY KEY
- user_id INTEGER
- created_at TEXT
- updated_at TEXT
- synced INTEGER
- deleted INTEGER

#### 🔐 AUTH SYSTEM
**RULES:**
- Only admin creates users
- JWT required for all APIs

**FLOW:**
- Admin → Create User
- Client → Login
- Server → Return JWT
- Client → Store token

#### 🧑‍💼 ADMIN PANEL FEATURES
**USER MANAGEMENT**
- Create user
- Delete user
- Reset password
- View users list

**UPDATE CONTROL**
- Check for updates (GitHub)
- Trigger server update (git pull, npm install, restart server)

---

### 💻 CLIENT REPO (MODERN UI)
#### 📁 STRUCTURE
```bash
client/
│
├── index.html
├── styles.css
├── app.js
├── api.js
├── sync.js
├── storage.js
│
├── components/
│   ├── dashboard.js
│   ├── income.js
│   ├── bills.js
│   ├── loans.js
│   ├── notes.js
│   └── experience.js
│
└── assets/
```

#### 🎨 MODERN UI DESIGN
**STYLE:**
- Dark theme 🌙
- Glass UI
- Smooth animations
- Card-based layout

**COLORS:**
- Primary: #22c55e
- Background: #0f172a
- Card: #1e293b
- Accent: #38bdf8
- Danger: #ef4444

#### 📊 DASHBOARD FEATURES
- Total income
- Total expense
- Balance
- Chart.js graph

---

## 🔄 SYNC SYSTEM (CORE)
**LOGIC:**
- **Offline**: Save locally to `localStorage`
- **Online**:
    - Push → Server
    - Pull ← Server
    - Merge data (Latest `updated_at` wins, handle deletions)

**AUTO SYNC:**
- Every 30 seconds
- On "online" event

---

## 🚀 UPDATE SYSTEM (GITHUB)
**📄 version.json (GitHub)**
```json
{
  "version": "1.0.1",
  "message": "New features added",
  "type": "optional",
  "download_url": "https://github.com/yourrepo/releases/app.zip"
}
```

**🔎 CLIENT UPDATE CHECK**
- On app load
- Every 1 hour
- Powered by Service Workers for background asset updates
- Fetched directly from GitHub raw URL

---

## 📊 DASHBOARD API
- **GET /dashboard**
- **Response**: `{ "income": 50000, "expense": 30000, "balance": 20000 }`

## 🔐 SECURITY
- JWT auth
- Admin role middleware
- bcrypt password hashing
- Input validation

## ⚡ PERFORMANCE
- Incremental sync
- SQLite indexing (user_id, updated_at)
- Local caching
