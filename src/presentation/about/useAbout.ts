import type { AboutFeature, AboutStat } from "@/domain/about/types";

export const ABOUT_FEATURES: AboutFeature[] = [
  {
    icon: "LayoutGrid",
    title: "Visual Block Builder",
    description: "Pick grid layouts (1–4 columns), drop widgets into slots, nest layouts for complex dashboards. No code required.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "Bot",
    title: "AI-Powered Styling",
    description: "Open the AI panel on any block. Use /styles, /data, /config slash commands to let AI write CSS and adjust configs in real time.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: "Layers",
    title: "50+ Widget Library",
    description: "Charts, tables, cards, accordions, date-pickers, analytics — browse by category, pick a variant, and it lands in your slot instantly.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: "Code2",
    title: "Built-In Code Editor",
    description: "Edit raw CSS, widget JSON data, and JavaScript functions per slot in a VS Code-style editor with syntax highlighting.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: "Eye",
    title: "Live Preview & Publish",
    description: "Toggle between edit and preview mode with one click. Save your dashboard and get a shareable URL your team can open immediately.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: "Palette",
    title: "Templates & Autosave",
    description: "Start from pre-built dashboard templates (analytics, sales, CRM) or blank. Every change autosaves so you never lose your work.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

export const ABOUT_STATS: AboutStat[] = [
  { value: "50+", label: "Widget Variants" },
  { value: "4", label: "Grid Layouts" },
  { value: "3", label: "AI Slash Commands" },
  { value: "1-Click", label: "Publish" },
];

export function useAbout() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: useAbout fired");
  }

  return {
    features: ABOUT_FEATURES,
    stats: ABOUT_STATS,
  };
}
