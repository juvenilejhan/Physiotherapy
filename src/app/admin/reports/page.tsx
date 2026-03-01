"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  PieChart,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface OverviewData {
  dateRange: { start: string; end: string };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    cancellationRate: number;
    noShowRate: number;
  };
  patients: {
    newPatients: number;
  };
  revenue: {
    total: number;
  };
  popularServices: { name: string; count: number }[];
  practitionerUtilization: { name: string; appointments: number }[];
  dayTrends: {
    labels: string[];
    data: number[];
  };
}

interface AppointmentsReportData {
  dateRange: { start: string; end: string };
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  appointments: {
    id: string;
    date: string;
    time: string;
    patient: string;
    patientEmail: string;
    service: string;
    servicePrice: number;
    staff: string;
    status: string;
    type: string;
  }[];
  serviceBreakdown: { name: string; count: number }[];
  staffBreakdown: { name: string; count: number }[];
  timeSlots: { slot: string; count: number }[];
}

interface PatientsReportData {
  dateRange: { start: string; end: string };
  stats: {
    totalPatients: number;
    newPatients: number;
    patientsWithAppointments: number;
    returningPatients: number;
    retentionRate: number;
  };
  demographics: {
    ageGroups: { group: string; count: number }[];
    cityDistribution: { city: string; count: number }[];
  };
  servicePreferences: { name: string; count: number }[];
  topPatients: {
    id: string;
    name: string;
    email: string;
    appointmentCount: number;
    registeredAt: string;
  }[];
}

