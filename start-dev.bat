@echo off
echo Starting TownSquare Development Environment...
echo.

echo Installing server dependencies...
call npm install

echo Installing client dependencies...
cd townsquare-frontend
call npm install
cd ..

echo Starting development servers...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

call npm run dev
