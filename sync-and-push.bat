@echo off
echo Syncing with GitHub...
git pull origin main --no-rebase
echo.
echo Pushing changes...
git push origin main
echo.
echo Done! Backend will redeploy on Render automatically.
pause
