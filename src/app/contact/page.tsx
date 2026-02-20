"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

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

// Helper to format phone for tel: and wa.me links
function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // Handle Bangladesh local format (starts with 0, 11 digits)
  // Convert 01723131343 -> 8801723131343
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "880" + digits.substring(1);
  }

  return digits;
}

// Pre-filled WhatsApp message
const WHATSAPP_MESSAGE = encodeURIComponent("Hello! I have some pain/discomfort and would like to consult with a physiotherapist. Can you help?");

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings");
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

  const phoneNumber = settings?.phone || "(555) 123-4567";

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
                  href={`tel:${formatPhoneForTel(phoneNumber)}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {phoneNumber}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="text-green-500" />
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Chat on WhatsApp
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

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/book">
                <Button>Book Appointment</Button>
              </Link>
              <a href={`tel:${formatPhoneForTel(phoneNumber)}`}>
                <Button variant="outline">
                  <Phone className="mr-2 w-4 h-4" />
                  Call Us
                </Button>
              </a>
              <a
                href={`https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                >
                  <MessageCircle className="mr-2 w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
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
