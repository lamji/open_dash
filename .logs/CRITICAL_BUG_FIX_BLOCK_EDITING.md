# CRITICAL BUG FIX: Block Container Styling Applied to First Widget

**Date:** 2026-03-05
**Severity:** 🔴 CRITICAL
**Status:** ✅ FIXED
**Issue:** When editing a block container's CSS, changes were applied to the **first widget inside** instead of the **block itself**

---

## The Problem

### What Users Experienced
1. Create a "4-COLUMN GRID" block
2. Click the edit (✏️) button on the **block header** (top right)
3. Modal opens showing "Sales Analytics — Column 1" (the FIRST widget)
4. Change background to white
5. **Bug:** White background applied to Sales Analytics widget, NOT the grid container

### Root Cause
The block's edit button was calling:
```tsx
onClick={() => { openCssEditor(block.id, 0); ... }}
```

This opened editing for **slot 0**, which contained the first widget (Sales Analytics). Any CSS changes were saved to that slot, not the block container.

**File:** `/src/presentation/builder/index.tsx` (line 424)

---

## The Architecture Problem

```
4-COLUMN GRID (Block Container)
├── Slot 0 [Sales Analytics widget] ← Edit button was editing this! ❌
├── Slot 1 [Empty]
├── Slot 2 [Goal Progress widget]
└── Slot 3 [Empty]
```

When clicking the block's edit button, the system should edit the **block itself**, not slot 0.

---

## The Solution

### Change 1: Add Block-Level Styles Support
**File:** `/src/domain/builder/types.ts`

Added new field to LayoutBlock:
```typescript
export interface LayoutBlock {
  id: string;
  type: LayoutType;
  slots: (PlacedWidget | null)[];
  blockStyles?: string;      // ✅ NEW: CSS for block container
  columnStyles?: string[];   // CSS for each slot within block
}
```

### Change 2: Update openCssEditor Function
**File:** `/src/presentation/builder/useBuilder.ts`

Changed signature to support optional slotIdx:
```typescript
// OLD: Always required slotIdx
const openCssEditor = (blockId: string, slotIdx: number, editingWidget: boolean = false)

// NEW: slotIdx is optional, undefined = block-level editing
const openCssEditor = (blockId: string, slotIdx?: number)
```

Key changes:
- When `slotIdx === undefined`: Edit block container
- When `slotIdx === -1`: Also block-level (sentinel value)
- Otherwise: Edit specific slot/column

```typescript
const openCssEditor = (blockId: string, slotIdx?: number) => {
  const isBlockLevel = slotIdx === undefined || slotIdx === -1;

  const currentCss = isBlockLevel
    ? block?.blockStyles ?? ""        // ✅ Block-level CSS
    : block?.columnStyles?.[slotIdx] ?? "";  // Slot CSS

  const widget = !isBlockLevel ? block?.slots[slotIdx ?? 0] ?? null : null;
  // ... only fetch widget if NOT editing block level
};
```

### Change 3: Fix Block Header Edit Button
**File:** `/src/presentation/builder/index.tsx` (line 424)

```typescript
// OLD: Passing 0 (first slot)
onClick={() => { openCssEditor(block.id, 0); ... }}

// NEW: No slotIdx (block-level)
onClick={() => { openCssEditor(block.id); setCssEditorDraft(block.blockStyles ?? ""); }}
```

### Change 4: Update Modal Title Display
**File:** `/src/presentation/builder/index.tsx`

```typescript
// NEW: Clear indication of what's being edited
{cssEditorState?.slotIdx === -1
  ? `Block Container Styles (No widget selected)`
  : cssEditorState?.widgetTitle
    ? `${cssEditorState.widgetTitle} (Widget) — Column ${...}`
    : `Column ${...} Styles (CSS only)`
}
```

### Change 5: Update saveCssStyles Function
**File:** `/src/presentation/builder/useBuilder.ts`

