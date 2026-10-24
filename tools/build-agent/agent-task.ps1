<#
.SYNOPSIS
What the logon task runs: waits for Docker, then keeps run-agent.ps1 running in the background (#2212).

.DESCRIPTION
Started hidden by the scheduled task install-agent-task.ps1 registers. It waits until Docker answers (Docker
Desktop may still be starting at logon), runs run-agent.ps1 with the saved token, and starts it again a minute
after it stops, unless it stopped because Azure DevOps refused the token, which retrying cannot fix. Everything
it and the agent print goes to a log under $env:LOCALAPPDATA\tamu-build-agent\logs; the token never does.
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$AgentName,
  [string]$TokenFile = (Join-Path $env:LOCALAPPDATA 'tamu-build-agent\token.xml'),
  [string]$Image = 'tamu-gisc/build-agent:latest'
)

$ErrorActionPreference = 'Stop'

$logs = Join-Path $env:LOCALAPPDATA 'tamu-build-agent\logs'
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$log = Join-Path $logs ("agent-$AgentName-" + (Get-Date -Format 'yyyy-MM-dd-HHmmss') + '.log')

# Keeps the twenty newest logs for this agent.
Get-ChildItem -Path $logs -Filter "agent-$AgentName-*.log" | Sort-Object Name -Descending | Select-Object -Skip 20 |
  Remove-Item -ErrorAction SilentlyContinue

function Write-Log([string]$Line) {
  Add-Content -Path $log -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $Line" -Encoding UTF8
}

function Wait-Docker {
  $waited = 0
  while ($true) {
    docker info --format '{{.ServerVersion}}' 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { return }
    if ($waited % 60 -eq 0) { Write-Log "Waiting for Docker to answer ($waited s so far)." }
    Start-Sleep -Seconds 10
    $waited += 10
  }
}

$runAgent = Join-Path $PSScriptRoot 'run-agent.ps1'
Write-Log "Started for agent '$AgentName'."

if (-not (Test-Path $TokenFile)) {
  Write-Log "No saved token at $TokenFile. Run save-agent-token.ps1, then start the task again. Stopped."
  exit 2
}

while ($true) {
  Wait-Docker
  Write-Log 'Docker is up; starting run-agent.ps1.'

  # Each line the supervisor and the agent print is timestamped into the log. 'Continue' because Windows
  # PowerShell turns a native command's stderr, redirected, into errors, and under 'Stop' the first one (the
  # agent's own error output) would end this script.
  $ErrorActionPreference = 'Continue'
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runAgent -AgentName $AgentName -TokenFile $TokenFile -Image $Image 2>&1 |
    ForEach-Object { Write-Log "$_" }
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  Write-Log "run-agent.ps1 exited with code $code."

  if ($code -eq 2) {
    Write-Log 'Azure DevOps refused the token. Run save-agent-token.ps1 with a new token, then start the task again. Stopped.'
    exit 2
  }

  Write-Log 'Starting it again in 60 seconds.'
  Start-Sleep -Seconds 60
}
