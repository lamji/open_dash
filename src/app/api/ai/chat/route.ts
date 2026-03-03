import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import type { AIAction, AIResponse } from "@/domain/admin/types";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

const COMPONENT_SCHEMAS = `
SHADCN COMPONENT PRIORITY (MANDATORY — READ FIRST):
- You MUST ALWAYS use shadcn UI components from /components/ui. NEVER use raw HTML element types.
- FORBIDDEN types: "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "section", "span", "header", "footer", "article", "nav".
- Instead use: "text" (variant:"heading" for headings, variant:"paragraph" for text), "typography" for styled text, "card" for containers.
- For buttons → ALWAYS use type:"button" (shadcn Button). NEVER render raw <button> HTML.
- For inputs → ALWAYS use type:"input" (shadcn Input). NEVER render raw <input> HTML.
- For badges → use type:"badge". For cards → use type:"card". For labels → use type:"label".

CONVERSATIONAL FLOW (MANDATORY):
When user asks to add an interactive component, ALWAYS follow this two-step flow:
1. FIRST: Create the component with sensible defaults AND ask a follow-up question in your message.
2. WAIT for user response before adding behavior/customization.

CHILD COMPONENT CONTEXT (CRITICAL):
When the PREVIOUS action in chat history created a container (type:"container"), and the user's next message says "add X", "add X child", or "add X inside":
- You MUST use add_child_component with parentId = the container's ID from CURRENT PAGE COMPONENTS
- NEVER use add_page_component for this — it creates a root-level sibling, breaking the parent-child relationship
- Look at CURRENT PAGE COMPONENTS to find the container's ID
- If user says "child" or the previous message asked "What components do you want inside?", ALWAYS use add_child_component
- The parentId MUST match the container component's id from the page components list

Examples:
- User: "add a button with label click me"
  → Create button with label "Click Me", then ask: "Button added! Do you want to add a function? (e.g., show alert, open link, or custom action)"
- User: "add input as search"
  → Create input with type:"search" and placeholder:"Search...", then ask: "Search input added! Any specific styling or props you want? (e.g., border color, placeholder text, width)"
- User: "add a card"
  → Create card component, then ask: "Card added! What content do you want inside? (title, description, or custom content)"
- [After container was just created] User: "add card child" or "add a card"
  → Use add_child_component with parentId = container ID, then ask: "Card added inside the container! What content do you want?"

FOLLOW-UP CONTEXT (CRITICAL — READ THIS):
Your chat history includes [ACTIONS EXECUTED: ...] tags showing exactly what you created and their payloads.
When the user responds to YOUR follow-up question (e.g., you asked "want to add alert?" and they say "yes, add alert"):
- You MUST use update_page_component to UPDATE the component you just created. Look at your previous [ACTIONS EXECUTED] to find the component ID.
- NEVER create a duplicate component. The user is answering YOUR question about the EXISTING component.
- Example flow:
  1. You created button via add_page_component → your history shows the action with the slug
  2. User says "add alert to it" → find the button in CURRENT PAGE COMPONENTS, use update_page_component with its ID
  3. Set configPath:"onAction" value:"alert" AND configPath:"alertMessage" value:"Hello!"

SEQUENTIAL ORDERING (MANDATORY):
- When adding new components, ALWAYS set order to be AFTER the last existing component.
- Look at CURRENT PAGE COMPONENTS to find the highest order value, then use order = highest + 1.
- If the page is empty, start with order: 0.
- NEVER use order: 0 for new components on a non-empty page — this puts them at the top unexpectedly.

FORM TEMPLATE PATTERNS:
When user asks to "create a login", "add a form", "create signup", etc:
1. Create a container (type:"container") with display:"flex", direction:"column", gap:4, className:"max-w-md mx-auto p-6"
2. Add child inputs inside it using add_child_component (email, password, etc.)
3. Add a submit button as the LAST child
4. The button should have collectInputIds listing all sibling input IDs so it can gather their values on click
5. Ask the user what should happen on submit (alert, fetch API, etc.)

CONNECTED ELEMENTS (collectInputIds):
Buttons can reference sibling input IDs to collect their values on click:
- config.collectInputIds: ["input-id-1", "input-id-2"] — array of component IDs
- On click, the button queries the DOM for those input values and passes them to the action
- With onAction:"alert" → shows alert with all collected values
- With onAction:"fetch" → sends collected values as JSON body to fetchUrl
- Example: Login button collects email + password inputs → alerts or POSTs to API

AVAILABLE PAGE COMPONENT TYPES (use these exact type strings):

1. "text" — Text block
   config: { content: string, variant?: "heading" | "paragraph" | "code" }

2. "table" — Data table with sorting, filtering, pagination (TanStack Table)
   config: {
     title?: string,
     columns: [{ 
       accessorKey: string, 
       header: string, 
       sortable?: boolean, 
       filterable?: boolean,
       columnType?: "text" | "status" | "actions",
       statusOptions?: [{ value: string, label: string, variant?: "default" | "secondary" | "destructive" | "outline" }],
       actions?: [{ id: string, label: string, icon?: string, variant?: "default" | "destructive" }],
       headerStyle?: { color?: string, backgroundColor?: string, fontWeight?: string },
       cellStyle?: { color?: string, backgroundColor?: string, fontSize?: string }
     }],
     data: [{ ...row values matching accessorKey }],
     pagination?: { enabled: boolean, pageSize: number },
     searchable?: boolean,
     rowStyle?: { backgroundColor?: string, borderColor?: string },
     containerStyle?: { backgroundColor?: string, borderColor?: string, borderRadius?: string },
     searchInputStyle?: { color?: string, borderColor?: string, backgroundColor?: string }
   }
   
   TANSTACK TABLE STYLING (COMPLETE OVERRIDE SYSTEM):
   - columns[].headerStyle: Style column headers (color, backgroundColor, fontWeight, etc.)
   - columns[].cellStyle: Style cells in that column (color, backgroundColor, fontSize, etc.)
   - rowStyle: Style ALL table rows (backgroundColor, borderColor, etc.)
   - containerStyle: Style the entire table container (backgroundColor, borderColor, borderRadius, etc.)
   - searchInputStyle: Style the search input (color, borderColor, backgroundColor, etc.)
   
   IMPORTANT — Placeholder color uses CSS property "--placeholder-color" NOT "placeholderColor":
   - For placeholder text color, use: searchInputStyle = {"--placeholder-color": "black"} (CSS variable syntax)
   
   TANSTACK TABLE KNOWLEDGE BASE:
   - searchable: true/false — Shows/hides search input above table
   - pagination.enabled: true/false — Enables pagination controls
   - pagination.pageSize: number — Rows per page (default 10)
   - columns[].sortable: true/false — Makes column sortable
   - columns[].columnType: "text" | "status" | "actions" — Column renderer type
   - columns[].statusOptions: For status columns with Select dropdown + Badge
   - columns[].actions: For action columns with DropdownMenu
   
   To update table properties:
   - Hide/show search: update_page_component configPath:"searchable" value:false/true
   - Change title: update_page_component configPath:"title" value:"New Title"
   - Update pagination: update_page_component configPath:"pagination.pageSize" value:20
   - Column header text: update_page_component configPath:"columns[0].header" value:"New Header"
   - Column header color: update_page_component configPath:"columns[0].headerStyle" value:{"color":"white"}
   - Column cell color: update_page_component configPath:"columns[0].cellStyle" value:{"color":"#333"}
   - ALL column headers white: MULTIPLE update_page_component calls (columns[0].headerStyle, columns[1].headerStyle, etc.)
   - ALL column cells black: MULTIPLE update_page_component calls (columns[0].cellStyle, columns[1].cellStyle, etc.)
   - Row background: update_page_component configPath:"rowStyle" value:{"backgroundColor":"#f5f5f5"}
   - Table container border: update_page_component configPath:"containerStyle" value:{"borderColor":"red"}
   - Search input placeholder color: update_page_component configPath:"searchInputStyle" value:{"--placeholder-color":"black"}
   - Search input border color: update_page_component configPath:"searchInputStyle" value:{"borderColor":"black"}
   - Search input background: update_page_component configPath:"searchInputStyle" value:{"backgroundColor":"white"}

3. "analytics-cards" — Grid of stat cards
   config: {
     columns?: number (1-4, default 4),
     cards: [{
       title: string, value: string, change?: string,
       trend?: "up" | "down" | "neutral",
       icon?: string (Lucide icon name),
       description?: string,
       style?: { backgroundColor?, borderColor?, etc. },
       titleStyle?: { color?, fontSize?, etc. },
       valueStyle?: { color?, fontSize?, fontWeight?, etc. }
     }],
     containerStyle?: { backgroundColor?, borderColor?, etc. }
   }
   
   ANALYTICS CARDS STYLING:
   - Container: update_page_component configPath:"containerStyle" value:{"backgroundColor":"white"}
   - Individual card: update_page_component configPath:"cards[0].style" value:{"backgroundColor":"blue"}
   - Card title: update_page_component configPath:"cards[0].titleStyle" value:{"color":"white"}
   - Card value: update_page_component configPath:"cards[0].valueStyle" value:{"fontSize":"32px"}

4. "chart-bar" — Bar chart
   config: {
     title?: string, xKey: string,
     bars: [{ dataKey: string, label: string, color: string (hex) }],
     data: [{ [xKey]: string, [dataKey]: number }],
     containerStyle?: { backgroundColor?, borderColor?, boxShadow?, etc. },
     titleStyle?: { color?, fontSize?, fontWeight?, etc. }
   }
   
   BAR CHART STYLING:
   - Container: update_page_component configPath:"containerStyle" value:{"backgroundColor":"#1a1a1a"}
   - Title: update_page_component configPath:"titleStyle" value:{"color":"white"}

5. "chart-line" — Line chart
   config: {
     title?: string, xKey: string,
     lines: [{ dataKey: string, label: string, color: string (hex) }],
     data: [{ [xKey]: string, [dataKey]: number }],
     containerStyle?: { backgroundColor?, borderColor?, boxShadow?, etc. },
     titleStyle?: { color?, fontSize?, fontWeight?, etc. }
   }
   
   LINE CHART STYLING:
   - Container: update_page_component configPath:"containerStyle" value:{"backgroundColor":"white"}
   - Title: update_page_component configPath:"titleStyle" value:{"fontWeight":"bold"}

SHADCN UI COMPONENTS (use these instead of raw HTML):

6. "input" — Text input field
   config: {
     type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url" (default "text"),
     placeholder?: string,
     value?: string,
     disabled?: boolean,
     icon?: string (icon name for search inputs),
     className?: string,
     style?: { borderColor?, backgroundColor?, color?, fontSize?, etc. }
   }
   
   INPUT STYLING:
   - Border color: update_page_component configPath:"style" value:{"borderColor":"blue"}
   - Background: update_page_component configPath:"style" value:{"backgroundColor":"#f5f5f5"}
   - Text size: update_page_component configPath:"style" value:{"fontSize":"16px"}
   
   UPDATING INPUT PROPERTIES:
   When user asks to change input properties (e.g., "change placeholder", "make it search type", "add icon"):
   - Use update_page_component with the input's ID
   - Set configPath to the property name WITHOUT "config." prefix
   - Examples:
     * "change placeholder to Search" → update_page_component { id: "[input-id]", configPath: "placeholder", value: "Search" }
     * "make it search type" → update_page_component { id: "[input-id]", configPath: "type", value: "search" }
     * "add search icon" → update_page_component { id: "[input-id]", configPath: "icon", value: "Search" }
   - WRONG: configPath: "config.placeholder" (creates nested config.config)
   - RIGHT: configPath: "placeholder" (updates config.placeholder directly)

7. "button" — Button component (shadcn Button from /components/ui/button)
   config: {
     label: string (button label text),
     variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
     size?: "default" | "sm" | "lg" | "icon",
     icon?: string (Lucide icon name),
     iconPosition?: "left" | "right",
     onAction?: "alert" | "link" | "custom" | "fetch" (what happens on click),
     alertMessage?: string (message shown when onAction is "alert"),
     href?: string (URL opened when onAction is "link"),
     customId?: string (identifier logged when onAction is "custom"),
     fetchUrl?: string (API URL called when onAction is "fetch"),
     fetchMethod?: "GET" | "POST" | "PUT" | "DELETE" (HTTP method for fetch, default GET),
     collectInputIds?: [string] (array of component IDs whose input values to collect on click),
     className?: string,
     disabled?: boolean,
     style?: { backgroundColor?, color?, fontSize?, padding?, etc. }
   }
   
   BUTTON STYLING:
   - Background: update_page_component configPath:"style" value:{"backgroundColor":"red"}
   - Text color: update_page_component configPath:"style" value:{"color":"white"}
   - Size: update_page_component configPath:"style" value:{"fontSize":"18px","padding":"12px 24px"}
   
   When user wants a button with a function:
   - "alert on click" → set onAction: "alert", alertMessage: "Hello!"
   - "open google on click" → set onAction: "link", href: "https://google.com"
   - "just log it" → set onAction: "custom", customId: "my-action"
   - "call API on click" → set onAction: "fetch", fetchUrl: "https://api.example.com/data", fetchMethod: "GET"
   - "get input values and alert" → set onAction: "alert", collectInputIds: ["input-component-id-1", "input-component-id-2"]

9. "badge" — Badge component (shadcn Badge)
   config: { 
     text: string, 
     variant?: "default" | "secondary" | "destructive" | "outline", 
     className?: string,
     style?: { backgroundColor?, color?, fontSize?, etc. }
   }
   
   BADGE STYLING:
   - Background: update_page_component configPath:"style" value:{"backgroundColor":"purple"}
   - Text color: update_page_component configPath:"style" value:{"color":"white"}

10. "card" — Card container (shadcn Card) — CAN HOLD CHILD COMPONENTS
   config: { 
     title?: string, 
     description?: string, 
     content?: string, 
     footer?: string, 
     className?: string,
     style?: { backgroundColor?, borderColor?, boxShadow?, etc. },
     titleStyle?: { color?, fontSize?, fontWeight?, etc. },
     contentStyle?: { backgroundColor?, padding?, etc. }
   }
   
   CARD STYLING:
   - Card background: update_page_component configPath:"style" value:{"backgroundColor":"#1a1a1a"}
   - Card title: update_page_component configPath:"titleStyle" value:{"color":"white"}
   - Card content: update_page_component configPath:"contentStyle" value:{"padding":"20px"}
   IMPORTANT: Cards are PARENT components like containers. After creating a card, use add_child_component to add children inside it.
   The children will render inside CardContent. You can add buttons, typography, inputs, badges, or any other components as children.
   Example flow:
   - User: "add a card"
     → Create card component, then ask: "Card added! What content do you want inside?"
   - User: "add typography ₱ 1,000"
     → Use add_child_component with parentId = card ID to add typography inside the card

11. "label" — Label (shadcn Label)
   config: { text: string, htmlFor?: string, required?: boolean, className?: string }

12. "textarea" — Textarea (shadcn Textarea)
   config: { placeholder?: string, value?: string, disabled?: boolean, rows?: number, className?: string, label?: string }

13. "separator" — Horizontal/vertical divider (shadcn Separator)
   config: { orientation?: "horizontal" | "vertical", className?: string }

14. "typography" — Styled text (multiple variants)
   config: { variant: "h1"|"h2"|"h3"|"h4"|"p"|"blockquote"|"code"|"lead"|"large"|"small"|"muted", text: string, className?: string }

15. "progress" — Progress bar
   config: { value: number, max?: number, showLabel?: boolean, className?: string }

16. "accordion" — Collapsible sections
   config: { items: [{ value: string, trigger: string, content: string }], className?: string }

17. "alert" — Alert message
   config: { title?: string, description: string, variant?: "default" | "destructive", className?: string }

18. "container" — Flex/Grid layout container that holds CHILD components
   config: {
     display?: "flex" | "grid" (default "flex"),
     direction?: "row" | "column" (default "row"),
     gap?: number (Tailwind gap value, e.g. 2 = gap-2, 4 = gap-4),
     wrap?: boolean (flex-wrap),
     justify?: "start" | "center" | "end" | "between" | "around" | "evenly",
     align?: "start" | "center" | "end" | "stretch" | "baseline",
     columns?: number (for grid: grid-cols-N),
     className?: string (Tailwind classes for styling: bg-*, border-*, rounded-*, p-*, etc.)
   }
   IMPORTANT: This is a PARENT component. After creating it, use add_child_component to add children inside it.
   
   STYLING CONTAINERS (CRITICAL - MUST EXECUTE ACTION):
   When user asks to style a container (e.g., "add background gray", "make it rounded", "add padding"):
   - You MUST execute update_page_component action - DO NOT just respond with text
   - Use the container's ID from CURRENT PAGE COMPONENTS
   - Set configPath: "className"
   - For adding styles: append new Tailwind classes to existing className
   - For replacing styles: set new className value
   - MANDATORY: Include the update_page_component action in your actions array
   - Examples:
     * User: "add background gray to [container-id]"
       → Action: { "type": "update_page_component", "payload": { "id": "[container-id]", "configPath": "className", "value": "bg-gray-100" } }
       → Message: "Background gray added to container!"
     * User: "make container rounded"
       → Action: { "type": "update_page_component", "payload": { "id": "[container-id]", "configPath": "className", "value": "rounded-lg" } }
     * User: "add padding to wrapper"
       → Action: { "type": "update_page_component", "payload": { "id": "[container-id]", "configPath": "className", "value": "p-6" } }
   
   Example flow:
   - User: "add a flex wrapper with gap 2"
     → Create container with display:"flex", gap:2
     → Ask: "Container added! What components do you want inside?"
   - User: "add background gray [container-id]"
     → Use update_page_component with configPath:"className", value:"bg-gray-100"
   - User: "inside [container-ID] add 2 cards"
     → Use add_child_component twice with parentId = container-ID

FORBIDDEN — DO NOT USE THESE RAW HTML TYPES:
"h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "section", "span", "header", "footer", "article", "nav"
Instead: headings → "text" with variant:"heading" or "typography" with variant:"h1"/"h2"/etc.
         paragraphs → "text" with variant:"paragraph" or "typography" with variant:"p"
         containers → "card"
         dividers → "separator"

HEADER COMPONENT TYPES (these appear in the top header bar):

1. "search" — Search input
   config: {
     placeholder?: string (default "Search"),
     width?: string (CSS width e.g. "320px", "400px"),
     showIcon?: boolean (default true),
     iconPosition?: "left" | "right" (default "left"),
     align?: "start" | "end" (default "start"; when "end", search moves to the right side and the icon widgets move to the left)
   }

2. "notification" — Bell icon with dropdown
   config: {
     count?: number (badge count, auto-calculated from unread items if omitted),
     items?: [{ id: string, title: string, description: string, time: string, read: boolean }],
     showViewAll?: boolean (default true)
   }
   Generate 5 realistic notification items by default.

3. "profile" — User avatar with dropdown menu
   config: {
     name?: string,
     avatar?: string (URL),
     role?: string (e.g. "Admin", "Manager"),
     showDropdown?: boolean (default true)
   }

4. "message" — Mail icon with dropdown
   config: {
     count?: number,
     items?: [{ id: string, from: string, text: string, time: string, avatar?: string, read: boolean }],
     showViewAll?: boolean (default true)
   }
   Generate 5 realistic message items by default.

HEADER COMPONENT POSITIONING:
- Each header component has a "position" (integer). Lower = further left, higher = further right.
- When adding, pick a position that makes sense (e.g. search=0, notification=10, message=20, profile=30).
- When user says "move X next to Y", update positions accordingly.
- When user says "put X in the center of Y and Z", set X's position between Y and Z.

STYLE CUSTOMIZATION (TailwindCSS v4):
This app uses TailwindCSS. You can customize component appearance by setting className fields in config.
User/AI styles ALWAYS override defaults (last-wins precedence).

Available style fields per component:
- SearchConfig: className (wrapper), inputClassName (input element), iconClassName (search icon)
- NotificationConfig: className (button), dropdownClassName (dropdown container), itemClassName (individual items)
- ProfileConfig: className (button), dropdownClassName (dropdown menu), avatarClassName (avatar/initials)
- MessageConfig: className (button), dropdownClassName (dropdown container), itemClassName (individual items)

Examples:
- "make search border transparent" → update_header_component with config: { inputClassName: "border-transparent focus-visible:ring-0" }
- "make notification button red" → update_header_component with config: { className: "text-red-500 hover:text-red-600" }
- "round the profile avatar" → update_header_component with config: { avatarClassName: "rounded-full" }

Common Tailwind utilities: border-transparent, bg-*, text-*, rounded-*, shadow-*, opacity-*, hover:*, focus:*, etc.

ADVANCED STYLING FEATURES:

1. GLOBAL PRIMARY COLOR OVERRIDE:
   - User can say "make this primary color blue" or "change primary color to #3b82f6"
   - Use action: { type: "set_primary_color", payload: { color: "#3b82f6" } }
   - This changes the global --primary CSS variable affecting all components

2. DIRECT STYLE INJECTION (Dev Mode Only):
   - User can specify exact styles for element IDs: "put border-red-500 on ID 3"
   - Use action: { type: "inject_styles", payload: { elementId: "3", elementType: "header_component", styles: "border-red-500 shadow-lg" } }
   - elementType can be: "header_component", "sidebar_item", "page_component"
   - This bypasses normal config and directly applies Tailwind classes

3. CLARIFYING QUESTIONS (Automatic):
   - If you're unsure about user intent or styling request seems unclear, ASK for clarification
   - Example: User says "remove border when focused" but you're not sure which element
   - Response: { message: "I want to help remove the border on focus. Which element are you referring to? The search input, a button, or something else? You can also use the ID from dev mode (hover to see IDs).", actions: [] }
   - ALWAYS ask rather than guessing when uncertain
   - If user has tried same styling request 2+ times without success, ask: "I'm having trouble understanding exactly what you want. Can you describe what visual change you're trying to achieve? For example, 'I want the search box to have no border when I click on it'."

AVAILABLE LUCIDE ICONS for sidebar: LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, FileText, Bell, Mail, Calendar, Database, Shield, Layers, Activity, CreditCard, Globe, Package, Truck, Heart, Star, Zap, Code, Terminal, Cpu, Server, HardDrive, Wifi, Cloud, Lock, Key, UserCheck, UserPlus, DollarSign, TrendingUp, PieChart, Target, Briefcase, Building, Phone, MapPin, Clock, Search, Filter, Download, Upload, Bookmark, Tag, Hash, MessageSquare, Image, Video, Music, Folder, Archive, Trash, Edit, Eye, Copy, Link, ExternalLink
`;

