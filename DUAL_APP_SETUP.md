# Vivify Platform - Dual App Setup

This repository contains **TWO separate frontend applications** sharing the same backend:

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BACKEND (Shared)                 │
│              Node.js + Express + MongoDB            │
│                   Port: 3001                        │
├─────────────────────────────────────────────────────┤
│  Routes:                                            │
│  • /api/auth         - Authentication               │
│  • /api/users        - User management              │
│  • /api/cards        - Card battle system           │
│  • /api/challenges   - Challenges (original)        │
│  • /api/mountain/*   - Mountain game (NEW)          │
└─────────────────────────────────────────────────────┘
         ↑                              ↑
         │                              │
    ┌────┴────┐                   ┌─────┴──────┐
    │         │                   │            │
┌───▼─────────▼───┐         ┌─────▼────────────▼─────┐
│  VIVIFY CLASSIC │         │  VIVIFY MOUNTAIN       │
│  (Original App) │         │  (New Game)            │
│  Port: 8080     │         │  Port: 3000            │
│  /frontend/     │         │  /vivify-mountain/     │
└─────────────────┘         └────────────────────────┘
```

## 🚀 Quick Start

### 1. Start the Shared Backend

```bash
cd backend

# Install dependencies (first time)
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/vivify-platform
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vivify
PORT=3001
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
EOF

# Start backend
npm start

# ✅ Should see: "🎮 Vivify Card Battle Server running on port 3001"
```

### 2. Start Vivify Classic (Original App)

```bash
# Open NEW terminal
cd frontend

# Install dependencies (first time)
npm install

# Start original app
npm start
# OR if you use a different command:
# python -m http.server 8080
# (whatever you normally use)

# ✅ Opens at: http://localhost:8080
```

### 3. Start Vivify Mountain (New Game)

```bash
# Open ANOTHER NEW terminal
cd vivify-mountain

# Install dependencies (first time)
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env

# Start mountain game
npm start

# ✅ Opens at: http://localhost:3000
```

## 📱 Using Both Apps

### **Vivify Classic** (http://localhost:8080)
- Card battle system
- Original challenges
- Fitness tracking
- Everything you already built

### **Vivify Mountain** (http://localhost:3000)
- Seven Summits climbing game
- Habit tracking (7 daily habits)
- Training Grounds
- Mountain progression
- Leaderboards

### **Shared Features**
Both apps share:
- ✅ Same user accounts (login once, use both)
- ✅ Same database
- ✅ Same backend API
- ✅ Same authentication

**Note**: You need to register/login in each app separately (for now), but use the same credentials.

## 🔗 Future Integration

Later, you can:
1. Add a link in Classic app: "Try Mountain Game →"
2. Add a link in Mountain app: "Back to Classic →"
3. Eventually merge into one unified app with tabs

## 🧪 Testing

### Test Backend is Running
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok", ...}
```

### Test Classic App
1. Go to http://localhost:8080
2. Login with existing account
3. Access card battles, challenges

### Test Mountain App
1. Go to http://localhost:3000
2. Register new account (or use same credentials)
3. Complete Training Grounds
4. Climb Mt. Fuji

## 📊 Which Port is Which?

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend | 3001 | http://localhost:3001/api | Shared API |
| Classic | 8080 | http://localhost:8080 | Original Vivify app |
| Mountain | 3000 | http://localhost:3000 | New mountain game |

## 🛠️ Development Workflow

```bash
# Terminal 1 - Backend (always running)
cd backend && npm start

# Terminal 2 - Classic App (when working on original features)
cd frontend && npm start

# Terminal 3 - Mountain App (when working on mountain game)
cd vivify-mountain && npm start
```

## 📦 Deployment

### Backend (Render)
- Deploy from `/backend/` folder
- Set environment variables in Render dashboard

### Classic Frontend (Netlify - existing)
- Deploy from `/frontend/` folder
- Keep your existing setup

### Mountain Frontend (Netlify - new site)
- Create NEW Netlify site
- Deploy from `/vivify-mountain/` folder
- Set build command: `npm run build`
- Set publish directory: `build`
- Set env variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://...
PORT=3001
JWT_SECRET=your-secret
NODE_ENV=production
```

### Vivify Mountain (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
# Production:
# REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## 📝 Notes

- Both apps are **completely independent** frontends
- They share the **same backend and database**
- Users can use one or both apps
- No conflicts - they use different routes and components
- Backend handles both simultaneously

## 🆘 Troubleshooting

**Can't connect to backend from Mountain app:**
```bash
# Check .env in vivify-mountain folder
cat vivify-mountain/.env
# Should show: REACT_APP_API_URL=http://localhost:3001/api

# Restart React app after changing .env
```

**Port conflicts:**
```bash
# Classic app uses 8080, Mountain uses 3000
# If 3000 is taken, React will offer 3001
# Say NO and kill what's using 3000:
lsof -ti:3000 | xargs kill -9
```

**Different users in each app:**
- This is expected for now
- They share the database, but login sessions are separate
- Use same email/password to access same data

---

**Need to merge them later?** We can integrate the mountain game into the classic app as a new tab/section.
