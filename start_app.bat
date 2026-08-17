@echo off
title Visual Inspection System
cd /d "%~dp0"
echo ========================================================
echo   PORT EQUIPMENT VISUAL INSPECTION & TRACKING SYSTEM
echo ========================================================
echo.
echo Starting local web server...
start http://localhost:3000
node server.js
pause
