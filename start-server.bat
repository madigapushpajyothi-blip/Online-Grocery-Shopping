@echo off
title FreshCart Localhost Server
echo Starting FreshCart Localhost Server on http://localhost:8080/ ...
start http://localhost:8080/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
