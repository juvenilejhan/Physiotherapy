import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// Generate unique transaction ID
function generateTransactionId(): string {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

// POST - Record a payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'billing:manage_payments')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { invoiceId, amount, paymentMethod, notes } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Calculate paid amount
    const paidAmount = invoice.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const remainingAmount = invoice.total - paidAmount;

    if (amount > remainingAmount) {
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance of ${remainingAmount}` },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        userId: invoice.userId,
        invoiceId,
        amount,
        currency: 'BDT',
        status: 'COMPLETED',
        paymentMethod: paymentMethod || 'cash',
        transactionId: generateTransactionId(),
        paidAt: new Date(),
        gatewayResponse: notes ? JSON.stringify({ notes }) : null,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Update invoice status
    const newPaidAmount = paidAmount + amount;
    if (newPaidAmount >= invoice.total) {
      await db.invoice.update({
        where: { id: invoiceId },
        data: { 
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'Payment',
        entityId: payment.id,
        changes: JSON.stringify({ 
          amount, 
          invoiceId, 
          transactionId: payment.transactionId 
        }),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
