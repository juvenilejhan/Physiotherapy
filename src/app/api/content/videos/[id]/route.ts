import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }

    const video = await db.exerciseVideo.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

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
    console.error("Error fetching video by id:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
