# Chart.js Knowledge Base — Open Dash Widget Builder

> Source: https://www.chartjs.org/docs/latest/
> This file documents all Chart.js chart types AND maps them to the project's actual widget schemas used in `src/presentation/widgets/index.tsx`.

---

## Overview

Chart.js supports 8 core chart types:
- **Bar** — vertical/horizontal bars
- **Line** — trend lines with optional fill
- **Pie** — proportional segments (full circle)
- **Doughnut** — proportional segments (hollow center)
- **Radar** — multi-axis spider web chart
- **Polar Area** — circular segments with equal angles
- **Bubble** — x/y position + bubble radius (3D data)
- **Scatter** — x/y point plots

---

## Project Widget Schema Reference

This project does NOT use Chart.js directly — it uses custom CSS/flex rendering. The `widgetData` schema for each widget ID is:

### Bar Charts

#### `revenue-chart` — Vertical Bar Chart (Monthly Revenue)
```json
{
  "title": "Monthly Revenue",
  "bars": [50, 65, 80, 100, 75, 90, 110, 95, 85, 120, 105, 130],
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}
```
- `bars`: array of numeric values (heights as percentages of max)
- `labels`: matching array of label strings (must match bars length)
- To add all months: use all 12 labels with 12 bar values

#### `activity-chart` — Dense Bar Chart (User Activity)
```json
{
  "title": "User Activity",
  "bars": [40, 60, 45, 80, 55, 70, 65, 85, 75, 90, 80, 95]
}
```
- `bars`: array of numbers (no labels needed — dense bars)
- Typically 12 values for a 12-month view or more for weekly/daily

#### `horizontal-bar` — Horizontal Bar Chart
```json
{
  "title": "Quarterly Performance",
  "bars": [
    { "label": "Q1", "value": 65 },
    { "label": "Q2", "value": 80 },
    { "label": "Q3", "value": 72 },
    { "label": "Q4", "value": 91 }
  ]
}
```
- `bars`: array of `{label: string, value: number}` objects
- Values are absolute numbers; widths are calculated as % of max

#### `stacked-bar` — Stacked Bar Chart (Multi-series)
```json
{
  "title": "Revenue by Channel",
  "groups": [
    { "label": "Jan", "a": 40, "b": 30, "c": 20 },
    { "label": "Feb", "a": 45, "b": 35, "c": 25 },
    { "label": "Mar", "a": 50, "b": 32, "c": 28 },
    { "label": "Apr", "a": 55, "b": 38, "c": 30 },
    { "label": "May", "a": 60, "b": 40, "c": 32 },
    { "label": "Jun", "a": 65, "b": 42, "c": 35 }
  ],
  "legend": ["Organic", "Paid", "Email"]
}
```
- `groups`: each group has a `label` and 3 numeric values `a`, `b`, `c`
- `legend`: 3 series names matching `a`, `b`, `c` respectively

---

### Line / Trend Charts

#### `chart-line` — Line Trend Chart (Revenue Trend)
```json
{
  "title": "Revenue Trend",
  "xKey": "month",
  "lines": [
    { "dataKey": "revenue", "label": "Revenue", "color": "#3b82f6" }
  ],
  "data": [
    { "month": "Jan", "revenue": 20 },
    { "month": "Feb", "revenue": 35 },
    { "month": "Mar", "revenue": 28 },
    { "month": "Apr", "revenue": 45 },
    { "month": "May", "revenue": 38 },
    { "month": "Jun", "revenue": 55 },
    { "month": "Jul", "revenue": 48 },
    { "month": "Aug", "revenue": 62 },
    { "month": "Sep", "revenue": 55 },
    { "month": "Oct", "revenue": 70 },
    { "month": "Nov", "revenue": 65 },
    { "month": "Dec", "revenue": 78 }
  ]
}
```
- **IMPORTANT for Recharts:** Use `data` array with objects, `xKey` for X-axis, and `lines` array with dataKey/label/color
- `data`: array of objects where each object has the xKey property and numeric properties for each line
- `xKey`: property name for X-axis (e.g., "month", "date", "week")
- `lines`: array of `{dataKey: string (matches property in data), label: string (for legend), color: string (hex color)}`

