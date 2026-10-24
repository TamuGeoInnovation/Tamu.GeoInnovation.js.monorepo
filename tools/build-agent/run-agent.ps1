<#
.SYNOPSIS
Runs this machine's Azure Pipelines Linux agent: a fresh container for every job, until Ctrl+C (#2212).

.DESCRIPTION
Reads the token save-agent-token.ps1 stored (-TokenFile), or asks for it once without echoing it, then starts
the agent image one container at a time. Each container registers the agent, runs one job, removes the agent
and exits; this script then starts the next. See README.md for the guard rails, which are set here.

.PARAMETER AgentName
The agent's name in the pool: the machine's short name and a number, e.g. lab-1 or home-1, or lab-test for a
test beside a running agent. It is shown in every job's log, which is public, so never the computer's own
hostname.

.PARAMETER TokenFile
A token saved by save-agent-token.ps1: a SecureString that only this user, on this machine, can read (DPAPI).
Without it, the script asks for the token.

Exit codes: 2 when Azure DevOps refuses the token (save a new one; retrying will not help), 1 for anything else.

.EXAMPLE
powershell -File tools/build-agent/run-agent.ps1 -AgentName lab-1

.EXAMPLE
powershell -File tools/build-agent/run-agent.ps1 -AgentName lab-1 -TokenFile "$env:LOCALAPPDATA\tamu-build-agent\token.xml"
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z][a-z0-9]*-([0-9]+|test[0-9]?)$')]
  [string]$AgentName,
  [string]$Url = 'https://dev.azure.com/tamugeoinnovation',
  [string]$Pool = 'Linux-Build',
  [string]$Image = 'tamu-gisc/build-agent:latest',
  [string]$EgressImage = 'tamu-gisc/build-agent-egress:latest',
  # Each agent's share of the machine: README, "How many agents fit".
  [string]$Memory = '14g',
  [int]$Cpus = 6,
  [string]$TokenFile
)

$ErrorActionPreference = 'Stop'
# Named after the agent, so two agents on one machine, or a test beside a running agent, never collide.
$container = "tamu-build-agent-$AgentName"

# Each agent has a network of its own with no route out (--internal), so agents cannot reach each other; the egress
# proxy, on every agent's network and on Docker's default bridge, is its only way to the internet, and refuses every
# private and local address (see egress/squid.conf). The subnet comes from the agent's name, so it is the same at
# every start: <machine>-<n> takes slot n (1 to 12), <machine>-test slot 13, -test2 slot 14 and -test3 slot 15; slot s
# is the /28 at 172.31.251.(16 s), which squid.conf allows.
$slot = 0
if ($AgentName -match '-(\d+)$') {
  if ([int]$Matches[1] -le 12) { $slot = [int]$Matches[1] }
} elseif ($AgentName -match '-test(\d?)$') {
  $slot = 12 + [Math]::Max(1, [int]('0' + $Matches[1]))
}
if ($slot -lt 1 -or $slot -gt 15) {
  Write-Error "'$AgentName' has no network slot: use <machine>-1 to <machine>-12, or <machine>-test, -test2, -test3."
}
$network = "tamu-agent-internal-$AgentName"
$subnet = "172.31.251.$(16 * $slot)/28"
$proxy = 'tamu-agent-egress'
$proxyIp = "172.31.251.$(16 * $slot + 2)"
$proxyUrl = "http://${proxy}:3128"
# The one network every agent shared before (#2212); removed once no agent is left on it.
$sharedNetwork = 'tamu-agent-internal'