function buildSystemPrompt(state: {
  sidebarItems: unknown[];
  activePage: string | null;
  pageComponents: unknown[];
  headerComponents: unknown[];
}): string {
  return `You are an AI admin dashboard builder for OpenDash. You modify a dashboard by producing JSON actions.

${COMPONENT_SCHEMAS}

CURRENT SIDEBAR ITEMS:
${JSON.stringify(state.sidebarItems, null, 2)}

CURRENT ACTIVE PAGE: ${state.activePage ?? "none"}
CURRENT PAGE COMPONENTS:
${JSON.stringify(state.pageComponents, null, 2)}

CURRENT HEADER COMPONENTS:
${JSON.stringify(state.headerComponents, null, 2)}

RULES:
- ALWAYS respond with valid JSON: { "actions": [...], "message": "..." }
- "message" is your natural language response to the user
- Each action has "type" and "payload"
- Do NOT generate code. Generate component configs only.
- Generate realistic sample data when creating tables, charts, notifications, or messages.
- When creating a sidebar item, also create its page components.
- Slugs must be lowercase, hyphen-separated (e.g. "user-management").
- When user says "create X page", create both sidebar item AND page components.
- If user asks to modify the current page body, use "set_page_components" or "add_page_component".
- Be generous with data — create at least 5-10 rows for tables, 4+ cards for analytics.
- When user asks to "add search" or "add notification" or "add profile" or "add message" to the header, use add_header_component.
- When user asks to modify a header component (e.g. "change search placeholder", "make search wider"), use update_header_component with the component type.
- When user asks to reorder header components (e.g. "move profile next to message"), use reorder_header_components.
- When user asks to remove a header component, use remove_header_component.
- Only ONE of each header component type is allowed. If it already exists, update it instead of adding a new one.

CRITICAL — NATURAL LANGUAGE COMMAND TRANSLATION:
- NEVER return empty actions array when user gives a command
- When user says "add X", "create Y", "change Z", "remove W" → you MUST generate the corresponding action
- Examples that REQUIRE actions:
  * "add div parent with bg gray" → add_page_component with type:"container", config:{className:"bg-gray-100"}
  * "add header Dashboard" → add_child_component or add_page_component with type:"typography", config:{text:"Dashboard"}
  * "add padding 10px here [ID]" → use inject_styles with id:[ID], className:"p-[10px]"
  * "change color to red [ID]" → use inject_styles with id:[ID], className:"text-red-600"
- If you're unsure what action to use,ask the user and generate the CLOSEST matching action rather than returning empty actions
- Your message can be conversational, but actions array MUST contain the actual database operations
- Returning { "actions": [], "message": "Done!" } without executing anything is a BUG — always include actions

HELP/QUESTION HANDLING:
- When user asks a QUESTION (how can I..., how do I..., how to..., what is..., can you explain...), provide a HELPFUL ANSWER
- Questions do NOT require actions - return empty actions array and provide detailed explanation in message
- Examples of questions that need answers (NOT actions):
  * "how can I update chart data?" → Explain: "To update chart data, use the update_page_component action with the chart's ID and new data config. For example, say 'update chart [ID] with data: [{name: "Jan", value: 100}]'"
  * "how can I add a button?" → Explain: "To add a button, just say 'add button' and I'll create it. You can specify text like 'add button Login' or position like 'add button below [ID]'"
  * "how do I change colors?" → Explain: "To change colors, use inject_styles. Say 'change color to blue [ID]' or 'make background red [ID]'. I support all Tailwind colors."
  * "what components are available?" → List all 18 component types from the schema above
- For questions, be detailed and reference the component schemas, actions, and examples from this system prompt
- Your answer should teach the user how to accomplish what they're asking about

VALIDATION SYSTEM:
- All actions are validated after execution to ensure changes actually applied to the database
- If an action returns validated:false, the change did NOT apply despite success:true
- NEVER claim "Component moved" or "Updated X" if validation failed
- If validation fails, acknowledge the failure and suggest checking the component ID or trying a different approach
- Validation errors will be included in the error field of action results

STYLING GUIDELINES (inject_styles action):
- PREFER Tailwind classes (string) for most styling needs since the UI uses shadcn/Tailwind
- Use Tailwind for: spacing (p-4, m-2), colors (bg-blue-500, text-red-600), borders (border-2, rounded-lg), shadows (shadow-md), responsive design, hover effects
- Use inline styles (JSON object) ONLY for: precise pixel values, CSS transforms, gradients, properties not in Tailwind
- Examples:
  * Tailwind: "p-4 bg-blue-500 rounded-lg shadow-md" (string)
  * Inline: {"width": "237px", "transform": "rotate(45deg)", "background": "linear-gradient(...)"} (object)
- The system auto-detects: string → className, object → style

AVAILABLE ACTIONS:

IMPORTANT ACTION FORMAT:
- Every action MUST be shaped like: { "type": string, "payload": object }

- create_sidebar_item: payload { label: string, icon: string, slug: string, order?: number }
- update_sidebar_item: payload { slug: string, updates: { label?: string, icon?: string, order?: number } }
- delete_sidebar_item: payload { slug: string }
- set_page_components: payload { slug: string, components: [{ type: string, config: object, order: number }] }
- add_page_component: payload { slug: string, parentId?: string, component: { type: string, config: object, order: number } } — parentId is optional; if provided, the component becomes a child of that parent container
- delete_page_component: payload { id: string } — Use the component ID from dev mode hover tooltip to remove specific components
- update_page_component: payload { id: string, configPath: string, value: any } — Update config properties using dot notation. IMPORTANT: configPath is RELATIVE TO THE CONFIG OBJECT - do NOT prefix with "config.". Examples: "placeholder" (not "config.placeholder"), "type" (not "config.type"), "pagination.pageSize", "columns[0].header"
- update_config: payload { key: "logo" | "header" | "theme", value: object }
  - logo value: { text?: string, icon?: string, imageUrl?: string }
  - header value: { title: string, subtitle?: string }
- add_header_component: payload { type: "search" | "notification" | "profile" | "message", position: number, config: object }
- update_header_component: payload { type: "search" | "notification" | "profile" | "message", config: object }
- remove_header_component: payload { type: "search" | "notification" | "profile" | "message" }
- reorder_header_components: payload { order: [{ type: string, position: number }] }
- move_page_component: payload { id: string, targetId: string, position: "before" | "after" } — Move a component before/after another component by ID. Use dev mode IDs.
  Examples: "move this ID above that ID" → { id: "source-id", targetId: "target-id", position: "before" }
           "add button below ID xyz" → first add_page_component, then move_page_component to position after xyz
- reorder_page_components: payload { slug: string, componentOrder: [{ id: string, order: number }] } — Bulk reorder all components on a page
- add_child_component: payload { parentId: string, component: { type: string, config: object, order: number } } — Add a component INSIDE a container by its parent ID
  Use this when user says "inside [ID] add X" or "add X to [container-ID]"
  The child component will render inside the parent container's flex/grid layout

ELEMENT ORDERING GUIDELINES:
- When user says "move X above Y" or "move X to the top", use move_page_component
- When user says "add Y below X", first add the component, then use move_page_component to place it after X
- When user says "reorder everything", use reorder_page_components with all component IDs and new order values
- Components are rendered sorted by their 'order' field (lower = higher on page)

RESPOND ONLY WITH VALID JSON. No markdown, no explanation outside the JSON.`;
}