#### `area-traffic` — Area Chart (Website Traffic)
```json
{
  "title": "Website Traffic",
  "points": [30, 45, 35, 60, 50, 70, 65, 80, 75, 90, 85, 100]
}
```
- `points`: array of numbers (rendered as gradient bars from cyan-600 to cyan-200)
- No labels needed

---

### Pie / Doughnut Charts

#### `traffic-pie` — Pie Chart (Traffic Sources)
```json
{
  "title": "Traffic Sources",
  "segments": [
    { "label": "Direct", "value": "45%", "pct": 45, "color": "#6366f1" },
    { "label": "Organic", "value": "30%", "pct": 30, "color": "#a855f7" },
    { "label": "Social", "value": "15%", "pct": 15, "color": "#ec4899" },
    { "label": "Email", "value": "10%", "pct": 10, "color": "#f59e0b" }
  ]
}
```
- `segments`: array of `{label, value (display string), pct (number 0-100), color (hex)}`
- All `pct` values must sum to 100
- Colors: use hex values — popular palette: `#6366f1`, `#a855f7`, `#ec4899`, `#f59e0b`, `#10b981`, `#3b82f6`

#### `donut-budget` — Doughnut Chart (Budget Allocation)
```json
{
  "title": "Budget Allocation",
  "segments": [
    { "label": "Engineering", "value": 40, "color": "#6366f1" },
    { "label": "Marketing", "value": 35, "color": "#a855f7" },
    { "label": "Sales", "value": 15, "color": "#ec4899" },
    { "label": "Other", "value": 10, "color": "#f59e0b" }
  ]
}
```
- `segments`: array of `{label, value (number, used as %, must sum to 100), color (hex)}`
- Difference from traffic-pie: `value` is a number (not string), no `pct` field

---

### Horizontal Bar (Attribution) Charts

#### `channel-attribution` — Horizontal Bars with Colors
```json
{
  "title": "Channel Attribution",
  "channels": [
    { "label": "Organic", "value": 35, "pct": 35, "color": "#6366f1" },
    { "label": "Paid", "value": 28, "pct": 28, "color": "#a855f7" },
    { "label": "Email", "value": 22, "pct": 22, "color": "#ec4899" },
    { "label": "Referral", "value": 15, "pct": 15, "color": "#f59e0b" }
  ]
}
```
- `channels`: array of `{label, value (number), pct (0-100), color (hex)}`

#### `region-breakdown` — Regional Breakdown Bars
```json
{
  "title": "Regional Breakdown",
  "regions": [
    { "name": "North America", "value": "45%", "pct": 45, "color": "#6366f1" },
    { "name": "Europe", "value": "30%", "pct": 30, "color": "#a855f7" },
    { "name": "Asia Pacific", "value": "18%", "pct": 18, "color": "#ec4899" },
    { "name": "Other", "value": "7%", "pct": 7, "color": "#f59e0b" }
  ]
}
```
- `regions`: array of `{name, value (display string), pct (0-100), color (hex)}`

---

### Heatmap

#### `heatmap` — Activity Heatmap Grid
```json
{
  "title": "Performance Heatmap",
  "cells": 35,
  "palette": ["bg-slate-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"]
}
```
- `cells`: total number of grid cells (default 35 for 5 rows × 7 cols)
- `palette`: array of Tailwind bg classes from low → high intensity

---

## Chart.js Native Format Reference

> For reference when the project evolves to use Chart.js directly.

### Line Chart (Chart.js)
```json
{
  "type": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "datasets": [{
      "label": "Revenue",
      "data": [65, 59, 80, 81, 56, 55],
      "fill": false,
      "borderColor": "rgb(75, 192, 192)",
      "backgroundColor": "rgba(75, 192, 192, 0.2)",
      "tension": 0.1
    }]
  }
}
```
Key dataset properties: `label`, `data[]`, `fill`, `borderColor`, `backgroundColor`, `tension` (0=sharp, 0.4=curved), `borderWidth`, `pointRadius`, `pointStyle`

