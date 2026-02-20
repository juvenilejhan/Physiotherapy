import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get reports overview
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'reports:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Default to last 30 days if no date provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      gte: start,
      lte: end,
    };

    // Fetch all required data
    const [
      appointments,
      patients,
      payments,
      services,
      staff,
    ] = await Promise.all([
      db.appointment.findMany({
        where: { appointmentDate: dateFilter },
        include: {
          service: { select: { name: true, price: true } },
          staff: { 
            select: { 
              user: { select: { name: true } },
            } 
          },
        },
      }),
      db.user.findMany({
        where: { 
          role: 'PATIENT',
          createdAt: dateFilter,
        },
        select: { id: true, createdAt: true },
      }),
      db.payment.findMany({
        where: { 
          status: 'COMPLETED',
          paidAt: dateFilter,
        },
        select: { amount: true, paidAt: true },
      }),
      db.service.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
      db.staffProfile.findMany({
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    // Appointment statistics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;
    const noShowAppointments = appointments.filter(a => a.status === 'NO_SHOW').length;
    const cancellationRate = totalAppointments > 0 
      ? Math.round((cancelledAppointments / totalAppointments) * 100) 
      : 0;
    const noShowRate = totalAppointments > 0 
      ? Math.round((noShowAppointments / totalAppointments) * 100) 
      : 0;

    // Popular services
    const serviceCount: Record<string, number> = {};
    appointments.forEach(a => {
      const serviceName = a.service.name;
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });
    const popularServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Practitioner utilization
    const staffCount: Record<string, number> = {};
    appointments.forEach(a => {
      if (a.staff?.user?.name) {
        const staffName = a.staff.user.name;
        staffCount[staffName] = (staffCount[staffName] || 0) + 1;
      }
    });
    const practitionerUtilization = Object.entries(staffCount)
      .map(([name, appointments]) => ({ name, appointments }))
      .sort((a, b) => b.appointments - a.appointments);

    // Revenue
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Appointment trends (by day of week)
    const dayTrends = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    appointments.forEach(a => {
      const day = new Date(a.appointmentDate).getDay();
      dayTrends[day]++;
    });

    // New patients
    const newPatients = patients.length;

    return NextResponse.json({
      dateRange: { start, end },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
        cancellationRate,
        noShowRate,
      },
      patients: {
        newPatients,
      },
      revenue: {
        total: totalRevenue,
      },
      popularServices,
      practitionerUtilization,
      dayTrends: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        data: dayTrends,
      },
    });
  } catch (error) {
    console.error('Error fetching reports overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
