' Script VBS para iniciar la Biblioteca Zen con indicador de progreso compacto
' Muestra una ventana pequeña y discreta mientras se inician los servidores

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtener el directorio del script
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Verificar que las carpetas existan
If Not fso.FolderExists(scriptPath & "\server") Or Not fso.FolderExists(scriptPath & "\angular-app") Then
    MsgBox "Error: No se encuentran las carpetas necesarias." & vbCrLf & "Este script debe estar en la carpeta 'biblioteca'", vbCritical, "Biblioteca Zen"
    WScript.Quit
End If

' Crear archivo temporal para mostrar progreso
progressFile = scriptPath & "\progress.hta"
Set objFile = fso.CreateTextFile(progressFile, True)
objFile.WriteLine "<html>"
objFile.WriteLine "<head>"
objFile.WriteLine "<title>Biblioteca Zen</title>"
objFile.WriteLine "<HTA:APPLICATION ID='oHTA' APPLICATIONNAME='Biblioteca Zen' BORDER='thin' BORDERSTYLE='normal' CAPTION='yes' MAXIMIZEBUTTON='no' MINIMIZEBUTTON='no' SYSMENU='no' SCROLL='no' SINGLEINSTANCE='yes' WINDOWSTATE='normal' />"
objFile.WriteLine "<style>"
objFile.WriteLine "body { font-family: 'Segoe UI', Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }"
objFile.WriteLine ".container { background: white; padding: 20px 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; min-width: 280px; }"
objFile.WriteLine "h1 { color: #333; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; }"
objFile.WriteLine ".progress-bar { background: #f0f0f0; height: 4px; border-radius: 4px; overflow: hidden; margin: 12px 0; }"
objFile.WriteLine ".progress-fill { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; animation: progress 7s linear forwards; }"
objFile.WriteLine "@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }"
objFile.WriteLine ".status { color: #888; font-size: 12px; margin-top: 8px; }"
objFile.WriteLine ".icon { font-size: 24px; margin-bottom: 8px; }"
objFile.WriteLine "</style>"
objFile.WriteLine "</head>"
objFile.WriteLine "<body>"
objFile.WriteLine "<div class='container'>"
objFile.WriteLine "<div class='icon'>📚</div>"
objFile.WriteLine "<h1>Iniciando Biblioteca...</h1>"
objFile.WriteLine "<div class='progress-bar'><div class='progress-fill'></div></div>"
objFile.WriteLine "<div class='status' id='status'>Preparando...</div>"
objFile.WriteLine "<script>"
objFile.WriteLine "window.resizeTo(450, 300);"
objFile.WriteLine "window.moveTo((screen.width - 450) / 2, (screen.height - 300) / 2);"
objFile.WriteLine "setTimeout(function() { document.getElementById('status').innerText = 'Cargando...'; }, 2000);"
objFile.WriteLine "setTimeout(function() { document.getElementById('status').innerText = 'Casi listo...'; }, 5000);"
objFile.WriteLine "setTimeout(function() { window.close(); }, 7500);"
objFile.WriteLine "</script>"
objFile.WriteLine "</div>"
objFile.WriteLine "</body>"
objFile.WriteLine "</html>"
objFile.Close

' Mostrar ventana de progreso
WshShell.Run "mshta.exe """ & progressFile & """", 1, False

' Iniciar el servidor backend (oculto)
WshShell.Run "cmd /c cd /d """ & scriptPath & "\server"" && npm start", 0, False

' Esperar 4 segundos
WScript.Sleep 2000

' Iniciar la aplicación Angular (oculto)
WshShell.Run "cmd /c cd /d """ & scriptPath & "\angular-app"" && npm start", 0, False

' Esperar 12 segundos para que Angular compile
WScript.Sleep 5000

' Abrir el navegador
WshShell.Run "http://localhost:4200", 1, False

' Esperar un poco más y eliminar archivo temporal
WScript.Sleep 1000
On Error Resume Next
fso.DeleteFile progressFile
On Error Goto 0
