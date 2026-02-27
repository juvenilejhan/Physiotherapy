import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        dateOfBirth: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get staff profile if exists (for doctors, managers, etc.)
    const staffProfile =
      userRole !== "PATIENT"
        ? await db.staffProfile.findUnique({
            where: { userId },
            include: {
              services: {
                include: {
                  service: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },
              schedules: {
                orderBy: { dayOfWeek: "asc" },
              },
            },
          })
        : null;

    // Get activity stats
    const stats: Record<string, number> = {};

    if (userRole === "DOCTOR" && staffProfile) {
      // Get appointment stats for doctors
      const totalAppointments = await db.appointment.count({
        where: { staffId: staffProfile.id },
      });
      const completedAppointments = await db.appointment.count({
        where: { staffId: staffProfile.id, status: "COMPLETED" },
      });
      const upcomingAppointments = await db.appointment.count({
        where: {
          staffId: staffProfile.id,
          status: "CONFIRMED",
          appointmentDate: { gte: new Date() },
        },
      });

      stats.totalAppointments = totalAppointments;
      stats.completedAppointments = completedAppointments;
      stats.upcomingAppointments = upcomingAppointments;
    } else if (userRole === "SUPER_ADMIN" || userRole === "CLINIC_MANAGER") {
      // Get overall stats for admins
      const totalPatients = await db.user.count({
        where: { role: "PATIENT" },
      });
      const totalStaff = await db.staffProfile.count();
      const totalAppointments = await db.appointment.count();

      stats.totalPatients = totalPatients;
      stats.totalStaff = totalStaff;
      stats.totalAppointments = totalAppointments;
    } else if (userRole === "RECEPTIONIST") {
      // Get today's appointments for receptionists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = await db.appointment.count({
        where: {
          appointmentDate: { gte: today, lt: tomorrow },
        },
      });
      const pendingAppointments = await db.appointment.count({
        where: { status: "PENDING" },
      });

      stats.todayAppointments = todayAppointments;
      stats.pendingAppointments = pendingAppointments;
    }

    return NextResponse.json({
      user,
      staffProfile,
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, phone, dateOfBirth, bio, specialization, qualifications } =
      body;

    // Update user info
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        dateOfBirth: true,
        role: true,
      },
    });

    // Update staff profile if exists
    const staffProfile = await db.staffProfile.findUnique({
      where: { userId },
    });

    if (staffProfile) {
      await db.staffProfile.update({
        where: { userId },
        data: {
          bio,
          specialization,
          qualifications,
        },
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
