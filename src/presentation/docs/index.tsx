"use client";

import Link from "next/link";
import { LayoutDashboard, Hammer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/shared/Footer";
import { useDocs } from "./useDocs";
import { DashboardDocs } from "./modules/DashboardDocs";
import { BuilderDocs } from "./modules/BuilderDocs";

export default function DocsPage() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: DocsPage fired");
  }

  const docs = useDocs();

  const SECTION_ICONS: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard size={16} />,
    Hammer: <Hammer size={16} />,
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="docs-logo"
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
              data-test-id="docs-nav-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="docs-nav-blog"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm text-white transition-colors"
              data-test-id="docs-nav-docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-white/[0.06] px-4 py-8 lg:block">
          <div className="relative mb-6">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              data-test-id="docs-search"
              placeholder="Search docs..."
              value={docs.searchQuery}
              onChange={(e) => docs.setSearchQuery(e.target.value)}
              className="h-9 border-white/10 bg-white/5 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <nav className="space-y-6">
            {docs.sections.map((section) => (
              <div key={section.id}>
                <button
                  data-test-id={`docs-section-${section.id}`}
                  onClick={() => docs.setActiveSection(section.id)}
                  className={`flex w-full items-center gap-2 text-left text-sm font-semibold transition-colors ${
                    docs.activeSection === section.id
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {SECTION_ICONS[section.icon] ?? (
                    <LayoutDashboard size={16} />
                  )}
                  {section.title}
                </button>
                <ul className="mt-2 space-y-0.5 pl-6">
                  {section.children.map((sub) => (
                    <li key={sub.id}>
                      <button
                        data-test-id={`docs-sub-${sub.anchor}`}
                        onClick={() => {
                          docs.setActiveSection(section.id);
                          docs.setActiveSubSection(sub.anchor);
                          const el = document.getElementById(sub.anchor);
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full text-left text-xs transition-colors ${
                          docs.activeSubSection === sub.anchor
                            ? "font-medium text-violet-400"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {sub.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 px-6 py-12 lg:px-12">
          <div className="mb-10">
            <span className="mb-3 inline-block text-sm font-semibold text-violet-400">
              Documentation
            </span>
            <h1
              data-test-id="docs-title"
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              OpenDash Docs
            </h1>
            <p className="mt-3 max-w-xl text-base text-zinc-400">
              Learn how to create projects, build dashboards, work with widgets,
              and publish shareable views. This guide is written for people using
              OpenDash day to day.
            </p>
          </div>

          {/* Mobile section tabs */}
          <div className="mb-8 flex gap-2 lg:hidden">
            {docs.sections.map((section) => (
              <button
                key={section.id}
                data-test-id={`docs-mobile-tab-${section.id}`}
                onClick={() => docs.setActiveSection(section.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  docs.activeSection === section.id
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          {docs.activeSection === "dashboard" && <DashboardDocs />}
          {docs.activeSection === "builder" && <BuilderDocs />}
        </main>
      </div>

      <Footer />
    </div>
  );
}
