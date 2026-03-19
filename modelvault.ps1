$ProjectRoot = $PSScriptRoot
$AppHostProject = "$ProjectRoot\ModelVault.AppHost\ModelVault.AppHost.csproj"
$PidFile = "$ProjectRoot\.apphost.pid"

function Get-AppHostProcess {
    if (Test-Path $PidFile) {
        $savedPid = Get-Content $PidFile -Raw
        $proc = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
        if ($proc -and $proc.Name -match "dotnet") { return $proc }
        Remove-Item $PidFile -ErrorAction SilentlyContinue
    }
    return $null
}

function Get-AppStatus {
    $proc = Get-AppHostProcess
    if ($proc) { return "RUNNING (PID $($proc.Id))" }
    return "STOPPED"
}

function Start-App {
    $existing = Get-AppHostProcess
    if ($existing) {
        Write-Host "  App is already running (PID $($existing.Id))" -ForegroundColor Yellow
        return
    }
    Write-Host "  Starting LocalDB..." -ForegroundColor Cyan
    sqllocaldb start MSSQLLocalDB | Out-Null
    Write-Host "  Starting ModelVault AppHost..." -ForegroundColor Cyan
    $proc = Start-Process "dotnet" -ArgumentList "run --project `"$AppHostProject`"" `
        -PassThru -WindowStyle Normal
    $proc.Id | Set-Content $PidFile
    Write-Host "  Started (PID $($proc.Id))" -ForegroundColor Green
    Write-Host "  Check the new window for the dashboard login URL" -ForegroundColor Gray
}

function Stop-App {
    $proc = Get-AppHostProcess
    if (-not $proc) {
        Write-Host "  App is not running" -ForegroundColor Yellow
        $orphans = Get-WmiObject Win32_Process -Filter "Name='dotnet.exe'" |
            Where-Object { $_.CommandLine -match "ModelVault.AppHost" }
        if ($orphans) {
            foreach ($o in $orphans) {
                Write-Host "  Stopping orphaned process (PID $($o.ProcessId))..." -ForegroundColor Yellow
                Stop-Process -Id $o.ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
        return
    }
    Write-Host "  Stopping ModelVault (PID $($proc.Id))..." -ForegroundColor Cyan
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Get-WmiObject Win32_Process -Filter "Name='dotnet.exe'" |
        Where-Object { $_.CommandLine -match "ModelVault" } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Remove-Item $PidFile -ErrorAction SilentlyContinue
    Write-Host "  Stopped" -ForegroundColor Green
}

function Show-Menu {
    $status = Get-AppStatus
    $statusColor = if ($status -like "RUNNING*") { "Green" } else { "Red" }

    Clear-Host
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════╗" -ForegroundColor DarkGreen
    Write-Host "  ║       3DModelVault Manager       ║" -ForegroundColor DarkGreen
    Write-Host "  ╚══════════════════════════════════╝" -ForegroundColor DarkGreen
    Write-Host ""
    Write-Host "  Status: " -NoNewline
    Write-Host $status -ForegroundColor $statusColor
    Write-Host ""
    Write-Host "  [1]  Start" -ForegroundColor White
    Write-Host "  [2]  Stop" -ForegroundColor White
    Write-Host "  [3]  Restart" -ForegroundColor White
    Write-Host "  [Q]  Quit" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  > " -NoNewline
}

while ($true) {
    Show-Menu
    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown").Character

    switch ($key) {
        "1" { Write-Host ""; Start-App }
        "2" { Write-Host ""; Stop-App }
        "3" { Write-Host ""; Stop-App; Start-Sleep -Seconds 1; Start-App }
        { $_ -in "q", "Q" } { Clear-Host; exit }
    }

    if ($key -in "1","2","3") {
        Write-Host ""
        Write-Host "  Press any key to continue..." -ForegroundColor DarkGray
        $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    }
}
