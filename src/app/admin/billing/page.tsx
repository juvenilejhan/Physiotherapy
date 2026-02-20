"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  FileText,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BillingStats {
  overview: {
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    pendingInvoices: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    totalOutstanding: number;
    revenueChange: number;
  };
  recentPayments: {
    id: string;
    amount: number;
    paidAt: string;
    user: { name: string; email: string };
    invoice: { invoiceNumber: string } | null;
  }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
  }[];
}

interface Patient {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Service {
  id: string;
  name: string;
  price: number;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function AdminBillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialogs
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form state
  const [newInvoice, setNewInvoice] = useState({
    userId: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    tax: 0,
    dueDate: "",
    notes: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER", "RECEPTIONIST"].includes(
        session.user.role,
      )
    ) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (
      session?.user?.role &&
      ["SUPER_ADMIN", "CLINIC_MANAGER", "RECEPTIONIST"].includes(
        session.user.role,
      )
    ) {
      fetchData();
    }
  }, [session, searchTerm, statusFilter, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, invoicesRes, patientsRes, servicesRes] =
        await Promise.all([
          fetch("/api/admin/billing/stats"),
          fetch(
            `/api/admin/billing/invoices?page=${pagination.page}&status=${statusFilter}&search=${searchTerm}`,
          ),
          fetch("/api/admin/patients"),
          fetch("/api/services"),
        ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
        if (invoicesData.pagination) {
          setPagination(invoicesData.pagination);
        }
      }

      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(
          Array.isArray(servicesData)
            ? servicesData
            : servicesData.services || [],
        );
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (
      !newInvoice.userId ||
      newInvoice.items.some((item) => !item.name || item.price <= 0)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });

      if (res.ok) {
        toast.success("Invoice created successfully");
        setCreateInvoiceOpen(false);
        setNewInvoice({
          userId: "",
          items: [{ name: "", quantity: 1, price: 0 }],
          tax: 0,
          dueDate: "",
          notes: "",
        });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    try {
      const res = await fetch("/api/admin/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: parseFloat(paymentAmount),
          paymentMethod,
        }),
      });

      if (res.ok) {
        toast.success("Payment recorded successfully");
        setRecordPaymentOpen(false);
        setSelectedInvoice(null);
        setPaymentAmount("");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const handleUpdateInvoiceStatus = async (
    invoiceId: string,
    newStatus: string,
  ) => {
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Invoice status updated");
        fetchData();
      } else {
        toast.error("Failed to update invoice status");
      }
    } catch (error) {
      toast.error("Failed to update invoice status");
    }
  };

  const addInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { name: "", quantity: 1, price: 0 }],
    });
  };

  const updateInvoiceItem = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const items = [...newInvoice.items];
    items[index] = { ...items[index], [field]: value };
    setNewInvoice({ ...newInvoice, items });
  };

  const removeInvoiceItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      setNewInvoice({
        ...newInvoice,
        items: newInvoice.items.filter((_, i) => i !== index),
      });
    }
  };

  const calculateInvoiceTotal = () => {
    const subtotal = newInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    return subtotal + newInvoice.tax;
  };

  const getInvoicePaidAmount = (invoice: Invoice) => {
    return invoice.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Billing & Payments
          </h2>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing information.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Billing & Payments
          </h2>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing information.
          </p>
        </div>
        <Button onClick={() => setCreateInvoiceOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBDT(stats?.overview.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(stats?.overview.revenueChange || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              {stats?.overview.revenueChange || 0}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBDT(stats?.overview.thisMonthRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Revenue this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBDT(stats?.overview.totalOutstanding || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.pendingInvoices || 0} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.overview.overdueInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Invoices past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage all invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {invoice.user.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatBDT(invoice.total)}</TableCell>
                      <TableCell>
                        {formatBDT(getInvoicePaidAmount(invoice))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[invoice.status] || "bg-gray-100"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setRecordPaymentOpen(true);
                              }}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Record Payment
                            </DropdownMenuItem>
                            {invoice.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateInvoiceStatus(invoice.id, "SENT")
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "PAID" &&
                              invoice.status !== "CANCELLED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateInvoiceStatus(
                                      invoice.id,
                                      "CANCELLED",
                                    )
                                  }
                                >
                                  Cancel Invoice
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {invoices.length} of {pagination.total} invoices
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!stats?.recentPayments || stats.recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent payments
              </p>
            ) : (
              stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {payment.user.name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.invoice?.invoiceNumber || "Direct Payment"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatBDT(payment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select
                value={newInvoice.userId}
                onValueChange={(value) =>
                  setNewInvoice({ ...newInvoice, userId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.user.id} value={patient.user.id}>
                      {patient.user.name || patient.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Items */}
            <div className="space-y-2">
              <Label>Items</Label>
              {newInvoice.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={item.name}
                    onValueChange={(value) => {
                      const service = services.find((s) => s.name === value);
                      updateInvoiceItem(index, "name", value);
                      if (service) {
                        updateInvoiceItem(index, "price", service.price);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name} - {formatBDT(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateInvoiceItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="w-20"
                    min={1}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) =>
                      updateInvoiceItem(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-28"
                    min={0}
                  />
                  {newInvoice.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvoiceItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addInvoiceItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Tax */}
            <div className="space-y-2">
              <Label>Tax (BDT)</Label>
              <Input
                type="number"
                value={newInvoice.tax}
                onChange={(e) =>
                  setNewInvoice({
                    ...newInvoice,
                    tax: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                }
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newInvoice.notes}
                onChange={(e) =>
                  setNewInvoice({ ...newInvoice, notes: e.target.value })
                }
                placeholder="Additional notes..."
              />
            </div>

            {/* Total */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatBDT(calculateInvoiceTotal())}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateInvoiceOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between">
                  <span>Invoice Total</span>
                  <span>{formatBDT(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid</span>
                  <span>
                    {formatBDT(getInvoicePaidAmount(selectedInvoice))}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t mt-2 pt-2">
                  <span>Remaining</span>
                  <span>
                    {formatBDT(
                      selectedInvoice.total -
                        getInvoicePaidAmount(selectedInvoice),
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (BDT)</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={
                    selectedInvoice.total -
                    getInvoicePaidAmount(selectedInvoice)
                  }
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRecordPaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
