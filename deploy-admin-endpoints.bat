@echo off
echo ========================================
echo   Deploying Admin Endpoints
echo ========================================
echo.

echo Step 1: Adding changes...
git add .

echo.
echo Step 2: Committing...
git commit -m "Add admin endpoints for database viewing"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Deployment initiated!
echo   Wait 2-3 minutes for Render to deploy
echo ========================================
echo.
echo Then visit these URLs:
echo.
echo View Users:
echo https://crowdfunding-qdrn.onrender.com/api/admin/users
echo.
echo Create Test User:
echo https://crowdfunding-qdrn.onrender.com/api/admin/seed-user
echo.
echo Database Stats:
echo https://crowdfunding-qdrn.onrender.com/api/admin/stats
echo.
pause
