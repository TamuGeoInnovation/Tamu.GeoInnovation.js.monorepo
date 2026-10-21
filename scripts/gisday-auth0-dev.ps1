<#
  Builds the GIS Day development Auth0 tenant (txgisday-dev) so the local site signs in without the
  production tenant (#1623). Run it in PowerShell; it talks only to https://txgisday-dev.us.auth0.com
  and never to production. docs/gisday-local.md says when and how.

  It asks for the "GIS Day dev setup" machine-to-machine application's Client ID and Client Secret
  (hidden), then creates or updates, each only if missing or different:

    - API "GIS Day API (development)", identifier gisday.dev.api, with role-based access on and the
      permissions added to the access token: the 50 permissions the GIS Day API checks.
    - The six roles the site knows. GIS Day Admin gets every permission; the others start empty.
    - Application "GIS Day (local development)", a single-page app that returns to http://localhost:4201
      and its /callback page.
    - Action "Add GIS Day roles to tokens" on post-login: puts the user's roles in the
      geoservices.prod/roles claim, the name the site reads.
    - Test user claude-test-admin@txgisday-dev.test with the GIS Day Admin role and a generated password.

  It writes auth0-dev.local.env in GISDAY_LOCAL_DIR (default C:\TAMU\gisday-local), OUTSIDE the
  repository: the dev-tenant settings scripts/gisday-local.sh passes to the API, the management
  credentials and the test user's password. A report without secrets goes in the same folder. Running it
  again resets the test user's password and rewrites that file.

      powershell -ExecutionPolicy Bypass -File scripts\gisday-auth0-dev.ps1
      powershell -ExecutionPolicy Bypass -File scripts\gisday-auth0-dev.ps1 -AskAgain

  It asks for the Client ID and secret only the first time: after that it reads them from
  auth0-dev.local.env, which already holds them for the local API. -AskAgain asks anyway, for a new
  secret after rotating it.
#>
param([switch]$AskAgain)

$ErrorActionPreference = 'Stop'
$Domain = 'txgisday-dev.us.auth0.com'
$Audience = 'gisday.dev.api'
$RolesClaim = 'geoservices.prod/roles'
$LocalSite = 'http://localhost:4201'
$TestEmail = 'claude-test-admin@txgisday-dev.test'
# Everything it writes goes outside the repository, beside the other local settings.
$Here = if ($env:GISDAY_LOCAL_DIR) { $env:GISDAY_LOCAL_DIR } else { 'C:\TAMU\gisday-local' }
New-Item -ItemType Directory -Force -Path $Here | Out-Null
$Report = Join-Path $Here ("setup-auth0-dev-{0}.txt" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
$EnvFile = Join-Path $Here 'auth0-dev.local.env'
function Say($text) { $text | Tee-Object -FilePath $Report -Append | Out-Host }

# The permissions the GIS Day API checks (@Permissions in libs/gisday and apps/gisday-nest, 20 October 2026).
$Permissions = @(
  'create:assets','create:checkins','create:classes','create:competitions','create:event-broadcasts','create:event-locations',
  'create:events','create:organizations','create:places','create:season-days','create:seasons','create:speakers','create:sponsors',
  'create:tags','create:universities','create:users',
  'delete:assets','delete:checkins','delete:classes','delete:event-broadcasts','delete:event-locations','delete:events',
  'delete:organizations','delete:places','delete:season-days','delete:seasons','delete:speakers','delete:sponsors','delete:tags',
  'delete:universities','delete:users',
  'read:checkins','read:classes','read:competitions','read:rsvps','read:users',
  'update:assets','update:classes','update:competitions','update:event-broadcasts','update:event-locations','update:events',
  'update:organizations','update:places','update:season-days','update:seasons','update:speakers','update:sponsors','update:tags',
  'update:universities'
)
# libs/gisday/platform/ngx/common/src/lib/roles/gisday.roles.ts
$Roles = @('GIS Day Admin','GIS Day Manager','GIS Day Organizer','GIS Day Professor','GIS Day Presenter','GIS Day Student')

Say ("{0}  setting up {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Domain)

# The credentials this script wrote last time, if any: the same file the local API reads them from.
$saved = @{}
if (Test-Path $EnvFile) {
  foreach ($line in Get-Content $EnvFile) { if ($line -match '^([A-Z0-9_]+)=(.*)$') { $saved[$Matches[1]] = $Matches[2] } }
}
if (-not $AskAgain -and $saved['AUTH0_MANAGEMENT_CLIENT'] -and $saved['AUTH0_MANAGEMENT_SECRET']) {
  $ClientId = $saved['AUTH0_MANAGEMENT_CLIENT']
  $ClientSecret = $saved['AUTH0_MANAGEMENT_SECRET']
  Say "Using the saved credentials in $EnvFile (run with -AskAgain to enter new ones)."
} else {
  $ClientId = Read-Host 'Client ID of "GIS Day dev setup"'
  $SecretSecure = Read-Host 'Client Secret of "GIS Day dev setup" (hidden)' -AsSecureString
  $ClientSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretSecure))
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$tokenBody = @{ grant_type = 'client_credentials'; client_id = $ClientId; client_secret = $ClientSecret; audience = "https://$Domain/api/v2/" } | ConvertTo-Json
$Token = (Invoke-RestMethod -Method Post -Uri "https://$Domain/oauth/token" -ContentType 'application/json' -Body $tokenBody).access_token
Say 'Signed in to the Management API.'

function Api($method, $path, $body) {
  $req = @{ Method = $method; Uri = "https://$Domain/api/v2/$path"; Headers = @{ Authorization = "Bearer $Token" }; ContentType = 'application/json' }
  if ($null -ne $body) { $req.Body = (ConvertTo-Json $body -Depth 10) }
  # A new tenant allows only a few Management API calls a second, and answers 429 past that
  # (20 October 2026). Every call is spaced out, and a 429 waits and tries again, up to eight times.
  for ($attempt = 1; ; $attempt++) {
    Start-Sleep -Milliseconds 700
    # Windows PowerShell 5.1 passes a JSON list on as one object; returning it from a variable hands back
    # its items one by one, so @(Api Get ...) is a real list and Where-Object picks a single entry.
    try { $result = Invoke-RestMethod @req; return $result }
    catch {
      $detail = ''
      if ($_.ErrorDetails) { $detail = $_.ErrorDetails.Message }
      $tooMany = $_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 429
      if ($tooMany -and $attempt -lt 8) {
        $wait = [Math]::Min(30, 2 * $attempt)
        Say "  Auth0 rate limit on $method $path; waiting $wait s (try $attempt of 8)."
        Start-Sleep -Seconds $wait
        continue
      }
      throw "$method $path failed: $($_.Exception.Message) $detail"
    }
  }
}

# 1. The API ----------------------------------------------------------------------------------------
$scopes = @($Permissions | ForEach-Object { @{ value = $_; description = $_ } })
$api = @(Api Get 'resource-servers?per_page=100' $null) | Where-Object { $_.identifier -eq $Audience }
$apiSettings = @{ name = 'GIS Day API (development)'; scopes = $scopes; enforce_policies = $true; token_dialect = 'access_token_authz'; allow_offline_access = $true }
if ($api) {
  $null = Api Patch "resource-servers/$($api.id)" $apiSettings
  Say "API $Audience updated."
} else {
  $apiSettings.identifier = $Audience
  $apiSettings.signing_alg = 'RS256'
  $api = Api Post 'resource-servers' $apiSettings
  Say "API $Audience created."
}
# Newer tenants require users to be allowed to the API explicitly; older ones reject the setting.
try { $null = Api Patch "resource-servers/$($api.id)" @{ subject_type_authorization = @{ user = @{ policy = 'allow_all' } } }; Say 'API open to signed-in users.' }
catch { Say 'API user-access setting not supported here (older tenant); nothing to do.' }

# 2. Roles ------------------------------------------------------------------------------------------
$roleIds = @{}
$existingRoles = @(Api Get 'roles?per_page=100' $null)
foreach ($name in $Roles) {
  $role = $existingRoles | Where-Object { $_.name -eq $name }
  if (-not $role) { $role = Api Post 'roles' @{ name = $name; description = "$name (development tenant)" }; Say "Role $name created." }
  $roleIds[$name] = $role.id
}
$grant = @{ permissions = @($Permissions | ForEach-Object { @{ resource_server_identifier = $Audience; permission_name = $_ } }) }
$null = Api Post "roles/$($roleIds['GIS Day Admin'])/permissions" $grant
Say "GIS Day Admin holds all $($Permissions.Count) permissions."

# 3. The local site's application ---------------------------------------------------------------------
$appName = 'GIS Day (local development)'
$app = @(Api Get 'clients?per_page=100&fields=client_id,name' $null) | Where-Object { $_.name -eq $appName }
$appSettings = @{
  name = $appName; app_type = 'spa'; token_endpoint_auth_method = 'none'; oidc_conformant = $true
  # The site returns from sign-in to /callback (environment.local.ts) and from sign-out to its root.
  callbacks = @($LocalSite, "$LocalSite/callback"); allowed_logout_urls = @($LocalSite); web_origins = @($LocalSite); allowed_origins = @($LocalSite)
  grant_types = @('authorization_code','refresh_token','implicit')
  refresh_token = @{ rotation_type = 'rotating'; expiration_type = 'expiring' }
}
if ($app) { $null = Api Patch "clients/$($app.client_id)" $appSettings; Say "Application '$appName' updated." }
else { $app = Api Post 'clients' $appSettings; Say "Application '$appName' created." }
$SpaClientId = $app.client_id

# 4. The roles claim ----------------------------------------------------------------------------------
$actionName = 'Add GIS Day roles to tokens'
$code = @"
/** Puts the user's roles where the GIS Day site reads them (the ROLES_CLAIM, $RolesClaim). */
exports.onExecutePostLogin = async (event, api) => {
  const roles = (event.authorization && event.authorization.roles) || [];
  api.idToken.setCustomClaim('$RolesClaim', roles);
  api.accessToken.setCustomClaim('$RolesClaim', roles);
};
"@
$actions = (Api Get ('actions/actions?actionName=' + [Uri]::EscapeDataString($actionName)) $null).actions
$action = @($actions) | Where-Object { $_.name -eq $actionName } | Select-Object -First 1
if ($action) { $null = Api Patch "actions/actions/$($action.id)" @{ code = $code; runtime = 'node22' } }
else { $action = Api Post 'actions/actions' @{ name = $actionName; supported_triggers = @(@{ id = 'post-login'; version = 'v3' }); code = $code; runtime = 'node22' } }
for ($i = 0; $i -lt 30; $i++) {
  $status = (Api Get "actions/actions/$($action.id)" $null).status
  if ($status -eq 'built') { break }
  Start-Sleep -Seconds 2
}
$null = Api Post "actions/actions/$($action.id)/deploy" $null
$null = Api Patch 'actions/triggers/post-login/bindings' @{ bindings = @(@{ ref = @{ type = 'action_id'; value = $action.id }; display_name = $actionName }) }
Say "Action '$actionName' deployed on post-login."

# 5. The test admin -----------------------------------------------------------------------------------
$conn = @(Api Get 'connections?strategy=auth0' $null) | Select-Object -First 1
if (-not $conn) { $conn = Api Post 'connections' @{ name = 'Username-Password-Authentication'; strategy = 'auth0' }; Say 'Database connection created.' }
try { $null = Api Patch "connections/$($conn.id)/clients" @(@{ client_id = $SpaClientId; status = $true }) }
catch {
  $enabled = @($conn.enabled_clients) + $SpaClientId | Select-Object -Unique
  $null = Api Patch "connections/$($conn.id)" @{ enabled_clients = $enabled }
}
Say "Connection '$($conn.name)' enabled for '$appName'."

$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'.ToCharArray()
$bytes = New-Object byte[] 24
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$Password = (-join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })) + '!7a'

