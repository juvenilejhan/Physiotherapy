"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  User,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

// Time options for dropdowns
const timeOptions = [
  "6:00 AM",
  "6:30 AM",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
];

// Helper to parse "9:00 AM - 5:00 PM" into { start, end }
const parseHours = (
  hours: string | undefined,
): { start: string; end: string } => {
  if (!hours || hours === "Closed") return { start: "Closed", end: "" };
  const parts = hours.split(" - ");
  if (parts.length === 2) {
    return { start: parts[0].trim(), end: parts[1].trim() };
  }
  return { start: "", end: "" };
};

// Helper to combine start and end into "9:00 AM - 5:00 PM"
const combineHours = (start: string, end: string): string => {
  if (start === "Closed" || !start) return "Closed";
  if (!end) return start;
  return `${start} - ${end}`;
};

interface ClinicSettings {
  id: string;
  clinicName: string;
  clinicImage?: string;
  heroImage?: string;
  teamImage?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description: string;
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

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: "",
    clinicImage: "",
    heroImage: "",
    teamImage: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    description: "",
    mondayStart: "",
    mondayEnd: "",
    tuesdayStart: "",
    tuesdayEnd: "",
    wednesdayStart: "",
    wednesdayEnd: "",
    thursdayStart: "",
    thursdayEnd: "",
    fridayStart: "",
    fridayEnd: "",
    saturdayStart: "",
    saturdayEnd: "",
    sundayStart: "",
    sundayEnd: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER"].includes(session.user.role)
    ) {
      router.push("/admin");
      return;
    }

    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        const mon = parseHours(data.workingHours?.monday);
        const tue = parseHours(data.workingHours?.tuesday);
        const wed = parseHours(data.workingHours?.wednesday);
        const thu = parseHours(data.workingHours?.thursday);
        const fri = parseHours(data.workingHours?.friday);
        const sat = parseHours(data.workingHours?.saturday);
        const sun = parseHours(data.workingHours?.sunday);
        setFormData({
          clinicName: data.clinicName || "",
          clinicImage: data.clinicImage || "",
          heroImage: data.heroImage || "",
          teamImage: data.teamImage || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
          description: data.description || "",
          mondayStart: mon.start,
          mondayEnd: mon.end,
          tuesdayStart: tue.start,
          tuesdayEnd: tue.end,
          wednesdayStart: wed.start,
          wednesdayEnd: wed.end,
          thursdayStart: thu.start,
          thursdayEnd: thu.end,
          fridayStart: fri.start,
          fridayEnd: fri.end,
          saturdayStart: sat.start,
          saturdayEnd: sat.end,
          sundayStart: sun.start,
          sundayEnd: sun.end,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: formData.clinicName,
          clinicImage: formData.clinicImage,
          heroImage: formData.heroImage,
          teamImage: formData.teamImage,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          description: formData.description,
          workingHours: {
            monday: combineHours(formData.mondayStart, formData.mondayEnd),
            tuesday: combineHours(formData.tuesdayStart, formData.tuesdayEnd),
            wednesday: combineHours(
              formData.wednesdayStart,
              formData.wednesdayEnd,
            ),
            thursday: combineHours(
              formData.thursdayStart,
              formData.thursdayEnd,
            ),
            friday: combineHours(formData.fridayStart, formData.fridayEnd),
            saturday: combineHours(
              formData.saturdayStart,
              formData.saturdayEnd,
            ),
            sunday: combineHours(formData.sundayStart, formData.sundayEnd),
          },
        }),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
        fetchSettings();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.details || errorData.error || "Failed to save settings",
        );
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage clinic settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Clinic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Clinic Information
              </CardTitle>
              <CardDescription>
                Update your clinic's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input
                  id="clinicName"
                  value={formData.clinicName}
                  onChange={(e) =>
                    setFormData({ ...formData, clinicName: e.target.value })
                  }
                  placeholder="PhysioConnect Clinic"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of your clinic..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images & Branding */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images & Branding
              </CardTitle>
              <CardDescription>
                Upload images for your clinic's website presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Hero Banner Image
                </Label>
                <p className="text-sm text-muted-foreground">
                  This image will be displayed in the hero section at the top of
                  the landing page
                </p>
                <ImageUpload
                  value={formData.heroImage}
                  onChange={(url) =>
                    setFormData({ ...formData, heroImage: url })
                  }
                  folder="clinic"
                  placeholder="Upload hero banner image"
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Clinic Image
                </Label>
                <p className="text-sm text-muted-foreground">
                  This image will be displayed on the landing page in the Visit
                  Us section
                </p>
                <ImageUpload
                  value={formData.clinicImage}
                  onChange={(url) =>
                    setFormData({ ...formData, clinicImage: url })
                  }
                  folder="clinic"
                  placeholder="Upload clinic exterior image"
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Team Image
                </Label>
                <p className="text-sm text-muted-foreground">
                  This image will be displayed in the About section showing your
                  team
                </p>
                <ImageUpload
                  value={formData.teamImage}
                  onChange={(url) =>
                    setFormData({ ...formData, teamImage: url })
                  }
                  folder="clinic"
                  placeholder="Upload team photo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>How patients can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-8"
                    placeholder="contact@physioconnect.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-8"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
              <CardDescription>Your clinic's physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Health Street"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="NY"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="United States"
                />
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Set your clinic's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => {
                  const startKey = `${day}Start` as keyof typeof formData;
                  const endKey = `${day}End` as keyof typeof formData;
                  const isClosed = formData[startKey] === "Closed";

                  return (
                    <div key={day} className="flex items-center gap-3">
                      <Label className="capitalize w-24 font-medium">
                        {day}
                      </Label>
                      <Select
                        value={formData[startKey] || ""}
                        onValueChange={(value) => {
                          if (value === "Closed") {
                            setFormData({
                              ...formData,
                              [startKey]: "Closed",
                              [endKey]: "",
                            });
                          } else {
                            setFormData({ ...formData, [startKey]: value });
                          }
                        }}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Opens" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Closed">Closed</SelectItem>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isClosed && (
                        <>
                          <span className="text-muted-foreground">to</span>
                          <Select
                            value={formData[endKey] || ""}
                            onValueChange={(value) =>
                              setFormData({ ...formData, [endKey]: value })
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Closes" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
