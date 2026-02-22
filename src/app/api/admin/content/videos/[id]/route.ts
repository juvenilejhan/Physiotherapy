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

// PATCH - Update exercise video
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      !hasPermission(user.role as UserRole, "content:update")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }
    const body = await req.json();

    // Check if video exists
    const existingVideo = await db.exerciseVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

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

    const video = await db.exerciseVideo.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(duration && { duration }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
        ...(bodyParts && { bodyParts: JSON.stringify(bodyParts) }),
        ...(videoUrl && { videoUrl: normalizeVideoUrl(videoUrl) }),
        ...(featured !== undefined && { featured }),
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

    return NextResponse.json(formattedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete exercise video
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      !hasPermission(user.role as UserRole, "content:delete")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }

    // Check if video exists
    const existingVideo = await db.exerciseVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await db.exerciseVideo.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Video deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting video:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
