#!/usr/bin/env pwsh
# ============================================
# TZ WELLNESS - AUTOMATED DEPLOYMENT SCRIPT
# ============================================

Write-Host "🚀 TZ Wellness Booking System - Automated Fix Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for Supabase credentials
Write-Host "Step 1: Checking Supabase Configuration..." -ForegroundColor Yellow

$envFile = "frontend\.env.local"
$envContent = Get-Content $envFile -Raw

if ($envContent -match "your-project-id.supabase.co" -or $envContent -match "your-anon-key-here") {
    Write-Host "⚠️  WARNING: Supabase credentials not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please update $envFile with your actual Supabase credentials:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://app.supabase.com" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Go to: Settings → API" -ForegroundColor White
    Write-Host "  4. Copy your Project URL and anon key" -ForegroundColor White
    Write-Host "  5. Update the values in $envFile" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Environment configuration found" -ForegroundColor Green
}

Write-Host ""

# Step 2: SQL deployment instructions
Write-Host "Step 2: Deploy SQL Functions to Supabase" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 MANUAL STEP REQUIRED:" -ForegroundColor Cyan
Write-Host "  1. Open: https://app.supabase.com" -ForegroundColor White
Write-Host "  2. Select your project" -ForegroundColor White
Write-Host "  3. Click: SQL Editor (left sidebar)" -ForegroundColor White
Write-Host "  4. Click: New Query" -ForegroundColor White
Write-Host "  5. Copy the entire contents of: DEPLOY_SQL_FIX.sql" -ForegroundColor White
Write-Host "  6. Paste into the SQL Editor" -ForegroundColor White
Write-Host "  7. Click: Run (or press Ctrl+Enter)" -ForegroundColor White
Write-Host "  8. Verify you see '✅ ALL FUNCTIONS UPDATED SUCCESSFULLY!'" -ForegroundColor White
Write-Host ""

# Open the SQL file for easy copying
Write-Host "Opening DEPLOY_SQL_FIX.sql for you..." -ForegroundColor Yellow
Start-Process "DEPLOY_SQL_FIX.sql"

Write-Host ""
$sqlDone = Read-Host "Have you completed the SQL deployment in Supabase? (y/N)"
if ($sqlDone -ne "y" -and $sqlDone -ne "Y") {
    Write-Host "❌ Deployment paused. Please complete SQL deployment first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ SQL functions deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location frontend

if (Test-Path "node_modules") {
    Write-Host "📦 node_modules exists, skipping install" -ForegroundColor Gray
} else {
    Write-Host "📦 Installing packages..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Step 4: Start dev server
Write-Host "Step 4: Starting Development Server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Opening browser to: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📝 Watch the terminal for any errors" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done testing" -ForegroundColor Gray
Write-Host ""

# Open browser after a delay
Start-Process "http://localhost:3000"

# Start dev server
npm run dev
