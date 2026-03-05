import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUILDER_WIDGETS = [
  // More STATS widgets
  { slug: "total-orders", title: "Total Orders", category: "stats", description: "Order count KPI", jsxCode: JSON.stringify({ label: "Orders", value: "1,543", change: "+8.2%", trend: "up" }) },
  { slug: "avg-order-value", title: "Average Order Value", category: "stats", description: "AOV metric", jsxCode: JSON.stringify({ label: "Avg Order", value: "$89.50", change: "+5.1%", trend: "up" }) },
  
  // More CHARTS widgets
  { slug: "sales-trend", title: "Sales Trend", category: "charts", description: "Monthly sales line chart", jsxCode: JSON.stringify({ title: "Sales", data: [120, 150, 180, 200, 190, 220] }) },
  { slug: "user-growth-chart", title: "User Growth Chart", category: "charts", description: "User growth over time", jsxCode: JSON.stringify({ title: "Users", data: [1000, 1200, 1500, 1800, 2100, 2400] }) },
  
  // More PROGRESS widgets
  { slug: "monthly-target", title: "Monthly Target", category: "progress", description: "Monthly goal progress", jsxCode: JSON.stringify({ label: "Monthly Goal", current: 85, target: 100 }) },
  { slug: "annual-revenue", title: "Annual Revenue Goal", category: "progress", description: "Yearly revenue target", jsxCode: JSON.stringify({ label: "Annual Revenue", current: 750000, target: 1000000 }) },
  
  // More ACTIVITY widgets
  { slug: "user-actions", title: "User Actions", category: "activity", description: "Recent user actions feed", jsxCode: JSON.stringify({ items: [{ user: "Alice", action: "created dashboard", time: "1m ago" }, { user: "Bob", action: "updated report", time: "5m ago" }] }) },
  { slug: "system-events", title: "System Events", category: "activity", description: "System event log", jsxCode: JSON.stringify({ items: [{ event: "Backup completed", time: "10m ago" }, { event: "Cache cleared", time: "30m ago" }] }) },
  
  // More HEALTH widgets
  { slug: "database-health", title: "Database Health", category: "health", description: "DB connection status", jsxCode: JSON.stringify({ status: "healthy", connections: 45, maxConnections: 100 }) },
  { slug: "server-status", title: "Server Status", category: "health", description: "Server uptime monitor", jsxCode: JSON.stringify({ status: "operational", uptime: "99.95%", cpu: "45%", memory: "62%" }) },
  
  // More TIMELINE widgets
  { slug: "project-milestones", title: "Project Milestones", category: "timeline", description: "Project timeline", jsxCode: JSON.stringify({ events: [{ title: "Kickoff", date: "Jan 1" }, { title: "Alpha", date: "Feb 15" }, { title: "Beta", date: "Mar 30" }] }) },
  { slug: "release-schedule", title: "Release Schedule", category: "timeline", description: "Upcoming releases", jsxCode: JSON.stringify({ events: [{ title: "v1.1", date: "Next week" }, { title: "v1.2", date: "Next month" }] }) },
  
  // More TABLE widgets
  { slug: "transactions-table", title: "Recent Transactions", category: "table", description: "Transaction history", jsxCode: JSON.stringify({ columns: ["ID", "Amount", "Status", "Date"], rows: [["#001", "$250", "Completed", "Today"], ["#002", "$180", "Pending", "Today"]] }) },
  { slug: "users-table", title: "Active Users", category: "table", description: "User list table", jsxCode: JSON.stringify({ columns: ["Name", "Email", "Role", "Status"], rows: [["Alice", "alice@example.com", "Admin", "Active"], ["Bob", "bob@example.com", "User", "Active"]] }) },
  
  // More FUNNEL widgets
  { slug: "signup-funnel", title: "Signup Funnel", category: "funnel", description: "User signup conversion", jsxCode: JSON.stringify({ stages: [{ name: "Landing", value: 5000 }, { name: "Signup", value: 1200 }, { name: "Verified", value: 800 }] }) },
  { slug: "checkout-funnel", title: "Checkout Funnel", category: "funnel", description: "Checkout conversion", jsxCode: JSON.stringify({ stages: [{ name: "Cart", value: 1000 }, { name: "Checkout", value: 600 }, { name: "Payment", value: 450 }] }) },
  
  // More LEADERBOARD widgets
  { slug: "sales-leaderboard", title: "Sales Leaderboard", category: "leaderboard", description: "Top sales performers", jsxCode: JSON.stringify({ entries: [{ rank: 1, name: "Alice", score: 125000 }, { rank: 2, name: "Bob", score: 98000 }, { rank: 3, name: "Carol", score: 87000 }] }) },
  { slug: "customer-leaderboard", title: "Top Customers", category: "leaderboard", description: "Highest spending customers", jsxCode: JSON.stringify({ entries: [{ rank: 1, name: "Acme Corp", score: 45000 }, { rank: 2, name: "Tech Inc", score: 38000 }] }) },
  
  // More SUMMARY widgets
  { slug: "weekly-summary", title: "Weekly Summary", category: "summary", description: "Weekly metrics overview", jsxCode: JSON.stringify({ metrics: [{ label: "Revenue", value: "$125K" }, { label: "Orders", value: "1,234" }, { label: "Users", value: "5,678" }] }) },
  { slug: "monthly-summary", title: "Monthly Summary", category: "summary", description: "Monthly KPI summary", jsxCode: JSON.stringify({ metrics: [{ label: "Revenue", value: "$450K" }, { label: "Growth", value: "+12%" }, { label: "Churn", value: "2.1%" }] }) },
];

export async function POST() {
  console.log(`Debug flow: POST /api/seed-builder-widgets fired`);
  
  try {
    let created = 0;
    let updated = 0;
    
    for (const widget of BUILDER_WIDGETS) {
      const existing = await prisma.widgetTemplate.findUnique({
        where: { slug: widget.slug },
      });
      
      if (existing) {
        await prisma.widgetTemplate.update({
          where: { slug: widget.slug },
          data: {
            title: widget.title,
            category: widget.category,
            description: widget.description,
            jsxCode: widget.jsxCode,
          },
        });
        updated++;
      } else {
        await prisma.widgetTemplate.create({
          data: widget,
        });
        created++;
      }
    }
    
    console.log(`Debug flow: POST /api/seed-builder-widgets complete`, { created, updated });
    
    return NextResponse.json({ 
      ok: true, 
      created, 
      updated,
      total: BUILDER_WIDGETS.length,
      message: `Seeded ${created} new widgets, updated ${updated} existing widgets`
    });
  } catch (error) {
    console.error(`Debug flow: POST /api/seed-builder-widgets error`, error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
