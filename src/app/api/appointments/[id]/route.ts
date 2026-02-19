import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for appointment update
const updateAppointmentSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "RESCHEDULED"]).optional(),
  cancelReason: z.string().optional(),
  newDate: z.string().optional(),
  newStartTime: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this appointment
    if (appointment.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get the appointment
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to update this appointment
    if (appointment.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Handle cancellation
    if (validationResult.data.status === "CANCELLED") {
      const updatedAppointment = await db.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelReason: validationResult.data.cancelReason || null,
        },
      });

      // TODO: Send cancellation email/SMS

      return NextResponse.json(
        {
          message: "Appointment cancelled successfully",
          appointment: updatedAppointment,
        },
        { status: 200 }
      );
    }

    // Handle rescheduling
    if (validationResult.data.newDate && validationResult.data.newStartTime) {
      const { newDate, newStartTime } = validationResult.data;

      // Calculate new end time
      const service = appointment.service;
      const startHour = parseInt(newStartTime.split(":")[0]);
      const startMinute = parseInt(newStartTime.split(":")[1]);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = startMinutes + service.duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const newEndTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      // Check for conflicting appointments at new time
      const conflictingAppointment = await db.appointment.findFirst({
        where: {
          id: { not: id },
          appointmentDate: new Date(newDate),
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
          ...(appointment.staffId ? { staffId: appointment.staffId } : {}),
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "The requested time slot is not available" },
          { status: 409 }
        );
      }

      const updatedAppointment = await db.appointment.update({
        where: { id },
        data: {
          appointmentDate: new Date(newDate),
          startTime: newStartTime,
          endTime: newEndTime,
          status: AppointmentStatus.CONFIRMED,
        },
      });

      // TODO: Send rescheduling confirmation email/SMS

      return NextResponse.json(
        {
          message: "Appointment rescheduled successfully",
          appointment: updatedAppointment,
        },
        { status: 200 }
      );
    }

    // Handle status update
    if (validationResult.data.status) {
      const updatedAppointment = await db.appointment.update({
        where: { id },
        data: {
          status: validationResult.data.status as AppointmentStatus,
        },
      });

      return NextResponse.json(
        {
          message: "Appointment updated successfully",
          appointment: updatedAppointment,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "No valid update provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the appointment
    const appointment = await db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this appointment
    if (appointment.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Soft delete by marking as cancelled
    const deletedAppointment = await db.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason: "Deleted by user",
      },
    });

    return NextResponse.json(
      {
        message: "Appointment deleted successfully",
        appointment: deletedAppointment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
