import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeBDPhone } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create patient profile
    let profile = await db.patientProfile.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!profile) {
      profile = await db.patientProfile.create({
        data: {
          userId: (session.user as any).id,
        },
      });
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        dateOfBirth: true,
        image: true,
      },
    });

    // Get appointment counts
    const totalAppointments = await db.appointment.count({
      where: { userId: (session.user as any).id },
    });
    const upcomingAppointments = await db.appointment.count({
      where: {
        userId: (session.user as any).id,
        status: "CONFIRMED",
        appointmentDate: { gte: new Date() },
      },
    });
    const completedAppointments = await db.appointment.count({
      where: {
        userId: (session.user as any).id,
        status: "COMPLETED",
      },
    });

    return NextResponse.json(
      {
        profile: {
          ...profile,
          user: user,
        },
        stats: {
          totalAppointments,
          upcomingAppointments,
          completedAppointments,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get or create patient profile
    let profile = await db.patientProfile.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!profile) {
      profile = await db.patientProfile.create({
        data: {
          userId: (session.user as any).id,
        },
      });
    }

    // Update profile fields
    const updatedProfile = await db.patientProfile.update({
      where: { userId: (session.user as any).id },
      data: {
        emergencyContact: body.emergencyContact || undefined,
        emergencyPhone: normalizeBDPhone(body.emergencyPhone) || undefined,
        bloodGroup: body.bloodGroup || undefined,
        allergies: body.allergies || undefined,
        medicalConditions: body.medicalConditions || undefined,
        medications: body.medications || undefined,
        address: body.address || undefined,
        city: body.city || undefined,
        state: body.state || undefined,
        postalCode: body.postalCode || undefined,
        country: body.country || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
          },
        },
      },
    });

    // Update user basic info
    await db.user.update({
      where: { id: (session.user as any).id },
      data: {
        name: body.name || undefined,
        phone: normalizeBDPhone(body.phone) || undefined,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        image: body.image !== undefined ? body.image : undefined,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile: {
          ...updatedProfile,
          user: {
            id: (session.user as any).id,
            email: (session.user as any).email,
            name: body.name || (session.user as any).name,
            phone: normalizeBDPhone(body.phone) || undefined,
            dateOfBirth: (session.user as any).dateOfBirth,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
