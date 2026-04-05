@echo off
REM Script para iniciar la Biblioteca Zen y abrir el navegador automáticamente
REM Este script debe estar en la carpeta 'biblioteca'

cd /d "%~dp0"

echo ========================================
echo   Iniciando Biblioteca Zen
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "server" (
    echo ERROR: No se encuentra la carpeta 'server'
    echo Este script debe estar en la carpeta 'biblioteca'
    pause
    exit /b 1
)

if not exist "angular-app" (
    echo ERROR: No se encuentra la carpeta 'angular-app'
    echo Este script debe estar en la carpeta 'biblioteca'
    pause
    exit /b 1
)

REM Iniciar el servidor (Backend + Frontend)
echo [1/2] Iniciando servidores...
cd server
start "Biblioteca Zen" cmd /k npm start
cd ..

REM Esperar un momento breve para que el servidor inicie
timeout /t 1 /nobreak > nul

echo.
echo ✅ Sistema iniciado en: http://localhost:4333
echo.

REM Abrir el navegador automáticamente
echo 🌐 Abriendo navegador...
start http://localhost:4333

echo.
echo ✅ ¡Aplicación lista para usar!
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