interface FinancialReportData {
  dateRange: { start: string; end: string };
  summary: {
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    totalOverdue: number;
    collectionRate: number;
    invoiceCount: number;
    paymentCount: number;
  };
  invoicesByStatus: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  dailyRevenue: { date: string; amount: number }[];
  revenueByMethod: { method: string; amount: number }[];
  revenueByService: { service: string; amount: number }[];
  topPayingPatients: { name: string; total: number }[];
  recentTransactions: {
    id: string;
    date: string;
    patient: string;
    invoice: string;
    amount: number;
    method: string;
    transactionId: string;
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // Report data
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [appointmentsData, setAppointmentsData] =
    useState<AppointmentsReportData | null>(null);
  const [patientsData, setPatientsData] = useState<PatientsReportData | null>(
    null,
  );
  const [financialData, setFinancialData] =
    useState<FinancialReportData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER"].includes(session.user.role)
    ) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (
      session?.user?.role &&
      ["SUPER_ADMIN", "CLINIC_MANAGER"].includes(session.user.role)
    ) {
      fetchReportData();
    }
  }, [session, activeTab, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    const params = `startDate=${startDate}&endDate=${endDate}`;

    try {
      switch (activeTab) {
        case "overview":
          const overviewRes = await fetch(
            `/api/admin/reports/overview?${params}`,
          );
          if (overviewRes.ok) {
            setOverviewData(await overviewRes.json());
          }
          break;
        case "appointments":
          const appointmentsRes = await fetch(
            `/api/admin/reports/appointments?${params}`,
          );
          if (appointmentsRes.ok) {
            setAppointmentsData(await appointmentsRes.json());
          }
          break;
        case "patients":
          const patientsRes = await fetch(
            `/api/admin/reports/patients?${params}`,
          );
          if (patientsRes.ok) {
            setPatientsData(await patientsRes.json());
          }
          break;
        case "financial":
          const financialRes = await fetch(
            `/api/admin/reports/financial?${params}`,
          );
          if (financialRes.ok) {
            setFinancialData(await financialRes.json());
          }
          break;
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: object[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = (row as Record<string, unknown>)[header];
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value ?? "");
            return stringValue.includes(",") || stringValue.includes('"')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${startDate}_${endDate}.csv`;
    link.click();
    toast.success("Report exported successfully");
  };

  const setDatePreset = (preset: string) => {
    const today = new Date();
    let start = new Date();

    switch (preset) {
      case "7days":
        start.setDate(today.getDate() - 7);
        break;
      case "30days":
        start.setDate(today.getDate() - 30);
        break;
      case "90days":
        start.setDate(today.getDate() - 90);
        break;
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        today.setDate(0); // Last day of previous month
        break;
      case "thisYear":
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            View detailed reports and analytics for your clinic.
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Select onValueChange={setDatePreset}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
            <Button variant="outline" onClick={fetchReportData}>
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Patients</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {loading
            ? renderLoadingSkeleton()
            : overviewData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Appointments
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overviewData.appointments.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {overviewData.appointments.completed} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          New Patients
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overviewData.patients.newPatients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          During this period
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Cancellation Rate
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overviewData.appointments.cancellationRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {overviewData.appointments.cancelled} cancelled
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatBDT(overviewData.revenue.total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          From payments
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts & Tables */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Popular Services */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Popular Services</CardTitle>
                        <CardDescription>Most booked services</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {overviewData.popularServices.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No data available
                            </p>
                          ) : (
                            overviewData.popularServices.map(
                              (service, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium">
                                      {service.name}
                                    </span>
                                  </div>
                                  <Badge variant="secondary">
                                    {service.count} bookings
                                  </Badge>
                                </div>
                              ),
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Practitioner Utilization */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Practitioner Utilization</CardTitle>
                        <CardDescription>
                          Appointments by staff member
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {overviewData.practitionerUtilization.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No data available
                            </p>
                          ) : (
                            overviewData.practitionerUtilization.map(
                              (staff, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span className="font-medium">
                                    {staff.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={Math.min(
                                        100,
                                        (staff.appointments /
                                          (overviewData.appointments.total ||
                                            1)) *
                                          100,
                                      )}
                                      className="h-2 w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {staff.appointments}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Day Distribution */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Appointments by Day of Week</CardTitle>
                        <CardDescription>
                          Distribution of appointments across weekdays
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {overviewData.dayTrends.labels.map((day, index) => {
                            const maxValue = Math.max(
                              ...overviewData.dayTrends.data,
                              1,
                            );
                            const value =
                              (overviewData.dayTrends.data[index] / maxValue) *
                              100;
                            return (
                              <div
                                key={day}
                                className="flex items-center gap-3"
                              >
                                <span className="text-xs font-medium w-10">
                                  {day}
                                </span>
                                <Progress
                                  value={Math.max(value, 5)}
                                  className="h-2 flex-1"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {overviewData.dayTrends.data[index]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          {loading
            ? renderLoadingSkeleton()
            : appointmentsData && (
                <>
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.total}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Pending
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.pending}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          Confirmed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.confirmed}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Completed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.completed}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Cancelled
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.cancelled}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-500" />
                          No Show
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {appointmentsData.stats.noShow}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Service & Staff Breakdown */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>By Service</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {appointmentsData.serviceBreakdown.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{item.name}</span>
                                <Badge variant="outline">{item.count}</Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>By Staff</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {appointmentsData.staffBreakdown.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{item.name}</span>
                                <Badge variant="outline">{item.count}</Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Appointments Table */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>All Appointments</CardTitle>
                        <CardDescription>
                          Detailed appointment list
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportToCSV(
                            appointmentsData.appointments,
                            "appointments_report",
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Patient</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Staff</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {appointmentsData.appointments.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="h-24 text-center"
                                >
                                  No appointments found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              appointmentsData.appointments
                                .slice(0, 20)
                                .map((appt) => (
                                  <TableRow key={appt.id}>
                                    <TableCell>
                                      {new Date(appt.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{appt.time}</TableCell>
                                    <TableCell className="font-medium">
                                      {appt.patient}
                                    </TableCell>
                                    <TableCell>{appt.service}</TableCell>
                                    <TableCell>{appt.staff}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {appt.type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={
                                          statusColors[appt.status] ||
                                          "bg-gray-100"
                                        }
                                      >
                                        {appt.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          {loading
            ? renderLoadingSkeleton()
            : patientsData && (
                <>
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Patients
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {patientsData.stats.totalPatients}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          New Patients
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {patientsData.stats.newPatients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This period
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Active Patients
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {patientsData.stats.patientsWithAppointments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          With appointments
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Returning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {patientsData.stats.returningPatients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Multiple visits
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Retention Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {patientsData.stats.retentionRate}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Demographics */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Age Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {patientsData.demographics.ageGroups.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{item.group}</span>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={Math.min(
                                      100,
                                      (item.count /
                                        (patientsData.stats.totalPatients ||
                                          1)) *
                                        100,
                                    )}
                                    className="h-2 w-20"
                                  />
                                  <span className="text-sm text-muted-foreground w-8 text-right">
                                    {item.count}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Locations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {patientsData.demographics.cityDistribution
                            .slice(0, 5)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span>{item.city}</span>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Patients */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Top Patients</CardTitle>
                        <CardDescription>
                          By number of appointments
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportToCSV(
                            patientsData.topPatients,
                            "patients_report",
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Appointments</TableHead>
                              <TableHead>Registered</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientsData.topPatients.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-24 text-center"
                                >
                                  No patients found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              patientsData.topPatients.map((patient, index) => (
                                <TableRow key={patient.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-medium">
                                    {patient.name}
                                  </TableCell>
                                  <TableCell>{patient.email}</TableCell>
                                  <TableCell>
                                    <Badge>{patient.appointmentCount}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      patient.registeredAt,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {loading
            ? renderLoadingSkeleton()
            : financialData && (
                <>
                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Billed
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatBDT(financialData.summary.totalBilled)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {financialData.summary.invoiceCount} invoices
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Collected
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatBDT(financialData.summary.totalCollected)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {financialData.summary.paymentCount} payments
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Outstanding
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatBDT(financialData.summary.totalOutstanding)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pending collection
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Collection Rate
                        </CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {financialData.summary.collectionRate}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Of total billed
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Service</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {financialData.revenueByService.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No data available
                            </p>
                          ) : (
                            financialData.revenueByService
                              .slice(0, 5)
                              .map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span>{item.service}</span>
                                  <span className="font-medium">
                                    {formatBDT(item.amount)}
                                  </span>
                                </div>
                              ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {financialData.revenueByMethod.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No data available
                            </p>
                          ) : (
                            financialData.revenueByMethod.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <span className="capitalize">
                                  {item.method.replace("_", " ")}
                                </span>
                                <span className="font-medium">
                                  {formatBDT(item.amount)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Paying Patients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {financialData.topPayingPatients.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No data available
                            </p>
                          ) : (
                            financialData.topPayingPatients
                              .slice(0, 5)
                              .map((patient, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                                      {index + 1}
                                    </div>
                                    <span>{patient.name}</span>
                                  </div>
                                  <span className="font-medium text-green-600">
                                    {formatBDT(patient.total)}
                                  </span>
                                </div>
                              ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Invoice Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-gray-400" />
                              Draft
                            </span>
                            <Badge variant="secondary">
                              {financialData.invoicesByStatus.draft}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              Sent
                            </span>
                            <Badge variant="secondary">
                              {financialData.invoicesByStatus.sent}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                              Paid
                            </span>
                            <Badge variant="secondary">
                              {financialData.invoicesByStatus.paid}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500" />
                              Overdue
                            </span>
                            <Badge variant="secondary">
                              {financialData.invoicesByStatus.overdue}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                          Latest payment transactions
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          exportToCSV(
                            financialData.recentTransactions,
                            "financial_report",
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Patient</TableHead>
                              <TableHead>Invoice</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Transaction ID</TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financialData.recentTransactions.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="h-24 text-center"
                                >
                                  No transactions found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              financialData.recentTransactions.map((txn) => (
                                <TableRow key={txn.id}>
                                  <TableCell>
                                    {txn.date
                                      ? new Date(txn.date).toLocaleDateString()
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {txn.patient}
                                  </TableCell>
                                  <TableCell>{txn.invoice || "-"}</TableCell>
                                  <TableCell className="capitalize">
                                    {txn.method?.replace("_", " ") || "-"}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {txn.transactionId}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-green-600">
                                    {formatBDT(txn.amount)}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
