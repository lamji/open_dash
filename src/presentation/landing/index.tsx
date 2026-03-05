"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bot,
  Zap,
  Layers,
  Eye,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import type { FeatureItem, StepItem, FooterSection } from "@/domain/landing/types";

const FEATURES: FeatureItem[] = [
  {
    icon: "Bot",
    title: "AI-Powered Builder",
    description:
      "Describe what you want in plain English. Our AI builds it instantly — pages, tables, charts, forms, and more.",
  },
  {
    icon: "Layers",
    title: "50+ UI Components",
    description:
      "Production-ready components built on shadcn/ui. Cards, tables, charts, dialogs, accordions — all configurable via AI.",
  },
  {
    icon: "Eye",
    title: "Live Preview",
    description:
      "See changes in real-time as you build. Toggle between developer mode and preview mode instantly.",
  },
  {
    icon: "Zap",
    title: "Instant Deploy",
    description:
      "Publish your project with one click. Get a shareable URL for your clients, team, or stakeholders.",
  },
  {
    icon: "Shield",
    title: "Secure by Default",
    description:
      "Built-in authentication, rate limiting, and per-project data isolation. Your data never mixes with others.",
  },
  {
    icon: "Globe",
    title: "Multi-Project Support",
    description:
      "Create and manage multiple projects from a single dashboard. Each project is fully isolated.",
  },
];

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Describe Your App",
    description:
      'Tell the AI what you want to build. "Create a sales dashboard with a chart and data table."',
  },
  {
    number: "02",
    title: "AI Builds It",
    description:
      "The AI generates your pages, components, and layouts. Refine with follow-up prompts.",
  },
  {
    number: "03",
    title: "Publish & Share",
    description:
      "Hit publish. Your project is live with a shareable URL. Update anytime with AI.",
  },
];

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Bot: <Bot size={24} />,
  Zap: <Zap size={24} />,
  Layers: <Layers size={24} />,
  Eye: <Eye size={24} />,
  Shield: <Shield size={24} />,
  Globe: <Globe size={24} />,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-blue-900">
      {/* ─── Navigation ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-blue-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="landing-logo"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-blue-900">OpenDash</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
              data-test-id="landing-nav-features"
            >
              Features
            </a>
            <a
              href="/how-to"
              className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
              data-test-id="landing-nav-how-it-works"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
              data-test-id="landing-nav-pricing"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                data-test-id="landing-login-btn"
                className="text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                data-test-id="landing-signup-btn"
                className="bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-md"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative px-6 pb-32 pt-20 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="relative min-h-[600px]">
            {/* Left Column: Header and Buttons */}
            <div className="relative z-10 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 shadow-sm">
                <span className="text-xs font-medium text-blue-700">
                  Now in Public Beta
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-blue-900 sm:text-6xl lg:text-7xl">
                Build Admin
                <br />
                Dashboards
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">with AI</span>
              </h1>

              <p className="mt-8 text-lg leading-relaxed text-blue-700 max-w-md">
                Create powerful admin panels and internal tools using natural language. No coding required.
              </p>
            </div>

            {/* Floating Cards - Positioned Absolutely */}
            {/* Trophy/Badge Card - Top Left */}
            <Card className="absolute left-0 top-32 z-20 w-48 border-blue-100 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600">#1</p>
                  <p className="text-sm font-semibold text-blue-900">Best website using</p>
                  <p className="text-xs text-blue-600">AI for E-Commerce</p>
                </div>
              </div>
            </Card>

            {/* Main Dashboard Mockup - Right Side */}
            <div className="absolute right-0 top-0 z-10 w-80">
              <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl">
                <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-blue-300" />
                  <div className="h-3 w-3 rounded-full bg-blue-300" />
                  <div className="h-3 w-3 rounded-full bg-blue-300" />
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Sales Dashboard</h3>
                    <p className="text-xs text-blue-600">Built in 30 seconds with AI</p>
                  </div>
                  <div className="space-y-3">
                    <Card className="border-blue-100 p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">Revenue</span>
                        <BarChart3 size={14} className="text-blue-400" />
                      </div>
                      <p className="mt-1 text-lg font-bold text-blue-900">$45.2k</p>
                      <p className="text-xs text-green-600">+12.5%</p>
                    </Card>
                    <div className="flex h-24 items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-blue-600"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Increase Card - Top Right */}
            <Card className="absolute right-4 top-56 z-20 w-44 border-blue-900 bg-blue-900 p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-white" />
                <span className="text-xs font-medium text-blue-200">Time increase</span>
              </div>
              <div className="flex h-16 items-end gap-1">
                {[30, 50, 40, 70, 60, 85].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-blue-400"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-2xl font-bold text-white">5<span className="text-sm">second</span></p>
            </Card>

            {/* User Count Card - Bottom Center */}
            <Card className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-56 border-blue-100 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-400" />
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-500" />
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">100K+</p>
                  <p className="text-xs text-blue-600">SATISFIED USERS</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Trusted By ─────────────────────────────────── */}
      <section className="border-y border-blue-200 bg-white/50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-blue-400">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Acme Corp", "Globex", "Initech", "Hooli", "Piedmont"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-bold tracking-tight text-blue-300"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">
              Everything you need to build fast
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-700">
              OpenDash combines AI intelligence with enterprise-grade
              infrastructure so you can ship internal tools in minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  {ICON_MAP[feature.icon] ?? <Bot size={24} />}
                </div>
                <h3 className="text-base font-semibold text-blue-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────── */}
      <section id="how-it-works" className="border-y border-blue-200 bg-white/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">
              Three steps to your app
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-700">
              No setup, no boilerplate, no deployment headaches.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-md">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-blue-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-700">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-700">
              Start free. Scale when you are ready.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-blue-900">Free</h3>
              <p className="mt-1 text-sm text-blue-600">
                For individuals and small projects
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-blue-900">$0</span>
                <span className="text-sm text-blue-600"> / month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Up to 3 projects",
                  "AI builder access",
                  "50+ components",
                  "Community support",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-blue-700"
                  >
                    <CheckCircle2 size={16} className="text-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button
                  variant="outline"
                  data-test-id="landing-pricing-free"
                  className="w-full border-blue-300 font-medium hover:bg-blue-50"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">Pro</h3>
                <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-600">
                For teams and production apps
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-blue-900">$29</span>
                <span className="text-sm text-blue-600"> / month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Unlimited projects",
                  "Priority AI access",
                  "Custom domains",
                  "Team collaboration",
                  "Priority support",
                  "Export to code",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-blue-700"
                  >
                    <CheckCircle2 size={16} className="text-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button
                  data-test-id="landing-pricing-pro"
                  className="w-full bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-md"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="border-t border-blue-200 bg-white/50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">
            Ready to build your next app?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-700">
            Join thousands of teams using OpenDash to ship internal tools,
            dashboards, and admin panels faster than ever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                data-test-id="landing-cta-signup"
                className="h-12 bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Building Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-blue-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                  <LayoutDashboard size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold">OpenDash</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-blue-600">
                The AI-powered web builder for teams that move fast.
              </p>
            </div>

            {/* Link sections */}
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {section.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-blue-600 transition-colors hover:text-blue-900"
                        data-test-id={`landing-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-blue-100 pt-6 text-center text-xs text-blue-400">
            &copy; {new Date().getFullYear()} OpenDash. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
