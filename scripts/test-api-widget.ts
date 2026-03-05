#!/usr/bin/env tsx

/**
 * API Test Script for /api/ai/widget endpoint
 * Tests widget generation with authentication
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logResult(name: string, passed: boolean, error?: string) {
  console.log(`Debug flow: logResult fired with`, { name, passed, error });
  results.push({ name, passed, error });
  console.log(`${passed ? "✓" : "✗"} ${name}`);
  if (error) console.log(`  Error: ${error}`);
}

async function runTests() {
  console.log(`Debug flow: runTests fired with`, { timestamp: new Date().toISOString() });
  console.log("\n🧪 Testing /api/ai/widget endpoint\n");

  let sessionToken: string | undefined;
  let projectId: string | undefined;

  try {
    // Setup: First login to get valid session
    console.log("\n📝 Setup: Logging in to get session...");
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: "test@example.com",
        password: "testpassword123",
      }),
    });

    if (loginResponse.ok) {
      const cookies = loginResponse.headers.get("set-cookie");
      if (cookies) {
        const sessionMatch = cookies.match(/open-dash-session=([^;]+)/);
        if (sessionMatch) {
          sessionToken = sessionMatch[1];
          console.log(`Debug flow: Got session token from login`);
        }
      }
      
      // Get user's first project
      const projectsResponse = await fetch(`${BASE_URL}/api/projects`, {
        headers: {
          Cookie: `open-dash-session=${sessionToken}`,
        },
      });
      
      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        if (projects.length > 0) {
          projectId = projects[0].id;
          console.log(`Debug flow: Using existing project`, { projectId });
        }
      }
    }
    
    if (!sessionToken || !projectId) {
      console.log("⚠️  No valid session/project found. Tests will verify error handling only.");
    }

    // Test 2: Widget generation without auth (should fail with 401)
    try {
      const response = await fetch(`${BASE_URL}/api/ai/widget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "create a simple button",
        }),
      });

      logResult(
        "Widget generation without auth returns 401",
        response.status === 401
      );
    } catch (error) {
      logResult(
        "Widget generation without auth returns 401",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Test 3: Widget generation without projectId (should fail with 400)
    try {
      const response = await fetch(`${BASE_URL}/api/ai/widget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `open-dash-session=${sessionToken}`,
        },
        body: JSON.stringify({
          message: "create a simple button",
        }),
      });

      logResult(
        "Widget generation without projectId returns 400",
        response.status === 400
      );
    } catch (error) {
      logResult(
        "Widget generation without projectId returns 400",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Test 4: Widget generation without message (should fail with 400)
    try {
      const response = await fetch(`${BASE_URL}/api/ai/widget?projectId=${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `open-dash-session=${sessionToken}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      logResult(
        "Widget generation without message returns 400",
        response.status === 400 && data.error === "Message is required"
      );
    } catch (error) {
      logResult(
        "Widget generation without message returns 400",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Test 5: Valid widget generation request (should succeed with 200)
    try {
      const response = await fetch(`${BASE_URL}/api/ai/widget?projectId=${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `open-dash-session=${sessionToken}`,
        },
        body: JSON.stringify({
          message: "create a simple card with a title and description",
        }),
      });

      const data = await response.json();
      const hasCodeBlock = data.message && data.message.includes("```");
      const hasImports = data.message && data.message.includes("import");
      
      logResult(
        "Valid widget generation returns 200 with code",
        response.status === 200 && hasCodeBlock && hasImports,
        !hasCodeBlock ? "No code block found" : !hasImports ? "No imports found" : undefined
      );
    } catch (error) {
      logResult(
        "Valid widget generation returns 200 with code",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Test 6: Complex widget generation (product card)
    try {
      const response = await fetch(`${BASE_URL}/api/ai/widget?projectId=${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `open-dash-session=${sessionToken}`,
        },
        body: JSON.stringify({
          message: "create me a product card with image, title, price, rating stars, color selector, size buttons, quantity controls, and add to cart button",
        }),
      });

      const data = await response.json();
      const hasCodeBlock = data.message && data.message.includes("```tsx");
      const hasButton = data.message && data.message.includes("Button");
      const hasCard = data.message && data.message.includes("Card");
      
      logResult(
        "Complex product card widget generation works",
        response.status === 200 && hasCodeBlock && hasButton && hasCard,
        !hasCodeBlock ? "No TSX code block" : !hasButton ? "No Button component" : !hasCard ? "No Card component" : undefined
      );
    } catch (error) {
      logResult(
        "Complex product card widget generation works",
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

  } catch (error) {
    console.error("Test setup failed:", error);
    logResult(
      "Test setup",
      false,
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("✅ All tests passed!");
  } else {
    console.log("❌ Some tests failed");
  }
}

runTests().catch((error) => {
  console.error("Fatal error:", error);
});
