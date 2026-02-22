"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Clock, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  } | null;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/public/blogs/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        console.error("Blog fetch failed:", response.status, data);
        toast.error(data.error || "Blog post not found");
        router.push("/blog");
        return;
      }

      console.log("Blog data received:", data);
      setBlog(data);
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Failed to load blog post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || "",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  // Determine valid date for display
  const displayDate = blog.publishedAt || blog.createdAt;
  const dateObj = new Date(displayDate);
  const isValidDate = !isNaN(dateObj.getTime());

  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  const timeAgo = isValidDate
    ? formatDistanceToNow(dateObj, { addSuffix: true })
    : "recently";

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-0 transition-colors" />
          </div>
          {blog.category && <Badge className="mb-4">{blog.category}</Badge>}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-4xl">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-lg opacity-90 max-w-3xl">{blog.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-primary-foreground/80">
            {blog.author?.name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:marker:text-primary
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{
                  __html: blog.content || blog.excerpt || "",
                }}
              />

              <Separator className="my-8" />

              {/* Share Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Published {formattedDate}
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          {blog.author && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    {blog.author.image ? (
                      <Image
                        src={blog.author.image}
                        alt={blog.author.name || "Author"}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {blog.author.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Content Author at PhysioConnect
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
