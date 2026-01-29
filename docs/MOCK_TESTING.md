# 🧪 Mock Testing Infrastructure

## Overview

The mock testing infrastructure allows developers to work with real raid data locally, eliminating the need to constantly reload ArcTracker.io during development. This dramatically speeds up the development cycle and enables offline work.

## Why Mock Testing?

**Before Mock Testing:**

- ❌ Must reload ArcTracker.io for every change
- ❌ Requires internet connection
- ❌ Slow iteration cycles (page load + API calls)
- ❌ Hard to reproduce specific scenarios
- ❌ Can't work offline

**With Mock Testing:**

- ✅ Instant reloads during development
- ✅ Works completely offline
- ✅ Fast iteration cycles
- ✅ Consistent, reproducible data
- ✅ Easy to test edge cases

## Quick Start

### 1. Capture Your Raid Data (One-Time Setup)

```bash
npm run capture-data
```

You'll be prompted for your ArcTracker User ID. To find it:

1. Open ArcTracker.io in your browser
2. Go to the raid history page
3. Open DevTools (F12) → Network tab
4. Look for a request to `/api/raids?userId=...`
5. Copy just the userId value (the long string after `userId=`)

Example User ID:

```
clABC123xyz789...
```

The script will:

- Fetch all your raid data with pagination
- Save it to `test-data/mock-raids.json`
- Display a summary of captured data

### 2. Enable Mock Mode (Development)

Mock mode is controlled by the `USE_MOCK_DATA` environment variable:

```bash
# Development with mock data (fast, offline)
USE_MOCK_DATA=true npm run dev

# Development with live API (slow, requires internet)
npm run dev

# Production build (always uses live API)
npm run build
```

### 3. Develop!

With mock mode enabled, the userscript will load data from your local `mock-raids.json` file instead of making API calls. Changes to your code will be reflected immediately without page reloads.

## File Structure

```
test-data/
  └── mock-raids.json          # Your captured raid data (gitignored)

scripts/
  └── capture-raid-data.cjs    # Data capture script

src/api/
  └── fetcher.js               # Includes mock data loading logic
```

## Mock Data Format

The `mock-raids.json` file contains:

```json
{
  "metadata": {
    "capturedAt": "2026-01-29T18:00:00Z",
    "capturedFrom": "https://arctracker.io/api/raids?...",
    "totalRaids": 150,
    "dateRange": {
      "earliest": "2026-01-01T00:00:00Z",
      "latest": "2026-01-29T18:00:00Z"
    },
    "mapBreakdown": {
      "customs": 45,
      "factory": 30,
      "woods": 25
    },
    "statusBreakdown": {
      "survived": 95,
      "kia": 55
    }
  },
  "raids": [
    {
      "id": "raid-123",
      "raidDate": "2026-01-29T14:30:00Z",
      "mapId": "customs",
      "status": "survived",
      "effectiveValue": 450000,
      "totalValue": 450000
    }
    // ... more raids
  ]
}
```

## How It Works

### Build-Time Variable Replacement

The `USE_MOCK_DATA` constant in `src/api/fetcher.js` is replaced at build time:

```javascript
// In source code:
const USE_MOCK_DATA = false; // Will be replaced by build config

// After build with USE_MOCK_DATA=true:
const USE_MOCK_DATA = true;

// After build with USE_MOCK_DATA=false (or no env var):
const USE_MOCK_DATA = false;
```

This is handled by `@rollup/plugin-replace` in `rollup.config.js`.

### Runtime Data Loading

When `USE_MOCK_DATA` is `true`, the fetcher loads data from the local JSON file:

```javascript
export async function fetchAllRaids(baseURL) {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    return await loadMockData();
  }

  // Otherwise, use live API
  // ... normal fetch logic
}
```

## Development Workflow

### Standard Workflow

```bash
# 1. Capture data once
npm run capture-data

# 2. Develop with mock data
USE_MOCK_DATA=true npm run dev

# 3. Make changes to code
# 4. Refresh browser (mock data loads instantly)
# 5. Repeat steps 3-4

# 6. Build for production
npm run build
```

### Updating Mock Data

If you want to capture fresh

```bash
# Capture updated raid data
npm run capture-data

# The script will overwrite test-data/mock-raids.json
```

## Testing Scenarios

### Test with Different Data Sets

You can create multiple mock data files for different scenarios:

```bash
# Capture and save with different names
npm run capture-data
# Then manually rename:
mv test-data/mock-raids.json test-data/mock-raids-large.json
mv test-data/mock-raids.json test-data/mock-raids-small.json
```

Then modify `src/api/fetcher.js` to load your preferred file during development.

### Test Edge Cases

Manually edit `mock-raids.json` to test:

- Zero raids
- All losses (negative profits)
- All gains (positive profits)
- Single map only
- Specific date ranges
- Missing data fields

## Privacy & Security

### Important Notes

⚠️ **The `test-data/` directory is gitignored and should NEVER be committed to version control.**

- Mock data contains your real raid history
- User IDs and timestamps are included
- This is your private data

### Best Practices

1. ✅ Keep `test-data/` in `.gitignore`
2. ✅ Never commit mock data files
3. ✅ Don't share your mock data publicly
4. ✅ Use production builds for deployment

## Troubleshooting

### Mock data not loading

**Problem:** Console shows "Failed to load mock data"

**Solutions:**

1. Run `npm run capture-data` to create the file
2. Check that `test-data/mock-raids.json` exists
3. Verify the JSON is valid (no syntax errors)
4. Make sure you're using `USE_MOCK_DATA=true npm run dev`

### Data is outdated

**Problem:** Mock data doesn't reflect recent raids

**Solution:** Re-capture your

```bash
npm run capture-data
```

### Build fails

**Problem:** `@rollup/plugin-replace` errors

**Solutions:**

1. Reinstall dependencies: `npm install`
2. Check `rollup.config.js` for syntax errors
3. Verify Node.js version (16+ required)

## Advanced Usage

### Custom Mock Data Generator

You can create a script to generate synthetic mock data for edge case testing:

```javascript
// scripts/generate-mock-data.js
const fs = require('fs');

function generateMockRaids(count) {
  const raids = [];
  for (let i = 0; i < count; i++) {
    raids.push({
      id: `raid-${i}`,
      raidDate: new Date(Date.now() - i * 86400000).toISOString(),
      mapId: ['customs', 'factory', 'woods'][i % 3],
      status: i % 3 === 0 ? 'kia' : 'survived',
      effectiveValue: Math.floor(Math.random() * 1000000) - 500000
    });
  }
  return raids;
}

const mockData = {
  meta {
    capturedAt: new Date().toISOString(),
    totalRaids: 100,
    note: 'Generated synthetic data'
  },
  raids: generateMockRaids(100)
};

fs.writeFileSync('test-data/mock-raids.json', JSON.stringify(mockData, null, 2));
console.log('✅ Generated 100 synthetic raids');
```

### Multiple Mock Profiles

Switch between different mock data profiles:

```bash
# In src/api/fetcher.js, change:
const MOCK_DATA_FILE = process.env.MOCK_PROFILE || 'mock-raids.json';
const response = await fetch(`/test-data/${MOCK_DATA_FILE}`);

# Then use:
MOCK_PROFILE=large-dataset.json USE_MOCK_DATA=true npm run dev
```

## Future Enhancements

Planned improvements:

- [ ] Mock data generator for edge cases
- [ ] Multiple preset datasets
- [ ] Mock API server with delays simulation
- [ ] Time-travel debugging
- [ ] Replay captured filter changes
- [ ] Hot reload support

---

**Questions or issues?** Check the main README or create an issue on GitHub.
