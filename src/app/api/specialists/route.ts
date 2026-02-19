import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    const whereClause: any = {
      isAvailable: true,
    };

    if (serviceId) {
      whereClause.services = {
        some: {
          serviceId: serviceId,
        },
      };
    }

    const specialists = await db.staffProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json({ specialists }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specialists:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialists" },
      { status: 500 }
    );
  }
}
