"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  Award,
  Users,
  Heart,
  Target,
  ArrowRight,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

interface Settings {
  clinicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  description?: string;
  clinicImage?: string;
  teamImage?: string;
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

interface Specialist {
  id: string;
  specialization: string | null;
  qualifications: string | null;
  experience: number | null;
  user: {
    name: string | null;
    image: string | null;
  };
}

// Helper to format phone for tel: and wa.me links
function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function formatPhoneForWhatsApp(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "880" + digits.substring(1);
  }
  return digits;
}

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello! I have some pain/discomfort and would like to consult with a physiotherapist. Can you help?",
);

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, specialistsRes] = await Promise.all([
          fetch("/api/public/settings"),
          fetch("/api/specialists"),
        ]);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (specialistsRes.ok) {
          const data = await specialistsRes.json();
          setSpecialists(data.specialists || data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const phoneNumber = settings?.phone || "(555) 123-4567";

  // Dynamic business hours from settings
  const businessHours = [
    {
      day: "Monday",
      hours: settings?.workingHours?.monday || "8:00 AM - 6:00 PM",
    },
    {
      day: "Tuesday",
      hours: settings?.workingHours?.tuesday || "8:00 AM - 6:00 PM",
    },
    {
      day: "Wednesday",
      hours: settings?.workingHours?.wednesday || "8:00 AM - 6:00 PM",
    },
    {
      day: "Thursday",
      hours: settings?.workingHours?.thursday || "8:00 AM - 6:00 PM",
    },
    {
      day: "Friday",
      hours: settings?.workingHours?.friday || "8:00 AM - 6:00 PM",
    },
    {
      day: "Saturday",
      hours: settings?.workingHours?.saturday || "9:00 AM - 2:00 PM",
    },
    { day: "Sunday", hours: settings?.workingHours?.sunday || "Closed" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description:
        "Every treatment plan is tailored to your unique needs and goals.",
    },
    {
      icon: Award,
      title: "Clinical Excellence",
      description:
        "Evidence-based practices and continuous professional development.",
    },
    {
      icon: Users,
      title: "Collaborative Approach",
      description: "We work together with you and other healthcare providers.",
    },
    {
      icon: Target,
      title: "Results-Driven",
      description: "Focused on measurable outcomes and long-term wellness.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors" />
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Contact & About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {settings?.clinicName || "PhysioConnect"}
            </h1>
            <p className="text-lg opacity-90">
              {settings?.description ||
                "Get in touch with us or learn more about our mission to provide best-in-class physiotherapy care through evidence-based practices and a patient-centered approach."}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Contact Form Section */}
        <section>
          <div className="text-center mb-8">
            <Badge>Get In Touch</Badge>
            <h2 className="text-3xl font-bold mt-4">Contact Us</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Have questions or ready to start your recovery journey? We&apos;re
              here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {submitSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground">
                        Thank you for contacting us. We&apos;ll get back to you
                        shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Your phone number"
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
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subject: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your condition or inquiry..."
                          rows={5}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              message: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        <Send className="ml-2 w-4 h-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Map Section - Find Us */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Find Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024039999997!2d90.38891517530665!3d23.750895078671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b1%3A0x8fa563962f32a00e!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2sus!4v1708000000000!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Clinic Location"
                      className="absolute inset-0 border-0"
                    ></iframe>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>
                      {settings?.address || "123 Health Street"},{" "}
                      {settings?.city || "Dhaka"}, {settings?.state || ""}{" "}
                      {settings?.postalCode || "1205"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${formatPhoneForTel(phoneNumber)}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {phoneNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${WHATSAPP_MESSAGE}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        Chat with us
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${settings?.email || "info@physioconnect.com"}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {settings?.email || "info@physioconnect.com"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {settings?.address || "123 Health Street"}
                        <br />
                        {settings?.city || "Dhaka"}, {settings?.state || ""}{" "}
                        {settings?.postalCode || "1205"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {businessHours.map((schedule, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {schedule.day}
                        </span>
                        <span className="font-medium">{schedule.hours}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Link href="/book" className="block">
                  <Button className="w-full">Book Appointment</Button>
                </Link>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                  >
                    <MessageCircle className="mr-2 w-4 h-4" />
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Us - Our Story Section */}
        <section>
          <div className="text-center mb-8">
            <Badge>About Us</Badge>
            <h2 className="text-3xl font-bold mt-4">Who We Are</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">A Legacy of Healing</h3>
              <p className="text-muted-foreground">
                We started as a small clinic with a big vision: to combine
                modern rehabilitation techniques with compassionate care. Today
                we serve thousands of patients and continue to expand our
                services.
              </p>
              <p className="text-muted-foreground">
                Our team of dedicated physiotherapists brings together decades
                of combined experience in sports medicine, orthopedic
                rehabilitation, neurological therapy, and more.
              </p>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">
                    Years Experience
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">5000+</div>
                  <div className="text-sm text-muted-foreground">
                    Patients Treated
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">
                    Satisfaction Rate
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={settings?.teamImage || "/images/about-team.jpg"}
                alt="Our Team"
                fill
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="text-center mb-8">
            <Badge>Our Values</Badge>
            <h2 className="text-3xl font-bold mt-4">What We Stand For</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our core values guide everything we do, from initial consultation
              to your full recovery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-8">
            <Badge>Our Team</Badge>
            <h2 className="text-3xl font-bold mt-4">Meet Our Specialists</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our experienced team is here to help you on your journey to
              recovery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialists.length > 0
              ? specialists.slice(0, 4).map((specialist) => (
                  <Link
                    key={specialist.id}
                    href={`/specialists/${specialist.id}`}
                  >
                    <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                          {specialist.user.image ? (
                            <Image
                              src={specialist.user.image}
                              alt={specialist.user.name || "Specialist"}
                              width={80}
                              height={80}
                              quality={100}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Users className="w-10 h-10 text-primary" />
                          )}
                        </div>
                        <h3 className="font-semibold">
                          {specialist.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {specialist.specialization}
                        </p>
                        {specialist.experience && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {specialist.experience} years experience
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <Card key={i} className="text-center animate-pulse">
                    <CardContent className="pt-6">
                      <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
                      <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                    </CardContent>
                  </Card>
                ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/specialists">
              <Button variant="outline">
                View All Specialists
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-primary/5 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge>Why Choose Us</Badge>
              <h2 className="text-3xl font-bold">
                Your Recovery Is Our Priority
              </h2>
              <ul className="space-y-4">
                {[
                  "State-of-the-art equipment and facilities",
                  "Personalized treatment plans for every patient",
                  "Flexible scheduling including evenings and weekends",
                  "Direct communication with your therapist",
                  "Insurance and payment plan options available",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={settings?.clinicImage || "/images/clinic-exterior.jpg"}
                alt="Our Clinic"
                fill
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold">Ready to Start Your Recovery?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Book an appointment today and take the first step towards a
            pain-free life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg">
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
