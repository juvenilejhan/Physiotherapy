import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';

// GET - Get single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'billing:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update invoice
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'billing:update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status, items, notes, dueDate, tax } = body;

    const existingInvoice = await db.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'PAID') {
        updateData.paidAt = new Date();
      }
    }

    if (items) {
      const amount = items.reduce((sum: number, item: { quantity: number; price: number }) => 
        sum + (item.quantity * item.price), 0);
      updateData.items = JSON.stringify(items);
      updateData.amount = amount;
      updateData.total = amount + (tax ?? existingInvoice.tax);
    }

    if (tax !== undefined) {
      updateData.tax = tax;
      if (!items) {
        updateData.total = existingInvoice.amount + tax;
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        entity: 'Invoice',
        entityId: invoice.id,
        changes: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.role || !hasPermission(user.role, 'billing:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice has payments
    if (existingInvoice.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with existing payments' },
        { status: 400 }
      );
    }

    await db.invoice.delete({
      where: { id },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        entity: 'Invoice',
        entityId: id,
        changes: JSON.stringify({ invoiceNumber: existingInvoice.invoiceNumber }),
      },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
