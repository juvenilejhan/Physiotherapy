import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { hash } from "bcryptjs";

// GET - List all staff
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, "staff:view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");

    const staffRoles = [
      "SUPER_ADMIN",
      "CLINIC_MANAGER",
      "DOCTOR",
      "RECEPTIONIST",
    ];

    const where: any = {
      role: {
        in: staffRoles,
      },
    };

    if (role && staffRoles.includes(role)) {
      where.role = role;
    }

    const staff = await db.user.findMany({
      where,
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
      orderBy: {
        name: "asc",
      },
    });

    const formattedStaff = staff.map((s) => ({
      id: s.id,
      user: {
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
      },
      specialty: s.staffProfile?.specialization,
      qualification: s.staffProfile?.qualifications,
      experience: s.staffProfile?.experience,
      bio: s.staffProfile?.bio,
      consultationFee: s.staffProfile?.consultationFee,
      services:
        s.staffProfile?.services?.map((ss) => ({
          id: ss.id,
          serviceId: ss.serviceId,
          name: ss.service.name,
          price: ss.service.price,
        })) || [],
    }));

    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new staff
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, "staff:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      role,
      password,
      specialization,
      qualifications,
      experience,
      bio,
      serviceId,
    } = body;

    // Validation
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Get service details if serviceId is provided (for doctors)
    let consultationFee = 0;
    let selectedService: { id: string; name: string; price: number } | null =
      null;
    if (serviceId && role === "DOCTOR") {
      selectedService = await db.service.findUnique({
        where: { id: serviceId },
        select: { id: true, name: true, price: true },
      });
      if (selectedService) {
        consultationFee = selectedService.price;
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with staff profile
    const newStaff = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        staffProfile:
          role !== "PATIENT"
            ? {
                create: {
                  specialization: selectedService?.name || specialization,
                  qualifications,
                  experience: experience ? parseInt(experience) : null,
                  bio,
                  consultationFee,
                  ...(serviceId && role === "DOCTOR"
                    ? {
                        services: {
                          create: {
                            serviceId,
                          },
                        },
                      }
                    : {}),
                },
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

    const formattedStaff = {
      id: newStaff.id,
      user: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
      specialty: newStaff.staffProfile?.specialization,
      qualification: newStaff.staffProfile?.qualifications,
      experience: newStaff.staffProfile?.experience,
      bio: newStaff.staffProfile?.bio,
      consultationFee: newStaff.staffProfile?.consultationFee,
      services:
        newStaff.staffProfile?.services?.map((ss) => ({
          id: ss.id,
          serviceId: ss.serviceId,
          name: ss.service.name,
          price: ss.service.price,
        })) || [],
    };

    return NextResponse.json(formattedStaff, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
