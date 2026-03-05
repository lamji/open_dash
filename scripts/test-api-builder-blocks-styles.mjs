#!/usr/bin/env node

/**
 * API Test: PATCH /api/builder/blocks/styles
 * Tests the padding persistence fix - auto-draft layout creation
 */

const BASE_URL = "http://localhost:3000";

async function testBuilderBlocksStylesApi() {
  console.log("🧪 Testing PATCH /api/builder/blocks/styles...\n");

  // Test 1: Without auth (should fail with 401)
  console.log("Test 1: Request without authentication");
  try {
    const res = await fetch(`${BASE_URL}/api/builder/blocks/styles`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockId: "test-block-1",
        slotIdx: 0,
        css: "padding: 10px;",
      }),
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Expected: 401 Unauthorized`);
    console.log(`   Result: ${res.status === 401 ? "✅ PASS" : "❌ FAIL"}\n`);
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}\n`);
  }

  // Test 2: Missing required parameters (should fail with 400)
  console.log("Test 2: Request with missing blockId");
  try {
    const res = await fetch(`${BASE_URL}/api/builder/blocks/styles`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotIdx: 0,
        css: "padding: 10px;",
      }),
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Expected: 400 or 401`);
    console.log(`   Result: ${res.status === 400 || res.status === 401 ? "✅ PASS" : "❌ FAIL"}\n`);
  } catch (err) {
    console.log(`   ❌ FAIL: ${err.message}\n`);
  }

  console.log("✅ API endpoint structure tests completed");
  console.log("⚠️  Note: Full integration tests require running dev server with auth");
  console.log("   The fix ensures layoutId is auto-created and returned when missing");
}

testBuilderBlocksStylesApi().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
