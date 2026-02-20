"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  User,
  Award,
  Star,
  CheckCircle,
  Loader2,
  BookOpen,
  Heart,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface Specialist {
  id: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    email: string;
    phone?: string;
    dateOfBirth?: string;
  };
  specialization: string;
  experience: number;
  consultationFee: number;
  qualifications?: string;
  bio?: string;
  isAvailable: boolean;
  workingHours?: string;
  services: {
    service: {
      id: string;
      name: string;
      category: string;
      slug: string;
      description: string;
      duration: number;
      price: number;
    };
  }[];
  schedules?: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export default function SpecialistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSpecialistDetails();
    }
  }, [id]);

  const fetchSpecialistDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/specialists/${id}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error("Specialist not found");
        router.push("/specialists");
        return;
      }

      setSpecialist(data.specialist);
    } catch (error) {
      toast.error("Failed to load specialist details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!specialist) {
    return null;
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

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/specialists"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Specialists
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                {specialist.user.image ? (
                  <img
                    src={specialist.user.image}
                    alt={specialist.user.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-primary" />
                )}
              </div>
              {!specialist.isAvailable && (
                <Badge
                  variant="secondary"
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                >
                  Currently Unavailable
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {specialist.user.name}
              </h1>
              <Badge variant="outline" className="mb-4 w-fit">
                {specialist.specialization}
              </Badge>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-primary-foreground/80">
                    (Based on patient reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                {specialist.bio ? (
                  <p className="text-muted-foreground">{specialist.bio}</p>
                ) : (
                  <p className="text-muted-foreground">
                    {specialist.user.name} is a dedicated physiotherapist with{" "}
                    {specialist.experience} years of experience in{" "}
                    {specialist.specialization}. Our specialist is committed to
                    providing personalized, evidence-based care to help patients
                    achieve their health and wellness goals.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Qualifications */}
            {specialist.qualifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{specialist.qualifications}</p>
                </CardContent>
              </Card>
            )}

            {/* Services Offered */}
            {specialist.services && specialist.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                  <CardDescription>
                    {specialist.user.name} specializes in the following
                    treatments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {specialist.services.map((item) => (
                      <Link
                        key={item.service.id}
                        href={`/services/${item.service.slug}`}
                        className="block group"
                      >
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                          <h4 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                            {item.service.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.service.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{item.service.duration} min</span>
                            </div>
                            <span className="font-semibold text-primary">
                              {formatBDT(item.service.price)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule */}
            {specialist.schedules && specialist.schedules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Regular working hours (subject to change)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {specialist.schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                      >
                        <span className="font-medium">
                          {dayNames[schedule.dayOfWeek]}
                        </span>
                        <span className="text-muted-foreground">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-semibold">
                      {specialist.experience} Years
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Consultation Fee
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatBDT(specialist.consultationFee)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Availability
                    </p>
                    <p className="font-semibold">
                      {specialist.isAvailable
                        ? "Available"
                        : "Currently Unavailable"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <Button
                asChild
                className="w-full"
                disabled={!specialist.isAvailable}
              >
                <Link href={`/book?specialist=${specialist.id}`}>
                  Book Appointment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              {!specialist.isAvailable && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  This specialist is currently unavailable for booking
                </p>
              )}
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-sm">{specialist.user.email}</span>
                </div>
                {specialist.user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-sm">{specialist.user.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">PhysioConnect Clinic</p>
                    <p className="text-muted-foreground">
                      123 Healthcare Street
                      <br />
                      Medical District, MD 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
