import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
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
    console.error("Error fetching public videos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
