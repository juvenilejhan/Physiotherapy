import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { z } from "zod";

// Validation schema for appointment booking
const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().optional(),
  appointmentDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  type: z.enum(["IN_PERSON", "TELEHEALTH"]).default("IN_PERSON"),
  notes: z.string().optional(),
  reason: z.string().optional(),
  // Guest user information (optional for logged-in users)
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const appointments = await db.appointment.findMany({
      where: {
        userId: (session.user as any).id,
        ...(status && { status: status as AppointmentStatus }),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            category: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate input
    const validationResult = appointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      type,
      notes,
      reason,
      guestName,
      guestEmail,
      guestPhone,
    } = validationResult.data;

    // Check if user is authenticated or if it's a guest booking
    if (!session?.user && (!guestName || !guestEmail || !guestPhone)) {
      return NextResponse.json(
        { error: "Guest bookings require name, email, and phone" },
        { status: 400 }
      );
    }

    // Get service details
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { duration: true, price: true, name: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Calculate end time
    const startHour = parseInt(startTime.split(":")[0]);
    const startMinute = parseInt(startTime.split(":")[1]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // For authenticated users, use their ID
    let userId;
    let userRole;

    if (session?.user) {
      userId = (session.user as any).id;
      userRole = (session.user as any).role;
    } else {
      // For guest users, create or find a temporary user account
      const existingGuest = await db.user.findUnique({
        where: { email: guestEmail! },
      });

      if (existingGuest) {
        userId = existingGuest.id;
        userRole = existingGuest.role;
      } else {
        // Create a new guest user
        const newGuest = await db.user.create({
          data: {
            email: guestEmail!,
            name: guestName,
            phone: guestPhone,
            role: "PATIENT",
            accountType: "CREDENTIALS",
          },
        });

        await db.patientProfile.create({
          data: { userId: newGuest.id },
        });

        userId = newGuest.id;
        userRole = "PATIENT";
      }
    }

    // Check for conflicting appointments
    const conflictingAppointment = await db.appointment.findFirst({
      where: {
        appointmentDate: new Date(appointmentDate),
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
        ...(staffId ? { staffId } : {}),
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please choose another time." },
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        userId,
        staffId: staffId || null,
        serviceId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        type: type as AppointmentType,
        notes,
        reason,
        status: AppointmentStatus.CONFIRMED,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
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
                image: true,
              },
            },
          },
        },
      },
    });

    // TODO: Send confirmation email/SMS

    return NextResponse.json(
      {
        message: "Appointment booked successfully",
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
