@echo off
echo Fixing Git setup...

git config user.name "Sunny"
git config user.email "sunny550@gmail.com"

echo Adding all files...
git add -A

echo Committing files...
git commit -m "Complete crowdfunding platform with advanced DBMS features"

echo Pulling remote changes...
git pull origin main --allow-unrelated-histories

echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your code has been pushed to GitHub.
echo Repository: https://github.com/sunny18-max/crowdfunding
pause
