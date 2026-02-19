import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get patient details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'patients:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const patient = await db.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            appointments: {
              include: {
                service: true,
                staff: {
                  include: {
                    user: true,
                  },
                },
              },
              orderBy: {
                appointmentDate: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Fetch medical history and consent forms separately
    const [medicalHistory, consentForms] = await Promise.all([
      db.medicalHistory.findMany({
        where: { userId: patient.userId },
        orderBy: { date: 'desc' },
      }),
      db.consentForm.findMany({
        where: { userId: patient.userId },
        orderBy: { signedAt: 'desc' },
      }),
    ]);

    const result = {
      ...patient,
      medicalHistory,
      consentForms,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add medical history record
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'patients:update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, notes } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title and description' }, { status: 400 });
    }

    const medicalRecord = await db.medicalHistory.create({
      data: {
        userId,
        title,
        description,
        notes,
      },
    });

    return NextResponse.json(medicalRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating medical history record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
