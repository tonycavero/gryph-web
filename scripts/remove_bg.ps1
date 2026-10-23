Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Dell\.gemini\antigravity\brain\65bbaf59-9a29-4501-bc71-58e483765a16\.user_uploaded\media_1792794065950_e4cbebba.jpg"
$destPath = "c:\Users\Dell\Projects\trazzo-hub\public\logo.png"

$orig = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $orig.Width
$height = $orig.Height

# Find bounding box of non-white pixels (the egg)
$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$padding = 8
$cropX = [Math]::Max(0, $minX - $padding)
$cropY = [Math]::Max(0, $minY - $padding)
$cropW = [Math]::Min($width - $cropX, ($maxX - $minX + 1) + ($padding * 2))
$cropH = [Math]::Min($height - $cropY, ($maxY - $minY + 1) + ($padding * 2))

# Create transparent ARGB Bitmap
$result = New-Object System.Drawing.Bitmap $cropW, $cropH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $origX = $cropX + $x
        $origY = $cropY + $y
        $c = $orig.GetPixel($origX, $origY)

        $lum = ($c.R + $c.G + $c.B) / 3.0
        
        if ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) {
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $alphaRatio = (245.0 - $lum) / 25.0
            $alpha = [int]([Math]::Max(0.0, [Math]::Min(255.0, $alphaRatio * 255.0)))
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

$orig.Dispose()

$result.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved transparent logo to $destPath"

# Save square version
$maxDim = [Math]::Max($cropW, $cropH)
$square = New-Object System.Drawing.Bitmap $maxDim, $maxDim, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($square)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$offX = [int](($maxDim - $cropW) / 2)
$offY = [int](($maxDim - $cropH) / 2)
$g.DrawImage($result, $offX, $offY, $cropW, $cropH)
$g.Dispose()

$squarePath = "c:\Users\Dell\Projects\trazzo-hub\public\logo-square.png"
$square.Save($squarePath, [System.Drawing.Imaging.ImageFormat]::Png)

# Generate favicon.ico
$thumb = New-Object System.Drawing.Bitmap 64, 64, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gt = [System.Drawing.Graphics]::FromImage($thumb)
$gt.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gt.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gt.DrawImage($square, 0, 0, 64, 64)
$gt.Dispose()

$hIcon = $thumb.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoPath = "c:\Users\Dell\Projects\trazzo-hub\public\favicon.ico"
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$thumb.Dispose()
$square.Dispose()
$result.Dispose()

Write-Host "Favicon generated successfully at $icoPath"
