"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Star,
  User,
  Calendar,
  Award,
  ArrowRight,
  Filter,
  Clock,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";

interface Specialist {
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
  isAvailable: boolean;
  services: {
    service: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  useEffect(() => {
    filterSpecialists();
  }, [specialists, searchQuery, selectedSpecialization]);

  const fetchSpecialists = async () => {
    try {
      const response = await fetch("/api/specialists");
      const data = await response.json();
      if (response.ok) {
        setSpecialists(data.specialists || []);
        setFilteredSpecialists(data.specialists || []);
      } else {
        toast.error("Failed to load specialists");
      }
    } catch (error) {
      toast.error("An error occurred while loading specialists");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSpecialists = () => {
    let filtered = specialists;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (specialist) =>
          specialist.user.name.toLowerCase().includes(query) ||
          specialist.specialization.toLowerCase().includes(query) ||
          specialist.qualifications?.toLowerCase().includes(query),
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== "ALL") {
      filtered = filtered.filter(
        (specialist) => specialist.specialization === selectedSpecialization,
      );
    }

    setFilteredSpecialists(filtered);
  };

  const specializations = [
    "ALL",
    ...Array.from(new Set(specialists.map((s) => s.specialization))),
  ];

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton
            href="/"
            className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our Specialists
            </h1>
            <p className="text-lg opacity-90">
              Our team of experienced and licensed physiotherapists is dedicated
              to providing the highest quality care to help you achieve your
              health goals.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search specialists by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialization Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSpecialization === spec
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {spec === "ALL" ? "All Specialists" : spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specialists Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSpecialists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No specialists found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialization("ALL");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecialists.map((specialist) => (
                <Card
                  key={specialist.id}
                  className="hover:shadow-lg transition-shadow group"
                >
                  <CardHeader className="text-center">
                    <div className="relative mx-auto mb-4">
                      <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                        {specialist.user.image ? (
                          <img
                            src={specialist.user.image}
                            alt={specialist.user.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-primary" />
                        )}
                      </div>
                      {!specialist.isAvailable && (
                        <Badge
                          variant="secondary"
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                        >
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {specialist.user.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {specialist.specialization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <Badge variant="outline" className="mx-auto">
                      {specialist.experience} Years Experience
                    </Badge>

                    {specialist.qualifications && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {specialist.qualifications}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm pt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.9</span>
                      <span className="text-muted-foreground">
                        (Based on patient reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Flexible</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-primary">
                          {formatBDT(specialist.consultationFee)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/specialists/${specialist.id}`}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                        View Profile
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose Our Specialists?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our team brings together years of experience, specialized
              training, and a commitment to patient-centered care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Award className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Highly Qualified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All our specialists are licensed physiotherapists with
                  advanced certifications in their respective fields.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <User className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Patient-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We believe in personalized care plans tailored to each
                  patient's unique needs and goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our track record of successful patient outcomes speaks for our
                  expertise and dedication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Meet Your Specialist?
            </h2>
            <p className="text-lg opacity-90">
              Book an appointment today and start your journey to recovery with
              one of our expert physiotherapists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/book">
                  <Calendar className="mr-2 w-5 h-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/services">
                  View Our Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
