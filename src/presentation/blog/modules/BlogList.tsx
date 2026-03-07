"use client";

import Link from "next/link";
import { Search, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BlogListProps } from "@/domain/blog/types";
import { BLOG_CATEGORIES } from "@/domain/blog/types";

export function BlogList({
  posts,
  searchQuery,
  activeCategory,
  onSearchChange,
  onCategoryChange,
}: BlogListProps) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BlogList fired");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <Input
            data-test-id="blog-search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <Link href="/blog/write">
          <Button
            data-test-id="blog-write-btn"
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:from-violet-600 hover:to-fuchsia-600"
          >
            Write a Post
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          data-test-id="blog-category-all"
          onClick={() => onCategoryChange("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          All
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            data-test-id={`blog-category-${cat.value}`}
            onClick={() => onCategoryChange(cat.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat.value
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-sm text-zinc-500">
            No posts found. Be the first to write one!
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const catMeta = BLOG_CATEGORIES.find((c) => c.value === post.category);
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              data-test-id={`blog-card-${post.slug}`}
              className="group rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-6 transition-all hover:border-white/[0.12] hover:bg-zinc-900/80"
            >
              <div className="flex items-center gap-2">
                {catMeta && (
                  <span
                    className={`rounded-full bg-gradient-to-r ${catMeta.color} px-2.5 py-0.5 text-[10px] font-semibold text-white`}
                  >
                    {catMeta.label}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Clock size={11} />
                  {post.readTime} min read
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold leading-snug transition-colors group-hover:text-violet-300">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {post.author} &middot;{" "}
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <ArrowRight
                  size={14}
                  className="text-zinc-600 transition-colors group-hover:text-violet-400"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
