import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission, canManageUser } from "@/lib/rbac";
import { hash } from "bcryptjs";

// PATCH - Update staff
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (
      !currentUser ||
      !currentUser.role ||
      !hasPermission(currentUser.role, "staff:update")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user can manage target user
    if (!canManageUser(currentUser.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Cannot manage user with higher or equal role" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      name,
      role,
      specialty,
      qualification,
      experience,
      bio,
      password,
      serviceId,
    } = body;

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;

    // Get service details if serviceId is provided (for doctors)
    let consultationFee = undefined;
    let selectedService: any = null;
    if (serviceId && (role === "DOCTOR" || targetUser.role === "DOCTOR")) {
      selectedService = await db.service.findUnique({
        where: { id: serviceId },
      });
      if (selectedService) {
        consultationFee = selectedService.price;
      }
    }

    // Update staff profile if provided
    const profileUpdate: any = {};
    if (selectedService) {
      profileUpdate.specialization = selectedService.name;
    } else if (specialty !== undefined) {
      profileUpdate.specialization = specialty;
    }
    if (qualification !== undefined)
      profileUpdate.qualifications = qualification;
    if (experience !== undefined)
      profileUpdate.experience = experience ? parseInt(experience) : null;
    if (bio !== undefined) profileUpdate.bio = bio;
    if (consultationFee !== undefined)
      profileUpdate.consultationFee = consultationFee;

    // Update password if provided
    if (password) {
      updateData.password = await hash(password, 12);
    }

    // Get existing staff profile
    const existingProfile = await db.staffProfile.findUnique({
      where: { userId: id },
    });

    // Update user and profile
    const updatedStaff = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        staffProfile:
          Object.keys(profileUpdate).length > 0
            ? {
                update: profileUpdate,
              }
            : undefined,
      },
      include: {
        staffProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    // Update service association if serviceId is provided
    if (serviceId && existingProfile) {
      // Delete existing service associations for this staff
      await db.staffService.deleteMany({
        where: { staffId: existingProfile.id },
      });
      // Create new service association
      await db.staffService.create({
        data: {
          staffId: existingProfile.id,
          serviceId,
        },
      });
    }

    // Refetch to get updated services
    const finalStaff = await db.user.findUnique({
      where: { id },
      include: {
        staffProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    const formattedStaff = {
      id: finalStaff!.id,
      user: {
        id: finalStaff!.id,
        name: finalStaff!.name,
        email: finalStaff!.email,
        role: finalStaff!.role,
      },
      specialty: finalStaff!.staffProfile?.specialization,
      qualification: finalStaff!.staffProfile?.qualifications,
      experience: finalStaff!.staffProfile?.experience,
      bio: finalStaff!.staffProfile?.bio,
      consultationFee: finalStaff!.staffProfile?.consultationFee,
      services:
        finalStaff!.staffProfile?.services?.map((ss) => ({
          id: ss.id,
          serviceId: ss.serviceId,
          name: ss.service.name,
          price: ss.service.price,
        })) || [],
    };

    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete staff
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (
      !currentUser ||
      !currentUser.role ||
      !hasPermission(currentUser.role, "staff:delete")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Check if current user can manage target user
    if (!canManageUser(currentUser.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Cannot delete user with higher or equal role" },
        { status: 403 },
      );
    }

    // Delete user (cascade will delete related records)
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
