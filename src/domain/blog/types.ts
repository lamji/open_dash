export type BlogCategory = "tutorial" | "experience" | "tips-tricks" | "announcement";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorEmail: string;
  category: BlogCategory;
  tags: string[];
  readTime: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogState {
  posts: BlogPost[];
  selectedPost: BlogPost | null;
  view: "list" | "post" | "write";
  searchQuery: string;
  activeCategory: BlogCategory | "all";
  loading: boolean;
}

export interface CreateBlogPostInput {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  authorEmail: string;
  category: BlogCategory;
  tags: string[];
}

export interface BlogListProps {
  posts: BlogPost[];
  searchQuery: string;
  activeCategory: BlogCategory | "all";
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: BlogCategory | "all") => void;
}

export interface BlogPostViewProps {
  post: BlogPost;
}

export interface BlogWriteProps {
  onCreatePost: (input: CreateBlogPostInput) => void;
}

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; color: string }[] = [
  { value: "tutorial", label: "Tutorial", color: "from-cyan-500 to-blue-500" },
  { value: "experience", label: "Experience", color: "from-violet-500 to-fuchsia-500" },
  { value: "tips-tricks", label: "Tips & Tricks", color: "from-amber-500 to-orange-500" },
  { value: "announcement", label: "Announcement", color: "from-emerald-500 to-teal-500" },
];
