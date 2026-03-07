"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import type { AboutStat } from "@/domain/about/types";

export function AboutHero({ stats }: { stats: AboutStat[] }) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: AboutHero fired");
  }

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 lg:pt-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <LayoutDashboard size={14} className="text-violet-400" />
          <span className="text-xs font-medium text-zinc-300">About OpenDash</span>
        </div>

        <h1
          data-test-id="about-title"
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
        >
          Build dashboards{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            visually
          </span>
          , ship faster.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          OpenDash is an open-source, AI-powered dashboard builder. Pick layouts,
          drop widgets, let AI fine-tune the styling — then publish with one click.
          Built for teams that need internal tools yesterday.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button
              size="lg"
              data-test-id="about-hero-cta"
              className="h-12 gap-2 bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
            >
              Get Started Free <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
              data-test-id="about-hero-docs"
              className="h-12 border-white/10 px-8 text-base text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              Read the Docs
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-extrabold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
