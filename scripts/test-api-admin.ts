#!/usr/bin/env tsx

/**
 * API Test Script for Admin endpoints
 * Tests the /api/admin route
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testAdminAPI() {
  console.log("🧪 Testing Admin API endpoints...\n");

  try {
    // Test GET /api/admin
    console.log("1️⃣ Testing GET /api/admin");
    const getResponse = await fetch(`${BASE_URL}/api/admin`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log("✅ GET /api/admin - Success");
      console.log("   Response:", JSON.stringify(getData, null, 2));
    } else {
      console.error("❌ GET /api/admin - Failed");
      console.error("   Status:", getResponse.status);
      console.error("   Response:", getData);
    }

    console.log("\n2️⃣ Testing POST /api/admin");
    const postResponse = await fetch(`${BASE_URL}/api/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    });
    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log("✅ POST /api/admin - Success");
      console.log("   Response:", JSON.stringify(postData, null, 2));
    } else {
      console.error("❌ POST /api/admin - Failed");
      console.error("   Status:", postResponse.status);
      console.error("   Response:", postData);
    }

    console.log("\n✅ All admin API tests completed");
    console.log("\nℹ️  Note: Dev mode toggle is client-side only (localStorage)");
    console.log("   No backend API calls required for dev mode functionality");
    
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testAdminAPI();
