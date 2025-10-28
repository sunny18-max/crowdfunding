const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use the same database path as in your main application
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? '/data/crowdfunding.db' : path.join(__dirname, 'database', 'crowdfunding.db');

console.log(`Checking database at: ${dbPath}`);

// Check if database file exists
if (!fs.existsSync(dbPath)) {
    console.error('Error: Database file does not exist at:', dbPath);
    process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Successfully connected to the database');
});

// Function to list all tables in the database
function listTables() {
    console.log('\n=== Database Tables ===');
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
        if (err) {
            console.error('Error listing tables:', err);
            return;
        }
        console.log('Tables:', tables.map(t => t.name).join(', '));
        
        // For each table, show row count and first few rows
        tables.forEach(table => {
            const tableName = table.name;
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
                if (err) {
                    console.error(`Error counting rows in ${tableName}:`, err);
                    return;
                }
                console.log(`\nTable: ${tableName} (${row.count} rows)`);
                
                // Show first 3 rows if table is not empty
                if (row.count > 0) {
                    db.all(`SELECT * FROM ${tableName} LIMIT 3`, [], (err, rows) => {
                        if (err) {
                            console.error(`Error reading from ${tableName}:`, err);
                            return;
                        }
                        console.log(`First ${Math.min(3, rows.length)} rows:`);
                        console.table(rows);
                        
                        // If this is the users table, check wallet balance
                        if (tableName === 'users') {
                            console.log('\nUsers with wallet balances:');
                            db.all('SELECT id, name, email, wallet_balance FROM users', [], (err, users) => {
                                if (err) {
                                    console.error('Error fetching users:', err);
                                    return;
                                }
                                console.table(users);
                            });
                        }
                        
                        // If this is the wallet_transactions table, show recent transactions
                        if (tableName === 'wallet_transactions') {
                            console.log('\nRecent wallet transactions:');
                            db.all('SELECT * FROM wallet_transactions ORDER BY timestamp DESC LIMIT 5', [], (err, txs) => {
                                if (err) {
                                    console.error('Error fetching transactions:', err);
                                    return;
                                }
                                console.table(txs);
                            });
                        }
                    });
                }
            });
        });
    });
}

// Check database integrity
db.get('PRAGMA integrity_check', [], (err, result) => {
    if (err) {
        console.error('Error checking database integrity:', err);
    } else {
        console.log('\n=== Database Integrity Check ===');
        console.log(result);
    }
    
    // List all tables and their contents
    listTables();
});

// Close the database connection after a delay to allow async operations to complete
setTimeout(() => {
    db.close();
    console.log('\nDatabase connection closed');
}, 2000);
