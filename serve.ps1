# serve.ps1 — שרת קבצים סטטי מינימלי ב-PowerShell, בלי תלות בתוכנות חוץ

$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | Select-Object -First 1).IPAddress
Write-Host "השרת רץ. פתחו בטלפון (אותו Wi-Fi):"
Write-Host "  http://$ip`:$port/index.html"
Write-Host "לעצירה: Ctrl+C"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".json" = "application/json"
  ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $req = $context.Request
  $res = $context.Response

  $path = $req.Url.LocalPath
  if ($path -eq "/") { $path = "/index.html" }
  $filePath = Join-Path $root $path.TrimStart("/")

  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath)
    $contentType = $mime[$ext]
    if (-not $contentType) { $contentType = "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $res.ContentType = $contentType
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
  }
  $res.Close()
}
