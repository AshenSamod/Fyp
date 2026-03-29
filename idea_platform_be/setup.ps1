# Quick Setup Script for Idea Sharing Platform
# Run this script in PowerShell to set up the project

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Idea Sharing Platform - Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Virtual Environment
Write-Host "[1/6] Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "  Virtual environment already exists. Skipping..." -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "  ✓ Virtual environment created!" -ForegroundColor Green
}
Write-Host ""

# Step 2: Activate Virtual Environment
Write-Host "[2/6] Activating virtual environment..." -ForegroundColor Yellow
try {
    & .\venv\Scripts\Activate.ps1
    Write-Host "  ✓ Virtual environment activated!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not activate. You may need to set execution policy:" -ForegroundColor Red
    Write-Host "    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 3: Install Dependencies
Write-Host "[3/6] Installing Python packages..." -ForegroundColor Yellow
Write-Host "  This may take several minutes..." -ForegroundColor Gray
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ All packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Installation failed. Check error messages above." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Setup Environment File
Write-Host "[4/6] Setting up environment file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  .env file already exists. Skipping..." -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ .env file created from template!" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Edit .env file with your database credentials!" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Database Setup Instructions
Write-Host "[5/6] Database setup instructions..." -ForegroundColor Yellow
Write-Host "  Please ensure MySQL is running and execute:" -ForegroundColor White
Write-Host "    CREATE DATABASE idea_platform_db;" -ForegroundColor Cyan
Write-Host "  Then update the DATABASE_URL in .env file" -ForegroundColor White
Write-Host ""
$response = Read-Host "  Have you completed database setup? (y/n)"
if ($response -ne "y") {
    Write-Host "  Please set up the database and run this script again." -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Step 6: Initialize Database
Write-Host "[6/6] Initializing database tables and default data..." -ForegroundColor Yellow
python init_db.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Database initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Database initialization failed. Check your database connection." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Success Message
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✓ Setup completed successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review and update .env file with your settings" -ForegroundColor White
Write-Host "  2. Run the application: python app.py" -ForegroundColor White
Write-Host "  3. Access the API at: http://localhost:5000" -ForegroundColor White
Write-Host "  4. Import Postman collection for API testing" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  ⚠ Change these credentials immediately!" -ForegroundColor Red
Write-Host ""
