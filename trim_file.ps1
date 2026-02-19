$file = "c:\Users\Admin\Documents\VSCode\Aurora_rebirth\src\components\brand\ArcPanelLogoLab.tsx"
$lines = Get-Content $file -TotalCount 1770
$lines | Set-Content $file -Encoding UTF8
Write-Host "File trimmed to 1770 lines"
