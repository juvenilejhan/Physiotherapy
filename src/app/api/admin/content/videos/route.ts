import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, UserRole } from "@/lib/rbac";

function normalizeVideoUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

// GET - List all exercise videos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (
      !user ||
      !user.role ||
      !hasPermission(user.role as UserRole, "content:view")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: any = {
      isActive: true,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    const videos = await db.exerciseVideo.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Parse body parts JSON
    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
      difficulty: video.difficulty,
      category: video.category,
      bodyParts: video.bodyParts ? JSON.parse(video.bodyParts) : [],
      videoUrl: video.videoUrl,
      featured: video.featured,
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new exercise video
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (
      !user ||
      !user.role ||
      !hasPermission(user.role as UserRole, "content:create")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      thumbnail,
      duration,
      difficulty,
      category,
      bodyParts,
      videoUrl,
      featured,
    } = body;

    if (
      !title ||
      !description ||
      !videoUrl ||
      !duration ||
      !difficulty ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const video = await db.exerciseVideo.create({
      data: {
        title,
        description,
        thumbnail: thumbnail || null,
        duration,
        difficulty,
        category,
        bodyParts: bodyParts ? JSON.stringify(bodyParts) : null,
        videoUrl: normalizeVideoUrl(videoUrl),
        featured: featured || false,
        isActive: true,
      },
    });

    // Parse body parts for response
    const formattedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
      difficulty: video.difficulty,
      category: video.category,
      bodyParts: video.bodyParts ? JSON.parse(video.bodyParts) : [],
      videoUrl: video.videoUrl,
      featured: video.featured,
    };

    return NextResponse.json(formattedVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
