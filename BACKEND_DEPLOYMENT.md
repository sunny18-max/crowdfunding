# 🚀 Backend Deployment Guide

## ⚠️ Current Issue

Your frontend is deployed at: https://crowdfunding-helper.netlify.app/
But it's trying to connect to `localhost:5000` which doesn't exist online!

**Result:** Login/Registration fails ❌

---

## ✅ Solution: Deploy Backend to Render

### Step 1: Push Backend to GitHub

Make sure your code is pushed:
```bash
git add .
git commit -m "Add backend deployment config"
git push origin main
```

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up/Login (use GitHub)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository: `sunny18-max/crowdfunding`
5. Configure:
   - **Name**: `crowdfunding-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = `your-secret-key-here`

7. Click **"Create Web Service"**

### Step 3: Wait for Deployment (5-10 minutes)

Render will:
- ✅ Clone your repo
- ✅ Install dependencies
- ✅ Start your server
- ✅ Give you a URL like: `https://crowdfunding-backend.onrender.com`

### Step 4: Update Frontend Environment Variable

1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://crowdfunding-backend.onrender.com/api`

4. Trigger redeploy:
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

---

## 🎯 Alternative: Use Railway (Easier)

### Step 1: Deploy to Railway

1. Go to https://railway.app
2. Login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select: `sunny18-max/crowdfunding`
5. Railway auto-detects Node.js
6. Click on the service → Settings
7. Set **Root Directory**: `backend`
8. Add Environment Variables:
   - `PORT` = `5000`
   - `JWT_SECRET` = `your-secret-key`

9. Click **"Deploy"**

### Step 2: Get Your URL

Railway gives you: `https://crowdfunding-backend-production.up.railway.app`

### Step 3: Update Netlify

Same as above - add `VITE_API_URL` to Netlify environment variables.

---

## ⚠️ Important: Database Issue

**SQLite won't work in production!**

Your deployed backend will lose data on every restart because:
- SQLite stores data in a file
- Render/Railway use ephemeral storage
- Files are deleted on restart

### Solution: Use PostgreSQL

You need to migrate to PostgreSQL for production. I can help with this if needed.

---

## 🔧 Quick Test (Temporary)

Want to test if it works? You can temporarily use a mock backend:

### Option: Use JSON Server (Quick Demo)

This won't have real functionality but will show the UI works:

1. Create a mock API
2. Deploy to Vercel/Netlify
3. Update `VITE_API_URL`

---

## ✅ Recommended Flow

1. **Deploy Backend to Render** (5 min)
2. **Get backend URL** (e.g., `https://your-app.onrender.com`)
3. **Update Netlify env var** with backend URL
4. **Redeploy frontend** on Netlify
5. **Test login/registration** ✅

---

## 🆘 Need Help?

If you want me to:
- Create PostgreSQL migration scripts
- Set up environment variables
- Configure CORS for production
- Create deployment scripts

Just let me know!

---

## 📝 Current Status

❌ Frontend: Deployed (Netlify) - https://crowdfunding-helper.netlify.app/
❌ Backend: NOT deployed - Still on localhost
❌ Database: SQLite (won't work in production)

**Next Step:** Deploy backend to Render or Railway!
