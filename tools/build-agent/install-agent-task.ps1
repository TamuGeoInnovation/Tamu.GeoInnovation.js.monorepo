<#
.SYNOPSIS
Runs this machine's build agent in the background from logon, with no window and no token prompt (#2212).

.DESCRIPTION
Registers a scheduled task, "tamu-build-agent-<AgentName>", that starts at this user's logon and runs
agent-task.ps1 hidden: it waits for Docker, then keeps run-agent.ps1 running with the token save-agent-token.ps1
stored. The scripts are copied to $env:LOCALAPPDATA\tamu-build-agent\bin, so switching the checkout's branch does
not change what the task runs; run this again after pulling a change to them. The images are not copied: build
them first (README, step 3).

The task runs only while this user is logged on, as this user, without elevation, because the token is protected
with this user's DPAPI key, which only an interactive logon unlocks.

-Uninstall stops the agent cleanly (it is removed from the pool) and deletes the task. The saved token is left;
delete $env:LOCALAPPDATA\tamu-build-agent\token.xml as well if the machine is leaving.

.EXAMPLE
powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-1

.EXAMPLE
powershell -File tools/build-agent/install-agent-task.ps1 -AgentName lab-1 -Uninstall
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z][a-z0-9]*-([0-9]+|test[0-9]?)$')]
  [string]$AgentName,
  [switch]$Uninstall,
  # Starts the task now as well as at every logon.
  [switch]$Start,
  # Where save-agent-token.ps1 saved the token; the default is where it saves it.
  [string]$TokenFile = (Join-Path $env:LOCALAPPDATA 'tamu-build-agent\token.xml'),
  [string]$Image = 'tamu-gisc/build-agent:latest',
  # Each agent's share of the machine: README, "How many agents fit".
  [string]$Memory = '14g',
  [int]$Cpus = 6
)

$ErrorActionPreference = 'Stop'

$taskName = "tamu-build-agent-$AgentName"
$home_ = Join-Path $env:LOCALAPPDATA 'tamu-build-agent'
$bin = Join-Path $home_ 'bin'
$container = "tamu-build-agent-$AgentName"

function Stop-Agent {
  if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $taskName
  }
  # Stopping the task ends its PowerShell processes; make sure none of this agent's is left: the copies in bin
  # running for this agent, and never this script itself.
  Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
    Where-Object {
      $_.ProcessId -ne $PID -and $_.CommandLine -like "*$bin\*" -and $_.CommandLine -like "*-AgentName $AgentName *"
    } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  # The container outlives them; 'docker stop' makes start.sh remove the agent from the pool, as Ctrl+C does.
  if (docker ps -q --filter "name=^$container$") {
    Write-Host "Stopping agent '$AgentName' and removing it from the pool..."
    docker stop --time 120 $container | Out-Null
  }
}

if ($Uninstall) {
  Stop-Agent
  if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Removed the task '$taskName'."
    if (Test-Path $TokenFile) {
      Write-Host "The saved token is still at $TokenFile; delete it too if this machine is leaving."
    }
  } else {
    Write-Host "There is no task '$taskName'."
  }
  exit 0
}

if (-not (Test-Path $tokenFile)) {
  Write-Error "No saved token at $tokenFile. Run save-agent-token.ps1 first."
}

# A reinstall replaces a running agent, so it is stopped cleanly first.
Stop-Agent

New-Item -ItemType Directory -Force -Path $bin | Out-Null
foreach ($script in 'run-agent.ps1', 'agent-task.ps1') {
  Copy-Item -Path (Join-Path $PSScriptRoot $script) -Destination $bin -Force
}

# conhost --headless runs PowerShell with no console window at all; -WindowStyle Hidden alone still flashes one.
$arguments = '--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -File "{0}" -AgentName {1} -TokenFile "{2}" -Image {3} -Memory {4} -Cpus {5}' -f `
  (Join-Path $bin 'agent-task.ps1'), $AgentName, $tokenFile, $Image, $Memory, $Cpus
$action = New-ScheduledTaskAction -Execute (Join-Path $env:SystemRoot 'System32\conhost.exe') -Argument $arguments
$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
# No time limit; if Windows cannot start it, try again every minute; never two copies at once; run on battery.
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries -Hidden

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal `
  -Settings $settings -Description "Azure Pipelines build agent '$AgentName' (#2212). See tools/build-agent/README.md." `
  -Force | Out-Null
Write-Host "Registered the task '$taskName': it starts at your logon, hidden. Logs: $(Join-Path $home_ 'logs')."

if ($Start) {
  Start-ScheduledTask -TaskName $taskName
  Write-Host 'Started it now.'
}
