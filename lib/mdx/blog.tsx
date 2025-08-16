import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { MDXRemote } from "next-mdx-remote/rsc"
import { highlight } from "sugar-high"
import { Suspense } from "react"

const contentDir = path.join(process.cwd(), "content", "blog")

export type BlogPost = {
  slug: string
  frontMatter: {
    title: string
    description: string
    date: string
    author?: string
    category?: string
    tags?: string[]
    image?: string
    published?: boolean
  }
  content: string
  readingTime: number
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  try {
    const files = await fs.readdir(contentDir)
    const posts = await Promise.all(
      files
        .filter((f) => f.endsWith(".mdx"))
        .map(async (file) => {
          const full = path.join(contentDir, file)
          const raw = await fs.readFile(full, "utf8")
          const { data, content } = matter(raw)

          // Only include published posts in production
          if (process.env.NODE_ENV === "production" && data.published === false) {
            return null
          }

          return {
            slug: file.replace(/\.mdx$/, ""),
            frontMatter: {
              title: data.title || "Untitled",
              description: data.description || "",
              date: data.date || new Date().toISOString(),
              author: data.author || "Flexicure Team",
              category: data.category || "General",
              tags: data.tags || [],
              image: data.image || null,
              published: data.published !== false,
            },
            content,
            readingTime: calculateReadingTime(content),
          } as BlogPost
        }),
    )

    const validPosts = posts.filter(Boolean) as BlogPost[]
    validPosts.sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime())
    return validPosts
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const full = path.join(contentDir, `${slug}.mdx`)
  try {
    const raw = await fs.readFile(full, "utf8")
    const { data, content } = matter(raw)

    // Check if post is published
    if (process.env.NODE_ENV === "production" && data.published === false) {
      return null
    }

    return {
      slug,
      frontMatter: {
        title: data.title || "Untitled",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        author: data.author || "Flexicure Team",
        category: data.category || "General",
        tags: data.tags || [],
        image: data.image || null,
        published: data.published !== false,
      },
      content,
      readingTime: calculateReadingTime(content),
    }
  } catch {
    return null
  }
}

export async function getRelatedPosts(currentSlug: string, category?: string, tags?: string[]): Promise<BlogPost[]> {
  const allPosts = await listBlogPosts()
  const otherPosts = allPosts.filter((p) => p.slug !== currentSlug)

  // Score posts by relevance
  const scoredPosts = otherPosts.map((post) => {
    let score = 0

    // Same category gets higher score
    if (category && post.frontMatter.category === category) {
      score += 3
    }

    // Shared tags get points
    if (tags && post.frontMatter.tags) {
      const sharedTags = tags.filter((tag) => post.frontMatter.tags?.includes(tag))
      score += sharedTags.length * 2
    }

    return { post, score }
  })

  // Sort by score and return top 3
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post)
}

export async function getBlogCategories(): Promise<string[]> {
  const posts = await listBlogPosts()
  const categories = new Set(posts.map((p) => p.frontMatter.category).filter(Boolean))
  return Array.from(categories).sort()
}

export async function getBlogTags(): Promise<string[]> {
  const posts = await listBlogPosts()
  const tags = new Set<string>()
  posts.forEach((p) => {
    p.frontMatter.tags?.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

// Custom MDX components
const components = {
  pre: ({ children, ...props }: any) => {
    return (
      <pre {...props} className="overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        {children}
      </pre>
    )
  },
  code: ({ children, ...props }: any) => {
    const codeHTML = highlight(children)
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
  },
  blockquote: ({ children, ...props }: any) => (
    <blockquote {...props} className="border-l-4 border-green-500 pl-4 italic text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      {...props}
      className="text-green-600 underline hover:text-green-700 dark:text-green-400"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
}

export async function renderPost(post: BlogPost) {
  return function Rendered() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MDXRemote source={post.content} components={components} />
      </Suspense>
    )
  }
}
