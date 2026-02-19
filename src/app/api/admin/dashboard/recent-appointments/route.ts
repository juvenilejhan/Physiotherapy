import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessAdmin } from '@/lib/rbac';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !canAccessAdmin(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const appointments = await db.appointment.findMany({
      take: limit,
      orderBy: {
        appointmentDate: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
      },
    });

    const recentAppointments = appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.user?.name || 'Unknown',
      serviceName: appointment.service?.name || 'Unknown Service',
      date: format(new Date(appointment.appointmentDate), 'MMM dd, yyyy'),
      time: appointment.startTime,
      status: appointment.status,
    }));

    return NextResponse.json(recentAppointments);
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
