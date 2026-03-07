"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Documentation", href: "/docs" },
] as const;

export function Footer() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: Footer fired");
  }

  return (
    <footer className="border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <LayoutDashboard size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold">OpenDash</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
              The AI-powered dashboard builder for teams that move fast.
            </p>
          </div>

          <nav className="flex items-center gap-8">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                data-test-id={`footer-${link.label.toLowerCase()}`}
                className="text-sm text-zinc-500 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} OpenDash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
