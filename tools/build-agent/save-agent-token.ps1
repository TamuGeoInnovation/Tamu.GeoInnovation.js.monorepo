<#
.SYNOPSIS
Saves the build agent's Azure DevOps token once, so the agent can start without asking (#2212).

.DESCRIPTION
Asks for the token without echoing it and writes it, as a SecureString, to
$env:LOCALAPPDATA\tamu-build-agent\token.xml. Export-Clixml protects a SecureString with DPAPI, so the file can be
read back only by this user on this machine; the file's permissions also allow only this user. The token is never
printed, and never written anywhere else.

Run it again to replace the token, for example when it reaches its 90 days. A running agent picks the new token up
when it next starts (install-agent-task.ps1 restarts it at the next logon, or run the task by hand).

.EXAMPLE
powershell -File tools/build-agent/save-agent-token.ps1
#>
param(
  [string]$Path = (Join-Path $env:LOCALAPPDATA 'tamu-build-agent\token.xml')
)

$ErrorActionPreference = 'Stop'

$secure = Read-Host -AsSecureString -Prompt 'Azure DevOps personal access token (scopes: Agent Pools read & manage, Build read & execute)'
if ($secure.Length -eq 0) {
  Write-Error 'No token was entered; nothing was saved.'
}

$folder = Split-Path -Parent $Path
New-Item -ItemType Directory -Force -Path $folder | Out-Null

# The permissions are set on an empty file before the token is written to it, so it is never readable by anyone
# else, even briefly: inheritance off, and full control for this user alone.
if (-not (Test-Path $Path)) {
  New-Item -ItemType File -Path $Path | Out-Null
}
$me = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
$acl = New-Object System.Security.AccessControl.FileSecurity
$acl.SetAccessRuleProtection($true, $false)
$acl.SetOwner($me)
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($me, 'FullControl', 'Allow')))
Set-Acl -Path $Path -AclObject $acl

$secure | Export-Clixml -Path $Path
$secure.Dispose()

Write-Host "Saved. Only $([System.Security.Principal.WindowsIdentity]::GetCurrent().Name), on this machine, can read $Path."
