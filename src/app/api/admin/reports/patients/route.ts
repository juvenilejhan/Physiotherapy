import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get patients report
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
    
    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all patients with their profiles and appointments
    const patients = await db.user.findMany({
      where: { role: 'PATIENT' },
      include: {
        patientProfile: true,
        appointments: {
          where: {
            appointmentDate: {
              gte: start,
              lte: end,
            },
          },
          include: {
            service: { select: { name: true } },
          },
        },
      },
    });

    // Calculate statistics
    const totalPatients = patients.length;
    const newPatients = patients.filter(
      p => new Date(p.createdAt) >= start && new Date(p.createdAt) <= end
    ).length;
    
    const patientsWithAppointments = patients.filter(p => p.appointments.length > 0).length;
    const returningPatients = patients.filter(p => p.appointments.length > 1).length;

    // Age demographics (if date of birth available)
    const ageGroups = {
      'Under 18': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      'Over 60': 0,
      'Unknown': 0,
    };

    const today = new Date();
    patients.forEach(p => {
      if (!p.dateOfBirth) {
        ageGroups['Unknown']++;
        return;
      }
      const age = Math.floor((today.getTime() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) ageGroups['Under 18']++;
      else if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['Over 60']++;
    });

    // Geographic distribution (by city)
    const cityDistribution: Record<string, number> = {};
    patients.forEach(p => {
      const city = p.patientProfile?.city || 'Unknown';
      cityDistribution[city] = (cityDistribution[city] || 0) + 1;
    });

    // Registration trend (daily)
    const registrationTrend: Record<string, number> = {};
    patients.forEach(p => {
      const dateKey = new Date(p.createdAt).toISOString().split('T')[0];
      if (new Date(p.createdAt) >= start && new Date(p.createdAt) <= end) {
        registrationTrend[dateKey] = (registrationTrend[dateKey] || 0) + 1;
      }
    });

    // Service preferences
    const servicePreferences: Record<string, number> = {};
    patients.forEach(p => {
      p.appointments.forEach(a => {
        const serviceName = a.service.name;
        servicePreferences[serviceName] = (servicePreferences[serviceName] || 0) + 1;
      });
    });

    // Top patients by appointments
    const topPatients = patients
      .map(p => ({
        id: p.id,
        name: p.name || 'Unknown',
        email: p.email,
        appointmentCount: p.appointments.length,
        registeredAt: p.createdAt,
      }))
      .sort((a, b) => b.appointmentCount - a.appointmentCount)
      .slice(0, 10);

    return NextResponse.json({
      dateRange: { start, end },
      stats: {
        totalPatients,
        newPatients,
        patientsWithAppointments,
        returningPatients,
        retentionRate: totalPatients > 0 
          ? Math.round((returningPatients / totalPatients) * 100) 
          : 0,
      },
      demographics: {
        ageGroups: Object.entries(ageGroups)
          .map(([group, count]) => ({ group, count })),
        cityDistribution: Object.entries(cityDistribution)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      },
      registrationTrend: Object.entries(registrationTrend)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      servicePreferences: Object.entries(servicePreferences)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      topPatients,
    });
  } catch (error) {
    console.error('Error fetching patients report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
