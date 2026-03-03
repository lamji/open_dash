#!/usr/bin/env tsx

/**
 * Complex UI Simulation: Replicate Veritas Analytics Dashboard
 * 
 * Sends all commands through the AI chat endpoint.
 * Everything persisted to DB — no hardcoding.
 */

const BASE2 = process.env.BASE_URL || "http://localhost:3000";
const SLUG = "dashboard";

let stepNum = 0;

function log(msg: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  STEP ${++stepNum}: ${msg}`);
  console.log("─".repeat(60));
}

async function fetchPage() {
  const res = await fetch(`${BASE}/api/pages/${SLUG}`);
  return res.json();
}

async function fetchSidebar() {
  const res = await fetch(`${BASE}/api/sidebar`);
  return res.json();
}

async function fetchHeader() {
  const res = await fetch(`${BASE}/api/header-components`);
  return res.json();
}

async function chat(message: string) {
  const [sidebar, page, header] = await Promise.all([
    fetchSidebar(),
    fetchPage(),
    fetchHeader(),
  ]);

  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      state: {
        sidebarItems: sidebar,
        activePage: SLUG,
        pageComponents: page,
        headerComponents: header,
      },
      history: [],
    }),
  });

  const data = await res.json();
  const actionCount = data.actions?.length ?? 0;
  console.log(`  AI: ${data.message?.slice(0, 120) ?? "(no message)"}`);
  console.log(`  Actions: ${actionCount}`);
  if (data.actions) {
    for (const a of data.actions) {
      console.log(`    → ${a.type}`);
    }
  }
  
  // Small delay to let DB settle
  await new Promise((r) => setTimeout(r, 300));
  return data;
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  SIMULATION: Veritas Analytics Dashboard                ║");
  console.log("║  Everything through AI chat → persisted to DB           ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // ── Step 1: Clean dashboard page ─────────────────────────────
  log("Clear existing dashboard components");
  await chat(
    `Clear the dashboard page completely. Use set_page_components with slug "dashboard" and an empty components array []. This removes all existing components so we start fresh.`
  );

  // ── Step 2: Setup sidebar ────────────────────────────────────
  log("Update sidebar: rename Client→Users, add Accounts, Statistics, Settings, Log Out");
  await chat(
    `I need to update the sidebar to match this structure:
1. Dashboard (already exists, slug "dashboard", icon "LayoutDashboard", order 1)
2. Users (rename "Client" to "Users", slug "client", icon "Users", order 2)  
3. Accounts (new, slug "accounts", icon "CreditCard", order 3)
4. Statistics (new, slug "statistics", icon "BarChart3", order 4)

Also delete "Test Navigation" sidebar item.

Execute these actions:
- update_sidebar_item: slug "client", updates { label: "Users", icon: "Users" }
- create_sidebar_item: { label: "Accounts", icon: "CreditCard", slug: "accounts", order: 3 }
- create_sidebar_item: { label: "Statistics", icon: "BarChart3", slug: "statistics", order: 4 }
- delete_sidebar_item: { slug: "test-navigation" }`
  );

  // ── Step 3: Add Settings and Log Out ─────────────────────────
  log("Add Settings and Log Out sidebar items");
  await chat(
    `Add two more sidebar items at the bottom:
- create_sidebar_item: { label: "Settings", icon: "Settings", slug: "settings", order: 10 }
- create_sidebar_item: { label: "Log Out", icon: "LogOut", slug: "log-out", order: 11 }`
  );

  // ── Step 4: Set logo ─────────────────────────────────────────
  log("Set logo to Veritas with Shield icon");
  await chat(
    `Update the logo. Use update_config with key "logo" and value { "text": "Veritas", "icon": "Shield" }.`
  );

  // ── Step 5: Set header title ─────────────────────────────────
  log("Set header title to Analytics");
  await chat(
    `Update the header title. Use update_config with key "header" and value { "title": "Analytics", "subtitle": "" }.`
  );

  // ── Step 6: Analytics cards row (4 stat cards) ───────────────
  log("Add analytics stat cards (Team Payments, Savings, Income Statistics, Best Plan)");
  await chat(
    `Add an analytics-cards component to the dashboard page with slug "dashboard". Use add_page_component.

The component should be:
{
  "type": "analytics-cards",
  "config": {
    "columns": 4,
    "cards": [
      {
        "title": "Team Payments",
        "value": "25+",
        "description": "07 Dec approval",
        "icon": "Bell",
        "trend": "up"
      },
      {
        "title": "Savings",
        "value": "$5,839",
        "change": "-11%",
        "description": "last week",
        "icon": "TrendingUp",
        "trend": "down"
      },
      {
        "title": "Income statistics",
        "value": "+8%",
        "description": "15% · 21% · 32%",
        "icon": "BarChart3",
        "trend": "up"
      },
      {
        "title": "$95.9",
        "value": "Per Month",
        "description": "Choose Best Plan For You!",
        "icon": "Star",
        "trend": "up"
      }
    ]
  },
  "order": 0
}`
  );

  // ── Step 7: Recently Payments section heading ────────────────
  log("Add 'Recently Payments' heading");
  await chat(
    `Add a typography component for the section heading. Use add_page_component with slug "dashboard".
{
  "type": "typography",
  "config": {
    "variant": "h3",
    "text": "Recently Payments",
    "className": "mt-6 mb-4"
  },
  "order": 1
}`
  );

  // ── Step 8: Recently Payments container + 2 payment cards ────
  log("Add Recently Payments container with 2 payment cards");
  await chat(
    `Add a container component to the dashboard page "dashboard" for the recent payments row.
Use add_page_component with slug "dashboard":
{
  "type": "container",
  "config": {
    "display": "grid",
    "columns": 2,
    "gap": 4,
    "className": "mb-6"
  },
  "order": 2
}`
  );

  // Wait and get container ID
  await new Promise((r) => setTimeout(r, 500));
  const pageAfterContainer = await fetchPage();
  const containers = pageAfterContainer.filter((c: { type: string; order: number }) => c.type === "container");
  const paymentContainer = containers.find((c: { order: number }) => c.order === 2) ?? containers[containers.length - 1];
  
  if (paymentContainer) {
    const cid = paymentContainer.id;
    console.log(`  Found payment container: ${cid}`);

    // Add first payment card
    log("Add payment card 1: Emma Ryan Jr.");
    await chat(
      `Add a card inside container ${cid}. Use add_child_component with parentId "${cid}":
{
  "type": "card",
  "config": {
    "title": "Emma Ryan Jr.",
    "description": "Mar 9, 2023",
    "content": "$4,823",
    "footer": "Done",
    "className": "border border-dashed"
  },
  "order": 0
}`
    );

    // Add second payment card
    log("Add payment card 2: Justin Weber");
    await chat(
      `Add another card inside container ${cid}. Use add_child_component with parentId "${cid}":
{
  "type": "card",
  "config": {
    "title": "Justin Weber",
    "description": "Mar 2, 2023",
    "content": "$3,937",
    "footer": "Pending",
    "className": "border border-dashed"
  },
  "order": 1
}`
    );
  } else {
    console.log("  ⚠️  Could not find payment container — skipping children");
  }

  // ── Step 9: Transactions table ───────────────────────────────
  log("Add Transactions table");
  await chat(
    `Add a table component to the dashboard page "dashboard". Use add_page_component with slug "dashboard":
{
  "type": "table",
  "config": {
    "title": "Transactions",
    "searchable": true,
    "pagination": { "enabled": true, "pageSize": 5 },
    "columns": [
      { "accessorKey": "receiver", "header": "Receiver", "sortable": true },
      { "accessorKey": "type", "header": "Type", "sortable": true },
      { "accessorKey": "status", "header": "Status", "columnType": "status", "statusOptions": [
        { "value": "Pending", "label": "Pending", "variant": "outline" },
        { "value": "Done", "label": "Done", "variant": "default" }
      ]},
      { "accessorKey": "date", "header": "Date", "sortable": true },
      { "accessorKey": "amount", "header": "Amount", "sortable": true },
      { "accessorKey": "actions", "header": "", "columnType": "actions", "actions": [
        { "id": "details", "label": "Details" },
        { "id": "edit", "label": "Edit" },
        { "id": "delete", "label": "Delete", "variant": "destructive" }
      ]}
    ],
    "data": [
      { "receiver": "Emma Ryan Jr.", "type": "Salary", "status": "Pending", "date": "Feb 19th, 2023", "amount": "$3,892" },
      { "receiver": "Adrian Daren", "type": "Bonus", "status": "Done", "date": "Feb 18th, 2023", "amount": "$1,073" },
      { "receiver": "Roxanne Hills", "type": "Salary", "status": "Done", "date": "Apr 16th, 2023", "amount": "$2,790" },
      { "receiver": "Marcus Johnson", "type": "Salary", "status": "Done", "date": "Mar 22nd, 2023", "amount": "$4,150" },
      { "receiver": "Sarah Chen", "type": "Commission", "status": "Pending", "date": "May 1st, 2023", "amount": "$1,825" },
      { "receiver": "David Kim", "type": "Bonus", "status": "Done", "date": "Jan 30th, 2023", "amount": "$3,400" },
      { "receiver": "Lisa Park", "type": "Salary", "status": "Pending", "date": "Apr 5th, 2023", "amount": "$2,950" }
    ]
  },
  "order": 3
}`
  );

  // ── Step 10: Set primary color to teal/green ─────────────────
  log("Set primary color to match Veritas teal theme");
  await chat(
    `Set the primary color to a teal/green that matches the Veritas dashboard design. Use set_primary_color with payload { "color": "#0d9488" }.`
  );

  // ── Final verification ───────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  VERIFICATION: Final page state");
  console.log("═".repeat(60));
  
  const finalPage = await fetchPage();
  const finalSidebar = await fetchSidebar();
  const finalHeader = await fetchHeader();

  console.log(`\n  Sidebar items: ${finalSidebar.length}`);
  for (const s of finalSidebar) {
    console.log(`    • ${s.label} (${s.slug}) [${s.icon}]`);
  }

  console.log(`\n  Header components: ${finalHeader.length}`);
  for (const h of finalHeader) {
    console.log(`    • ${h.type} (pos: ${h.position})`);
  }

  console.log(`\n  Page components (root): ${finalPage.length}`);
  let totalChildren = 0;
  for (const c of finalPage) {
    const childCount = c.children?.length ?? 0;
    totalChildren += childCount;
    console.log(`    • ${c.type} (order: ${c.order})${childCount > 0 ? ` [${childCount} children]` : ""}`);
    if (c.children) {
      for (const child of c.children) {
        console.log(`      └─ ${child.type} (order: ${child.order})`);
      }
    }
  }

  console.log(`\n  Total components: ${finalPage.length} root + ${totalChildren} children = ${finalPage.length + totalChildren}`);

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  ✅ SIMULATION COMPLETE — All data saved to DB          ║");
  console.log("║  Open http://localhost:3000 to see the UI               ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
