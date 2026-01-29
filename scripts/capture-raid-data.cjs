#!/usr/bin/env node

/**
 * ArcTracker Raid Data Capture Script
 *
 * Captures real raid data from ArcTracker.io API and saves it locally
 * for development/testing purposes.
 *
 * Usage: node scripts/capture-raid-data.cjs
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Fetch data from URL
 */
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error("Failed to parse JSON response"));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build ArcTracker API URL
 */
function buildApiUrl(userId, offset = 0) {
  return `https://arctracker.io/api/raids?userId=${userId}&offset=${offset}`;
}

/**
 * Fetch all raids with pagination
 */
async function fetchAllRaids(userId) {
  console.log("\n📡 Fetching raid data...");

  const allRaids = [];
  let offset = 0;
  let hasMore = true;
  let pageCount = 0;

  while (hasMore) {
    const url = buildApiUrl(userId, offset);

    try {
      console.log(`   Fetching page ${pageCount + 1} (offset: ${offset})...`);
      const response = await fetchData(url);

      if (!response.raids || response.raids.length === 0) {
        break;
      }

      allRaids.push(...response.raids);
      pageCount++;

      hasMore = response.pagination?.hasMore ?? false;
      offset += 20;

      // Respect rate limits
      if (hasMore) {
        await sleep(200);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching page: ${error.message}`);
      break;
    }
  }

  console.log(`\n✅ Fetched ${allRaids.length} raids across ${pageCount} pages\n`);
  return allRaids;
}

/**
 * Analyze raid data
 */
function analyzeRaids(raids) {
  if (raids.length === 0) {
    return {
      totalRaids: 0,
      dateRange: { earliest: null, latest: null },
      mapCounts: {},
      statusCounts: {}
    };
  }

  const dates = raids
    .map((r) => new Date(r.raidDate))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a - b);

  const mapCounts = {};
  const statusCounts = {};

  raids.forEach((raid) => {
    mapCounts[raid.mapId] = (mapCounts[raid.mapId] || 0) + 1;
    statusCounts[raid.status] = (statusCounts[raid.status] || 0) + 1;
  });

  return {
    totalRaids: raids.length,
    dateRange: {
      earliest: dates[0]?.toISOString() || null,
      latest: dates[dates.length - 1]?.toISOString() || null
    },
    mapCounts,
    statusCounts
  };
}

/**
 * Save mock data to file
 */
function saveMockData(raids, userId) {
  const testDataDir = path.join(__dirname, "..", "test-data");

  // Create test-data directory if it doesn't exist
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }

  const analysis = analyzeRaids(raids);

  const mockData = {
    meta {
      capturedAt: new Date().toISOString(),
      userId: userId,
      apiEndpoint: `https://arctracker.io/api/raids?userId=${userId}`,
      totalRaids: analysis.totalRaids,
      dateRange: analysis.dateRange,
      mapBreakdown: analysis.mapCounts,
      statusBreakdown: analysis.statusCounts,
      note: "This file contains real raid data captured from ArcTracker.io for development/testing purposes. Do not commit to git."
    },
    raids: raids
  };

  const outputPath = path.join(testDataDir, "mock-raids.json");
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));

  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n📊 Data Summary:`);
  console.log(`   Total Raids: ${analysis.totalRaids}`);
  console.log(
    `   Date Range: ${analysis.dateRange.earliest?.split("T")[0] || "N/A"} to ${analysis.dateRange.latest?.split("T")[0] || "N/A"}`
  );
  console.log(`   Maps: ${Object.keys(analysis.mapCounts).length} different maps`);
  console.log(`   Survived: ${analysis.statusCounts.survived || 0}`);
  console.log(`   KIA: ${analysis.statusCounts.kia || 0}`);
}

/**
 * Main execution
 */
async function main() {
  console.log("\n🎯 ArcTracker Raid Data Capture Tool\n");
  console.log("This tool will fetch your raid data from ArcTracker.io and save it locally");
  console.log("for development and testing purposes.\n");

  console.log("⚠️  PRIVACY NOTE:");
  console.log("   - Captured data includes your raid history");
  console.log("   - Data is saved to test-data/ (gitignored)");
  console.log("   - Never commit real raid data to version control\n");

  console.log("📝 To find your User ID:");
  console.log("   1. Open ArcTracker.io in your browser");
  console.log("   2. Go to the raid history page");
  console.log("   3. Open DevTools (F12) → Network tab");
  console.log("   4. Look for a request to '/api/raids?userId=...'");
  console.log("   5. Copy just the userId value (the long string after userId=)\n");

  const userId = await prompt("Enter your ArcTracker User ID: ");

  if (!userId || userId.length < 10) {
    console.log("\n❌ Invalid User ID. Please provide a valid ArcTracker user ID.");
    rl.close();
    return;
  }

  const confirm = await prompt("\nProceed with data capture? (yes/no): ");

  if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
    console.log("\n❌ Cancelled by user.");
    rl.close();
    return;
  }

  try {
    const raids = await fetchAllRaids(userId);

    if (raids.length === 0) {
      console.log("\n⚠️  No raids found. Please check the User ID and try again.");
      rl.close();
      return;
    }

    saveMockData(raids, userId);

    console.log("\n✨ Success! Mock data is ready for use.");
    console.log("\n📚 Next steps:");
    console.log("   1. The data is now available in test-data/mock-raids.json");
    console.log("   2. Mock mode is automatically enabled in development builds");
    console.log("   3. Run `npm run dev` to develop with mock data\n");
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }

  rl.close();
}

// Run the script
main().catch(console.error);