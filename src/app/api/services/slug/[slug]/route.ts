import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const service = await db.service.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        staffServices: {
          include: {
            staff: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
