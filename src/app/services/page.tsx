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
  Clock,
  Calendar,
  ArrowRight,
  Filter,
  Bone,
  Activity,
  Zap,
  Users,
  Heart,
  Baby,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import Image from "next/image";
import { toast } from "sonner";

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
  image?: string;
  isActive: boolean;
}

const categoryIcons: Record<string, any> = {
  ORTHOPEDIC: Bone,
  NEUROLOGICAL: Activity,
  SPORTS: Zap,
  PEDIATRIC: Baby,
  CARDIOPULMONARY: Heart,
  GERIATRIC: Users,
};

const categoryColors: Record<string, string> = {
  ORTHOPEDIC: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  NEUROLOGICAL: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  SPORTS: "bg-green-500/10 text-green-600 border-green-500/20",
  PEDIATRIC: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  CARDIOPULMONARY: "bg-red-500/10 text-red-600 border-red-500/20",
  GERIATRIC: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const categoryImages: Record<string, string> = {
  ORTHOPEDIC: "/images/service-orthopedic.jpg",
  NEUROLOGICAL: "/images/service-neurological.jpg",
  SPORTS: "/images/service-sports.jpg",
  PEDIATRIC: "/images/service-pediatric.jpg",
  CARDIOPULMONARY: "/images/service-cardiopulmonary.jpg",
  GERIATRIC: "/images/service-geriatric.jpg",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
        setFilteredServices(data.services || []);
      } else {
        toast.error("Failed to load services");
      }
    } catch (error) {
      toast.error("An error occurred while loading services");
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query),
      );
    }

    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory,
      );
    }

    setFilteredServices(filtered);
  };

  const categories = [
    "ALL",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="inline-flex items-center text-sm text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors" />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg opacity-90">
              Comprehensive physiotherapy services tailored to your unique
              needs. Our expert team provides specialized care to help you
              achieve optimal health.
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {category === "ALL"
                    ? "All Services"
                    : category.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
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
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No services found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const Icon = categoryIcons[service.category] || Activity;
                const colorClass =
                  categoryColors[service.category] ||
                  "bg-gray-500/10 text-gray-600 border-gray-500/20";
                const imageUrl =
                  service.image ||
                  categoryImages[service.category] ||
                  "/images/service-orthopedic.jpg";

                return (
                  <Card
                    key={service.id}
                    className="hover:shadow-lg transition-shadow group overflow-hidden"
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-14 h-14 rounded-lg flex items-center justify-center border ${colorClass}`}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        <Badge variant="outline">
                          {service.category.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} minutes</span>
                          </div>
                          <span className="font-semibold text-primary">
                            {formatBDT(service.price)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/services/${service.slug}`}>
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                          Learn More
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Start Your Treatment?
            </h2>
            <p className="text-lg opacity-90">
              Book an appointment today and take the first step towards your
              recovery journey.
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
                <Link href="/specialists">
                  View Our Specialists
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
