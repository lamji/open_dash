import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrLoadCache } from "@/lib/cache";

export const DEFAULT_WIDGETS = [
  { slug: "revenue-kpi", title: "Revenue KPI Card", description: "Total revenue with trend indicator", category: "stats", jsxCode: JSON.stringify({ value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month", icon: "dollar" }) },
  { slug: "user-growth", title: "User Growth Card", description: "Active users with growth percentage", category: "stats", jsxCode: JSON.stringify({ value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week", icon: "users" }) },
  { slug: "conversion-rate", title: "Conversion Rate Card", description: "Conversion rate with trend", category: "stats", jsxCode: JSON.stringify({ value: "3.24%", label: "Conversion Rate", trend: "-1.2%", trendUp: false, period: "vs last week", icon: "target" }) },
  { slug: "sparkline", title: "Trend Sparkline Card", description: "Page views with mini bar trend chart", category: "stats", jsxCode: JSON.stringify({ value: "2,543", label: "Page Views", bars: [30,45,35,60,50,70,65,80,75,85,90,95], period: "Today", icon: "zap" }) },
  { slug: "satisfaction", title: "Customer Satisfaction", description: "Star rating with review count", category: "stats", jsxCode: JSON.stringify({ value: "4.8", label: "Customer Satisfaction", maxRating: 5, filledStars: 4, reviews: 1234, period: "1,234 reviews" }) },
  { slug: "realtime-users", title: "Active Users Real-time", description: "Live active user count with pulse indicator", category: "stats", jsxCode: JSON.stringify({ value: "1,234", label: "Active Users Now", period: "Online right now", live: true }) },
  { slug: "weekly-summary", title: "Weekly Summary Card", description: "Multi-metric weekly snapshot", category: "stats", jsxCode: JSON.stringify({ metrics: [{ label: "Orders", value: "234", color: "blue" }, { label: "Revenue", value: "$12K", color: "emerald" }, { label: "Users", value: "1.2K", color: "violet" }, { label: "Tasks", value: "45", color: "orange" }] }) },
  { slug: "mrr", title: "Monthly Recurring Revenue", description: "MRR with month-over-month growth", category: "stats", jsxCode: JSON.stringify({ value: "$89,200", label: "Monthly Recurring Revenue", trend: "+15.8%", trendUp: true, period: "This month", icon: "dollar" }) },
  { slug: "revenue-chart", title: "Monthly Revenue Chart", description: "Bar chart of monthly revenue figures", category: "charts", jsxCode: JSON.stringify({ title: "Monthly Revenue", bars: [50,65,80,100,75,90], labels: ["Jan","Feb","Mar","Apr","May","Jun"] }) },
  { slug: "activity-chart", title: "User Activity Chart", description: "Daily activity bar chart", category: "charts", jsxCode: JSON.stringify({ title: "User Activity", bars: [40,60,45,80,55,70,65,85,75,90,80,95] }) },
  { slug: "traffic-pie", title: "Traffic Sources Pie", description: "Traffic distribution as a donut chart", category: "charts", jsxCode: JSON.stringify({ title: "Traffic Sources", segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }, { label: "Social", value: "25%", pct: 25, color: "#ec4899" }] }) },
  { slug: "line-trend", title: "Revenue Trend Line", description: "Year-long revenue trend line chart", category: "charts", jsxCode: JSON.stringify({ title: "Revenue Trend", points: [20,35,28,45,38,55,48,62,55,70,65,78], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }) },
  { slug: "sales-target", title: "Sales Target Progress", description: "Sales progress bar towards target", category: "progress", jsxCode: JSON.stringify({ label: "Sales Target", current: 75000, target: 100000, pct: 75, currentLabel: "$75,000", targetLabel: "$100,000" }) },
  { slug: "goal-tracker", title: "Goal Progress Tracker", description: "Multi-goal quarterly progress bars", category: "progress", jsxCode: JSON.stringify({ title: "Quarterly Goals", goals: [{ name: "Revenue", pct: 85 }, { name: "Users", pct: 70 }, { name: "Engagement", pct: 92 }] }) },
  { slug: "sprint-progress", title: "Sprint Progress", description: "Agile sprint completion tracker", category: "progress", jsxCode: JSON.stringify({ sprint: "Sprint 12", done: 18, total: 24, pct: 75, daysLeft: 3 }) },
  { slug: "activity-feed", title: "Recent Activity Feed", description: "Live activity feed with timestamps", category: "activity", jsxCode: JSON.stringify({ items: [{ color: "bg-emerald-500", text: "New user signed up", time: "2 min ago" }, { color: "bg-blue-500", text: "Order #1234 completed", time: "15 min ago" }, { color: "bg-violet-500", text: "Payment received", time: "1 hr ago" }] }) },
  { slug: "error-log", title: "Error Log Feed", description: "Real-time application error and warning feed", category: "activity", jsxCode: JSON.stringify({ items: [{ level: "error", message: "TypeError in /api/widgets", time: "5 min ago" }, { level: "warn", message: "High memory usage detected", time: "12 min ago" }, { level: "info", message: "Deployment completed successfully", time: "1 hr ago" }] }) },
  { slug: "top-products", title: "Top Products List", description: "Best selling products with bar indicators", category: "list", jsxCode: JSON.stringify({ items: [{ name: "Widget Pro", sales: 234, pct: 95 }, { name: "Widget Lite", sales: 189, pct: 77 }, { name: "Widget Max", sales: 156, pct: 63 }] }) },
  { slug: "team-performance", title: "Team Performance List", description: "Team member scores with progress bars", category: "list", jsxCode: JSON.stringify({ members: [{ name: "Alice", score: 95 }, { name: "Bob", score: 88 }, { name: "Charlie", score: 92 }] }) },
  { slug: "comparison", title: "Month-over-Month Comparison", description: "Key metrics this vs last month", category: "comparison", jsxCode: JSON.stringify({ title: "This vs Last Month", metrics: [{ metric: "Revenue", curr: "$45,231", prev: "$40,200", up: true }, { metric: "Orders", curr: "1,543", prev: "1,620", up: false }] }) },
  { slug: "revenue-target", title: "Revenue vs Target", description: "Revenue progress bar against quarterly target", category: "comparison", jsxCode: JSON.stringify({ actual: 85000, target: 100000, pct: 85, actualLabel: "$85,000", targetLabel: "$100,000", remaining: "$15,000 to go" }) },
  { slug: "orders-table", title: "Recent Orders Table", description: "Latest orders with status badges", category: "table", jsxCode: JSON.stringify({ title: "Recent Orders", columns: ["Order","Customer","Amount","Status"], rows: [{ id: "#1234", customer: "Alice M.", amount: "$230.00", status: "Completed" }, { id: "#1235", customer: "Bob K.", amount: "$89.00", status: "Pending" }] }) },
  { slug: "customers-table", title: "Customer Overview Table", description: "Customer list with plan and spending", category: "table", jsxCode: JSON.stringify({ title: "Customers", columns: ["Name","Email","Plan","Spend"], rows: [{ name: "Alice M.", email: "alice@co.com", plan: "Pro", spend: "$2,340" }, { name: "Bob K.", email: "bob@co.com", plan: "Free", spend: "$0" }] }) },
  { slug: "system-health", title: "System Health Status", description: "Service uptime and health monitoring", category: "health", jsxCode: JSON.stringify({ services: [{ name: "API", status: "Operational", ok: true }, { name: "Database", status: "Operational", ok: true }, { name: "Cache", status: "Degraded", ok: false }] }) },
  { slug: "api-latency", title: "API Latency Monitor", description: "P50/P99 latency per endpoint", category: "health", jsxCode: JSON.stringify({ title: "API Latency", services: [{ name: "GET /api/users", p50: 45, p99: 180 }, { name: "POST /api/orders", p50: 120, p99: 450 }] }) },
  { slug: "uptime-monitor", title: "Uptime Monitor", description: "Service uptime percentages over 30 days", category: "health", jsxCode: JSON.stringify({ services: [{ name: "API", uptime: 99.98, status: "up" }, { name: "Database", uptime: 99.95, status: "up" }, { name: "CDN", uptime: 100, status: "up" }] }) },
  { slug: "timeline", title: "Timeline Events", description: "Upcoming and recent event timeline", category: "timeline", jsxCode: JSON.stringify({ events: [{ title: "Product Launch", time: "Today", color: "bg-indigo-500" }, { title: "Team Meeting", time: "Tomorrow", color: "bg-violet-500" }, { title: "Q4 Review", time: "Next Week", color: "bg-blue-500" }] }) },
  { slug: "conversion-funnel", title: "Conversion Funnel", description: "Visitor-to-paid conversion funnel stages", category: "funnel", jsxCode: JSON.stringify({ title: "Conversion Funnel", stages: [{ label: "Visitors", value: 10000, pct: 100 }, { label: "Sign-ups", value: 2400, pct: 24 }, { label: "Activated", value: 1200, pct: 12 }, { label: "Paid", value: 360, pct: 3.6 }] }) },
  { slug: "sales-pipeline", title: "Sales Pipeline Funnel", description: "CRM pipeline stages with deal counts", category: "funnel", jsxCode: JSON.stringify({ title: "Sales Pipeline", stages: [{ label: "Leads", value: 450, pct: 100 }, { label: "Qualified", value: 280, pct: 62 }, { label: "Proposal", value: 140, pct: 31 }, { label: "Closed Won", value: 78, pct: 17 }] }) },
  { slug: "agent-leaderboard", title: "Agent Leaderboard", description: "Top performing agents ranked by score", category: "leaderboard", jsxCode: JSON.stringify({ title: "Top Agents", entries: [{ rank: 1, name: "Alice M.", score: 2840, badge: "gold" }, { rank: 2, name: "Bob K.", score: 2310, badge: "silver" }, { rank: 3, name: "Carol D.", score: 1980, badge: "bronze" }] }) },
  { slug: "executive-summary", title: "Executive Summary Panel", description: "High-level KPI overview for leadership", category: "summary", jsxCode: JSON.stringify({ title: "Executive Summary", kpis: [{ label: "Revenue", value: "$892K", trend: "+12%", up: true }, { label: "Users", value: "24.5K", trend: "+8%", up: true }, { label: "NPS", value: "72", trend: "+5", up: true }, { label: "Churn", value: "2.1%", trend: "-0.5%", up: false }] }) },
  { slug: "kpi-scorecard", title: "KPI Scorecard", description: "Comprehensive KPI scorecard with RAG status", category: "summary", jsxCode: JSON.stringify({ title: "KPI Scorecard", items: [{ kpi: "Revenue Growth", value: "12%", target: "10%", status: "green" }, { kpi: "Customer Churn", value: "2.1%", target: "< 3%", status: "green" }, { kpi: "NPS Score", value: "72", target: "> 70", status: "green" }] }) },
  { slug: "button-left-icon", title: "Button With Left Icon", description: "Action button with icon before label", category: "button", jsxCode: JSON.stringify({ label: "Create Report", description: "Button with left icon" }) },
  { slug: "button-right-icon", title: "Button With Right Icon", description: "Action button with icon after label", category: "button", jsxCode: JSON.stringify({ label: "View Details", description: "Button with right icon" }) },
  { slug: "button-primary", title: "Primary Action Button", description: "Single primary CTA button", category: "button", jsxCode: JSON.stringify({ label: "Create Report", description: "Primary action button", variant: "primary" }) },
  { slug: "button-secondary", title: "Secondary Action Button", description: "Single secondary CTA button", category: "button", jsxCode: JSON.stringify({ label: "Save Draft", description: "Secondary action button", variant: "secondary" }) },
  { slug: "button-outline", title: "Outline Action Button", description: "Single outline CTA button", category: "button", jsxCode: JSON.stringify({ label: "View Details", description: "Outline action button", variant: "outline" }) },
  { slug: "button-ghost", title: "Ghost Action Button", description: "Single low-emphasis CTA button", category: "button", jsxCode: JSON.stringify({ label: "Skip for now", description: "Ghost action button", variant: "ghost" }) },
  { slug: "button-link", title: "Link Action Button", description: "Single link-style CTA button", category: "button", jsxCode: JSON.stringify({ label: "Open analytics", description: "Link action button", variant: "link" }) },
  { slug: "button-destructive", title: "Destructive Action Button", description: "Single destructive CTA button", category: "button", jsxCode: JSON.stringify({ label: "Delete item", description: "Destructive action button", variant: "destructive" }) },
  { slug: "upload-button-solid", title: "Upload Button", description: "Single primary upload button", category: "button", jsxCode: JSON.stringify({ label: "Upload file", description: "Primary upload button", variant: "upload-solid" }) },
  { slug: "upload-button-outline", title: "Upload Assets Button", description: "Single outline upload button", category: "button", jsxCode: JSON.stringify({ label: "Upload assets", description: "Outline upload button", variant: "upload-outline" }) },
  { slug: "upload-button-dashed", title: "Drag Upload Button", description: "Single dashed upload button", category: "button", jsxCode: JSON.stringify({ label: "Drag and upload", description: "Dashed upload button", variant: "upload-dashed" }) },
  { slug: "upload-buttons", title: "Upload Button Variants", description: "Multiple upload button styles: solid, outline, and dashed", category: "button", jsxCode: JSON.stringify({ labels: ["Upload file", "Upload assets", "Drag and upload"] }) },
  { slug: "button-variant-set", title: "Button Variant Set", description: "Default, secondary, outline, ghost, link, and destructive button variants", category: "button", jsxCode: JSON.stringify({ labels: { default: "Default", secondary: "Secondary", outline: "Outline", ghost: "Ghost", link: "Link", destructive: "Destructive" } }) },
  { slug: "search-bar", title: "Search Bar", description: "Simple search input with icon", category: "search", jsxCode: JSON.stringify({ placeholder: "Search anything..." }) },
  { slug: "search-with-filters", title: "Search With Filters", description: "Search input with filter chips and quick results", category: "search", jsxCode: JSON.stringify({ placeholder: "Search users...", filters: [{ label: "All", active: true }, { label: "Active" }, { label: "Inactive" }, { label: "Admin" }] }) },
  { slug: "global-search", title: "Global Search", description: "Search with categories and recent history", category: "search", jsxCode: JSON.stringify({ placeholder: "Search dashboards...", categories: [{ label: "Pages", count: 12 }, { label: "Users", count: 48 }, { label: "Reports", count: 7 }], recent: ["Revenue report", "User analytics", "Q4 dashboard"] }) },
  { slug: "search-variant-set", title: "Search Variant Set", description: "Basic, filtered, and global search variants in one set", category: "search", jsxCode: JSON.stringify({ placeholders: { basic: "Search anything...", filtered: "Search users...", global: "Search dashboards..." }, filters: ["All", "Active", "Inactive"] }) },
];

const WIDGET_CACHE_KEY = "widgets:all";
const WIDGET_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  console.log(`Debug flow: GET /api/widgets fired with`, { timestamp: new Date().toISOString() });

  try {
    const widgets = await getOrLoadCache(WIDGET_CACHE_KEY, async () => {
      // Always sync defaults so newly added slugs backfill into existing DBs.
      await prisma.widgetTemplate.createMany({
        data: DEFAULT_WIDGETS,
        skipDuplicates: true,
      });
      console.log(`Debug flow: GET /api/widgets default sync complete`, { defaultCount: DEFAULT_WIDGETS.length });

      const freshWidgets = await prisma.widgetTemplate.findMany({
        orderBy: { createdAt: "asc" },
      });
      console.log(`Debug flow: GET /api/widgets fetched widgets`, { count: freshWidgets.length });

      return freshWidgets;
    }, WIDGET_CACHE_TTL_MS);

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Debug flow: GET /api/widgets error", error);
    const now = new Date().toISOString();
    const fallbackWidgets = DEFAULT_WIDGETS.map((widget, idx) => ({
      id: `fallback-${idx + 1}`,
      slug: widget.slug,
      title: widget.title,
      description: widget.description,
      category: widget.category,
      jsxCode: widget.jsxCode,
      createdAt: now,
      updatedAt: now,
    }));
    console.log(`Debug flow: GET /api/widgets fallback fired with`, { count: fallbackWidgets.length });
    return NextResponse.json({ widgets: fallbackWidgets });
  }
}
