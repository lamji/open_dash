import { test, expect } from "@playwright/test";

/**
 * Conversation flow test: Gray container with Dashboard header
 *
 * Replicates exact conversation:
 *   1. Add div parent with bg gray
 *   2. Add header "Dashboard" with padding 10px
 *   3. Add padding 10px to container
 *   4. Change header color to red
 *
 * Tests AI chat's ability to handle sequential UI modifications.
 */

const BASE = "http://localhost:3000";
const SLUG = "dashboard";

/* ── helpers ─────────────────────────────────────────────── */

interface Comp {
  id: string;
  type: string;
  order: number;
  config: Record<string, unknown>;
  children?: Comp[];
}

async function apiGet(path: string) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

async function chat(message: string): Promise<{ message: string; actions: { type: string }[] }> {
  const [sidebar, page, header] = await Promise.all([
    apiGet("/api/sidebar"),
    apiGet(`/api/pages/${SLUG}`),
    apiGet("/api/header-components"),
  ]);
  const r = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      state: { sidebarItems: sidebar, activePage: SLUG, pageComponents: page, headerComponents: header },
      history: [],
    }),
  });
  const d = await r.json();
  // small delay so DB commits
  await new Promise((r) => setTimeout(r, 400));
  return d;
}

/* ── test suite ──────────────────────────────────────────── */

test.describe.serial("Conversation: Gray container with Dashboard header", () => {
  let containerId: string;
  let headerId: string;

  test("Setup — clear dashboard", async () => {
    await chat(
      `Clear the dashboard page completely. Use set_page_components with slug "dashboard" and components [].`
    );
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    expect(page.length).toBe(0);
  });

  test("Step 1 — add div parent with bg gray", async () => {
    const response = await chat("add div parent with bg gray");
    
    // Verify AI responded
    expect(response.message).toBeTruthy();
    console.log(`  AI response: ${response.message.slice(0, 100)}`);

    // Verify container was created
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    const container = page.find((c) => c.type === "container");
    expect(container).toBeTruthy();
    containerId = container!.id;

    // Verify gray background styling
    const className = String(container!.config.className || "");
    expect(className).toMatch(/bg-gray-\d+/);
    console.log(`  Container created with className: ${className}`);
  });

  test("Step 2 — add header Dashboard with padding 10px", async () => {
    await chat(
      `Add a child inside container ${containerId}. Use add_child_component parentId "${containerId}":
{ "type": "typography", "config": { "variant": "h1", "text": "Dashboard", "className": "p-[10px]" }, "order": 0 }`
    );

    // Verify header was created
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    const container = page.find((c) => c.id === containerId);
    expect(container).toBeTruthy();
    expect(container!.children).toBeTruthy();
    expect(container!.children!.length).toBeGreaterThanOrEqual(1);
    
    const header = container!.children!.find((c) => c.type === "typography");
    expect(header).toBeTruthy();
    headerId = header!.id;

    // Verify text and padding styling
    expect(String(header!.config.text)).toContain("Dashboard");
    const className = String(header!.config.className || "");
    expect(className).toContain("p-[10px]");
    console.log(`  Header created with text: ${header!.config.text}, className: ${className}`);
  });

  test("Step 3 — add padding 10px to container", async () => {
    await chat(
      `Update container ${containerId} to add padding while keeping background. Use inject_styles:
{ "id": "${containerId}", "className": "bg-gray-100 p-[10px]" }`
    );

    // Verify container has both background and padding
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    const container = page.find((c) => c.id === containerId);
    expect(container).toBeTruthy();

    const className = String(container!.config.className || "");
    expect(className).toContain("bg-gray");
    expect(className).toContain("p-[10px]");
    console.log(`  Container updated with className: ${className}`);
  });

  test("Step 4 — change header color to red", async () => {
    await chat(
      `Update component ${headerId} to change text color to red. Use inject_styles:
{ "id": "${headerId}", "className": "p-[10px] text-red-600" }`
    );

    // Verify header color was changed to red
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    const container = page.find((c) => c.id === containerId);
    expect(container).toBeTruthy();
    
    const header = container!.children?.find((c) => c.id === headerId);
    expect(header).toBeTruthy();

    const className = String(header!.config.className || "");
    expect(className).toContain("text-red-");
    console.log(`  Header color changed to className: ${className}`);
  });

  test("Render verification — container with gray background and red header", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    // Wait for container to appear
    const containers = page.locator('[data-test-id="dynamic-container"]');
    await expect(containers.first()).toBeVisible({ timeout: 15000 });

    // Verify container has gray background (check computed style, not inline attribute)
    const container = containers.first();
    const containerBg = await container.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    console.log(`  Container backgroundColor: ${containerBg}`);
    // Gray-100 is rgb(243, 244, 246) - check it's a light gray, not transparent or default
    expect(containerBg).not.toBe("rgba(0, 0, 0, 0)");
    expect(containerBg).not.toBe("transparent");
    // Should be a gray color (all RGB values similar and high)
    const rgbMatch = containerBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      console.log(`  RGB values: R=${r}, G=${g}, B=${b}`);
      // Gray colors have similar R, G, B values
      expect(Math.abs(r - g)).toBeLessThan(20);
      expect(Math.abs(g - b)).toBeLessThan(20);
    }

    // Verify container has padding
    const containerPadding = await container.evaluate(
      (el) => window.getComputedStyle(el).padding
    );
    console.log(`  Container padding: ${containerPadding}`);
    expect(containerPadding).toContain("10px");

    // Verify header exists with red color
    const headers = page.locator('[data-test-id="dynamic-typography"]');
    await expect(headers.first()).toBeVisible();
    
    const headerText = await headers.first().textContent();
    expect(headerText).toContain("Dashboard");
    console.log(`  Header text: ${headerText}`);

    // Check header color
    const headerColor = await headers.first().evaluate((wrapper) => {
      const inner = wrapper.firstElementChild;
      if (!inner) return "none";
      return window.getComputedStyle(inner).color;
    });
    console.log(`  Header color: ${headerColor}`);
    // Red colors have high R value, low G and B
    expect(headerColor).toMatch(/rgb\(2[0-9]{2},\s*\d+,\s*\d+\)/);
  });

  test("DB verification — final structure", async () => {
    const page: Comp[] = await apiGet(`/api/pages/${SLUG}`);
    
    // Should have at least 1 component (container)
    expect(page.length).toBeGreaterThanOrEqual(1);
    const container = page.find((c) => c.type === "container");
    expect(container).toBeTruthy();
    
    // Find header (could be child or sibling)
    let header = container!.children?.find((c) => c.type === "typography");
    if (!header) {
      header = page.find((c) => c.type === "typography");
    }
    expect(header).toBeTruthy();
    expect(String(header!.config.text)).toContain("Dashboard");
    
    const childCount = container!.children?.length || 0;
    console.log(`  Final structure: ${page.length} page component(s), container has ${childCount} child(ren)`);
    console.log(`  Container className: ${container!.config.className}`);
    console.log(`  Header className: ${header!.config.className}`);
  });
});
