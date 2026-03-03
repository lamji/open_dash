# OpenDash — User Guide

## Table of Contents
1. [What is OpenDash?](#what-is-opendash)
2. [Your First Dashboard](#your-first-dashboard)
3. [How the AI Works](#how-the-ai-works)
4. [Available Components](#available-components)
5. [Adding Components](#adding-components)
6. [Editing Components](#editing-components)
7. [Reordering Components](#reordering-components)
8. [Styling Components](#styling-components)
9. [Removing Components](#removing-components)
10. [Working with Tables](#working-with-tables)
11. [Working with Charts](#working-with-charts)
12. [Header & Navigation](#header--navigation)
13. [Dev Mode](#dev-mode)
14. [Tips & Troubleshooting](#tips--troubleshooting)

---

## What is OpenDash?

OpenDash is a no-code dashboard builder powered by AI. You type what you want in plain English, and the AI builds it for you — buttons, tables, charts, cards, forms, and more.

Everything you create is saved automatically. Close your browser, come back later — your dashboard is still there.

---

## Your First Dashboard

### Step 1: Open the AI Chat
Click the **AI** button in the top-right corner of the header.

### Step 2: Create a Page
Type something like:
```
Create a page called "Sales" with a shopping cart icon
```
The AI will add a sidebar item and create the page for you.

### Step 3: Add Components
With the "Sales" page selected, type:
```
Add a table with columns for product name, price, and quantity
```

### Step 4: Keep Building
```
Add 4 stat cards showing total revenue, orders, customers, and avg order value
```

That's it! You now have a working dashboard page.

---

## How the AI Works

### Conversational Flow

The AI follows a **two-step** approach for interactive components:

1. **You ask** → AI creates the component with smart defaults
2. **AI asks you** → Suggests customization options
3. **You respond** → AI applies your preferences

**Example conversation:**
```
You:  "Add a button with label Click Me"
AI:   Creates the button, then asks:
      "Button added! Do you want to add a function?
       (e.g., show alert, open link, or custom action)"
You:  "Make it show an alert saying Hello World"
AI:   Updates the button with alert behavior
```

**Another example:**
```
You:  "Add an input as search"
AI:   Creates search input, then asks:
      "Search input added! Any specific styling or props?
       (e.g., border color, placeholder text, width)"
You:  "Add a gray border"
AI:   Applies border-gray styling
```

### What the AI Always Does
- Uses **proper UI components** (buttons, inputs, cards) — never raw HTML
- Creates components with **sensible defaults** so they work immediately
- Asks **follow-up questions** so you stay in control
- Saves everything to the database automatically

---

## Available Components

### Content Components
| Component | What It Does | Example Prompt |
|-----------|-------------|----------------|
| **Text** | Headings and paragraphs | "Add a heading that says Welcome" |
| **Typography** | Styled text (h1-h4, blockquote, code) | "Add a large heading styled as h1" |
| **Card** | Container with title/description | "Add a card with title About Us" |
| **Badge** | Small label/tag | "Add a badge that says New" |
| **Label** | Form label | "Add a label for the email field" |
| **Separator** | Horizontal/vertical divider | "Add a divider between sections" |

### Interactive Components
| Component | What It Does | Example Prompt |
|-----------|-------------|----------------|
| **Button** | Clickable button with actions | "Add a button labeled Submit" |
| **Input** | Text/email/search input field | "Add an email input field" |
| **Textarea** | Multi-line text input | "Add a comments textarea" |
| **Accordion** | Collapsible FAQ sections | "Add an FAQ accordion with 3 items" |
| **Alert** | Info/warning/error message | "Add a success alert" |
| **Progress** | Progress bar | "Add a progress bar at 75%" |

### Data Components
| Component | What It Does | Example Prompt |
|-----------|-------------|----------------|
| **Table** | Sortable, searchable data table | "Add a user table with name and email" |
| **Analytics Cards** | Grid of stat cards | "Add 4 stat cards for KPIs" |
| **Bar Chart** | Vertical bar chart | "Add a bar chart for monthly sales" |
| **Line Chart** | Line chart with trends | "Add a line chart for daily traffic" |

---

## Adding Components

### Adding to a Page
Make sure you have a page selected in the sidebar, then ask the AI:

```
"Add a button with label Download Report"
"Add a search input with placeholder Search users..."
"Add 3 analytics cards for revenue, users, and orders"
"Add a table with columns for name, email, role, and status"
```

### Creating New Pages
```
"Create a page called Analytics with a bar chart icon"
"Add a Products page to the sidebar"
```

### Adding Header Items
```
"Add a search bar to the header"
"Add a notification bell to the header"
"Add a profile dropdown to the header"
```

---

## Editing Components

### How to Identify Components

1. Turn on **Dev Mode** (toggle in the sidebar footer)
2. Hover over any component to see its **ID**
3. Use the ID when talking to the AI

### Editing Examples

```
"Change the title of table [ID] to Active Users"
"Update the button [ID] label to Save Changes"
"Hide the search bar in table [ID]"
"Change pagination to 20 rows per page in table [ID]"
"Make column 2 sortable in table [ID]"
```

### Button Actions

After adding a button, you can assign it a function:

```
"Make button [ID] show an alert saying Form submitted!"
"Make button [ID] open https://google.com in a new tab"
"Make button [ID] log a custom event"
```

---

## Reordering Components

### Move a Component

To move a component relative to another one, use Dev Mode to get both IDs:

```
"Move component [ID-A] above component [ID-B]"
"Move component [ID-A] below component [ID-B]"
"Move component [ID] to the top"
```

### Add Below a Specific Component

```
"Add a button below component [ID]"
"Add a separator below table [ID]"
```

### Reorder Everything

```
"Reorder the page: put the cards first, then the table, then the chart"
```

The AI will update the order of all components on the page.

---

## Styling Components

### Using Natural Language
Just describe what you want:
```
"Make component [ID] have a blue background"
"Add rounded corners and shadow to [ID]"
"Add a red border to component [ID]"
"Make the search input border transparent"
```

### Changing the Primary Color
```
"Change the primary color to blue"
"Set primary color to #3b82f6"
```
This changes the accent color across the entire dashboard.

### Applying Styles by ID
If you know the exact Tailwind classes:
```
"Put border-red-500 shadow-lg on component [ID]"
```

---

## Removing Components

1. Turn on **Dev Mode**
2. Hover to find the component **ID**
3. Tell the AI:

```
"Remove component [ID]"
"Delete the table with ID [ID]"
```

The component is permanently removed. You can always recreate it.

---

## Working with Tables

Tables are the most powerful component. They support sorting, searching, pagination, status badges, and action menus.

### Creating a Table
```
"Create a user table with name, email, role, and status columns"
```

### Table Features

| Feature | How to Use |
|---------|-----------|
| **Search** | "Show/hide search in table [ID]" |
| **Pagination** | "Set table [ID] to 20 rows per page" |
| **Sorting** | "Make the name column sortable in table [ID]" |
| **Status column** | "Add a status column with Active, Inactive, Pending options" |
| **Actions column** | "Add an actions column with Edit and Delete buttons" |
| **Update title** | "Change table [ID] title to Customer List" |
| **Modify column** | "Rename column 1 to Full Name in table [ID]" |

---

## Working with Charts

### Bar Charts
```
"Create a bar chart showing sales by month with sample data"
"Change the bar color in chart [ID] to blue"
```

### Line Charts
```
"Create a line chart showing daily active users"
"Update chart [ID] title to Weekly Trends"
```

---

## Header & Navigation

### Search Bar
```
"Add a search bar to the header"
"Change search placeholder to Search products..."
"Move search to the right side"
"Make search border transparent"
```

### Notifications
```
"Add notifications to the header with 5 sample items"
```
Click a notification to see details. Click "View All" for the full list.

### Profile Menu
```
"Add a profile dropdown with name John Doe and role Admin"
```

### Messages
```
"Add a messages icon to the header"
```

### Reordering Header Items
```
"Move profile next to notifications"
"Put search on the right side"
```

---

## Dev Mode

Dev Mode is your editing superpower. It shows the **database ID** of every component when you hover over it.

### How to Use
1. Find the **Dev/Preview toggle** in the sidebar footer
2. Switch to **Develop** mode
3. Hover over any element to see its ID tooltip
4. Use the ID in your AI prompts to target specific components

### When to Use
- Editing a specific component
- Removing a component
- Reordering components
- Styling a specific element
- Debugging layout issues

### When to Turn Off
- Presenting your dashboard to others
- Testing the user experience
- Taking screenshots

---

## Tips & Troubleshooting

### Best Practices

- **Be specific** — "Add a blue button with label Submit" works better than "Add a button"
- **Build incrementally** — Add one component at a time rather than everything at once
- **Use Dev Mode** — Always turn it on before editing or removing components
- **Let the AI ask** — After adding a component, the AI will ask about customization. Answer to fine-tune it.

### Common Issues

**Component not updating?**
- Make sure you're referencing the correct ID (hover in Dev Mode)
- Try being more specific: "Change the title property of table [ID] to New Title"

**Styles not applying?**
- Describe what you want visually: "Make it rounded with a blue border"
- For precise control: "Put p-4 bg-blue-500 rounded-lg on [ID]"

**AI not understanding?**
- Break complex requests into smaller steps
- Reference component IDs when editing existing items
- Describe the visual result you want, not the technical implementation

**Table data looks wrong?**
- Make sure column names match your data field names
- Ask the AI to regenerate: "Recreate table [ID] with correct data"

---

## Building Forms

### How Forms Work

When you ask the AI to create a form (login, signup, contact, etc.), it builds a **container** with inputs and a submit button as children. The button can collect all input values on click.

### Example: Login Form
```
You:  "Create a login form"
AI:   Creates a flex-column container with:
      - Email input (required)
      - Password input (required)
      - Login button (submit)
      Then asks: "What should happen when the user clicks Login?"
You:  "Show an alert with the values"
AI:   Updates the button to collect both input values and alert them
```

### Connecting Buttons to Inputs

Buttons can reference input IDs to collect their values:
```
"Make button [ID] collect values from input [ID-1] and input [ID-2], then alert"
```
On click, the button gathers all referenced input values and includes them in the action.

---

## Test Case: Event Booking Dashboard

This step-by-step simulation shows how to build a complete event booking dashboard using OpenDash.

### Step 1: Create the Page
```
You: "Create an Event Booking page with a calendar icon"
```
AI creates a sidebar item + empty page.

### Step 2: Add a Booking Form
```
You: "Create a booking form with fields: Full Name, Email, Event Date, Number of Guests"
```
AI creates a flex-column container with 4 labeled inputs + a Submit button.

### Step 3: Wire the Submit Button
```
You: "Make the submit button show an alert with all the form values"
```
AI updates the button with `collectInputIds` referencing all 4 inputs + `onAction: "alert"`.

### Step 4: Add an Events Table
```
You: "Add a table below the form showing upcoming events with columns: Event Name, Date, Location, Guests, Status"
```
AI creates a table with sample data and status column (Confirmed, Pending, Cancelled).

### Step 5: Add Stats Cards
```
You: "Add 4 stat cards above the table: Total Bookings (1,247), Revenue ($89,430), Avg Guests (4.2), Upcoming Events (23)"
```
AI adds analytics cards with trend indicators.

### Step 6: Style the Form
```
You: "Style the form container with rounded corners, shadow, and a light background"
```
AI applies Tailwind classes to the container.

### Step 7: Add Header
```
You: "Add search bar and notifications to the header"
```
AI adds header components.

### Final Result
You now have a complete event booking dashboard with:
- A working booking form that collects input values
- A data table with status badges and sorting
- KPI stat cards with trends
- Header with search and notifications

---

## Quick Reference

| Task | Example |
|------|---------|
| Create page | "Create a Users page with a users icon" |
| Add button | "Add a button labeled Save" |
| Add input | "Add a search input" |
| Add table | "Add a table with name, email, role" |
| Add cards | "Add 4 stat cards for KPIs" |
| Add chart | "Add a bar chart for monthly revenue" |
| Edit component | "Change table [ID] title to Active Users" |
| Move component | "Move [ID-A] above [ID-B]" |
| Style component | "Add blue background to [ID]" |
| Remove component | "Remove component [ID]" |
| Add sidebar page | "Add Products page to sidebar" |
| Add header search | "Add search bar to header" |
| Button with action | "Make button [ID] show alert Hello!" |
| Create form | "Create a login form with email and password" |
| Connect button | "Make button [ID] collect input [ID] values and alert" |
| Change color | "Change primary color to #3b82f6" |
