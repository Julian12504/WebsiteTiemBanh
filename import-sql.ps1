# Import SQL to Railway MySQL using PowerShell
Write-Host "Getting Railway MySQL credentials..." -ForegroundColor Cyan

# Get Railway variables
$output = railway variables --json 2>&1 | Out-String

# Parse JSON to get MySQL credentials
try {
    $vars = $output | ConvertFrom-Json
    $MYSQL_HOST = $vars.MYSQLHOST
    $MYSQL_PORT = $vars.MYSQLPORT
    $MYSQL_USER = $vars.MYSQLUSER
    $MYSQL_PASSWORD = $vars.MYSQLPASSWORD
    $MYSQL_DATABASE = $vars.MYSQLDATABASE
} catch {
    Write-Host "Error parsing Railway variables. Trying text parsing..." -ForegroundColor Yellow
    
    # Fallback to text parsing
    railway variables | Out-File -FilePath temp-vars.txt
    $content = Get-Content temp-vars.txt -Raw
    
    if ($content -match 'MYSQLHOST=([^\r\n]+)') { $MYSQL_HOST = $matches[1].Trim() }
    if ($content -match 'MYSQLPORT=([^\r\n]+)') { $MYSQL_PORT = $matches[1].Trim() }
    if ($content -match 'MYSQLUSER=([^\r\n]+)') { $MYSQL_USER = $matches[1].Trim() }
    if ($content -match 'MYSQLPASSWORD=([^\r\n]+)') { $MYSQL_PASSWORD = $matches[1].Trim() }
    if ($content -match 'MYSQLDATABASE=([^\r\n]+)') { $MYSQL_DATABASE = $matches[1].Trim() }
    
    Remove-Item temp-vars.txt -ErrorAction SilentlyContinue
}

if ([string]::IsNullOrEmpty($MYSQL_HOST)) {
    Write-Host "Error: Could not get MySQL credentials" -ForegroundColor Red
    exit 1
}

Write-Host "✓ MySQL Host: $MYSQL_HOST" -ForegroundColor Green
Write-Host "✓ MySQL Port: $MYSQL_PORT" -ForegroundColor Green
Write-Host "✓ MySQL Database: $MYSQL_DATABASE" -ForegroundColor Green

# Check if mysql command exists
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    # Try default MySQL path
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
}

if (-not $mysqlPath) {
    Write-Host "`nMySQL client not found in PATH." -ForegroundColor Yellow
    Write-Host "Please close and reopen PowerShell, then run this script again." -ForegroundColor Yellow
    Write-Host "`nOr manually run:" -ForegroundColor Cyan
    Write-Host "railway connect MySQL" -ForegroundColor White
    Write-Host "Then in MySQL shell, run:" -ForegroundColor Cyan
    Write-Host "source sql/cake_fantasy_db.sql" -ForegroundColor White
    exit 1
}

Write-Host "`nImporting database..." -ForegroundColor Cyan
Write-Host "Using: $mysqlPath" -ForegroundColor Gray

# Import SQL file
$sqlFile = "sql\cake_fantasy_db.sql"
Get-Content $sqlFile | & $mysqlPath -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Database imported successfully!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Import failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}