Now handles both block-level and slot-level CSS:
```typescript
const saveCssStyles = async (css: string) => {
  const isBlockLevel = slotIdx === -1;

  setBlocks((prev) =>
    prev.map((b) => {
      if (isBlockLevel) {
        // Save to block.blockStyles
        return { ...b, blockStyles: css };
      } else {
        // Save to block.columnStyles[slotIdx]
        return { ...b, columnStyles: styles };
      }
    })
  );
};
```

---

## Result

### Before ❌
```
User clicks: Block edit button (4-COLUMN GRID)
System opens: First widget (Sales Analytics) editor
User changes: background: white
Applied to: Sales Analytics widget ❌
Block styled: NO ✗
```

### After ✅
```
User clicks: Block edit button (4-COLUMN GRID)
System opens: Block container editor
Modal shows: "Block Container Styles (No widget selected)"
User changes: background: white
Applied to: 4-COLUMN GRID block ✅
Block styled: YES ✓
```

---

## What Now Works

✅ **Block container editing:** Click block's edit button → Edit block styles
✅ **Slot/column editing:** Click slot's edit button → Edit slot's styles
✅ **Widget inside slot:** Widget's CSS stored separately from slot's CSS
✅ **No widget confusion:** Clear modal title indicates what's being edited
✅ **Proper CSS application:** Changes apply to intended element

---

## Testing

### Test Case 1: Edit Block Container
```
1. Create 4-column grid
2. Add Sales Analytics to column 1
3. Click block edit button (top right)
4. Modal shows: "Block Container Styles (No widget selected)"
5. Add: background: white; padding: 20px;
6. Save
✅ GRID gets white background and padding (not the widget!)
```

### Test Case 2: Edit Column/Slot
```
1. Same setup as above
2. Click column edit button (pencil on Sales Analytics card)
3. Modal shows: "Sales Analytics (Widget) — Column 1"
4. Add: border: 2px solid red;
5. Save
✅ COLUMN gets red border (not affecting grid or widget)
```

### Test Case 3: Different Columns
```
1. Create grid with widgets in multiple columns
2. Click block edit button → Edit block styles (affects all columns)
3. Click column 1 edit button → Edit column 1 CSS only
4. Click column 2 edit button → Edit column 2 CSS independently
✅ Each level edits independently
```

---

## Files Modified

| File | Changes | Impact |
|------|---------|--------|
| `/src/domain/builder/types.ts` | Added `blockStyles` to LayoutBlock | ✅ Storage for block-level CSS |
| `/src/presentation/builder/useBuilder.ts` | Changed openCssEditor signature, updated saveCssStyles | ✅ Proper block vs slot distinction |
| `/src/presentation/builder/index.tsx` | Fixed block edit button, updated modal title | ✅ Correct targeting |

---

## Technical Details

### Block vs Slot CSS Hierarchy
```
LayoutBlock {
  blockStyles: "background: white; padding: 20px;"  ← Block container
  columnStyles: [
    "border: 1px solid gray;",  // Column 0 styles
    "min-height: 300px;",       // Column 1 styles
    "",
    ""
  ]
}
```

### Editor State Differentiation
- `slotIdx === -1` or `undefined` → Block-level editing
- `slotIdx >= 0` → Slot/column editing
- `widget !== null` → Widget exists in slot

### CSS Application Order
1. Block styles (grid, flex, padding, background, etc.)
2. Column/slot styles (width, height, border, etc.)
3. Widget styles (internal widget styling)

---

## Backward Compatibility

✅ Existing layouts without `blockStyles` will have it as `undefined`
✅ CSS saving handles missing `blockStyles` gracefully
✅ No data migration needed
✅ Old slots without column styles still work

---

## Console Logging

When editing, you'll see:
```
[Editor] Opening CSS editor for: {
  blockId: "block-456",
  slotIdx: "block-level",
  editingWhat: "block 'container' container styles"
}

[Styles] Saving block-level CSS {
  blockId: "block-456",
  css: "background: white; padding: 20px;"
}
```

---

## Why This Matters

This was a **critical bug** because:
1. Users couldn't style the actual block container
2. CSS changes mysteriously affected the first widget instead
3. No way to apply styles to the grid/layout itself
4. Very confusing user experience

---

**Status:** Ready for production ✅
