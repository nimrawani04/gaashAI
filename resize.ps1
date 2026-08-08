Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:\kashmiriBot\public\favicon.png")
$bmp = New-Object System.Drawing.Bitmap 32, 32
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.DrawImage($img, 0, 0, 32, 32)
$bmp.Save("d:\kashmiriBot\public\favicon_small.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graph.Dispose()
$bmp.Dispose()
$img.Dispose()
Remove-Item "d:\kashmiriBot\public\favicon.png"
Rename-Item "d:\kashmiriBot\public\favicon_small.png" "favicon.png"
