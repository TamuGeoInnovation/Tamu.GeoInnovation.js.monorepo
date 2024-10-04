$path = "MACHINE/WEBROOT/APPHOST";
$baseRulesFilter= "/system.webServer/rewrite/globalRules";
$baseRuleFilter= "$baseRulesFilter/rule";
$filter = "$baseRuleFilter";

write-host "";
write-host("Path: $path");
write-host("Base Rules Filter: $baseRulesFilter");
write-host("Base Rule Filter: $baseRuleFilter");
write-host("Filter: $filter");
write-host "";

Clear-WebConfiguration -PSPath $path -Filter $filter;

Write-Host("All global rewrite rules have been cleared.");
