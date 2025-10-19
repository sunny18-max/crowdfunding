# 🗄️ Database Viewer - Admin Endpoints

I've created admin API endpoints so you can view and manage your production database.

## 📊 View Database Contents

### 1. View All Users
**URL**: https://crowdfunding-qdrn.onrender.com/api/admin/users

Open in browser or use:
```bash
curl https://crowdfunding-qdrn.onrender.com/api/admin/users
```

**Response:**
```json
{
  "count": 2,
  "users": [
    {
      "id": 1,
      "name": "Saathvik",
      "email": "saathvikk202@gmail.com",
      "wallet_balance": 10000,
      "created_at": "2025-10-19..."
    }
  ]
}
```

---

### 2. View All Campaigns
**URL**: https://crowdfunding-qdrn.onrender.com/api/admin/campaigns

```bash
curl https://crowdfunding-qdrn.onrender.com/api/admin/campaigns
```

---

### 3. View Database Stats
**URL**: https://crowdfunding-qdrn.onrender.com/api/admin/stats

```bash
curl https://crowdfunding-qdrn.onrender.com/api/admin/stats
```

**Response:**
```json
{
  "total_users": 2,
  "total_campaigns": 5,
  "total_pledges": 10,
  "total_wallet_balance": 25000
}
```

---

### 4. Create Test User (Seed Data)
**URL**: https://crowdfunding-qdrn.onrender.com/api/admin/seed-user

```bash
curl -X POST https://crowdfunding-qdrn.onrender.com/api/admin/seed-user
```

**Response:**
```json
{
  "message": "Test user created successfully",
  "userId": 1,
  "credentials": {
    "email": "saathvikk202@gmail.com",
    "password": "password123"
  }
}
```

---

## 🚀 How to Use

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Add admin endpoints for database viewing"
git push origin main
```

### Step 2: Wait for Render to Deploy (2-3 minutes)
Check: https://dashboard.render.com

### Step 3: Create Test User
Open in browser:
```
https://crowdfunding-qdrn.onrender.com/api/admin/seed-user
```

Or use curl:
```bash
curl -X POST https://crowdfunding-qdrn.onrender.com/api/admin/seed-user
```

### Step 4: Login with Test User
- Email: `saathvikk202@gmail.com`
- Password: `password123`
- Wallet: $10,000

---

## 📱 Quick Access URLs

| Endpoint | URL |
|----------|-----|
| **View Users** | https://crowdfunding-qdrn.onrender.com/api/admin/users |
| **View Campaigns** | https://crowdfunding-qdrn.onrender.com/api/admin/campaigns |
| **Database Stats** | https://crowdfunding-qdrn.onrender.com/api/admin/stats |
| **Create Test User** | https://crowdfunding-qdrn.onrender.com/api/admin/seed-user |

---

## ⚠️ Important Notes

1. **These endpoints are public** - In production, you should add authentication
2. **Database is ephemeral** - Data resets when Render restarts
3. **Seed user anytime** - If database resets, just call seed-user again

---

## 🔒 Secure These Endpoints (Optional)

To add authentication to admin endpoints, edit `backend/routes/admin.js`:

```javascript
const auth = require('../middleware/auth');

// Protect all admin routes
router.use(auth);

// Or protect individual routes
router.get('/users', auth, async (req, res) => {
  // ...
});
```

---

## 🎯 Next Steps

1. Push changes: `git push origin main`
2. Wait for Render deployment
3. Create test user: Visit seed-user URL
4. Login to your app with test credentials
5. Start using the platform! 🚀
