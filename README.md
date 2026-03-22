# 📚 Biblioteca Zen 

> "El silencio de los libros es una forma de paz."

**Biblioteca Zen** no es simplemente un sistema de gestión; es un **santuario digital** diseñado para los amantes de la lectura y coleccionistas. En un mundo lleno de ruido visual y sobreinformación, esta herramienta nace con un propósito fundamental: ofrecer un espacio de completa tranquilidad, enfoque y minimalismo para organizar tus obras literarias sin distracciones.

Ya sea que mantengas una preciada colección de libros en formato físico (Papel), albergues una enorme biblioteca Digital/AudioLibro, o intercambies obras con amigos, esta aplicación te permite:
- **Unificar tus colecciones** físicas y digitales en una sala de lectura elegante y perpetua.
- **Mantenerte en control** de lo que has leído, lo que tienes prestado y lo que aún aguarda por ti.
- **Inmortalizar tus pensamientos** redactando tus propios resúmenes e impresiones personales por cada obra.
- **Materializar la gestión offline**: Te permite imprimir fichas autoadhesivas en PDF, de tamaño estandarizado, para clasificarlos en tus propias estanterías libreras físicas en el mundo real.

A diferencia del software cotidiano que busca inundarte con funciones, *Biblioteca Zen* es tu bibliotecario privado: Rápido, elegante, que funciona sin internet y respeta la paz de tu lectura.

## 🌟 Características Principales

-   **Diseño Zen**: Interfaz minimalista con modo oscuro/claro y tipografía elegante (*Libre Baskerville*, *Inter*).
-   **Gestión de Inventario**: Añade, edita y elimina libros con facilidad. Control de estado (Leído/No leído, Prestado).
-   **Búsqueda Inteligente de ISBN**: Integración con Google Books, Open Library y Crossref para autocompletar metadatos (título, autor, resumen, páginas, año).
-   **Modo Offline (PWA)**: Funciona sin internet gracias a IndexedDB y Service Workers. Sincronización automática cuando vuelve la conexión.
-   **Base de Datos Híbrida**:
    -   **Frontend**: IndexedDB para acceso instantáneo y caché.
    -   **Backend**: SQLite para persistencia robusta.
-   **Fichas para Imprimir (Novedad)**: Generador automático de PDF para múltiples etiquetas (105mm x 48mm optimizadas para A4) de los libros físicos.
-   **Traducción Inmunizada**: Bloqueos activos (`translate="no"`) para proteger el DOM de interrupciones causadas por Google Translate de Chrome.
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
