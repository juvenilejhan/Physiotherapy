import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Get a single published blog post by slug (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const blog = await db.blogPost.findUnique({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 },
      );
    }

    const formattedBlog = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      featuredImage: blog.featuredImage,
      category: blog.category,
      tags: blog.tags?.split(",").map((t) => t.trim()) || [],
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            image: blog.author.image,
          }
        : null,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      comments: blog.comments,
    };

    return NextResponse.json(formattedBlog, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}
