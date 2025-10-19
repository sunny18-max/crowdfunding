# 🔧 Fix "Route Not Found" Error

## ❌ Problem
The frontend is trying to connect to `localhost:5000` instead of your Render backend because Netlify doesn't have the environment variable set.

## ✅ Solution: Set Environment Variable in Netlify

### Method 1: Via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/sites/crowdfunding-helper/settings

2. **Navigate to Environment Variables**
   - Click "Site settings" (left sidebar)
   - Click "Environment variables" (under "Build & deploy")

3. **Add New Variable**
   - Click "Add a variable" → "Add a single variable"
   - **Key**: `VITE_API_URL`
   - **Value**: `https://crowdfunding-qdrn.onrender.com/api`
   - **Scopes**: Select "All scopes"
   - Click "Create variable"

4. **Trigger Redeploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait 2-3 minutes

5. **Test Again**
   - Visit: https://crowdfunding-helper.netlify.app/
   - Try logging in - should work now! ✅

---

### Method 2: Via Netlify CLI

Run these commands:

```bash
cd frontend

# Set environment variable
netlify env:set VITE_API_URL "https://crowdfunding-qdrn.onrender.com/api"

# Rebuild and deploy
npm run build
netlify deploy --prod
```

---

## 🧪 Verify It's Working

### Test Backend Directly
Open this in your browser:
https://crowdfunding-qdrn.onrender.com/health

Should return:
```json
{
  "status": "OK",
  "message": "Crowdfunding API is running",
  "timestamp": "2025-10-19T..."
}
```

### Test Login Endpoint
```bash
curl -X POST https://crowdfunding-qdrn.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔍 Why This Happened

1. **`.env.production` file** is only used during local builds
2. **Netlify** needs environment variables set in its dashboard
3. The build on Netlify didn't have `VITE_API_URL` set
4. So it defaulted to `localhost:5000` (which doesn't exist online)

---

## ⚡ Quick Fix Script

I'll create a script to set this automatically...
