"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { useAbout } from "./useAbout";
import { AboutHero } from "./modules/AboutHero";
import { AboutFeatures } from "./modules/AboutFeatures";

export default function AboutPage() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: AboutPage fired");
  }

  const { features, stats } = useAbout();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="about-logo"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">OpenDash</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/about"
              className="text-sm text-white transition-colors"
              data-test-id="about-nav-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="about-nav-blog"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="about-nav-docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <AboutHero stats={stats} />
      <AboutFeatures features={features} />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid gap-6 border-t border-white/[0.06] pt-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Why OpenDash Exists
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Dashboard delivery should feel closer to composing blocks than
              wiring a front-end from scratch.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              OpenDash is built for teams that need a usable internal dashboard
              fast. The product blends a visual builder, reusable widget
              variants, and AI-assisted editing so the time between idea and
              shared URL stays short.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              The goal is not to replace engineering judgment. It is to remove
              the repetitive assembly work so teams can spend their time on
              structure, signal, and clarity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
              <p className="text-sm font-semibold text-white">Fast first draft</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Projects move from blank canvas to structured dashboard in a few
                layout and widget selections.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5">
              <p className="text-sm font-semibold text-white">Precise control</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                AI can accelerate the draft, while the code editor keeps the
                final UI editable when detail matters.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <p className="text-sm font-semibold text-white">Built for sharing</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Preview, publish, and hand teammates a stable URL without a
                separate packaging step.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <p className="text-sm font-semibold text-white">Guided learning</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                The blog and docs are meant to teach patterns, not just list
                features.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300/80">
                Continue Exploring
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Move from product overview to practical usage.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Start with the docs if you need route-level guidance, or jump to
                the blog for examples and real build stories.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-transform hover:-translate-y-0.5"
                data-test-id="about-continue-docs"
              >
                View Documentation
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/20 hover:text-white"
                data-test-id="about-continue-blog"
              >
                Browse Blog
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
