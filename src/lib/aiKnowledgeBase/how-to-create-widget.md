# How to Create Widgets

## Overview

Widgets are pre-built, data-driven React preview components rendered inside the dashboard builder. Each widget is defined in the `WIDGET_PREVIEWS` map in `src/presentation/widgets/index.tsx` and stored in the database as a `WidgetTemplate`.

---

## Widget Data Model

```typescript
// src/domain/widgets/types.ts
interface WidgetTemplate {
  id: string;                          // Unique DB identifier
  slug: string;                        // URL-safe key, e.g. "revenue-chart"
  title: string;                       // Display name, e.g. "Monthly Revenue"
  description: string;                 // Short description for the gallery
  category: WidgetCategory;            // One of the 17 categories below
  jsxCode: string;                     // Legacy field (not used for rendering)
  widgetData?: Record<string, unknown>; // All configurable data for the widget
}
```

---

## Categories

| ID            | Label        | Badge Color      |
|---------------|-------------|------------------|
| `stats`       | Stats & KPIs | `bg-blue-500`   |
| `charts`      | Charts       | `bg-violet-500`  |
| `progress`    | Progress     | `bg-emerald-500` |
| `activity`    | Activity     | `bg-orange-500`  |
| `comparison`  | Comparison   | `bg-pink-500`    |
| `health`      | Health       | `bg-red-500`     |
| `timeline`    | Timeline     | `bg-indigo-500`  |
| `list`        | Lists        | `bg-teal-500`    |
| `table`       | Tables       | `bg-cyan-500`    |
| `funnel`      | Funnels      | `bg-amber-500`   |
| `leaderboard` | Leaderboard  | `bg-yellow-500`  |
| `summary`     | Summary      | `bg-slate-600`   |
| `button`      | Buttons      | `bg-rose-500`    |
| `dropdown`    | Dropdowns    | `bg-sky-500`     |
| `menu`        | Menus        | `bg-lime-600`    |
| `search`      | Search       | `bg-fuchsia-500` |
| `form`        | Forms        | `bg-amber-600`   |

---

## Widget Rendering Architecture

### How widgets are rendered

1. **Gallery Page** — `WidgetCard` renders `LivePreview` which calls `WIDGET_PREVIEWS[slug](widgetData)`.
2. **Builder Slots** — When a widget is placed in a builder column, the same `WIDGET_PREVIEWS[slug](widgetData)` function renders the preview.

### The WIDGET_PREVIEWS map

```typescript
const WIDGET_PREVIEWS: Record<string, (data: Record<string, unknown>) => React.ReactElement> = {
  "revenue-chart": (data) => {
    const bars = (data.bars as number[]) ?? [50, 65, 80, 100, 75, 90];
    // ... render logic
  },
};
```

