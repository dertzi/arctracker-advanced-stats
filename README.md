# ArcTracker Advanced Stats

Enhanced statistics and visualizations for ArcTracker.io raid history page.

## Features

- **Comprehensive Statistics Dashboard** - Total profit/loss, raid summaries, averages
- **Interactive Cumulative Profit Chart** - Visual profit progression with hover tooltips
- **Map-Specific Performance Analytics** - Per-map breakdown with survival rates
- **Profit Distribution Histogram** - Visual distribution with strict zero-bucket
- **Top Performers** - Top 5 biggest gains and losses
- **Filter Synchronization** - Auto-syncs with ArcTracker's native filters
- **Complete Pagination Handling** - Fetches ALL raid data across pages

## Installation

1. Install a userscript manager (Violentmonkey, Tampermonkey, or Greasemonkey)
2. Copy the contents of `dist/arctracker-advanced-stats.user.js`
3. Create a new userscript in your manager and paste the code
4. Visit https://arctracker.io/raid-history to see the enhanced stats!

## Development

### Project Structure

```
src/
├── utils/          # Formatting, constants, DOM helpers
├── api/            # API watcher and pagination fetcher
├── stats/          # Statistics computation engine
├── ui/             # UI rendering
├── charts/         # Chart visualizations
│   ├── profit-chart/
│   └── histogram/
├── main.js         # Main orchestration logic
└── index.js        # Entry point
```

### Building from Source

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. The output will be in `dist/arctracker-advanced-stats.user.js`

### Development Mode

For active development with auto-rebuild on changes:

```bash
npm run dev
```

## Documentation

See [DESIGN.md](DESIGN.md) for complete architecture documentation including:

- Module breakdown and responsibilities
- Data structures
- Build system details
- Future enhancement ideas

## Technical Details

- **ES6+ Modules** - Modern modular architecture
- **Rollup Bundler** - Fast, clean builds
- **Zero Dependencies** - Pure vanilla JavaScript
- **Responsive Design** - Uses Tailwind utility classes

## Browser Compatibility

Requires a modern browser with ES6+ support:

- Chrome 90+
- Firefox 88+
- Edge 90+

## License

MIT

## Contributing

1. Fork the repository
2. Make your changes in the `src/` directory
3. Run `npm run build` to test
4. Submit a pull request

## Troubleshooting

**Script not loading?**

- Make sure you're on the raid history page: `https://arctracker.io/raid-history`
- Check browser console for errors
- Verify userscript manager is enabled

**Missing stats?**

- The script fetches data when you change filters
- Try selecting a season or map filter to trigger data loading
- Check console for API errors

**Build errors?**

- Ensure Node.js and npm are installed
- Run `npm install` again
- Check for syntax errors in modified files

## Credits

Created to enhance the ArcTracker.io experience with detailed analytics and visualizations.
