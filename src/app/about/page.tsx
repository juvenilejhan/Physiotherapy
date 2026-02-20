"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Award, Users, Heart, Target, CheckCircle, Star } from "lucide-react";

interface Settings {
  clinicName?: string;
  description?: string;
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

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

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

  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Every treatment plan is tailored to your unique needs and goals.",
    },
    {
      icon: Award,
      title: "Clinical Excellence",
      description: "Evidence-based practices and continuous professional development.",
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
          <Link
            href="/"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {settings?.clinicName || "PhysioConnect"}
            </h1>
            <p className="text-lg opacity-90">
              {settings?.description || "Dedicated to providing best-in-class physiotherapy care. Our mission is to help patients recover and regain independence using evidence-based practices and a patient-centered approach."}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Our Story Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge>Our Story</Badge>
            <h2 className="text-3xl font-bold">A Legacy of Healing</h2>
            <p className="text-muted-foreground">
              We started as a small clinic with a big vision: to combine modern
              rehabilitation techniques with compassionate care. Today we serve
              thousands of patients and continue to expand our services.
            </p>
            <p className="text-muted-foreground">
              Our team of dedicated physiotherapists brings together decades of
              combined experience in sports medicine, orthopedic rehabilitation,
              neurological therapy, and more.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Patients Treated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/about-team.jpg"
              alt="Our Team"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-8">
          <div className="text-center">
            <Badge>Our Values</Badge>
            <h2 className="text-3xl font-bold mt-4">What We Stand For</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our core values guide everything we do, from initial consultation to your full recovery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-8">
          <div className="text-center">
            <Badge>Our Team</Badge>
            <h2 className="text-3xl font-bold mt-4">Meet Our Specialists</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our experienced team is here to help you on your journey to recovery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialists.length > 0 ? (
              specialists.slice(0, 4).map((specialist) => (
                <Link key={specialist.id} href={`/specialists/${specialist.id}`}>
                  <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {specialist.user.image ? (
                          <Image
                            src={specialist.user.image}
                            alt={specialist.user.name || "Specialist"}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Users className="w-10 h-10 text-primary" />
                        )}
                      </div>
                      <h3 className="font-semibold">{specialist.user.name}</h3>
                      <p className="text-sm text-muted-foreground">{specialist.specialization}</p>
                      {specialist.experience && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {specialist.experience} years experience
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Placeholder cards
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="text-center animate-pulse">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="text-center">
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
              <h2 className="text-3xl font-bold">Your Recovery Is Our Priority</h2>
              <ul className="space-y-4">
                {[
                  "State-of-the-art equipment and facilities",
                  "Personalized treatment plans for every patient",
                  "Flexible scheduling including evenings and weekends",
                  "Direct communication with your therapist",
                  "Insurance and payment plan options available",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/clinic-exterior.jpg"
                alt="Our Clinic"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold">Ready to Start Your Recovery?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Book an appointment today and take the first step towards a pain-free life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button size="lg">
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
