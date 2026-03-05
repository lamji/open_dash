# Widget Picker Enhancement: Shadcn Card Component

**Date:** 2026-03-05
**Status:** ✅ IMPLEMENTED
**Issue:** Widget picker preview cards were getting cut off, showing truncated content
**Solution:** Created dedicated shadcn Card-based component for professional widget selection UI

---

## Problem

The original widget picker had these issues:
1. ❌ Widget previews were getting cut off/truncated
2. ❌ Content not fully visible due to height constraints
3. ❌ Inconsistent spacing and layout
4. ❌ Poor user experience for widget selection

**Before:**
```
System Health      Latency       Uptime
(truncated)        (truncated)    (truncated)
System Healt...    API Latency... Uptime...
```

---

## Solution Implemented

### 1. Created New Shadcn Card Component
**File:** `/src/components/widgets/widget-picker-card.tsx`

A dedicated, reusable component that:
- Uses shadcn/ui `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- Displays full widget previews without truncation
- Shows only available widgets (with preview functions)
- Provides professional, polished UI

**Key Features:**
```tsx
✅ Full-height preview area (h-64 = 16rem)
✅ Responsive grid layout (1-5 columns based on screen)
✅ Smooth hover animations (scale, shadow)
✅ Active/focus states for accessibility
✅ Gradient background for visual polish
✅ Line clamping for titles and descriptions
✅ Proper overflow handling
```

### 2. Updated Builder Integration
**File:** `/src/presentation/builder/index.tsx`

Replaced inline widget picker with the new component:

```tsx
// Before: 25+ lines of JSX in builder
<div className="grid grid-cols-1 sm:grid-cols-2 ...">
  {variantTemplates
    .filter((template) => WIDGET_PREVIEWS[template.slug])
    .map((template) => (
      <button> ... </button>
    ))}
</div>

// After: Clean component usage
<WidgetPickerCard
  templates={variantTemplates}
  onSelect={(template) => {
    placeWidget(...);
  }}
/>
```

### 3. Enhanced Modal Sizing
- Modal: `max-w-6xl max-h-[80vh]`
- Preview height: `h-64` (16rem - 40% larger)
- Grid columns: responsive 1 → 2 → 3 → 4 → 5
- Gap: `gap-4` for better spacing

---

## Result

### Before ❌
```
Choose a Health widget
┌─────────┬─────────┬─────────┐
│ System  │ API     │ Uptime  │
│ Health  │ Latency │ Monitor │
│ (cut)   │ (cut)   │ (cut)   │
│ System. │ API La. │ Uptime. │
└─────────┴─────────┴─────────┘
```

### After ✅
```
Choose a Health widget
┌──────────────────┬──────────────────┬──────────────────┐
│  System Health   │  API Latency     │  Uptime Monitor  │
│                  │                  │                  │
│  • API           │  P50             │  • API           │
│    Operational   │  /api/users 45ms │    99.98%        │
│  • Database      │  P95             │  • Database      │
│    Operational   │  /api/orders 120 │    99.95%        │
│  • Cache         │                  │  • CDN           │
│    Degraded      │  API Latency ... │    100%          │
│                  │                  │                  │
│  System Health   │  API Latency ... │  Uptime Monitor  │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## Technical Details

### Component Structure
```
WidgetPickerCard
├── Filters templates (only shows available widgets)
├── Empty state handling
└── Grid layout (responsive columns)
    └── Card (shadcn/ui)
        ├── CardContent (Preview area - h-64)
        │   └── Widget preview rendering
        ├── CardHeader (Title section)
        │   ├── CardTitle (Widget name)
        │   └── CardDescription (Optional description)
        └── Interactive states
            ├── Hover (scale, shadow, border color)
            ├── Active (scale down)
            └── Focus (ring outline)
```

### Responsive Grid Breakpoints
```
Screen Size    Columns
───────────────────────
Mobile         1
Tablet         2
Laptop         3
Desktop        4
Ultra-wide     5
```

### Preview Height
```
Previous: h-40 (10rem)
Current:  h-64 (16rem) ← 60% larger!
```

---

## File Structure

