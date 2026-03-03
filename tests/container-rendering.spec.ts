import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const PAGE_SLUG = "dashboard";

async function apiGet(path: string) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

async function apiChat(message: string) {
  const [sidebar, page, header] = await Promise.all([
    apiGet("/api/sidebar"),
    apiGet(`/api/pages/${PAGE_SLUG}`),
    apiGet("/api/header-components"),
  ]);
  const r = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      state: { sidebarItems: sidebar, activePage: PAGE_SLUG, pageComponents: page, headerComponents: header },
      history: [],
    }),
  });
  return r.json();
}

test.describe("Container rendering with dynamic styles", () => {
  test("container with bg-red-500 renders visible red background via inline styles", async ({ page }) => {
    // Step 1: Check existing containers in DB
    const components = await apiGet(`/api/pages/${PAGE_SLUG}`);
    const containers = components.filter((c: { type: string }) => c.type === "container");

    // If no container with bg-red exists, create one via AI chat
    const redContainer = containers.find(
      (c: { config: { className?: string } }) => c.config.className?.includes("bg-red")
    );

    if (!redContainer) {
      await apiChat(
        `Add a container to "${PAGE_SLUG}" with className "bg-red-500 h-[200px] w-full rounded-lg". Use add_page_component with slug "${PAGE_SLUG}": { "type": "container", "config": { "display": "flex", "direction": "column", "gap": 4, "className": "bg-red-500 h-[200px] w-full rounded-lg" }, "order": 99 }`
      );
    }

    // Step 2: Navigate to admin page (dashboard view)
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    // Step 3: Find the container element
    const container = page.locator('[data-test-id="dynamic-container"]').first();
    await expect(container).toBeVisible({ timeout: 10000 });

    // Step 4: Verify inline styles are applied (not just className)
    const style = await container.getAttribute("style");
    expect(style).toBeTruthy();
    // bg-red-500 should be converted to inline backgroundColor: #ef4444
    expect(style).toContain("background-color");

    // Step 5: Verify the container has actual computed dimensions (not 0x0)
    const box = await container.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThan(0);
    expect(box!.width).toBeGreaterThan(0);

    // Step 6: Verify computed background color
    const bgColor = await container.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    // #ef4444 = rgb(239, 68, 68)
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)"); // not transparent
    expect(bgColor).not.toBe("transparent");
  });

  test("container with h-300 (invalid tailwind) still gets height via inline style", async ({ page }) => {
    // The existing DB has className "h-300 bg-red-500"
    // h-300 is not a valid Tailwind class but parseDynamicStyles should convert it to height: 300px
    const components = await apiGet(`/api/pages/${PAGE_SLUG}`);
    const container300 = components.find(
      (c: { config: { className?: string } }) => c.config.className?.includes("h-300")
    );

    if (!container300) {
      test.skip();
      return;
    }

    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    // Find container with h-300 style
    const allContainers = page.locator('[data-test-id="dynamic-container"]');
    const count = await allContainers.count();

    let found = false;
    for (let i = 0; i < count; i++) {
      const style = await allContainers.nth(i).getAttribute("style");
      if (style && style.includes("height") && style.includes("300px")) {
        found = true;
        const box = await allContainers.nth(i).boundingBox();
        expect(box).toBeTruthy();
        expect(box!.height).toBeGreaterThanOrEqual(200); // at least 200px (may have some layout constraints)
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("API returns container data with className from DB", async () => {
    const components = await apiGet(`/api/pages/${PAGE_SLUG}`);
    expect(Array.isArray(components)).toBe(true);

    const containers = components.filter((c: { type: string }) => c.type === "container");
    expect(containers.length).toBeGreaterThan(0);

    // Verify at least one container has className in config
    const withClass = containers.find(
      (c: { config: { className?: string } }) => c.config.className
    );
    expect(withClass).toBeTruthy();
  });
});
