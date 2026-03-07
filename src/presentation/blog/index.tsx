"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { useBlog } from "./useBlog";
import { BlogList } from "./modules/BlogList";

export default function BlogPage() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BlogPage fired");
  }

  const blog = useBlog();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="blog-logo"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">OpenDash</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/about"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="blog-nav-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm text-white transition-colors"
              data-test-id="blog-nav-blog"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="blog-nav-docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <span className="mb-3 inline-block text-sm font-semibold text-violet-400">
            Community
          </span>
          <h1
            data-test-id="blog-title"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Blog
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-400">
            Tutorials, experiences, and tips from the OpenDash community. Anyone
            can share their dashboard-building knowledge.
          </p>
        </div>

        <BlogList
          posts={blog.filteredPosts}
          searchQuery={blog.searchQuery}
          activeCategory={blog.activeCategory}
          onSearchChange={blog.setSearchQuery}
          onCategoryChange={blog.setActiveCategory}
        />

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Editorial Focus
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              What the OpenDash blog is expanding into next
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              We are using the blog as a practical field guide for teams building
              dashboards quickly: launch stories, builder workflows, AI prompt
              recipes, and real implementation breakdowns instead of generic
              product marketing.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <p className="text-2xl font-bold text-white">Launch Notes</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Release write-ups tied to actual builder, dashboard, and publish
                  flow updates.
                </p>
              </div>
              <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4">
                <p className="text-2xl font-bold text-white">Workflow Guides</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Step-by-step breakdowns for templates, widgets, styling, and
                  preview workflows.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-2xl font-bold text-white">Team Stories</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Short case studies showing how teams are using OpenDash in
                  standups, reporting, and client reviews.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.06] bg-zinc-950/70 p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/80">
              Contribute
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Publish a practical write-up
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Strong posts are specific. Show the layout you chose, the widgets
              you placed, the AI prompts you used, and the tradeoffs that made
              the dashboard effective for your team.
            </p>
            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              <p>Include one build goal, one workflow constraint, and one outcome.</p>
              <p>Use markdown sections so the post is easy to scan on mobile.</p>
              <p>Link back to docs when your article relies on a builder pattern.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blog/write"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                data-test-id="blog-contribute-write"
              >
                Start Writing
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/20 hover:text-white"
                data-test-id="blog-contribute-docs"
              >
                Read Docs First
              </Link>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
