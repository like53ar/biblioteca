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

REM Iniciar el servidor backend
echo [1/3] Iniciando servidor backend...
cd server
start "Backend Server" cmd /k npm start
cd ..

REM Esperar a que el backend se inicie
echo [2/3] Esperando a que el servidor backend se inicie...
timeout /t 2 /nobreak > nul

REM Iniciar la aplicación Angular
echo [3/3] Iniciando aplicación Angular...
cd angular-app
start "Angular App" cmd /k npm start
cd ..

echo.
echo ✅ Ambos servicios están iniciando...
echo.
echo 📚 Backend: http://localhost:3000
echo 🌐 Frontend: http://localhost:4300
echo.
echo Esperando a que la aplicación esté lista...

REM Esperar 10 segundos para que Angular compile y esté listo
timeout /t 5 /nobreak > nul

REM Abrir el navegador automáticamente
echo.
echo 🌐 Abriendo navegador...
start http://localhost:4300

echo.
echo ✅ ¡Aplicación iniciada!
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
echo (Las ventanas del servidor seguirán abiertas)
pause > nul
