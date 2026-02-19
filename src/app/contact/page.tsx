"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";

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
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-muted/50">
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg opacity-90">
              Get in touch or visit our clinic.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="text-muted-foreground">{settings?.description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Phone />
                <a
                  href={`tel:${settings?.phone || "5551234567"}`}
                  className="font-medium"
                >
                  {settings?.phone || "(555) 123-4567"}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail />
                <a
                  href={`mailto:${settings?.email || "info@physioconnect.com"}`}
                >
                  {settings?.email || "info@physioconnect.com"}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MapPin />
                <div>
                  <div>{settings?.address}</div>
                  <div className="text-sm text-muted-foreground">
                    {settings?.city} {settings?.state} {settings?.postalCode}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/book">
                <Button>Book Appointment</Button>
              </Link>
            </div>
          </div>

          <div>
            <div className="w-full h-72 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">
                Map / Directions placeholder
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
