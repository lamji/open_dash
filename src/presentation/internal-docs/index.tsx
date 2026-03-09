"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/shared/Footer";
import { LoginFlowChart } from "./modules/LoginFlowChart";
import { useInternalDocs } from "./useInternalDocs";

const SECTION_ICONS: Record<string, ReactNode> = {
  Shield: <Shield size={16} />,
};

export default function InternalDocsPage() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: InternalDocsPage fired");
  }

  const docs = useInternalDocs();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="internal-docs-logo"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">OpenDash</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/docs"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="internal-docs-nav-docs"
            >
              Docs
            </Link>
            <Link
              href="/internal-docs"
              className="text-sm text-white transition-colors"
              data-test-id="internal-docs-nav-current"
            >
              Internal Docs
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-white/[0.06] px-4 py-8 lg:block">
          <div className="relative mb-6">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              data-test-id="internal-docs-search"
              placeholder="Search internal docs..."
              value={docs.searchQuery}
              onChange={(e) => docs.setSearchQuery(e.target.value)}
              className="h-9 border-white/10 bg-white/5 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          <nav className="space-y-6">
            {docs.sections.map((section) => (
              <div key={section.id}>
                <button
                  type="button"
                  data-test-id={`internal-docs-section-${section.id}`}
                  onClick={() => docs.setActiveSection(section.id)}
                  className={`flex w-full items-center gap-2 text-left text-sm font-semibold transition-colors ${
                    docs.activeSection === section.id
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {SECTION_ICONS[section.icon] ?? <Shield size={16} />}
                  {section.title}
                </button>
                <ul className="mt-2 space-y-0.5 pl-6">
                  {section.children.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        data-test-id={`internal-docs-sub-${sub.anchor}`}
                        onClick={() => {
                          docs.setActiveSubSection(section.id, sub.anchor);
                          const element = document.getElementById(sub.anchor);
                          element?.scrollIntoView({ behavior: "smooth" });
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

        <main className="min-w-0 flex-1 px-6 py-12 lg:px-12">
          <div className="mb-10">
            <span className="mb-3 inline-block text-sm font-semibold text-violet-400">
              Internal Documentation
            </span>
            <h1
              data-test-id="internal-docs-title"
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Login Flow
            </h1>
            <p className="mt-3 max-w-3xl text-base text-zinc-400">
              This page documents two isolated login concepts in OpenDash: regular
              product-user login for the application itself, and published dashboard
              viewer login for shared dashboards that require access checks.
            </p>
          </div>

          <div className="space-y-16">
            <section id="internal-login-overview">
              <h2
                className="text-2xl font-bold tracking-tight"
                data-test-id="internal-docs-overview"
              >
                Overview
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                There are two distinct audiences here, and they should not be read
                as the same journey. Regular product users log into OpenDash itself.
                Shared viewers may hit a published dashboard that asks them to authenticate
                before viewing a public-facing preview.
              </p>
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Why The Earlier Diagram Was Wrong
                </h4>
                <div className="mt-3 space-y-2 text-sm text-zinc-400">
                  {docs.overviewPoints.map((point) => (
                    <p key={point.id}>
                      <strong className="text-zinc-200">{point.label}:</strong> {point.text}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            {docs.flows.map((flow) => (
              <section key={flow.id} id={flow.anchor}>
                <h2
                  className="text-2xl font-bold tracking-tight"
                  data-test-id={flow.headingTestId}
                >
                  {flow.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {flow.description}
                </p>
                <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
                  <h4 className="text-sm font-semibold text-zinc-200">Execution Order</h4>
                  <ol className="mt-3 ml-4 list-decimal space-y-2 text-sm text-zinc-400">
                    {flow.steps.map((step) => (
                      <li key={step.id}>{step.text}</li>
                    ))}
                  </ol>
                </div>
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
                  <h4 className="text-sm font-semibold text-zinc-200">Flow Chart</h4>
                  <div className="mt-3">
                    <LoginFlowChart
                      dataTestId={flow.chartTestId}
                      edges={flow.edges}
                      nodes={flow.nodes}
                      title={flow.chartTitle}
                    />
                  </div>
                </div>
              </section>
            ))}

            <section id="internal-login-routing">
              <h2
                className="text-2xl font-bold tracking-tight"
                data-test-id="internal-docs-routing"
              >
                Cookies And Routing
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {docs.routingCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4"
                  >
                    <h4 className="text-sm font-semibold text-zinc-200">{card.title}</h4>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                      {card.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section id="internal-login-sources">
              <h2
                className="text-2xl font-bold tracking-tight"
                data-test-id="internal-docs-sources"
              >
                Source Map
              </h2>
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
                <ul className="space-y-2 text-sm text-zinc-400">
                  {docs.sourceItems.map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
