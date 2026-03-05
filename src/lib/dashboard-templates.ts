/**
 * Pre-built Dashboard Layout Templates
 * 
 * Based on UI/UX best practices from:
 * https://medium.com/@CarlosSmith24/how-to-create-user-friendly-admin-dashboards-with-effective-ui-ux-design-e6860df39066
 * 
 * Each template is a complete component tree structure that can be instantly applied.
 * Templates demonstrate nested column capabilities and common dashboard patterns.
 */

export interface TemplateComponent {
  type: string;
  config: Record<string, unknown>;
  children?: TemplateComponent[];
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: "metrics" | "analytics" | "monitoring" | "grid";
  components: TemplateComponent[];
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: "metrics-overview",
    name: "Metrics Overview",
    description: "Top row of stat cards with charts below - perfect for KPI dashboards",
    preview: "📊 [Cards] [Cards] [Cards] [Cards]\n📈 [Chart -------- Wide --------]",
    category: "metrics",
    components: [
      {
        type: "container",
        config: {
          display: "flex",
          direction: "column",
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "analytics-cards",
            config: {
              columns: 4,
              cards: [
                { title: "Total Revenue", value: "$45,231", change: "+20.1%", trend: "up", icon: "DollarSign" },
                { title: "Active Users", value: "2,350", change: "+15.3%", trend: "up", icon: "Users" },
                { title: "Conversion Rate", value: "3.24%", change: "-2.4%", trend: "down", icon: "TrendingUp" },
                { title: "Avg. Order Value", value: "$124", change: "+5.2%", trend: "up", icon: "ShoppingCart" },
              ],
            },
          },
          {
            type: "chart-bar",
            config: {
              title: "Monthly Revenue",
              xKey: "month",
              bars: [
                { dataKey: "revenue", label: "Revenue", color: "#06b6d4" },
              ],
              data: [
                { month: "Jan", revenue: 4000 },
                { month: "Feb", revenue: 3000 },
                { month: "Mar", revenue: 5000 },
                { month: "Apr", revenue: 4500 },
                { month: "May", revenue: 6000 },
                { month: "Jun", revenue: 5500 },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    id: "split-dashboard",
    name: "Split Dashboard",
    description: "Sidebar metrics with main content area - ideal for monitoring dashboards",
    preview: "[Metrics] | [Main Content Area    ]\n[Cards  ] | [Chart & Table        ]",
    category: "analytics",
    components: [
      {
        type: "container",
        config: {
          display: "flex",
          direction: "row",
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 4,
              className: "w-64",
            },
            children: [
              {
                type: "analytics-cards",
                config: {
                  columns: 1,
                  cards: [
                    { title: "Today", value: "1,234", icon: "Calendar" },
                    { title: "This Week", value: "8,456", icon: "TrendingUp" },
                    { title: "This Month", value: "34,567", icon: "BarChart" },
                  ],
                },
              },
            ],
          },
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 6,
              className: "flex-1",
            },
            children: [
              {
                type: "chart-line",
                config: {
                  title: "Traffic Trend",
                  xKey: "day",
                  lines: [
                    { dataKey: "visitors", label: "Visitors", color: "#06b6d4" },
                  ],
                  data: [
                    { day: "Mon", visitors: 120 },
                    { day: "Tue", visitors: 150 },
                    { day: "Wed", visitors: 180 },
                    { day: "Thu", visitors: 160 },
                    { day: "Fri", visitors: 200 },
                    { day: "Sat", visitors: 140 },
                    { day: "Sun", visitors: 110 },
                  ],
                },
              },
              {
                type: "table",
                config: {
                  title: "Recent Activity",
                  searchable: true,
                  columns: [
                    { accessorKey: "user", header: "User", sortable: true },
                    { accessorKey: "action", header: "Action", sortable: false },
                    { accessorKey: "time", header: "Time", sortable: true },
                  ],
                  data: [
                    { user: "John Doe", action: "Login", time: "2 min ago" },
                    { user: "Jane Smith", action: "Purchase", time: "5 min ago" },
                    { user: "Bob Wilson", action: "Signup", time: "10 min ago" },
                  ],
                  pagination: { enabled: true, pageSize: 5 },
                },
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "grid-dashboard",
    name: "Grid Dashboard",
    description: "Equal-sized cards in responsive grid - perfect for balanced layouts",
    preview: "[Card] [Card] [Card]\n[Card] [Card] [Card]",
    category: "grid",
    components: [
      {
        type: "container",
        config: {
          display: "grid",
          columns: 3,
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "analytics-cards",
            config: {
              columns: 1,
              cards: [{ title: "Revenue", value: "$12,345", trend: "up", change: "+12%" }],
            },
          },
          {
            type: "analytics-cards",
            config: {
              columns: 1,
              cards: [{ title: "Orders", value: "234", trend: "up", change: "+8%" }],
            },
          },
          {
            type: "analytics-cards",
            config: {
              columns: 1,
              cards: [{ title: "Customers", value: "1,234", trend: "up", change: "+15%" }],
            },
          },
          {
            type: "chart-bar",
            config: {
              title: "Sales by Category",
              xKey: "category",
              bars: [{ dataKey: "sales", label: "Sales", color: "#06b6d4" }],
              data: [
                { category: "Electronics", sales: 4500 },
                { category: "Clothing", sales: 3200 },
                { category: "Food", sales: 2800 },
              ],
            },
          },
          {
            type: "chart-line",
            config: {
              title: "Growth Trend",
              xKey: "month",
              lines: [{ dataKey: "growth", label: "Growth", color: "#10b981" }],
              data: [
                { month: "Jan", growth: 100 },
                { month: "Feb", growth: 120 },
                { month: "Mar", growth: 150 },
              ],
            },
          },
          {
            type: "table",
            config: {
              title: "Top Products",
              columns: [
                { accessorKey: "product", header: "Product" },
                { accessorKey: "sales", header: "Sales" },
              ],
              data: [
                { product: "Product A", sales: "$1,234" },
                { product: "Product B", sales: "$987" },
                { product: "Product C", sales: "$765" },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "Large chart at top with supporting metrics below - ideal for data analysis",
    preview: "[Large Chart --------------------]\n[Metric] [Metric] [Metric] [Metric]",
    category: "analytics",
    components: [
      {
        type: "container",
        config: {
          display: "flex",
          direction: "column",
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "chart-line",
            config: {
              title: "Performance Analytics",
              xKey: "date",
              lines: [
                { dataKey: "revenue", label: "Revenue", color: "#06b6d4" },
                { dataKey: "profit", label: "Profit", color: "#10b981" },
              ],
              data: [
                { date: "Week 1", revenue: 5000, profit: 2000 },
                { date: "Week 2", revenue: 6000, profit: 2500 },
                { date: "Week 3", revenue: 5500, profit: 2200 },
                { date: "Week 4", revenue: 7000, profit: 3000 },
              ],
            },
          },
          {
            type: "analytics-cards",
            config: {
              columns: 4,
              cards: [
                { title: "Total Sales", value: "$23,500", change: "+18%", trend: "up" },
                { title: "Profit Margin", value: "42%", change: "+3%", trend: "up" },
                { title: "Customers", value: "1,234", change: "+12%", trend: "up" },
                { title: "Avg. Order", value: "$95", change: "-2%", trend: "down" },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    id: "monitoring-dashboard",
    name: "Monitoring Dashboard",
    description: "Time-series charts stacked vertically - perfect for system monitoring",
    preview: "[Chart 1 --------]\n[Chart 2 --------]\n[Chart 3 --------]",
    category: "monitoring",
    components: [
      {
        type: "container",
        config: {
          display: "flex",
          direction: "column",
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "chart-line",
            config: {
              title: "CPU Usage",
              xKey: "time",
              lines: [{ dataKey: "cpu", label: "CPU %", color: "#ef4444" }],
              data: [
                { time: "00:00", cpu: 45 },
                { time: "04:00", cpu: 52 },
                { time: "08:00", cpu: 78 },
                { time: "12:00", cpu: 65 },
                { time: "16:00", cpu: 82 },
                { time: "20:00", cpu: 58 },
              ],
            },
          },
          {
            type: "chart-line",
            config: {
              title: "Memory Usage",
              xKey: "time",
              lines: [{ dataKey: "memory", label: "Memory %", color: "#f59e0b" }],
              data: [
                { time: "00:00", memory: 62 },
                { time: "04:00", memory: 65 },
                { time: "08:00", memory: 71 },
                { time: "12:00", memory: 68 },
                { time: "16:00", memory: 75 },
                { time: "20:00", memory: 64 },
              ],
            },
          },
          {
            type: "chart-line",
            config: {
              title: "Network Traffic",
              xKey: "time",
              lines: [{ dataKey: "traffic", label: "MB/s", color: "#06b6d4" }],
              data: [
                { time: "00:00", traffic: 12 },
                { time: "04:00", traffic: 15 },
                { time: "08:00", traffic: 28 },
                { time: "12:00", traffic: 22 },
                { time: "16:00", traffic: 35 },
                { time: "20:00", traffic: 18 },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    id: "kpi-dashboard",
    name: "KPI Dashboard",
    description: "Prominent numbers with mini trend charts - ideal for executive dashboards",
    preview: "[Big Number + Mini Chart] [Big Number + Mini Chart]\n[Big Number + Mini Chart] [Big Number + Mini Chart]",
    category: "metrics",
    components: [
      {
        type: "container",
        config: {
          display: "grid",
          columns: 2,
          gap: 6,
          className: "w-full",
        },
        children: [
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 4,
              className: "p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
            },
            children: [
              {
                type: "analytics-cards",
                config: {
                  columns: 1,
                  cards: [
                    { title: "Monthly Revenue", value: "$45,231", change: "+20.1%", trend: "up" },
                  ],
                },
              },
              {
                type: "chart-bar",
                config: {
                  xKey: "month",
                  bars: [{ dataKey: "value", label: "Revenue", color: "#06b6d4" }],
                  data: [
                    { month: "Jan", value: 35000 },
                    { month: "Feb", value: 38000 },
                    { month: "Mar", value: 42000 },
                    { month: "Apr", value: 45231 },
                  ],
                },
              },
            ],
          },
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 4,
              className: "p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
            },
            children: [
              {
                type: "analytics-cards",
                config: {
                  columns: 1,
                  cards: [
                    { title: "Active Users", value: "2,350", change: "+15.3%", trend: "up" },
                  ],
                },
              },
              {
                type: "chart-line",
                config: {
                  xKey: "month",
                  lines: [{ dataKey: "users", label: "Users", color: "#10b981" }],
                  data: [
                    { month: "Jan", users: 1800 },
                    { month: "Feb", users: 2000 },
                    { month: "Mar", users: 2200 },
                    { month: "Apr", users: 2350 },
                  ],
                },
              },
            ],
          },
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 4,
              className: "p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
            },
            children: [
              {
                type: "analytics-cards",
                config: {
                  columns: 1,
                  cards: [
                    { title: "Conversion Rate", value: "3.24%", change: "+0.8%", trend: "up" },
                  ],
                },
              },
              {
                type: "chart-line",
                config: {
                  xKey: "month",
                  lines: [{ dataKey: "rate", label: "Rate", color: "#8b5cf6" }],
                  data: [
                    { month: "Jan", rate: 2.8 },
                    { month: "Feb", rate: 3.0 },
                    { month: "Mar", rate: 3.1 },
                    { month: "Apr", rate: 3.24 },
                  ],
                },
              },
            ],
          },
          {
            type: "container",
            config: {
              display: "flex",
              direction: "column",
              gap: 4,
              className: "p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]",
            },
            children: [
              {
                type: "analytics-cards",
                config: {
                  columns: 1,
                  cards: [
                    { title: "Avg. Order Value", value: "$124", change: "+5.2%", trend: "up" },
                  ],
                },
              },
              {
                type: "chart-bar",
                config: {
                  xKey: "month",
                  bars: [{ dataKey: "aov", label: "AOV", color: "#f59e0b" }],
                  data: [
                    { month: "Jan", aov: 110 },
                    { month: "Feb", aov: 115 },
                    { month: "Mar", aov: 120 },
                    { month: "Apr", aov: 124 },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DashboardTemplate | undefined {
  return DASHBOARD_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: DashboardTemplate["category"]): DashboardTemplate[] {
  return DASHBOARD_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get all template IDs and names for quick reference
 */
export function getTemplateSummary(): Array<{ id: string; name: string; description: string }> {
  return DASHBOARD_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));
}
