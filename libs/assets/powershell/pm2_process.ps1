param( 
    [parameter(Position=0, Mandatory=$true, HelpMessage="The name of the process to test against.")]
    [string]$ProcessName,
    [parameter(Position=1, Mandatory=$true, HelpMessage="The script file entry point. Needs to be an absolute path.")]
    [string]$EntryPoint,
    [parameter(Position=2, Mandatory=$true, HelpMessage="Start or stop the service, if it exists. Can be 'start' or 'stop'.")]
    [string]$Action
)


if((pm2 pid $ProcessName).length -eq 0){
    if($Action -eq 'stop'){
        write-host "Service does not exist. Doing nuffin'...";
        #No-op
    } elseif($Action -eq 'start') {
        write-host "Service does no exist. Creating...";
        pm2 start $EntryPoint --name $ProcessName --exp-backoff-restart-delay=100;

        write-host "Service has been created. Saving..."
        pm2 save;

        write-host('Process list has been saved.')
    }
} else {
    if($Action -eq 'stop'){
        write-host "Stopping Serivce...";
        pm2 stop $ProcessName;
    } elseif($Action -eq 'start') {
        write-host "Stopping Serivce...";
        pm2 start $ProcessName;
    }
}