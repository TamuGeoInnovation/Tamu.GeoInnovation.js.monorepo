pm2 status | find /i "Current process list running is not in sync with saved list. App effluent-api dispatch-api recycling-api operations-api differs. Type 'pm2 save' to synchronize."

if not errorlevel 1 (
    pm2 kill
    pm2 resurect 
) else (
    echo Already Running
)