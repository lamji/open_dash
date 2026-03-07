"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlogPostViewProps } from "@/domain/blog/types";
import { BLOG_CATEGORIES } from "@/domain/blog/types";

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="mt-8 mb-3 text-lg font-semibold text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-10 mb-4 text-xl font-bold text-white">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-200">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-violet-300">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed text-zinc-400">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm leading-relaxed text-zinc-400">$2</li>')
    .replace(/\n\n/g, '</p><p class="mt-3 text-sm leading-relaxed text-zinc-400">')
    .replace(/\n/g, "<br />");
}

export function BlogPostView({ post }: BlogPostViewProps) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BlogPostView fired");
  }

  const catMeta = BLOG_CATEGORIES.find((c) => c.value === post.category);

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/blog">
        <Button
          variant="ghost"
          data-test-id="blog-post-back"
          className="mb-8 text-zinc-400"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Blog
        </Button>
      </Link>

      <div className="flex items-center gap-3">
        {catMeta && (
          <span
            className={`rounded-full bg-gradient-to-r ${catMeta.color} px-3 py-1 text-xs font-semibold text-white`}
          >
            {catMeta.label}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Clock size={12} />
          {post.readTime} min read
        </span>
      </div>

      <h1
        data-test-id="blog-post-title"
        className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
      >
        {post.title}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold">
          {post.author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium">{post.author}</p>
          <p className="text-xs text-zinc-500">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/[0.06] pt-8">
        <div
          data-test-id="blog-post-content"
          className="prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: `<p class="text-sm leading-relaxed text-zinc-400">${renderMarkdown(post.content)}</p>`,
          }}
        />
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-6">
          <Tag size={14} className="text-zinc-500" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