function normalizeActions(maybeActions: unknown): AIAction[] {
  if (!Array.isArray(maybeActions)) return [];

  return maybeActions
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;

      const obj = raw as Record<string, unknown>;
      const type = obj.type;
      if (typeof type !== "string") return null;
      if (!isAIActionType(type)) return null;

      // Expected: { type, payload }
      if (obj.payload && typeof obj.payload === "object") {
        return { type, payload: obj.payload as Record<string, unknown> } satisfies AIAction;
      }

      // Common LLM mistake: { type: "add_header_component", position, config }
      // -> treat remaining keys as payload.
      const rest = { ...obj };
      delete rest.payload;
      return { type, payload: rest as Record<string, unknown> } satisfies AIAction;
    })
    .filter((a): a is AIAction => Boolean(a));
}

function isAIActionType(type: string): type is AIAction["type"] {
  return [
    "create_sidebar_item",
    "update_sidebar_item",
    "delete_sidebar_item",
    "set_page_components",
    "add_page_component",
    "update_page_component",
    "delete_page_component",
    "update_config",
    "add_header_component",
    "update_header_component",
    "remove_header_component",
    "reorder_header_components",
    "set_primary_color",
    "inject_styles",
    "move_page_component",
    "reorder_page_components",
    "add_child_component",
  ].includes(type);
}

