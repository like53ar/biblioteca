# 📚 Biblioteca Zen (Zen Library)

Un sistema de gestión de bibliotecas moderno, diseñado con una estética "Zen" para una experiencia de usuario tranquila y eficiente.

## 🌟 Características Principales

-   **Diseño Zen**: Interfaz minimalista con modo oscuro/claro y tipografía elegante (*Libre Baskerville*, *Inter*).
-   **Gestión de Inventario**: Añade, edita y elimina libros con facilidad. Control de estado (Leído/No leído, Prestado).
-   **Búsqueda Inteligente de ISBN**: Integración con Google Books, Open Library y Crossref para autocompletar metadatos (título, autor, resumen, páginas, año).
-   **Modo Offline (PWA)**: Funciona sin internet gracias a IndexedDB y Service Workers. Sincronización automática cuando vuelve la conexión.
-   **Base de Datos Híbrida**:
    -   **Frontend**: IndexedDB para acceso instantáneo y caché.
    -   **Backend**: SQLite para persistencia robusta.
-   **Importación/Exportación**: Respalda tu colección en JSON o CSV.

## 🛠️ Tecnologías

Este proyecto utiliza las últimas tecnologías web:

*   **Frontend**: Angular 21+ (Signals, Standalone Components), TypeScript.
*   **Backend**: Node.js, Express.
*   **Base de Datos**: SQLite3.
*   **Almacenamiento Local**: `idb` (IndexedDB Wrapper).

## 🚀 Instalación y Uso

1.  **Requisitos**: Node.js instalado.
2.  **Instalación**:
    Ejecuta los comandos de instalación en ambas carpetas:
    ```bash
    cd server && npm install
    cd ../angular-app && npm install
    ```
3.  **Iniciar**:
    Haz doble clic en el archivo `Iniciar_Biblioteca.bat` en la carpeta raíz.
    Esto iniciará tanto el servidor (puerto 3000) como la aplicación Angular (puerto 4200) y abrirá tu navegador automáticamente.

## 📂 Estructura

*   `/angular-app`: Código fuente del frontend (Angular).
*   `/server`: API REST y base de datos (Node/Express).

## 📄 Licencia

Este proyecto es de uso personal y educativo.
