"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  Users,
  FileText,
  Loader2,
  Save,
  Edit,
  X,
  Briefcase,
  CheckCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  image: string | null;
  dateOfBirth: string | null;
  role: string;
  createdAt: string;
}

interface StaffProfile {
  id: string;
  specialization: string | null;
  qualifications: string | null;
  bio: string | null;
  experience: number | null;
  licenseNumber: string | null;
  consultationFee: number;
  isAvailable: boolean;
  services: {
    service: {
      id: string;
      name: string;
      category: string;
    };
  }[];
  schedules: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

interface ProfileData {
  user: UserProfile;
  staffProfile: StaffProfile | null;
  stats: Record<string, number>;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CLINIC_MANAGER: "Clinic Manager",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  CLINIC_MANAGER: "bg-blue-100 text-blue-800",
  DOCTOR: "bg-green-100 text-green-800",
  RECEPTIONIST: "bg-orange-100 text-orange-800",
  PATIENT: "bg-gray-100 text-gray-800",
};

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
    specialization: "",
    qualifications: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/admin/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setProfileData(data);
      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        dateOfBirth: data.user.dateOfBirth
          ? data.user.dateOfBirth.split("T")[0]
          : "",
        bio: data.staffProfile?.bio || "",
        specialization: data.staffProfile?.specialization || "",
        qualifications: data.staffProfile?.qualifications || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const { user, staffProfile, stats } = profileData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your profile information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              <Badge className={roleBadgeColors[user.role] || "bg-gray-100"}>
                {roleLabels[user.role] || user.role}
              </Badge>

              {staffProfile?.isAvailable !== undefined && (
                <div className="mt-3">
                  <Badge
                    variant={staffProfile.isAvailable ? "default" : "secondary"}
                  >
                    {staffProfile.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(user.dateOfBirth), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Member since {format(new Date(user.createdAt), "MMM yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Cards */}
          {Object.keys(stats).length > 0 && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              {stats.totalAppointments !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalAppointments}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Appointments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.completedAppointments !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.completedAppointments}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.upcomingAppointments !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.upcomingAppointments}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upcoming
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.totalPatients !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.totalPatients}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Patients
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.totalStaff !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalStaff}</p>
                        <p className="text-xs text-muted-foreground">
                          Total Staff
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.todayAppointments !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.todayAppointments}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Today's Appointments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.pendingAppointments !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stats.pendingAppointments}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">{user.name || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <p className="text-sm py-2 text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+880..."
                    />
                  ) : (
                    <p className="text-sm py-2">{user.phone || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm py-2">
                      {user.dateOfBirth
                        ? format(new Date(user.dateOfBirth), "MMMM d, yyyy")
                        : "-"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information (for staff) */}
          {staffProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Your professional details and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    {isEditing ? (
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialization: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="text-sm py-2">
                        {staffProfile.specialization || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <p className="text-sm py-2">
                      {staffProfile.experience
                        ? `${staffProfile.experience} years`
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <p className="text-sm py-2">
                      {staffProfile.licenseNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee</Label>
                    <p className="text-sm py-2">
                      ৳{staffProfile.consultationFee?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  {isEditing ? (
                    <Input
                      id="qualifications"
                      value={formData.qualifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualifications: e.target.value,
                        })
                      }
                      placeholder="MBBS, BPT, etc."
                    />
                  ) : (
                    <p className="text-sm py-2">
                      {staffProfile.qualifications || "-"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm py-2">{staffProfile.bio || "-"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services (for doctors) */}
          {staffProfile?.services && staffProfile.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Services you provide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {staffProfile.services.map((item) => (
                    <Badge key={item.service.id} variant="outline">
                      {item.service.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule (for doctors) */}
          {staffProfile?.schedules && staffProfile.schedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your regular working hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {staffProfile.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="font-medium text-sm">
                        {dayNames[schedule.dayOfWeek]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
