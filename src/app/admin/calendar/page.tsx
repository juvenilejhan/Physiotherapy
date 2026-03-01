"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { formatBDT } from "@/lib/utils";

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  cancelReason?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
  };
  staff?: {
    id: string;
    user: {
      name: string;
    };
  };
}

interface StaffMember {
  id: string;
  user: {
    name: string;
  };
}

export default function AdminCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // New appointment dialog state
  const [newAppointmentDialogOpen, setNewAppointmentDialogOpen] =
    useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    notes: "",
  });

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

    fetchData();
  }, [session, status, router, currentDate, selectedStaff]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const startOfCurrentMonth = startOfMonth(currentDate);
      const endOfCurrentMonth = endOfMonth(currentDate);

      const [appointmentsRes, staffRes, servicesRes] = await Promise.all([
        fetch(
          `/api/admin/appointments?startDate=${startOfCurrentMonth.toISOString()}&endDate=${endOfCurrentMonth.toISOString()}`,
        ),
        fetch("/api/admin/staff"),
        fetch("/api/services"),
      ]);

      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.appointments)
              ? data.appointments
              : [],
        );
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(Array.isArray(data) ? data : []);
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayApps = appointments.filter((apt) =>
      isSameDay(new Date(apt.appointmentDate), date),
    );
    setDayAppointments(dayApps);
    setDetailsDialogOpen(true);
  };

  const handleNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: newAppointmentForm.serviceId,
          staffId: newAppointmentForm.staffId || undefined,
          appointmentDate: newAppointmentForm.date,
          startTime: newAppointmentForm.time,
          notes: newAppointmentForm.notes || undefined,
          guestName: newAppointmentForm.guestName,
          guestEmail: newAppointmentForm.guestEmail,
          guestPhone: newAppointmentForm.guestPhone,
        }),
      });

      if (response.ok) {
        toast.success("Appointment created successfully");
        setNewAppointmentDialogOpen(false);
        resetNewAppointmentForm();
        fetchData();
      } else {
        toast.error("Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("An error occurred");
    }
  };

  const resetNewAppointmentForm = () => {
    setNewAppointmentForm({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      serviceId: "",
      staffId: "",
      date: "",
      time: "",
      notes: "",
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        isSameDay(aptDate, date) &&
        (selectedStaff === "all" || apt.staff?.id === selectedStaff)
      );
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      NO_SHOW: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return <CalendarPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">View and manage appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-full sm:w-50">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog
            open={newAppointmentDialogOpen}
            onOpenChange={(open) => {
              setNewAppointmentDialogOpen(open);
              if (!open) resetNewAppointmentForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewAppointment}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="guestName">Patient Name</Label>
                    <Input
                      id="guestName"
                      type="text"
                      value={newAppointmentForm.guestName}
                      onChange={(e) =>
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          guestName: e.target.value,
                        })
                      }
                      placeholder="Patient full name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guestEmail">Patient Email</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={newAppointmentForm.guestEmail}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            guestEmail: e.target.value,
                          })
                        }
                        placeholder="patient@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guestPhone">Patient Phone</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        value={newAppointmentForm.guestPhone}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            guestPhone: e.target.value,
                          })
                        }
                        placeholder="+880 1XXX-XXXXXX"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={newAppointmentForm.serviceId}
                      onValueChange={(value) =>
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          serviceId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatBDT(service.price)} (
                            {service.duration} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="staff">Staff</Label>
                    <Select
                      value={newAppointmentForm.staffId}
                      onValueChange={(value) =>
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          staffId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAppointmentForm.date}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newAppointmentForm.time}
                        onChange={(e) =>
                          setNewAppointmentForm({
                            ...newAppointmentForm,
                            time: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newAppointmentForm.notes}
                      onChange={(e) =>
                        setNewAppointmentForm({
                          ...newAppointmentForm,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Create Appointment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="text-center font-medium text-xs md:text-sm text-muted-foreground py-1 md:py-2"
              >
                <span className="md:hidden">{day}</span>
                <span className="hidden md:inline">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}
                </span>
              </div>
            ))}
            {calendarDays.map((date) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isDayToday = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-16 md:min-h-25 border rounded-lg p-1 md:p-2 cursor-pointer transition-colors
                    ${isCurrentMonth ? "bg-background" : "bg-muted/30"}
                    ${isDayToday ? "border-primary" : "border-border"}
                    hover:bg-accent/50
                  `}
                >
                  <div
                    className={`
                    text-xs md:text-sm font-medium mb-1
                    ${isDayToday ? "bg-primary text-primary-foreground w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center" : ""}
                  `}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="space-y-1">
                    {isMobile ? (
                      // Mobile view: Show only appointment count
                      dayAppointments.length > 0 && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-primary text-primary-foreground text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                            {dayAppointments.length}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1">
                            View
                          </span>
                        </div>
                      )
                    ) : (
                      // Desktop view: Show appointment details
                      <>
                        {dayAppointments.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className={`
                              text-xs p-1 rounded border truncate
                              ${getStatusColor(apt.status)}
                            `}
                          >
                            <div className="font-medium">
                              {apt.startTime
                                ? format(
                                    new Date(`2000-01-01T${apt.startTime}`),
                                    "h:mm a",
                                  )
                                : "--:--"}
                            </div>
                            <div className="truncate">{apt.user.name}</div>
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayAppointments.length - 3} more
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-175 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "MMMM dd, yyyy")}
            </DialogTitle>
            <DialogDescription>
              Appointments scheduled for this day
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {dayAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No appointments scheduled
              </p>
            ) : (
              dayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 rounded-lg border ${getStatusColor(apt.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">
                          {apt.startTime
                            ? format(
                                new Date(`2000-01-01T${apt.startTime}`),
                                "h:mm a",
                              )
                            : "--:--"}
                          {apt.endTime &&
                            ` - ${format(new Date(`2000-01-01T${apt.endTime}`), "h:mm a")}`}
                        </span>
                        <Badge variant="outline">{apt.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{apt.user.name}</span>
                          <span className="text-muted-foreground">
                            ({apt.user.email})
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Service:</span>{" "}
                          {apt.service.name}
                        </div>
                        <div>
                          <span className="font-medium">Staff:</span>{" "}
                          {apt.staff?.user.name || "Unassigned"}
                        </div>
                        {apt.notes && (
                          <div>
                            <span className="font-medium">Notes:</span>{" "}
                            {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-50" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-25 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
