@echo off
echo ========================================
echo   Redeploying with Backend URL
echo ========================================
echo.

echo Step 1: Committing changes...
git add .
git commit -m "Update API URL to use Render backend and configure CORS"

echo.
echo Step 2: Pushing to GitHub...
git push origin main

echo.
echo Step 3: Render will auto-deploy backend...
echo Backend URL: https://crowdfunding-qdrn.onrender.com
echo.

echo Step 4: Now redeploy frontend on Netlify...
cd frontend
echo Building frontend...
call npm run build

echo.
echo Step 5: Deploy to Netlify...
echo Run: netlify deploy --prod
echo.

pause
