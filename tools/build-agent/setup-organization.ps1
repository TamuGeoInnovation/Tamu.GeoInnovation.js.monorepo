<#
.SYNOPSIS
Once per organization: creates the Linux-Build agent pool and sets the Monorepo pipeline's fork settings (#2212).

.DESCRIPTION
Run by the maintainer, who types the token at a hidden prompt. Safe to run twice: it leaves the pool alone
if it exists, and changes the pipeline only where a setting differs. -DryRun prints what it would change and
changes nothing.

The fork settings are what keep a fork's pull request from reaching anything secret on a machine of ours:
secrets are not given to fork builds, and a pull request from someone outside the team builds only after a
team member comments on it.

.EXAMPLE
powershell -File tools/build-agent/setup-organization.ps1 -DryRun
#>
param(
  [string]$Organization = 'https://dev.azure.com/tamugeoinnovation',
  [string]$Project = 'tamu.geoinnovation.js.monorepo',
  [string]$Pool = 'Linux-Build',
  # The Monorepo pipeline.
  [int]$DefinitionId = 19,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$api = 'api-version=7.1'

$secure = Read-Host -AsSecureString -Prompt 'Azure DevOps personal access token (scopes: Agent Pools read & manage, Build read & execute)'
if ($secure.Length -eq 0) {
  Write-Error 'No token was entered.'
}

# The header is built in memory and never printed or written anywhere.
$headers = @{
  Authorization = 'Basic ' + [Convert]::ToBase64String(
    [Text.Encoding]::ASCII.GetBytes(':' + [System.Net.NetworkCredential]::new('', $secure).Password))
}

function Invoke-Azure([string]$Method, [string]$Uri, $Body) {
  $request = @{ Method = $Method; Uri = $Uri; Headers = $headers; ContentType = 'application/json' }
  if ($null -ne $Body) {
    $request.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 100))
  }
  Invoke-RestMethod @request
}

try {
  # 1. The pool. autoProvision adds it to every project, so the pipeline can ask for it by name.
  $existing = Invoke-Azure GET "$Organization/_apis/distributedtask/pools?poolName=$Pool&$api"
  if ($existing.count -gt 0) {
    Write-Host "Pool '$Pool' exists (id $($existing.value[0].id)); left as it is."
  } elseif ($DryRun) {
    Write-Host "Would create pool '$Pool'."
  } else {
    $created = Invoke-Azure POST "$Organization/_apis/distributedtask/pools?$api" @{ name = $Pool; autoProvision = $true }
    Write-Host "Created pool '$Pool' (id $($created.id))."
  }

  # 2. The pipeline's pull request trigger: build forks, without secrets, and only after a team member's comment
  #    for anyone outside the team.
  $definition = Invoke-Azure GET "$Organization/$Project/_apis/build/definitions/$($DefinitionId)?$api"
  $trigger = @($definition.triggers | Where-Object { $_.triggerType -eq 'pullRequest' })[0]
  if ($null -eq $trigger) {
    Write-Error "Pipeline '$($definition.name)' has no pull request trigger to set. Set it in the pipeline's Triggers page."
  }

  $wanted = [ordered]@{
    'forks.enabled'                        = $true
    'forks.allowSecrets'                   = $false
    'forks.allowFullAccessToken'           = $false
    'isCommentRequiredForPullRequest'      = $true
    'requireCommentsForNonTeamMembersOnly' = $true
  }
  $changes = @()
  foreach ($name in $wanted.Keys) {
    $parts = $name.Split('.')
    $holder = $trigger
    if ($parts.Count -eq 2) {
      if ($null -eq $trigger.forks) {
        $trigger | Add-Member -NotePropertyName forks -NotePropertyValue ([pscustomobject]@{})
      }
      $holder = $trigger.forks
    }
    $leaf = $parts[-1]
    $current = $holder.PSObject.Properties[$leaf]
    if ($null -eq $current -or $current.Value -ne $wanted[$name]) {
      $changes += "$name : $(if ($null -eq $current) { '(unset)' } else { $current.Value }) -> $($wanted[$name])"
      $holder | Add-Member -NotePropertyName $leaf -NotePropertyValue $wanted[$name] -Force
    }
  }

  if ($changes.Count -eq 0) {
    Write-Host "Pipeline '$($definition.name)' already has the fork settings; left as it is."
  } else {
    Write-Host "Pipeline '$($definition.name)' (revision $($definition.revision)):"
    $changes | ForEach-Object { Write-Host "  $_" }
    if ($DryRun) {
      Write-Host 'Dry run: nothing changed.'
    } else {
      $saved = Invoke-Azure PUT "$Organization/$Project/_apis/build/definitions/$($DefinitionId)?$api" $definition
      Write-Host "Saved as revision $($saved.revision)."
    }
  }
} finally {
  $headers = $null
  $secure.Dispose()
}
