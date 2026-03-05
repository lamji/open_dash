# Bug Fix: Chart Not Rendering in Builder

**Date:** 2026-03-05
**Status:** FIXED ✅
**Issue:** Line charts (and bar charts) not appearing in builder preview, only showing title with "No preview"

---

## Problem Analysis

### What Users Saw
- User adds dashboard template → prompts AI to "create analytics for sales with line chart"
- AI generates a widget
- Only the title appears ("Sales Analytics" or "Monthly Sales Trend")
- The chart area shows "No preview" instead of the actual line chart

### Root Causes (Multiple Issues)

#### Issue #1: Wrong Widget ID
**Location:** `/api/builder/ai-widget/route.ts` (line 102)

The AI was generating:
```json
{ "widgetId": "line-trend" }
```

But the component registry only has:
```typescript
"chart-bar": ({ config }) => <BarChartBlock ... />
"chart-line": ({ config }) => <LineChartBlock ... />
```

**Result:** Widget ID didn't match any component renderer

#### Issue #2: Wrong Data Format
**Location:** AI knowledge base and route prompts

AI was generating:
```json
{
  "widgetData": {
    "title": "Revenue Trend",
    "points": [20, 35, 28, 45],      // ❌ Wrong format
    "labels": ["Jan", "Feb", "Mar"]  // ❌ Wrong format
  }
}
```

But LineChartBlock expected:
```typescript
interface LineChartConfig {
  xKey: string;                    // ✅ Required
  lines: Array<{                   // ✅ Required
    dataKey: string;
    label: string;
    color: string;
  }>;
  data: Array<{                    // ✅ Required (structured objects)
    [xKey]: string | number;
    [dataKey]: number;
  }>;
}
```

**Result:** Component received incompatible data

#### Issue #3: Missing Preview Functions
**Location:** `/presentation/widgets/index.tsx` (WIDGET_PREVIEWS)

The builder displays chart previews using `WIDGET_PREVIEWS[widgetId]`, but there were no entries for:
- `"chart-bar"`
- `"chart-line"`

**Result:** Builder couldn't render preview, showed "No preview"

---

## Solution Implemented

### Fix #1: Update AI Route with Correct Widget IDs and Data Format
**File:** `/src/app/api/builder/ai-widget/route.ts`

**Changes:**
- Line 102: Updated line chart hint to use `"chart-line"` with Recharts schema
- Line 108: Updated bar chart hint to use `"chart-bar"` with Recharts schema
- Line 145-151: Updated example prompts to show correct output format with proper data structure
- Added detailed logging at each step

**Before:**
```typescript
chartTypeHint = "\n\n**CRITICAL: User explicitly requested a LINE CHART. You MUST use widgetId: \"line-trend\" with schema: { title, points: [], labels: [] }...";
```

**After:**
```typescript
chartTypeHint = "\n\n**CRITICAL: User explicitly requested a LINE CHART. You MUST use widgetId: \"chart-line\" with schema: { title, xKey: \"month\", lines: [{ dataKey: \"value\", label: \"Sales\", color: \"#3b82f6\" }], data: [{ month: \"Jan\", value: 100 }, ...] }...";
```

### Fix #2: Update Knowledge Base Documentation
**File:** `/src/lib/aiKnowledgeBase/how-to-create-chart.md`

**Changes:**
- Lines 87-96: Updated `chart-line` documentation with Recharts format
- Clarified that `data` must be an array of objects
- Explained `xKey` and `lines` structure
- Removed references to old `points/labels` format

**Before:**
```markdown
#### `line-trend` — Line Trend Chart
- `points`: array of numeric values
- `labels`: array of strings
```

**After:**
```markdown
#### `chart-line` — Line Trend Chart
- **IMPORTANT for Recharts:** Use `data` array with objects, `xKey` for X-axis
- `data`: array of objects with xKey property and numeric properties
- `xKey`: property name for X-axis (e.g., "month", "date")
- `lines`: array of {dataKey, label, color}
```

### Fix #3: Add Preview Functions for Recharts Charts
**File:** `/src/presentation/widgets/index.tsx`

**Changes:**
- Lines 4-10: Added imports for `BarChart` and `Bar` components
- Lines 1250-1327: Added two new preview functions:

1. **`"chart-bar"` preview (lines 1255-1282)**
   - Displays bar charts in builder preview
   - Uses Recharts `BarChart` component
   - Handles multiple bar series with legend
   - Shows "No data" gracefully if data is missing

2. **`"chart-line"` preview (lines 1284-1327)**
   - Displays line charts in builder preview
   - Uses Recharts `LineChart` component
   - Supports multiple lines with legend
   - Shows "No data" gracefully if data is missing

