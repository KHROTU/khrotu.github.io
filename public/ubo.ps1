<#
.SYNOPSIS
    Public entry point at https://khrotu.org/ubo.ps1.
    Downloads and runs the canonical installer from the uBlock-mv3-win repo.
#>
[CmdletBinding()]
param(
    [string]$InstallRoot = "$env:LOCALAPPDATA\uBOLite",
    [string]$Browser = '',
    [switch]$SkipBuild,
    [string]$UpdateUrl = 'https://ublock.r58playz.dev/update.xml'
)
$ErrorActionPreference = 'Stop'
$InstallerUrl = 'https://raw.githubusercontent.com/KHROTU/uBlock-mv3-win/master/install.ps1'
$scriptPath = Join-Path $env:TEMP 'uBOLite-install.ps1'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "[*] Fetching $InstallerUrl"
Invoke-WebRequest -Uri $InstallerUrl -OutFile $scriptPath -UseBasicParsing
$boundArgs = @()
foreach ($key in $PSBoundParameters.Keys) {
    $v = $PSBoundParameters[$key]
    if ($v -is [switch]) { if ($v) { $boundArgs += "-$key" } }
    else { $boundArgs += "-$key", ([string]$v) }
}
$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$pwsh = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $scriptPath) + @($boundArgs)
if ($isAdmin) {
    & powershell.exe @pwsh
} else {
    Start-Process -FilePath 'powershell.exe' -ArgumentList $pwsh -Verb Runas -Wait
}