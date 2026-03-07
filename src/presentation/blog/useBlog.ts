"use client";

import { useState, useCallback } from "react";
import type {
  BlogPost,
  BlogState,
  BlogCategory,
  CreateBlogPostInput,
} from "@/domain/blog/types";

const STORAGE_KEY = "open-dash-blog-posts";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function generateId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const SEED_POSTS: BlogPost[] = [
  {
    id: "seed-1",
    slug: "getting-started-with-open-dash",
    title: "Getting Started with OpenDash: Your First Dashboard in 5 Minutes",
    excerpt: "Learn how to create your first dashboard using OpenDash's visual block builder — from picking a layout to publishing a live URL.",
    content: `## Getting Started with OpenDash

OpenDash makes building dashboards fast and intuitive. Here's how to get your first dashboard up and running.

### Step 1: Create a Project

After signing up, head to your Dashboard and click **New Project**. Give it a name and optional description.

### Step 2: Open the Builder

Click **Open Builder** on your project card. You'll land on an empty canvas with a toolbar at the top.

### Step 3: Pick a Layout

Click the **Layout** button in the toolbar. Choose from:
- **Single Column** — one full-width slot
- **2-Column Grid** — two equal slots side by side
- **3-Column Grid** — three slots
- **4-Column Grid** — four slots

### Step 4: Add Widgets

Click any empty slot and browse the **Widget Library** (50+ variants). Categories include charts, tables, cards, accordions, date pickers, and analytics components. Click a widget to drop it into the slot.

### Step 5: Style with AI

Open the AI panel on any slot. Type a command like:
- \`/styles make the chart taller with rounded bars\`
- \`/data update the table with sales figures\`
- \`/config change the accent color to cyan\`

### Step 6: Preview & Publish

Toggle **Preview Mode** to see your dashboard as end users will. Click **Save** to persist and get a shareable URL.

That's it — your first dashboard is live!`,
    author: "OpenDash Team",
    authorEmail: "team@opendash.io",
    category: "tutorial",
    tags: ["getting-started", "beginner", "builder"],
    readTime: 3,
    published: true,
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "seed-2",
    slug: "ai-slash-commands-deep-dive",
    title: "AI Slash Commands: /styles, /data, and /config Explained",
    excerpt: "Master the three AI slash commands that let you fine-tune CSS, edit widget data, and adjust configurations without touching code.",
    content: `## AI Slash Commands Deep Dive

The OpenDash builder includes an AI chat panel that understands three slash commands. Each targets a different aspect of your widget.

### /styles — CSS Styling

Use \`/styles\` to modify the visual appearance of a slot or widget.

**Examples:**
- \`/styles make the background dark with rounded corners\`
- \`/styles add a subtle shadow and increase padding\`
- \`/styles use a gradient border from violet to cyan\`

The AI generates CSS that gets applied to the slot container. You can always fine-tune in the Code Editor.

### /data — Widget Data

Use \`/data\` to change the data displayed by a widget.

**Examples:**
- \`/data update chart labels to Q1, Q2, Q3, Q4\`
- \`/data add 5 more rows to the table\`
- \`/data change the card title to Revenue Overview\`

### /config — Widget Configuration

Use \`/config\` to adjust widget-level settings.

**Examples:**
- \`/config change chart type from bar to line\`
- \`/config enable pagination on the table\`
- \`/config set the accent color to emerald\`

### Pro Tips

1. You can chain commands: style first, then adjust data
2. The AI sees your current CSS and widget data for context
3. Use the Code Editor tab to inspect what the AI generated
4. Every AI change is saved — toggle Preview to see results`,
    author: "OpenDash Team",
    authorEmail: "team@opendash.io",
    category: "tips-tricks",
    tags: ["ai", "slash-commands", "styling", "advanced"],
    readTime: 4,
    published: true,
    createdAt: "2026-02-20T14:00:00.000Z",
    updatedAt: "2026-02-20T14:00:00.000Z",
  },
  {
    id: "seed-3",
    slug: "building-analytics-dashboard-experience",
    title: "How I Built a Sales Analytics Dashboard in 15 Minutes",
    excerpt: "A walkthrough of my experience building a real sales analytics dashboard for my team using OpenDash's template system and AI styling.",
    content: `## My Experience Building a Sales Dashboard

I needed a quick sales analytics dashboard for our Monday standup. Here's how I built it with OpenDash.

### Starting from a Template

Instead of a blank canvas, I chose the **Analytics** template from the builder. It gave me a 2-column layout with pre-configured chart and table slots.

### Customizing the Layout

The template came with a revenue chart on the left and a deals pipeline table on the right. I added a new block below with a 4-column grid for KPI cards.

### Using AI for Styling

I opened the AI panel and typed:
\`/styles use a dark navy theme with cyan accents for all charts\`

The AI applied consistent styling across all slots. Then I fine-tuned individual cards:
\`/styles make the KPI cards have a subtle glow effect\`

### Adding Real Data

For the chart, I used \`/data\` to input our actual quarterly numbers. For the table, I pasted our pipeline data and the AI formatted it correctly.

### The Result

In about 15 minutes, I had a polished dashboard that looked like it took days to build. The shareable URL meant my team could bookmark it and check it anytime.

### What I'd Do Differently

Next time, I'd use the code editor more for precise CSS tweaks. The AI gets you 90% there, but sometimes you want pixel-perfect control.`,
    author: "Alex Rivera",
    authorEmail: "alex@example.com",
    category: "experience",
    tags: ["analytics", "sales", "templates", "real-world"],
    readTime: 3,
    published: true,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
];

function loadPosts(): BlogPost[] {
  if (typeof window === "undefined") return SEED_POSTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
      return SEED_POSTS;
    }
    const parsed = JSON.parse(stored) as BlogPost[];
    return parsed.length > 0 ? parsed : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

function savePosts(posts: BlogPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* storage full — silently fail */
  }
}

export function useBlog() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: useBlog fired");
  }

  const [state, setState] = useState<BlogState>({
    posts: loadPosts(),
    selectedPost: null,
    view: "list",
    searchQuery: "",
    activeCategory: "all",
    loading: false,
  });

  const filteredPosts = state.posts
    .filter((p) => p.published)
    .filter((p) =>
      state.activeCategory === "all" ? true : p.category === state.activeCategory
    )
    .filter((p) =>
      state.searchQuery
        ? p.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(state.searchQuery.toLowerCase()))
        : true
    );

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((s) => ({ ...s, searchQuery }));
  }, []);

  const setActiveCategory = useCallback((activeCategory: BlogCategory | "all") => {
    setState((s) => ({ ...s, activeCategory }));
  }, []);

  const getPostBySlug = useCallback(
    (slug: string): BlogPost | undefined => {
      return state.posts.find((p) => p.slug === slug);
    },
    [state.posts]
  );

  const createPost = useCallback((input: CreateBlogPostInput): BlogPost => {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: generateId(),
      slug: generateSlug(input.title),
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      author: input.author,
      authorEmail: input.authorEmail,
      category: input.category,
      tags: input.tags,
      readTime: estimateReadTime(input.content),
      published: true,
      createdAt: now,
      updatedAt: now,
    };
    setState((s) => {
      const updated = [newPost, ...s.posts];
      savePosts(updated);
      return { ...s, posts: updated };
    });
    return newPost;
  }, []);

  return {
    ...state,
    filteredPosts,
    setSearchQuery,
    setActiveCategory,
    getPostBySlug,
    createPost,
  };
}
