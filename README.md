# Cyber50 Dashboard - Simplified Documentation

## What is this?

A cyber security dashboard built with **Angular 17** and **D3.js** that shows interactive charts about cyber attacks and incidents.

## Tech Stack

- **Frontend**: Angular 17 (standalone components)
- **Charts**: D3.js v7
- **Styling**: Tailwind CSS
- **Data**: JSON files hosted on GitHub Pages

## Getting Started

```bash
npm install
npm start , ng serve          # Run development server
npm run build      # Build for production
```

## How It Works

### Data Flow

1. **Data Source**: `incidents.json` file with cyber attack records
2. **State Management**: `UnifiedStateService` loads and filters data
3. **Components**: Different pages show charts and tables
4. **Filtering**: Shared filters work across all pages

### Main Pages

- **Landing**: Welcome page with link to dashboard
- **Dashboard**: Main container with these sections:
  - **Attacks**: Bar chart of attack types + timeline
  - **Countries**: Top target countries
  - **Sectors**: Pie chart of affected sectors
  - **Initiator Countries**: World map showing attack flows
  - **All Records**: Full data table with CSV export

## Key Files

### Core Services

- `unified-state.service.ts` - Loads data and manages filters
- `data.service.ts` - Additional JSON endpoints

### Components Structure

```
src/app/
├── features/dashboard/           # Main dashboard tabs
├── shared/
│   ├── components/filters/       # Filter controls
│   ├── charts/                   # D3 chart components (Gen 1)
│   └── charts2/                  # D3 chart components (Gen 2)
```

## Data Model

Each incident has:

```typescript
{
  id: string
  timestamp: string              // When it happened
  attackType: string             // Type of attack
  severity: string               // How severe
  targetCountry: string          // Country attacked
  targetSector: string           # Sector affected
  initiatorCountry: string       // Where attack came from
  response: string               // How it was handled
  // ... plus optional fields
}
```

## How Charts Work

1. **Angular Component** gets data from service
2. **D3.js** creates SVG visualizations
3. **Responsive** - charts resize automatically
4. **Interactive** - hover effects and tooltips

### Chart Types Available

- **Bar Charts**: Compare categories
- **Line Charts**: Show trends over time
- **Pie Charts**: Show proportions
- **Scatter Plots**: Show relationships
- **World Map**: Geographic flow visualization

## Filtering System

- **Date Range**: Filter by time period
- **Text Search**: Search across all fields
- **Dropdowns**: Filter by country, attack type, severity, etc.
- **Real-time**: All charts update instantly when filters change

## Key Features

- **Dark Mode**: Toggle between light and dark themes
- **CSV Export**: Download filtered data
- **Responsive Design**: Works on desktop and mobile
- **Fast Updates**: Charts redraw smoothly when data changes

## Data Generation by AI (Dummy Data)

**Endpoint** : https://muhammed-alateeqi1.github.io/cyber-data-endpoints/incidents.json

**Repo** : [GitHub - muhammed-alateeqi1/cyber-data-endpoints](https://github.com/muhammed-alateeqi1/cyber-data-endpoints)

### Data Processing Helpers

- `topN(data, field, n)` - Get top N items
- `timeSeries(data, bucket)` - Group by time periods
- `distribution(data, field)` - Get complete breakdown

### Performance Notes

- Use `OnPush` change detection
- Clear old SVG elements before redrawing
- Add `trackBy` functions for large lists
- Clean up observers in `ngOnDestroy`

## File Structure Summary

```
src/app/
├── app.component.ts              # Root component
├── app.routes.ts                 # All page routes
├── features/dashboard/           # Dashboard pages
├── shared/
│   ├── services/                 # Data services
│   ├── components/filters/       # Filter controls
│   └── charts2/                  # Chart components
└── assets/                       # Static files
```