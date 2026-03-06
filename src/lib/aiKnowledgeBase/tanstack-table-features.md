# TanStack Table Features Guide

## Overview
TanStack Table (React Table) is a powerful, headless table library used in OpenDash for displaying data with advanced features. All three main table widgets (Orders, Customers, Transactions) support comprehensive table features that can be enabled or disabled based on user needs.

## Supported Table Widgets
- `orders-table` - OrdersTableWidget for displaying order data
- `customers-table` - CustomersTableWidget for displaying customer data
- `transactions-table` - TransactionsTableWidget for displaying transaction data

## Feature Configuration

Each table widget accepts a `features` configuration object that controls which advanced features are enabled:

```typescript
interface TableFeatureConfig {
  sorting?: boolean;        // Enable column sorting (default: true)
  filtering?: boolean;      // Enable text filtering (default: true)
  pagination?: boolean;     // Enable pagination (default: true)
  columnVisibility?: boolean;    // Enable column visibility toggle (default: true)
  columnResizing?: boolean;      // Enable column resizing (default: true)
  rowSelection?: boolean;   // Enable row selection with checkboxes (default: true)
  expandableRows?: boolean; // Enable expandable rows (default: false)
}
```

## Feature Details

### 1. Sorting
**Purpose:** Allow users to sort data by clicking on column headers.

**How to Enable:**
```json
{
  "features": {
    "sorting": true
  }
}
```

**Behavior:**
- Click column header to sort ascending
- Click again to sort descending
- Click once more to remove sorting
- Up/down arrows appear on sorted columns
- Faded arrow-up-down icon shows on sortable columns

**Example Configuration:**
```json
{
  "title": "Recent Orders",
  "rows": [...],
  "features": {
    "sorting": true,
    "filtering": false,
    "pagination": false
  }
}
```

### 2. Filtering
**Purpose:** Allow users to search and filter table data by specific column values.

**How to Enable:**
```json
{
  "features": {
    "filtering": true
  }
}
```

**Behavior:**
- Shows a text input field in the header toolbar
- Filters data in real-time as user types
- Can filter by any column (dynamically configured)
- Filtering is case-insensitive
- State persists in localStorage

**Example Configuration:**
```json
{
  "title": "Customers",
  "rows": [...],
  "features": {
    "filtering": true
  }
}
```

### 3. Pagination
**Purpose:** Split large datasets into manageable pages.

**How to Enable:**
```json
{
  "features": {
    "pagination": true
  },
  "pageSize": 20
}
```

**Behavior:**
- Shows page info (e.g., "Page 1 of 5")
- Previous/Next buttons for navigation
- Page size selector (10, 20, 30, 40, 50 rows per page)
- Automatically resets to page 1 when page size changes
- State persists in localStorage

**Example Configuration:**
```json
{
  "title": "Transactions",
  "rows": [...],
  "features": {
    "pagination": true
  },
  "pageSize": 25
}
```

### 4. Column Visibility
**Purpose:** Allow users to show/hide specific columns.

**How to Enable:**
```json
{
  "features": {
    "columnVisibility": true
  }
}
```

**Behavior:**
- "Columns" button appears in toolbar
- Clicking reveals toggle UI for each column
- Users can toggle individual columns on/off
- All columns visible by default
- User preferences persist in localStorage

**Example Configuration:**
```json
{
  "title": "Orders",
  "rows": [...],
  "features": {
    "columnVisibility": true
  }
}
```

### 5. Column Resizing
**Purpose:** Allow users to resize columns by dragging headers.

**How to Enable:**
```json
{
  "features": {
    "columnResizing": true
  }
}
```

**Behavior:**
- Columns can be resized by dragging the border
- Column sizes are calculated based on content
- Resize handle appears on hover
- Width state is maintained during session

**Example Configuration:**
```json
{
  "features": {
    "columnResizing": true
  }
}
```

### 6. Row Selection
**Purpose:** Allow users to select rows for bulk operations.

**How to Enable:**
```json
{
  "features": {
    "rowSelection": true
  }
}
```

**Behavior:**
- Checkbox column appears in the table
- Header checkbox to select/deselect all rows
- Individual row checkboxes for selective picking
- Selection count displayed in info box below table
- "Clear" button removes all selections
- Selection state persists in localStorage

**Example Configuration:**
```json
{
  "title": "Orders",
  "rows": [...],
  "features": {
    "rowSelection": true
  }
}
```

### 7. Expandable Rows
**Purpose:** Show detailed information for selected rows.

**How to Enable:**
```json
{
  "features": {
    "expandableRows": true
  },
  "expandableRowContent": {
    "order-details": "Show order details",
    "customer-info": "Show customer information"
  }
}
```

