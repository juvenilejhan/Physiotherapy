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
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Star,
  Loader2,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  conditions: string;
  benefits: string;
  duration: number;
  price: number;
  category: string;
}

interface StaffMember {
  id: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    email: string;
  };
  specialization: string;
  experience: number;
  consultationFee: number;
  qualifications?: string;
  bio?: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchServiceDetails();
    }
  }, [slug]);

  const fetchServiceDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/services/slug/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error("Service not found");
        router.push("/services");
        return;
      }

      setService(data.service);

      // Fetch staff for this service
      if (data.service?.staffServices) {
        const staffList = data.service.staffServices.map((ss: any) => ss.staff);
        setStaff(staffList);
      }
    } catch (error) {
      toast.error("Failed to load service details");
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

  if (!service) {
    return null;
  }

  const conditionsArray = service.conditions
    ? service.conditions.split(",").map((c) => c.trim())
    : [];
  const benefitsArray = service.benefits
    ? service.benefits
        .split(".")
        .filter((b) => b.trim())
        .map((b) => b.trim())
    : [];

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-0 transition-colors" />
          </div>
          <Badge className="mb-4">{service.category.replace("_", " ")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {service.name}
          </h1>
          <p className="text-lg opacity-90 max-w-3xl">{service.description}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>{service.description}</p>
              </CardContent>
            </Card>

            {/* Conditions Treated */}
            {conditionsArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conditions We Treat</CardTitle>
                  <CardDescription>
                    This service is designed to help with the following
                    conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {conditionsArray.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        <span>{condition}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {benefitsArray.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>
                    What you can expect from this treatment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefitsArray.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Specialists */}
            {staff.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialists</CardTitle>
                  <CardDescription>
                    Meet our experts in {service.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base">
                            {member.user.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {member.specialization}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{member.experience} years exp</span>
                            <span>•</span>
                            <span className="font-semibold text-primary">
                              {formatBDT(member.consultationFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/specialists">
                    <Button variant="outline" className="w-full mt-4">
                      View All Specialists
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>Duration</span>
                  </div>
                  <span className="font-semibold">{service.duration} min</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>Price</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {formatBDT(service.price)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>Appointment Type</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="flex-1 justify-center">
                    In-Person
                  </Badge>
                  <Badge variant="outline" className="flex-1 justify-center">
                    Telehealth
                  </Badge>
                </div>
              </CardContent>
              <Separator />
              <Button asChild className="w-full">
                <Link href={`/book?service=${service.id}`}>
                  Book This Service
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Call Us</p>
                    <p className="text-sm text-muted-foreground">
                      (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email Us</p>
                    <p className="text-sm text-muted-foreground">
                      info@physioconnect.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Visit Us</p>
                    <p className="text-sm text-muted-foreground">
                      123 Healthcare Street
                      <br />
                      Medical District, MD 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
