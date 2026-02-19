import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const specialist = await db.staffProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            dateOfBirth: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        schedules: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    if (!specialist) {
      return NextResponse.json(
        { error: "Specialist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ specialist }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specialist by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialist" },
      { status: 500 }
    );
  }
}
