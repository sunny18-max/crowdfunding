@echo off
echo ========================================
echo   Fixing Route Error - Setting Env Var
echo ========================================
echo.

echo Step 1: Setting environment variable in Netlify...
netlify env:set VITE_API_URL "https://crowdfunding-qdrn.onrender.com/api"

echo.
echo Step 2: Rebuilding with correct API URL...
call npm run build

echo.
echo Step 3: Deploying to production...
netlify deploy --prod

echo.
echo ========================================
echo   Done! Test your app now:
echo   https://crowdfunding-helper.netlify.app/
echo ========================================
pause
