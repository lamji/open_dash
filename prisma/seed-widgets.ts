// seed-widgets.ts — full widget library with JSON config data
import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaNeon } from '@prisma/adapter-neon';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const widgets = [
  // ── STATS ──────────────────────────────────────────────────────
  {
    slug: 'revenue-kpi',
    title: 'Revenue KPI Card',
    description: 'Total revenue with trend indicator',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '$45,231', label: 'Total Revenue', trend: '+12.5%', trendUp: true, period: 'This month', icon: 'dollar' }),
  },
  {
    slug: 'user-growth',
    title: 'User Growth Card',
    description: 'Active users with growth percentage',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '12,543', label: 'Active Users', trend: '+8.2%', trendUp: true, period: 'This week', icon: 'users' }),
  },
  {
    slug: 'conversion-rate',
    title: 'Conversion Rate Card',
    description: 'Conversion rate with trend',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '3.24%', label: 'Conversion Rate', trend: '-1.2%', trendUp: false, period: 'vs last week', icon: 'target' }),
  },
  {
    slug: 'sparkline',
    title: 'Trend Sparkline Card',
    description: 'Page views with mini bar trend chart',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '2,543', label: 'Page Views', bars: [30,45,35,60,50,70,65,80,75,85,90,95], period: 'Today', icon: 'zap' }),
  },
  {
    slug: 'satisfaction',
    title: 'Customer Satisfaction',
    description: 'Star rating with review count',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '4.8', label: 'Customer Satisfaction', maxRating: 5, filledStars: 4, reviews: 1234, period: '1,234 reviews' }),
  },
  {
    slug: 'realtime-users',
    title: 'Active Users Real-time',
    description: 'Live active user count with pulse indicator',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '1,234', label: 'Active Users Now', period: 'Online right now', live: true }),
  },
  {
    slug: 'weekly-summary',
    title: 'Weekly Summary Card',
    description: 'Multi-metric weekly snapshot',
    category: 'stats',
    jsxCode: JSON.stringify({ metrics: [{ label: 'Orders', value: '234', color: 'blue' }, { label: 'Revenue', value: '$12K', color: 'emerald' }, { label: 'Users', value: '1.2K', color: 'violet' }, { label: 'Tasks', value: '45', color: 'orange' }] }),
  },
  {
    slug: 'net-profit',
    title: 'Net Profit Card',
    description: 'Net profit with quarterly trend',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '$28,450', label: 'Net Profit', trend: '+9.3%', trendUp: true, period: 'This quarter', icon: 'dollar' }),
  },
  {
    slug: 'avg-order-value',
    title: 'Average Order Value',
    description: 'Mean order value over the last 30 days',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '$124.50', label: 'Avg Order Value', trend: '+3.2%', trendUp: true, period: 'Last 30 days', icon: 'shopping' }),
  },
  {
    slug: 'churn-rate',
    title: 'Churn Rate Card',
    description: 'Monthly customer churn percentage',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '2.1%', label: 'Churn Rate', trend: '-0.5%', trendUp: false, period: 'Monthly', icon: 'trend-down' }),
  },
  {
    slug: 'mrr',
    title: 'Monthly Recurring Revenue',
    description: 'MRR with month-over-month growth',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '$89,200', label: 'Monthly Recurring Revenue', trend: '+15.8%', trendUp: true, period: 'This month', icon: 'dollar' }),
  },
  {
    slug: 'customer-ltv',
    title: 'Customer Lifetime Value',
    description: 'Average customer LTV metric',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '$1,840', label: 'Customer LTV', trend: '+6.4%', trendUp: true, period: 'Average', icon: 'users' }),
  },
  {
    slug: 'bounce-rate',
    title: 'Bounce Rate Card',
    description: 'Website bounce rate with trend',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '42.3%', label: 'Bounce Rate', trend: '-2.1%', trendUp: false, period: 'vs last week', icon: 'activity' }),
  },
  {
    slug: 'session-duration',
    title: 'Average Session Duration',
    description: 'Mean user session time on site',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '3m 42s', label: 'Avg Session Duration', trend: '+0.8%', trendUp: true, period: 'vs last week', icon: 'clock' }),
  },
  {
    slug: 'cart-abandonment',
    title: 'Cart Abandonment Rate',
    description: 'Shopping cart abandonment percentage',
    category: 'stats',
    jsxCode: JSON.stringify({ value: '68.2%', label: 'Cart Abandonment', trend: '-2.4%', trendUp: false, period: 'This month', icon: 'shopping' }),
  },

  // ── CHARTS ─────────────────────────────────────────────────────
  {
    slug: 'revenue-chart',
    title: 'Monthly Revenue Chart',
    description: 'Bar chart of monthly revenue figures',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Monthly Revenue', bars: [50,65,80,100,75,90], labels: ['Jan','Feb','Mar','Apr','May','Jun'] }),
  },
  {
    slug: 'activity-chart',
    title: 'User Activity Chart',
    description: 'Daily activity bar chart',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'User Activity', bars: [40,60,45,80,55,70,65,85,75,90,80,95] }),
  },
  {
    slug: 'traffic-pie',
    title: 'Traffic Sources Pie',
    description: 'Traffic distribution as a donut chart',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Traffic Sources', segments: [{ label: 'Direct', value: '45%', pct: 45, color: '#6366f1' }, { label: 'Organic', value: '30%', pct: 30, color: '#a855f7' }, { label: 'Social', value: '25%', pct: 25, color: '#ec4899' }] }),
  },
  {
    slug: 'heatmap',
    title: 'Performance Heatmap',
    description: 'Calendar-style activity heatmap',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Performance Heatmap', cells: 35, palette: ['bg-slate-100','bg-emerald-200','bg-emerald-400','bg-emerald-600'] }),
  },
  {
    slug: 'line-trend',
    title: 'Revenue Trend Line',
    description: 'Year-long revenue trend line chart',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Revenue Trend', points: [20,35,28,45,38,55,48,62,55,70,65,78], labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }),
  },
  {
    slug: 'area-traffic',
    title: 'Website Traffic Area',
    description: 'Area chart showing traffic volume over time',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Website Traffic', points: [30,45,35,60,50,70,65,80,75,90], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed'] }),
  },
  {
    slug: 'donut-budget',
    title: 'Budget Allocation Donut',
    description: 'Department budget split as donut chart',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Budget Allocation', segments: [{ label: 'Engineering', value: 40, color: '#6366f1' }, { label: 'Marketing', value: 35, color: '#a855f7' }, { label: 'Sales', value: 15, color: '#ec4899' }, { label: 'Other', value: 10, color: '#f59e0b' }] }),
  },
  {
    slug: 'horizontal-bar',
    title: 'Quarterly Performance Bars',
    description: 'Horizontal bar chart for quarterly metrics',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Quarterly Performance', bars: [{ label: 'Q1', value: 65 }, { label: 'Q2', value: 80 }, { label: 'Q3', value: 72 }, { label: 'Q4', value: 91 }] }),
  },
  {
    slug: 'stacked-bar',
    title: 'Stacked Revenue Bar',
    description: 'Monthly stacked bar chart by channel',
    category: 'charts',
    jsxCode: JSON.stringify({ title: 'Revenue by Channel', groups: [{ label: 'Jan', a: 40, b: 30, c: 20 }, { label: 'Feb', a: 45, b: 35, c: 25 }, { label: 'Mar', a: 50, b: 32, c: 28 }], legend: ['Organic','Paid','Email'] }),
  },

  // ── PROGRESS ───────────────────────────────────────────────────
  {
    slug: 'sales-target',
    title: 'Sales Target Progress',
    description: 'Sales progress bar towards target',
    category: 'progress',
    jsxCode: JSON.stringify({ label: 'Sales Target', current: 75000, target: 100000, pct: 75, currentLabel: '$75,000', targetLabel: '$100,000' }),
  },
  {
    slug: 'goal-tracker',
    title: 'Goal Progress Tracker',
    description: 'Multi-goal quarterly progress bars',
    category: 'progress',
    jsxCode: JSON.stringify({ title: 'Quarterly Goals', goals: [{ name: 'Revenue', pct: 85 }, { name: 'Users', pct: 70 }, { name: 'Engagement', pct: 92 }] }),
  },
  {
    slug: 'department-budget',
    title: 'Department Budget Usage',
    description: 'Budget consumption per department',
    category: 'progress',
    jsxCode: JSON.stringify({ title: 'Department Budgets', departments: [{ name: 'Engineering', used: 78, total: 100 }, { name: 'Marketing', used: 52, total: 100 }, { name: 'Sales', used: 91, total: 100 }] }),
  },
  {
    slug: 'sprint-progress',
    title: 'Sprint Progress',
    description: 'Agile sprint completion tracker',
    category: 'progress',
    jsxCode: JSON.stringify({ sprint: 'Sprint 12', done: 18, total: 24, pct: 75, daysLeft: 3 }),
  },

  // ── ACTIVITY ───────────────────────────────────────────────────
  {
    slug: 'activity-feed',
    title: 'Recent Activity Feed',
    description: 'Live activity feed with timestamps',
    category: 'activity',
    jsxCode: JSON.stringify({ items: [{ color: 'bg-emerald-500', text: 'New user signed up', time: '2 min ago' }, { color: 'bg-blue-500', text: 'Order #1234 completed', time: '15 min ago' }, { color: 'bg-violet-500', text: 'Payment received', time: '1 hr ago' }] }),
  },
  {
    slug: 'error-log',
    title: 'Error Log Feed',
    description: 'Real-time application error and warning feed',
    category: 'activity',
    jsxCode: JSON.stringify({ items: [{ level: 'error', message: 'TypeError in /api/widgets', time: '5 min ago' }, { level: 'warn', message: 'High memory usage detected', time: '12 min ago' }, { level: 'info', message: 'Deployment completed successfully', time: '1 hr ago' }] }),
  },
  {
    slug: 'notification-center',
    title: 'Notification Center',
    description: 'Recent notifications and alerts panel',
    category: 'activity',
    jsxCode: JSON.stringify({ notifications: [{ icon: 'bell', title: 'New comment', text: 'Alice commented on your post', time: '2 min ago', color: 'bg-blue-500' }, { icon: 'check', title: 'Task complete', text: 'Deploy to production succeeded', time: '30 min ago', color: 'bg-emerald-500' }, { icon: 'alert', title: 'Low stock', text: 'Widget Lite is running low', time: '1 hr ago', color: 'bg-yellow-500' }] }),
  },
  {
    slug: 'audit-trail',
    title: 'Audit Trail',
    description: 'User action audit log with actor and timestamp',
    category: 'activity',
    jsxCode: JSON.stringify({ entries: [{ user: 'Alice M.', action: 'Updated pricing config', time: '3 min ago' }, { user: 'Bob K.', action: 'Exported customer data', time: '1 hr ago' }, { user: 'Admin', action: 'New role assigned', time: '2 hrs ago' }] }),
  },

  // ── LISTS ──────────────────────────────────────────────────────
  {
    slug: 'top-products',
    title: 'Top Products List',
    description: 'Best selling products with bar indicators',
    category: 'list',
    jsxCode: JSON.stringify({ items: [{ name: 'Widget Pro', sales: 234, pct: 95 }, { name: 'Widget Lite', sales: 189, pct: 77 }, { name: 'Widget Max', sales: 156, pct: 63 }] }),
  },
  {
    slug: 'team-performance',
    title: 'Team Performance List',
    description: 'Team member scores with progress bars',
    category: 'list',
    jsxCode: JSON.stringify({ members: [{ name: 'Alice', score: 95 }, { name: 'Bob', score: 88 }, { name: 'Charlie', score: 92 }] }),
  },

  // ── COMPARISON ─────────────────────────────────────────────────
  {
    slug: 'comparison',
    title: 'Month-over-Month Comparison',
    description: 'Key metrics this vs last month',
    category: 'comparison',
    jsxCode: JSON.stringify({ title: 'This vs Last Month', metrics: [{ metric: 'Revenue', curr: '$45,231', prev: '$40,200', up: true }, { metric: 'Orders', curr: '1,543', prev: '1,620', up: false }] }),
  },
  {
    slug: 'revenue-target',
    title: 'Revenue vs Target',
    description: 'Revenue progress bar against quarterly target',
    category: 'comparison',
    jsxCode: JSON.stringify({ actual: 85000, target: 100000, pct: 85, actualLabel: '$85,000', targetLabel: '$100,000', remaining: '$15,000 to go' }),
  },
  {
    slug: 'yoy-comparison',
    title: 'Year-over-Year Comparison',
    description: 'Key KPIs compared year-over-year',
    category: 'comparison',
    jsxCode: JSON.stringify({ currentYear: 2026, lastYear: 2025, metrics: [{ label: 'Revenue', curr: '$892K', prev: '$743K', up: true }, { label: 'Customers', curr: '24.5K', prev: '19.2K', up: true }] }),
  },
  {
    slug: 'channel-attribution',
    title: 'Channel Attribution',
    description: 'Revenue attribution by acquisition channel',
    category: 'comparison',
    jsxCode: JSON.stringify({ title: 'Channel Attribution', channels: [{ label: 'Organic', value: 35, pct: 35, color: '#6366f1' }, { label: 'Paid', value: 28, pct: 28, color: '#a855f7' }, { label: 'Email', value: 22, pct: 22, color: '#ec4899' }, { label: 'Referral', value: 15, pct: 15, color: '#f59e0b' }] }),
  },
  {
    slug: 'region-breakdown',
    title: 'Regional Revenue Breakdown',
    description: 'Revenue distribution across geographic regions',
    category: 'comparison',
    jsxCode: JSON.stringify({ title: 'Regional Breakdown', regions: [{ name: 'North America', value: '45%', pct: 45, color: '#6366f1' }, { name: 'Europe', value: '30%', pct: 30, color: '#a855f7' }, { name: 'Asia Pacific', value: '18%', pct: 18, color: '#ec4899' }, { name: 'Other', value: '7%', pct: 7, color: '#f59e0b' }] }),
  },

  // ── TABLES ─────────────────────────────────────────────────────
  {
    slug: 'orders-table',
    title: 'Recent Orders Table',
    description: 'Latest orders with status badges',
    category: 'table',
    jsxCode: JSON.stringify({ title: 'Recent Orders', columns: ['Order','Customer','Amount','Status'], rows: [{ id: '#1234', customer: 'Alice M.', amount: '$230.00', status: 'Completed' }, { id: '#1235', customer: 'Bob K.', amount: '$89.00', status: 'Pending' }, { id: '#1236', customer: 'Carol D.', amount: '$450.00', status: 'Completed' }, { id: '#1237', customer: 'David R.', amount: '$120.00', status: 'Failed' }] }),
  },
  {
    slug: 'customers-table',
    title: 'Customer Overview Table',
    description: 'Customer list with plan and spending',
    category: 'table',
    jsxCode: JSON.stringify({ title: 'Customers', columns: ['Name','Email','Plan','Spend'], rows: [{ name: 'Alice M.', email: 'alice@co.com', plan: 'Pro', spend: '$2,340' }, { name: 'Bob K.', email: 'bob@co.com', plan: 'Free', spend: '$0' }, { name: 'Carol D.', email: 'carol@co.com', plan: 'Enterprise', spend: '$12,000' }] }),
  },
  {
    slug: 'transactions-table',
    title: 'Transaction Ledger',
    description: 'Recent financial transactions table',
    category: 'table',
    jsxCode: JSON.stringify({ title: 'Transactions', columns: ['Date','Description','Amount','Type'], rows: [{ date: '2026-03-04', desc: 'Stripe Payment', amount: '+$450.00', type: 'credit' }, { date: '2026-03-03', desc: 'Refund #1190', amount: '-$89.00', type: 'debit' }, { date: '2026-03-02', desc: 'Stripe Payment', amount: '+$1,200.00', type: 'credit' }] }),
  },
  {
    slug: 'inventory-table',
    title: 'Inventory Status Table',
    description: 'Product inventory levels and stock status',
    category: 'table',
    jsxCode: JSON.stringify({ title: 'Inventory', columns: ['Product','SKU','Stock','Status'], rows: [{ product: 'Widget Pro', sku: 'WP-001', stock: 234, status: 'In Stock' }, { product: 'Widget Lite', sku: 'WL-002', stock: 12, status: 'Low Stock' }, { product: 'Widget Max', sku: 'WM-003', stock: 0, status: 'Out of Stock' }] }),
  },

  // ── HEALTH ─────────────────────────────────────────────────────
  {
    slug: 'system-health',
    title: 'System Health Status',
    description: 'Service uptime and health monitoring',
    category: 'health',
    jsxCode: JSON.stringify({ services: [{ name: 'API', status: 'Operational', ok: true }, { name: 'Database', status: 'Operational', ok: true }, { name: 'Cache', status: 'Degraded', ok: false }] }),
  },
  {
    slug: 'api-latency',
    title: 'API Latency Monitor',
    description: 'P50/P99 latency per endpoint',
    category: 'health',
    jsxCode: JSON.stringify({ title: 'API Latency', services: [{ name: 'GET /api/users', p50: 45, p99: 180 }, { name: 'POST /api/orders', p50: 120, p99: 450 }, { name: 'GET /api/widgets', p50: 23, p99: 89 }] }),
  },
  {
    slug: 'error-rate',
    title: 'Error Rate Gauge',
    description: 'Application error rate with 7-day trend',
    category: 'health',
    jsxCode: JSON.stringify({ value: '0.23%', label: 'Error Rate', trend: '-0.05%', trendUp: false, bars: [2,1,3,1,0,2,1], period: 'Last 7 days' }),
  },
  {
    slug: 'uptime-monitor',
    title: 'Uptime Monitor',
    description: 'Service uptime percentages over 30 days',
    category: 'health',
    jsxCode: JSON.stringify({ services: [{ name: 'API', uptime: 99.98, status: 'up' }, { name: 'Database', uptime: 99.95, status: 'up' }, { name: 'CDN', uptime: 100, status: 'up' }, { name: 'Auth', uptime: 98.2, status: 'degraded' }] }),
  },

  // ── TIMELINE ───────────────────────────────────────────────────
  {
    slug: 'timeline',
    title: 'Timeline Events',
    description: 'Upcoming and recent event timeline',
    category: 'timeline',
    jsxCode: JSON.stringify({ events: [{ title: 'Product Launch', time: 'Today', color: 'bg-indigo-500' }, { title: 'Team Meeting', time: 'Tomorrow', color: 'bg-violet-500' }, { title: 'Q4 Review', time: 'Next Week', color: 'bg-blue-500' }] }),
  },

  // ── FUNNEL ─────────────────────────────────────────────────────
  {
    slug: 'conversion-funnel',
    title: 'Conversion Funnel',
    description: 'Visitor-to-paid conversion funnel stages',
    category: 'funnel',
    jsxCode: JSON.stringify({ title: 'Conversion Funnel', stages: [{ label: 'Visitors', value: 10000, pct: 100 }, { label: 'Sign-ups', value: 2400, pct: 24 }, { label: 'Activated', value: 1200, pct: 12 }, { label: 'Paid', value: 360, pct: 3.6 }] }),
  },
  {
    slug: 'sales-pipeline',
    title: 'Sales Pipeline Funnel',
    description: 'CRM pipeline stages with deal counts',
    category: 'funnel',
    jsxCode: JSON.stringify({ title: 'Sales Pipeline', stages: [{ label: 'Leads', value: 450, pct: 100 }, { label: 'Qualified', value: 280, pct: 62 }, { label: 'Proposal', value: 140, pct: 31 }, { label: 'Closed Won', value: 78, pct: 17 }] }),
  },

  // ── LEADERBOARD ────────────────────────────────────────────────
  {
    slug: 'agent-leaderboard',
    title: 'Agent Leaderboard',
    description: 'Top performing agents ranked by score',
    category: 'leaderboard',
    jsxCode: JSON.stringify({ title: 'Top Agents', entries: [{ rank: 1, name: 'Alice M.', score: 2840, badge: 'gold' }, { rank: 2, name: 'Bob K.', score: 2310, badge: 'silver' }, { rank: 3, name: 'Carol D.', score: 1980, badge: 'bronze' }, { rank: 4, name: 'David R.', score: 1560, badge: null }] }),
  },
  {
    slug: 'product-leaderboard',
    title: 'Product Revenue Leaderboard',
    description: 'Top products ranked by revenue',
    category: 'leaderboard',
    jsxCode: JSON.stringify({ title: 'Top Products by Revenue', entries: [{ rank: 1, name: 'Widget Pro', revenue: '$45,200', units: 234 }, { rank: 2, name: 'Widget Max', revenue: '$32,100', units: 145 }, { rank: 3, name: 'Widget Lite', revenue: '$18,900', units: 312 }] }),
  },

  // ── SUMMARY ────────────────────────────────────────────────────
  {
    slug: 'executive-summary',
    title: 'Executive Summary Panel',
    description: 'High-level KPI overview for leadership',
    category: 'summary',
    jsxCode: JSON.stringify({ title: 'Executive Summary', kpis: [{ label: 'Revenue', value: '$892K', trend: '+12%', up: true }, { label: 'Users', value: '24.5K', trend: '+8%', up: true }, { label: 'NPS', value: '72', trend: '+5', up: true }, { label: 'Churn', value: '2.1%', trend: '-0.5%', up: false }] }),
  },
  {
    slug: 'monthly-metrics',
    title: 'Monthly Metrics Summary',
    description: 'Key monthly business metrics snapshot',
    category: 'summary',
    jsxCode: JSON.stringify({ month: 'March 2026', metrics: [{ label: 'Total Sales', value: '$124,500' }, { label: 'New Customers', value: '342' }, { label: 'Support Tickets', value: '89' }, { label: 'Avg Resolution', value: '4.2 hrs' }] }),
  },
  {
    slug: 'kpi-scorecard',
    title: 'KPI Scorecard',
    description: 'Comprehensive KPI scorecard with RAG status',
    category: 'summary',
    jsxCode: JSON.stringify({ title: 'KPI Scorecard', items: [{ kpi: 'Revenue Growth', value: '12%', target: '10%', status: 'green' }, { kpi: 'Customer Churn', value: '2.1%', target: '< 3%', status: 'green' }, { kpi: 'NPS Score', value: '72', target: '> 70', status: 'green' }, { kpi: 'Ticket SLA', value: '87%', target: '> 90%', status: 'amber' }] }),
  },

  // ── BUTTON ──────────────────────────────────────────────────────
  {
    slug: 'primary-button',
    title: 'Primary Button',
    description: 'Primary action button with variants (outline, ghost, danger)',
    category: 'button',
    jsxCode: JSON.stringify({ label: 'Save Changes', variant: 'primary', description: 'Primary action button' }),
  },
  {
    slug: 'button-group',
    title: 'Button Group',
    description: 'Row of contextual action buttons grouped together',
    category: 'button',
    jsxCode: JSON.stringify({ buttons: [{ label: 'Edit', variant: 'outline' }, { label: 'Share', variant: 'outline' }, { label: 'Delete', variant: 'destructive' }] }),
  },
  {
    slug: 'icon-button-bar',
    title: 'Icon Button Bar',
    description: 'Toolbar of icon-only buttons for rich text or actions',
    category: 'button',
    jsxCode: JSON.stringify({ buttons: [{ tooltip: 'Bold' }, { tooltip: 'Italic' }, { tooltip: 'Underline' }, { tooltip: 'Align Left' }, { tooltip: 'Align Center' }] }),
  },
  {
    slug: 'split-button',
    title: 'Split Button',
    description: 'Primary action with expandable secondary options dropdown',
    category: 'button',
    jsxCode: JSON.stringify({ label: 'Export', options: ['Export as CSV', 'Export as PDF', 'Export as Excel'] }),
  },
  {
    slug: 'toggle-button-group',
    title: 'Toggle Button Group',
    description: 'Segmented control for switching between exclusive views',
    category: 'button',
    jsxCode: JSON.stringify({ options: ['List', 'Grid', 'Kanban'], selected: 'List' }),
  },

  // ── DROPDOWN ────────────────────────────────────────────────────
  {
    slug: 'single-select-dropdown',
    title: 'Single Select Dropdown',
    description: 'Dropdown to select one value from a list of options',
    category: 'dropdown',
    jsxCode: JSON.stringify({ label: 'Select Status', placeholder: 'Choose status...', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }, { value: 'archived', label: 'Archived' }], selected: 'active' }),
  },
  {
    slug: 'multi-select-dropdown',
    title: 'Multi Select Dropdown',
    description: 'Checkbox dropdown for selecting multiple values with tags',
    category: 'dropdown',
    jsxCode: JSON.stringify({ label: 'Assign Labels', placeholder: 'Select labels...', options: [{ value: 'bug', label: 'Bug' }, { value: 'feature', label: 'Feature' }, { value: 'docs', label: 'Docs' }, { value: 'urgent', label: 'Urgent' }], selected: ['bug', 'feature'] }),
  },
  {
    slug: 'searchable-dropdown',
    title: 'Searchable Dropdown',
    description: 'Dropdown with built-in search for large option lists',
    category: 'dropdown',
    jsxCode: JSON.stringify({ label: 'Select User', placeholder: 'Search users...', options: [{ value: 'alice', label: 'Alice Johnson' }, { value: 'bob', label: 'Bob Smith' }, { value: 'carol', label: 'Carol White' }, { value: 'dave', label: 'Dave Brown' }] }),
  },
  {
    slug: 'date-range-picker',
    title: 'Date Range Picker',
    description: 'Select a start and end date for filtering or scheduling',
    category: 'dropdown',
    jsxCode: JSON.stringify({ label: 'Date Range', from: 'Mar 1, 2026', to: 'Mar 31, 2026' }),
  },

  // ── MENU ────────────────────────────────────────────────────────
  {
    slug: 'sidebar-nav-menu',
    title: 'Sidebar Nav Menu',
    description: 'Vertical navigation list with icons, badges, and active states',
    category: 'menu',
    jsxCode: JSON.stringify({ items: [{ icon: 'LayoutDashboard', label: 'Dashboard', active: true }, { icon: 'BarChart2', label: 'Analytics' }, { icon: 'Users', label: 'Users', badge: '3' }, { icon: 'Settings', label: 'Settings' }, { icon: 'HelpCircle', label: 'Help' }] }),
  },
  {
    slug: 'breadcrumb-nav',
    title: 'Breadcrumb Nav',
    description: 'Horizontal breadcrumb trail showing the current page path',
    category: 'menu',
    jsxCode: JSON.stringify({ items: ['Home', 'Dashboard', 'Analytics', 'Revenue'] }),
  },
  {
    slug: 'tab-bar',
    title: 'Tab Bar',
    description: 'Horizontal tabs for switching between content sections',
    category: 'menu',
    jsxCode: JSON.stringify({ tabs: [{ label: 'Overview', active: true }, { label: 'Analytics' }, { label: 'Reports' }, { label: 'Team' }] }),
  },
  {
    slug: 'command-palette',
    title: 'Command Palette',
    description: 'Cmd+K style command menu for quick navigation and actions',
    category: 'menu',
    jsxCode: JSON.stringify({ placeholder: 'Type a command or search...', items: [{ icon: 'Plus', label: 'New Widget' }, { icon: 'Search', label: 'Search Data' }, { icon: 'Settings', label: 'Open Settings' }, { icon: 'LogOut', label: 'Sign Out' }] }),
  },

  // ── SEARCH ──────────────────────────────────────────────────────
  {
    slug: 'search-bar',
    title: 'Search Bar',
    description: 'Simple search input with keyboard shortcut hint',
    category: 'search',
    jsxCode: JSON.stringify({ placeholder: 'Search anything...' }),
  },
  {
    slug: 'search-with-filters',
    title: 'Search With Filters',
    description: 'Search input combined with quick filter chips',
    category: 'search',
    jsxCode: JSON.stringify({ placeholder: 'Search users...', filters: [{ label: 'All', active: true }, { label: 'Active' }, { label: 'Inactive' }, { label: 'Admin' }] }),
  },
  {
    slug: 'global-search',
    title: 'Global Search',
    description: 'Full global search with categories, counts, and recent items',
    category: 'search',
    jsxCode: JSON.stringify({ placeholder: 'Search...', categories: [{ label: 'Pages', count: 12 }, { label: 'Users', count: 48 }, { label: 'Reports', count: 7 }], recent: ['Revenue report', 'User analytics', 'Q4 dashboard'] }),
  },

  // ── FORM ────────────────────────────────────────────────────────
  {
    slug: 'text-input',
    title: 'Text Input',
    description: 'Labeled text input with helper text and error state demo',
    category: 'form',
    jsxCode: JSON.stringify({ label: 'Full Name', placeholder: 'Enter your full name', helperText: 'Used for display purposes', required: true }),
  },
  {
    slug: 'form-field-group',
    title: 'Form Field Group',
    description: 'Grid of form fields (text, email, select) with submit button',
    category: 'form',
    jsxCode: JSON.stringify({ fields: [{ label: 'First Name', placeholder: 'John', type: 'text' }, { label: 'Last Name', placeholder: 'Doe', type: 'text' }, { label: 'Email', placeholder: 'john@example.com', type: 'email' }, { label: 'Role', placeholder: 'Select role', type: 'select' }] }),
  },
  {
    slug: 'tag-input',
    title: 'Tag Input',
    description: 'Multi-value tag input for labels, keywords, or categories',
    category: 'form',
    jsxCode: JSON.stringify({ label: 'Tags', tags: ['Dashboard', 'Analytics', 'Revenue', 'Q4'], placeholder: 'Add a tag...' }),
  },
  {
    slug: 'rating-widget',
    title: 'Rating Widget',
    description: 'Star rating input with label and visual progress scale',
    category: 'form',
    jsxCode: JSON.stringify({ label: 'Rate your experience', value: 4, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }),
  },
];

async function main() {
  console.log('Debug flow: seed-widgets main fired with', { widgetCount: widgets.length });
  
  console.log('Seeding widgets...');
  
  for (const widget of widgets) {
    await prisma.widgetTemplate.upsert({
      where: { slug: widget.slug },
      update: widget,
      create: widget,
    });
    console.log(`✓ Seeded widget: ${widget.slug}`);
  }
  
  console.log(`✓ Successfully seeded ${widgets.length} widgets`);
}

main()
  .catch((e) => {
    console.error('Error seeding widgets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
