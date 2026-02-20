"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointmentDate: string;
  status: string;
  notes?: string;
  cancelReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
  staff: {
    user: {
      name: string;
    };
  };
}

interface AppointmentDetails extends Appointment {
  createdAt: string;
  updatedAt: string;
}

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"].includes(
        session.user.role,
      )
    ) {
      router.push("/dashboard");
      return;
    }

    fetchAppointments();
  }, [session, status, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/appointments");

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedAppointment(data);
        setDetailsDialogOpen(true);
      } else {
        toast.error("Failed to fetch appointment details");
      }
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      toast.error("An error occurred");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("An error occurred");
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.service.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "outline",
      CANCELLED: "destructive",
      NO_SHOW: "destructive",
    };

    const icons: Record<string, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle2,
      COMPLETED: CheckCircle2,
      CANCELLED: XCircle,
      NO_SHOW: XCircle,
    };

    const Icon = icons[status] || AlertCircle;

    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Manage and view all clinic appointments
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Appointments</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.service.name}</TableCell>
                      <TableCell>
                        {appointment.staff?.user.name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(
                              new Date(appointment.appointmentDate),
                              "MMM dd, yyyy",
                            )}
                          </span>
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          <span>
                            {format(
                              new Date(appointment.appointmentDate),
                              "h:mm a",
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.service.duration} min</TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(appointment.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {appointment.status !== "CANCELLED" &&
                              appointment.status !== "COMPLETED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCancelAppointment(appointment.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Appointment
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
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full details of the appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Patient
                  </p>
                  <p className="font-semibold">
                    {selectedAppointment.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.user.email}
                  </p>
                  {selectedAppointment.user.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.user.phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Service
                  </p>
                  <p className="font-semibold">
                    {selectedAppointment.service.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {selectedAppointment.service.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Staff
                  </p>
                  <p className="font-semibold">
                    {selectedAppointment.staff?.user.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </p>
                <p className="font-semibold">
                  {format(
                    new Date(selectedAppointment.appointmentDate),
                    "MMMM dd, yyyy at h:mm a",
                  )}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Notes
                  </p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.cancelReason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cancellation Reason
                  </p>
                  <p className="text-sm">{selectedAppointment.cancelReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p>
                    Created:{" "}
                    {format(
                      new Date(selectedAppointment.createdAt),
                      "MMM dd, yyyy h:mm a",
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    Updated:{" "}
                    {format(
                      new Date(selectedAppointment.updatedAt),
                      "MMM dd, yyyy h:mm a",
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
