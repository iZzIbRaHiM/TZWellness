# Console.log Removal Script

## Issue
Found 13 console.log statements in production code that should be removed before deployment.

## Files Affected
1. `frontend/src/components/booking/steps/step-calendar.tsx` (10 instances)
2. `frontend/src/components/booking/steps/step-calendar-v2.tsx` (3 instances)

## Manual Removal Instructions

### File 1: step-calendar.tsx
Remove these lines:
- Line ~26: `console.log("✅ Dates loaded:", data);`
- Line ~45: `console.log("📅 Raw API response:", response.data?.dates);`
- Line ~62: `console.log("✅ Processed date strings:", dateStrings.slice(0, 5));`
- Line ~80-84: `console.log("🕐 Fetching slots for:", {...});`
- Line ~91: `console.log("🕐 Slots API response:", response);`
- Line ~99: `console.log("✅ Slots for date:", selectedDate, slotsForDate);`
- Line ~145: `console.log("🔍 Checking today:", ...);`
- Line ~154-156: `console.log("🎯 Date clicked:", ...); console.log("📋 Available dates:", ...); console.log("✅ Is available?", ...);`
- Line ~309: `console.log("🖱️ Button clicked for:", day.dateStr, "Disabled:", isDisabled);`
- Line ~408: `console.log("Using fallback slots:", fallback);`

### File 2: step-calendar-v2.tsx
Remove these lines:
- Line ~26: `console.log("✅ Dates loaded:", data);`
- Line ~48: `console.log("✅ Slots loaded for", localDate, ":", data);`

## Quick PowerShell Commands

Run these in frontend directory to remove console.log statements:

```powershell
# Backup files first
Copy-Item src/components/booking/steps/step-calendar.tsx src/components/booking/steps/step-calendar.tsx.backup
Copy-Item src/components/booking/steps/step-calendar-v2.tsx src/components/booking/steps/step-calendar-v2.tsx.backup

# Remove console.log lines (requires manual review after)
(Get-Content src/components/booking/steps/step-calendar.tsx) | Where-Object { $_ -notmatch 'console\.log' } | Set-Content src/components/booking/steps/step-calendar.txt
(Get-Content src/components/booking/steps/step-calendar-v2.tsx) | Where-Object { $_ -notmatch 'console\.log' } | Set-Content src/components/booking/steps/step-calendar-v2.txt

# Review the .txt files, then if correct:
Move-Item -Force src/components/booking/steps/step-calendar.txt src/components/booking/steps/step-calendar.tsx
Move-Item -Force src/components/booking/steps/step-calendar-v2.txt src/components/booking/steps/step-calendar-v2.tsx
```

## Verification

After removal, run:
```bash
npm run type-check  # Ensure no TypeScript errors
npm run build       # Ensure build succeeds
```

Search for any remaining console statements:
```powershell
Select-String -Path "src/**/*.tsx" -Pattern "console\.(log|error|warn|debug)" -Exclude "*node_modules*"
```

## Alternative: Wrap in Development Check

If you want to keep debug logs for development:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log("✅ Dates loaded:", data);
}
```

## ESLint Rule to Prevent Future Issues

Add to `.eslintrc.json`:
```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

This allows `console.warn` and `console.error` but blocks `console.log`.
