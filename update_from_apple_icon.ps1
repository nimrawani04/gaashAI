Add-Type -AssemblyName System.Drawing

$projectRoot = Get-Location
$srcPath = Join-Path $projectRoot "public\apple-touch-icon.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "apple-touch-icon.png not found at $srcPath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($sourceImg, $width, $height, $outputPath, $format) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graph.DrawImage($sourceImg, 0, 0, $width, $height)
    $bmp.Save($outputPath, $format)
    
    $graph.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outputPath ($width x $height)"
}

$pngFormat = [System.Drawing.Imaging.ImageFormat]::Png
$jpegFormat = [System.Drawing.Imaging.ImageFormat]::Jpeg

Resize-Image $img 64 64 (Join-Path $projectRoot "public\favicon.png") $pngFormat
Resize-Image $img 32 32 (Join-Path $projectRoot "public\favicon.ico") $pngFormat
Resize-Image $img 192 192 (Join-Path $projectRoot "public\app-icon-192.png") $pngFormat
Resize-Image $img 512 512 (Join-Path $projectRoot "public\app-icon-512.png") $pngFormat
Resize-Image $img 512 512 (Join-Path $projectRoot "public\chinar-leaf.png") $pngFormat
Resize-Image $img 512 512 (Join-Path $projectRoot "public\chinar-leaf.jpg") $jpegFormat

$img.Dispose()
Write-Host "All assets updated from apple-touch-icon.png successfully."
