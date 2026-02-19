import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: "Date and service ID are required" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Get the service to know duration
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const serviceDuration = service.duration; // in minutes

    // Get staff schedule for the day
    const dayOfWeek = selectedDate.getDay();

    const staffScheduleQuery: any = {
      dayOfWeek: dayOfWeek,
      isAvailable: true,
      effectiveFrom: { lte: selectedDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: selectedDate } }],
    };

    if (staffId) {
      staffScheduleQuery.staffId = staffId;
    }

    const schedules = await db.staffSchedule.findMany({
      where: staffScheduleQuery,
    });

    if (schedules.length === 0) {
      return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    // Get existing appointments for the day
    const appointmentsQuery: any = {
      appointmentDate: {
        gte: selectedDate,
        lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    };

    if (staffId) {
      appointmentsQuery.staffId = staffId;
    }

    const existingAppointments = await db.appointment.findMany({
      where: appointmentsQuery,
      select: {
        startTime: true,
        endTime: true,
        staffId: true,
      },
    });

    // Generate available time slots using a Set to ensure uniqueness
    const availableSlotsSet = new Set<string>();

    for (const schedule of schedules) {
      const startHour = parseInt(schedule.startTime.split(":")[0]);
      const startMinute = parseInt(schedule.startTime.split(":")[1]);
      const endHour = parseInt(schedule.endTime.split(":")[0]);
      const endMinute = parseInt(schedule.endTime.split(":")[1]);

      let currentTime = startHour * 60 + startMinute; // in minutes from midnight
      const endTime = endHour * 60 + endMinute;

      // Skip break time if exists
      let breakStart = 0;
      let breakEnd = 0;

      if (schedule.breakStart && schedule.breakEnd) {
        breakStart = parseInt(schedule.breakStart.split(":")[0]) * 60 +
                     parseInt(schedule.breakStart.split(":")[1]);
        breakEnd = parseInt(schedule.breakEnd.split(":")[0]) * 60 +
                   parseInt(schedule.breakEnd.split(":")[1]);
      }

      while (currentTime + serviceDuration <= endTime) {
        // Skip if during break time
        if (currentTime >= breakStart && currentTime < breakEnd) {
          currentTime = breakEnd;
          continue;
        }

        // Format current time as HH:MM
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const timeSlot = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        // Calculate end time
        const endTimeSlot = currentTime + serviceDuration;
        const endHours = Math.floor(endTimeSlot / 60);
        const endMinutes = endTimeSlot % 60;
        const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}`;

        // Check if this slot is available
        const isSlotAvailable = !existingAppointments.some((apt) => {
          if (staffId && apt.staffId !== staffId) {
            return false;
          }

          const aptStart = parseInt(apt.startTime.split(":")[0]) * 60 +
                           parseInt(apt.startTime.split(":")[1]);
          const aptEnd = parseInt(apt.endTime.split(":")[0]) * 60 +
                         parseInt(apt.endTime.split(":")[1]);

          // Check for overlap
          return (
            (currentTime >= aptStart && currentTime < aptEnd) ||
            (endTimeSlot > aptStart && endTimeSlot <= aptEnd) ||
            (currentTime <= aptStart && endTimeSlot >= aptEnd)
          );
        });

        if (isSlotAvailable) {
          availableSlotsSet.add(timeSlot);
        }

        // Move to next slot (15-minute intervals)
        currentTime += 15;
      }
    }

    return NextResponse.json(
      {
        availableSlots: Array.from(availableSlotsSet).sort(),
        serviceDuration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
