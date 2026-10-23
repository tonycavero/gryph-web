$destDir = "$env:LOCALAPPDATA\Programs\Git"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$zipPath = "$env:TEMP\mingit.zip"

Write-Host "Fetching latest MinGit release metadata from GitHub..."
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/git-for-windows/git/releases/latest" -Headers @{ "User-Agent" = "PowerShell" }
$asset = $release.assets | Where-Object { $_.name -like "MinGit*64-bit.zip" } | Select-Object -First 1

if (-not $asset) {
    Write-Host "Could not find MinGit zip asset in latest release."
    exit 1
}

Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting to $destDir..."
Expand-Archive -Path $zipPath -DestinationPath $destDir -Force

Remove-Item $zipPath -Force

$gitExe = "$destDir\cmd\git.exe"
if (Test-Path $gitExe) {
    Write-Host "MinGit successfully installed at: $gitExe"
    # Add to User PATH if not already present
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $cmdDir = "$destDir\cmd"
    if ($userPath -notlike "*$cmdDir*") {
        $newUserPath = "$cmdDir;$userPath"
        [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
        Write-Host "Added $cmdDir to User PATH."
    }
} else {
    Write-Host "Failed to verify git.exe at $gitExe"
    exit 1
}