Each entry:
- Receives `data` (the widget's `widgetData` from DB)
- Casts fields with `as` and provides sensible defaults via `??`
- Returns a React element

---

## Responsive Layout Pattern

**Every widget outer wrapper MUST use:**

```tsx
<div className="flex flex-col h-full gap-{size}">
  {/* children */}
</div>
```

- `flex flex-col` — vertical layout
- `h-full` — fills parent container height
- `gap-{size}` — spacing between children (typically `gap-2`)

**Do NOT use** `space-y-*` on outer wrappers — it does not fill parent height.

For widgets with header + content + footer sections that need even distribution:
```tsx
<div className="flex flex-col h-full justify-between">
```

---

## Chart Rendering Techniques

### Bar Charts (revenue-chart, activity-chart)
```tsx
<div className="flex items-end gap-1.5 h-20">
  {bars.map((h, i) => (
    <div
      key={i}
      className="flex-1 rounded-t-sm"
      style={{ height: `${h}%`, background: `hsl(${255 + i * 8}, 70%, ${50 + i * 3}%)` }}
    />
  ))}
</div>
```
- **Colors**: Inline `hsl()` with computed hue shifts, or Tailwind gradient classes (`bg-gradient-to-t from-blue-600 to-blue-300`)
- **Height**: Percentage-based, relative to container

### Pie/Donut Charts (traffic-pie, donut-budget)
```tsx
// Build conic gradient from segments
let pcts = 0;
const conic = segments.map(s => {
  const start = pcts;
  pcts += s.pct;
  return `${s.color} ${start}% ${pcts}%`;
}).join(",");

// Render
<div
  className="aspect-square h-full max-h-24 rounded-full"
  style={{ background: `conic-gradient(${conic})` }}
/>
```
- **Colors**: Hex values in `widgetData.segments[].color` (e.g. `"#6366f1"`)
- **Donut**: Add inner white circle with `absolute inset-2 bg-white rounded-full`

### Horizontal Bar Charts (horizontal-bar, channel-attribution)
```tsx
<div className="flex-1 bg-slate-100 rounded-full h-2">
  <div
    className="h-2 bg-violet-500 rounded-full"
    style={{ width: `${(value / max) * 100}%` }}
  />
</div>
```

### Heatmap
```tsx
<div className="grid grid-cols-7 gap-0.5">
  {Array.from({ length: cells }, (_, i) => (
    <div className={`aspect-square rounded-sm ${palette[i % palette.length]}`} />
  ))}
</div>
```
- **Colors**: Tailwind classes in `widgetData.palette[]` (e.g. `"bg-emerald-400"`)

---

## Common widgetData Shapes

### Stats Widgets
```json
{
  "value": "$12,345",
  "label": "Total Revenue",
  "change": "+12.5%",
  "up": true,
  "period": "vs last month"
}
```

### Chart Widgets
```json
{
  "title": "Monthly Revenue",
  "bars": [50, 65, 80, 100, 75, 90],
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
}
```

### Pie/Donut Segments
```json
{
  "title": "Traffic Sources",
  "segments": [
    { "label": "Direct", "value": "45%", "pct": 45, "color": "#6366f1" },
    { "label": "Organic", "value": "30%", "pct": 30, "color": "#a855f7" }
  ]
}
```

### Progress Widgets
```json
{
  "label": "Sales Target",
  "pct": 75,
  "currentLabel": "$75,000",
  "targetLabel": "$100,000"
}
```

### Activity/Feed Widgets
```json
{
  "items": [
    { "color": "bg-emerald-500", "text": "New user signed up", "time": "2 min ago" }
  ]
}
```

### Table Widgets
```json
{
  "title": "Recent Orders",
  "rows": [
    { "id": "#1234", "customer": "Alice", "amount": "$120", "status": "Completed" }
  ]
}
```

### Funnel Widgets
```json
{
  "title": "Conversion Funnel",
  "stages": [
    { "label": "Visitors", "value": 10000, "pct": 100 },
    { "label": "Sign-ups", "value": 2400, "pct": 24 }
  ]
}
```

---

## Styling Properties Reference

### Colors
- **Chart bars**: Inline `hsl()` or `background` style property
- **Pie/donut**: `conic-gradient()` built from segment `color` (hex values)
- **Progress bars**: shadcn `<Progress>` component
- **Status indicators**: Tailwind classes (e.g. `bg-emerald-500`, `text-red-600`)
- **Backgrounds**: `bg-slate-50`, `bg-blue-50`, etc.

### Typography
- **Titles**: `text-sm font-bold text-slate-800`
- **Values**: `text-2xl font-bold text-slate-900` (stats), `text-base font-bold` (summaries)
- **Labels**: `text-xs text-slate-500` or `text-xs text-slate-400`
- **Badges**: `text-xs font-medium` with color-coded backgrounds

### Spacing
- **Outer gap**: `gap-2` (8px) standard, `gap-2.5` (10px) for progress groups
- **Inner gaps**: `gap-1`, `gap-1.5`, `gap-0.5` for tighter elements
- **Padding**: `p-2` for cards/badges, `px-3 py-2` for inputs

### Borders & Shadows
- **Cards**: `rounded-lg border border-slate-200`
- **Inputs**: `border border-slate-200 rounded-lg`
- **Dropdowns**: `border border-slate-200 rounded-lg overflow-hidden shadow-sm`

---

## How to Add a New Widget

### Step 1: Define the data schema
Decide what properties the widget needs in `widgetData`. Use sensible defaults.

### Step 2: Add to WIDGET_PREVIEWS
```typescript
"my-new-widget": (data) => {
  const title = (data.title as string) ?? "Default Title";
  const items = (data.items as { label: string; value: number }[]) ?? [];
  return (
    <div className="flex flex-col h-full gap-2">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {/* widget content */}
    </div>
  );
},
```

### Step 3: Add to database
Insert a new `WidgetTemplate` document with:
- `slug` matching the key in `WIDGET_PREVIEWS`
- `category` from the `WidgetCategory` union type
- `widgetData` matching your schema

### Step 4: Stateful widgets
For widgets needing `useState` (tabs, toggles, dropdowns):
```typescript
function MyStatefulWidget({ data }: { data: Record<string, unknown> }) {
  const [state, setState] = useState(/* default */);
  return (
    <div className="flex flex-col h-full gap-2" data-test-id="my-widget-container">
      {/* interactive content */}
    </div>
  );
}

// Then in WIDGET_PREVIEWS:
"my-stateful-widget": (data) => <MyStatefulWidget data={data} />,
```

---

## Groq AI Integration

When a widget is placed in a builder slot and the user opens the AI chat:
1. The widget's `widgetId`, `category`, `title`, and full `widgetData` are sent to the Groq API
2. Groq receives a system prompt describing the widget structure and data
3. The user can ask Groq to change colors, sizes, spacing, or any visual property
4. Groq responds with CSS declarations applied to the widget's container column

### What Groq can modify
- Container styles (background, padding, border-radius, shadows)
- Layout properties (display, flex, grid, gap)
- Colors and gradients on the container level
- Typography overrides via CSS custom properties

### What requires widgetData changes
- Chart colors (stored in `segments[].color` or inline `hsl()`)
- Data values (bars, percentages, labels)
- Widget-specific configs (number of items, palette arrays)