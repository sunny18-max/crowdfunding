@echo off
echo ========================================
echo   SQLite Database Viewer
echo ========================================
echo.

cd database

echo Opening SQLite database...
echo.
echo Available commands:
echo   .tables          - List all tables
echo   .schema users    - Show users table structure
echo   SELECT * FROM users;  - View all users
echo   .quit            - Exit
echo.

sqlite3 crowdfunding.db
