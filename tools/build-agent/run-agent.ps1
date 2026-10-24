<#
.SYNOPSIS
Runs this machine's Azure Pipelines Linux agent: a fresh container for every job, until Ctrl+C (#2212).

.DESCRIPTION
Asks once for a personal access token, without echoing it, then starts the agent image one container at a
time. Each container registers the agent, runs one job, removes the agent and exits; this script then starts
the next. See README.md for the guard rails, which are set here.

.PARAMETER AgentName
The agent's name in the pool: the machine's short name and a number, e.g. lab-1 or home-1 (or lab-test for a
test beside a running agent). It is shown in
every job's log, which is public, so never the computer's own hostname.

.EXAMPLE
powershell -File tools/build-agent/run-agent.ps1 -AgentName lab-1
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z][a-z0-9]*-([0-9]+|test)$')]
  [string]$AgentName,
  [string]$Url = 'https://dev.azure.com/tamugeoinnovation',
  [string]$Pool = 'Linux-Build',
  [string]$Image = 'tamu-gisc/build-agent:latest',
  [string]$EgressImage = 'tamu-gisc/build-agent-egress:latest'
)

$ErrorActionPreference = 'Stop'
# Named after the agent, so two agents on one machine, or a test beside a running agent, never collide.
$container = "tamu-build-agent-$AgentName"

# The agent's network has no route out (--internal); the egress proxy, on this network and Docker's default
# bridge, is its only way to the internet, and refuses every private and local address (see egress/squid.conf).
# The subnet is fixed because squid.conf allows only it.
$network = 'tamu-agent-internal'
$subnet = '172.31.250.0/24'
$proxy = 'tamu-agent-egress'
$proxyIp = '172.31.250.2'
$proxyUrl = "http://${proxy}:3128"

# Creates the network and starts the proxy if either is missing. Run before every job, so a restart of Docker
# (or of the machine) while this script runs is recovered from rather than leaving the agent with no way out.
function Confirm-Egress {
  if (-not (docker network ls -q --filter "name=^$network$")) {
    docker network create --internal --subnet $subnet $network | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not create the network '$network'." }
  }
  if (-not (docker ps -aq --filter "name=^$proxy$")) {
    docker run -d --name $proxy --restart unless-stopped `
      --memory 512m --cpus 1 --cap-drop ALL --security-opt no-new-privileges `
      $EgressImage | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not start the egress proxy. Is '$EgressImage' built (README, step 3)?" }
  }
  if (-not (docker ps -q --filter "name=^$proxy$")) {
    docker start $proxy | Out-Null
  }
  $networks = (docker inspect --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' $proxy).Trim().Split(' ')
  if ($networks -notcontains $network) {
    docker network connect --ip $proxyIp $network $proxy
    if ($LASTEXITCODE -ne 0) { Write-Error "Could not connect the egress proxy to '$network'." }
  }
}

$secure = Read-Host -AsSecureString -Prompt 'Azure DevOps personal access token (scope: Agent Pools, read & manage)'
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
        --memory 24g --memory-swap 24g --cpus 16 --pids-limit 8192 `
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
