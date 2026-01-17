@echo off
REM Color output for Windows (requires Windows 10+)
setlocal enabledelayedexpansion

echo Installing G^&M POS System...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js detected: %NODE_VERSION%

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed

REM Create .env file from example
if not exist .env (
    copy .env.example .env
    echo [SUCCESS] Created .env file. Please update with your database credentials.
)

cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed

cd ..

echo.
echo [SUCCESS] Installation complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Run 'npm run dev' to start the development server
echo.
