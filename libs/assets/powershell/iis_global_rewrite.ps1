param( 
    [parameter(Position=0, Mandatory=$true, HelpMessage="Name to be assigned to the redirect rule that is created.")]
    [string]$RuleName,
    [parameter(Position=1, Mandatory=$true, HelpMessage="URL pattern to match.")]
    [string]$UrlPattern,
    [parameter(Position=2, Mandatory=$true, HelpMessage="Rewrite type, 'url' or 'farm'")]
    [string]$RewriteType,
    [parameter(Position=3, Mandatory=$true, HelpMessage="URL or farm to redirect matching requests.")]
    [string]$RedirectUrl,
    [parameter(Position=4, Mandatory=$false, HelpMessage="Conditional Pattern.")]
    [string]$ConditionalPattern,
    [parameter(Position=5, Mandatory=$false, HelpMessage="Setting farm conditional IDP first.")]
    [switch]$ConditionalFirst,
    [parameter(Position=6, Mandatory=$false, HelpMessage="Setting farm conditional IDP Second.")]
    [switch]$ConditionalSecond
)

if($RewriteType -eq 'farm') {
    if((Get-WebConfigurationProperty –pspath MACHINE/WEBROOT/APPHOST –Filter "/webFarms/webFarm[@name='$RedirectUrl']" -Name ".").length -eq 0){
        throw "Provided farm does not exist. Please check the farm by provided name exists: $RedirectUrl";
    }
}

$path = "MACHINE/WEBROOT/APPHOST";
$baseRulesFilter= "/system.webServer/rewrite/globalRules";
$baseRuleFilter= "$baseRulesFilter/rule";
$filter = "$baseRuleFilter[@name='$RuleName']";

write-host "";
write-host("Path: $path");
write-host("Base Rules Filter: $baseRulesFilter");
write-host("Base Rule Filter: $baseRuleFilter");
write-host("Filter: $filter");
write-host "";


$ExistingRule = Get-WebConfigurationProperty –pspath $path –Filter $filter -Name ".";

# Check if rule  exists
if(($ExistingRule).length -eq 0)  {
    Add-WebConfigurationProperty –pspath $path –Filter $baseRulesFilter –Name "." -Force –Value @{name=$RuleName;patternSyntax='Wildcard';stopProcessing='False';};
    Write-Host "$RuleName has been created for the site host. Applying match rule, conditions, and action..." –BackgroundColor DarkGreen –ForegroundColor Gray;
} else {
    Write-Host "$RuleName rule already exists. Removing rule conditions and server variables to avoid duplicates.";
    Remove-WebConfigurationProperty –pspath $path –Filter $filter -Name "conditions";
    Remove-WebConfigurationProperty –pspath $path –Filter $filter -Name "serverVariables";
}

Set-WebConfigurationProperty -pspath $path -Filter "$filter/match" -Name "url" -Value $UrlPattern;
Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "type" –Value "Rewrite";

if($RewriteType -eq "url"){
    Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "url" –Value $RedirectUrl;
} elseif ($RewriteType -eq "farm"){
    Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "url" –Value "http://$RedirectUrl/{R:1}";
    if($ConditionalFirst -eq $true){
        Set-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" -Name "logicalGrouping" -Value "MatchAll";
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" –Name "." –Value @{input="{HTTP_HOST}";matchType="Pattern";pattern=$ConditionalPattern;negate="false";};
    }
    if($ConditionalSecond -eq $true){
        Set-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" -Name "logicalGrouping" -Value "MatchAll";
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" –Name "." –Value @{input="{REQUEST_URI}";matchType="Pattern";pattern ='*/api/*';negate="true";};
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" –Name "." –Value @{input="{REQUEST_URI}";matchType="Pattern";pattern ='*/admin/*';negate="true";};
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/serverVariables" –Name "." –Value @{name='HTTP_X_FORWARDED_HOST';value='{HTTP_HOST}';replace='true';};
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/serverVariables" –Name "." –Value @{name='HTTP_X_FORWARDED_SCHEMA';value='https';replace='true';};
        Add-WebConfigurationProperty –pspath $path –Filter "$filter/serverVariables" –Name "." –Value @{name='HTTP_X_FORWARDED_PROTO';value='https';replace='true';};
    }
}

Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "appendQueryString" –Value "true";

Write-Host "$RuleName for $SiteBinding has been updated successfully." –BackgroundColor DarkGreen –ForegroundColor Gray;
