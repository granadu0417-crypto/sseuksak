import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        category: data.category || '',
        tags: data.tags || [],
        thumbnail: data.thumbnail,
        readingTime: stats.text,
      };
    });

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  // Convert YouTube tags BEFORE remark processing (to prevent HTML escaping)
  const contentWithYouTube = content.replace(
    /<youtube\s+id="([^"]+)"(?:\s+title="([^"]*)")?\s*\/>/gi,
    (match, videoId, title = 'YouTube video') => {
      return `
<div class="youtube-embed">
<iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:0.5rem;"></iframe>
<p style="text-align:center;font-size:0.875rem;color:#6b7280;margin-top:0.5rem;">${title}</p>
</div>
`;
    }
  );

  const processedContent = await remark().use(remarkGfm).use(html, { sanitize: false }).process(contentWithYouTube);
  let contentHtml = processedContent.toString();

  // Convert H1 to H2 in content (page title is already H1, SEO requires single H1)
  contentHtml = contentHtml.replace(/<h1>(.*?)<\/h1>/gi, '<h2>$1</h2>');

  // Add IDs to headings for TOC navigation
  let headingIndex = 0;
  contentHtml = contentHtml.replace(/<(h[2-3])>(.*?)<\/\1>/gi, (match, tag, text) => {
    const id = `heading-${headingIndex++}`;
    return `<${tag} id="${id}">${text}</${tag}>`;
  });

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    category: data.category || '',
    tags: data.tags || [],
    thumbnail: data.thumbnail,
    readingTime: stats.text,
    content: contentHtml,
  };
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap((post) => post.tags));
  return Array.from(tags);
}

export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  return {
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const currentPost = getAllPosts().find((post) => post.slug === slug);
  if (!currentPost) return [];

  const posts = getAllPosts()
    .filter((post) => post.slug !== slug)
    .map((post) => {
      let score = 0;
      if (post.category === currentPost.category) score += 2;
      const commonTags = post.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      );
      score += commonTags.length;
      return { ...post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return posts;
}

// Pagination utilities
export const POSTS_PER_PAGE = 9;

export interface PaginatedPosts {
  posts: PostMeta[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function getPaginatedPosts(page: number): PaginatedPosts {
  const allPosts = getAllPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

export function getTotalPages(): number {
  const allPosts = getAllPosts();
  return Math.ceil(allPosts.length / POSTS_PER_PAGE);
}
