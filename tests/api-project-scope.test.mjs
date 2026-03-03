/**
 * API Test: Per-project data isolation + auth enforcement
 * Tests all admin endpoints with projectId scoping
 */

const BASE = "http://localhost:3000";
let sessionCookie = "";
let projectId = "";

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (sessionCookie) headers["Cookie"] = sessionCookie;
  const res = await fetch(`${BASE}${path}`, { ...options, headers, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie && setCookie.includes("open-dash-session=")) {
    sessionCookie = setCookie.split(";")[0];
  }
  return res;
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

async function run() {
  console.log("\n=== API Project Scope Tests ===\n");

  // 1. Signup
  console.log("1. Signup test user");
  const signupRes = await request("/api/auth", {
    method: "POST",
    body: JSON.stringify({ action: "signup", email: "test-scope@test.com", password: "Test1234!", confirmPassword: "Test1234!", name: "Test User" }),
  });
  assert([200, 409, 429].includes(signupRes.status), `Signup status ${signupRes.status} === 200/409/429 (ok/exists/ratelimit)`);

  // 2. Login
  console.log("2. Login");
  const loginRes = await request("/api/auth", {
    method: "POST",
    body: JSON.stringify({ action: "login", email: "test-scope@test.com", password: "Test1234!" }),
  });
  assert(loginRes.status === 200, `Login status ${loginRes.status} === 200`);
  assert(!!sessionCookie, "Session cookie set");

  // 3. Create project
  console.log("3. Create project");
  const createRes = await request("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: "Test Project", description: "For API tests" }),
  });
  assert(createRes.status === 200, `Create project status ${createRes.status} === 200`);
  const createData = await createRes.json();
  projectId = createData.project?.id;
  assert(!!projectId, `Project ID: ${projectId}`);

  if (!projectId) {
    console.log("\n⚠️ Cannot continue without projectId. Creating directly via Prisma...\n");
    // Fallback: try GET projects to find one
    const listRes = await request("/api/projects");
    if (listRes.status === 200) {
      const listData = await listRes.json();
      if (listData.projects?.length > 0) projectId = listData.projects[0].id;
    }
  }

  if (!projectId) {
    console.log("\n❌ FATAL: Could not create or find project. Aborting.\n");
    process.exit(1);
  }

  // 4. Test sidebar — no auth → 401
  console.log("4. Sidebar: no auth → 401");
  const noAuthRes = await fetch(`${BASE}/api/sidebar?projectId=${projectId}`);
  assert(noAuthRes.status === 401, `No auth sidebar status ${noAuthRes.status} === 401`);

  // 5. Test sidebar — no projectId → 400
  console.log("5. Sidebar: no projectId → 400");
  const noPidRes = await request("/api/sidebar");
  assert(noPidRes.status === 400, `No projectId sidebar status ${noPidRes.status} === 400`);

  // 6. Test sidebar — valid → 200 (empty)
  console.log("6. Sidebar: valid auth + projectId → 200");
  const sidebarRes = await request(`/api/sidebar?projectId=${projectId}`);
  assert(sidebarRes.status === 200, `Sidebar status ${sidebarRes.status} === 200`);
  const sidebarData = await sidebarRes.json();
  assert(Array.isArray(sidebarData), `Sidebar returns array (length: ${sidebarData.length})`);

  // 7. Test header-components — valid → 200
  console.log("7. Header-components: valid → 200");
  const headerRes = await request(`/api/header-components?projectId=${projectId}`);
  assert(headerRes.status === 200, `Header-components status ${headerRes.status} === 200`);
  const headerData = await headerRes.json();
  assert(Array.isArray(headerData), `Header-components returns array`);

  // 8. Test config — valid → 200
  console.log("8. Config: valid → 200");
  const configRes = await request(`/api/config/logo?projectId=${projectId}`);
  assert(configRes.status === 200, `Config status ${configRes.status} === 200`);

  // 9. Test pages — valid → 200
  console.log("9. Pages: valid → 200");
  const pageRes = await request(`/api/pages/dashboard?projectId=${projectId}`);
  assert(pageRes.status === 200, `Pages status ${pageRes.status} === 200`);

  // 10. Test wrong projectId → 403
  console.log("10. Sidebar: wrong projectId → 403");
  const wrongPidRes = await request(`/api/sidebar?projectId=fake-id-12345`);
  assert(wrongPidRes.status === 403, `Wrong projectId status ${wrongPidRes.status} === 403`);

  // 11. AI chat — no projectId → 400
  console.log("11. AI chat: no projectId → 400");
  const chatNoPidRes = await request("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message: "test", state: { sidebarItems: [], activePage: null, pageComponents: [], headerComponents: [] }, history: [] }),
  });
  assert(chatNoPidRes.status === 400, `AI chat no projectId status ${chatNoPidRes.status} === 400`);

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
