# Guía de Uso - Biblioteca Zen

## 🚀 Iniciar la Aplicación

### Opción 1: Acceso Directo (Recomendado)
1. Haz doble clic en **"Biblioteca Zen"** en tu escritorio
2. Espera 10-15 segundos
3. El navegador se abrirá automáticamente con la aplicación

**✨ Ventaja:** Todo se ejecuta en segundo plano, no verás ventanas de comandos.

### Opción 2: Desde la Carpeta
1. Ve a `C:\Users\fabar\OneDrive\Escritorio\biblioteca`
2. Haz doble clic en `Iniciar_Biblioteca_Silencioso.vbs`

---

## 🛑 Detener la Aplicación

Cuando termines de usar la aplicación:

1. Ve a `C:\Users\fabar\OneDrive\Escritorio\biblioteca`
2. Haz doble clic en `Detener_Biblioteca.bat`
3. Esto cerrará todos los servidores

**Alternativa:** Abre el Administrador de Tareas (Ctrl+Shift+Esc) y cierra los procesos "Node.js"

---

## 📁 Archivos Importantes

### En la carpeta `biblioteca`:

- **`Iniciar_Biblioteca_Silencioso.vbs`**: Inicia todo en segundo plano (usado por el acceso directo)
- **`Iniciar_Biblioteca.bat`**: Versión con ventanas visibles (para depuración)
- **`Detener_Biblioteca.bat`**: Detiene todos los servidores
- **`server/library.db`**: Tu base de datos SQLite con todos los libros

---

## 💡 Consejos

### Hacer Copia de Seguridad
Para respaldar tus libros:
1. Copia el archivo `server\library.db`
2. Guárdalo en un lugar seguro (USB, nube, etc.)

### Restaurar desde Copia de Seguridad
1. Reemplaza `server\library.db` con tu copia de seguridad
2. Reinicia la aplicación

### Si algo no funciona
1. Ejecuta `Detener_Biblioteca.bat`
2. Espera 5 segundos
3. Vuelve a iniciar con el acceso directo del escritorio

---

## 🔧 Solución de Problemas

### "Puerto ya en uso"
- Los servidores ya están corriendo
- Ejecuta `Detener_Biblioteca.bat` y vuelve a intentar

### "No se puede conectar"
- Espera un poco más (15-20 segundos)
- Verifica que no haya un firewall bloqueando

### El navegador no se abre
- Abre manualmente: http://localhost:4200
- Los servidores seguirán funcionando en segundo plano

---

## 📊 URLs de la Aplicación

- **Frontend (Interfaz):** http://localhost:4200
- **Backend (API):** http://localhost:3000
- **Base de Datos:** `server\library.db`
