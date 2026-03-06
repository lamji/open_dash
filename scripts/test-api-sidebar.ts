#!/usr/bin/env ts-node
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SESSION_TOKEN = process.env.SESSION_TOKEN;
const PROJECT_ID = process.env.PROJECT_ID;

if (!SESSION_TOKEN || !PROJECT_ID) {
  console.error("Set SESSION_TOKEN and PROJECT_ID environment variables before running this script.");
  process.exit(1);
}

const cookie = `open-dash-session=${SESSION_TOKEN}`;

async function fetchSidebarItems() {
  console.log("Fetching sidebar items...");
  const response = await fetch(`${BASE_URL}/api/sidebar?projectId=${PROJECT_ID}`, {
    headers: { cookie },
  });
  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Payload summary:", { hasItems: Array.isArray(data), count: Array.isArray(data) ? data.length : 0 });
  return data;
}

async function createNavItem(label: string) {
  console.log("Creating nav item...", { label });
  const response = await fetch(`${BASE_URL}/api/sidebar?projectId=${PROJECT_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify({ label }),
  });
  console.log("Status:", response.status);
  const payload = await response.json();
  console.log("Create response:", payload.ok ? "ok" : payload);
  return payload;
}

async function deleteNavItem(itemId: string) {
  console.log("Deleting nav item...", { itemId });
  const response = await fetch(`${BASE_URL}/api/sidebar/${itemId}?projectId=${PROJECT_ID}`, {
    method: "DELETE",
    headers: { cookie },
  });
  console.log("Status:", response.status);
  console.log("Delete response:", await response.json());
}

async function run() {
  console.log("=== Sidebar API cache validation ===");
  await fetchSidebarItems();
  const created = await createNavItem(`test-cache-${Date.now()}`);
  if (created?.item?.id) {
    await deleteNavItem(created.item.id);
  } else {
    console.error("Failed to create nav item; skipping delete.");
  }
}

run().catch((err) => {
  console.error("Sidebar API cache test failed:", err);
});
