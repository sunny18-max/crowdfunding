@echo off
echo ========================================
echo   Netlify Deployment Script
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building production bundle...
call npm run build

echo.
echo Step 3: Deploying to Netlify...
echo.
echo Please run: netlify deploy --prod
echo.
echo When prompted:
echo - Publish directory: dist
echo.

pause
