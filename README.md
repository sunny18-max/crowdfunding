# 🚀 Crowdfunding Platform - Advanced DBMS Project

A full-stack crowdfunding platform demonstrating advanced Database Management System concepts including ACID transactions, triggers, views, indexes, and complex SQL queries.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Advanced DBMS Features](#advanced-dbms-features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## ✨ Features

### User Features
- 🔐 User authentication (Register/Login with JWT)
- 💰 Wallet system with real-time balance tracking
- 🎯 Create and manage campaigns
- 💳 Pledge to campaigns with automatic wallet deduction
- 📊 Personal dashboard with statistics
- 📜 Transaction history with complete audit trail
- ❤️ View and manage your pledges

### Platform Features
- 📈 Advanced analytics dashboard
- 🏆 Top campaigns by funding
- 📊 Success rate calculations
- 🤖 Predictive analytics for campaign success
- 👥 User engagement metrics
- 💹 Funding trends analysis

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks

## 🎓 Advanced DBMS Features

### 1. ACID Transactions
- **Atomicity**: All pledge operations complete or rollback entirely
- **Consistency**: Wallet balances always match transaction logs
- **Isolation**: Concurrent pledges don't interfere
- **Durability**: Committed transactions persist

```javascript
// Example: Pledge with ACID transaction
await db.transaction(async () => {
  await db.run('UPDATE users SET wallet_balance = wallet_balance - ?', [amount]);
  await db.run('INSERT INTO pledges (user_id, campaign_id, amount) VALUES (?, ?, ?)', [userId, campaignId, amount]);
  await db.run('UPDATE campaigns SET total_pledged = total_pledged + ?', [amount]);
  await db.run('INSERT INTO wallet_transactions (...) VALUES (...)');
});
```

### 2. Database Triggers
- **Audit Logging**: Automatic tracking of all data changes
- **Campaign Fund Updates**: Auto-update campaign totals on pledge
- **Automatic Refunds**: Trigger refunds when campaigns fail

### 3. Database Views
- **Campaign Analytics View**: Pre-aggregated campaign statistics
- **User Engagement View**: User activity metrics
- **Funding Trends View**: Time-series funding data

### 4. Indexes
```sql
CREATE INDEX idx_campaigns_creator ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_deadline ON campaigns(deadline);
CREATE INDEX idx_pledges_user ON pledges(user_id);
CREATE INDEX idx_pledges_campaign ON pledges(campaign_id);
```

### 5. Complex SQL Queries

#### Aggregation with GROUP BY
```sql
SELECT 
  c.id,
  c.title,
  COUNT(DISTINCT p.id) as total_backers,
  AVG(p.amount) as avg_pledge,
  SUM(p.amount) as total_raised
FROM campaigns c
LEFT JOIN pledges p ON c.id = p.campaign_id
GROUP BY c.id
ORDER BY total_raised DESC;
```

#### Subqueries
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT SUM(total_pledged) FROM campaigns WHERE status = 'successful') as total_funds_raised,
  (SELECT COUNT(DISTINCT user_id) FROM pledges) as active_backers;
```

#### Window Functions & Analytics
```sql
SELECT 
  campaign_id,
  amount,
  timestamp,
  SUM(amount) OVER (PARTITION BY campaign_id ORDER BY timestamp) as running_total
FROM pledges;
```

### 6. Data Normalization
- **3NF/BCNF** compliant schema
- No redundant data
- Proper foreign key relationships
- Referential integrity maintained

### 7. Concurrency Control
- Row-level locking during transactions
- Optimistic concurrency for reads
- Pessimistic locking for critical updates

### 8. Predictive Analytics
```javascript
// ML-based campaign success prediction
const successProbability = calculateSuccessScore({
  fundingRatio: current / goal,
  backerCount: totalBackers,
  daysRemaining: deadline - now,
  avgPledge: totalRaised / backerCount
});
```

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
The database will be automatically created on first run. To migrate existing data:
```bash
cd backend
node migrate-database.js
```

## 🚀 Usage

1. **Start Backend** (Port 5000)
```bash
cd backend
npm run dev
```

2. **Start Frontend** (Port 5173)
```bash
cd frontend
npm run dev
```

3. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default User
- Email: test@example.com
- Password: password123
- Initial Wallet Balance: $1,000

## 📁 Project Structure

```
crowdfunding/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── database/          # Database setup and helpers
│   ├── middleware/        # Auth, error handling
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   └── App.jsx       # Main app component
│   └── index.html
└── README.md
```

## 🎯 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign

### Pledges
- `POST /api/pledges` - Create pledge (with wallet deduction)
- `GET /api/pledges/user/:userId` - Get user pledges

### Wallet
- `GET /api/wallet/:userId` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet
- `GET /api/wallet/transactions/:userId` - Get transaction history

### Analytics
- `GET /api/analytics/platform-stats` - Platform statistics
- `GET /api/analytics/top-campaigns` - Top campaigns
- `GET /api/analytics/success-rates` - Success rates
- `GET /api/analytics/pledge-stats` - Pledge statistics

## 🎓 Database Schema

### Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  wallet_balance REAL DEFAULT 1000.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Campaigns
```sql
CREATE TABLE campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount REAL NOT NULL,
  total_pledged REAL DEFAULT 0.00,
  creator_id INTEGER NOT NULL,
  deadline DATETIME NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

### Pledges
```sql
CREATE TABLE pledges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

### Wallet Transactions
```sql
CREATE TABLE wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_before REAL NOT NULL,
  balance_after REAL NOT NULL,
  reference_type TEXT,
  reference_id INTEGER,
  description TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS configuration
- Input validation and sanitization

## 📊 Analytics & Reporting
- Real-time platform statistics
- Campaign success prediction
- User engagement metrics
- Funding trend analysis
- Audit trail for all transactions

## 🤝 Contributing
This is an academic project demonstrating DBMS concepts. Feel free to fork and enhance!

## 📄 License
MIT License

## 👨‍💻 Author
**Sunny**
- GitHub: [@sunny18-max](https://github.com/sunny18-max)

## 🎉 Acknowledgments
Built as a demonstration of advanced Database Management System concepts including:
- ACID transactions
- Database triggers
- Complex SQL queries
- Data normalization
- Indexing strategies
- Concurrency control
- Predictive analytics

---

**⭐ If you found this project helpful, please give it a star!**
