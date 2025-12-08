# Import database to Railway MySQL
# Run this script: .\import-db.ps1

Write-Host "Getting Railway MySQL credentials..." -ForegroundColor Cyan

# Get MySQL connection info from Railway
$env:RAILWAY_ENVIRONMENT = "production"
railway variables > temp-vars.txt

# Parse variables
$content = Get-Content temp-vars.txt -Raw
$MYSQLHOST = if ($content -match 'MYSQLHOST=([^\s]+)') { $matches[1] } else { "" }
$MYSQLPORT = if ($content -match 'MYSQLPORT=([^\s]+)') { $matches[1] } else { "" }
$MYSQLUSER = if ($content -match 'MYSQLUSER=([^\s]+)') { $matches[1] } else { "" }
$MYSQLPASSWORD = if ($content -match 'MYSQLPASSWORD=([^\s]+)') { $matches[1] } else { "" }
$MYSQLDATABASE = if ($content -match 'MYSQLDATABASE=([^\s]+)') { $matches[1] } else { "" }

Remove-Item temp-vars.txt

if ([string]::IsNullOrEmpty($MYSQLHOST)) {
    Write-Host "Error: Could not get MySQL credentials from Railway" -ForegroundColor Red
    Write-Host "Please make sure you have linked to the MySQL service" -ForegroundColor Yellow
    exit 1
}

Write-Host "MySQL Host: $MYSQLHOST" -ForegroundColor Green
Write-Host "MySQL Port: $MYSQLPORT" -ForegroundColor Green
Write-Host "MySQL User: $MYSQLUSER" -ForegroundColor Green
Write-Host "MySQL Database: $MYSQLDATABASE" -ForegroundColor Green

Write-Host "`nNow copy the SQL file content and paste it into Railway MySQL Query interface:" -ForegroundColor Yellow
Write-Host "1. Go to Railway Dashboard" -ForegroundColor Cyan
Write-Host "2. Click on MySQL service" -ForegroundColor Cyan
Write-Host "3. Click 'Data' tab -> 'Query' button" -ForegroundColor Cyan
Write-Host "4. Paste the content from sql/cake_fantasy_db.sql" -ForegroundColor Cyan
Write-Host "5. Click 'Run Query'" -ForegroundColor Cyan

Write-Host "`nOpening SQL file for you to copy..." -ForegroundColor Yellow
Start-Sleep 2
notepad sql\cake_fantasy_db.sql
