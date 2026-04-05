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

## 📖 Formas de Uso y Características Principales

La Biblioteca Zen está diseñada para ser tu santuario de lectura y de gestión física/digital. A continuación, las principales formas de aprovecharla:

### 1. Añadir y Gestionar tus Colecciones
- **Búsqueda Inteligente por ISBN:** Al registrar un libro, ingresa sus 10 o 13 dígitos del **ISBN** y pulsa "Buscar". El sistema consultará automáticamente bases de datos externas (Google Books, Open Library) para autocompletar el título, autor, cantidad de páginas, resumen y año.
- **Control Físico y Digital:** Marca en tu obra si pertenece a tu biblioteca en formato **Papel** o **Digital**. También puedes especificar si un libro ya lo has **"Leído"** o si se encuentra **"Prestado"** a un amigo.
- **Notas e Impresiones:** Despliega el campo de "+ Añadir Resumen Personal" para inmortalizar tus opiniones o tomar apuntes de lo que sentiste al leerlo.

### 2. Impresión de Fichas (Mundo Real)
- Hemos cerrado la brecha entre el mundo digital y físico. Usando el botón **"Imprimir Fichas"** (en la franja superior de estadísticas), el sistema agrupará todos los libros en tu sistema marcados como "Papel".
- Generará de manera automática una hoja prediseñada con formato para etiquetas adhesivas estándar (105mm x 48mm, distribuidas en hoja A4).
- Podrás imprimir y pegar estas fichas en las contraportadas o lomos de tus libros físicos de tu estantería real.

### 3. Modo Desconectado (Offline)
- Tu biblioteca va adonde tú vayas, tu paz no requiere conexión a la red.
- Puedes seguir buscando, consultando y gestionando todos tus libros en la aplicación **incluso sin acceso a internet**. La aplicación utiliza almacenamiento caché inteligente local.

### 4. Exportación e Importación Avanzada
- Desde el panel superior de estadísticas, puedes usar los botones **Exportar CSV** o **Exportar JSON** para descargar un archivo directo de todos tus libros.
- Los archivos CSV te permiten analizar tu colección de literatura en hojas de cálculo como Microsoft Excel y Google Sheets. 
- Con un archivo JSON creado aquí, podrás usar el botón de **"Importar"** para subir tu librería a otro dispositivo o recuperarla en segundos en cualquier computadora.

### 5. Inmunidad de Lectura Original
- La aplicación cuenta con protecciones internas para evitar que traductores web (como Google Translate) destruyan la elegancia de la fuente web y traduzcan equivocadamente los títulos extranjeros en la colección de la biblioteca.

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
- Abre manualmente: http://localhost:4300
- Los servidores seguirán funcionando en segundo plano

---

## 📊 URLs de la Aplicación

- **Frontend (Interfaz):** http://localhost:4300
- **Backend (API):** http://localhost:3000
- **Base de Datos:** `server\library.db`
