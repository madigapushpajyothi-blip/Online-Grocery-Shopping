param([int]$Port = 8080)

$Listener = New-Object System.Net.HttpListener
$Prefix = "http://localhost:$Port/"
$Listener.Prefixes.Add($Prefix)

try {
    $Listener.Start()
} catch {
    Write-Error "Failed to start server on $Prefix : $_"
    exit 1
}

Write-Host "==================================================="
Write-Host " FreshCart Local Server is RUNNING"
Write-Host " URL: $Prefix"
Write-Host " Serving directory: $(Get-Location)"
Write-Host " Press Ctrl+C in this console to stop the server"
Write-Host "==================================================="

$MimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".webp"  = "image/webp"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = [System.Uri]::UnescapeDataString($Request.Url.LocalPath)
        if ($UrlPath -eq "/" -or [string]::IsNullOrEmpty($UrlPath)) {
            $UrlPath = "/index.html"
        }
        $UrlPath = $UrlPath.TrimStart('/') -replace '/', '\'
        $LocalFile = Join-Path (Get-Location) $UrlPath

        if (Test-Path $LocalFile -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($LocalFile).ToLower()
            $ContentType = $MimeTypes[$Ext]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }
            $Response.ContentType = $ContentType

            # Cache-Control for clean local development
            $Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $Response.AddHeader("Access-Control-Allow-Origin", "*")

            $Bytes = [System.IO.File]::ReadAllBytes($LocalFile)
            $Response.ContentLength64 = $Bytes.Length
            $Response.StatusCode = 200
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $NotFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>The requested file $UrlPath does not exist.</p>")
            $Response.ContentType = "text/html; charset=utf-8"
            $Response.ContentLength64 = $NotFoundMsg.Length
            $Response.OutputStream.Write($NotFoundMsg, 0, $NotFoundMsg.Length)
        }

        $Response.OutputStream.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
}
