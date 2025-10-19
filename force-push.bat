@echo off
echo Cleaning up merge conflicts...
git merge --abort
echo.
echo Pulling with merge strategy...
git pull origin main --strategy=recursive --strategy-option=theirs
echo.
echo Pushing changes...
git push origin main
echo.
echo Done!
pause
