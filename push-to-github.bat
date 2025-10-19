@echo off
echo Setting up Git...

git config user.name "Sunny"
git config user.email "sunny550@gmail.com"

echo Committing files...
git commit -m "Initial commit: Advanced DBMS Crowdfunding Platform"

echo Adding remote repository...
git remote add origin https://github.com/sunny18-max/crowdfunding.git

echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done! Your code has been pushed to GitHub.
echo Repository: https://github.com/sunny18-max/crowdfunding
pause
