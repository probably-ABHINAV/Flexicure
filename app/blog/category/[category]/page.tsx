import Link from "next/link"
import { notFound } from "next/navigation"
import { listBlogPosts } from "@/lib/mdx/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"

export async function generateStaticParams() {
  const posts = await listBlogPosts()
  const categories = new Set(posts.map((p) => p.frontMatter.category?.toLowerCase()).filter(Boolean))
  return Array.from(categories).map((category) => ({ category }))
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const allPosts = await listBlogPosts()
  const categoryName = decodeURIComponent(params.category)
  const posts = allPosts.filter((p) => p.frontMatter.category?.toLowerCase() === categoryName.toLowerCase())

  if (posts.length === 0) return notFound()

  const displayCategory = posts[0]?.frontMatter.category || categoryName

  return (
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

      {/* Category header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{displayCategory}</h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? "s" : ""} in this category
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.slug}>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
  )
}
