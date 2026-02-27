import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper function to convert 24-hour format to 12-hour format
function convertTo12Hour(time24h: string): string {
  if (!time24h) return "";

  const [hoursStr, minutesStr] = time24h.split(":");
  let hours = parseInt(hoursStr);
  const minutes = minutesStr || "00";

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
}

// Helper function to convert 12-hour format (from clinic settings) to display format
function parseClinicHours(
  hours: string,
): { startTime: string; endTime: string } | null {
  if (!hours || hours === "Closed") return null;

  const parts = hours.split(" - ");
  if (parts.length !== 2) return null;

  return {
    startTime: parts[0].trim(),
    endTime: parts[1].trim(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
            dayOfWeek: "asc",
          },
        },
      },
    });

    if (!specialist) {
      return NextResponse.json(
        { error: "Specialist not found" },
        { status: 404 },
      );
    }

    // Fetch clinic working hours
    const clinicSettings = await db.clinicSettings.findFirst();
    const clinicWorkingHours = clinicSettings?.workingHours
      ? typeof clinicSettings.workingHours === "string"
        ? JSON.parse(clinicSettings.workingHours)
        : clinicSettings.workingHours
      : null;

    // Build schedule from clinic working hours
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    let formattedSchedules: Array<{
      id: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }> = [];

    if (clinicWorkingHours) {
      // Use clinic working hours
      for (let i = 0; i < 7; i++) {
        const dayName = dayNames[i];
        const hours = clinicWorkingHours[dayName];
        const parsed = parseClinicHours(hours);

        if (parsed) {
          formattedSchedules.push({
            id: `clinic-${i}`,
            dayOfWeek: i,
            startTime: parsed.startTime,
            endTime: parsed.endTime,
          });
        }
      }
    } else if (specialist.schedules && specialist.schedules.length > 0) {
      // Fall back to staff schedules (convert to 12-hour format)
      formattedSchedules = specialist.schedules
        .filter((s) => s.isAvailable)
        .map((s) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: convertTo12Hour(s.startTime),
          endTime: convertTo12Hour(s.endTime),
        }));
    }

    // Return specialist with formatted schedules
    const response = {
      ...specialist,
      schedules: formattedSchedules,
    };

    return NextResponse.json({ specialist: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specialist by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialist" },
      { status: 500 },
    );
  }
}
