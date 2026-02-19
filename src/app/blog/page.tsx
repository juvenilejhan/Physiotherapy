"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  return (
    <div className="min-h-screen bg-muted/50">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-lg opacity-90">Latest clinic news and guides.</p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {sampleArticles.map((a) => (
            <Card key={a.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a.excerpt}</p>
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

        <div className="text-center mt-8">
          <Link href="/blog">
            <Button size="lg" variant="outline">
              View All Articles
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
