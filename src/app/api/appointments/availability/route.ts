import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  timeToMinutes,
  minutesToTime,
  isToday,
  getCurrentTime,
} from "@/lib/time-utils";

// Buffer time in minutes for same-day bookings (can't book within next 30 min)
const SAME_DAY_BUFFER_MINUTES = 30;

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): string {
  if (!time12h || time12h === "Closed") return "";

  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "";

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Check if a date is a holiday
async function checkHoliday(
  date: Date,
): Promise<{ isHoliday: boolean; holidayName?: string }> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Check one-time holidays
  const oneTimeHoliday = await db.holiday.findFirst({
    where: {
      isRecurring: false,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (oneTimeHoliday) {
    return { isHoliday: true, holidayName: oneTimeHoliday.name };
  }

  // Check recurring holidays (same month and day)
  const recurringHolidays = await db.holiday.findMany({
    where: { isRecurring: true },
  });

  for (const holiday of recurringHolidays) {
    const holidayDate = new Date(holiday.date);
    if (
      holidayDate.getMonth() === date.getMonth() &&
      holidayDate.getDate() === date.getDate()
    ) {
      return { isHoliday: true, holidayName: holiday.name };
    }
  }

  return { isHoliday: false };
}

// Get clinic working hours for a specific day
async function getClinicWorkingHours(
  dayOfWeek: number,
): Promise<{ startTime: string; endTime: string } | null> {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  const clinicSettings = await db.clinicSettings.findFirst();
  if (!clinicSettings || !clinicSettings.workingHours) return null;

  const workingHours =
    typeof clinicSettings.workingHours === "string"
      ? JSON.parse(clinicSettings.workingHours)
      : clinicSettings.workingHours;

  const hours = workingHours[dayName];
  if (!hours || hours === "Closed") return null;

  const parts = hours.split(" - ");
  if (parts.length !== 2) return null;

  const startTime = convertTo24Hour(parts[0].trim());
  const endTime = convertTo24Hour(parts[1].trim());

  if (!startTime || !endTime) return null;

  return { startTime, endTime };
}

// Get staff schedule for a specific day
async function getStaffSchedule(
  staffId: string,
  dayOfWeek: number,
): Promise<{
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
} | null> {
  const schedule = await db.staffSchedule.findFirst({
    where: {
      staffId,
      dayOfWeek,
      isAvailable: true,
    },
  });

  if (!schedule) return null;

  return {
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    breakStart: schedule.breakStart || undefined,
    breakEnd: schedule.breakEnd || undefined,
  };
}

// Get all staff who provide a specific service
async function getStaffForService(serviceId: string): Promise<string[]> {
  const staffServices = await db.staffService.findMany({
    where: {
      serviceId,
      isActive: true,
    },
    select: { staffId: true },
  });

  return staffServices.map((ss) => ss.staffId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    if (!date || !serviceId) {
      return NextResponse.json(
        { error: "Date and service ID are required" },
        { status: 400 },
      );
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // 1. Check if date is a holiday
    const holidayCheck = await checkHoliday(selectedDate);
    if (holidayCheck.isHoliday) {
      return NextResponse.json(
        {
          availableSlots: [],
          isHoliday: true,
          holidayName: holidayCheck.holidayName,
          message: `Clinic is closed for ${holidayCheck.holidayName}`,
        },
        { status: 200 },
      );
    }

    // 2. Get the service to know duration
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { duration: true },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const serviceDuration = service.duration; // in minutes
    const dayOfWeek = selectedDate.getDay();

    // 3. Get clinic working hours
    const clinicHours = await getClinicWorkingHours(dayOfWeek);
    if (!clinicHours) {
      return NextResponse.json(
        {
          availableSlots: [],
          isClosed: true,
          message: "Clinic is closed on this day",
        },
        { status: 200 },
      );
    }

    // 4. Determine working schedule based on specific staff or "any doctor"
    let workingSchedule: {
      startTime: string;
      endTime: string;
      breakStart?: string;
      breakEnd?: string;
    };

    // Staff IDs to check appointments for
    let staffIdsToCheck: string[] = [];

    if (staffId) {
      // Specific staff selected - use their schedule if available, else clinic hours
      const staffSchedule = await getStaffSchedule(staffId, dayOfWeek);
      workingSchedule = staffSchedule || clinicHours;
      staffIdsToCheck = [staffId];
    } else {
      // "Any Available" - use clinic hours, check all staff who provide this service
      workingSchedule = clinicHours;
      staffIdsToCheck = await getStaffForService(serviceId);

      // If no staff provide this service, fallback to showing clinic hours slots
      // (these can be assigned later by clinic manager)
      if (staffIdsToCheck.length === 0) {
        staffIdsToCheck = []; // Will check for appointments with staffId null
      }
    }

    // 5. Get existing appointments for the day
    const appointmentsQuery: any = {
      appointmentDate: {
        gte: selectedDate,
        lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    };

    // Only filter by staff IDs if we have specific staff
    if (staffIdsToCheck.length > 0) {
      appointmentsQuery.staffId = { in: staffIdsToCheck };
    }

    const existingAppointments = await db.appointment.findMany({
      where: appointmentsQuery,
      select: {
        startTime: true,
        endTime: true,
        staffId: true,
      },
    });

    // Also get appointments with null staffId (unassigned "any doctor" appointments)
    if (!staffId) {
      const unassignedAppointments = await db.appointment.findMany({
        where: {
          appointmentDate: {
            gte: selectedDate,
            lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          staffId: null,
        },
        select: {
          startTime: true,
          endTime: true,
          staffId: true,
        },
      });
      existingAppointments.push(...unassignedAppointments);
    }

    // 6. Generate available time slots
    const availableSlots: string[] = [];

    const scheduleStartMinutes = timeToMinutes(workingSchedule.startTime);
    const scheduleEndMinutes = timeToMinutes(workingSchedule.endTime);

    let breakStartMinutes = 0;
    let breakEndMinutes = 0;
    if (workingSchedule.breakStart && workingSchedule.breakEnd) {
      breakStartMinutes = timeToMinutes(workingSchedule.breakStart);
      breakEndMinutes = timeToMinutes(workingSchedule.breakEnd);
    }

    // For same-day bookings, calculate minimum start time
    let minimumStartMinutes = scheduleStartMinutes;
    const isTodayBooking = isToday(selectedDate);

    if (isTodayBooking) {
      const currentTimeMinutes = timeToMinutes(getCurrentTime());
      minimumStartMinutes = Math.max(
        scheduleStartMinutes,
        currentTimeMinutes + SAME_DAY_BUFFER_MINUTES,
      );
      // Round up to next 15-minute interval
      minimumStartMinutes = Math.ceil(minimumStartMinutes / 15) * 15;
    }

    let currentTime = minimumStartMinutes;

    while (currentTime + serviceDuration <= scheduleEndMinutes) {
      // Skip if during break time
      if (
        breakStartMinutes > 0 &&
        currentTime >= breakStartMinutes &&
        currentTime < breakEndMinutes
      ) {
        currentTime = breakEndMinutes;
        continue;
      }

      const timeSlot = minutesToTime(currentTime);
      const endTimeSlot = currentTime + serviceDuration;

      // Check slot availability
      let isSlotAvailable: boolean;

      if (staffId) {
        // Specific staff - check if they have a conflicting appointment
        isSlotAvailable = !existingAppointments.some((apt) => {
          if (apt.staffId !== staffId) return false;

          const aptStart = timeToMinutes(apt.startTime);
          const aptEnd = timeToMinutes(apt.endTime);

          // Check for overlap
          return currentTime < aptEnd && endTimeSlot > aptStart;
        });
      } else if (staffIdsToCheck.length > 0) {
        // "Any Available" with known staff - check if at least one staff is free
        const busyStaffIds = existingAppointments
          .filter((apt) => {
            if (!apt.staffId) return false;
            const aptStart = timeToMinutes(apt.startTime);
            const aptEnd = timeToMinutes(apt.endTime);
            return currentTime < aptEnd && endTimeSlot > aptStart;
          })
          .map((apt) => apt.staffId);

        // Slot is available if at least one staff is not busy
        const availableStaffCount = staffIdsToCheck.filter(
          (id) => !busyStaffIds.includes(id),
        ).length;

        isSlotAvailable = availableStaffCount > 0;

        // Also check for unassigned appointments at this time (they block one implicit slot)
        const unassignedAtThisTime = existingAppointments.filter((apt) => {
          if (apt.staffId !== null) return false;
          const aptStart = timeToMinutes(apt.startTime);
          const aptEnd = timeToMinutes(apt.endTime);
          return currentTime < aptEnd && endTimeSlot > aptStart;
        });

        // Each unassigned appointment reduces available capacity
        if (unassignedAtThisTime.length >= availableStaffCount) {
          isSlotAvailable = false;
        }
      } else {
        // No specific staff configured - check unassigned appointments only
        const conflictingUnassigned = existingAppointments.some((apt) => {
          if (apt.staffId !== null) return false;
          const aptStart = timeToMinutes(apt.startTime);
          const aptEnd = timeToMinutes(apt.endTime);
          return currentTime < aptEnd && endTimeSlot > aptStart;
        });

        isSlotAvailable = !conflictingUnassigned;
      }

      if (isSlotAvailable) {
        availableSlots.push(timeSlot);
      }

      // Move to next slot (15-minute intervals)
      currentTime += 15;
    }

    return NextResponse.json(
      {
        availableSlots: availableSlots.sort(),
        serviceDuration,
        isSameDay: isTodayBooking,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