### Bar Chart (Chart.js)
```json
{
  "type": "bar",
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    "datasets": [{
      "label": "Sales",
      "data": [65, 59, 80, 81, 56, 55, 40],
      "backgroundColor": [
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(201, 203, 207, 0.2)"
      ],
      "borderColor": ["rgb(255,99,132)", "rgb(255,159,64)", "rgb(255,205,86)", "rgb(75,192,192)", "rgb(54,162,235)", "rgb(153,102,255)", "rgb(201,203,207)"],
      "borderWidth": 1
    }]
  },
  "options": { "scales": { "y": { "beginAtZero": true } } }
}
```
Key dataset properties: `label`, `data[]`, `backgroundColor`, `borderColor`, `borderWidth`, `barPercentage` (0.9), `categoryPercentage` (0.8), `borderRadius`, `indexAxis` ('x'=vertical, 'y'=horizontal)

### Pie Chart (Chart.js)
```json
{
  "type": "pie",
  "data": {
    "labels": ["Red", "Blue", "Yellow"],
    "datasets": [{
      "label": "Dataset",
      "data": [300, 50, 100],
      "backgroundColor": ["rgb(255,99,132)", "rgb(54,162,235)", "rgb(255,205,86)"],
      "hoverOffset": 4
    }]
  }
}
```

### Doughnut Chart (Chart.js)
```json
{
  "type": "doughnut",
  "data": {
    "labels": ["Red", "Blue", "Yellow"],
    "datasets": [{
      "data": [300, 50, 100],
      "backgroundColor": ["rgb(255,99,132)", "rgb(54,162,235)", "rgb(255,205,86)"],
      "hoverOffset": 4
    }]
  }
}
```
- Same as pie but `type: "doughnut"` and `cutout: "50%"` (default)
- Key options: `cutout` (string % or px), `rotation`, `circumference`

### Radar Chart (Chart.js)
```json
{
  "type": "radar",
  "data": {
    "labels": ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
    "datasets": [{
      "label": "Dataset 1",
      "data": [65, 59, 90, 81, 56, 55, 40],
      "fill": true,
      "backgroundColor": "rgba(255, 99, 132, 0.2)",
      "borderColor": "rgb(255, 99, 132)",
      "pointBackgroundColor": "rgb(255, 99, 132)",
      "pointBorderColor": "#fff"
    }]
  },
  "options": { "elements": { "line": { "borderWidth": 3 } } }
}
```
- `labels`: axis names (5–10 recommended)
- Multiple datasets can be compared on same chart
- Key options: `scales.r.min`, `scales.r.max`, `scales.r.ticks`

### Polar Area Chart (Chart.js)
```json
{
  "type": "polarArea",
  "data": {
    "labels": ["Red", "Green", "Yellow", "Grey", "Blue"],
    "datasets": [{
      "data": [11, 16, 7, 3, 14],
      "backgroundColor": ["rgb(255,99,132)", "rgb(75,192,192)", "rgb(255,205,86)", "rgb(201,203,207)", "rgb(54,162,235)"]
    }]
  }
}
```
- Like pie but all segments have equal angles; radius reflects value

### Bubble Chart (Chart.js)
```json
{
  "type": "bubble",
  "data": {
    "datasets": [{
      "label": "Dataset 1",
      "data": [
        { "x": 20, "y": 30, "r": 15 },
        { "x": 40, "y": 10, "r": 10 },
        { "x": 15, "y": 50, "r": 8 }
      ],
      "backgroundColor": "rgb(255, 99, 132)"
    }]
  }
}
```
- `x`: horizontal position
- `y`: vertical position
- `r`: bubble radius in pixels (NOT a data value, purely visual)
- No `labels` array needed

