"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Activity,
  BookOpen,
  LogOut,
  Settings,
  ChevronRight,
  Bell,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  User as UserIcon,
  CalendarCheck,
  Video,
  Plus,
  Loader2,
} from "lucide-react";
import {
  format,
  isBefore,
  isAfter,
  isSameDay,
  addDays,
  isPast,
  isToday,
} from "date-fns";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

interface Appointment {
  id: string;
  status: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: "IN_PERSON" | "TELEHEALTH";
  reason?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
    slug: string;
  };
  staff: {
    user: {
      id: string;
      name: string;
      image: string | null;
      email: string;
    };
    specialization: string;
    consultationFee: number;
  };
}

interface PatientProfile {
  id: string;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  medications?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    image?: string | null;
  };
}

interface Settings {
  clinicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  workingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    image: "",
  });

  // Fetch appointments and profile on mount
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchData();
    }
    fetchSettings();
  }, [status, session]);

  // Check for booking success notification
  useEffect(() => {
    if (searchParams.get("booking") === "success") {
      toast.success(
        "Appointment booked successfully! Check your upcoming appointments.",
      );
      // Clean up URL
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  // Update form data when profile or session changes
  useEffect(() => {
    if (session?.user && patientProfile) {
      setFormData({
        name: session.user.name || "",
        phone: (session.user as any).phone || "",
        dateOfBirth: (session.user as any).dateOfBirth
          ? new Date((session.user as any).dateOfBirth)
              .toISOString()
              .split("T")[0]
          : "",
        address: patientProfile.address || "",
        city: patientProfile.city || "",
        state: patientProfile.state || "",
        postalCode: patientProfile.postalCode || "",
        country: patientProfile.country || "",
        emergencyContact: patientProfile.emergencyContact || "",
        emergencyPhone: patientProfile.emergencyPhone || "",
        bloodGroup: patientProfile.bloodGroup || "",
        allergies: patientProfile.allergies || "",
        medicalConditions: patientProfile.medicalConditions || "",
        medications: patientProfile.medications || "",
        image: patientProfile.user?.image || (session.user as any).image || "",
      });
    }
  }, [session?.user, patientProfile]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(data.appointments || []);
      }

      // Fetch patient profile
      const profileRes = await fetch("/api/patient/profile");
      if (profileRes.ok) {
        const data = await profileRes.json();
        setPatientProfile(data.profile || null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load your data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings");
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancelReason: "Cancelled by patient",
        }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled successfully");
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  // Handle personal information save
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          image: formData.image,
        }),
      });

      if (response.ok) {
        toast.success("Personal information updated successfully");
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update personal information");
      }
    } catch (error) {
      console.error("Error saving personal information:", error);
      toast.error("Failed to save personal information");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile image save
  const handleSaveProfileImage = async () => {
    setIsSavingImage(true);
    try {
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: formData.image }),
      });

      if (response.ok) {
        toast.success("Profile photo updated successfully");
        setIsEditingPhoto(false);
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("Error saving profile photo:", error);
      toast.error("Failed to save profile photo");
    } finally {
      setIsSavingImage(false);
    }
  };

  // Handle medical information save
  const handleSaveMedicalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          bloodGroup: formData.bloodGroup,
          allergies: formData.allergies,
          medicalConditions: formData.medicalConditions,
          medications: formData.medications,
        }),
      });

      if (response.ok) {
        toast.success("Medical information updated successfully");
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update medical information");
      }
    } catch (error) {
      console.error("Error saving medical information:", error);
      toast.error("Failed to save medical information");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Filter appointments into upcoming and past
  const upcomingAppointments = appointments
    .filter(
      (apt) =>
        ["CONFIRMED", "PENDING"].includes(apt.status) &&
        new Date(apt.appointmentDate) >=
          new Date(new Date().setHours(0, 0, 0, 0)),
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    );

  const pastAppointments = appointments
    .filter((apt) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status))
    .sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime(),
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "NO_SHOW":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "NO_SHOW":
        return "No Show";
      case "IN_PROGRESS":
        return "In Progress";
      case "PENDING":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">
                {settings?.clinicName || "PhysioConnect"}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                  <AvatarImage
                    src={formData.image || (session.user as any).image || ""}
                    alt={session.user.name || ""}
                  />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-32 truncate">
                  {session.user.name || "Patient"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveTab("profile");
                  router.push("/dashboard?tab=profile");
                }}
                className={activeTab === "profile" ? "bg-accent" : ""}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your appointments, view your health journey, and connect with
            your care team.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setActiveTab("appointments");
              router.push("/dashboard?tab=appointments");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Upcoming Appointments
              </CardTitle>
              <Badge variant="secondary">{upcomingAppointments.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-1">
                {upcomingAppointments.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setActiveTab("history");
              router.push("/dashboard?tab=history");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Past Appointments
              </CardTitle>
              <Badge variant="secondary">{pastAppointments.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-1">
                {pastAppointments.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Completed sessions
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setActiveTab("overview");
              router.push("/dashboard?tab=overview");
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Health Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">Track Progress</p>
                  <p className="text-sm text-muted-foreground">
                    View your treatment history and progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/book" className="group">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-1">
                      Book New Appointment
                    </CardTitle>
                    <CardDescription>
                      Schedule your next session
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    className="bg-primary text-primary-foreground group-hover:bg-primary/90"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {appointments.length}
                      </div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>This Month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {
                          appointments.filter((a) => {
                            const aptDate = new Date(a.appointmentDate);
                            const now = new Date();
                            return (
                              aptDate.getMonth() === now.getMonth() &&
                              aptDate.getFullYear() === now.getFullYear()
                            );
                          }).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sessions this month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {
                          appointments.filter((a) => a.status === "COMPLETED")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Completed sessions
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>
                      Your next scheduled sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No upcoming appointments
                        </p>
                        <Link href="/book">
                          <Button>Book an Appointment</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="shrink-0">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 sm:flex sm:items-center gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {apt.service.name}
                                </h3>
                                {apt.staff && (
                                  <p className="text-sm text-muted-foreground">
                                    with {apt.staff.user.name}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <CalendarIcon className="w-4 h-4" />
                                    {format(
                                      new Date(apt.appointmentDate),
                                      "EEE, MMM d",
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <ClockIcon className="w-4 h-4" />
                                    {apt.startTime} - {apt.endTime}
                                  </div>
                                </div>
                              </div>
                              {apt.type === "TELEHEALTH" && (
                                <Badge variant="secondary" className="w-fit">
                                  <Video className="w-3 h-3 mr-1" />
                                  Video Consultation
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(apt.status)}>
                                {getStatusText(apt.status)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelAppointment(apt.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                {/* Appointment Completion Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between mb-2">
                      <div className="text-3xl font-bold text-primary">
                        {appointments.length > 0
                          ? Math.round(
                              (appointments.filter(
                                (a) => a.status === "COMPLETED",
                              ).length /
                                appointments.length) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                    </div>
                    <Progress
                      value={
                        appointments.length > 0
                          ? (appointments.filter(
                              (a) => a.status === "COMPLETED",
                            ).length /
                              appointments.length) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Completed vs. Total sessions
                    </p>
                  </CardContent>
                </Card>

                {/* Services Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Services Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointments.reduce(
                        (acc: Record<string, number>, apt) => {
                          const serviceName = apt.service.name;
                          acc[serviceName] = (acc[serviceName] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>,
                      ).length > 0 ? (
                        Object.entries(
                          appointments.reduce(
                            (acc: Record<string, number>, apt) => {
                              const serviceName = apt.service.name;
                              acc[serviceName] = (acc[serviceName] || 0) + 1;
                              return acc;
                            },
                            {} as Record<string, number>,
                          ),
                        ).map(([name, count]) => (
                          <div
                            key={name}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-muted-foreground">
                              {name}
                            </span>
                            <span className="text-sm font-semibold">
                              {count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No appointment data yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    All Appointments
                  </CardTitle>
                  <CardDescription>
                    View and manage all your appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        You don't have any appointments yet
                      </p>
                      <Link href="/book">
                        <Button>Book Your First Appointment</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="shrink-0">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <CalendarIcon className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  {apt.service.name}
                                </h3>
                                <Badge className={getStatusColor(apt.status)}>
                                  {getStatusText(apt.status)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {format(
                                    new Date(apt.appointmentDate),
                                    "EEEE, MMMM d, yyyy",
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  {apt.startTime} - {apt.endTime}
                                </div>
                                {apt.staff && (
                                  <div className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {apt.staff.user.name}
                                  </div>
                                )}
                                {apt.type === "TELEHEALTH" && (
                                  <Badge variant="secondary">
                                    <Video className="w-3 h-3 mr-1" />
                                    Video Call
                                  </Badge>
                                )}
                              </div>
                              {apt.reason && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Reason:</span>{" "}
                                  {apt.reason}
                                </div>
                              )}
                              {apt.notes && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {apt.notes.substring(0, 50)}
                                  {apt.notes.length > 50 && "..."}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {apt.status === "CONFIRMED" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelAppointment(apt.id)
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Appointment History
                </CardTitle>
                <CardDescription>
                  Your past appointments and treatment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pastAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You don't have any past appointments yet
                    </p>
                    <Link href="/book">
                      <Button>Book Your First Appointment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                apt.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : apt.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {apt.status === "COMPLETED" && (
                                <CheckCircle className="w-6 h-6" />
                              )}
                              {apt.status === "CANCELLED" && (
                                <XCircle className="w-6 h-6" />
                              )}
                              {apt.status === "NO_SHOW" && (
                                <ClockIcon className="w-6 h-6" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center justify-between">
                              <h3 className="font-semibold">
                                {apt.service.name}
                              </h3>
                              <Badge className={getStatusColor(apt.status)}>
                                {getStatusText(apt.status)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {format(
                                  new Date(apt.appointmentDate),
                                  "EEEE, MMMM d, yyyy",
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {apt.startTime} - {apt.endTime}
                              </div>
                              {apt.staff && (
                                <div className="flex items-center gap-1">
                                  <UserIcon className="w-4 h-4" />
                                  {apt.staff.user.name}
                                </div>
                              )}
                            </div>
                            {apt.reason && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Reason:</span>{" "}
                                {apt.reason}
                              </div>
                            )}
                            {apt.cancelReason && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">
                                  Cancellation:
                                </span>{" "}
                                {apt.cancelReason}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.status === "COMPLETED" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/book?service=${apt.service.slug}`,
                                  )
                                }
                              >
                                Book Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <form
                        className="space-y-4"
                        onSubmit={handleSavePersonalInfo}
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={session.user.email || ""}
                              placeholder="your.email@example.com"
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+8801XXXXXXXXX"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                              id="dob"
                              type="date"
                              placeholder="Select your date of birth"
                              value={formData.dateOfBirth}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dateOfBirth: e.target.value,
                                })
                              }
                              max={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Healthcare Street"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="City"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  city: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              placeholder="State/Province"
                              value={formData.state}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  state: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              placeholder="12345"
                              value={formData.postalCode}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  postalCode: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Medical Information
                    </CardTitle>
                    <CardDescription>
                      Your health information and medical history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <form
                        className="space-y-4"
                        onSubmit={handleSaveMedicalInfo}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">
                            Emergency Contact *
                          </Label>
                          <Input
                            id="emergencyContact"
                            placeholder="John Doe"
                            value={formData.emergencyContact}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergencyContact: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">
                            Emergency Phone *
                          </Label>
                          <Input
                            id="emergencyPhone"
                            type="tel"
                            placeholder="+8801XXXXXXXXX"
                            value={formData.emergencyPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergencyPhone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Input
                            id="bloodGroup"
                            placeholder="A+, B+, O+, AB+, etc."
                            value={formData.bloodGroup}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bloodGroup: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Textarea
                            id="allergies"
                            placeholder="List any known allergies..."
                            rows={3}
                            value={formData.allergies}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                allergies: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medicalConditions">
                            Medical Conditions
                          </Label>
                          <Textarea
                            id="medicalConditions"
                            placeholder="List any medical conditions..."
                            rows={3}
                            value={formData.medicalConditions}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                medicalConditions: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medications">
                            Current Medications
                          </Label>
                          <Textarea
                            id="medications"
                            placeholder="List any current medications..."
                            rows={3}
                            value={formData.medications}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                medications: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Medical Information"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Contact Information */}
              <div className="space-y-6">
                {/* Profile Photo Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Profile Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={formData.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback className="text-2xl">
                        {session.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingPhoto ? (
                      <>
                        <div className="w-full">
                          <ImageUpload
                            value={formData.image}
                            onChange={(url) =>
                              setFormData({ ...formData, image: url })
                            }
                            folder="patients"
                            placeholder="Upload profile photo"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Upload a photo. Max 5MB.
                        </p>
                        <div className="flex gap-2 w-full mt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsEditingPhoto(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleSaveProfileImage}
                            disabled={isSavingImage}
                          >
                            {isSavingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Photo"
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => setIsEditingPhoto(true)}
                      >
                        Change Photo
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {settings?.clinicName || "PhysioConnect Clinic"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {settings?.address || "123 Healthcare Street"}
                          <br />
                          {settings?.city || "Medical District"},{" "}
                          {settings?.state || "MD"}{" "}
                          {settings?.postalCode || "12345"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${settings?.phone || "+8801XXXXXXXXX"}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {settings?.phone || "+8801XXXXXXXXX"}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${settings?.email || "info@physioconnect.com"}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {settings?.email || "info@physioconnect.com"}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Mon-Fri:{" "}
                        {settings?.workingHours?.monday || "8:00 AM - 6:00 PM"}
                        <br />
                        Sat:{" "}
                        {settings?.workingHours?.saturday ||
                          "9:00 AM - 2:00 PM"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Need Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Have questions about your treatment or need to make
                      changes?
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("profile")}
                      >
                        Contact Support
                      </Button>
                      <Link href="/book">
                        <Button className="w-full justify-start">
                          Book Another Appointment
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("profile")}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
