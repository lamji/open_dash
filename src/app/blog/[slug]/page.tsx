"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { useBlog } from "@/presentation/blog/useBlog";
import { BlogPostView } from "@/presentation/blog/modules/BlogPost";

export default function BlogPostRoute() {
  const params = useParams<{ slug: string }>();
  const { getPostBySlug, loading } = useBlog();
  const post = params?.slug ? getPostBySlug(params.slug) : undefined;

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            data-test-id="blog-post-logo"
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
              data-test-id="blog-post-nav-about"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="text-sm text-white transition-colors"
              data-test-id="blog-post-nav-blog"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              data-test-id="blog-post-nav-docs"
            >
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          </div>
        )}
        {!loading && !post && (
          <div className="py-24 text-center">
            <p className="text-lg font-semibold">Post not found</p>
            <p className="mt-2 text-sm text-zinc-400">
              The blog post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300"
            >
              &larr; Back to Blog
            </Link>
          </div>
        )}
        {!loading && post && <BlogPostView post={post} />}
      </main>

      <Footer />
    </div>
  );
}
