import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next/metadata"
import { renderPost, getPostBySlug, listBlogPosts, getRelatedPosts } from "@/lib/mdx/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"
import { NewsletterSignup } from "@/components/blog/newsletter-signup"
import { SocialShare } from "@/components/blog/social-share"

export async function generateStaticParams() {
  const posts = await listBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: "Post not found" }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const postUrl = `${baseUrl}/blog/${params.slug}`
  const imageUrl = post.frontMatter.image || `${baseUrl}/flexicure-physiotherapy-platform-preview.png`

  return {
    title: `${post.frontMatter.title} – Flexicure Blog`,
    description: post.frontMatter.description,
    authors: [{ name: post.frontMatter.author || "Flexicure Team" }],
    openGraph: {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      type: "article",
      publishedTime: post.frontMatter.date,
      authors: [post.frontMatter.author || "Flexicure Team"],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.frontMatter.title,
        },
      ],
      url: postUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) return notFound()

  const Content = await renderPost(post)
  const relatedPosts = await getRelatedPosts(post.slug, post.frontMatter.category, post.frontMatter.tags)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const postUrl = `${baseUrl}/blog/${params.slug}`

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontMatter.title,
    description: post.frontMatter.description,
    image: post.frontMatter.image || `${baseUrl}/flexicure-physiotherapy-platform-preview.png`,
    datePublished: post.frontMatter.date,
    dateModified: post.frontMatter.date,
    author: {
      "@type": "Person",
      name: post.frontMatter.author || "Flexicure Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Flexicure",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/flexicure-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        {/* Back button */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to blog
            </Link>
          </Button>
        </div>

        {/* Article header */}
        <article>
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{post.frontMatter.category}</Badge>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.frontMatter.date).toLocaleDateString()}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight">{post.frontMatter.title}</h1>

            <p className="mt-4 text-xl text-muted-foreground">{post.frontMatter.description}</p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {post.frontMatter.author}
              </div>
              <SocialShare url={postUrl} title={post.frontMatter.title} />
            </div>

            {post.frontMatter.image && (
              <div className="mt-8 overflow-hidden rounded-lg">
                <img
                  src={post.frontMatter.image || "/placeholder.svg"}
                  alt={post.frontMatter.title}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Article content */}
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            <Content />
          </div>

          {/* Tags */}
          {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {post.frontMatter.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <Separator className="mb-8" />
            <h2 className="mb-6 text-2xl font-semibold">Related Posts</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.slug}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">
                      {relatedPost.frontMatter.category}
                    </Badge>
                    <CardTitle className="text-lg">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:underline">
                        {relatedPost.frontMatter.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{relatedPost.frontMatter.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {relatedPost.readingTime} min read
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter signup */}
        <div className="mt-12">
          <Separator className="mb-8" />
          <NewsletterSignup />
        </div>
      </div>
    </>
  )
}
