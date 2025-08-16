import Link from "next/link"
import { listBlogPosts } from "@/lib/mdx/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"

export default async function BlogSearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q?.toLowerCase() || ""
  const allPosts = await listBlogPosts()

  const filteredPosts = query
    ? allPosts.filter(
        (post) =>
          post.frontMatter.title.toLowerCase().includes(query) ||
          post.frontMatter.description.toLowerCase().includes(query) ||
          post.frontMatter.category?.toLowerCase().includes(query) ||
          post.frontMatter.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          post.content.toLowerCase().includes(query),
      )
    : []

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

      {/* Search results header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="mt-2 text-muted-foreground">
          {query ? (
            <>
              {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""} for "{query}"
            </>
          ) : (
            "Enter a search term to find articles"
          )}
        </p>
      </div>

      {/* Search results */}
      {query && (
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
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
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
              <Button asChild variant="outline" className="mt-4 bg-transparent">
                <Link href="/blog">Browse all articles</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
