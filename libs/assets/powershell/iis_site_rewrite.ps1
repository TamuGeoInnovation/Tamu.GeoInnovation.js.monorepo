param( 
    [parameter(Position=0, Mandatory=$true, HelpMessage="Value of the target sites IIS binding.")]
    [string]$SiteBinding,
    [parameter(Position=1, Mandatory=$true, HelpMessage="Name to be assigned to the redirect rule that is created.")]
    [string]$RuleName,
    [parameter(Position=2, Mandatory=$true, HelpMessage="URL pattern to match.")]
    [string]$UrlPattern,
    [parameter(Position=3, Mandatory=$true, HelpMessage="URL to redirect matching requests.")]
    [string]$RedirectUrl,
    [parameter(Position=4, Mandatory=$false, HelpMessage="Stop processing of subsequent rules.")]
    [switch]$StopProcessRules
)

$path = "MACHINE/WEBROOT/APPHOST/$SiteBinding";
$baseRulesFilter= "/system.webServer/rewrite/rules";
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
    if($StopProcessRules -eq $false){
        Add-WebConfigurationProperty –pspath $path –Filter $baseRulesFilter –Name "." -Force –Value @{name=$RuleName;patternSyntax='Wildcard';stopProcessing='False';};
        Write-Host "$RuleName has been created for $SiteBinding. Applying match rule, conditions, and action..." –BackgroundColor DarkGreen –ForegroundColor Gray;
    } else {
        Add-WebConfigurationProperty –pspath $path –Filter $baseRulesFilter –Name "." -Force –Value @{name=$RuleName;patternSyntax='Wildcard';stopProcessing='True';};
        Write-Host "$RuleName has been created for $SiteBinding. Applying match rule, conditions, and action..." –BackgroundColor DarkGreen –ForegroundColor Gray;  
    }
} else {
    Write-Host "$RuleName rule already exists. Removing rule conditions to avoid duplicates.";
    Remove-WebConfigurationProperty –pspath $path –Filter $filter -Name "conditions";
}

Set-WebConfigurationProperty -pspath $path -Filter "$filter/match" -Name "url" -Value $UrlPattern;
Set-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" -Name "logicalGrouping" -Value "MatchAll";
Add-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" –Name "." –Value @{input="{REQUEST_FILENAME}";matchType="IsFile";negate="true";};
Add-WebConfigurationProperty –pspath $path –Filter "$filter/conditions" –Name "." –Value @{input="{REQUEST_FILENAME}";matchType="IsDirectory";negate="true";};
Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "type" –Value "Rewrite";
Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "url" –Value $RedirectUrl;
Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "appendQueryString" –Value "true";
Set-WebConfigurationProperty –pspath $path –Filter "$filter/action" –Name "logRewrittenURL" –Value "true";

Write-Host "$RuleName for $SiteBinding has been updated successfully." –BackgroundColor DarkGreen –ForegroundColor Gray;
