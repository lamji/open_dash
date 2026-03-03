#!/usr/bin/env tsx

/**
 * Simulation: Replicate the 4 stat cards from the Veritas dashboard.
 * Flattened structure — each card is a level-2 container with flat children.
 * Avoids depth 4+ nesting for AI reliability.
 */

const URL_BASE = process.env.BASE_URL || "http://localhost:3000";
const PAGE_SLUG = "dashboard";
let stepN = 0;

function log(msg: string) {
  console.log(`\n${"─".repeat(56)}`);
  console.log(`  STEP ${++stepN}: ${msg}`);
  console.log("─".repeat(56));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage() {
  const r = await fetch(`${URL_BASE}/api/pages/${PAGE_SLUG}`);
  return r.json();
}
async function fetchSidebar() {
  const r = await fetch(`${URL_BASE}/api/sidebar`);
  return r.json();
}
async function fetchHeader() {
  const r = await fetch(`${URL_BASE}/api/header-components`);
  return r.json();
}

async function chat(message: string) {
  const [sidebar, page, header] = await Promise.all([fetchSidebar(), fetchPage(), fetchHeader()]);
  const r = await fetch(`${URL_BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      state: { sidebarItems: sidebar, activePage: PAGE_SLUG, pageComponents: page, headerComponents: header },
      history: [],
    }),
  });
  const d = await r.json();
  const actions = d.actions ?? [];
  console.log(`  AI: ${(d.message ?? "").slice(0, 80)} | actions: ${actions.length}`);
  for (const a of actions) console.log(`    → ${a.type}`);
  await delay(300);
  return d;
}

interface TC { id: string; type: string; order: number; children?: TC[] }

function flattenTree(tree: TC[]): TC[] {
  const r: TC[] = [];
  function walk(n: TC[]) { for (const c of n) { r.push(c); if (c.children?.length) walk(c.children); } }
  walk(tree);
  return r;
}

async function findChildOfParent(parentId: string, type?: string, order?: number): Promise<string | null> {
  const page = await fetchPage();
  const flat = flattenTree(page);
  const parent = flat.find((c) => c.id === parentId);
  if (!parent?.children) return null;
  let children = parent.children;
  if (type) children = children.filter((c) => c.type === type);
  if (order !== undefined) {
    const m = children.find((c) => c.order === order);
    return m?.id ?? null;
  }
  return children.length > 0 ? children[children.length - 1].id : null;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║  SIMULATION: 4 Stat Cards — Veritas Dashboard         ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  // ── Clear page ───────────────────────────────────────────────
  log("Clear dashboard");
  await chat(`Clear the dashboard page completely. Use set_page_components with slug "dashboard" and components [].`);

  // ── Outer grid ───────────────────────────────────────────────
  log("Outer 4-col grid container");
  await chat(
    `Add a container to "dashboard". Use add_page_component with slug "dashboard":
{ "type": "container", "config": { "display": "grid", "columns": 4, "gap": 6, "className": "w-full" }, "order": 0 }`
  );
  const page = await fetchPage();
  const outerGrid = page.find((c: TC) => c.type === "container")?.id;
  if (!outerGrid) { console.error("❌ Grid not found"); return; }
  console.log(`  Grid: ${outerGrid}`);

  // ════════════════════════════════════════════════════════════
  // CARD 1: Team Payments — flat children
  // ════════════════════════════════════════════════════════════
  log("Card 1 container");
  await chat(
    `Add a child container inside ${outerGrid}. Use add_child_component parentId "${outerGrid}":
{ "type": "container", "config": { "display": "flex", "direction": "column", "gap": 3, "className": "rounded-2xl border-2 border-dashed border-gray-200 p-5 bg-white" }, "order": 0 }`
  );
  const card1 = await findChildOfParent(outerGrid, "container", 0);
  if (!card1) { console.error("❌ Card1 missing"); return; }
  console.log(`  Card1: ${card1}`);

  log("Card 1 content: title + approval + avatars");
  await chat(
    `Add 3 children inside container ${card1}. Use add_child_component parentId "${card1}" for EACH:

Action 1: { "type": "add_child_component", "payload": { "parentId": "${card1}", "component": { "type": "typography", "config": { "variant": "h4", "text": "Team Payments", "className": "font-bold text-lg" }, "order": 0 } } }
Action 2: { "type": "add_child_component", "payload": { "parentId": "${card1}", "component": { "type": "typography", "config": { "variant": "small", "text": "📅 07 Dec approval", "className": "text-muted-foreground text-sm" }, "order": 1 } } }
Action 3: { "type": "add_child_component", "payload": { "parentId": "${card1}", "component": { "type": "typography", "config": { "variant": "p", "text": "👤👤👤 25+", "className": "text-sm font-semibold text-muted-foreground mt-auto pt-4" }, "order": 2 } } }

Send ALL 3 actions.`
  );

  // ════════════════════════════════════════════════════════════
  // CARD 2: Savings — flat children
  // ════════════════════════════════════════════════════════════
  log("Card 2 container");
  await chat(
    `Add a child container inside ${outerGrid}. Use add_child_component parentId "${outerGrid}":
{ "type": "container", "config": { "display": "flex", "direction": "column", "gap": 2, "className": "rounded-2xl border-2 border-dashed border-gray-200 p-5 bg-white" }, "order": 1 }`
  );
  const card2 = await findChildOfParent(outerGrid, "container", 1);
  if (!card2) { console.error("❌ Card2 missing"); return; }
  console.log(`  Card2: ${card2}`);

  log("Card 2 content: title, chart, amount, trend");
  await chat(
    `Add 4 children inside container ${card2}. Use add_child_component parentId "${card2}" for EACH:

Action 1: { "type": "add_child_component", "payload": { "parentId": "${card2}", "component": { "type": "typography", "config": { "variant": "p", "text": "📈 Savings", "className": "font-semibold text-base" }, "order": 0 } } }
Action 2: { "type": "add_child_component", "payload": { "parentId": "${card2}", "component": { "type": "chart-line", "config": { "title": "", "xKey": "m", "lines": [{"dataKey":"v","label":"","color":"#0d9488"}], "data": [{"m":"J","v":20},{"m":"F","v":35},{"m":"M","v":25},{"m":"A","v":40},{"m":"M2","v":30},{"m":"J2","v":45}] }, "order": 1 } } }
Action 3: { "type": "add_child_component", "payload": { "parentId": "${card2}", "component": { "type": "typography", "config": { "variant": "h3", "text": "$5,839", "className": "font-bold text-2xl" }, "order": 2 } } }
Action 4: { "type": "add_child_component", "payload": { "parentId": "${card2}", "component": { "type": "typography", "config": { "variant": "small", "text": "🔻 -11% last week", "className": "text-red-500 text-xs" }, "order": 3 } } }

Send ALL 4 actions.`
  );

  // ════════════════════════════════════════════════════════════
  // CARD 3: Income Statistics — flat children
  // ════════════════════════════════════════════════════════════
  log("Card 3 container");
  await chat(
    `Add a child container inside ${outerGrid}. Use add_child_component parentId "${outerGrid}":
{ "type": "container", "config": { "display": "flex", "direction": "column", "gap": 2, "className": "rounded-2xl border-2 border-dashed border-gray-200 p-5 bg-white" }, "order": 2 }`
  );
  const card3 = await findChildOfParent(outerGrid, "container", 2);
  if (!card3) { console.error("❌ Card3 missing"); return; }
  console.log(`  Card3: ${card3}`);

  log("Card 3 content: title + badge + bar chart");
  await chat(
    `Add 3 children inside container ${card3}. Use add_child_component parentId "${card3}" for EACH:

Action 1: { "type": "add_child_component", "payload": { "parentId": "${card3}", "component": { "type": "typography", "config": { "variant": "p", "text": "Income statistics", "className": "font-semibold text-base" }, "order": 0 } } }
Action 2: { "type": "add_child_component", "payload": { "parentId": "${card3}", "component": { "type": "badge", "config": { "text": "+8%", "variant": "outline", "className": "w-fit text-green-600 border-green-300 bg-green-50 text-xs" }, "order": 1 } } }
Action 3: { "type": "add_child_component", "payload": { "parentId": "${card3}", "component": { "type": "chart-bar", "config": { "title": "", "xKey": "q", "bars": [{"dataKey":"pct","label":"","color":"#f59e0b"},{"dataKey":"pct2","label":"","color":"#0d9488"},{"dataKey":"pct3","label":"","color":"#ec4899"}], "data": [{"q":"15%","pct":15,"pct2":0,"pct3":0},{"q":"21%","pct":0,"pct2":21,"pct3":0},{"q":"32%","pct":0,"pct2":0,"pct3":32}] }, "order": 2 } } }

Send ALL 3 actions.`
  );

  // ════════════════════════════════════════════════════════════
  // CARD 4: Best Plan — flat children + button row
  // ════════════════════════════════════════════════════════════
  log("Card 4 container (gradient)");
  await chat(
    `Add a child container inside ${outerGrid}. Use add_child_component parentId "${outerGrid}":
{ "type": "container", "config": { "display": "flex", "direction": "column", "gap": 2, "justify": "between", "className": "rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 p-5 text-white" }, "order": 3 }`
  );
  const card4 = await findChildOfParent(outerGrid, "container", 3);
  if (!card4) { console.error("❌ Card4 missing"); return; }
  console.log(`  Card4: ${card4}`);

  log("Card 4 content: price + subtitle + tagline");
  await chat(
    `Add 3 typography children inside ${card4}. Use add_child_component parentId "${card4}" for EACH:

Action 1: { "type": "add_child_component", "payload": { "parentId": "${card4}", "component": { "type": "typography", "config": { "variant": "h2", "text": "$95.9", "className": "font-bold text-3xl text-white" }, "order": 0 } } }
Action 2: { "type": "add_child_component", "payload": { "parentId": "${card4}", "component": { "type": "typography", "config": { "variant": "small", "text": "Per Month", "className": "text-white/80 text-sm" }, "order": 1 } } }
Action 3: { "type": "add_child_component", "payload": { "parentId": "${card4}", "component": { "type": "typography", "config": { "variant": "p", "text": "Choose Best Plan For You!", "className": "text-white font-medium text-sm mt-2" }, "order": 2 } } }

Send ALL 3 actions.`
  );

  log("Card 4 buttons");
  await chat(
    `Add 2 button children inside ${card4}. Use add_child_component parentId "${card4}" for EACH:

Action 1: { "type": "add_child_component", "payload": { "parentId": "${card4}", "component": { "type": "button", "config": { "label": "Details", "variant": "outline", "size": "sm", "className": "rounded-full border-white text-white hover:bg-white/20 mt-auto" }, "order": 3 } } }
Action 2: { "type": "add_child_component", "payload": { "parentId": "${card4}", "component": { "type": "button", "config": { "label": "Upgrade", "variant": "default", "size": "sm", "className": "rounded-full bg-gray-900 text-white hover:bg-gray-800 mt-auto" }, "order": 4 } } }

Send ALL 2 actions.`
  );

  // ── VERIFICATION ─────────────────────────────────────────────
  console.log("\n" + "═".repeat(56));
  console.log("  VERIFICATION");
  console.log("═".repeat(56));

  const finalPage = await fetchPage();

  function countAll(nodes: TC[]): number {
    let n = nodes.length;
    for (const c of nodes) if (c.children?.length) n += countAll(c.children);
    return n;
  }

  function printTree(nodes: TC[], indent = 0) {
    for (const c of nodes) {
      const pre = " ".repeat(indent * 2) + (indent > 0 ? "└─ " : "• ");
      console.log(`  ${pre}${c.type} (order:${c.order})${c.children?.length ? ` [${c.children.length} ch]` : ""}`);
      if (c.children?.length) printTree(c.children, indent + 1);
    }
  }

  const total = countAll(finalPage);
  console.log(`\n  Total components: ${total}`);
  printTree(finalPage);

  // Check that each card has children
  const grid = finalPage[0];
  if (grid?.children) {
    for (let i = 0; i < grid.children.length; i++) {
      const card = grid.children[i];
      const childCount = card.children?.length ?? 0;
      const ok = childCount > 0 ? "✅" : "❌";
      console.log(`  ${ok} Card ${i+1}: ${childCount} children`);
    }
  }

  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  ✅ CARDS SIMULATION COMPLETE                         ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
}

main().catch((err) => { console.error("💥", err); process.exit(1); });
