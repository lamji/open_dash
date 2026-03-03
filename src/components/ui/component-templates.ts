// ─── Component Template Registry ────────────────────────────
// Machine-readable index of all shadcn component templates.
// Groq AI reads this registry to discover available components
// and their usage patterns when composing views dynamically.

export interface TemplateVariant {
  name: string;
  file: string;
  description: string;
}

export interface TemplateRule {
  key: string;
  description: string;
}

export interface ComponentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  shadcnDeps: string[];
  npmDeps: string[];
  importPath: string;
  variants: TemplateVariant[];
  rules: TemplateRule[];
  tags: string[];
}

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // ─── Accordion ──────────────────────────────────────────
  {
    id: "accordion-basic",
    name: "Basic Accordion",
    category: "accordion",
    description: "Single-item collapsible accordion for FAQs or information disclosure.",
    shadcnDeps: ["accordion"],
    npmDeps: [],
    importPath: "@/components/ui/accordion",
    variants: [
      { name: "single-collapsible", file: "accordion-01.tsx", description: "Basic FAQ accordion with single collapsible behavior" },
    ],
    rules: [
      { key: "type", description: "Use type='single' with collapsible for better UX" },
      { key: "defaultValue", description: "Provide defaultValue to show first item by default" },
      { key: "styling", description: "Use text-muted-foreground for content visual hierarchy" },
    ],
    tags: ["faq", "disclosure", "collapsible", "expandable"],
  },
  {
    id: "accordion-avatar",
    name: "Accordion with Avatar",
    category: "accordion",
    description: "Accordion where each trigger includes an Avatar, user name, and subtext. Ideal for team directories, user profiles, or contact lists.",
    shadcnDeps: ["accordion", "avatar"],
    npmDeps: [],
    importPath: "@/components/ui/accordion",
    variants: [
      { name: "avatar-trigger", file: "accordion-07.tsx", description: "Accordion items with avatar, name and email in trigger" },
    ],
    rules: [
      { key: "avatar-sizing", description: "Use Avatar with size-10.5 and rounded-sm for modern look" },
      { key: "text-hierarchy", description: "Nest flex column for name and subtext next to avatar" },
      { key: "initials", description: "Always provide AvatarFallback using split+reduce for dynamic initials" },
      { key: "trigger-style", description: "Use hover:no-underline on AccordionTrigger for complex text structures" },
    ],
    tags: ["team", "directory", "profile", "contact", "user-list"],
  },
  {
    id: "accordion-expand-icon",
    name: "Accordion with Expand Icon",
    category: "accordion",
    description: "Accordion variant with custom expand/collapse icons.",
    shadcnDeps: ["accordion"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/accordion",
    variants: [
      { name: "custom-icon", file: "accordion-expand-icon.tsx", description: "Custom Plus/Minus icons for expand/collapse" },
    ],
    rules: [
      { key: "icon-swap", description: "Use data-state attribute to toggle between Plus and Minus icons" },
    ],
    tags: ["expandable", "icon", "custom-trigger"],
  },
  {
    id: "accordion-split",
    name: "Split Accordion",
    category: "accordion",
    description: "Accordion split into separate visual blocks instead of a single list.",
    shadcnDeps: ["accordion"],
    npmDeps: [],
    importPath: "@/components/ui/accordion",
    variants: [
      { name: "split-blocks", file: "accordion-split.tsx", description: "Each accordion item is a separate bordered block" },
    ],
    rules: [
      { key: "layout", description: "Wrap each AccordionItem in its own container with border and rounded corners" },
    ],
    tags: ["split", "blocks", "separated", "cards"],
  },
  {
    id: "accordion-with-icon",
    name: "Accordion with Icon",
    category: "accordion",
    description: "Accordion items with leading icons in the trigger.",
    shadcnDeps: ["accordion"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/accordion",
    variants: [
      { name: "icon-trigger", file: "accordion-with-icon.tsx", description: "Each trigger has a leading icon from lucide-react" },
    ],
    rules: [
      { key: "icon-placement", description: "Place icon before text in trigger using flex layout" },
    ],
    tags: ["icon", "navigation", "settings"],
  },

  // ─── Alert Dialog ───────────────────────────────────────
  {
    id: "alert-dialog",
    name: "Alert Dialog",
    category: "alert-dialog",
    description: "Standard alert dialog with cancel and action buttons for destructive confirmations.",
    shadcnDeps: ["alert-dialog", "button"],
    npmDeps: [],
    importPath: "@/components/ui/alert-dialog",
    variants: [
      { name: "basic", file: "alert-dialog-01.tsx", description: "Standard confirmation dialog with cancel/continue" },
    ],
    rules: [
      { key: "trigger", description: "Use AlertDialogTrigger with asChild for custom trigger elements" },
      { key: "actions", description: "Always provide both AlertDialogCancel and AlertDialogAction" },
    ],
    tags: ["confirm", "destructive", "modal", "warning"],
  },
  {
    id: "alert-dialog-with-icon",
    name: "Alert Dialog with Icon",
    category: "alert-dialog",
    description: "Alert dialog with a leading icon for visual emphasis.",
    shadcnDeps: ["alert-dialog", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/alert-dialog",
    variants: [
      { name: "icon-header", file: "alert-dialog-with-icon.tsx", description: "Alert dialog with warning/info icon in header" },
    ],
    rules: [
      { key: "icon", description: "Use AlertTriangle or similar icon for destructive actions" },
    ],
    tags: ["confirm", "icon", "warning", "destructive"],
  },

  // ─── Breadcrumb ─────────────────────────────────────────
  {
    id: "breadcrumb-basic",
    name: "Basic Breadcrumb",
    category: "breadcrumb",
    description: "Standard breadcrumb navigation with separator between items.",
    shadcnDeps: ["breadcrumb"],
    npmDeps: [],
    importPath: "@/components/ui/breadcrumb",
    variants: [
      { name: "basic", file: "breadcrumb-01.tsx", description: "Simple breadcrumb with links and current page" },
    ],
    rules: [
      { key: "current-page", description: "Use BreadcrumbPage for the current (non-clickable) item" },
      { key: "separator", description: "BreadcrumbSeparator auto-renders between items" },
    ],
    tags: ["navigation", "breadcrumb", "path", "hierarchy"],
  },

  // ─── Date Picker ────────────────────────────────────────
  {
    id: "date-picker-basic",
    name: "Basic Date Picker",
    category: "date-picker",
    description: "Date picker using Calendar inside a Popover, triggered by a Button.",
    shadcnDeps: ["button", "calendar", "popover"],
    npmDeps: ["date-fns"],
    importPath: "@/components/ui/calendar",
    variants: [
      { name: "single-date", file: "date-picker-basic.tsx", description: "Single date selection with formatted display" },
    ],
    rules: [
      { key: "format", description: "Use date-fns format() for consistent date display" },
      { key: "popover", description: "Wrap Calendar in Popover for on-demand visibility" },
    ],
    tags: ["date", "picker", "calendar", "form"],
  },
  {
    id: "date-picker-range",
    name: "Date Range Picker",
    category: "date-picker",
    description: "Date range picker for selecting start and end dates.",
    shadcnDeps: ["button", "calendar", "popover"],
    npmDeps: ["date-fns"],
    importPath: "@/components/ui/calendar",
    variants: [
      { name: "range", file: "date-picker-range.tsx", description: "Two-month calendar for range selection" },
    ],
    rules: [
      { key: "mode", description: "Use mode='range' on Calendar for range selection" },
      { key: "display", description: "Show 'from - to' format in trigger button" },
    ],
    tags: ["date", "range", "period", "analytics", "filter"],
  },
  {
    id: "date-picker-with-chart",
    name: "Date Picker with Chart",
    category: "date-picker",
    description: "Date range picker integrated with a chart for data visualization filtering.",
    shadcnDeps: ["button", "calendar", "popover"],
    npmDeps: ["date-fns", "recharts"],
    importPath: "@/components/ui/calendar",
    variants: [
      { name: "chart-filter", file: "date-picker-with-chart.tsx", description: "Date range picker that filters chart data" },
    ],
    rules: [
      { key: "integration", description: "Connect date selection state to chart data filtering" },
    ],
    tags: ["date", "chart", "analytics", "dashboard", "filter"],
  },
  {
    id: "date-picker-with-icon",
    name: "Date Picker with Icon",
    category: "date-picker",
    description: "Date picker with a calendar icon in the trigger button.",
    shadcnDeps: ["button", "calendar", "popover"],
    npmDeps: ["date-fns", "lucide-react"],
    importPath: "@/components/ui/calendar",
    variants: [
      { name: "icon-trigger", file: "date-picker-with-icon.tsx", description: "Calendar icon in the date picker trigger" },
    ],
    rules: [
      { key: "icon", description: "Use CalendarIcon from lucide-react in the trigger button" },
    ],
    tags: ["date", "picker", "icon", "form"],
  },

  // ─── Dialog ─────────────────────────────────────────────
  {
    id: "dialog-full-screen",
    name: "Full Screen Dialog",
    category: "dialog",
    description: "Dialog that expands to fill the entire screen.",
    shadcnDeps: ["dialog", "button"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "fullscreen", file: "dialog-full-screen.tsx", description: "Full viewport dialog overlay" },
    ],
    rules: [
      { key: "sizing", description: "Use max-w-full h-full classes on DialogContent for fullscreen" },
    ],
    tags: ["modal", "fullscreen", "overlay"],
  },
  {
    id: "dialog-otp-verification",
    name: "OTP Verification Dialog",
    category: "dialog",
    description: "Dialog for OTP/verification code input.",
    shadcnDeps: ["dialog", "button", "input"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "otp", file: "dialog-otp-verification.tsx", description: "OTP input with auto-focus and digit cells" },
    ],
    rules: [
      { key: "focus", description: "Auto-focus first input, auto-advance to next on digit entry" },
    ],
    tags: ["auth", "otp", "verification", "security", "modal"],
  },
  {
    id: "dialog-rating",
    name: "Rating Dialog",
    category: "dialog",
    description: "Dialog with star rating selection.",
    shadcnDeps: ["dialog", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "stars", file: "dialog-rating.tsx", description: "Star rating with hover preview" },
    ],
    rules: [
      { key: "hover", description: "Show hover preview state for stars before clicking" },
    ],
    tags: ["rating", "stars", "feedback", "review", "modal"],
  },
  {
    id: "dialog-sign-in",
    name: "Sign In Dialog",
    category: "dialog",
    description: "Pre-built sign-in form inside a dialog.",
    shadcnDeps: ["dialog", "button", "input", "label"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "sign-in", file: "dialog-sign-in.tsx", description: "Email/password sign-in form in dialog" },
    ],
    rules: [
      { key: "form", description: "Include email, password fields with labels and submit button" },
    ],
    tags: ["auth", "login", "sign-in", "form", "modal"],
  },
  {
    id: "dialog-sign-up",
    name: "Sign Up Dialog",
    category: "dialog",
    description: "Pre-built sign-up form inside a dialog.",
    shadcnDeps: ["dialog", "button", "input", "label"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "sign-up", file: "dialog-sign-up.tsx", description: "Registration form in dialog" },
    ],
    rules: [
      { key: "form", description: "Include name, email, password fields with validation" },
    ],
    tags: ["auth", "register", "sign-up", "form", "modal"],
  },
  {
    id: "dialog-sticky-footer",
    name: "Dialog with Sticky Footer",
    category: "dialog",
    description: "Dialog with a sticky footer for action buttons that stays visible while content scrolls.",
    shadcnDeps: ["dialog", "button"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "sticky-footer", file: "dialog-sticky-footer.tsx", description: "Scrollable content with fixed action bar at bottom" },
    ],
    rules: [
      { key: "layout", description: "Use overflow-y-auto on content area, sticky bottom-0 on footer" },
    ],
    tags: ["modal", "form", "sticky", "actions"],
  },
  {
    id: "dialog-sticky-header",
    name: "Dialog with Sticky Header",
    category: "dialog",
    description: "Dialog with a sticky header that stays visible while content scrolls.",
    shadcnDeps: ["dialog", "button"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "sticky-header", file: "dialog-sticky-header.tsx", description: "Fixed title bar with scrollable content below" },
    ],
    rules: [
      { key: "layout", description: "Use sticky top-0 on header, overflow-y-auto on content" },
    ],
    tags: ["modal", "form", "sticky", "header"],
  },
  {
    id: "dialog-subscribe",
    name: "Subscribe Dialog",
    category: "dialog",
    description: "Newsletter or subscription dialog with email input.",
    shadcnDeps: ["dialog", "button", "input"],
    npmDeps: [],
    importPath: "@/components/ui/dialog",
    variants: [
      { name: "subscribe", file: "dialog-subscribe.tsx", description: "Email subscription form dialog" },
    ],
    rules: [
      { key: "cta", description: "Use clear CTA with email input and subscribe button" },
    ],
    tags: ["subscribe", "newsletter", "email", "modal", "marketing"],
  },

  // ─── Dropdown Menu ──────────────────────────────────────
  {
    id: "dropdown-menu-basic",
    name: "Basic Dropdown Menu",
    category: "dropdown-menu",
    description: "Standard menu with labels, item grouping, separators, and nested submenus.",
    shadcnDeps: ["dropdown-menu", "button"],
    npmDeps: [],
    importPath: "@/components/ui/dropdown-menu",
    variants: [
      { name: "basic", file: "dropdown-menu-01.tsx", description: "Standard grouped menu with sub-menus" },
    ],
    rules: [
      { key: "trigger", description: "Use asChild on DropdownMenuTrigger with Button to avoid nested button issues" },
      { key: "organization", description: "Use DropdownMenuLabel for section titles and DropdownMenuSeparator for grouping" },
      { key: "submenus", description: "Nest DropdownMenuSub with Portal for multi-level navigation" },
      { key: "states", description: "Use disabled prop on DropdownMenuItem for unavailable actions" },
      { key: "sizing", description: "Use fixed width (w-56) on DropdownMenuContent for consistent alignment" },
    ],
    tags: ["menu", "actions", "navigation", "context-menu"],
  },
  {
    id: "dropdown-menu-chat-list",
    name: "Chat List Dropdown",
    category: "dropdown-menu",
    description: "Dropdown menu styled as a chat/message list.",
    shadcnDeps: ["dropdown-menu", "button", "avatar"],
    npmDeps: [],
    importPath: "@/components/ui/dropdown-menu",
    variants: [
      { name: "chat-list", file: "dropdown-menu-chat-list.tsx", description: "Message/chat list inside dropdown" },
    ],
    rules: [
      { key: "avatar", description: "Include avatar for each message sender" },
    ],
    tags: ["chat", "messages", "notification", "list"],
  },
  {
    id: "dropdown-menu-checkbox",
    name: "Dropdown Menu with Checkboxes",
    category: "dropdown-menu",
    description: "Dropdown with checkbox items for toggling settings or appearance options.",
    shadcnDeps: ["dropdown-menu", "button"],
    npmDeps: [],
    importPath: "@/components/ui/dropdown-menu",
    variants: [
      { name: "checkbox", file: "dropdown-menu-13.tsx", description: "Checkbox items for multi-select options" },
    ],
    rules: [
      { key: "state", description: "Use useState to track checkbox state for each item" },
      { key: "disabled", description: "Use disabled prop on DropdownMenuCheckboxItem for unavailable options" },
      { key: "trigger", description: "Use asChild on DropdownMenuTrigger with Button" },
    ],
    tags: ["filter", "settings", "checkbox", "multi-select", "toggle"],
  },
  {
    id: "dropdown-menu-user-switcher",
    name: "User Switcher Dropdown",
    category: "dropdown-menu",
    description: "Dropdown menu for switching between user accounts.",
    shadcnDeps: ["dropdown-menu", "button", "avatar"],
    npmDeps: [],
    importPath: "@/components/ui/dropdown-menu",
    variants: [
      { name: "user-switcher", file: "dropdown-menu-user-switcher.tsx", description: "Account switcher with avatars" },
    ],
    rules: [
      { key: "indicator", description: "Show active user with check or highlight indicator" },
    ],
    tags: ["user", "account", "switcher", "profile"],
  },
  {
    id: "dropdown-menu-user",
    name: "User Menu Dropdown",
    category: "dropdown-menu",
    description: "Standard user profile dropdown with avatar, name, and menu items.",
    shadcnDeps: ["dropdown-menu", "button", "avatar"],
    npmDeps: [],
    importPath: "@/components/ui/dropdown-menu",
    variants: [
      { name: "user-menu", file: "dropdown-menu-user.tsx", description: "Profile dropdown with settings, billing, logout" },
    ],
    rules: [
      { key: "header", description: "Show user name and email at the top of the dropdown" },
      { key: "groups", description: "Group related items with separators" },
    ],
    tags: ["user", "profile", "settings", "logout", "account"],
  },

  // ─── Hero Sections ──────────────────────────────────────
  {
    id: "hero-section-35",
    name: "Hero Section 35",
    category: "hero",
    description: "Marketing hero section with headline, description and CTA buttons.",
    shadcnDeps: ["button"],
    npmDeps: [],
    importPath: "@/components/ui/button",
    variants: [
      { name: "hero-35", file: "hero-section-35.tsx", description: "Centered hero with gradient background" },
    ],
    rules: [
      { key: "layout", description: "Use centered text layout with max-width constraint" },
    ],
    tags: ["hero", "landing", "marketing", "cta"],
  },
  {
    id: "hero-section-41",
    name: "Hero Section 41",
    category: "hero",
    description: "Hero section variant with image and split layout.",
    shadcnDeps: ["button"],
    npmDeps: [],
    importPath: "@/components/ui/button",
    variants: [
      { name: "hero-41", file: "hero-section-41.tsx", description: "Split layout with text left, image right" },
    ],
    rules: [
      { key: "layout", description: "Use grid or flex for split layout responsive design" },
    ],
    tags: ["hero", "landing", "marketing", "split-layout", "image"],
  },

  // ─── Input ──────────────────────────────────────────────
  {
    id: "input-basic-variants",
    name: "Basic Input Variants",
    category: "input",
    description: "Collection of basic Input patterns: with label, required, disabled, and size variations.",
    shadcnDeps: ["input", "label"],
    npmDeps: [],
    importPath: "@/components/ui/input",
    variants: [
      { name: "basic", file: "input-01.tsx", description: "Plain input with placeholder" },
      { name: "with-label", file: "input-02.tsx", description: "Input with accessible Label" },
      { name: "required", file: "input-03.tsx", description: "Required input with asterisk" },
      { name: "disabled", file: "input-04.tsx", description: "Disabled input state" },
      { name: "sizes", file: "input-06.tsx", description: "Small, medium, large size variants" },
    ],
    rules: [
      { key: "accessibility", description: "Always use useId for linking Label htmlFor and Input id" },
      { key: "required-visual", description: "Use text-destructive for the required asterisk" },
      { key: "consistency", description: "Use max-w-xs to prevent excessive stretching" },
      { key: "sizing", description: "Use Tailwind h-8/h-10 for size variations" },
      { key: "state", description: "Rely on disabled prop for both visual and functional disabling" },
    ],
    tags: ["input", "form", "text", "field", "basic"],
  },
  {
    id: "input-advanced-variants",
    name: "Advanced Input Variants",
    category: "input",
    description: "Advanced Input patterns: validation, icons, text add-ons, and clear button.",
    shadcnDeps: ["input", "label", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/input",
    variants: [
      { name: "error", file: "input-12.tsx", description: "Input with error state via aria-invalid" },
      { name: "start-icon", file: "input-14.tsx", description: "Input with leading icon" },
      { name: "end-icon", file: "input-15.tsx", description: "Input with trailing icon" },
      { name: "text-addon", file: "input-16.tsx", description: "Input with text prefix (e.g. https://)" },
      { name: "clearable", file: "input-36.tsx", description: "Input with clear button overlay" },
    ],
    rules: [
      { key: "validation", description: "Use aria-invalid and peer-aria-invalid:text-destructive for error styling" },
      { key: "sizing", description: "Adjust padding (pl-9, pr-9) when adding icons to prevent text overlap" },
      { key: "icons", description: "Use pointer-events-none and absolute positioning for non-interactive icons" },
      { key: "interactive", description: "For clear buttons, use Button variant=ghost and manage focus with useRef" },
      { key: "accessibility", description: "Always include Label and sr-only spans for icon-only buttons" },
    ],
    tags: ["input", "form", "validation", "icon", "clear", "advanced"],
  },
  {
    id: "input-password-strength",
    name: "Password Strength Input",
    category: "input",
    description: "Password input with strength indicator bar and toggle visibility.",
    shadcnDeps: ["input", "label", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/input",
    variants: [
      { name: "password-strength", file: "input-password-strength.tsx", description: "Password field with strength meter" },
    ],
    rules: [
      { key: "strength", description: "Calculate strength based on length, uppercase, numbers, special chars" },
      { key: "visual", description: "Use colored progress bar (red/yellow/green) for strength indication" },
      { key: "toggle", description: "Include eye/eye-off toggle for password visibility" },
    ],
    tags: ["password", "security", "form", "strength", "validation"],
  },

  // ─── Pagination ─────────────────────────────────────────
  {
    id: "pagination-variants",
    name: "Pagination Variants",
    category: "pagination",
    description: "Collection of pagination patterns: basic, icon-only, primary-styled, and bordered/split.",
    shadcnDeps: ["pagination", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/pagination",
    variants: [
      { name: "basic", file: "pagination-01.tsx", description: "Standard pagination with prev/next and page numbers" },
      { name: "icon-only", file: "pagination-02.tsx", description: "Chevron icons instead of text for prev/next" },
      { name: "primary-active", file: "pagination-03.tsx", description: "Active page uses primary button style" },
      { name: "bordered-split", file: "pagination-05.tsx", description: "Bordered block layout with dividers" },
    ],
    rules: [
      { key: "accessibility", description: "Icon-only pagination links must include aria-label" },
      { key: "active-styling", description: "Use buttonVariants({ variant: 'default' }) for primary active state" },
      { key: "bordered", description: "Use gap-0 and divide-x on PaginationContent for unified block layout" },
      { key: "consistency", description: "Use standard @/components/ui/pagination imports" },
    ],
    tags: ["pagination", "navigation", "pages", "list"],
  },

  // ─── Select & Radio ─────────────────────────────────────
  {
    id: "select-radio-variants",
    name: "Select & Radio Group Variants",
    category: "select-radio",
    description: "Select dropdowns and RadioGroup toggle selection for forms: expiry dates, plan selection.",
    shadcnDeps: ["select", "radio-group", "label"],
    npmDeps: [],
    importPath: "@/components/ui/select",
    variants: [
      { name: "expiry-select", file: "select-expiry.tsx", description: "Month/Year expiry date select pair" },
      { name: "plan-radio", file: "radio-group-plans.tsx", description: "Radio cards for plan selection (Starter/Pro/Enterprise)" },
    ],
    rules: [
      { key: "interactive-cards", description: "Use sr-only RadioGroupItem with styled Label as card. peer-data-[state=checked] for active border" },
      { key: "grid", description: "Use grid with gap for multiple Select or RadioGroup cards" },
      { key: "placeholder", description: "Always provide clear placeholder in SelectValue" },
      { key: "form-integration", description: "Use FormField wrapper with React Hook Form for validation" },
    ],
    tags: ["select", "radio", "form", "plan", "pricing", "date"],
  },

  // ─── Sonner (Toast) ─────────────────────────────────────
  {
    id: "sonner-variants",
    name: "Toast (Sonner) Variants",
    category: "sonner",
    description: "Toast notification patterns: positioning, actions, custom icons, and themed styles.",
    shadcnDeps: ["button"],
    npmDeps: ["sonner"],
    importPath: "sonner",
    variants: [
      { name: "positioning", file: "sonner-08.tsx", description: "6 position options (top/bottom × left/center/right)" },
      { name: "with-action", file: "sonner-06.tsx", description: "Toast with Undo action button" },
      { name: "with-icon", file: "sonner-03.tsx", description: "Toast with custom Lucide icon" },
      { name: "soft-destructive", file: "sonner-12.tsx", description: "Soft destructive toast with color-mix styling" },
    ],
    rules: [
      { key: "root", description: "Mount Toaster at root layout.tsx (singleton)" },
      { key: "layout", description: "For custom icon layouts, use flex and gap-2" },
      { key: "accessibility", description: "Include label for action buttons, ensure contrast for custom styles" },
      { key: "theming", description: "Use color-mix with CSS variables for soft variant theming" },
    ],
    tags: ["toast", "notification", "alert", "feedback", "sonner"],
  },

  // ─── Table ──────────────────────────────────────────────
  {
    id: "table-pricing",
    name: "Pricing Table",
    category: "table",
    description: "Feature comparison pricing table with plan columns.",
    shadcnDeps: ["table", "button", "badge"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/table",
    variants: [
      { name: "pricing", file: "table-pricing.tsx", description: "Feature comparison grid with plan tiers" },
    ],
    rules: [
      { key: "layout", description: "Use Table with fixed column widths for plan tiers" },
      { key: "indicators", description: "Use Check/X icons for feature availability" },
    ],
    tags: ["pricing", "comparison", "plans", "table", "features"],
  },

  // ─── Tabs ───────────────────────────────────────────────
  {
    id: "tabs-basic",
    name: "Basic Tabs",
    category: "tabs",
    description: "Tabbed interface for switching between views, ideal for settings or payment methods.",
    shadcnDeps: ["tabs", "card", "input", "label", "button"],
    npmDeps: [],
    importPath: "@/components/ui/tabs",
    variants: [
      { name: "account-password", file: "tabs-01.tsx", description: "Account/Password tabs with Card content" },
    ],
    rules: [
      { key: "trigger-layout", description: "Use grid-cols-N on TabsList for even width triggers" },
      { key: "default-value", description: "Always provide defaultValue to Tabs" },
      { key: "content-wrapper", description: "Prefer Card wrapper for TabsContent in forms" },
      { key: "accessibility", description: "Radix handles keyboard nav; ensure Label+Input are linked with IDs" },
    ],
    tags: ["tabs", "navigation", "settings", "form", "switching"],
  },

  // ─── Time Picker ────────────────────────────────────────
  {
    id: "time-picker-native",
    name: "Native Time Picker",
    category: "time-picker",
    description: "Time picker using native HTML time input with styled wrapper.",
    shadcnDeps: ["input", "label"],
    npmDeps: [],
    importPath: "@/components/ui/input",
    variants: [
      { name: "native", file: "time-picker-native.tsx", description: "HTML type=time input with label" },
    ],
    rules: [
      { key: "type", description: "Use Input type='time' for native browser time picker" },
    ],
    tags: ["time", "picker", "form", "native"],
  },
  {
    id: "time-picker-with-icon",
    name: "Time Picker with Icon",
    category: "time-picker",
    description: "Time picker with a clock icon overlay.",
    shadcnDeps: ["input", "label"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/input",
    variants: [
      { name: "icon", file: "time-picker-with-icon.tsx", description: "Time input with Clock icon" },
    ],
    rules: [
      { key: "icon", description: "Use Clock icon from lucide with absolute positioning" },
    ],
    tags: ["time", "picker", "icon", "form"],
  },

  // ─── Custom: Editable Input ─────────────────────────────
  {
    id: "editable-input",
    name: "Editable Input",
    category: "input",
    description: "Input disabled by default with an edit icon toggle. Ideal for profile fields, settings, and inline editing. Groq uses this when user requests a field that should be read-only until explicitly edited.",
    shadcnDeps: ["input", "label", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/editable-input",
    variants: [
      { name: "default", file: "editable-input.tsx", description: "Disabled input with pencil edit icon, click to enable editing" },
    ],
    rules: [
      { key: "default-state", description: "Input is disabled by default — user must click edit icon to enable" },
      { key: "save", description: "On blur or Enter key, reverts to disabled state" },
      { key: "icon", description: "Pencil icon for edit mode, Check icon for save/confirm" },
      { key: "data-test-id", description: "Uses testId prop prefix: {testId}-input, {testId}-edit-btn" },
    ],
    tags: ["input", "editable", "profile", "inline-edit", "disabled", "toggle"],
  },

  // ─── Custom: Filter Menu ────────────────────────────────
  {
    id: "filter-menu",
    name: "Filter Menu",
    category: "dropdown-menu",
    description: "Filter button with dropdown menu containing checkbox items. Groq uses this when user requests filtering controls with selectable options.",
    shadcnDeps: ["dropdown-menu", "button"],
    npmDeps: ["lucide-react"],
    importPath: "@/components/ui/filter-menu",
    variants: [
      { name: "default", file: "filter-menu.tsx", description: "Filter icon button with checkbox dropdown for multi-select filtering" },
    ],
    rules: [
      { key: "state", description: "Tracks checked state per filter item via onFilterChange callback" },
      { key: "badge", description: "Shows count badge of active filters on the button" },
      { key: "icon", description: "Uses Filter icon from lucide-react" },
      { key: "data-test-id", description: "Uses testId prop prefix: {testId}-filter-btn, {testId}-filter-{id}" },
    ],
    tags: ["filter", "dropdown", "checkbox", "multi-select", "toolbar", "menu"],
  },
];

// ─── Helper Functions ─────────────────────────────────────

export function getTemplatesByCategory(category: string): ComponentTemplate[] {
  return COMPONENT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): ComponentTemplate | undefined {
  return COMPONENT_TEMPLATES.find((t) => t.id === id);
}

export function searchTemplates(query: string): ComponentTemplate[] {
  const q = query.toLowerCase();
  return COMPONENT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.category.includes(q)
  );
}

export function getAllCategories(): string[] {
  return [...new Set(COMPONENT_TEMPLATES.map((t) => t.category))];
}

export function getTemplateSummary(): { category: string; count: number; ids: string[] }[] {
  const cats = getAllCategories();
  return cats.map((cat) => {
    const items = getTemplatesByCategory(cat);
    return { category: cat, count: items.length, ids: items.map((i) => i.id) };
  });
}
