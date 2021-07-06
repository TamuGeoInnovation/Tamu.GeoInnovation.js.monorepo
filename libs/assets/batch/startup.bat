sc query "pm2.exe" | find "RUNNING"

if "%ERRORLEVEL%"=="0" (
    echo Already Running
) else (
    pm2 resurrect
)