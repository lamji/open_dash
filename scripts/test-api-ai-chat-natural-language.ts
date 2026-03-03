/**
 * API Test: /api/ai/chat - Natural Language Command Translation
 * 
 * Tests that natural language commands like "add div parent with bg gray"
 * are properly translated to database actions instead of returning empty
 * actions array with success messages.
 */

const BASE_URL = "http://localhost:3000";

interface ChatResponse {
  message: string;
  actions: Array<{ type: string; payload: unknown }>;
  results?: Array<{ action: string; success: boolean; validated?: boolean; error?: string }>;
}

async function testNaturalLanguageCommands() {
  console.log("🧪 Testing AI Chat Natural Language Command Translation\n");

  // Get initial state
  const [sidebar, page, header] = await Promise.all([
    fetch(`${BASE_URL}/api/sidebar`).then(r => r.json()),
    fetch(`${BASE_URL}/api/pages/dashboard`).then(r => r.json()),
    fetch(`${BASE_URL}/api/header-components`).then(r => r.json()),
  ]);

  const state = {
    sidebarItems: sidebar,
    activePage: "dashboard",
    pageComponents: page,
    headerComponents: header,
  };

  // Test 1: "add div parent with bg gray"
  console.log("Test 1: 'add div parent with bg gray'");
  const test1 = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "add div parent with bg gray",
      state,
      history: [],
    }),
  });

  const result1: ChatResponse = await test1.json();
  console.log(`  Message: ${result1.message}`);
  console.log(`  Actions count: ${result1.actions.length}`);
  
  if (result1.actions.length === 0) {
    console.log("  ❌ FAIL: No actions generated (bug not fixed)");
    process.exit(1);
  }
  
  const hasContainerAction = result1.actions.some(a => 
    a.type === "add_page_component" && 
    (a.payload as { component?: { type?: string } }).component?.type === "container"
  );
  
  if (!hasContainerAction) {
    console.log("  ❌ FAIL: No container action found");
    console.log(`  Actions: ${JSON.stringify(result1.actions, null, 2)}`);
    process.exit(1);
  }
  
  console.log("  ✅ PASS: Container action generated");

  // Wait for DB commit
  await new Promise(r => setTimeout(r, 500));

  // Get updated page state
  const updatedPage = await fetch(`${BASE_URL}/api/pages/dashboard`).then(r => r.json()) as Array<{ id: string; type: string }>;
  const container = updatedPage.find((c) => c.type === "container");
  
  if (!container) {
    console.log("  ❌ FAIL: Container not found in database");
    process.exit(1);
  }
  
  console.log(`  ✅ PASS: Container created in database (ID: ${container.id.slice(0, 8)})`);

  // Test 2: "add typography Dashboard inside container"
  console.log(`\nTest 2: 'add typography Dashboard inside container ${container.id.slice(0, 8)}'`);
  const test2 = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `add typography Dashboard inside container ${container.id}`,
      state: {
        ...state,
        pageComponents: updatedPage,
      },
      history: [],
    }),
  });

  const result2: ChatResponse = await test2.json();
  console.log(`  Message: ${result2.message}`);
  console.log(`  Actions count: ${result2.actions.length}`);
  
  if (result2.actions.length === 0) {
    console.log("  ❌ FAIL: No actions generated (BUG NOT FIXED)");
    process.exit(1);
  }
  
  console.log("  ✅ PASS: Actions generated (bug fixed - AI no longer returns empty actions)");

  const hasComponentAction = result2.actions.some(a => 
    a.type === "add_page_component" || 
    a.type === "add_child_component" ||
    a.type === "add_header_component"
  );
  
  if (!hasComponentAction) {
    console.log("  ❌ FAIL: No component creation action found");
    console.log(`  Actions: ${JSON.stringify(result2.actions, null, 2)}`);
    process.exit(1);
  }
  
  console.log("  ✅ PASS: Component action generated");

  // Test 3: "add padding 10 px here [container-id]"
  console.log(`\nTest 3: 'add padding 10 px here ${container.id.slice(0, 8)}'`);
  
  // Get latest page state
  const updatedPage2 = await fetch(`${BASE_URL}/api/pages/dashboard`).then(r => r.json());
  
  const test3 = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `add padding 10 px here ${container.id}`,
      state: {
        ...state,
        pageComponents: updatedPage2,
      },
      history: [],
    }),
  });

  const result3: ChatResponse = await test3.json();
  console.log(`  Message: ${result3.message}`);
  console.log(`  Actions count: ${result3.actions.length}`);
  
  if (result3.actions.length === 0) {
    console.log("  ❌ FAIL: No actions generated");
    process.exit(1);
  }
  
  const hasInjectStylesAction = result3.actions.some(a => a.type === "inject_styles");
  
  if (!hasInjectStylesAction) {
    console.log("  ❌ FAIL: No inject_styles action found");
    console.log(`  Actions: ${JSON.stringify(result3.actions, null, 2)}`);
    process.exit(1);
  }
  
  console.log("  ✅ PASS: inject_styles action generated");

  console.log("\n✅ All tests passed! Natural language commands are properly translated to actions.");
  process.exit(0);
}

testNaturalLanguageCommands().catch(err => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
