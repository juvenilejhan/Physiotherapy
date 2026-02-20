import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get financial report
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

    // Get invoices and payments
    const [invoices, payments, services] = await Promise.all([
      db.invoice.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: { select: { name: true } },
        },
      }),
      db.payment.findMany({
        where: {
          paidAt: {
            gte: start,
            lte: end,
          },
          status: 'COMPLETED',
        },
        include: {
          user: { select: { name: true } },
          invoice: { select: { invoiceNumber: true, items: true } },
        },
      }),
      db.service.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true },
      }),
    ]);

    // Calculate totals
    const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = invoices
      .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + i.total, 0);
    const totalOverdue = invoices
      .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED' && i.dueDate && new Date(i.dueDate) < new Date())
      .reduce((sum, i) => sum + i.total, 0);

    // Invoice status breakdown
    const invoicesByStatus = {
      draft: invoices.filter(i => i.status === 'DRAFT').length,
      sent: invoices.filter(i => i.status === 'SENT').length,
      paid: invoices.filter(i => i.status === 'PAID').length,
      overdue: invoices.filter(i => i.status === 'OVERDUE').length,
      cancelled: invoices.filter(i => i.status === 'CANCELLED').length,
    };

    // Revenue by day
    const dailyRevenue: Record<string, number> = {};
    payments.forEach(p => {
      if (p.paidAt) {
        const dateKey = new Date(p.paidAt).toISOString().split('T')[0];
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + p.amount;
      }
    });

    // Revenue by payment method
    const revenueByMethod: Record<string, number> = {};
    payments.forEach(p => {
      const method = p.paymentMethod || 'Unknown';
      revenueByMethod[method] = (revenueByMethod[method] || 0) + p.amount;
    });

    // Revenue by service (from invoice items)
    const revenueByService: Record<string, number> = {};
    invoices.filter(i => i.status === 'PAID').forEach(i => {
      try {
        const items = JSON.parse(i.items);
        items.forEach((item: { name: string; quantity: number; price: number }) => {
          revenueByService[item.name] = (revenueByService[item.name] || 0) + (item.quantity * item.price);
        });
      } catch {
        // Skip if items can't be parsed
      }
    });

    // Top paying patients
    const patientTotals: Record<string, { name: string; total: number }> = {};
    payments.forEach(p => {
      const patientId = p.userId;
      if (!patientTotals[patientId]) {
        patientTotals[patientId] = { name: p.user.name || 'Unknown', total: 0 };
      }
      patientTotals[patientId].total += p.amount;
    });
    const topPayingPatients = Object.values(patientTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Recent transactions
    const recentTransactions = payments
      .sort((a, b) => (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0))
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        date: p.paidAt,
        patient: p.user.name,
        invoice: p.invoice?.invoiceNumber,
        amount: p.amount,
        method: p.paymentMethod,
        transactionId: p.transactionId,
      }));

    // Collection rate
    const collectionRate = totalBilled > 0 
      ? Math.round((totalCollected / totalBilled) * 100) 
      : 0;

    return NextResponse.json({
      dateRange: { start, end },
      summary: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        totalOverdue,
        collectionRate,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
      },
      invoicesByStatus,
      dailyRevenue: Object.entries(dailyRevenue)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      revenueByMethod: Object.entries(revenueByMethod)
        .map(([method, amount]) => ({ method, amount }))
        .sort((a, b) => b.amount - a.amount),
      revenueByService: Object.entries(revenueByService)
        .map(([service, amount]) => ({ service, amount }))
        .sort((a, b) => b.amount - a.amount),
      topPayingPatients,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching financial report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
