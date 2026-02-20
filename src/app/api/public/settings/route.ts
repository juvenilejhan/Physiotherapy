import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Get public clinic settings (no auth required)
export async function GET() {
  try {
    let settings = await db.clinicSettings.findFirst();

    // Return default values if no settings exist
    if (!settings) {
      return NextResponse.json({
        clinicName: "PhysioConnect Clinic",
        email: "contact@physioconnect.com",
        phone: "+8801XXXXXXXXX",
        address: "123 Health Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
        description: "Your trusted partner in physiotherapy care.",
      });
    }

    // Parse social media links for description
    const parsedSocial = settings.socialMediaLinks
      ? JSON.parse(settings.socialMediaLinks)
      : {};

    // Return only public information
    return NextResponse.json({
      clinicName: settings.name,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      postalCode: settings.postalCode,
      country: settings.country,
      description:
        (settings as any).description || parsedSocial.description || "",
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
