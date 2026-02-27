import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { normalizeBDPhone } from "@/lib/utils";

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

// Helper function to sync clinic working hours to all staff schedules
async function syncStaffSchedules(workingHours: Record<string, string>) {
  const dayMapping: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // Get all staff profiles
  const staffProfiles = await db.staffProfile.findMany({
    select: { id: true },
  });

  if (staffProfiles.length === 0) return;

  // Process each day of the week
  for (const [day, hours] of Object.entries(workingHours)) {
    const dayOfWeek = dayMapping[day.toLowerCase()];
    if (dayOfWeek === undefined) continue;

    const isClosed = !hours || hours === "Closed";

    // Parse start and end time from "9:00 AM - 5:00 PM" format
    let startTime = "";
    let endTime = "";

    if (!isClosed) {
      const parts = hours.split(" - ");
      if (parts.length === 2) {
        startTime = convertTo24Hour(parts[0].trim());
        endTime = convertTo24Hour(parts[1].trim());
      }
    }

    // Update or create schedule for each staff member
    for (const staff of staffProfiles) {
      // Find existing schedule for this day
      const existingSchedule = await db.staffSchedule.findFirst({
        where: {
          staffId: staff.id,
          dayOfWeek,
        },
      });

      if (isClosed) {
        // If closed, mark as unavailable or delete
        if (existingSchedule) {
          await db.staffSchedule.update({
            where: { id: existingSchedule.id },
            data: { isAvailable: false },
          });
        }
      } else if (startTime && endTime) {
        if (existingSchedule) {
          // Update existing schedule
          await db.staffSchedule.update({
            where: { id: existingSchedule.id },
            data: {
              startTime,
              endTime,
              isAvailable: true,
            },
          });
        } else {
          // Create new schedule
          await db.staffSchedule.create({
            data: {
              staffId: staff.id,
              dayOfWeek,
              startTime,
              endTime,
              isAvailable: true,
            },
          });
        }
      }
    }
  }
}

// GET - Get clinic settings
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

    let settings = await db.clinicSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await db.clinicSettings.create({
        data: {
          name: "PhysioConnect Clinic",
          email: "contact@physioconnect.com",
          phone: "+8801XXXXXXXXX",
          address: "123 Health Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "United States",
          workingHours: JSON.stringify({
            monday: "9:00 AM - 5:00 PM",
            tuesday: "9:00 AM - 5:00 PM",
            wednesday: "9:00 AM - 5:00 PM",
            thursday: "9:00 AM - 5:00 PM",
            friday: "9:00 AM - 5:00 PM",
            saturday: "Closed",
            sunday: "Closed",
          }),
          socialMediaLinks: JSON.stringify({
            facebook: "https://facebook.com/physioconnect",
            instagram: "https://instagram.com/physioconnect",
            description:
              "Your trusted partner in physiotherapy care. We help you achieve optimal health and wellness.",
          }),
        },
      });
    }

    // Normalize response for frontend expectations
    const parsedSocial = settings.socialMediaLinks
      ? JSON.parse(settings.socialMediaLinks)
      : {};
    const parsedWorkingHours =
      typeof settings.workingHours === "string"
        ? JSON.parse(settings.workingHours)
        : settings.workingHours;

    const responsePayload = {
      id: settings.id,
      clinicName: settings.name,
      logo: settings.logo,
      clinicImage: settings.clinicImage,
      heroImage: settings.heroImage,
      teamImage: settings.teamImage,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      postalCode: settings.postalCode,
      country: settings.country,
      workingHours: parsedWorkingHours || {},
      socialMediaLinks: parsedSocial,
      description:
        (settings as any).description || parsedSocial.description || "",
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Update clinic settings
export async function PATCH(req: NextRequest) {
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
    const {
      name,
      clinicName,
      clinicImage,
      heroImage,
      teamImage,
      description,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      workingHours,
    } = body;

    const updateData: any = {};
    // Accept either 'name' or 'clinicName' from frontend
    if (clinicName !== undefined) updateData.name = clinicName;
    if (name !== undefined) updateData.name = name;
    if (clinicImage !== undefined) updateData.clinicImage = clinicImage;
    if (heroImage !== undefined) updateData.heroImage = heroImage;
    if (teamImage !== undefined) updateData.teamImage = teamImage;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = normalizeBDPhone(phone);
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (workingHours !== undefined)
      updateData.workingHours =
        typeof workingHours === "object"
          ? JSON.stringify(workingHours)
          : workingHours;

    // Preserve or update socialMediaLinks to carry description if provided
    let existingSocial: any = {};
    const existing = await db.clinicSettings.findFirst();
    if (existing && existing.socialMediaLinks) {
      try {
        existingSocial = JSON.parse(existing.socialMediaLinks);
      } catch (_e) {
        existingSocial = {};
      }
    }
    if (description !== undefined) {
      existingSocial.description = description;
      updateData.socialMediaLinks = JSON.stringify(existingSocial);
    }

    let settings = await db.clinicSettings.findFirst();

    if (settings) {
      // Update existing settings
      settings = await db.clinicSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      // Create new settings
      settings = await db.clinicSettings.create({
        data: updateData,
      });
    }

    // Sync working hours to all staff schedules if working hours were updated
    if (workingHours !== undefined) {
      const hoursObj =
        typeof workingHours === "object"
          ? workingHours
          : JSON.parse(workingHours);
      await syncStaffSchedules(hoursObj);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