### Scatter Chart (Chart.js)
```json
{
  "type": "scatter",
  "data": {
    "datasets": [{
      "label": "Dataset 1",
      "data": [
        { "x": -10, "y": 0 },
        { "x": 0, "y": 10 },
        { "x": 10, "y": 5 },
        { "x": 0.5, "y": 5.5 }
      ],
      "backgroundColor": "rgb(255, 99, 132)"
    }]
  },
  "options": { "scales": { "x": { "type": "linear", "position": "bottom" } } }
}
```
- Like line chart but without connecting lines
- `x` axis is numeric (not categorical labels)

---

## Common Configuration Options

### Scales (axes)
```json
{
  "options": {
    "scales": {
      "x": {
        "type": "category",
        "title": { "display": true, "text": "Month" },
        "grid": { "display": false }
      },
      "y": {
        "beginAtZero": true,
        "max": 100,
        "title": { "display": true, "text": "Value" }
      }
    }
  }
}
```

### Legend
```json
{
  "options": {
    "plugins": {
      "legend": {
        "position": "top",
        "display": true,
        "labels": { "color": "#333", "font": { "size": 12 } }
      }
    }
  }
}
```

### Tooltip
```json
{
  "options": {
    "plugins": {
      "tooltip": {
        "enabled": true,
        "callbacks": {}
      }
    }
  }
}
```

### Responsive / Size
```json
{
  "options": {
    "responsive": true,
    "maintainAspectRatio": false
  }
}
```

---

## AI Update Rules for This Project

When updating a widget's data via Groq AI chat:

### For `revenue-chart` or `line-trend`:
- **"complete the months"** → extend `labels` to all 12 months + generate matching `bars`/`points`
- **"add data"** → append new values to both `bars`/`points` and `labels` arrays
- **"change to line chart"** → change widgetId to `line-trend`, rename `bars` to `points`
- Arrays `bars`/`points` and `labels` MUST always be the same length

### For `traffic-pie` or `donut-budget`:
- **"add segment"** → add new object to `segments` array, reduce other pcts proportionally
- **"change color"** → update `color` field on matching segment (hex only)
- All segment `pct` values MUST sum to 100

### For `stacked-bar`:
- Groups have exactly 3 values: `a`, `b`, `c` matching `legend[0]`, `legend[1]`, `legend[2]`
- **"add month"** → push new `{label, a, b, c}` to `groups`

### For `horizontal-bar`:
- `bars` array items are `{label: string, value: number}` objects (NOT plain numbers)

### For `channel-attribution` / `region-breakdown`:
- `channels` / `regions` contain `pct` (for width) AND `value` (display number)
- Keep `pct` values as whole numbers 0-100

### Color Palette (recommended hex values):
- Indigo: `#6366f1`
- Purple: `#a855f7`
- Pink: `#ec4899`
- Amber: `#f59e0b`
- Emerald: `#10b981`
- Blue: `#3b82f6`
- Cyan: `#06b6d4`
- Rose: `#f43f5e`
- Orange: `#f97316`
- Teal: `#14b8a6`

---

## 🏗️ Nested Columns & Layout System

### IMPORTANT: Columns Can Contain Columns

The `container` component type supports **UNLIMITED RECURSIVE NESTING**. You can create columns inside columns to build complex, multi-level layouts.

#### Example: Two-Column Layout with Nested Sections
```typescript
// Parent container (horizontal split)
{
  type: "container",
  config: {
    display: "flex",
    direction: "row",
    gap: 6,
    className: "w-full"
  },
  children: [
    // Left column (nested vertical layout)
    {
      type: "container",
      config: {
        display: "flex",
        direction: "column",
        gap: 4,
        className: "w-1/3"
      },
      children: [
        { type: "analytics-cards", config: {...} },
        { type: "chart-bar", config: {...} }
      ]
    },
    // Right column (nested grid layout)
    {
      type: "container",
      config: {
        display: "grid",
        columns: 2,
        gap: 4,
        className: "flex-1"
      },
      children: [
        { type: "text", config: {...} },
        { type: "text", config: {...} },
        { type: "text", config: {...} },
        { type: "text", config: {...} }
      ]
    }
  ]
}
```

