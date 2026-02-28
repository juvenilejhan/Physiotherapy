import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { z } from "zod";

const updateHolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required").optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  description: z.string().optional().nullable(),
});

// GET - Get a specific holiday
export async function GET(
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

    if (!user || !user.role || !hasPermission(user.role, "settings:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const holiday = await db.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    return NextResponse.json({ holiday });
  } catch (error) {
    console.error("Error fetching holiday:", error);
    return NextResponse.json(
      { error: "Failed to fetch holiday" },
      { status: 500 },
    );
  }
}

// PATCH - Update a holiday
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

    if (!user || !user.role || !hasPermission(user.role, "settings:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingHoliday = await db.holiday.findUnique({
      where: { id },
    });

    if (!existingHoliday) {
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    const body = await req.json();
    const validationResult = updateHolidaySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 },
      );
    }

    const updateData: any = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.date !== undefined) {
      updateData.date = new Date(validationResult.data.date);
    }
    if (validationResult.data.isRecurring !== undefined) {
      updateData.isRecurring = validationResult.data.isRecurring;
    }
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description;
    }

    const holiday = await db.holiday.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    console.error("Error updating holiday:", error);
    return NextResponse.json(
      { error: "Failed to update holiday" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a holiday
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

    if (!user || !user.role || !hasPermission(user.role, "settings:manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingHoliday = await db.holiday.findUnique({
      where: { id },
    });

    if (!existingHoliday) {
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    await db.holiday.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return NextResponse.json(
      { error: "Failed to delete holiday" },
      { status: 500 },
    );
  }
}
