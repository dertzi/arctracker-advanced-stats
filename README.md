# ArcTracker Advanced Stats

> Enhanced statistics and visualizations for ArcTracker.io raid history

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://github.com/dertzi/arctracker-advanced-stats)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Userscript](https://img.shields.io/badge/userscript-violentmonkey-orange.svg)](https://violentmonkey.github.io/)

A powerful userscript that enhances [ArcTracker.io](https://arctracker.io) with comprehensive raid statistics, interactive charts, and detailed analytics for Escape from Tarkov players.

## ? Features

### ?? Comprehensive Statistics
- **Total Profit Tracking**: Real-time calculation of your overall profit/loss
- **Raid Summary**: Complete breakdown of total raids, survived raids, and KIA statistics
- **Advanced Averages**: 
  - Profit per raid
  - Profit per survived raid
  - Profit per day (based on date range)

### ?? Interactive Visualizations

#### Cumulative Profit Chart
- Visual representation of profit progression over time
- Interactive hover tooltips showing exact values
- Toggleable grid lines for better readability
- Color-coded lines (green for positive, red for negative)

#### Profit Distribution Histogram
- Bucket-based visualization of profit/loss ranges
- Color-coded bars (green for gains, red for losses, gray for zero)
- Interactive tooltips with detailed bucket information
- Median calculation for each range

### ??? Detailed Map Statistics
- Per-map profit tracking
- Survival rate visualization with color-coded progress bars
- Raid count and survived count for each map
- Sortable by profit, survival rate, and raid count

### ?? Quick Insights
- **Top 5 Biggest Gains**: Your most profitable raids at a glance
- **Top 5 Biggest Losses**: Identify your worst performing raids

### ?? Smart Integration
- **Automatic Filter Sync**: Seamlessly integrates with ArcTracker''s native filters
- **Pagination Support**: Automatically fetches and processes all raid data across multiple pages
- **Debounced Updates**: Efficient refresh mechanism (300ms delay) for smooth performance
- **Non-intrusive Design**: Blends naturally with ArcTracker''s UI using Tailwind CSS classes