#### Container Configuration Options

**Layout Types:**
- `display: "flex"` — Flexbox layout (default)
  - `direction: "row"` — Horizontal (default)
  - `direction: "column"` — Vertical
  - `wrap: true` — Allow wrapping
  - `justify: "start" | "center" | "end" | "between" | "around" | "evenly"`
  - `align: "start" | "center" | "end" | "stretch" | "baseline"`
- `display: "grid"` — Grid layout
  - `columns: number` — Number of columns (e.g., 2, 3, 4)

**Spacing:**
- `gap: number` — Space between children (0-12, maps to Tailwind spacing)

**Styling:**
- `className: string` — Tailwind classes (e.g., "w-full", "p-6", "rounded-xl", "bg-blue-500")

### When to Use Nested Columns

1. **Sidebar + Main Content** — `direction: "row"` parent with two column children
2. **Dashboard Sections** — `direction: "column"` parent with multiple row children
3. **Card Grids** — `display: "grid"` parent with `columns: 3` or `columns: 4`
4. **Complex Layouts** — Mix flex and grid at different nesting levels

---

## 📐 Pre-Built Dashboard Templates

The system includes 6 professional dashboard layout templates that can be instantly applied. Each template demonstrates nested column patterns and follows UI/UX best practices.

### Available Templates

1. **metrics-overview**
   - Top row of 4 stat cards + wide chart below
   - Perfect for: KPI dashboards, executive summaries
   - Layout: Vertical container → Analytics cards + Bar chart

2. **split-dashboard**
   - Sidebar metrics (1/4 width) + main content area (3/4 width)
   - Perfect for: Monitoring dashboards, real-time analytics
   - Layout: Horizontal container → Narrow column + Wide column (nested)

3. **grid-dashboard**
   - 3x2 grid of equal-sized cards
   - Perfect for: Balanced layouts, multi-metric views
   - Layout: Grid container (3 columns) → 6 components

4. **analytics-dashboard**
   - Large chart at top + 4 metric cards below
   - Perfect for: Data analysis, trend visualization
   - Layout: Vertical container → Line chart + Analytics cards

5. **monitoring-dashboard**
   - 3 time-series charts stacked vertically
   - Perfect for: System monitoring, server metrics
   - Layout: Vertical container → 3 Line charts

6. **kpi-dashboard**
   - 2x2 grid of big numbers with mini trend charts
   - Perfect for: Executive dashboards, high-level KPIs
   - Layout: Grid container (2 columns) → 4 nested containers (each with card + chart)

### How to Use Templates

When a user says:
- "apply metrics overview template"
- "use the split dashboard layout"
- "create a monitoring dashboard"
- "give me the KPI template"

You should:
1. Reference the template from `src/lib/dashboard-templates.ts`
2. Create all components in the template structure
3. Maintain the parent-child relationships and order values
4. Preserve the nested column configurations

### Template Customization

After applying a template, users can:
- Update data in charts/cards
- Change colors and styling
- Add/remove components
- Adjust gap spacing and layout properties
- Nest additional columns inside template containers

---

## 💡 Layout Best Practices

Based on https://medium.com/@CarlosSmith24/how-to-create-user-friendly-admin-dashboards-with-effective-ui-ux-design-e6860df39066

1. **Visual Hierarchy** — Most important metrics at top, details below
2. **Consistent Spacing** — Use `gap: 4` or `gap: 6` throughout
3. **Responsive Grids** — Use `columns: 2` for mobile, `columns: 4` for desktop
4. **Logical Grouping** — Related metrics in same container
5. **White Space** — Don't overcrowd; use nested containers to organize
6. **Color Coding** — Consistent colors for similar data types
7. **Scannable Layout** — F-pattern or Z-pattern reading flow
