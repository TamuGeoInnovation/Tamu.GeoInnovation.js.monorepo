param( 
    [parameter(Position=0, Mandatory=$true, HelpMessage="Value of the target sites IIS binding.")]
    [string]$SiteBinding
)

$path = "MACHINE/WEBROOT/APPHOST/$SiteBinding";
$baseRulesFilter= "/system.webServer/rewrite/rules";
$baseRuleFilter= "$baseRulesFilter/rule";
$filter = "$baseRuleFilter";

write-host "";
write-host("Path: $path");
write-host("Base Rules Filter: $baseRulesFilter");
write-host("Base Rule Filter: $baseRuleFilter");
write-host("Filter: $filter");
write-host "";

Clear-WebConfiguration -PSPath $path -Filter $filter;

Write-Host("All rewrite rules have been cleared for $path");
