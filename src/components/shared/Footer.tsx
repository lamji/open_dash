"use client";

import Link from "next/link";
import type { FooterSection } from "@/domain/landing/types";

interface FooterProps {
  sections?: FooterSection[];
}

const DEFAULT_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
]

export function Footer({ sections = DEFAULT_FOOTER_SECTIONS }: FooterProps) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: Footer fired");
  }

  return (
    <footer className="border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="text-lg font-semibold tracking-tight text-white">OpenDash</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Build, style, and ship dashboards with AI-assisted workflows.
          </p>
        </div>
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-zinc-200">{section.title}</h3>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={`${section.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                    data-test-id={`footer-link-${section.title.toLowerCase()}-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
