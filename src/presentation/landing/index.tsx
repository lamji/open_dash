"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  TrendingUp,
} from "lucide-react";
import type { FeatureItem, StepItem, FooterSection } from "@/domain/auth/types";

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Navigation ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="landing-logo"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">OpenDash</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              data-test-id="landing-nav-features"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              data-test-id="landing-nav-how-it-works"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
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
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                data-test-id="landing-signup-btn"
                className="bg-gray-900 text-sm font-medium text-white hover:bg-gray-800"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left Column: Header and Buttons */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
                <span className="text-xs font-medium text-gray-600">
                  Now in Public Beta
                </span>
              </div>

              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-6xl">
                Build Web Apps
                <br />
                <span className="text-gray-400">With AI</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-gray-500">
                Describe what you want in plain English. OpenDash turns your ideas
                into production-ready dashboards, admin panels, and internal tools —
                no coding required.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    data-test-id="landing-hero-cta"
                    className="h-12 bg-gray-900 px-8 text-base font-semibold text-white hover:bg-gray-800"
                  >
                    Start Building Free
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works" data-test-id="landing-hero-demo-link">
                  <Button
                    variant="outline"
                    size="lg"
                    data-test-id="landing-hero-demo"
                    className="h-12 border-gray-300 px-8 text-base font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Column: Dashboard Preview Mockup */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sales Dashboard
                      </h3>
                      <p className="text-sm text-gray-500">
                        Built in 30 seconds with AI
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Live
                    </Badge>
                  </div>

                  {/* Stats Cards */}
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <Card className="border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Revenue
                        </span>
                        <BarChart3 size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">$45.2k</p>
                      <p className="mt-1 text-xs text-green-600">+12.5%</p>
                    </Card>

                    <Card className="border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Users
                        </span>
                        <Users size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">2,341</p>
                      <p className="mt-1 text-xs text-green-600">+8.2%</p>
                    </Card>

                    <Card className="border-gray-200 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Growth
                        </span>
                        <TrendingUp size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">23.1%</p>
                      <p className="mt-1 text-xs text-green-600">+4.3%</p>
                    </Card>
                  </div>

                  {/* Chart Placeholder */}
                  <Card className="border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        Monthly Performance
                      </span>
                      <Badge variant="outline" className="text-xs">
                        2024
                      </Badge>
                    </div>
                    <div className="flex h-32 items-end gap-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gray-900"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      data-test-id="landing-hero-mockup-export"
                    >
                      Export Data
                    </Button>
                    <Button size="sm" className="flex-1 bg-gray-900 text-xs" data-test-id="landing-hero-mockup-details">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating AI Badge */}
              <div className="absolute -right-4 -top-4 rounded-full border-2 border-white bg-gray-900 p-3 shadow-lg">
                <Bot size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By ─────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Acme Corp", "Globex", "Initech", "Hooli", "Piedmont"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-bold tracking-tight text-gray-300"
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Everything you need to build fast
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              OpenDash combines AI intelligence with enterprise-grade
              infrastructure so you can ship internal tools in minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-100 bg-white p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  {ICON_MAP[feature.icon] ?? <Bot size={24} />}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────── */}
      <section id="how-it-works" className="border-y border-gray-100 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Three steps to your app
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              No setup, no boilerplate, no deployment headaches.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
              Start free. Scale when you are ready.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <p className="mt-1 text-sm text-gray-500">
                For individuals and small projects
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-sm text-gray-500"> / month</span>
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
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 size={16} className="text-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button
                  variant="outline"
                  data-test-id="landing-pricing-free"
                  className="w-full border-gray-300 font-medium"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-xl border-2 border-gray-900 bg-white p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
                <span className="rounded-full bg-gray-900 px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                For teams and production apps
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-sm text-gray-500"> / month</span>
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
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 size={16} className="text-gray-900" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button
                  data-test-id="landing-pricing-pro"
                  className="w-full bg-gray-900 font-medium text-white hover:bg-gray-800"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Ready to build your next app?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Join thousands of teams using OpenDash to ship internal tools,
            dashboards, and admin panels faster than ever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                data-test-id="landing-cta-signup"
                className="h-12 bg-gray-900 px-8 text-base font-semibold text-white hover:bg-gray-800"
              >
                Start Building Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
                  <LayoutDashboard size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold">OpenDash</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                The AI-powered web builder for teams that move fast.
              </p>
            </div>

            {/* Link sections */}
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-500 transition-colors hover:text-gray-900"
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

          <div className="mt-12 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} OpenDash. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
