"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

const sampleArticles = [
  {
    id: "1",
    title: "5 Tips to Recover Faster After Sports Injury",
    excerpt: "Practical steps to accelerate recovery safely.",
    date: "Feb 1, 2026",
  },
  {
    id: "2",
    title: "Managing Chronic Back Pain: What Works",
    excerpt: "Evidence-based approaches to long-term relief.",
    date: "Jan 15, 2026",
  },
  {
    id: "3",
    title: "Exercises for Better Posture",
    excerpt: "Simple daily routines to improve posture and reduce pain.",
    date: "Dec 20, 2025",
  },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/public/blogs");
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-muted/50">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors" />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-lg opacity-90">Latest clinic news and guides.</p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? // Loading skeleton
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-video bg-muted"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            : blogs.length > 0
              ? // Dynamic blogs from database
                blogs.map((blog) => (
                  <Card
                    key={blog.id}
                    className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col"
                  >
                    <div className="relative aspect-video bg-muted">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                          <FileText className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      {blog.category && (
                        <Badge className="w-fit mb-2">{blog.category}</Badge>
                      )}
                      <CardTitle className="line-clamp-2">
                        {blog.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grow flex flex-col">
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>
                          {new Date(
                            blog.publishedAt || blog.createdAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {blog.author?.name && (
                          <span>By {blog.author.name}</span>
                        )}
                      </div>
                      <Link href={`/blog/${blog.slug}`} className="mt-auto">
                        <Button className="w-full" variant="default">
                          Read Article
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              : // Fallback to static content
                sampleArticles.map((a) => (
                  <Card
                    key={a.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle>{a.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {a.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {a.date}
                        </span>
                        <Link href={`/blog/${a.id}`}>
                          <Button variant="ghost">Read</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
        </div>
      </main>
    </div>
  );
}
