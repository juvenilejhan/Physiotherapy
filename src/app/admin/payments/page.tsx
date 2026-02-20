"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeftRight,
  ArrowUpCircle,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  transactionId: string;
  paidAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  invoice: {
    id: string | null;
    invoiceNumber: string | null;
    total: number | null;
    status: string | null;
  } | null;
}

const statusConfig = {
  COMPLETED: {
    label: "Completed",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    icon: <Clock className="w-4 h-4" />,
  },
  FAILED: {
    label: "Failed",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: <XCircle className="w-4 h-4" />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: <ArrowUpCircle className="w-4 h-4" />,
  },
  PARTIALLY_REFUNDED: {
    label: "Partially Refunded",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    icon: <ArrowLeftRight className="w-4 h-4" />,
  },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  });

  const fetchPayments = async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Payment[]) => {
    const stats = {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    };

    data.forEach((payment) => {
      stats.total += payment.amount;
      if (payment.status === "COMPLETED") {
        stats.completed += payment.amount;
      } else if (payment.status === "PENDING") {
        stats.pending += payment.amount;
      } else if (payment.status === "FAILED") {
        stats.failed += payment.amount;
      } else if (
        payment.status === "REFUNDED" ||
        payment.status === "PARTIALLY_REFUNDED"
      ) {
        stats.refunded += payment.amount;
      }
    });

    return stats;
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPayments();
      const response = await fetch("/api/admin/payments?limit=1000");
      if (response.ok) {
        const allPayments = await response.json();
        setStats(calculateStats(allPayments));
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchPayments(value);
  };

  const handleRefresh = () => {
    fetchPayments(activeTab);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage and track all payments and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground font-semibold">৳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBDT(stats.total)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatBDT(stats.completed)}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatBDT(stats.pending)}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatBDT(stats.failed)}
            </div>
            <p className="text-xs text-muted-foreground">Payment failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatBDT(stats.refunded)}
            </div>
            <p className="text-xs text-muted-foreground">Total refunds</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            View and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="FAILED">Failed</TabsTrigger>
              <TabsTrigger value="REFUNDED">Refunded</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading payments...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payments found
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs">
                            {payment.transactionId}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payment.user.name || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {payment.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatBDT(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="capitalize">
                                {payment.paymentMethod?.replace("_", " ") ||
                                  "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusConfig[
                                  payment.status as keyof typeof statusConfig
                                ]?.color
                              }
                            >
                              <div className="flex items-center gap-1.5">
                                {
                                  statusConfig[
                                    payment.status as keyof typeof statusConfig
                                  ]?.icon
                                }
                                {
                                  statusConfig[
                                    payment.status as keyof typeof statusConfig
                                  ]?.label
                                }
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                {payment.status === "PENDING" && (
                                  <>
                                    <DropdownMenuItem>
                                      Process Payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Send Reminder
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {payment.status === "COMPLETED" && (
                                  <DropdownMenuItem>
                                    Issue Refund
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
