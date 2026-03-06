# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: MCP Workflow Requirement

**ANY task classified as BUG, FEATURE, ENHANCEMENT, or UPDATE must use MCP as the brain workflow.**

- Call `mcp__brain__mcp_workflow_entry` to initialize the MCP workflow
- Follow the structured workflow steps (planning, verification, execution, testing)
- Maintain an audit trail through the MCP system
- **This applies in ALL sessions** - check the task type immediately when starting
- The MCP contains critical rules that override other guidance - always follow MCP rules

Without MCP initialization for these task types, you will miss critical rules and context that govern how to properly implement changes in this codebase.

## ⚠️ MANDATORY: MVVM Audit Before & After Edits

**Before starting ANY code changes and after completing ALL code changes, call the MVVM audit tool:**

```
mcp__brain__mvvm_audit({ projectRoot: "/home/akrizu/agent-v3/projects/open-dash" })
```

This tool:
- Scans ALL .ts/.tsx files for MVVM violations
- Detects cross-feature/cross-component imports (components must NOT know about each other)
- Checks: no fetch in presentation UI, no inline types, page.tsx routing-only, domain is pure types
- Returns a score and list of violations

**If violations are found AFTER your edits, you MUST fix them before completing the task.**

### MVVM Rules (Non-Negotiable)
- **UI files** (`src/presentation/*/index.tsx`): NO business logic, NO API calls, NO inline types
- **Logic hooks** (`src/presentation/*/use*.ts`): All state/effects/API calls go here. NO inline types.
- **Domain types** (`src/domain/*/types.ts`): Pure types/interfaces only. NO React imports.
- **Route files** (`src/app/**/page.tsx`): ROUTING ONLY — import and render presentation component.
- **Component isolation**: `src/presentation/featureA/` CANNOT import from `src/presentation/featureB/`. Use `src/components/shared/`, `src/lib/`, or `src/domain/` for shared code.

## Project Overview

**OpenDash** is an AI-powered admin dashboard platform that lets users build admin dashboards using natural language. It's a multi-tenant SaaS application built with Next.js, React, and TypeScript, featuring a visual builder UI and AI-assisted dashboard generation via Groq LLM.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build + start
npm run build
npm start

# Linting (ESLint with Next.js + TypeScript config)
npm run lint

# Database migrations
npx prisma migrate dev --name <migration_name>

# Generate/regenerate Prisma client
npx prisma generate

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

## Architecture Overview

### Technology Stack
- **Frontend:** Next.js 16.1.6, React 19.2.3, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui components, Framer Motion, Lucide icons
- **Database:** PostgreSQL (Neon serverless), Prisma ORM
- **State Management:** Zustand
- **AI:** Groq SDK for LLM integration
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Testing:** Playwright

### Project Structure

```
src/
├── app/                          # Next.js app directory (API routes + pages)
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── projects/             # Project CRUD
│   │   ├── builder/              # Builder-specific endpoints
│   │   ├── widgets/              # Widget templates
│   │   ├── ai/                   # AI endpoints (chat, widget generation)
│   │   ├── admin/                # Admin operations
│   │   └── logs/                 # System logs
│   ├── admin/                    # Admin dashboard page
│   ├── builder/                  # Visual builder page
│   ├── dashboard/                # Main dashboard view
│   ├── preview/                  # Project preview (published)
│   └── auth/                     # Auth pages (login, signup, etc.)
│
├── presentation/                 # Feature-specific React components (all use "use client")
│   ├── builder/                  # Builder UI + useBuilder hook
│   ├── dashboard/                # Dashboard UI + useDashboard hook
│   ├── widgets/                  # Widget previews + widget library
│   ├── admin/                    # Admin panel + useAdmin hook
│   ├── login/                    # Login component
│   └── ...                       # Other feature components
│
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui primitive components
│   ├── widgets/                  # Widget-specific components (e.g., widget-picker-card.tsx)
│   └── shared/                   # Shared utilities (DevTooltip, CodeBlock, etc.)
│
├── domain/                       # Domain-specific types and logic
│   ├── builder/                  # Builder types (LayoutBlock, PlacedWidget, etc.)
│   ├── widgets/                  # Widget domain types
│   ├── admin/                    # Admin types
│   └── ...                       # Other domain types
│
├── lib/                          # Utilities and helpers
│   ├── component-registry.tsx    # Maps widget IDs to React components (critical for builder)
│   ├── aiKnowledgeBase/          # AI training data for Groq (markdown files)
│   └── api/                      # API client utilities
│
└── generated/                    # Auto-generated files (don't edit)
    └── prisma/                   # Prisma client (auto-generated)
```

