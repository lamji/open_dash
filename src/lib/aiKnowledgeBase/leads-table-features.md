# LeadsTable Widget - Enterprise Lead Management

## Overview

The LeadsTable is an enterprise-grade widget for displaying and managing lead generation data. It features a professional design with comprehensive TanStack Table integration, avatar/profile pictures, color-coded status badges, lead score visualization, and bulk action capabilities.

## Widget ID

```
leads-table
```

## Features

### Core Features
- **Row Selection**: Multi-select leads with checkbox column for bulk operations
- **Sorting**: Click column headers to sort by any field (name, email, phone, status, score, last contact)
- **Filtering**: Search leads by name or other fields in real-time
- **Pagination**: Navigate through large datasets with configurable page sizes (10, 20, 30, 40, 50 rows)
- **Column Visibility**: Toggle columns visibility to customize the view
- **Column Resizing**: Resize columns for better visibility of data
- **Expandable Rows**: Click expand button to view full lead profile, notes, and conversation history
- **Bulk Actions**: Send emails, change status, or add tags to selected leads
- **Responsive Design**: Professional styling with Tailwind CSS and shadcn/ui components

### Visual Enhancements
- **Avatar Images**: Circular avatars with fallback initials (first letter of first and last name)
- **Color-Coded Status Badges**: Status indicators with distinct colors:
  - Hot: Red (urgent)
  - Warm: Orange (interested)
  - Qualified: Blue (qualified prospect)
  - Cold: Gray (needs nurturing)
  - Lost: Dark gray (lost opportunity)
  - Converted: Green (converted to customer)
- **Lead Score Visualization**: Star rating (0-5 stars) based on lead score (0-100)
- **Company Name Display**: Shows company/organization beneath lead name

## Data Structure

Each lead requires the following structure:

```typescript
interface Lead {
  id: string;                        // Unique lead identifier
  name: string;                      // Lead's full name
  email: string;                     // Email address
  phone?: string;                    // Phone number (optional)
  company?: string;                  // Company/organization (optional)
  avatar?: string;                   // Avatar image URL (optional)
  status: LeadStatus;                // "Hot" | "Warm" | "Cold" | "Qualified" | "Lost" | "Converted"
  score: number;                     // Lead score 0-100
  tags?: string[];                   // Array of tags/categories
  lastContact?: string;              // Last contact time (e.g., "2 hours ago")
  conversationHistory?: string[];    // Array of conversation notes
  notes?: string;                    // Internal notes about the lead
  createdAt?: string;                // Creation timestamp
}
```

## Configuration Example

### Basic Configuration

```json
{
  "title": "Sales Leads",
  "rows": [
    {
      "id": "L001",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@acme.com",
      "phone": "(555) 123-4567",
      "company": "Acme Corp",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      "status": "Hot",
      "score": 95,
      "tags": ["Enterprise", "Urgent"],
      "lastContact": "2 hours ago",
      "conversationHistory": ["Initial pitch sent", "Call scheduled"],
      "notes": "Very interested in Q1 implementation"
    },
    {
      "id": "L002",
      "name": "Marcus Chen",
      "email": "m.chen@techstartup.io",
      "phone": "(555) 234-5678",
      "company": "Tech Startup Inc",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      "status": "Warm",
      "score": 78,
      "tags": ["Mid-Market", "Tech"],
      "lastContact": "3 days ago",
      "conversationHistory": ["Demo completed", "Awaiting approval"],
      "notes": "Budget approval pending"
    }
  ],
  "features": {
    "sorting": true,
    "filtering": true,
    "pagination": true,
    "columnVisibility": true,
    "columnResizing": true,
    "rowSelection": true,
    "expandableRows": true
  },
  "pageSize": 10
}
```

### Advanced Configuration (with bulk actions)