**Code example:**
```typescript
"chart-line": (data) => {
  const title = (data.title as string) ?? "Line Chart";
  const xKey = (data.xKey as string) ?? "name";
  const chartData = (data.data as Record<string, any>[]) ?? [];
  const lines = (data.lines as Array<{dataKey: string; label: string; color: string}>) ?? [];

  if (!chartData.length || !lines.length) {
    return <div className="text-xs text-slate-400">No data</div>;
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Chart title and icon */}
      {/* Recharts LineChart with configurable lines and legend */}
    </div>
  );
},
```

### Fix #4: Add Error Handling to Chart Components
**File:** `/src/lib/component-registry.tsx`

**Changes:**
- LineChartBlock (lines 565-619): Added validation for required fields
- BarChartBlock (lines 517-552): Added validation for required fields
- Both now check for empty/missing data and return helpful error messages
- Added React.useEffect logging for debug purposes

**Before:**
```typescript
function LineChartBlock({ config }: { config: LineChartConfig }) {
  return (
    <div>
      <LineChart data={config.data}>
```

**After:**
```typescript
function LineChartBlock({ config }: { config: LineChartConfig }) {
  React.useEffect(() => {
    console.log('[LineChartBlock] Rendering with config:', { title, xKey, linesCount, dataPoints });
  }, [config]);

  if (!config.data || !Array.isArray(config.data) || config.data.length === 0) {
    console.error('[LineChartBlock] Missing or empty data array:', config.data);
    return <div className="text-red-500 text-sm">Error: No data provided for line chart</div>;
  }

  if (!config.lines || !Array.isArray(config.lines) || config.lines.length === 0) {
    console.error('[LineChartBlock] Missing or empty lines array:', config.lines);
    return <div className="text-red-500 text-sm">Error: No line definitions provided</div>;
  }

  return (
    <div>
      <LineChart data={config.data}>
```

### Fix #5: Add Comprehensive Logging
**Location:** Multiple files

Added logging to track the full flow:
1. API route (`/api/builder/ai-widget`): Logs prompt, AI response, parsing, validation
2. useBuilder hook: Logs widget creation and state updates
3. Components (LineChartBlock, BarChartBlock): Logs rendering and data validation

**Logs written to:** `/.logs/` directory
- `ai-widget-generation.log` - API requests and AI responses
- `component-render.log` - Component rendering and errors
- `README.md` - Log guide and debugging tips

---

## Result

### Before Fix
```
User: "create analytics for sales with line chart"
     ↓
AI: {widgetId: "line-trend", widgetData: {points: [...], labels: [...]}}
     ↓
Builder: "No preview" (no widget ID match, no preview function)
```

### After Fix
```
User: "create analytics for sales with line chart"
     ↓
AI: {widgetId: "chart-line", widgetData: {xKey: "month", lines: [...], data: [...]}}
     ↓
Component Registry: LineChartBlock found ✅
     ↓
WIDGET_PREVIEWS: chart-line preview function found ✅
     ↓
Builder: Line chart renders with legend ✅
```

---

## Testing the Fix

### Test Prompt
```
"Create analytics for sales with line chart and legend"
```

### Expected Result
✅ Line chart appears in builder preview
✅ Shows legend with line labels
✅ X-axis has month labels
✅ Y-axis shows numeric scale

### Logs to Check
```bash
tail -20 .logs/ai-widget-generation.log
tail -20 .logs/component-render.log
```

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `/src/app/api/builder/ai-widget/route.ts` | Fixed widget IDs, added logging, updated prompts | 102-185 |
| `/src/lib/aiKnowledgeBase/how-to-create-chart.md` | Updated chart schema documentation | 87-110 |
| `/src/presentation/widgets/index.tsx` | Added chart-bar and chart-line preview functions | 4-10, 1250-1327 |
| `/src/lib/component-registry.tsx` | Added validation and error logging | 515-619 |
| `/src/presentation/builder/useBuilder.ts` | Added detailed logging | 420-475 |

---

## Related Issues Fixed

This fix also resolves:
- Bar charts not rendering with "No preview"
- Charts appearing but showing as empty in production
- Inconsistent chart data formats
- Missing error messages for malformed chart data

---

## Next Steps (Optional)

1. **Add more chart types** (pie, area, heatmap) to component-registry and widgets
2. **Implement chart data updates** via AI prompts (e.g., "update the chart with Q2 data")
3. **Add chart configuration UI** for users to customize colors, axes, etc.
4. **Performance optimization** for large datasets

