"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBDT } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface Service {
  id: string;
  name: string;
  description: string;
  conditions?: string;
  benefits?: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
  image?: string;
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    conditions: "",
    benefits: "",
    duration: "",
    price: "",
    category: "ORTHOPEDIC",
    isActive: true,
    image: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER"].includes(session.user.role)
    ) {
      router.push("/admin");
      return;
    }

    fetchServices();
  }, [session, status, router]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/content/services");
      if (response.ok) {
        setServices(await response.json());
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editMode
        ? `/api/admin/content/services/${selectedService?.id}`
        : "/api/admin/content/services";
      const method = editMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...serviceForm,
          duration: parseInt(serviceForm.duration),
          price: parseFloat(serviceForm.price),
        }),
      });

      if (response.ok) {
        toast.success(
          editMode
            ? "Service updated successfully"
            : "Service created successfully",
        );
        setServiceDialogOpen(false);
        resetServiceForm();
        fetchServices();
      } else {
        toast.error("Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("An error occurred");
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditMode(true);
    setServiceForm({
      name: service.name,
      description: service.description,
      conditions: service.conditions || "",
      benefits: service.benefits || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      isActive: service.isActive,
      image: service.image || "",
    });
    setServiceDialogOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Service deleted successfully");
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred");
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      description: "",
      conditions: "",
      benefits: "",
      duration: "",
      price: "",
      category: "ORTHOPEDIC",
      isActive: true,
      image: "",
    });
    setEditMode(false);
    setSelectedService(null);
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Manage clinic services</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage clinic services and pricing
          </p>
        </div>
        <Dialog
          open={serviceDialogOpen}
          onOpenChange={(open) => {
            setServiceDialogOpen(open);
            if (!open) resetServiceForm();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditMode(false)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Update service information"
                  : "Add a new service to the clinic"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleServiceSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="serviceName">Service Name</Label>
                  <Input
                    id="serviceName"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conditions">
                    Conditions Treated (comma-separated)
                  </Label>
                  <Input
                    id="conditions"
                    value={serviceForm.conditions}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        conditions: e.target.value,
                      })
                    }
                    placeholder="e.g., Back Pain, Joint Pain, Sports Injuries"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                  <Input
                    id="benefits"
                    value={serviceForm.benefits}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        benefits: e.target.value,
                      })
                    }
                    placeholder="e.g., Pain Relief, Improved Mobility, Faster Recovery"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={serviceForm.duration}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          duration: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (BDT)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={serviceForm.category}
                    onValueChange={(value) =>
                      setServiceForm({
                        ...serviceForm,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORTHOPEDIC">Orthopedic</SelectItem>
                      <SelectItem value="NEUROLOGICAL">Neurological</SelectItem>
                      <SelectItem value="SPORTS">Sports Injury</SelectItem>
                      <SelectItem value="PEDIATRIC">Pediatric</SelectItem>
                      <SelectItem value="CARDIOPULMONARY">
                        Cardiopulmonary
                      </SelectItem>
                      <SelectItem value="GERIATRIC">Geriatric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Service Image</Label>
                  <ImageUpload
                    value={serviceForm.image}
                    onChange={(url) =>
                      setServiceForm({
                        ...serviceForm,
                        image: url,
                      })
                    }
                    folder="services"
                    placeholder="Upload or paste image URL"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editMode ? "Update" : "Create Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>All Services ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredServices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery
                  ? "No services found matching your search"
                  : "No services found"}
              </p>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Duration: {service.duration} min
                      </span>
                      <span className="font-semibold">
                        {formatBDT(service.price)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteService(service.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
