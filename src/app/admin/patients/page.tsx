"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { getWhatsAppLink, formatBDPhone } from "@/lib/utils";

interface Patient {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
}

interface MedicalHistory {
  id: string;
  condition: string;
  diagnosisDate: string;
  description?: string;
  isChronic: boolean;
  notes?: string;
}

interface ConsentForm {
  id: string;
  formType: string;
  consentDate: string;
  isSigned: boolean;
  signature?: string;
}

interface PatientDetail extends Patient {
  medicalHistory: MedicalHistory[];
  consentForms: ConsentForm[];
  appointments: any[];
}

export default function AdminPatientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(
    null,
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (
      session?.user?.role &&
      !["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"].includes(
        session.user.role,
      )
    ) {
      router.push("/admin");
      return;
    }

    fetchPatients();
  }, [session, status, router]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/patients");

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        toast.error("Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedPatient(data);
        setActiveTab("overview");
        setDetailsDialogOpen(true);
      } else {
        toast.error("Failed to fetch patient details");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast.error("An error occurred");
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.user.phone?.includes(searchQuery),
  );

  if (loading) {
    return <PatientsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground">
            Manage patient records and medical history
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Patients</CardTitle>
              <CardDescription>
                {patients.length} total patients
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={patient.user.image}
                              alt={patient.user.name}
                            />
                            <AvatarFallback>
                              {patient.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.user.phone ? (
                          <a
                            href={getWhatsAppLink(patient.user.phone) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>{formatBDPhone(patient.user.phone)}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.dateOfBirth
                          ? format(
                              new Date(patient.dateOfBirth),
                              "MMM dd, yyyy",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>{patient.gender || "-"}</TableCell>
                      <TableCell>
                        {patient.city && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {patient.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(patient.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewPatient(patient.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Medical Records
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={selectedPatient?.user.image}
                  alt={selectedPatient?.user.name}
                />
                <AvatarFallback className="text-2xl">
                  {selectedPatient?.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {selectedPatient?.user.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedPatient?.user.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPatient && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="consent">Consent Forms</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date of Birth
                        </p>
                        <p className="font-medium">
                          {selectedPatient.dateOfBirth
                            ? format(
                                new Date(selectedPatient.dateOfBirth),
                                "MMMM dd, yyyy",
                              )
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">
                          {selectedPatient.gender || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        {selectedPatient.user.phone ? (
                          <a
                            href={getWhatsAppLink(selectedPatient.user.phone) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                            title="Chat on WhatsApp"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span className="font-medium">
                              {formatBDPhone(selectedPatient.user.phone)}
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">Not provided</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Address & Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {selectedPatient.address ? (
                            <>
                              {selectedPatient.address}
                              {selectedPatient.city &&
                                `, ${selectedPatient.city}`}
                            </>
                          ) : (
                            "Not provided"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Emergency Contact
                        </p>
                        <p className="font-medium">
                          {selectedPatient.emergencyContactName ||
                            "Not provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.emergencyContactPhone || ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Medical History</h3>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </div>
                {selectedPatient.medicalHistory.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No medical history records
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.medicalHistory.map((record) => (
                      <Card key={record.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {record.condition}
                                </h4>
                                {record.isChronic && (
                                  <Badge variant="secondary">Chronic</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Diagnosed:{" "}
                                {format(
                                  new Date(record.diagnosisDate),
                                  "MMMM dd, yyyy",
                                )}
                              </p>
                              {record.description && (
                                <p className="text-sm">{record.description}</p>
                              )}
                              {record.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Notes: {record.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="consent" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Consent Forms</h3>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Consent Form
                  </Button>
                </div>
                {selectedPatient.consentForms.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No consent forms on file
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.consentForms.map((form) => (
                      <Card key={form.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{form.formType}</h4>
                              <p className="text-sm text-muted-foreground">
                                Signed:{" "}
                                {format(
                                  new Date(form.consentDate),
                                  "MMMM dd, yyyy",
                                )}
                              </p>
                            </div>
                            <Badge
                              variant={form.isSigned ? "default" : "secondary"}
                            >
                              {form.isSigned ? "Signed" : "Pending"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <h3 className="text-lg font-semibold">Appointment History</h3>
                {selectedPatient.appointments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No appointments scheduled
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.appointments.map((apt) => (
                      <Card key={apt.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {apt.service?.name || "Unknown Service"}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(apt.appointmentDate),
                                    "MMMM dd, yyyy at h:mm a",
                                  )}
                                </span>
                              </div>
                            </div>
                            <Badge>{apt.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PatientsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
