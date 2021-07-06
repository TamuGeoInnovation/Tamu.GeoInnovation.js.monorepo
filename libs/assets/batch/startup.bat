sc query "PM2" | find "RUNNING"

if "%ERRORLEVEL%"=="0" (
    echo Already Running
    pause
) else (
    pm2 resurrect
    pause
)