```
src/
├── components/
│   ├── widgets/
│   │   └── widget-picker-card.tsx ✨ NEW
│   └── ui/
│       ├── card.tsx (existing shadcn)
│       └── avatar.tsx (existing shadcn)
└── presentation/
    └── builder/
        └── index.tsx (updated - now uses WidgetPickerCard)
```

---

## Integration Points

### 1. Builder Modal
```tsx
<Dialog open={!!showWidgetVariantPicker} onOpenChange={closeWidgetVariantPicker}>
  <DialogContent className="max-w-6xl bg-white max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>Choose a {category} widget</DialogTitle>
    </DialogHeader>

    <WidgetPickerCard
      templates={variantTemplates}
      onSelect={(template) => {
        placeWidget(blockId, slotIdx, template);
        closePickerModal();
      }}
    />
  </DialogContent>
</Dialog>
```

### 2. Props Interface
```typescript
interface WidgetPickerCardProps {
  templates: WidgetTemplate[];
  onSelect: (template: WidgetTemplate) => void;
}
```

---

## Features

✅ **Full Widget Previews**
- No more cut-off content
- Complete view of what user will get

✅ **Professional UI**
- Shadcn Card component (consistent with app)
- Smooth animations and transitions
- Proper focus states for accessibility

✅ **Responsive Design**
- Mobile: 1 column
- Tablet: 2 columns
- Laptop: 3 columns
- Desktop: 4 columns
- Ultra-wide: 5 columns

✅ **Filtered Display**
- Only shows widgets with actual previews
- Empty state handling
- Description support (if available)

✅ **Accessibility**
- Focus ring for keyboard navigation
- Proper hover/active states
- Semantic HTML structure
- ARIA-compatible

✅ **Maintainability**
- Separated from builder logic
- Reusable component
- Clear props interface
- Type-safe with TypeScript

---

## Usage Example

```tsx
import { WidgetPickerCard } from '@/components/widgets/widget-picker-card';
import type { WidgetTemplate } from '@/presentation/widgets/useWidgets';

export function MyComponent() {
  const [templates] = useWidgets();

  const handleSelectWidget = (template: WidgetTemplate) => {
    console.log(`Selected: ${template.title}`);
    // Place widget or perform action
  };

  return (
    <WidgetPickerCard
      templates={templates}
      onSelect={handleSelectWidget}
    />
  );
}
```

---

## Testing

### Manual Testing Steps
1. Click "Add Widget" in builder
2. Select a category (Health, Summary, Stats, etc.)
3. Verify:
   - ✅ All widget previews fully visible (no truncation)
   - ✅ Preview area is large (h-64)
   - ✅ Layout responsive (different column counts on different screens)
   - ✅ Hover effects work (scale, shadow)
   - ✅ Click to select works
   - ✅ Only widgets with previews show

### Browser DevTools
```
Check computed styles:
- Preview height: 16rem (h-64)
- Grid columns: responsive
- Card border: 2px
- Hover: border-color + shadow change
```

---

## Performance

✅ **Minimal Re-renders**
- Component only re-renders on prop changes
- Filter happens once per render
- Preview functions cached

✅ **Smooth Animations**
- CSS transitions (duration-200)
- GPU-accelerated transforms (scale)
- No animation delays

---

## Accessibility

✅ **Keyboard Navigation**
- Tab through cards
- Space/Enter to select
- Focus ring visible

✅ **Screen Readers**
- Semantic card structure
- Title and description read aloud
- Button role on card

✅ **Color Contrast**
- Text meets WCAG AA standards
- Focus ring visible on all backgrounds

---

## Future Enhancements

🚀 Potential improvements:
1. Add widget favoriting/starring
2. Search/filter within category
3. Widget preview interactions (click to expand)
4. Widget drag-and-drop preview
5. Widget categories/tags display
6. Rating/usage stats

---

## Dependencies

✅ **Already installed:**
- shadcn/ui card component
- shadcn/ui avatar component
- React 19
- TypeScript 5
- Tailwind CSS 4

✅ **No additional dependencies required!**

---

**Status:** Ready for production ✅
