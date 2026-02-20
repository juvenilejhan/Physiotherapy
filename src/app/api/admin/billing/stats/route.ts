import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get billing statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'billing:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get invoice statistics
    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      pendingInvoices,
      allInvoices,
      thisMonthInvoices,
      lastMonthInvoices,
      completedPayments,
      thisMonthPayments,
    ] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { status: 'PAID' } }),
      db.invoice.count({ 
        where: { 
          status: { in: ['SENT', 'DRAFT'] },
          dueDate: { lt: today },
        } 
      }),
      db.invoice.count({ where: { status: { in: ['SENT', 'DRAFT'] } } }),
      db.invoice.findMany({
        select: { total: true, status: true },
      }),
      db.invoice.findMany({
        where: { createdAt: { gte: startOfMonth } },
        select: { total: true, status: true },
      }),
      db.invoice.findMany({
        where: { 
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          } 
        },
        select: { total: true, status: true },
      }),
      db.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, paidAt: true },
      }),
      db.payment.findMany({
        where: { 
          status: 'COMPLETED',
          paidAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
    ]);

    // Calculate totals
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const totalOutstanding = allInvoices
      .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + i.total, 0);

    const thisMonthBilled = thisMonthInvoices.reduce((sum, i) => sum + i.total, 0);
    const lastMonthBilled = lastMonthInvoices.reduce((sum, i) => sum + i.total, 0);
    
    // Calculate month-over-month change
    const revenueChange = lastMonthBilled > 0 
      ? ((thisMonthBilled - lastMonthBilled) / lastMonthBilled) * 100 
      : 0;

    // Get recent payments
    const recentPayments = await db.payment.findMany({
      where: { status: 'COMPLETED' },
      take: 5,
      orderBy: { paidAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        invoice: {
          select: { invoiceNumber: true },
        },
      },
    });

    return NextResponse.json({
      overview: {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        pendingInvoices,
        totalRevenue,
        thisMonthRevenue,
        totalOutstanding,
        revenueChange: Math.round(revenueChange * 100) / 100,
      },
      recentPayments,
    });
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
