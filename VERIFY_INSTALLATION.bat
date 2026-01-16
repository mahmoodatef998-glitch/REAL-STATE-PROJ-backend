@echo off
echo ========================================
echo   Verifying Monthly Reports Installation
echo ========================================
echo.

echo Checking required files...
echo.

REM Check utils files
if exist "utils\dateHelper.js" (
    echo [OK] utils\dateHelper.js found
) else (
    echo [MISSING] utils\dateHelper.js NOT FOUND!
)

if exist "utils\commissionCalculator.js" (
    echo [OK] utils\commissionCalculator.js found
) else (
    echo [MISSING] utils\commissionCalculator.js NOT FOUND!
)

if exist "utils\logger.js" (
    echo [OK] utils\logger.js found
) else (
    echo [MISSING] utils\logger.js NOT FOUND!
)

echo.

REM Check routes files
if exist "routes\reports.js" (
    echo [OK] routes\reports.js found
) else (
    echo [MISSING] routes\reports.js NOT FOUND!
)

if exist "routes\deals.js" (
    echo [OK] routes\deals.js found
) else (
    echo [MISSING] routes\deals.js NOT FOUND!
)

echo.
echo Checking start-server.js for /api/reports route...
findstr /C:"api/reports" start-server.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] /api/reports route found in start-server.js
) else (
    echo [MISSING] /api/reports route NOT FOUND in start-server.js!
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo If all files show [OK], the installation is correct.
echo If any show [MISSING], please reinstall those files.
echo.
pause

