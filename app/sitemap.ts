import type { MetadataRoute } from "next"
import { listBlogPosts } from "@/lib/mdx/blog"

export default async function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const posts = await listBlogPosts()

  const staticPages = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${base}/status`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/auth/sign-in`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/auth/sign-up`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ]

  const blogPages = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.frontMatter.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
