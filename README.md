# 📚 Biblioteca Zen 

> "El silencio de los libros es una forma de paz."

**Biblioteca Zen** no es simplemente un sistema de gestión; es un **santuario digital** diseñado para los amantes de la lectura y coleccionistas. En un mundo lleno de ruido visual y sobreinformación, esta herramienta nace con un propósito fundamental: ofrecer un espacio de completa tranquilidad, enfoque y minimalismo para organizar tus obras literarias sin distracciones.

## 🌟 Características Principales

-   **Diseño Zen**: Interfaz minimalista con modo oscuro/claro y tipografía elegante (*Libre Baskerville*, *Inter*).
-   **Gestión de Inventario**: Añade, edita y elimina libros con facilidad. Control de estado (Leído/No leído, Prestado).
-   **Búsqueda Inteligente de ISBN**: Integración con Google Books, Open Library y Crossref para autocompletar metadatos.
-   **Panel de Noticias Literarias (Novedad)**: Barra lateral informativa con enlaces confiables de Estandarte, Agenda Editorial y Cámara Argentina del Libro.
-   **Modo Offline (PWA)**: Funciona sin internet gracias a IndexedDB y Service Workers.
-   **Fichas para Imprimir**: Generador automático de PDF para múltiples etiquetas (105mm x 48mm optimizadas para A4) de los libros físicos.
-   **Traducción Inmunizada**: Bloqueos activos (`translate="no"`) para proteger el DOM de interrupciones causadas por Google Translate de Chrome.
-   **Importación/Exportación**: Respalda tu colección en JSON o CSV.

---

## 🚀 Iniciar la Aplicación

### Opción 1: Acceso Directo (Recomendado)
1. Haz doble clic en **"Biblioteca Zen"** en tu escritorio.
2. Espera 10-15 segundos.
3. El navegador se abrirá automáticamente con la aplicación.

**✨ Ventaja:** Todo se ejecuta en segundo plano, no verás ventanas de comandos.

### Opción 2: Desde la Carpeta
1. Ve a la carpeta `biblioteca`.
2. Haz doble clic en `Iniciar_Biblioteca_Silencioso.vbs`.

---

## 🛑 Detener la Aplicación

Cuando termines de usar la aplicación:
1. Ve a la carpeta raíz de la `biblioteca`.
2. Haz doble clic en `Detener_Biblioteca.bat`.
3. Esto cerrará todos los servidores.

**Alternativa:** Abre el Administrador de Tareas (Ctrl+Shift+Esc) y cierra los procesos "Node.js".

---

## 📖 Formas de Uso 

La Biblioteca Zen está diseñada para ser tu santuario de lectura y de gestión física/digital. A continuación, las principales formas de aprovecharla:

### 1. Añadir y Gestionar tus Colecciones
- **Búsqueda Inteligente por ISBN:** Al registrar un libro, ingresa sus 10 o 13 dígitos del **ISBN** y pulsa "Buscar". El sistema consultará automáticamente bases de datos externas.
- **Control Físico y Digital:** Marca en tu obra si pertenece a tu biblioteca en formato **Papel** o **Digital**. Especializa tus estatus como **"Leído"** o **"Prestado"**.
- **Notas e Impresiones:** Despliega "+ Añadir Resumen Personal" para inmortalizar tus apuntes de lo que sentiste al leerlo.

### 2. Impresión de Fichas (Mundo Real)
- Hemos cerrado la brecha entre el mundo digital y físico. Usando el botón **"Imprimir Fichas"** el sistema agrupará todos los libros que son de Papel.
- Generará automáticamente una hoja prediseñada (PDF) con etiquetas adhesivas estándar (105mm x 48mm, para A4).

### 3. Modo Desconectado (Offline)
- Puedes seguir buscando, consultando y gestionando todos tus libros **incluso sin acceso a internet**. La aplicación utiliza almacenamiento caché inteligente local.

### 4. Exportación e Importación Avanzada
- Los botones **Exportar CSV** o **Exportar JSON** descargan un archivo directo de todos tus libros. Útiles para analizar en Excel (CSV) o recuperar la biblioteca (JSON) en otra pc usando "Importar".

### 5. Inmunidad de Lectura Original
- Protecciones internas impiden que traductores web (como Google Translate) traduzcan equivocadamente los títulos extranjeros originales en la colección.

### 6. Noticias Literarias y Repositorios API (NOVEDAD)
- Tienes acceso inmediato a una barra lateral **derecha** con noticias y portales (Agenda Editorial, Estandarte, Cámara Argentina del Libro) para que te mantengas informado sobre próximos lanzamientos y ferias literarias sin salir de tu biblioteca.
- Además de canales tradicionales, se integran repositorios técnicos (APITube News API, NewsAPI.org y Zyla API Hub) ideales para extraer análisis temático y consolidar volúmenes masivos de datos para investigación en la literatura.

---

## 📁 Archivos Importantes

- **`Iniciar_Biblioteca_Silencioso.vbs`**: Inicia todo en segundo plano (usado por el acceso directo).
- **`Iniciar_Biblioteca.bat`**: Versión con ventanas visibles (para depuración).
- **`Detener_Biblioteca.bat`**: Detiene todos los servidores.
- **`server/library.db`**: Tu base de datos SQLite con todos los libros.

---

## 💡 Consejos de Respaldo

### Hacer Copia de Seguridad
Para respaldar tus libros:
1. Copia el archivo `server\library.db`.
2. Guárdalo en un lugar seguro (USB, nube, etc.).

### Restaurar desde Copia de Seguridad
1. Reemplaza `server\library.db` con tu copia de seguridad.
2. Reinicia la aplicación.

---

## 🔧 Solución de Problemas

### "Puerto ya en uso"
- Ejecuta `Detener_Biblioteca.bat` y vuelve a intentar.

### "No se puede conectar"
- Espera un poco más (15-20 segundos).

### El navegador no se abre
- Abre manualmente: http://localhost:4300
