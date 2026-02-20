import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - List published blog posts (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");

    const blogs = await db.blogPost.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
      },
      orderBy: {
        publishedAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }),
    });

    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      featuredImage: blog.featuredImage,
      category: blog.category,
      tags: blog.tags?.split(",").map((t) => t.trim()) || [],
      author: null,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
    }));

    return NextResponse.json(formattedBlogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch blog posts", details: errorMessage },
      { status: 500 },
    );
  }
}
