"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogCategory, CreateBlogPostInput, BlogWriteProps } from "@/domain/blog/types";
import { BLOG_CATEGORIES } from "@/domain/blog/types";

export function BlogWrite({ onCreatePost }: BlogWriteProps) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BlogWrite fired");
  }

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [category, setCategory] = useState<BlogCategory>("tutorial");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const isValid =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    author.trim().length > 0 &&
    excerpt.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    onCreatePost({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim(),
      authorEmail: authorEmail.trim(),
      category,
      tags,
    });
    setSubmitting(false);
    router.push("/blog");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/blog">
        <Button
          variant="ghost"
          data-test-id="blog-write-back"
          className="mb-6 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Blog
        </Button>
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Write a Blog Post
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Share your experience, tutorial, or tips about building dashboards with
        OpenDash.
      </p>

      <div className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="author" className="text-zinc-300">
              Your Name
            </Label>
            <Input
              id="author"
              data-test-id="blog-write-author"
              placeholder="Jane Doe"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email (optional)
            </Label>
            <Input
              id="email"
              data-test-id="blog-write-email"
              type="email"
              placeholder="jane@example.com"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-zinc-300">
            Title
          </Label>
          <Input
            id="title"
            data-test-id="blog-write-title"
            placeholder="My Dashboard Building Experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-zinc-300">
            Excerpt
          </Label>
          <Input
            id="excerpt"
            data-test-id="blog-write-excerpt"
            placeholder="A brief summary of your post..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as BlogCategory)}
            >
              <SelectTrigger
                data-test-id="blog-write-category"
                className="border-white/10 bg-white/5 text-zinc-100"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0f172a] text-zinc-100">
                {BLOG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-zinc-300">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              data-test-id="blog-write-tags"
              placeholder="tutorial, charts, beginner"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-zinc-300">
              Content (Markdown supported)
            </Label>
            <button
              data-test-id="blog-write-preview-toggle"
              onClick={() => setPreview(!preview)}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div
              data-test-id="blog-write-preview"
              className="min-h-[300px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-zinc-300"
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/^### (.+)$/gm, "<h3 class='mt-4 mb-2 text-base font-semibold text-white'>$1</h3>")
                  .replace(/^## (.+)$/gm, "<h2 class='mt-6 mb-3 text-lg font-bold text-white'>$1</h2>")
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`([^`]+)`/g, "<code class='bg-white/10 px-1 text-xs text-violet-300 rounded'>$1</code>")
                  .replace(/\n/g, "<br />"),
              }}
            />
          ) : (
            <Textarea
              id="content"
              data-test-id="blog-write-content"
              placeholder="Write your post here... Use markdown for formatting (## headings, **bold**, `code`, - lists)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] border-white/10 bg-white/5 font-mono text-sm text-zinc-100 placeholder:text-zinc-500"
            />
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-6">
          <Link href="/blog">
            <Button
              variant="outline"
              data-test-id="blog-write-cancel"
              className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
          </Link>
          <Button
            data-test-id="blog-write-submit"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:from-violet-600 hover:to-fuchsia-600"
          >
            <Send size={14} />
            Publish Post
          </Button>
        </div>
      </div>
    </div>
  );
}
