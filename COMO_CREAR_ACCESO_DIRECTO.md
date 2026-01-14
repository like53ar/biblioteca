# Cómo Crear el Acceso Directo en el Escritorio

## Método 1: Crear Acceso Directo (Recomendado)

1. **Navega a la carpeta biblioteca**:
   - Abre el Explorador de Windows
   - Ve a: `C:\Users\fabar\OneDrive\Escritorio\biblioteca`

2. **Crea el acceso directo**:
   - Haz clic derecho en `Iniciar_Biblioteca.bat`
   - Selecciona **"Enviar a" → "Escritorio (crear acceso directo)"**

3. **Listo**: Ahora tendrás un acceso directo en tu escritorio que funcionará correctamente.

## Método 2: Si el Método 1 No Funciona

1. **Haz clic derecho en el escritorio** → "Nuevo" → "Acceso directo"

2. **En "Ubicación del elemento", pega exactamente esto**:
   ```
   C:\Users\fabar\OneDrive\Escritorio\biblioteca\Iniciar_Biblioteca.bat
   ```

3. **Haz clic en "Siguiente"**

4. **Dale un nombre**: "Biblioteca Zen" (o el que prefieras)

5. **Haz clic en "Finalizar"**

6. **IMPORTANTE - Configurar el directorio de inicio**:
   - Haz clic derecho en el acceso directo recién creado
   - Selecciona "Propiedades"
   - En el campo **"Iniciar en:"** pega:
     ```
     C:\Users\fabar\OneDrive\Escritorio\biblioteca
     ```
   - Haz clic en "Aceptar"

## Verificar que Funciona

1. Haz doble clic en el acceso directo del escritorio
2. Deberías ver:
   - Una ventana que dice "Iniciando Biblioteca Zen"
   - Una ventana nueva con el servidor backend
   - Una ventana nueva con la aplicación Angular
3. Espera unos segundos y abre tu navegador en: http://localhost:4200

## Solución de Problemas

### Si dice "No se encuentra la carpeta 'server'"
- El script no está en el lugar correcto
- Asegúrate de que el acceso directo apunte a la ruta correcta
- Verifica que el campo "Iniciar en:" esté configurado correctamente

### Si los puertos ya están en uso
- Cierra todas las ventanas de comandos abiertas
- Abre el Administrador de tareas (Ctrl+Shift+Esc)
- Busca procesos "node.exe" y ciérralos
- Intenta de nuevo

### Si no se abre el navegador automáticamente
- Abre manualmente tu navegador
- Ve a: http://localhost:4200
