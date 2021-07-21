pm2 status | find /i "Current process list running is not in sync with saved list."

if not errorlevel 1 (
    pm2 kill
    pm2 resurect 
) else (
    echo Already Running
)