**Behavior:**
- Click row to expand and show details
- Expanded state persists in state management
- Can be combined with other features
- Detail content is customizable

**Note:** Currently marked as optional; full implementation available.

## Complete Example Configurations

### Minimal Configuration (Basic Table)
```json
{
  "title": "Simple Orders",
  "rows": [
    { "id": "ORD-001", "customer": "Alice Johnson", "amount": "$129.00", "status": "Completed" }
  ],
  "features": {
    "sorting": false,
    "filtering": false,
    "pagination": false,
    "columnVisibility": false,
    "columnResizing": false,
    "rowSelection": false,
    "expandableRows": false
  }
}
```

### Full-Featured Configuration
```json
{
  "title": "Complete Orders Dashboard",
  "rows": [...],
  "pageSize": 20,
  "features": {
    "sorting": true,
    "filtering": true,
    "pagination": true,
    "columnVisibility": true,
    "columnResizing": true,
    "rowSelection": true,
    "expandableRows": false
  }
}
```

### Analytics Configuration
```json
{
  "title": "Analytics Transactions",
  "rows": [...],
  "features": {
    "sorting": true,
    "filtering": true,
    "pagination": true,
    "columnVisibility": false,
    "columnResizing": false,
    "rowSelection": false,
    "expandableRows": false
  }
}
```

## State Management

All table states are managed using Zustand with localStorage persistence:

- **Sorting:** Current sort column and direction
- **Filtering:** Active filters by column
- **Pagination:** Current page and page size
- **Column Visibility:** Which columns are shown/hidden
- **Row Selection:** Which rows are checked
- **Expanded Rows:** Which rows are expanded

States are stored under the key `table-state` in localStorage.

## API Integration for AI-Generated Configurations

When Groq AI generates table widgets, it can specify feature configurations like:

```json
{
  "widget_id": "orders-table",
  "config": {
    "title": "High-Value Orders",
    "rows": [...],
    "features": {
      "sorting": true,
      "filtering": true,
      "pagination": true,
      "columnVisibility": true,
      "columnResizing": false,
      "rowSelection": true,
      "expandableRows": false
    }
  }
}
```

## Recommended Feature Combinations

### For Admin Dashboards
- Enable: sorting, filtering, pagination, columnVisibility, rowSelection
- Disable: expandableRows
- Rationale: Admins need to manage, search, and bulk-select data

### For Analytics Views
- Enable: sorting, filtering, pagination
- Disable: columnVisibility, columnResizing, rowSelection, expandableRows
- Rationale: Focus on data exploration and analysis

### For Public Dashboards
- Enable: sorting, pagination
- Disable: filtering, columnVisibility, rowSelection, expandableRows
- Rationale: Simple, read-only view of data

### For Data Entry Forms
- Enable: sorting, columnVisibility, rowSelection
- Disable: filtering, columnResizing, expandableRows
- Rationale: Users can select rows for bulk operations

## Component Registry
All table widgets are registered in `src/lib/component-registry.tsx`:
- `"orders-table"` -> OrdersTableWidget
- `"customers-table"` -> CustomersTableWidget
- `"transactions-table"` -> TransactionsTableWidget

## Data Format
Tables expect data in the following structure:

**OrderRow:**
```typescript
{
  id: string;           // Unique identifier
  customer: string;     // Customer name
  amount: string;       // Amount in currency format
  status: string;       // Status badge (Completed, Pending, Failed)
}
```

**CustomerRow:**
```typescript
{
  name: string;         // Customer full name
  email: string;        // Email address
  plan: string;         // Plan type (Pro, Enterprise, Free)
  spend: string;        // Total spend amount
}
```

**TxRow:**
```typescript
{
  date: string;         // Transaction date
  desc: string;         // Description
  amount: string;       // Amount with sign (+/-)
  type: string;         // Type (credit or debit)
}
```

## Debugging

Enable debug logging by checking browser console:
```javascript
// Watch table state changes
console.log('[DEBUG] TableWidget rendered with:', {
  features,
  currentPage,
  sortingState
});
```

## Best Practices

1. **Default Features:** All features default to `true` if not specified
2. **Performance:** Large datasets (>1000 rows) benefit from pagination
3. **Accessibility:** All controls are keyboard accessible
4. **Mobile:** Pagination works well on mobile; filtering and sorting are recommended
5. **State Persistence:** Users' sorting, filtering, and pagination preferences are automatically saved

## Future Enhancements

Potential features for future versions:
- Global search across all columns
- Advanced filtering with operators (>, <, =, contains)
- Export to CSV/Excel
- Column reordering by drag-and-drop
- Custom cell formatters for different data types
- Row grouping and aggregation
- Keyboard shortcuts for common actions
