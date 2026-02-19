"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-lg opacity-90">
              PhysioConnect is dedicated to providing best-in-class
              physiotherapy care. Our mission is to help patients recover and
              regain independence using evidence-based practices and a
              patient-centered approach.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="prose max-w-none">
          <h2>Our Story</h2>
          <p>
            We started as a small clinic with a big vision: to combine modern
            rehabilitation techniques with compassionate care. Today we serve
            thousands of patients and continue to expand our services.
          </p>

          <h3>Our Approach</h3>
          <p>
            We create individualized treatment plans that focus on function,
            pain relief, and long-term recovery. Education and patient
            engagement are core to our therapy model.
          </p>

          <div className="mt-8">
            <Badge>Care Philosophy</Badge>
            <p className="mt-2">Empathy · Evidence · Excellence</p>
            <Link href="/book">
              <Button className="mt-6">
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
