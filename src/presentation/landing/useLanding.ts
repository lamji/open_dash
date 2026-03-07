import { useEffect, useState } from "react";
 import type { FeatureItem, FooterSection, StatItem, StepItem, TestimonialItem } from "@/domain/landing/types";

 export const LANDING_FEATURES: FeatureItem[] = [
   { icon: "LayoutGrid", title: "Visual Block Builder", description: "Pick a layout — single column, 2-col, 3-col, or 4-col grid. Drop widgets into slots. Nest layouts inside slots for complex dashboards. No code required.", gradient: "from-violet-500 to-fuchsia-500", span: "wide" },
   { icon: "Layers", title: "50+ Widget Library", description: "Charts, tables, cards, accordions, date-pickers, analytics — browse by category, pick a variant, and it lands in your slot instantly.", gradient: "from-cyan-500 to-blue-500" },
   { icon: "Bot", title: "AI Styling Assistant", description: "Open the AI panel on any block or slot. Use /styles, /data, /config slash commands. AI writes CSS, edits widget data, and adjusts configs in real time.", gradient: "from-amber-500 to-orange-500" },
   { icon: "Code2", title: "Built-In Code Editor", description: "Edit raw CSS, widget JSON data, and JavaScript functions per slot — all in a VS Code-style editor with syntax highlighting. Full control when you need it.", gradient: "from-emerald-500 to-teal-500" },
   { icon: "Eye", title: "Live Preview & Publish", description: "Toggle between edit and preview mode with one click. Save your dashboard and get a shareable URL your team can open immediately.", gradient: "from-rose-500 to-pink-500" },
   { icon: "Palette", title: "Templates & Autosave", description: "Start from pre-built dashboard templates (analytics, sales, CRM) or blank. Every change autosaves to the database — never lose your work.", gradient: "from-indigo-500 to-purple-500", span: "wide" },
 ];

 export const LANDING_STEPS: StepItem[] = [
   { number: "01", title: "Pick a Layout", description: "Choose a grid layout (1–4 columns) or start from a dashboard template. Add as many blocks as you need." },
   { number: "02", title: "Fill Slots with Widgets", description: "Click any empty slot → browse 50+ widgets by category → pick a variant. Or open the AI prompt to generate a custom widget from a description." },
   { number: "03", title: "Style, Preview & Publish", description: "Use the AI panel or code editor to fine-tune CSS, data, and functions. Toggle preview, then save to get a shareable URL." },
 ];

 export const LANDING_STATS: StatItem[] = [
   { value: "50", label: "Widget Variants", suffix: "+" },
   { value: "4", label: "Grid Layouts", suffix: "" },
   { value: "3", label: "AI Slash Commands", suffix: "" },
   { value: "1", label: "Click to Publish", suffix: "" },
 ];

 export const LANDING_TESTIMONIALS: TestimonialItem[] = [
   { name: "Sarah Chen", role: "Engineering Lead", company: "Acme Corp", quote: "The block-based builder is intuitive — pick a grid, drop widgets in, and the AI handles all the CSS styling. We shipped 4 internal dashboards in a single afternoon.", avatar: "SC" },
   { name: "Marcus Rivera", role: "Product Manager", company: "Globex", quote: "Non-technical PMs on my team can build their own dashboards by just picking layouts and widgets. The AI slash commands handle the rest.", avatar: "MR" },
   { name: "Emily Nakamura", role: "CTO", company: "Initech", quote: "The widget library is production-quality, and being able to edit CSS, data, and functions per slot gives our devs the control they need.", avatar: "EN" },
 ];

 export const LANDING_FOOTER_SECTIONS: FooterSection[] = [
   { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }] },
   { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }] },
   { title: "Resources", links: [{ label: "Documentation", href: "#" }, { label: "Changelog", href: "#" }, { label: "Status", href: "#" }] },
 ];

 const LANDING_BUILDER_STEPS = [
   { label: "Pick layout" },
   { label: "Add widgets" },
   { label: "AI style" },
   { label: "Publish" },
 ] as const;

 const LANDING_PHASES = [
   {
     layoutLabel: "2-Column Grid",
     statusPill: "grid selected",
     chartNote: "Base scaffold",
     chartBars: [24, 38, 30, 46, 34, 50, 42, 58, 48, 44],
     slotTitle: "Empty Slot",
     slotRows: ["Waiting for widget", "Drop target armed", "AI generate ready"],
     tableCaption: "Starter data",
     tableRows: [
       { name: "A. Smith", email: "alex@acme.io", role: "Admin", status: "Draft" },
       { name: "J. Park", email: "jin@acme.io", role: "Editor", status: "Draft" },
       { name: "M. Lee", email: "maya@acme.io", role: "Viewer", status: "Draft" },
     ],
     panelLabel: "Canvas scaffold",
     command: "/layout switch canvas to 2-column grid",
     response: "Grid updated: 2 columns, nested slots ready",
     followUp: "/layout pin analytics rail on the left",
     followUpResponse: "Left rail anchored for quick iteration",
     promptHint: "/layout, /widgets, /styles...",
   },
   {
     layoutLabel: "2-Column Grid",
     statusPill: "widget inserted",
     chartNote: "New module landed",
     chartBars: [28, 45, 34, 58, 41, 66, 48, 72, 55, 51],
     slotTitle: "Pipeline Table",
     slotRows: ["Q4 pipeline", "7 active deals", "Auto-refresh live"],
     tableCaption: "Widget library synced",
     tableRows: [
       { name: "A. Smith", email: "alex@acme.io", role: "Admin", status: "Active" },
       { name: "J. Park", email: "jin@acme.io", role: "Editor", status: "Active" },
       { name: "M. Lee", email: "maya@acme.io", role: "Viewer", status: "Invited" },
     ],
     panelLabel: "Widget insertion",
     command: "/widgets add sales pipeline table into slot-2",
     response: "Inserted widget: table/pipeline-compact",
     followUp: "/widgets mirror card spacing from top chart",
     followUpResponse: "Spacing inherited from adjacent widget",
     promptHint: "/widgets charts, tables, cards...",
   },
   {
     layoutLabel: "2-Column Grid",
     statusPill: "ai styling live",
     chartNote: "AI tuned contrast",
     chartBars: [35, 55, 40, 75, 50, 85, 60, 90, 70, 65],
     slotTitle: "Pipeline Table",
     slotRows: ["Priority rows highlighted", "Cyan accent labels", "Rounded density compact"],
     tableCaption: "Style pass applied",
     tableRows: [
       { name: "A. Smith", email: "alex@acme.io", role: "Admin", status: "Active" },
       { name: "J. Park", email: "jin@acme.io", role: "Editor", status: "Active" },
       { name: "M. Lee", email: "maya@acme.io", role: "Viewer", status: "Styled" },
     ],
     panelLabel: "AI design pass",
     command: "/styles make the chart taller with rounded bars",
     response: "min-height: 300px; border-radius: 8px; accent: cyan",
     followUp: "/styles add denser row rhythm to the table",
     followUpResponse: "Applied compact row spacing + status emphasis",
     promptHint: "/styles, /data, /config...",
   },
   {
     layoutLabel: "Live Preview",
     statusPill: "published",
     chartNote: "Shareable state",
     chartBars: [30, 50, 36, 70, 47, 82, 58, 88, 64, 60],
     slotTitle: "Pipeline Table",
     slotRows: ["Preview approved", "Live URL generated", "Team can open now"],
     tableCaption: "Publish snapshot",
     tableRows: [
       { name: "A. Smith", email: "alex@acme.io", role: "Admin", status: "Published" },
       { name: "J. Park", email: "jin@acme.io", role: "Editor", status: "Published" },
       { name: "M. Lee", email: "maya@acme.io", role: "Viewer", status: "Invited" },
     ],
     panelLabel: "Ready to share",
     command: "/publish create live dashboard link",
     response: "Published: app.opendash.io/demo/q4-revenue",
     followUp: "/publish invite product and ops",
     followUpResponse: "3 collaborators notified with preview access",
     promptHint: "/preview, /publish, /share...",
   },
 ] as const;

export function useLanding() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: useLanding fired");
  }

  const [activeDemo, setActiveDemo] = useState(1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveDemo((previousDemo: number) => (previousDemo % LANDING_PHASES.length) + 1);
    }, 2800);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    activeDemo,
    activePhase: LANDING_PHASES[activeDemo - 1],
    builderSteps: LANDING_BUILDER_STEPS,
  };
}

