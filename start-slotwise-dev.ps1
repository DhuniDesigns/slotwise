$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot
$env:Path = "C:\Program Files\nodejs;$env:SystemRoot\System32;$env:SystemRoot;$env:Path"

& "C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" dev
