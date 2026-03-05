/**
 * Test script for PUT /api/widgets/[slug]
 * Usage: npx tsx scripts/test-api-widgets-put.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: msg });
    console.error(`✗ ${name}: ${msg}`);
  }
}

async function putWidget(
  slug: string,
  payload: Record<string, unknown>
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}/api/widgets/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function getWidget(slug: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}/api/widgets/${slug}`);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function main() {
  console.log(`\nRunning PUT /api/widgets/[slug] tests against ${BASE_URL}\n`);

  // Test 1 — Update widget data (revenue-kpi)
  await runTest("PUT /api/widgets/revenue-kpi → 200 with updated data", async () => {
    const newData = {
      data: {
        value: "$99,999",
        label: "Updated Revenue",
        trend: "+99.9% vs last month",
        trendUp: true,
        period: "Test run",
      },
    };
    const { status, body } = await putWidget("revenue-kpi", newData);
    console.log(`  status=${status}`, JSON.stringify(body).slice(0, 120));
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    const widget = (body as Record<string, unknown>)?.widget as Record<string, unknown> | undefined;
    if (!widget) throw new Error("Response missing 'widget' field");
  });

  // Test 2 — Verify the data was persisted (GET after PUT)
  await runTest("GET /api/widgets/revenue-kpi reflects updated jsxCode", async () => {
    const { status, body } = await getWidget("revenue-kpi");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    const widget = (body as Record<string, unknown>)?.widget as Record<string, unknown> | undefined;
    if (!widget) throw new Error("Response missing 'widget' field");
    const jsxCode = widget.jsxCode as string;
    const parsed = JSON.parse(jsxCode);
    if (parsed.value !== "$99,999") throw new Error(`jsxCode not updated — got: ${JSON.stringify(parsed)}`);
    console.log(`  jsxCode.value=${parsed.value} ✓`);
  });

  // Test 3 — Update title + description + category
  await runTest("PUT /api/widgets/revenue-kpi → update title/description/category", async () => {
    const { status, body } = await putWidget("revenue-kpi", {
      title: "Revenue KPI Updated",
      description: "Updated description from test",
      category: "stats",
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    const widget = (body as Record<string, unknown>)?.widget as Record<string, unknown> | undefined;
    if (!widget) throw new Error("Response missing 'widget' field");
    if (widget.title !== "Revenue KPI Updated") throw new Error(`title not updated: ${widget.title}`);
    console.log(`  title="${widget.title}" ✓`);
  });

  // Test 4 — Restore original data
  await runTest("PUT /api/widgets/revenue-kpi → restore original data", async () => {
    const { status } = await putWidget("revenue-kpi", {
      title: "Revenue KPI",
      description: "Total revenue with month-over-month trend",
      category: "stats",
      data: {
        value: "$45,231",
        label: "Total Revenue",
        trend: "+12.5% vs last month",
        trendUp: true,
        period: "This month",
      },
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    console.log(`  Restored original data ✓`);
  });

  // Test 5 — Non-existent slug → 404
  await runTest("PUT /api/widgets/non-existent-slug → 404", async () => {
    const { status } = await putWidget("non-existent-widget-xyzabc", { data: {} });
    if (status !== 404) throw new Error(`Expected 404, got ${status}`);
    console.log(`  Correctly returned 404 ✓`);
  });

  // Test 6 — Update kpi-scorecard data (summary widget)
  await runTest("PUT /api/widgets/kpi-scorecard → update items", async () => {
    const { status, body } = await putWidget("kpi-scorecard", {
      data: {
        title: "KPI Scorecard",
        items: [
          { kpi: "Revenue Growth", value: "15%", target: "10%", status: "green" },
          { kpi: "Customer Churn", value: "1.8%", target: "< 3%", status: "green" },
          { kpi: "NPS Score", value: "78", target: "> 70", status: "green" },
          { kpi: "Ticket SLA", value: "93%", target: "> 90%", status: "green" },
        ],
      },
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    const widget = (body as Record<string, unknown>)?.widget as Record<string, unknown> | undefined;
    if (!widget) throw new Error("Response missing 'widget' field");
    console.log(`  kpi-scorecard updated ✓`);
  });

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed`);
  if (passed < total) {
    console.error(`\n${total - passed} test(s) FAILED`);
    process.exit(1);
  } else {
    console.log(`\nAll tests passed ✓`);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
