# Quick Start Guide - Crowdfunding Platform

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Starting the Application

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

The backend will start on **http://localhost:5000**

You should see:
```
🚀 ================================
   Crowdfunding API Server
   ================================
   🌐 Server running on port 5000
   📍 http://localhost:5000
   🏥 Health check: http://localhost:5000/health
   ================================

✅ Database initialized successfully
Connected to SQLite database
```

### 2. Start Frontend Application

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Access the Application

Open your browser and go to: **http://localhost:5173**

## First Time Setup

### Create a Test Account

1. Click "Register" or "Get Started"
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Register"

**Note:** New users automatically get $1000 in their wallet!

### Create a Test Campaign

1. After logging in, click "Create Campaign"
2. Fill in the campaign details:
   - Title: My First Campaign
   - Description: This is a test campaign
   - Goal Amount: 5000
   - Deadline: Select a future date
3. Click "Create Campaign"

### Make a Test Pledge

1. Go to Home page
2. Click on any campaign
3. Click "Back This Project"
4. Enter pledge amount (e.g., 100)
5. Click "Confirm Pledge"

Your wallet balance will be deducted and the campaign's funds will increase!

## Verifying Data Visibility

### Check Wallet Dashboard
1. Click "Wallet" in the navigation
2. You should see:
   - ✅ Your wallet balance
   - ✅ Transaction history
   - ✅ Stats (debits, credits, refunds)

### Check Analytics Dashboard
1. Click "Analytics" in the navigation
2. You should see:
   - ✅ Total users count
   - ✅ Total campaigns count
   - ✅ Total funds raised
   - ✅ Active campaigns count
   - ✅ Top campaigns table
   - ✅ Success rates
   - ✅ Pledge statistics

### Check User Dashboard
1. Click "Dashboard" in the navigation
2. You should see:
   - ✅ Your campaigns
   - ✅ Your pledges
   - ✅ Statistics cards

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Run: `netstat -ano | findstr :5000` (Windows)
- Kill the process or change the port in backend/.env

### Frontend won't start
- Check if port 5173 is already in use
- Delete `node_modules` and run `npm install` again

### Data not showing
1. Check backend console for errors
2. Check browser console (F12) for errors
3. Verify API calls in Network tab (F12 → Network)
4. Ensure you're logged in (check localStorage for 'token')

### Database issues
- Delete `backend/database/crowdfunding.db` and restart backend
- This will create a fresh database

## API Testing

Test backend endpoints directly:

```bash
# Health check
curl http://localhost:5000/health

# Get all campaigns (no auth needed)
curl http://localhost:5000/api/campaigns

# Get platform stats (no auth needed)
curl http://localhost:5000/api/analytics/platform-stats
```

## Default Configuration

### Backend
- Port: 5000
- Database: SQLite (backend/database/crowdfunding.db)
- CORS: Enabled for localhost:5173
- Default wallet balance: $1000 per new user

### Frontend
- Port: 5173
- API URL: http://localhost:5000/api
- Framework: React + Vite
- State Management: Redux Toolkit

## Features to Test

1. **Authentication**
   - Register new account
   - Login
   - Logout

2. **Campaigns**
   - Create campaign
   - View all campaigns
   - View campaign details
   - Update campaign (your own)
   - Delete campaign (your own)

3. **Pledges**
   - Make pledge to campaign
   - View your pledges
   - See pledge history

4. **Wallet**
   - View balance
   - Add funds
   - View transaction history
   - See wallet stats

5. **Analytics**
   - Platform statistics
   - Top campaigns
   - Success rates
   - Pledge statistics

## Need Help?

Check these files:
- `DATA_VISIBILITY_FIXES.md` - Details on data flow fixes
- `TROUBLESHOOTING_LOGIN.md` - Login issues
- `BACKEND_DEPLOYMENT.md` - Deployment guide
- `README.md` - Project overview

## Development Mode

For development with auto-reload:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Both will automatically reload when you make changes!
