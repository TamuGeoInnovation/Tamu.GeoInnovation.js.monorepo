# Runs a non-Claude listener (Copilot CLI, Codex CLI, ...) for each new batch, so it cannot go silent.
#
# Why: a chat agent does nothing between messages. On 24 October copilot-home ended its turn after a 9-minute foreground poll and
# sat idle for 37 hours with batches waiting (its report 2026-10-25-why-silent.md). A background watcher keeps a heartbeat alive but
# cannot wake a chat agent. So this script is the listener: it watches work-mailbox and starts the agent non-interactively, once per
# change to <name>/TASKS.md or DIRECTOR.md, and again until the agent reports nothing left. DIRECTOR.md, "Checking in", says when to use it.
#
# Start it once, in its own PowerShell window, on the machine the agent runs on (Windows PowerShell 5.1 or later):
#   powershell -ExecutionPolicy Bypass -File tools\agent-runner.ps1 -Name copilot-home -Repo C:\TAMU\copilot-home
#   powershell -ExecutionPolicy Bypass -File tools\agent-runner.ps1 -Name codex-home -Repo C:\TAMU\codex-home -Agent codex
# Ctrl+C stops it. Logs: %LOCALAPPDATA%\tamu-agent-runner\logs\. It never handles a token or password: the agent uses its own sign-in.
param(
  [Parameter(Mandatory = $true)][string]$Name,        # the participant's folder on work-mailbox: copilot-home, codex-home, ...
  [Parameter(Mandatory = $true)][string]$Repo,        # the agent's own clone of the monorepo, with an 'origin' remote
  [ValidateSet('copilot', 'codex')][string]$Agent = 'copilot',
  [int]$PollSeconds = 120,                            # how often to look for a new batch
  [int]$HeartbeatMinutes = 30,                        # how often to check in while idle (tools/heartbeat.sh)
  [int]$MaxRunsPerChange = 3,                         # re-runs while the agent says batches are left, per change
  [string]$GitBash = 'C:\Program Files\Git\bin\bash.exe'
)
$ErrorActionPreference = 'Stop'
$home_ = Join-Path $env:LOCALAPPDATA 'tamu-agent-runner'
$logs = Join-Path $home_ 'logs'
$state = Join-Path $home_ "$Name.last"
$mailbox = Join-Path $home_ "mailbox-$Name"            # a detached worktree of work-mailbox, for heartbeats only
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Log([string]$m) { $line = "{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m; Write-Host $line; Add-Content -Path (Join-Path $logs "$Name-runner.log") -Value $line }

function Latest-Change {
  git -C $Repo fetch -q origin work-mailbox 2>$null
  return (git -C $Repo log -1 --format=%H origin/work-mailbox -- "$Name/TASKS.md" DIRECTOR.md).Trim()
}

function Ensure-Mailbox {
  if (-not (Test-Path (Join-Path $mailbox '.git'))) {
    git -C $Repo fetch -q origin work-mailbox
    git -C $Repo worktree add -q --detach $mailbox origin/work-mailbox | Out-Null
  }
  git -C $mailbox fetch -q origin work-mailbox
  git -C $mailbox checkout -q --detach origin/work-mailbox 2>$null
}

function Heartbeat([string]$status, [int]$nextMinutes) {
  try {
    Ensure-Mailbox
    & $GitBash -lc "cd '$($mailbox -replace '\\','/')' && bash tools/heartbeat.sh '$Name' '$status' $nextMinutes" 2>&1 | ForEach-Object { Log "heartbeat: $_" }
  } catch { Log "heartbeat failed: $_" }
}

$prompt = "You are the listener '$Name' (see DIRECTOR.md on the work-mailbox branch). In $Repo, fetch origin, check out work-mailbox and pull it. " +
  "Read DIRECTOR.md and $Name/TASKS.md. Do every batch in $Name/TASKS.md that you have not yet reported and that no heading or note marks as withdrawn, in number order, without asking anyone: " +
  "for each, push '${Name}: started' to $Name/STATUS.md, do it, write its report under $Name/reports/, and push '${Name}: batch N done'. " +
  "Respect every rule in DIRECTOR.md and CLAUDE.md (no pull requests, no merges, no force-push, branches only to 'fork', never print a token). " +
  "If something blocks a batch, push a report saying what, and go on to the next. When none is left, end your reply with the line NOTHING LEFT."

function Run-Agent {
  $log = Join-Path $logs ("{0}-{1}.log" -f $Name, (Get-Date -Format 'yyyyMMdd-HHmmss'))
  Log "starting $Agent (log $log)"
  Push-Location $Repo
  try {
    if ($Agent -eq 'copilot') {
      & copilot -p $prompt --allow-all-tools --allow-all-paths --deny-tool 'shell(git push --force)' --deny-tool 'shell(gh pr merge)' --deny-tool 'shell(gh pr create)' *>&1 | Tee-Object -FilePath $log | Out-Null
    } else {
      & codex exec --full-auto $prompt *>&1 | Tee-Object -FilePath $log | Out-Null
    }
    $code = $LASTEXITCODE
  } finally { Pop-Location }
  $nothingLeft = Select-String -Path $log -Pattern 'NOTHING LEFT' -Quiet
  Log "$Agent exited $code; nothing left: $nothingLeft"
  return $nothingLeft
}

Log "agent-runner for $Name ($Agent) in $Repo; polling every $PollSeconds s"
$last = if (Test-Path $state) { (Get-Content $state -Raw).Trim() } else { '' }
$lastBeat = [datetime]::MinValue
while ($true) {
  try {
    $now = Latest-Change
    if ($now -and $now -ne $last) {
      Log "new commit for ${Name}: $now"
      Heartbeat 'running (agent-runner)' 120
      for ($i = 1; $i -le $MaxRunsPerChange; $i++) {
        if (Run-Agent) { break }
        Log "batches may be left; run $i of $MaxRunsPerChange done"
      }
      $last = $now
      Set-Content -Path $state -Value $last
      Heartbeat 'idle' ($HeartbeatMinutes + 15)
      $lastBeat = Get-Date
    } elseif (((Get-Date) - $lastBeat).TotalMinutes -ge $HeartbeatMinutes) {
      Heartbeat 'idle' ($HeartbeatMinutes + 15)
      $lastBeat = Get-Date
    }
  } catch { Log "error: $_" }
  Start-Sleep -Seconds $PollSeconds
}
