import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - List all blog posts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'content:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const isPublished = searchParams.get('isPublished');

    const where: any = {};

    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const blogs = await db.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          where: {
            isApproved: true,
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author ? {
        name: blog.author.name,
      } : null,
      authorId: blog.authorId,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
    }));

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new blog post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'content:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, category, tags, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const blog = await db.blogPost.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        content,
        category,
        tags,
        authorId: user.id,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    const formattedBlog = {
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      authorId: blog.authorId,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
    };

    return NextResponse.json(formattedBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
