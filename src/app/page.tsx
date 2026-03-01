"use client";

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
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
  Users,
  Activity,
  Heart,
  Bone,
  Baby,
  Zap,
  Star,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  FileText,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { BookAppointmentButton } from "@/components/BookAppointmentButton";

interface ClinicSettings {
  clinicName: string;
  logo?: string;
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

interface DynamicService {
  id: string;
  name: string;
  slug: string;
  description: string;
  conditions: string | null;
  benefits: string | null;
  duration: number;
  price: number;
  image: string | null;
  category: string | null;
}

interface DynamicSpecialist {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  specialization: string | null;
  experience: number | null;
  consultationFee: number;
  qualifications: string | null;
  bio: string | null;
}

interface DynamicBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  publishedAt: string | null;
}

export default function Home() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [dynamicServices, setDynamicServices] = useState<DynamicService[]>([]);
  const [dynamicSpecialists, setDynamicSpecialists] = useState<
    DynamicSpecialist[]
  >([]);
  const [dynamicBlogs, setDynamicBlogs] = useState<DynamicBlog[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [specialistsLoading, setSpecialistsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

  // Default values as fallback
  const defaultSettings: ClinicSettings = {
    clinicName: "PhysioConnect",
    clinicImage: "/images/clinic-exterior.jpg",
    heroImage: "/images/hero-banner.jpg",
    teamImage: "/images/about-team.jpg",
    email: "info@physioconnect.com",
    phone: "(555) 123-4567",
    address: "123 Healthcare Plaza",
    city: "Medical District",
    state: "State",
    postalCode: "12345",
    country: "Country",
    description: "Your trusted partner in physiotherapy care.",
    workingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 2:00 PM",
      sunday: "Closed",
    },
  };

  // Fetch clinic settings on mount
  useEffect(() => {
    const fetchClinicSettings = async () => {
      try {
        const response = await fetch("/api/public/settings");
        if (response.ok) {
          const data = await response.json();
          setClinicSettings(data);
        } else {
          setClinicSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching clinic settings:", error);
        setClinicSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicSettings();
  }, []);

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json();
          setDynamicServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch specialists from database
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await fetch("/api/specialists");
        if (response.ok) {
          const data = await response.json();
          setDynamicSpecialists(data.specialists || []);
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
      } finally {
        setSpecialistsLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  // Fetch blog posts from database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/public/blogs?limit=3");
        if (response.ok) {
          const data = await response.json();
          setDynamicBlogs(data.blogs || []);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const settings = clinicSettings || defaultSettings;

  // Helper to format phone for WhatsApp with proper country code
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "");

    // Handle Bangladesh local format (starts with 0, 11 digits)
    // Convert 01723131343 -> 8801723131343
    if (digits.startsWith("0") && digits.length === 11) {
      digits = "880" + digits.substring(1);
    }

    return digits;
  };

  // Helper to format phone for tel: links (keeps + for international format)
  const formatPhoneForTel = (phone: string): string => {
    return phone.replace(/[^\d+]/g, "");
  };

  // Pre-filled WhatsApp message
  const whatsappMessage = encodeURIComponent(
    "Hello! I have some pain/discomfort and would like to consult with a physiotherapist. Can you help?",
  );

  const serviceImages = {
    "Orthopedic Physiotherapy": "/images/service-orthopedic.jpg",
    "Neurological Physiotherapy": "/images/service-neurological.jpg",
    "Sports Injury Rehabilitation": "/images/service-sports.jpg",
    "Pediatric Physiotherapy": "/images/service-pediatric.jpg",
    "Cardiopulmonary Rehabilitation": "/images/service-cardiopulmonary.jpg",
    "Geriatric Physiotherapy": "/images/service-geriatric.jpg",
  };

  const services = [
    {
      icon: <Bone className="w-8 h-8" />,
      title: "Orthopedic Physiotherapy",
      description:
        "Specialized treatment for musculoskeletal conditions, sports injuries, and post-operative rehabilitation.",
      conditions: ["Sports Injuries", "Joint Pain", "Post-Surgery Recovery"],
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Neurological Physiotherapy",
      description:
        "Comprehensive care for neurological conditions to improve mobility and quality of life.",
      conditions: ["Stroke Recovery", "Parkinson's", "Spinal Cord Injury"],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Sports Injury Rehabilitation",
      description:
        "Expert care for athletes at all levels, from injury prevention to return-to-sport programs.",
      conditions: ["ACL Tears", "Tennis Elbow", "Rotator Cuff"],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Pediatric Physiotherapy",
      description:
        "Specialized treatment for children, helping them achieve developmental milestones and optimal function.",
      conditions: ["Developmental Delays", "Cerebral Palsy", "Scoliosis"],
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Cardiopulmonary Rehabilitation",
      description:
        "Comprehensive programs for heart and lung conditions to improve endurance and breathing.",
      conditions: ["Heart Disease", "COPD", "Asthma"],
    },
    {
      icon: <Baby className="w-8 h-8" />,
      title: "Geriatric Physiotherapy",
      description:
        "Specialized care for older adults to maintain mobility, independence, and prevent falls.",
      conditions: ["Balance Issues", "Arthritis", "Osteoporosis"],
    },
  ];

  const specialists = [
    {
      name: "Dr. Emily Carter",
      role: "Senior Physiotherapist",
      specialization: "Sports Medicine",
      experience: "12 years",
      image: null,
      rating: 4.9,
      reviews: 127,
    },
    {
      name: "Dr. Michael Chen",
      role: "Neurological Specialist",
      specialization: "Neurological Rehabilitation",
      experience: "10 years",
      image: null,
      rating: 4.8,
      reviews: 98,
    },
    {
      name: "Dr. Sarah Johnson",
      role: "Orthopedic Therapist",
      specialization: "Musculoskeletal Therapy",
      experience: "8 years",
      image: null,
      rating: 4.9,
      reviews: 156,
    },
    {
      name: "Dr. James Wilson",
      role: "Pediatric Physiotherapist",
      specialization: "Child Development",
      experience: "7 years",
      image: null,
      rating: 4.7,
      reviews: 73,
    },
  ];

  const features = [
    "Expert Licensed Physiotherapists",
    "Modern Equipment & Techniques",
    "Personalized Treatment Plans",
    "Telehealth Consultations Available",
    "Direct Insurance Billing",
    "Flexible Scheduling",
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Specialists", href: "/specialists" },
    { name: "Videos", href: "/videos" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  scrollToTop();
                }
              }}
              className="flex items-center gap-2"
            >
              {settings.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.clinicName}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Activity className="w-8 h-8 text-primary" />
              )}
              <span className="text-2xl font-bold">{settings.clinicName}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (
                      link.name === "Home" &&
                      window.location.pathname === "/"
                    ) {
                      e.preventDefault();
                      scrollToTop();
                    }
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {session ? (
                <>
                  <Link
                    href={
                      session.user?.role === "PATIENT" ? "/dashboard" : "/admin"
                    }
                  >
                    <Button variant="ghost" className="px-2 lg:px-4">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <BookAppointmentButton className="px-3 lg:px-4" />
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="px-2 lg:px-4">
                      Login
                    </Button>
                  </Link>
                  <BookAppointmentButton className="px-3 lg:px-4" />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (
                      link.name === "Home" &&
                      window.location.pathname === "/"
                    ) {
                      scrollToTop();
                    }
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {session ? (
                  <>
                    <Link
                      href={
                        session.user?.role === "PATIENT"
                          ? "/dashboard"
                          : "/admin"
                      }
                    >
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <BookAppointmentButton className="w-full" />
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <BookAppointmentButton className="w-full" />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Image - Mobile & Tablet Only */}
          <div className="absolute inset-0 lg:hidden">
            <Image
              src={settings.heroImage || "/images/hero-banner.jpg"}
              alt=""
              fill
              className="object-cover"
              priority
              quality={80}
              unoptimized={settings.heroImage?.startsWith("/uploads/")}
            />
            <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/50 to-background/30" />
          </div>

          {/* Desktop Background Gradient */}
          <div className="absolute inset-0 hidden lg:block bg-linear-to-br from-primary/5 via-background to-primary/5" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="w-fit">Trusted by 10,000+ Patients</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Your Journey to <span className="text-primary">Recovery</span>{" "}
                  Starts Here
                </h1>
                <p className="text-lg text-muted-foreground">
                  Expert physiotherapy care tailored to your unique needs. Our
                  team of licensed specialists provides comprehensive treatment
                  to help you regain mobility, reduce pain, and improve your
                  quality of life.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center sm:items-start">
                  <Link href="/book" className="w-full sm:w-auto">
                    <Button size="lg" className="text-lg w-full sm:w-auto">
                      Book Appointment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <a
                    href={`tel:${formatPhoneForTel(settings.phone)}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg w-full sm:w-auto"
                    >
                      <Phone className="mr-2 w-5 h-5" />
                      Call Us Now
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(settings.phone)}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                    >
                      <MessageCircle className="mr-2 w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.9 Rating</span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="text-sm text-muted-foreground">
                    500+ Positive Reviews
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={settings.heroImage || "/images/hero-banner.jpg"}
                    alt="Modern Physiotherapy Clinic"
                    width={1200}
                    height={1200}
                    className="object-cover w-full h-full"
                    priority
                    quality={100}
                    unoptimized={settings.heroImage?.startsWith("/uploads/")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge>Our Services</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Comprehensive Physiotherapy Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We offer a wide range of specialized physiotherapy services to
                address your specific needs and help you achieve optimal health.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesLoading
                ? // Loading skeleton
                  [1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted"></div>
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : dynamicServices.length > 0
                  ? // Dynamic services from database
                    dynamicServices.slice(0, 3).map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        className="block"
                      >
                        <Card className="hover:shadow-lg transition-shadow overflow-hidden group h-full">
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            <Image
                              src={
                                service.image ||
                                serviceImages[
                                  service.name as keyof typeof serviceImages
                                ] ||
                                "/images/service-orthopedic.jpg"
                              }
                              alt={service.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {service.name}
                            </CardTitle>
                            <CardDescription className="text-base line-clamp-2">
                              {service.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {service.conditions && (
                                <>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Treats:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {service.conditions
                                      .split(",")
                                      .slice(0, 3)
                                      .map((condition, idx) => (
                                        <Badge key={idx} variant="secondary">
                                          {condition.trim()}
                                        </Badge>
                                      ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  : // Fallback to static services
                    services.slice(0, 3).map((service, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow overflow-hidden group"
                      >
                        <div className="relative aspect-video bg-muted overflow-hidden">
                          <Image
                            src={
                              serviceImages[
                                service.title as keyof typeof serviceImages
                              ]
                            }
                            alt={service.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            priority={index < 3}
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {service.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Treats:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {service.conditions.map((condition, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/services">
                <Button size="lg" variant="outline">
                  View All Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Specialists Section */}
        <section id="specialists" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge>Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Meet Our Specialists
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our team of experienced and licensed physiotherapists is
                dedicated to providing the highest quality care to help you
                achieve your health goals.
              </p>
            </div>

            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={settings.teamImage || "/images/about-team.jpg"}
                alt={`${settings.clinicName} Team`}
                width={1200}
                height={400}
                quality={100}
                className="object-cover w-full h-auto"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialistsLoading
                ? // Loading skeleton
                  [1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="text-center">
                        <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                        <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                      </CardHeader>
                      <CardContent className="text-center space-y-3">
                        <div className="h-6 bg-muted rounded w-24 mx-auto"></div>
                        <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
                      </CardContent>
                    </Card>
                  ))
                : dynamicSpecialists.length > 0
                  ? // Dynamic specialists from database
                    dynamicSpecialists.slice(0, 4).map((specialist) => (
                      <Link
                        key={specialist.id}
                        href={`/specialists/${specialist.id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-lg transition-shadow h-full">
                          <CardHeader className="text-center">
                            <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                              {specialist.user.image ? (
                                <Image
                                  src={specialist.user.image}
                                  alt={specialist.user.name || "Specialist"}
                                  width={96}
                                  height={96}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Users className="w-12 h-12 text-primary" />
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {specialist.user.name || "Specialist"}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {specialist.specialization || "Physiotherapist"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-center space-y-3">
                            {specialist.qualifications && (
                              <Badge variant="outline">
                                {specialist.qualifications.split(",")[0]}
                              </Badge>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {specialist.experience
                                ? `${specialist.experience} years of experience`
                                : "Experienced Professional"}
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">4.9</span>
                              <span className="text-sm text-muted-foreground">
                                (Based on reviews)
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  : // Fallback to static specialists
                    specialists.map((specialist, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="text-center">
                          <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Users className="w-12 h-12 text-primary" />
                          </div>
                          <CardTitle className="text-lg">
                            {specialist.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {specialist.role}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-3">
                          <Badge variant="outline">
                            {specialist.specialization}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {specialist.experience} of experience
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {specialist.rating}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({specialist.reviews} reviews)
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/specialists">
                <Button size="lg" variant="outline">
                  View All Specialists
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge>Why Choose Us</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Experience the PhysioConnect Difference
                </h2>
                <p className="text-lg text-muted-foreground">
                  We combine cutting-edge technology with compassionate care to
                  provide you with the best possible treatment experience. Our
                  patient-centered approach ensures that you receive
                  personalized care tailored to your unique needs.
                </p>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-base">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/about">
                  <Button size="lg" className="mt-6">
                    Learn More About Us
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="text-3xl font-bold text-primary">10K+</div>
                    <CardDescription>Happy Patients</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="text-3xl font-bold text-primary">15+</div>
                    <CardDescription>Expert Specialists</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="text-3xl font-bold text-primary">98%</div>
                    <CardDescription>Success Rate</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="text-3xl font-bold text-primary">24/7</div>
                    <CardDescription>Online Booking</CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg md:hidden">
                <Image
                  src="/images/about-clinic.jpg"
                  alt="Our Modern Clinic"
                  width={500}
                  height={400}
                  quality={100}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-28 md:py-36 relative overflow-hidden min-h-125 md:min-h-150">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/cta-energetic.jpg"
              alt="Recovery Journey"
              fill
              quality={100}
              sizes="100vw"
              className="object-cover object-top lg:object-[center_20%]"
              priority
            />
            {/* Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/40 via-primary/25 to-transparent" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Ready to Start Your Recovery Journey?
              </h2>
              <p className="text-xl md:text-2xl opacity-95">
                Book your appointment today and take the first step towards a
                pain-free, active life. Our team is ready to help you achieve
                your health goals.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center pt-4">
                <Link href="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    Book Appointment Now
                  </Button>
                </Link>
                <a
                  href={`tel:${formatPhoneForTel(settings.phone)}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary shadow-lg"
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    Call: {settings.phone}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(settings.phone)}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 shadow-lg"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Preview Section */}
        <section id="blog" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <Badge>Latest Insights</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Health Tips & Resources
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay informed with our latest articles on physiotherapy,
                wellness, and healthy living.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {blogsLoading
                ? // Loading skeleton
                  [1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                      <div className="relative aspect-video bg-muted"></div>
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-20 mb-2"></div>
                        <div className="h-6 bg-muted rounded w-full"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-4 bg-muted rounded w-20"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : dynamicBlogs.length > 0
                  ? // Dynamic blogs from database
                    dynamicBlogs.map((blog, i) => (
                      <Link
                        key={blog.id}
                        href={`/blog/${blog.slug}`}
                        className="block"
                      >
                        <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full">
                          <div className="relative aspect-video bg-muted">
                            {blog.featuredImage ? (
                              <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                fill
                                quality={100}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                                className="object-cover"
                                priority={i < 3}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                                <FileText className="w-12 h-12 text-primary/40" />
                              </div>
                            )}
                          </div>
                          <CardHeader>
                            <Badge className="w-fit mb-2">
                              {blog.category || "Article"}
                            </Badge>
                            <CardTitle className="text-lg line-clamp-2">
                              {blog.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>
                                {blog.publishedAt
                                  ? new Date(
                                      blog.publishedAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently"}
                              </span>
                              <span>
                                {Math.max(
                                  1,
                                  Math.ceil(
                                    (blog.excerpt?.length || 600) / 1000,
                                  ),
                                )}{" "}
                                min read
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  : // Fallback to static content
                    [
                      {
                        title:
                          "5 Common Sports Injuries and How to Prevent Them",
                        category: "Sports Injuries",
                        image: "/images/blog-sports-injuries.jpg",
                        date: "Jan 10, 2025",
                        readTime: "5 min read",
                      },
                      {
                        title: "Recovery After Injury: A Complete Guide",
                        category: "Recovery",
                        image: "/images/blog-recovery.jpg",
                        date: "Jan 11, 2025",
                        readTime: "7 min read",
                      },
                      {
                        title: "Physiotherapy Techniques for Better Health",
                        category: "Wellness",
                        image: "/images/blog-treatment.jpg",
                        date: "Jan 12, 2025",
                        readTime: "6 min read",
                      },
                    ].map((article, i) => (
                      <Card
                        key={i}
                        className="hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        <div className="relative aspect-video bg-muted">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority={i < 3}
                          />
                        </div>
                        <CardHeader>
                          <Badge className="w-fit mb-2">
                            {article.category}
                          </Badge>
                          <CardTitle className="text-lg">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{article.date}</span>
                            <span>{article.readTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/blog">
                <Button size="lg" variant="outline">
                  View All Articles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Contact/Location Section */}
      <section className="py-20 bg-linear-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge>Visit Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                {settings.clinicName}
              </h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of the city, our state-of-the-art facility
                is designed to provide a comfortable and welcoming environment
                for our patients.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">
                      {settings.address}
                      <br />
                      {settings.city}, {settings.state} {settings.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Service Hours</p>
                    <div className="text-muted-foreground text-sm space-y-0.5">
                      <p>
                        Mon:{" "}
                        {settings.workingHours?.monday || "8:00 AM - 6:00 PM"}
                      </p>
                      <p>
                        Tue:{" "}
                        {settings.workingHours?.tuesday || "8:00 AM - 6:00 PM"}
                      </p>
                      <p>
                        Wed:{" "}
                        {settings.workingHours?.wednesday ||
                          "8:00 AM - 6:00 PM"}
                      </p>
                      <p>
                        Thu:{" "}
                        {settings.workingHours?.thursday || "8:00 AM - 6:00 PM"}
                      </p>
                      <p>
                        Fri:{" "}
                        {settings.workingHours?.friday || "8:00 AM - 6:00 PM"}
                      </p>
                      <p>
                        Sat:{" "}
                        {settings.workingHours?.saturday || "9:00 AM - 2:00 PM"}
                      </p>
                      <p>Sun: {settings.workingHours?.sunday || "Closed"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={settings.clinicImage || "/images/clinic-exterior.jpg"}
                alt={`${settings.clinicName} Clinic Exterior`}
                width={600}
                height={500}
                quality={100}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {settings.logo ? (
                  <Image
                    src={settings.logo}
                    alt={settings.clinicName}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Activity className="w-6 h-6 text-primary" />
                )}
                <span className="text-xl font-bold">{settings.clinicName}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.description}
              </p>
              <div className="flex items-center gap-4">
                <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Orthopedic Physiotherapy</li>
                <li>Neurological Physiotherapy</li>
                <li>Sports Injury Rehabilitation</li>
                <li>Pediatric Physiotherapy</li>
                <li>Cardiopulmonary Rehabilitation</li>
                <li>Geriatric Physiotherapy</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {settings.address}
                    <br />
                    {settings.city}, {settings.state} {settings.postalCode}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    {settings.phone}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    {settings.email}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {settings.clinicName}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
