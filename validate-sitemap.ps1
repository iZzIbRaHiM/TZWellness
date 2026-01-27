# Sitemap Validation Script
# Tests the sitemap locally before production deployment

Write-Host "🔍 TZ Wellness Centre - Sitemap Validation" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    if (Test-Path "frontend\package.json") {
        Write-Host "📁 Moving to frontend directory..." -ForegroundColor Yellow
        Set-Location frontend
    } else {
        Write-Host "❌ Error: Cannot find frontend directory" -ForegroundColor Red
        exit 1
    }
}

# Check if sitemap.ts exists
Write-Host "1. Checking sitemap implementation..." -ForegroundColor White
if (Test-Path "src\app\sitemap.ts") {
    Write-Host "   ✅ sitemap.ts found" -ForegroundColor Green
} else {
    Write-Host "   ❌ sitemap.ts not found!" -ForegroundColor Red
    exit 1
}

# Check if robots.ts exists
Write-Host "`n2. Checking robots.txt implementation..." -ForegroundColor White
if (Test-Path "src\app\robots.ts") {
    Write-Host "   ✅ robots.ts found" -ForegroundColor Green
} else {
    Write-Host "   ❌ robots.ts not found!" -ForegroundColor Red
    exit 1
}

# Check environment variables
Write-Host "`n3. Checking environment configuration..." -ForegroundColor White
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SITE_URL") {
        Write-Host "   ✅ NEXT_PUBLIC_SITE_URL found in .env.local" -ForegroundColor Green
        
        # Extract and display the URL
        $siteUrl = $envContent -split "`n" | Where-Object { $_ -match "NEXT_PUBLIC_SITE_URL=" } | ForEach-Object { $_.Split("=")[1].Trim() }
        Write-Host "   📍 Current URL: $siteUrl" -ForegroundColor Cyan
        
        if ($siteUrl -like "*tzwellnesscentre.com*") {
            Write-Host "   ✅ Production domain configured correctly" -ForegroundColor Green
        } elseif ($siteUrl -like "*localhost*") {
            Write-Host "   ⚠️  Using localhost - OK for local testing" -ForegroundColor Yellow
            Write-Host "   💡 Remember to set production URL in Vercel" -ForegroundColor Yellow
        } else {
            Write-Host "   ⚠️  URL doesn't match tzwellnesscentre.com" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  NEXT_PUBLIC_SITE_URL not found - will use default" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  .env.local not found - will use defaults" -ForegroundColor Yellow
}

# Check Supabase configuration
Write-Host "`n4. Checking Supabase configuration..." -ForegroundColor White
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    $hasSupabaseUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL"
    $hasSupabaseKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    
    if ($hasSupabaseUrl -and $hasSupabaseKey) {
        Write-Host "   ✅ Supabase credentials configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Supabase credentials incomplete" -ForegroundColor Yellow
        Write-Host "   💡 Dynamic content (services/blog/events) won't load" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Cannot verify Supabase configuration" -ForegroundColor Yellow
}

# Check if Node modules are installed
Write-Host "`n5. Checking dependencies..." -ForegroundColor White
if (Test-Path "node_modules") {
    Write-Host "   ✅ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Node modules not found" -ForegroundColor Yellow
    Write-Host "   💡 Run: npm install" -ForegroundColor Cyan
    exit 1
}

# Offer to start dev server
Write-Host "`n6. Local testing..." -ForegroundColor White
Write-Host "   To test sitemap locally, run:" -ForegroundColor Cyan
Write-Host "   npm run dev`n" -ForegroundColor Green
Write-Host "   Then visit:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/sitemap.xml" -ForegroundColor Green
Write-Host "   http://localhost:3000/robots.txt`n" -ForegroundColor Green

# Summary
Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host "📋 VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host "✅ Sitemap implementation: OK" -ForegroundColor Green
Write-Host "✅ Robots.txt implementation: OK" -ForegroundColor Green

$response = Read-Host "`nDo you want to start the dev server now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`n🚀 Starting Next.js development server..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop`n" -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "`n✅ Validation complete!" -ForegroundColor Green
    Write-Host "📚 See SITEMAP_SEO_AUDIT_REPORT.md for full documentation`n" -ForegroundColor Cyan
}
