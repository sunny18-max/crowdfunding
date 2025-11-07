# 🚀 Database Setup Instructions

## Quick Start - Seed the Database

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run the Seed Script
```bash
npm run seed
```

This will:
- ✅ Clear existing data (except your vardhan@gmail.com user)
- ✅ Insert 7 sample users (admin, entrepreneurs, investors)
- ✅ Insert 10 sample campaigns with various statuses
- ✅ Insert 22 sample pledges
- ✅ Create wallet transactions
- ✅ Add activity logs and notifications

### Step 3: Start the Backend Server
```bash
npm run dev
```

## Sample Login Credentials

After seeding, you can login with these accounts:

### Admin Account
- **Email:** admin@fundstarter.com
- **Password:** password123
- **Role:** Admin
- **Wallet:** $50,000

### Entrepreneur Accounts
1. **Sarah Johnson**
   - Email: sarah.johnson@example.com
   - Password: password123
   - Wallet: $5,000
   - Campaigns: 3 active campaigns

2. **Michael Chen**
   - Email: michael.chen@example.com
   - Password: password123
   - Wallet: $3,500
   - Campaigns: 3 campaigns (1 successful)

3. **Emily Rodriguez**
   - Email: emily.rodriguez@example.com
   - Password: password123
   - Wallet: $4,200
   - Campaigns: 4 campaigns

### Investor Accounts
1. **David Park**
   - Email: david.park@example.com
   - Password: password123
   - Wallet: $25,000
   - Has made multiple pledges

2. **Lisa Thompson**
   - Email: lisa.thompson@example.com
   - Password: password123
   - Wallet: $15,000

3. **James Wilson**
   - Email: james.wilson@example.com
   - Password: password123
   - Wallet: $18,000

## Sample Campaigns

The database includes 10 diverse campaigns:

1. **EcoSmart Home Hub** - $50,000 goal, $38,500 raised (Active)
2. **Pixel Quest RPG** - $35,000 goal, $42,000 raised (Successful) ✅
3. **CodeKids Academy** - $45,000 goal, $31,200 raised (Active)
4. **Urban Garden Kit** - $25,000 goal, $19,800 raised (Active)
5. **MindfulMe App** - $40,000 goal, $28,600 raised (Active)
6. **ArtisanCraft Marketplace** - $30,000 goal, $22,400 raised (Active)
7. **RoboLearn Kit** - $55,000 goal, $47,300 raised (Active)
8. **FreshMeal Prep** - $60,000 goal, $15,200 raised (Active)
9. **VR Fitness Studio** - $75,000 goal, $52,800 raised (Active)
10. **BookBridge** - $20,000 goal, $8,500 raised (Failed) ❌

## What You Can Test

### As Admin:
- View all users, campaigns, and pledges
- See platform-wide analytics
- Access admin dashboard with real data

### As Entrepreneur:
- View your campaigns with real pledges
- See campaign performance
- Check wallet transactions
- View notifications

### As Investor:
- Browse active campaigns
- Make new pledges (if you have wallet balance)
- View your pledge history
- Track backed campaigns

## Troubleshooting

### If seed fails:
1. Make sure backend server is NOT running
2. Delete the crowdfunding.db file
3. Restart backend (it will recreate the schema)
4. Run `npm run seed` again

### If you get "table doesn't exist" errors:
1. Stop the backend server
2. Delete crowdfunding.db
3. Start backend (schema will be created)
4. Run seed script

## Database Location
The database file is located at:
```
backend/database/crowdfunding.db
```

## Verify Data
After seeding, you can verify the data by:
1. Starting the backend server
2. Logging in with any sample account
3. Checking the dashboard, wallet, and campaigns

## Need to Re-seed?
Just run `npm run seed` again. It will clear and repopulate the data.

---

**Note:** The seed script preserves your existing vardhan@gmail.com account if it exists.
