import { NextResponse } from "next/server"
import { listBlogPosts } from "@/lib/mdx/blog"

export async function GET() {
  const posts = await listBlogPosts()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const rssItems = posts
    .slice(0, 20) // Latest 20 posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`
      const pubDate = new Date(post.frontMatter.date).toUTCString()

      return `
        <item>
          <title><![CDATA[${post.frontMatter.title}]]></title>
          <description><![CDATA[${post.frontMatter.description}]]></description>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${pubDate}</pubDate>
          <author>notifications@flexicure.app (${post.frontMatter.author || "Flexicure Team"})</author>
          <category>${post.frontMatter.category || "General"}</category>
        </item>
      `.trim()
    })
    .join("\n")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flexicure Blog</title>
    <description>Expert physiotherapy advice, remote care insights, and platform updates</description>
    <link>${baseUrl}/blog</link>
    <language>en-us</language>
    <managingEditor>notifications@flexicure.app (Flexicure Team)</managingEditor>
    <webMaster>notifications@flexicure.app (Flexicure Team)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`.trim()

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
