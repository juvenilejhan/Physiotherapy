import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { z } from "zod";

const assignSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
});

// PATCH - Assign a staff member to an appointment
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
      !hasPermission(user.role, "appointments:manage_all")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate input
    const validationResult = assignSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 },
      );
    }

    const { staffId } = validationResult.data;

    // Check if appointment exists
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Check if the staff member exists and is active
    const staffProfile = await db.staffProfile.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!staffProfile) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 },
      );
    }

    if (!staffProfile.isAvailable) {
      return NextResponse.json(
        { error: "Staff member is not available" },
        { status: 400 },
      );
    }

    // Check if the staff has any conflicting appointments
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        id: { not: id },
        staffId,
        appointmentDate: appointment.appointmentDate,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          {
            // New appointment starts during existing
            startTime: { lte: appointment.startTime },
            endTime: { gt: appointment.startTime },
          },
          {
            // New appointment ends during existing
            startTime: { lt: appointment.endTime },
            endTime: { gte: appointment.endTime },
          },
          {
            // Existing appointment is within new
            startTime: { gte: appointment.startTime },
            endTime: { lte: appointment.endTime },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        {
          error: `Staff member has a conflicting appointment at ${appointment.startTime} - ${appointment.endTime}`,
        },
        { status: 409 },
      );
    }

    // Update the appointment with the assigned staff
    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: {
        staffId,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: `Appointment assigned to ${staffProfile.user.name}`,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error assigning appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
