@echo off
setlocal

cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%SystemRoot%\System32;%SystemRoot%;%PATH%"

"C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" dev
