"use client";

import type { ReactNode } from "react";
import {
  Bot,
  Layers,
  Eye,
  Code2,
  LayoutGrid,
  Palette,
} from "lucide-react";
import type { AboutFeature } from "@/domain/about/types";

const ICON_MAP: Record<string, ReactNode> = {
  Bot: <Bot size={22} />,
  Layers: <Layers size={22} />,
  Eye: <Eye size={22} />,
  Code2: <Code2 size={22} />,
  LayoutGrid: <LayoutGrid size={22} />,
  Palette: <Palette size={22} />,
};

export function AboutFeatures({ features }: { features: AboutFeature[] }) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: AboutFeatures fired");
  }

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="mb-3 inline-block text-sm font-semibold text-violet-400">
            What We Offer
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A complete dashboard toolkit
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Everything you need to design, build, and deploy internal dashboards
            without writing boilerplate.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              data-test-id={`about-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-6 transition-all hover:border-white/[0.12] hover:bg-zinc-900/80"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.12]`}
              />
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}
              >
                {ICON_MAP[feature.icon] ?? <Bot size={22} />}
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <div className="text-center">
            <span className="mb-3 inline-block text-sm font-semibold text-violet-400">
              Open Source
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built in the open
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
              OpenDash is fully open-source. Fork it, extend it, self-host it.
              The builder uses Next.js 15, shadcn/ui, Tailwind CSS, and MongoDB
              with Prisma. AI features are powered by Groq with Llama models.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "shadcn/ui", "Prisma", "MongoDB", "Groq AI", "Framer Motion"].map(
              (tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
