'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role && !['SUPER_ADMIN', 'CLINIC_MANAGER', 'DOCTOR', 'RECEPTIONIST'].includes(session.user.role)) {
      router.push('/admin');
      return;
    }

    fetchPatients();
  }, [session, status, router]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/patients');
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        toast.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('An error occurred');
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
        setActiveTab('overview');
        setDetailsDialogOpen(true);
      } else {
        toast.error('Failed to fetch patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('An error occurred');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.phone?.includes(searchQuery)
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
          <div className="rounded-md border">
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={patient.user.image} alt={patient.user.name} />
                            <AvatarFallback>
                              {patient.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.user.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {patient.user.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>{patient.gender || '-'}</TableCell>
                      <TableCell>
                        {patient.city && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {patient.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => handleViewPatient(patient.id)}>
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
                <AvatarImage src={selectedPatient?.user.image} alt={selectedPatient?.user.name} />
                <AvatarFallback className="text-2xl">
                  {selectedPatient?.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{selectedPatient?.user.name}</DialogTitle>
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
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">
                          {selectedPatient.dateOfBirth 
                            ? format(new Date(selectedPatient.dateOfBirth), 'MMMM dd, yyyy')
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">{selectedPatient.gender || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedPatient.user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Address & Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {selectedPatient.address ? (
                            <>
                              {selectedPatient.address}
                              {selectedPatient.city && `, ${selectedPatient.city}`}
                            </>
                          ) : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-medium">{selectedPatient.emergencyContactName || 'Not provided'}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.emergencyContactPhone || ''}
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
                      <p className="text-muted-foreground">No medical history records</p>
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
                                <h4 className="font-semibold">{record.condition}</h4>
                                {record.isChronic && (
                                  <Badge variant="secondary">Chronic</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Diagnosed: {format(new Date(record.diagnosisDate), 'MMMM dd, yyyy')}
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
                      <p className="text-muted-foreground">No consent forms on file</p>
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
                                Signed: {format(new Date(form.consentDate), 'MMMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant={form.isSigned ? 'default' : 'secondary'}>
                              {form.isSigned ? 'Signed' : 'Pending'}
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
                      <p className="text-muted-foreground">No appointments scheduled</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedPatient.appointments.map((apt) => (
                      <Card key={apt.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{apt.service?.name || 'Unknown Service'}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(apt.appointmentDate), 'MMMM dd, yyyy at h:mm a')}</span>
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
