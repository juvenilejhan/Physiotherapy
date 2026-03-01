import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { z } from "zod";

const holidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.boolean().default(false),
  description: z.string().optional(),
});

// GET - List all holidays
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, "settings:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);
      where.OR = [
        {
          isRecurring: false,
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        { isRecurring: true },
      ];
    }

    const totalCount = await db.holiday.count({ where });

    const holidays = await db.holiday.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ date: "asc" }],
    });

    return NextResponse.json({
      holidays,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 },
    );
  }
}

// POST - Create a new holiday
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, "settings:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validationResult = holidaySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, date, isRecurring, description } = validationResult.data;

    // Check if holiday already exists on this date
    const existingHoliday = await db.holiday.findFirst({
      where: {
        date: new Date(date),
        isRecurring,
      },
    });

    if (existingHoliday) {
      return NextResponse.json(
        { error: "A holiday already exists on this date" },
        { status: 409 },
      );
    }

    const holiday = await db.holiday.create({
      data: {
        name,
        date: new Date(date),
        isRecurring,
        description: description || null,
      },
    });

    return NextResponse.json(
      { message: "Holiday created successfully", holiday },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating holiday:", error);
    return NextResponse.json(
      { error: "Failed to create holiday" },
      { status: 500 },
    );
  }
}