```json
{
  "title": "Enterprise Leads Pipeline",
  "rows": [/* lead objects */],
  "features": {
    "sorting": true,
    "filtering": true,
    "pagination": true,
    "columnVisibility": true,
    "columnResizing": true,
    "rowSelection": true,
    "expandableRows": true,
    "bulkActions": true
  },
  "pageSize": 20,
  "bulkActionsList": [
    {
      "id": "send-email",
      "label": "Send Email",
      "icon": "Mail",
      "variant": "default"
    },
    {
      "id": "change-status",
      "label": "Change Status",
      "icon": "Edit",
      "variant": "default"
    },
    {
      "id": "add-tags",
      "label": "Add Tags",
      "icon": "Tag",
      "variant": "default"
    }
  ]
}
```

## Columns

The LeadsTable displays the following columns (all sortable):

1. **Select** (checkbox): Select leads for bulk operations
2. **Expand** (chevron): Expand row to see full details
3. **Name**: Lead name with company affiliation and avatar
4. **Email**: Email address
5. **Phone**: Phone number
6. **Status**: Lead status with color-coded badge
7. **Score**: Lead score visualization with 5-star rating
8. **Last Contact**: Time since last interaction
9. **Actions**: Quick action buttons (Contact, Email)

## Expanded Row Content

When a row is expanded, the following information is displayed:

### Contact Information Section
- Email address
- Phone number
- Company name

### Status & Score Section
- Current lead status
- Lead score (0-100)
- Associated tags/categories

### Notes Section
- Internal notes about the lead

### Conversation History Section
- List of past interactions and notes
- Shows chronological conversation timeline

## Bulk Actions

When one or more leads are selected, the following bulk actions become available:

- **Send Email**: Send an email to all selected leads
- **Change Status**: Update status for all selected leads (Hot, Warm, Qualified, Cold, Lost, Converted)
- **Add Tags**: Add tags/categories to all selected leads

## Styling & Customization

### Color Scheme
- **Background**: Slate/gray tones for professional appearance
- **Accent Colors**: Status-specific colors (red, orange, blue, green)
- **Text**: High contrast for readability
- **Hover States**: Subtle background color change on row hover

### Responsive Behavior
- Table adapts to container width
- Expandable rows stack on smaller screens
- Action buttons remain accessible on all device sizes

## AI Prompts

### Generate a Leads Table

"Add a leads table widget to display our sales pipeline. Include 5 sample leads with different statuses (Hot, Warm, Qualified, Cold, Lost). Show their names, emails, companies, lead scores, and last contact times. Enable sorting, filtering, pagination, and expandable rows so we can see full details and conversation history."

### Track Lead Scoring

"Create a leads table that shows our current leads sorted by lead score. Include status badges with different colors for Hot (red), Warm (orange), Qualified (blue), and Cold (gray) leads. Display star ratings based on their scores out of 100."

### Sales Pipeline Management

"Show a leads table with bulk action capabilities. I want to select multiple leads and send emails, change their status, or add tags to them. Include company names, last contact dates, and tags for each lead."

### Lead Details View

"Create a leads table with expandable rows. When expanded, show the lead's full contact information, notes, conversation history, and tags. Include avatars for each lead with their initials as fallback."

## Technical Details

- **Component Location**: `src/presentation/widgets/index.tsx`
- **Type Definition**: `src/domain/widgets/types.ts`
- **State Management**: Uses `useTableState()` hook from `./useTableState`
- **Table Library**: TanStack React Table (v8+)
- **UI Components**: shadcn/ui (Avatar, Badge, Button, Input)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS 4

## Common Use Cases

1. **Sales Team Dashboard**: Track active leads with color-coded priorities
2. **Lead Scoring Analysis**: Sort and filter by lead score to identify top prospects
3. **Pipeline Management**: Bulk update statuses and tags for multiple leads
4. **Lead Nurturing**: View conversation history and notes for follow-up actions
5. **CRM Integration**: Display leads from external CRM systems with real-time data
6. **Territory Management**: Filter and sort leads by company, region, or sales rep
7. **Lead Assignment**: Select and bulk-assign leads to sales team members

## Debug Logging

The widget includes debug logging that outputs:
- Number of rows rendered
- Feature configuration status
- Number of selected rows
- Bulk action triggered with selected row count

Check browser console (F12) for detailed debugging information during development.
