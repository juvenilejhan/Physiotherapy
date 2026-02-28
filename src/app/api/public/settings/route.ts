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
        clinicImage: "/images/clinic-exterior.jpg",
        heroImage: "/images/hero-banner.jpg",
        teamImage: "/images/about-team.jpg",
        email: "contact@physioconnect.com",
        phone: "+8801XXXXXXXXX",
        address: "123 Health Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
        description: "Your trusted partner in physiotherapy care.",
        workingHours: {
          monday: "9:00 AM - 5:00 PM",
          tuesday: "9:00 AM - 5:00 PM",
          wednesday: "9:00 AM - 5:00 PM",
          thursday: "9:00 AM - 5:00 PM",
          friday: "9:00 AM - 5:00 PM",
          saturday: "Closed",
          sunday: "Closed",
        },
      });
    }

    // Parse social media links for description
    const parsedSocial = settings.socialMediaLinks
      ? JSON.parse(settings.socialMediaLinks)
      : {};

    // Parse working hours
    const parsedWorkingHours = settings.workingHours
      ? typeof settings.workingHours === "string"
        ? JSON.parse(settings.workingHours)
        : settings.workingHours
      : {};

    // Return only public information
    return NextResponse.json({
      clinicName: settings.name,
      logo: settings.logo || null,
      clinicImage: settings.clinicImage || "/images/clinic-exterior.jpg",
      heroImage: settings.heroImage || "/images/hero-banner.jpg",
      teamImage: settings.teamImage || "/images/about-team.jpg",
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      postalCode: settings.postalCode,
      country: settings.country,
      description:
        (settings as any).description || parsedSocial.description || "",
      workingHours: parsedWorkingHours,
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
