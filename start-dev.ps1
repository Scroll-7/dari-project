# ─── start-dev.ps1 ───────────────────────────────────────────────────────────
# Run this instead of `npx expo start` to avoid the "Unable to load script" error.
# It: 1) kills stale Metro/Node processes, 2) sets ADB reverse, 3) starts Metro.
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "🔪 Killing stale Node / Metro processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

Write-Host "📡 Setting up ADB reverse tunnel (port 8081)..." -ForegroundColor Cyan
adb reverse tcp:8081 tcp:8081

Write-Host "🚀 Starting Expo Metro Bundler..." -ForegroundColor Green
npx expo start --port 8081
