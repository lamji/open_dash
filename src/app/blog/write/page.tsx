"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { useBlog } from "@/presentation/blog/useBlog";
import { BlogWrite } from "@/presentation/blog/modules/BlogWrite";

export default function BlogWriteRoute() {
  const { createPost } = useBlog();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="blog-write-logo"
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
              data-test-id="blog-write-nav-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm text-white transition-colors"
              data-test-id="blog-write-nav-blog"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="blog-write-nav-docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <BlogWrite onCreatePost={createPost} />
      </main>

      <Footer />
    </div>
  );
}
