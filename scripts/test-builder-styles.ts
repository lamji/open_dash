/**
 * Headless Playwright test — builder column style DOM validation
 *
 * Simulates: open builder → apply CSS via edit modal → verify inline style
 * on the slot div in the DOM.
 *
 * Run: npx ts-node scripts/test-builder-styles.ts
 * Requires: dev server on http://localhost:3000 and a valid session cookie.
 */
import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

async function testBuilderStyles(): Promise<void> {
  console.log(`Debug flow: testBuilderStyles fired with`, { baseUrl: BASE_URL });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("→ Navigating to builder...");
    await page.goto(`${BASE_URL}/builder`, { waitUntil: "networkidle" });

    const title = await page.title();
    console.log(`  Page title: "${title}"`);

    const url = page.url();
    console.log(`  Final URL: ${url}`);

    if (url.includes("/auth/login")) {
      console.error("✗ FAIL: Redirected to login. Cannot test builder without valid session.");
      process.exit(1);
    }

    console.log("→ Checking for builder canvas...");
    const canvas = await page.locator('[data-test-id="builder-blocks"]').count();
    console.log(`  Builder canvas found: ${canvas > 0}`);

    console.log("→ Looking for any existing slot div...");
    const slots = await page.locator('[data-test-id^="builder-slot-"]').all();
    console.log(`  Slots found: ${slots.length}`);

    if (slots.length === 0) {
      console.log("  No slots found — checking if 'Add Block' button exists...");
      const addBtn = await page.locator('[data-test-id="builder-add-block-btn"]').count();
      console.log(`  Add Block button found: ${addBtn > 0}`);
      console.log("  INFO: Add a block in the builder first, then re-run this test.");
      process.exit(0);
    }

    const firstSlot = slots[0];
    const slotTestId = await firstSlot.getAttribute("data-test-id");
    console.log(`\n→ Testing slot: ${slotTestId}`);

    console.log("→ Checking current inline style of slot div...");
    const currentStyle = await firstSlot.getAttribute("style");
    console.log(`  Current style: "${currentStyle ?? "(none)"}"`);

    console.log("→ Checking current computed background-color...");
    const bgColor = await firstSlot.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    console.log(`  Computed background-color: ${bgColor}`);

    console.log("→ Looking for CSS edit button on first slot...");
    const editBtn = await page
      .locator(`[data-test-id^="builder-slot-edit-"], [data-test-id^="builder-empty-slot-edit-"]`)
      .first();
    const editBtnExists = await editBtn.count() > 0;
    console.log(`  Edit button found: ${editBtnExists}`);

    if (!editBtnExists) {
      console.log("  INFO: No edit button found. Hover over a slot to reveal it.");
      process.exit(0);
    }

    console.log("→ Clicking CSS edit button...");
    await editBtn.click();
    await page.waitForTimeout(500);

    const modalOpen = await page.locator('[data-test-id="builder-css-editor-modal"]').count();
    console.log(`  CSS editor modal opened: ${modalOpen > 0}`);

    if (!modalOpen) {
      console.error("✗ FAIL: CSS editor modal did not open.");
      process.exit(1);
    }

    console.log("→ Clearing textarea and typing test CSS...");
    const textarea = page.locator('[data-test-id="builder-css-editor-textarea"]');
    await textarea.click({ clickCount: 3 });
    await textarea.fill("background-color: rgb(255, 0, 0);\npadding: 16px;");
    await page.waitForTimeout(200);

    console.log("→ Clicking Save styles...");
    await page.locator('[data-test-id="builder-css-editor-save-btn"]').click();
    await page.waitForTimeout(800);

    console.log("→ Re-checking slot inline style after save...");
    const styleAfter = await firstSlot.getAttribute("style");
    console.log(`  style attribute: "${styleAfter ?? "(none)"}"`);

    const bgAfter = await firstSlot.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    console.log(`  Computed background-color after: ${bgAfter}`);

    const paddingAfter = await firstSlot.evaluate((el) =>
      window.getComputedStyle(el).padding
    );
    console.log(`  Computed padding after: ${paddingAfter}`);

    const redApplied =
      bgAfter === "rgb(255, 0, 0)" ||
      bgAfter.includes("255, 0, 0");
    const paddingApplied = paddingAfter.includes("16px");

    console.log(`\n══════════════════════════════`);
    console.log(`  Background red applied: ${redApplied ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`  Padding 16px applied:   ${paddingApplied ? "✓ PASS" : "✗ FAIL"}`);
    console.log(`══════════════════════════════`);

    if (!redApplied || !paddingApplied) {
      console.error("\n✗ STYLES DID NOT APPLY TO SLOT DOM ELEMENT");
      console.error(`  Expected background: rgb(255, 0, 0) — Got: ${bgAfter}`);
      console.error(`  Expected padding: 16px — Got: ${paddingAfter}`);
      console.error(`  style attr: ${styleAfter}`);
      process.exit(1);
    } else {
      console.log("\n✓ ALL STYLE CHECKS PASSED — CSS is correctly applied to slot div");
    }
  } catch (err) {
    console.error("✗ Unexpected error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testBuilderStyles();
