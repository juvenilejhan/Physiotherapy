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
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ClinicSettings {
  clinicName: string;
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

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Default values as fallback
  const defaultSettings: ClinicSettings = {
    clinicName: "PhysioConnect",
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
  const whatsappMessage = encodeURIComponent("Hello! I have some pain/discomfort and would like to consult with a physiotherapist. Can you help?");

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
    { name: "Home", href: "/#home" },
    { name: "Services", href: "/services" },
    { name: "Specialists", href: "/specialists" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              <Link href="/#home" className="text-2xl font-bold">
                PhysioConnect
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="px-2 lg:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="px-3 lg:px-4">Book Appointment</Button>
              </Link>
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full">Book Appointment</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="home"
          className="relative py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-primary/5"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Link href="/book">
                    <Button size="lg" className="text-lg">
                      Book Appointment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <a href={`tel:${formatPhoneForTel(settings.phone)}`}>
                    <Button size="lg" variant="outline" className="text-lg">
                      <Phone className="mr-2 w-5 h-5" />
                      Call Us Now
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(settings.phone)}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
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
                    src="/images/hero-banner.jpg"
                    alt="Modern Physiotherapy Clinic"
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                    priority
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
              {services.slice(0, 3).map((service, index) => (
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
                src="/images/about-team.jpg"
                alt="PhysioConnect Team"
                width={1200}
                height={400}
                className="object-cover w-full h-auto"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialists.map((specialist, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{specialist.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {specialist.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <Badge variant="outline">{specialist.specialization}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {specialist.experience} of experience
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{specialist.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({specialist.reviews} reviews)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
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
              <div className="grid grid-cols-2 gap-6 hidden md:grid">
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
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Your Recovery Journey?
              </h2>
              <p className="text-lg opacity-90">
                Book your appointment today and take the first step towards a
                pain-free, active life. Our team is ready to help you achieve
                your health goals.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <Link href="/book">
                  <Button size="lg" variant="secondary" className="text-lg">
                    <Calendar className="mr-2 w-5 h-5" />
                    Book Appointment Now
                  </Button>
                </Link>
                <a href={`tel:${formatPhoneForTel(settings.phone)}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    Call: {settings.phone}
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(settings.phone)}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
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
              {[
                {
                  title: "5 Common Sports Injuries and How to Prevent Them",
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
                    <Badge className="w-fit mb-2">{article.category}</Badge>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
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
      <section className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge>Visit Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Our Modern Clinic
              </h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of the city, our state-of-the-art facility
                is designed to provide a comfortable and welcoming environment
                for our patients.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
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
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Hours</p>
                    <p className="text-muted-foreground">
                      Mon-Fri:{" "}
                      {settings.workingHours?.monday || "8:00 AM - 6:00 PM"}
                      <br />
                      Sat:{" "}
                      {settings.workingHours?.saturday || "9:00 AM - 2:00 PM"}
                      <br />
                      Sun: {settings.workingHours?.sunday || "Closed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/clinic-exterior.jpg"
                alt="PhysioConnect Clinic Exterior"
                width={600}
                height={500}
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
                <Activity className="w-6 h-6 text-primary" />
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
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {settings.address}
                    <br />
                    {settings.city}, {settings.state} {settings.postalCode}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {settings.phone}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {settings.email}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Mon-Fri:{" "}
                    {settings.workingHours?.monday || "8:00 AM - 8:00 PM"}
                    <br />
                    Sat: 9:00 AM - 5:00 PM
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 PhysioConnect. All rights reserved.</p>
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
