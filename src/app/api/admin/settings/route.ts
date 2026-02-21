import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { normalizeBDPhone } from "@/lib/utils";

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

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