# Creates the network and starts the proxy if either is missing. Run before every job, so a restart of Docker
# (or of the machine) while this script runs is recovered from rather than leaving the agent with no way out.
function Confirm-Egress {
  if (-not (docker network ls -q --filter "name=^$network$")) {
    docker network create --internal --subnet $subnet $network | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not create the network '$network' ($subnet): is another network using it?" }
  }
  if (-not (docker ps -aq --filter "name=^$proxy$")) {
    # Agents started together (two logon tasks) race to create it; losing that race is fine. 'Continue' because
    # under 'Stop' Windows PowerShell turns the loser's redirected error output into a terminating error.
    $ErrorActionPreference = 'Continue'
    docker run -d --name $proxy --restart unless-stopped `
      --memory 512m --cpus 1 --cap-drop ALL --security-opt no-new-privileges `
      $EgressImage 2>$null | Out-Null
    $created = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($created -ne 0 -and -not (docker ps -aq --filter "name=^$proxy$")) {
      Write-Error "Could not start the egress proxy. Is '$EgressImage' built (README, step 3)?"
    }
  }
  if (-not (docker ps -q --filter "name=^$proxy$")) {
    docker start $proxy | Out-Null
  }
  $networks = (docker inspect --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' $proxy).Trim().Split(' ')
  if ($networks -notcontains $network) {
    docker network connect --ip $proxyIp $network $proxy
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not connect the egress proxy to '$network'." }
  }
  # An agent still running the old scripts keeps the shared network; once only the proxy is left on it, it goes.
  if ($networks -contains $sharedNetwork) {
    $others = docker network inspect --format '{{range .Containers}}{{.Name}} {{end}}' $sharedNetwork
    if ("$others".Trim() -eq $proxy) {
      docker network disconnect $sharedNetwork $proxy | Out-Null
      docker network rm $sharedNetwork | Out-Null
    }
  }
}

if ($TokenFile) {
  # Import-Clixml turns the saved SecureString back into one; DPAPI refuses it to any other user or machine.
  $secure = Import-Clixml -Path $TokenFile
  if ($secure -isnot [System.Security.SecureString]) {
    Write-Error "'$TokenFile' does not hold a saved token. Run save-agent-token.ps1."
  }
} else {
  $secure = Read-Host -AsSecureString -Prompt 'Azure DevOps personal access token (scope: Agent Pools, read & manage)'
}
if ($secure.Length -eq 0) {
  Write-Error 'No token was entered.'
}

Write-Host "Starting agent '$AgentName' in pool '$Pool'. Press Ctrl+C to stop; the agent is removed from the pool as it stops."

$failures = 0
try {
  while ($true) {
    Confirm-Egress

    # The token is put in this process's environment only for the moment 'docker create' reads it, and is
    # passed by name (-e AZP_TOKEN), so it never appears on a command line.
    $env:AZP_TOKEN = [System.Net.NetworkCredential]::new('', $secure).Password
    try {
      # No mounts, no Docker socket, not privileged; on the internal network, so out only through the proxy;
      # every capability dropped except the three start.sh needs to run the agent as 'agent' and stop it;
      # memory and CPU capped. The proxy variables are for the job's tools: git, curl, npm, and Node itself.
      docker create --rm --name $container `
        --memory $Memory --memory-swap $Memory --cpus $Cpus --pids-limit 8192 `
        --security-opt no-new-privileges `
        --cap-drop ALL --cap-add SETUID --cap-add SETGID --cap-add KILL `
        --network $network `
        -e AZP_URL=$Url -e AZP_POOL=$Pool -e AZP_AGENT_NAME=$AgentName -e AZP_TOKEN `
        -e AZP_PROXY_URL=$proxyUrl `
        -e HTTP_PROXY=$proxyUrl -e HTTPS_PROXY=$proxyUrl -e http_proxy=$proxyUrl -e https_proxy=$proxyUrl `
        -e NODE_USE_ENV_PROXY=1 `
        $Image | Out-Null
    } finally {
      Remove-Item Env:AZP_TOKEN -ErrorAction SilentlyContinue
    }
    if ($LASTEXITCODE -ne 0) {
      Write-Error "docker create failed with exit code $LASTEXITCODE. Is the image built, or a container named '$container' left over?"
    }

    $started = Get-Date
    docker start --attach $container
    $code = $LASTEXITCODE
    $elapsed = [int]((Get-Date) - $started).TotalSeconds
    Write-Host "The agent's container exited with code $code after $elapsed seconds."

    # start.sh exits 77 when Azure refuses the token. Retrying cannot help, so stop and say what to do.
    if ($code -eq 77) {
      Write-Host 'Azure DevOps refused the token (expired, revoked or missing a scope). Create a new one and run save-agent-token.ps1 again.'
      exit 2
    }

    # A container that fails quickly every time (a wrong or expired token, an unreachable address) would
    # otherwise loop for ever.
    if ($code -ne 0 -and $elapsed -lt 120) {
      $failures++
      if ($failures -ge 3) {
        Write-Error 'The agent failed to start three times in a row. Stopping; see its output above.'
      }
      Start-Sleep -Seconds 30
    } else {
      $failures = 0
    }
  }
} finally {
  # Ctrl+C lands here. 'docker stop' sends TERM, so start.sh stops the agent and removes it from the pool.
  if (docker ps -q --filter "name=^$container$") {
    Write-Host 'Stopping the agent and removing it from the pool...'
    docker stop --time 120 $container | Out-Null
  }
  $secure.Dispose()
}
