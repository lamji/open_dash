# Bug Fix: Edit Modal Shows Wrong Title

**Date:** 2026-03-05
**Status:** FIXED ✅
**Issue:** When clicking to edit a Column, modal displays widget's name instead of indicating column styles are being edited

---

## Problem

When user clicks the edit (pencil) button on a **Column container**, the modal shows:
```
Sales Analytics — Column 1
```

But they're actually editing the **Column 1's CSS styles**, not the "Sales Analytics" widget.

This is confusing because:
1. User clicked the column edit button
2. Modal opens claiming to edit "Sales Analytics"
3. User can only edit CSS (column styles), not the widget

---

## Root Cause

The modal title logic was showing `widgetTitle` whenever a widget existed in that column, regardless of what was actually being edited.

**File:** `/src/presentation/builder/index.tsx` (lines 776-780)
```tsx
// OLD (Confusing)
{cssEditorState?.widgetTitle
  ? `${cssEditorState.widgetTitle} — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
  : `styles.css — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
}
```

**File:** `/src/presentation/builder/useBuilder.ts` (lines 517-536)
```tsx
// OLD - Always included widget info even when editing column
const editorState: BlockStyleEditorState = {
  blockId,
  slotIdx,
  css: currentCss,
  widgetId: widget?.widgetId,        // Always included
  widgetTitle: widget?.title,        // Always included
  widgetCategory: widget?.category,  // Always included
  ...
};
```

---

## Solution

### Change 1: Updated Modal Title
**File:** `/src/presentation/builder/index.tsx`

```tsx
// NEW (Clear)
{cssEditorState?.widgetTitle
  ? `${cssEditorState.widgetTitle} (Widget) — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
  : `Column ${(cssEditorState?.slotIdx ?? 0) + 1} Styles (CSS only)`
}
```

Now when editing a column:
- **If widget exists:** Shows `Widget Name (Widget) — Column X`
- **If no widget:** Shows `Column X Styles (CSS only)` ← Clear it's editing the column

### Change 2: Added Context Flag to Editor State
**File:** `/src/presentation/builder/useBuilder.ts`

Added `editingWidget` parameter to `openCssEditor()`:
```tsx
const openCssEditor = (blockId: string, slotIdx: number, editingWidget: boolean = false) => {
  // Only include widget info when explicitly editing the widget
  const editorState: BlockStyleEditorState = {
    blockId,
    slotIdx,
    css: currentCss,
    widgetId: editingWidget ? widget?.widgetId : undefined,
    widgetTitle: editingWidget ? widget?.title : undefined,
    widgetCategory: editingWidget ? widget?.category : undefined,
    widgetData: editingWidget ? widget?.widgetData : undefined,
    functionCode: editingWidget ? widget?.functionCode : undefined,
  };

  const editingWhat = editingWidget ? `widget "${widget?.title}"` : `column ${slotIdx + 1} styles`;
  console.log(`[Editor] Opening CSS editor for:`, { blockId, slotIdx, editingWhat });

  setCssEditorState(editorState);
  // ...
};
```

---

## Result

### Before ❌
```
User clicks: Column 1 edit button
Modal shows: "Sales Analytics — Column 1"
User thinks: I'm editing Sales Analytics widget
Reality: I can only edit Column 1 CSS styles
Confusion: ⚠️
```

### After ✅
```
User clicks: Column 1 edit button
Modal shows: "Column 1 Styles (CSS only)"
User thinks: I'm editing Column 1 container styles
Reality: Can only edit Column 1 CSS styles
Clarity: ✅
```

---

## Testing

### Test Case 1: Edit Column with Widget
```
1. Create dashboard with 4-column grid
2. Add "Sales Analytics" widget to Column 1
3. Click pencil icon on Column 1
4. Modal title should show: "Column 1 Styles (CSS only)"
   (NOT "Sales Analytics — Column 1")
5. Can edit CSS only (no Data/Function tabs)
```

### Test Case 2: Edit Empty Column
```
1. Create dashboard with 4-column grid
2. Leave Column 2 empty
3. Click pencil icon on Column 2
4. Modal title should show: "Column 2 Styles (CSS only)"
5. Can edit CSS only
```

### Test Case 3: Verify Logging
```bash
# Monitor logs while editing columns
tail -f console output

# Should see:
[Editor] Opening CSS editor for: {
  blockId: "block-123",
  slotIdx: 0,
  editingWhat: "column 1 styles",
  widget: undefined
}
```

---

## Files Modified

| File | Changes |
|------|---------|
| `/src/presentation/builder/index.tsx` | Updated modal title display logic (lines 776-780) |
| `/src/presentation/builder/useBuilder.ts` | Added editingWidget parameter and logging (lines 517-545) |

---

## User Experience Improvement

- ✅ Clear indication of what's being edited
- ✅ Distinguishes between editing column container vs widget
- ✅ Console logging helps debug what was clicked
- ✅ Reduces confusion when multiple items exist in same space

---

## Notes

- Current implementation: All edit buttons call `openCssEditor(blockId, slotIdx)` with default `editingWidget=false`
- This is correct because the edit buttons on columns are for CSS-only editing
- Future: Can add widget-specific editing if needed by passing `editingWidget=true`

---

## Example Scenarios

### Scenario 1: Column with multiple widgets
If a column could contain multiple widgets, the title would clarify which one (or that it's the column itself).

### Scenario 2: Nested layouts
The "Column X" labeling scales well to nested grids where columns might be in other columns.

### Scenario 3: Widget-specific editing
If we add widget editing later, we can pass `editingWidget=true` to show widget-specific data and functions.

---

**Status:** Ready for production ✅
