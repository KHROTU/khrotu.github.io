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
$ProgressPreference = 'SilentlyContinue'
$InstallerUrl = 'https://raw.githubusercontent.com/KHROTU/uBlock-mv3-win/master/install.ps1'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$script = (Invoke-WebRequest -Uri $InstallerUrl -UseBasicParsing).Content
Invoke-Expression $script