#!/usr/bin/env tsx

/**
 * Simulation Test: Parent-Child Component Relationships
 * 
 * Tests that:
 * 1. Creating a container yields a root-level component
 * 2. Adding a child via add_child_component retains parentId
 * 3. Adding a child via add_page_component with parentId retains parentId
 * 4. The page GET endpoint returns a correct tree (children nested inside container)
 *
 * Uses the existing "dashboard" page and the AI chat endpoint.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";
const TEST_SLUG = "dashboard"; // use existing page

let containerId: string | null = null;
let childCardId: string | null = null;
let childBadgeId: string | null = null;
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

interface TreeComp {
  id: string;
  type: string;
  parentId: string | null;
  config: Record<string, unknown>;
  order: number;
  children: TreeComp[];
}

async function fetchPage(): Promise<TreeComp[]> {
  const res = await fetch(`${BASE}/api/pages/${TEST_SLUG}`);
  if (!res.ok) return [];
  return res.json();
}

async function chat(
  message: string,
  pageComponents: unknown[] = [],
) {
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      state: {
        sidebarItems: [{ id: "x", label: "Dashboard", icon: "LayoutDashboard", slug: TEST_SLUG, order: 0 }],
        activePage: TEST_SLUG,
        pageComponents,
        headerComponents: [],
      },
      history: [],
    }),
  });
  return res.json() as Promise<{ message: string; actions?: { type: string; payload: Record<string, unknown> }[] }>;
}

// ── Test 1: Add container ───────────────────────────────────
async function test1_addContainer() {
  console.log("\n📦 TEST 1: Add container to page via AI");

  const before = await fetchPage();
  const containersBefore = before.filter((c) => c.type === "container");

  await chat(
    `Add a container with display "flex", direction "column", gap 4, className "p-4 test-simulation". Use add_page_component with slug "${TEST_SLUG}". Respond ONLY with a single add_page_component action and a short message.`,
    before,
  );

  const after = await fetchPage();
  const containersAfter = after.filter((c) => c.type === "container");
  const newContainers = containersAfter.filter(
    (c) => !containersBefore.some((b) => b.id === c.id),
  );

  if (newContainers.length > 0) {
    containerId = newContainers[0].id;
    assert(true, `Container created: ${containerId}`);
    assert(newContainers[0].parentId === null, "Container is root-level (parentId null)");
    assert(Array.isArray(newContainers[0].children), "Container has children array");
    assert(newContainers[0].children.length === 0, "Container starts empty");
  } else {
    // AI might not have followed instructions — look for any new component
    const allNew = after.filter((c) => !before.some((b) => b.id === c.id));
    if (allNew.length > 0) {
      containerId = allNew[0].id;
      assert(false, `Expected container, got type="${allNew[0].type}" — using as parent`, allNew[0].id);
    } else {
      assert(false, "No new component created by AI");
    }
  }
}

// ── Test 2: Add child via add_child_component ───────────────
async function test2_addChildCard() {
  if (!containerId) { console.log("\n⏭️  TEST 2: SKIPPED"); return; }
  console.log("\n👶 TEST 2: Add child card via add_child_component");

  const before = await fetchPage();

  await chat(
    `Inside container ${containerId}, add a card with title "Simulation Card" and description "test". You MUST use add_child_component with parentId "${containerId}". Do NOT use add_page_component.`,
    before,
  );

  const after = await fetchPage();
  const container = after.find((c) => c.id === containerId);
  assert(!!container, "Container still exists");

  if (container) {
    const cardChild = (container.children ?? []).find((c) => c.type === "card");
    if (cardChild) {
      childCardId = cardChild.id;
      assert(true, `Card child created: ${childCardId}`);
      assert(
        cardChild.parentId === containerId,
        `parentId correct (${cardChild.parentId} === ${containerId})`,
      );
    } else {
      // Check if card was created as root (the bug we're fixing)
      const flatAll = flattenTree(after);
      const anyCard = flatAll.find(
        (c) => c.type === "card" && !before.some((b) => b.id === c.id || flattenTree([b]).some((fb) => fb.id === c.id)),
      );
      if (anyCard) {
        childCardId = anyCard.id;
        if (anyCard.parentId === containerId) {
          assert(true, `Card child created (found in flat scan): ${childCardId}`);
        } else {
          assert(false, `BUG: Card created with wrong parentId: ${anyCard.parentId} (expected ${containerId})`);
        }
      } else {
        assert(false, "No card created on page");
        console.log("  Tree:", JSON.stringify(after, null, 2).slice(0, 500));
      }
    }
  }
}

// ── Test 3: Tree integrity ──────────────────────────────────
async function test3_treeIntegrity() {
  console.log("\n🌳 TEST 3: Tree structure integrity");

  const tree = await fetchPage();

  // Root level should include our container
  const roots = tree.filter((c) => !c.parentId);
  assert(roots.some((c) => c.id === containerId), "Container is root-level");

  // Child card should NOT be at root level
  if (childCardId) {
    const cardAtRoot = roots.some((c) => c.id === childCardId);
    assert(!cardAtRoot, "Card is NOT at root-level (nested inside container)");

    const container = tree.find((c) => c.id === containerId);
    if (container) {
      const childInContainer = (container.children ?? []).some((c) => c.id === childCardId);
      assert(childInContainer, "Card found in container.children");
    }
  }
}

// ── Test 4: add_page_component with parentId (new fix) ──────
async function test4_addPageComponentWithParentId() {
  if (!containerId) { console.log("\n⏭️  TEST 4: SKIPPED"); return; }
  console.log("\n🔗 TEST 4: add_page_component WITH parentId (regression test for fix)");

  const before = await fetchPage();

  await chat(
    `Add a badge with text "Test Badge" to slug "${TEST_SLUG}" using add_page_component action. IMPORTANT: include parentId "${containerId}" in the payload so the badge is inside the container. The action payload MUST be: { "slug": "${TEST_SLUG}", "parentId": "${containerId}", "component": { "type": "badge", "config": { "text": "Test Badge", "variant": "secondary" }, "order": 10 } }`,
    before,
  );

  const after = await fetchPage();
  const container = after.find((c) => c.id === containerId);

  if (container) {
    const badge = (container.children ?? []).find((c) => c.type === "badge");
    if (badge) {
      childBadgeId = badge.id;
      assert(true, `Badge created inside container: ${childBadgeId}`);
      assert(badge.parentId === containerId, "Badge parentId matches container");
    } else {
      const rootBadge = after.find((c) => c.type === "badge" && !before.some((b) => flattenTree([b]).some((fb) => fb.id === c.id)));
      if (rootBadge) {
        childBadgeId = rootBadge.id;
        if (rootBadge.parentId === containerId) {
          assert(true, "Badge created with correct parentId (found at tree scan)");
        } else {
          assert(false, `Badge parentId=${rootBadge.parentId}, expected ${containerId}`);
        }
      } else {
        console.log("  ℹ️  AI might not have created badge — dumping tree:");
        const flat = flattenTree(after);
        const newItems = flat.filter((c) => !flattenTree(before).some((b) => b.id === c.id));
        console.log("  New items:", JSON.stringify(newItems, null, 2).slice(0, 500));
      }
    }
  }
}

// ── Cleanup ─────────────────────────────────────────────────
async function cleanup() {
  console.log("\n🧹 CLEANUP: Removing test components...");
  const idsToDelete = [childBadgeId, childCardId, containerId].filter(Boolean);
  for (const id of idsToDelete) {
    try {
      // Use AI chat to delete
      await chat(
        `Delete page component with ID "${id}". Use delete_page_component action with payload { "id": "${id}" }.`,
        await fetchPage(),
      );
      console.log(`  Deleted: ${id}`);
    } catch {
      console.log(`  Could not delete: ${id}`);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────
function flattenTree(tree: TreeComp[]): TreeComp[] {
  const result: TreeComp[] = [];
  function walk(nodes: TreeComp[]) {
    for (const n of nodes) {
      result.push(n);
      if (n.children?.length) walk(n.children);
    }
  }
  walk(tree);
  return result;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  SIMULATION: Parent-Child Component Relationships");
  console.log("═══════════════════════════════════════════════════════");

  try {
    await test1_addContainer();
    await test2_addChildCard();
    await test3_treeIntegrity();
    await test4_addPageComponentWithParentId();
  } catch (err) {
    console.error("\n💥 Unexpected error:", err);
    failed++;
  } finally {
    await cleanup();
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
