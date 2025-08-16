import Link from "next/link"
import { listBlogPosts, getBlogCategories } from "@/lib/mdx/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, Calendar } from "lucide-react"
import { NewsletterSignup } from "@/components/blog/newsletter-signup"
import { BlogSearch } from "@/components/blog/blog-search"

export const metadata = {
  title: "Blog – Flexicure",
  description: "Physiotherapy tips, remote care best practices, and platform updates from the Flexicure team.",
  openGraph: {
    title: "Flexicure Blog",
    description: "Expert physiotherapy advice and remote care insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flexicure Blog",
    description: "Expert physiotherapy advice and remote care insights",
  },
}

export default async function BlogIndexPage() {
  const posts = await listBlogPosts()
  const categories = await getBlogCategories()
  const featuredPost = posts[0]
  const recentPosts = posts.slice(1, 7)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Flexicure Blog</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Expert physiotherapy advice, remote care insights, and platform updates
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <BlogSearch />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Featured post */}
          {featuredPost && (
            <Card className="mb-8">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={featuredPost.frontMatter.image || "/placeholder.svg?height=400&width=800&query=blog featured"}
                  alt={featuredPost.frontMatter.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{featuredPost.frontMatter.category}</Badge>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(featuredPost.frontMatter.date).toLocaleDateString()}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {featuredPost.readingTime} min read
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:underline">
                    {featuredPost.frontMatter.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{featuredPost.frontMatter.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {featuredPost.frontMatter.author}
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/blog/${featuredPost.slug}`}>Read more</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent posts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Posts</h2>
            {recentPosts.map((post) => (
              <Card key={post.slug}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{post.frontMatter.category}</Badge>
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
                  <CardTitle>
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.frontMatter.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.frontMatter.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {post.frontMatter.author}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/blog/${post.slug}`}>Read more →</Link>
                    </Button>
                  </div>
                  {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.frontMatter.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Newsletter signup */}
          <NewsletterSignup />

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog/category/${encodeURIComponent(category.toLowerCase())}`}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["physiotherapy", "remote-care", "exercises", "recovery", "wellness", "technology"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
