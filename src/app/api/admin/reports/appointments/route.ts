import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get appointments report
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
    const serviceId = searchParams.get('serviceId');
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');
    
    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where: any = {
      appointmentDate: {
        gte: start,
        lte: end,
      },
    };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (staffId) {
      where.staffId = staffId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        service: {
          select: { name: true, price: true, duration: true },
        },
        staff: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'PENDING').length,
      confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
      inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
    };

    // Group by date for trend chart
    const dailyTrends: Record<string, { total: number; completed: number; cancelled: number }> = {};
    appointments.forEach(a => {
      const dateKey = new Date(a.appointmentDate).toISOString().split('T')[0];
      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = { total: 0, completed: 0, cancelled: 0 };
      }
      dailyTrends[dateKey].total++;
      if (a.status === 'COMPLETED') dailyTrends[dateKey].completed++;
      if (a.status === 'CANCELLED') dailyTrends[dateKey].cancelled++;
    });

    // Service breakdown
    const serviceBreakdown: Record<string, number> = {};
    appointments.forEach(a => {
      const serviceName = a.service.name;
      serviceBreakdown[serviceName] = (serviceBreakdown[serviceName] || 0) + 1;
    });

    // Staff breakdown
    const staffBreakdown: Record<string, number> = {};
    appointments.forEach(a => {
      const staffName = a.staff?.user?.name || 'Unassigned';
      staffBreakdown[staffName] = (staffBreakdown[staffName] || 0) + 1;
    });

    // Time slot distribution
    const timeSlots: Record<string, number> = {};
    appointments.forEach(a => {
      const hour = parseInt(a.startTime.split(':')[0]);
      const slot = hour < 12 ? 'Morning (8-12)' : hour < 17 ? 'Afternoon (12-5)' : 'Evening (5-8)';
      timeSlots[slot] = (timeSlots[slot] || 0) + 1;
    });

    return NextResponse.json({
      dateRange: { start, end },
      stats,
      appointments: appointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: `${a.startTime} - ${a.endTime}`,
        patient: a.user.name,
        patientEmail: a.user.email,
        patientPhone: a.user.phone,
        service: a.service.name,
        servicePrice: a.service.price,
        staff: a.staff?.user?.name || 'Unassigned',
        status: a.status,
        type: a.type,
      })),
      dailyTrends: Object.entries(dailyTrends)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      serviceBreakdown: Object.entries(serviceBreakdown)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      staffBreakdown: Object.entries(staffBreakdown)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      timeSlots: Object.entries(timeSlots)
        .map(([slot, count]) => ({ slot, count })),
    });
  } catch (error) {
    console.error('Error fetching appointments report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
