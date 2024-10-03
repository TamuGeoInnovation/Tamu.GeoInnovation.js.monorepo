param( 
    [parameter(Position=0, Mandatory=$true, HelpMessage="Server farm name")]
    [string]$FarmName,
    [parameter(Position=1, Mandatory=$true, HelpMessage="Address")]
    [string]$Address,
    [parameter(Position=2, Mandatory=$true, HelpMessage="HTTP Port")]
    [int]$HttpPort
)


$path = "MACHINE/WEBROOT/APPHOST";
$baseRulesFilter= "/webFarms";
$baseRuleFilter= "$baseRulesFilter/webFarm";
$filter = "$baseRuleFilter[@name='$FarmName ($HttpPort)']";

write-host "";
write-host("Path: $path");
write-host("Base Rules Filter: $baseRulesFilter");
write-host("Base Rule Filter: $baseRuleFilter");
write-host("Filter: $filter");
write-host "";


$ExistingRule = Get-WebConfigurationProperty –pspath $path –Filter $filter -Name ".";

# Check if rule  exists and remove it if it does.
if(($ExistingRule).length -gt 0)  {
    Write-Host "$FarmName web farm already exists. Removing farm servers to avoid duplicates.";
    Remove-WebConfigurationProperty –pspath $path –Filter $filter -Name ".";
} else {
    Add-WebConfigurationProperty –pspath $path –Filter $baseRulesFilter –Name "." -Force –Value @{name="$FarmName ($HttpPort)";patternSyntax='Wildcard';stopProcessing='False';};
    Write-Host "$FarmName web farm has been created for the site host." –BackgroundColor DarkGreen –ForegroundColor Gray;
}

# Add a farm server entry
Write-Host "Adding server farm entry...";
Add-WebConfiguration –pspath $path –Filter $filter –Value (@{address=$Address; enabled=$true});

# Set the farm server port
Write-Host "Setting port on server entry...";
Set-WebConfigurationProperty -pspath $path -Filter "$filter/server[@address='$Address']" -Name "applicationRequestRouting" -Value @{httpPort=$HttpPort};

Write-Host "Server farm named $FarmName with address $Address and port $HttpPort have been created successfully." –BackgroundColor DarkGreen –ForegroundColor Gray;
