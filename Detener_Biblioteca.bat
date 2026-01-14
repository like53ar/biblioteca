@echo off
echo ========================================
echo   Cerrando Biblioteca Zen
echo ========================================
echo.

echo Deteniendo procesos de Node.js...

REM Matar todos los procesos de node.exe
taskkill /F /IM node.exe >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Servidores detenidos correctamente
) else (
    echo ℹ️  No se encontraron servidores en ejecución
)

echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