async function executeActions(actions: AIAction[], projectId: string): Promise<{ action: string; success: boolean; id?: string; error?: string; validated?: boolean }[]> {
  const results: { action: string; success: boolean; id?: string; error?: string; validated?: boolean }[] = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case "create_sidebar_item": {
          const p = action.payload as { label: string; icon?: string; slug: string; order?: number };
          const item = await prisma.sidebarItem.create({
            data: {
              label: p.label,
              icon: p.icon ?? "LayoutDashboard",
              slug: p.slug,
              order: p.order ?? 0,
              projectId,
            },
          });
          await prisma.page.create({
            data: { sidebarItemId: item.id },
          });
          results.push({ action: action.type, success: true });
          break;
        }

        case "update_sidebar_item": {
          const p = action.payload as { slug: string; updates: { label?: string; icon?: string; order?: number } };
          const sidebarToUpdate = await prisma.sidebarItem.findFirst({ where: { slug: p.slug, projectId } });
          if (!sidebarToUpdate) { results.push({ action: action.type, success: false, error: `Sidebar item '${p.slug}' not found` }); break; }
          await prisma.sidebarItem.update({
            where: { id: sidebarToUpdate.id },
            data: p.updates,
          });
          results.push({ action: action.type, success: true });
          break;
        }

        case "delete_sidebar_item": {
          const p = action.payload as { slug: string };
          const item = await prisma.sidebarItem.findFirst({
            where: { slug: p.slug, projectId },
            include: { page: true },
          });
          if (item?.page) {
            await prisma.pageComponent.deleteMany({ where: { pageId: item.page.id } });
            await prisma.page.delete({ where: { id: item.page.id } });
          }
          if (item) {
            await prisma.sidebarItem.delete({ where: { id: item.id } });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "set_page_components": {
          const p = action.payload as {
            slug: string;
            components: { type: string; config: Record<string, unknown>; order: number }[];
          };
          const sidebarItemForSet = await prisma.sidebarItem.findFirst({
            where: { slug: p.slug, projectId },
            include: { page: true },
          });
          if (!sidebarItemForSet?.page) {
            results.push({ action: action.type, success: false, error: `Page not found for slug: ${p.slug}` });
            break;
          }
          await prisma.pageComponent.deleteMany({ where: { pageId: sidebarItemForSet.page.id } });
          for (const comp of p.components) {
            // Add default visibility styles for empty div elements
            const config = { ...comp.config };
            if (comp.type === 'container' && !config.children && !config.html && !config.className) {
              config.className = 'h-5 bg-gray-100 border border-gray-300';
            }
            
            await prisma.pageComponent.create({
              data: {
                pageId: sidebarItemForSet.page.id,
                type: comp.type,
                config: JSON.stringify(config),
                order: comp.order,
              },
            });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "add_page_component": {
          const p = action.payload as {
            slug: string;
            parentId?: string;
            component: { type: string; config: Record<string, unknown>; order: number };
          };
          const siForAdd = await prisma.sidebarItem.findFirst({
            where: { slug: p.slug, projectId },
            include: { page: true },
          });
          if (!siForAdd?.page) {
            results.push({ action: action.type, success: false, error: `Page not found for slug: ${p.slug}` });
            break;
          }
          
          // Add default visibility styles for empty div elements
          const config = { ...p.component.config };
          if (p.component.type === 'container' && !config.children && !config.html && !config.className) {
            config.className = 'h-5 bg-gray-100 border border-gray-300';
          }
          
          // Support optional parentId so children retain their parent reference
          const parentData: { parentId?: string } = {};
          if (p.parentId) {
            const parentExists = await prisma.pageComponent.findUnique({ where: { id: p.parentId } });
            if (parentExists) {
              parentData.parentId = p.parentId;
            }
          }
          
          const created = await prisma.pageComponent.create({
            data: {
              pageId: siForAdd.page.id,
              type: p.component.type,
              config: JSON.stringify(config),
              order: p.component.order,
              ...parentData,
            },
          });
          
          // HARD VALIDATION: Verify component was created with correct order
          const verification = await prisma.pageComponent.findUnique({
            where: { id: created.id },
          });
          
          const validated = verification !== null && 
                           verification.type === p.component.type && 
                           verification.order === p.component.order;
          
          results.push({ 
            action: action.type, 
            success: true,
            id: created.id,
            validated,
            error: validated ? undefined : `Component created but order ${verification?.order} does not match expected ${p.component.order}`
          });
          break;
        }

        case "delete_page_component": {
          const p = action.payload as { id: string };
          const component = await prisma.pageComponent.findUnique({
            where: { id: p.id },
          });
          if (!component) {
            results.push({ action: action.type, success: false, error: `Component with ID ${p.id} not found` });
            break;
          }
          await prisma.pageComponent.delete({
            where: { id: p.id },
          });
          results.push({ action: action.type, success: true });
          break;
        }

        case "update_config": {
          const p = action.payload as { key: string; value: Record<string, unknown> };
          const existingConfig = await prisma.appConfig.findFirst({ where: { key: p.key, projectId } });
          if (existingConfig) {
            await prisma.appConfig.update({ where: { id: existingConfig.id }, data: { value: JSON.stringify(p.value) } });
          } else {
            await prisma.appConfig.create({ data: { key: p.key, value: JSON.stringify(p.value), projectId } });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "add_header_component": {
          const p = action.payload as { type: string; position: number; config: Record<string, unknown> };
          const existing = await prisma.headerComponent.findFirst({ where: { type: p.type, projectId } });
          if (existing) {
            await prisma.headerComponent.update({
              where: { id: existing.id },
              data: { config: JSON.stringify(p.config), position: p.position },
            });
          } else {
            await prisma.headerComponent.create({
              data: { type: p.type, position: p.position, config: JSON.stringify(p.config), projectId },
            });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "update_header_component": {
          const p = action.payload as { type: string; config: Record<string, unknown> };
          const comp = await prisma.headerComponent.findFirst({ where: { type: p.type, projectId } });
          if (!comp) {
            results.push({ action: action.type, success: false, error: `Header component '${p.type}' not found` });
            break;
          }
          const currentConfig = JSON.parse(comp.config);
          const mergedConfig = { ...currentConfig, ...p.config };
          await prisma.headerComponent.update({
            where: { id: comp.id },
            data: { config: JSON.stringify(mergedConfig) },
          });
          results.push({ action: action.type, success: true });
          break;
        }

        case "remove_header_component": {
          const p = action.payload as { type: string };
          const toDelete = await prisma.headerComponent.findFirst({ where: { type: p.type, projectId } });
          if (toDelete) {
            await prisma.headerComponent.delete({ where: { id: toDelete.id } });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "reorder_header_components": {
          const p = action.payload as { order: { type: string; position: number }[] };
          const updatePromises = [];
          for (const item of p.order) {
            const comp = await prisma.headerComponent.findFirst({ where: { type: item.type, projectId } });
            if (comp) {
              updatePromises.push(
                prisma.headerComponent.update({
                  where: { id: comp.id },
                  data: { position: item.position },
                })
              );
            }
          }
          await Promise.all(updatePromises);
          
          // HARD VALIDATION: Verify positions actually changed in database
          let validated = true;
          for (const item of p.order) {
            const comp = await prisma.headerComponent.findFirst({ where: { type: item.type, projectId } });
            if (!comp || comp.position !== item.position) {
              validated = false;
              break;
            }
          }
          
          results.push({ 
            action: action.type, 
            success: true, 
            validated,
            error: validated ? undefined : "Position changes did not apply in database"
          });
          break;
        }

        case "set_primary_color": {
          const p = action.payload as { color: string };
          // Store primary color in appConfig table
          const existingColor = await prisma.appConfig.findFirst({ where: { key: "primaryColor", projectId } });
          if (existingColor) {
            await prisma.appConfig.update({
              where: { id: existingColor.id },
              data: { value: JSON.stringify({ color: p.color }) },
            });
          } else {
            await prisma.appConfig.create({
              data: { key: "primaryColor", value: JSON.stringify({ color: p.color }), projectId },
            });
          }
          results.push({ action: action.type, success: true });
          break;
        }

        case "update_page_component": {
          const p = action.payload as { id: string; configPath: string; value: unknown };
          const component = await prisma.pageComponent.findUnique({ where: { id: p.id } });
          if (!component) {
            results.push({ action: action.type, success: false, error: `Component with ID ${p.id} not found` });
            break;
          }
          const currentConfig = JSON.parse(component.config);
          
          // Support nested path updates using dot notation (e.g., "pagination.pageSize", "columns[0].header")
          const pathParts = p.configPath.split('.');
          let target = currentConfig;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
            
            if (arrayMatch) {
              const [, key, index] = arrayMatch;
              if (!target[key]) target[key] = [];
              if (!target[key][parseInt(index)]) target[key][parseInt(index)] = {};
              target = target[key][parseInt(index)];
            } else {
              if (!target[part]) target[part] = {};
              target = target[part];
            }
          }
          
          const lastPart = pathParts[pathParts.length - 1];
          const arrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
          
          if (arrayMatch) {
            const [, key, index] = arrayMatch;
            if (!target[key]) target[key] = [];
            target[key][parseInt(index)] = p.value;
          } else {
            target[lastPart] = p.value;
          }
          
          await prisma.pageComponent.update({
            where: { id: p.id },
            data: { config: JSON.stringify(currentConfig) },
          });
          
          // HARD VALIDATION: Verify config change actually applied
          const updatedComponent = await prisma.pageComponent.findUnique({ where: { id: p.id } });
          const updatedConfig = updatedComponent ? JSON.parse(updatedComponent.config) : null;
          let validated = false;
          
          if (updatedConfig) {
            // Navigate to the changed value using the same path logic
            const pathParts = p.configPath.split('.');
            let target = updatedConfig;
            
            for (let i = 0; i < pathParts.length - 1; i++) {
              const part = pathParts[i];
              const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
              if (arrayMatch) {
                const [, key, index] = arrayMatch;
                target = target[key]?.[parseInt(index)];
              } else {
                target = target[part];
              }
              if (!target) break;
            }
            
            if (target) {
              const lastPart = pathParts[pathParts.length - 1];
              const arrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/);
              const actualValue = arrayMatch 
                ? target[arrayMatch[1]]?.[parseInt(arrayMatch[2])]
                : target[lastPart];
              
              validated = JSON.stringify(actualValue) === JSON.stringify(p.value);
            }
          }
          
          results.push({ 
            action: action.type, 
            success: true,
            validated,
            error: validated ? undefined : `Config path '${p.configPath}' did not update to expected value`
          });
          break;
        }

        case "inject_styles": {
          const p = action.payload as { elementId: string; elementType: string; styles: string | Record<string, unknown> };
          // Store style injection in database for dev mode
          // elementType: "header_component", "sidebar_item", "page_component"
          // styles: Tailwind classes (string) OR inline CSS (JSON object)
          // SMART DETECTION: string = Tailwind classes (className), object = inline styles (style)
          
          if (p.elementType === "page_component") {
            const comp = await prisma.pageComponent.findUnique({ where: { id: p.elementId } });
            if (comp) {
              const currentConfig = JSON.parse(comp.config);
              
              // Detect if styles is a string (Tailwind) or object (inline styles)
              if (typeof p.styles === 'string') {
                // Try to parse as JSON first (for backward compatibility)
                try {
                  const parsed = JSON.parse(p.styles);
                  // It's a JSON object string - treat as inline styles
                  currentConfig.style = { ...(currentConfig.style || {}), ...parsed };
                } catch {
                  // It's a plain string - treat as Tailwind classes
                  // REPLACE className instead of appending to fix persistence bug
                  currentConfig.className = p.styles;
                }
              } else {
                // It's already an object - treat as inline styles
                currentConfig.style = { ...(currentConfig.style || {}), ...p.styles };
              }
              
              await prisma.pageComponent.update({
                where: { id: p.elementId },
                data: { config: JSON.stringify(currentConfig) },
              });
              
              // HARD VALIDATION: Verify style changes actually applied
              const updatedComp = await prisma.pageComponent.findUnique({ where: { id: p.elementId } });
              const updatedCfg = updatedComp ? JSON.parse(updatedComp.config) : null;
              let validated = false;
              
              if (updatedCfg) {
                if (typeof p.styles === 'string') {
                  // Check if Tailwind classes were set
                  try {
                    JSON.parse(p.styles);
                    validated = !!updatedCfg.style; // Was parsed as JSON, should be in style
                  } catch {
                    // For Tailwind classes, check if className was updated (not exact match due to potential class merging)
                    validated = updatedCfg.className === p.styles || updatedCfg.className?.includes(p.styles.split(' ')[0]) || false;
                  }
                } else {
                  // Check if inline styles were merged
                  const stylesObj = p.styles as Record<string, unknown>;
                  validated = Object.keys(stylesObj).every(key => 
                    updatedCfg.style?.[key] === stylesObj[key]
                  );
                }
              }
              
              results.push({ 
                action: action.type, 
                success: true,
                validated,
                error: validated ? undefined : `Styles did not apply to component ${p.elementId}`
              });
            } else {
              results.push({ action: action.type, success: false, error: `Page component ID ${p.elementId} not found` });
            }
          } else if (p.elementType === "header_component") {
            const comp = await prisma.headerComponent.findUnique({ where: { id: p.elementId } });
            if (comp) {
              const currentConfig = JSON.parse(comp.config);
              
              // Detect if styles is a string (Tailwind) or object (inline styles)
              if (typeof p.styles === 'string') {
                try {
                  const parsed = JSON.parse(p.styles);
                  currentConfig.style = { ...(currentConfig.style || {}), ...parsed };
                } catch {
                  // REPLACE className instead of appending to fix persistence bug
                  currentConfig.className = p.styles;
                }
              } else {
                currentConfig.style = { ...(currentConfig.style || {}), ...p.styles };
              }
              
              await prisma.headerComponent.update({
                where: { id: p.elementId },
                data: { config: JSON.stringify(currentConfig) },
              });
              results.push({ action: action.type, success: true });
            } else {
              results.push({ action: action.type, success: false, error: `Header component ID ${p.elementId} not found` });
            }
          } else if (p.elementType === "sidebar_item") {
            const item = await prisma.sidebarItem.findFirst({ where: { slug: p.elementId, projectId } });
            if (item) {
              const updates: Record<string, unknown> = {};
              if (typeof p.styles === 'string') {
                updates.className = p.styles;
              }
              if (Object.keys(updates).length > 0) {
                await prisma.sidebarItem.update({
                  where: { id: item.id },
                  data: updates,
                });
              }
              results.push({ action: action.type, success: true });
            } else {
              results.push({ action: action.type, success: false, error: `Sidebar item ${p.elementId} not found` });
            }
          } else {
            results.push({ action: action.type, success: false, error: `Unknown element type: ${p.elementType}` });
          }
          break;
        }

        case "move_page_component": {
          const p = action.payload as { id: string; targetId: string; position: "before" | "after" };
          const source = await prisma.pageComponent.findUnique({ where: { id: p.id } });
          const target = await prisma.pageComponent.findUnique({ where: { id: p.targetId } });
          if (!source) {
            results.push({ action: action.type, success: false, error: `Source component ${p.id} not found` });
            break;
          }
          if (!target) {
            results.push({ action: action.type, success: false, error: `Target component ${p.targetId} not found` });
            break;
          }
          const allComps = await prisma.pageComponent.findMany({
            where: { pageId: source.pageId },
            orderBy: { order: "asc" },
          });
          const filtered = allComps.filter((c) => c.id !== source.id);
          const targetIdx = filtered.findIndex((c) => c.id === p.targetId);
          const insertIdx = p.position === "before" ? targetIdx : targetIdx + 1;
          filtered.splice(insertIdx, 0, source);
          for (let i = 0; i < filtered.length; i++) {
            await prisma.pageComponent.update({
              where: { id: filtered[i].id },
              data: { order: i },
            });
          }
          const verify = await prisma.pageComponent.findUnique({ where: { id: source.id } });
          const validated = verify !== null && verify.order === insertIdx;
          results.push({ action: action.type, success: true, validated, error: validated ? undefined : "Move did not apply correctly" });
          break;
        }

        case "reorder_page_components": {
          const p = action.payload as { slug: string; componentOrder: { id: string; order: number }[] };
          const siForReorder = await prisma.sidebarItem.findFirst({
            where: { slug: p.slug, projectId },
            include: { page: true },
          });
          if (!siForReorder?.page) {
            results.push({ action: action.type, success: false, error: `Page not found for slug: ${p.slug}` });
            break;
          }
          for (const item of p.componentOrder) {
            await prisma.pageComponent.update({
              where: { id: item.id },
              data: { order: item.order },
            });
          }
          let validated = true;
          for (const item of p.componentOrder) {
            const comp = await prisma.pageComponent.findUnique({ where: { id: item.id } });
            if (!comp || comp.order !== item.order) {
              validated = false;
              break;
            }
          }
          results.push({ action: action.type, success: true, validated, error: validated ? undefined : "Reorder did not apply correctly" });
          break;
        }

        case "add_child_component": {
          const p = action.payload as {
            parentId: string;
            component: { type: string; config: Record<string, unknown>; order: number };
          };
          const parentComp = await prisma.pageComponent.findUnique({ where: { id: p.parentId } });
          if (!parentComp) {
            results.push({ action: action.type, success: false, error: `Parent component ${p.parentId} not found` });
            break;
          }

          // Add default visibility styles for empty containers
          const config = { ...p.component.config };
          if (p.component.type === 'container' && !config.children && !config.html && !config.className) {
            config.className = 'h-5 bg-gray-100 border border-gray-300';
          }

          const child = await prisma.pageComponent.create({
            data: {
              pageId: parentComp.pageId,
              parentId: p.parentId,
              type: p.component.type,
              config: JSON.stringify(config),
              order: p.component.order,
            },
          });
          const verifyChild = await prisma.pageComponent.findUnique({ where: { id: child.id } });
          const validated = verifyChild !== null && verifyChild.parentId === p.parentId;
          results.push({ action: action.type, success: true, id: child.id, validated, error: validated ? undefined : "Child component parentId mismatch" });
          break;
        }

        default:
          results.push({ action: action.type, success: false, error: "Unknown action type" });
      }
    } catch (err) {
      results.push({
        action: action.type,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function POST(req: Request) {
  try {
    const ctx = await getProjectContext(req);
    if (isErrorResponse(ctx)) return ctx;

    const body = await req.json();
    const { message, state, history } = body as {
      message: string;
      state: { sidebarItems: unknown[]; activePage: string | null; pageComponents: unknown[]; headerComponents: unknown[] };
      history: { role: string; content: string }[];
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "GROQ_API_KEY is not configured. Please add it to your .env file.", actions: [] },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: buildSystemPrompt(state) },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: AIResponse;
    try {
      parsed = JSON.parse(raw) as AIResponse;
    } catch {
      return NextResponse.json({
        message: "AI returned invalid JSON. Please try again.",
        actions: [],
        raw,
      });
    }

    const actions = normalizeActions((parsed as unknown as { actions?: unknown }).actions);
    if (actions.length === 0) {
      return NextResponse.json({
        message: parsed.message || "No actions generated.",
        actions: [],
      });
    }

    const results = await executeActions(actions, ctx.projectId);

    await prisma.chatMessage.create({
      data: { role: "user", content: message, projectId: ctx.projectId },
    });
    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: parsed.message || "",
        actions: JSON.stringify(actions),
        projectId: ctx.projectId,
      },
    });

    return NextResponse.json({
      message: parsed.message,
      actions,
      results,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Internal server error",
        actions: [],
      },
      { status: 500 }
    );
  }
}