### Core Architectural Concepts

#### 1. Multi-Tenant Project Structure
- Each user can create multiple projects
- Projects are identified by unique slug (user-specific URL routing)
- All database models are project-scoped with `projectId` foreign key
- Cascading deletes ensure project deletion removes all related data

#### 2. Dashboard Builder Architecture
```
Project
└── SidebarItem (navigation items, hierarchical)
    └── Page (content container)
        └── PageComponent (individual UI elements, hierarchical)
            └── config (JSON string with component configuration)
```

#### 3. Layout Block System (Advanced Builder)
Alternative layout structure for grid-based dashboards:
```
LayoutBlock (grid-1, grid-2, grid-3, grid-4)
├── slots[] (individual columns/cells in grid)
│   └── PlacedWidget (widget + widgetData)
├── blockStyles (CSS for grid container)
└── columnStyles[] (CSS for each column/slot)
```

#### 4. Component Registry
`src/lib/component-registry.tsx` maps widget IDs to React components. All widgets available in the builder must be registered here. Example:
```tsx
export const componentRegistry = {
  'chart-line': LineChartBlock,
  'chart-bar': BarChartBlock,
  'status-card': StatusCard,
  // ... etc
};
```

#### 5. Widget System
- Widgets defined in `src/presentation/widgets/index.tsx`
- Each widget has a slug (ID), template definition, and preview function
- Preview functions in `WIDGET_PREVIEWS` object enable live preview in widget picker
- Widget data stored as JSON in database, parsed at runtime
- Widget previews use left-aligned containers (not centered)

#### 6. State Management Pattern
Each major feature has a custom hook managing state:
- `useBuilder` - Builder state, widget placement, CSS editor
- `useDashboard` - Dashboard data, layout rendering
- `useAdmin` - Admin panel operations
- Base Zustand stores for global state

**Important:** Presentation components must use `"use client"` for interactivity.

#### 7. Configuration Storage
Component configuration stored as JSON strings in database:
- `PageComponent.config` - Component config
- `AppConfig.value` - Global app settings
- `LayoutBlock.blockStyles` - Block-level CSS (string)
- `LayoutBlock.columnStyles` - Per-slot CSS (string array)

Parse with `JSON.parse()` at runtime, stringify before saving to DB.

### Critical Files & Patterns

#### Builder State Management (`src/presentation/builder/useBuilder.ts`)
- `openCssEditor(blockId, slotIdx?)` - Opens CSS editor for block or column
  - When `slotIdx` is undefined → edit block container
  - When `slotIdx >= 0` → edit specific column
  - Handles distinguishing block-level CSS from column-level CSS
- `placeWidget()` - Places widget in a slot, saves to layout
- `saveCssStyles()` - Saves CSS to blockStyles or columnStyles

#### Widget Picker Component (`src/components/widgets/widget-picker-card.tsx`)
- Shadcn Card-based fullscreen modal for widget selection
- Responsive grid: `grid-cols-[repeat(auto-fill,minmax(200px,1fr))]` (200px per card base width)
- Preview content left-aligned with `flex items-start justify-start`
- Filters available templates to show only those with preview functions
- Modal is fullscreen: `h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)]`

#### AI-Powered Widget Generation (`src/app/api/builder/ai-widget/route.ts`)
- Groq SDK integration for AI widget suggestions
- Uses markdown knowledge base (`src/lib/aiKnowledgeBase/`) for AI training
- Returns widget template matching `WidgetTemplate` interface
- Chart widgets must use Recharts data format: `{xKey, lines/bars, data}`
- Widget IDs in AI responses must match `componentRegistry` entries

#### Environment Setup
Required `.env` variables:
```
DATABASE_URL=<postgresql connection string>
GROQ_API_KEY=<groq api key from https://console.groq.com>
```

Database uses Neon serverless PostgreSQL. Prisma schema in `prisma/schema.prisma`.

