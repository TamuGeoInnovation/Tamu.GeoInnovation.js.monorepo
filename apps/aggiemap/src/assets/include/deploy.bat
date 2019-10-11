cd "\inetpub\wwwroot\aggiemap-dev\deploy\source"
git fetch origin || goto :error
git checkout -f %1 || goto :error
cmd /c npm install || goto :error
del "dist\apps\aggiemap\*" /s /f /q || goto :error
npm run build -- --project=aggiemap --prod || goto :error
del "\inetpub\wwwroot\aggiemap-dev\deploy\liv\*" /s /f /q || goto :error
xcopy /s /v /y "dist\apps\aggiemap" "\inetpub\wwwroot\aggiemap-dev\deploy\live" || goto :error

:error
exit