$user = @(Api Get ('users-by-email?email=' + [Uri]::EscapeDataString($TestEmail)) $null) | Select-Object -First 1
if ($user) { $null = Api Patch "users/$([Uri]::EscapeDataString($user.user_id))" @{ password = $Password; connection = $conn.name }; Say "Test user ${TestEmail}: password reset." }
else { $user = Api Post 'users' @{ email = $TestEmail; password = $Password; connection = $conn.name; email_verified = $true; name = 'Claude test admin' }; Say "Test user $TestEmail created." }
$null = Api Post "users/$([Uri]::EscapeDataString($user.user_id))/roles" @{ roles = @($roleIds['GIS Day Admin']) }
Say 'Test user holds GIS Day Admin.'

# 6. The local settings file (outside the repository) ------------------------------------------------
@"
# Written by setup-auth0-dev.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm'). Development tenant only (#1623).
# Site (environment.local.ts holds the same, as the site's own values are public)
AUTH0_DOMAIN=$Domain
AUTH0_SPA_CLIENT_ID=$SpaClientId
AUTH0_AUDIENCE=$Audience
AUTH0_ROLES_CLAIM=$RolesClaim
# API: scripts/gisday-local.sh passes this file after gisday-api.local.env, so these win.
AUTH0_ISSUER_URL=https://$Domain/
AUTH0_MANAGEMENT_DISABLED=false
AUTH0_MANAGEMENT_DOMAIN=$Domain
AUTH0_MANAGEMENT_CLIENT=$ClientId
AUTH0_MANAGEMENT_SECRET=$ClientSecret
# Test admin for signed-in checks on http://localhost:4201
TEST_ADMIN_EMAIL=$TestEmail
TEST_ADMIN_PASSWORD=$Password
"@ | Set-Content -Path $EnvFile -Encoding ascii

Say ''
Say "DONE. Site application client ID: $SpaClientId (public)."
Say "Settings, including secrets, written to $EnvFile."
Say "Report: $Report"