## Code Standards & Patterns

### Component Guidelines
- **Client Components:** Use `"use client"` for interactive components in `src/presentation/`
- **Server Components:** API routes and data-fetching utilities remain server-side
- **shadcn Components:** Extend with variants, use `clsx` + `cn()` for conditional classes
- **Type Safety:** Always import types from `src/domain/` not inline

### CSS & Styling
- Tailwind CSS 4 utility-first approach
- Use responsive classes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Avoid inline styles except for computed values from DB (e.g., user CSS)
- Card components use shadcn Card with proper header/content/footer structure
- Grid layouts prefer Tailwind grid utilities over flexbox for 2D layouts

### Form Handling
- React Hook Form + Zod for validation
- Zod schemas defined at component level or in `domain/`
- Error messages displayed via Sonner (toast) or inline validation

### State Management
- Zustand for simple global state
- Custom hooks for feature-specific state management
- Avoid prop drilling; use context + Zustand when deeply nested

### Database Patterns
- Prisma migrations for schema changes
- Always include `onDelete: Cascade` for foreign keys
- Use `@unique` constraints for slug fields (with projectId for tenant isolation)
- JSON config stored as strings; parse at runtime

### Data Flow: Builder Example
1. User clicks "Add Widget" → Opens `WidgetVariantPicker` modal
2. Modal displays `WidgetPickerCard` with filtered templates
3. User selects widget → `placeWidget(blockId, slotIdx, template)` called
4. Widget placed in layout and saved to database
5. Builder re-renders with new widget in block
6. User can click edit button on widget → `openCssEditor()` opens CSS editor modal
7. User edits CSS → `saveCssStyles()` saves to DB
8. CSS applied via `cssStringToStyle()` helper to DOM

## Debugging & Logging

- Check `.logs/` folder for structured logs (created by logging utilities)
- Browser DevTools: Inspect widget component registry via `componentRegistry` console export
- Prisma Studio: `npx prisma studio` to visually inspect/modify database
- API responses logged via `logEntry()` utility in API routes

## Known Constraints & Gotchas

1. **Chart Data Format:** Recharts requires `{data, xKey, lines/bars}` format, not `{points, labels}`
2. **Widget Previews:** Must be registered in `WIDGET_PREVIEWS` object to appear in picker
3. **Component Registration:** All widgets must be in `componentRegistry` before use in builder
4. **CSS Application:** Block-level CSS goes to `blockStyles`, column CSS goes to `columnStyles[index]`
5. **Modal Sizing:** Fullscreen modal uses viewport calc: `h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)]`
6. **Left-Aligned Content:** Widget preview content uses `flex items-start justify-start` (not centered)
7. **JSON Config:** Always stringify before DB save, parse after DB read
8. **Session-Based Auth:** Uses token in Session model; session expires via `expiresAt`

## Testing

Playwright tests available via `npm run test` (if configured). Test files should focus on critical user flows:
- Widget selection and placement
- Dashboard publishing
- User authentication
- Builder CSS application

## Common Tasks

### Adding a New Widget
1. Create component in `src/components/widgets/` or use existing pattern
2. Add widget template to `WIDGET_TEMPLATES` in `src/presentation/widgets/index.tsx`
3. Add entry to `componentRegistry` in `src/lib/component-registry.tsx`
4. Add preview function to `WIDGET_PREVIEWS` in `src/presentation/widgets/index.tsx`
5. Update AI knowledge base if AI-generated widgets should support it

### Modifying Builder Layout
1. Update `LayoutBlock` type in `src/domain/builder/types.ts` if needed
2. Modify `useBuilder` hook logic in `src/presentation/builder/useBuilder.ts`
3. Update builder UI in `src/presentation/builder/index.tsx`
4. Test CSS editor opens correct context (block vs column)

### Adding API Endpoint
1. Create route in `src/app/api/[feature]/[...route].ts`
2. Add Prisma query in handler
3. Return typed JSON response
4. Log important events via `logEntry()` utility

### Styling Components
1. Use Tailwind utilities in `className` (not inline styles)
2. For computed colors/sizes from DB, use `cssStringToStyle()` helper
3. Extend shadcn components with CVA (class-variance-authority) for variants
4. Responsive design: mobile-first, add larger breakpoints as needed
