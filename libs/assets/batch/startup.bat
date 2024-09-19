:loop
pm2 status | find /i "Current process list"

if not errorlevel 1 (
    pm2 kill
    timeout /t 5 /nobreak 
    pm2 resurrect
    EVENTCREATE /T ERROR /L APPLICATION /so nssmCheck /ID 100 /D "Pm2 resurected."  
    timeout /t 300 /nobreak > NUL 
    goto loop
) else (
    timeout /t 300 /nobreak > NUL
    goto loop
)