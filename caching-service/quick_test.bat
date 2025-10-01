@echo off
echo 🧪 Enhanced Caching Service - Quick Test
echo ========================================

echo.
echo 1. Testing Go compilation...
go build -o test_validation.exe validate_code.go
if %errorlevel% neq 0 (
    echo ❌ Compilation failed
    pause
    exit /b 1
)
echo ✅ Compilation successful

echo.
echo 2. Running code validation...
test_validation.exe
if %errorlevel% neq 0 (
    echo ❌ Validation failed
    del test_validation.exe
    pause
    exit /b 1
)
echo ✅ Validation successful

echo.
echo 3. Testing data models...
go run test.go
if %errorlevel% neq 0 (
    echo ❌ Data model test failed
    del test_validation.exe
    pause
    exit /b 1
)
echo ✅ Data model test successful

echo.
echo 4. Testing enhanced main compilation...
go build -o test_enhanced.exe main_enhanced.go
if %errorlevel% neq 0 (
    echo ❌ Enhanced main compilation failed
    del test_validation.exe
    del test_enhanced.exe
    pause
    exit /b 1
)
echo ✅ Enhanced main compilation successful

echo.
echo 🎉 All tests passed! The enhanced caching service is ready to use.
echo.
echo Next steps:
echo 1. Start PostgreSQL
echo 2. Start Hardhat node
echo 3. Update .env with your contract addresses
echo 4. Run: go run main_enhanced.go
echo.

del test_validation.exe
del test_enhanced.exe

pause
