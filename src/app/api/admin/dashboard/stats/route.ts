import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessAdmin } from '@/lib/rbac';

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

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get total patients
    const totalPatients = await db.patientProfile.count();

    // Get total appointments
    const totalAppointments = await db.appointment.count();

    // Get today's appointments
    const todayAppointments = await db.appointment.count({
      where: {
        appointmentDate: {
          gte: startOfDay,
        },
      },
    });

    // Get upcoming appointments
    const upcomingAppointments = await db.appointment.count({
      where: {
        appointmentDate: {
          gte: today,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    // Get completed appointments
    const completedAppointments = await db.appointment.count({
      where: {
        status: 'COMPLETED',
      },
    });

    // Get cancelled appointments
    const cancelledAppointments = await db.appointment.count({
      where: {
        status: 'CANCELLED',
      },
    });

    // Get total revenue from completed appointments
    const payments = await db.payment.findMany({
      where: {
        status: 'COMPLETED',
      },
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Get this month revenue
    const monthPayments = payments.filter(
      payment => payment.paidAt && new Date(payment.paidAt) >= startOfMonth
    );
    const monthRevenue = monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return NextResponse.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      monthRevenue,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
