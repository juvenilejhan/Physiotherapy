"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";
import { format, addDays, isWeekend } from "date-fns";

interface Settings {
  clinicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Specialist {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  specialization: string;
  experience: number;
  consultationFee: number;
}

type BookingStep =
  | "service"
  | "specialist"
  | "datetime"
  | "details"
  | "confirm";

export default function BookingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Booking data
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    "IN_PERSON" | "TELEHEALTH"
  >("IN_PERSON");

  // Guest user information
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Additional details
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Data lists
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
    fetchSettings();
  }, []);

  // Fetch specialists when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchSpecialists(selectedService.id);
    }
  }, [selectedService]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedSpecialist]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (response.ok) {
        setServices(data.services);
      }
    } catch (error) {
      toast.error("Failed to load services");
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/public/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings");
    }
  };

  const fetchSpecialists = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/specialists?serviceId=${serviceId}`);
      const data = await response.json();
      if (response.ok) {
        setSpecialists(data.specialists);
        setSelectedSpecialist(null); // Reset specialist when service changes
      }
    } catch (error) {
      toast.error("Failed to load specialists");
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        serviceId: selectedService.id,
        date: selectedDate.toISOString().split("T")[0],
        ...(selectedSpecialist && { staffId: selectedSpecialist }),
      });

      const response = await fetch(`/api/appointments/availability?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data.availableSlots);
      } else {
        toast.error(data.error || "Failed to load available slots");
        setAvailableSlots([]);
      }
    } catch (error) {
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step: BookingStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === "service" && !selectedService) {
      newErrors.service = "Please select a service";
    }

    if (step === "datetime") {
      if (!selectedDate) {
        newErrors.date = "Please select a date";
      }
      if (!selectedTime) {
        newErrors.time = "Please select a time";
      }
    }

    if (step === "details") {
      if (!session?.user) {
        if (!guestInfo.name.trim()) {
          newErrors.guestName = "Name is required";
        }
        if (!guestInfo.email.trim()) {
          newErrors.guestEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
          newErrors.guestEmail = "Please enter a valid email";
        }
        if (!guestInfo.phone.trim()) {
          newErrors.guestPhone = "Phone number is required";
        }
      }
      if (!acceptTerms) {
        newErrors.terms = "You must accept the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const steps: BookingStep[] = [
      "service",
      "specialist",
      "datetime",
      "details",
      "confirm",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = [
      "service",
      "specialist",
      "datetime",
      "details",
      "confirm",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("details")) return;

    setIsLoading(true);

    try {
      const payload: any = {
        serviceId: selectedService!.id,
        appointmentDate: selectedDate!.toISOString().split("T")[0],
        startTime: selectedTime,
        type: appointmentType,
        notes: notes || undefined,
        reason: reason || undefined,
      };

      if (selectedSpecialist) {
        payload.staffId = selectedSpecialist;
      }

      // Add guest info if not logged in
      if (!session?.user) {
        payload.guestName = guestInfo.name;
        payload.guestEmail = guestInfo.email;
        payload.guestPhone = guestInfo.phone;
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to book appointment");
        setIsLoading(false);
        return;
      }

      toast.success("Appointment booked successfully!");
      router.push(session ? "/dashboard" : "/");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Generate date options (next 14 days)
  const dateOptions = Array.from({ length: 14 }, (_, i) =>
    addDays(new Date(), i),
  );

  const getStepNumber = (step: BookingStep) => {
    const steps: BookingStep[] = [
      "service",
      "specialist",
      "datetime",
      "details",
      "confirm",
    ];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Book an Appointment</h1>
          </div>
          <p className="text-muted-foreground">
            Follow the steps below to schedule your physiotherapy session
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {(
              [
                "service",
                "specialist",
                "datetime",
                "details",
                "confirm",
              ] as BookingStep[]
            ).map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = step === currentStep;
              const isPast = getStepNumber(step) < getStepNumber(currentStep);

              return (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
                    ${isCurrent ? "border-primary bg-primary text-primary-foreground" : ""}
                    ${isPast ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"}
                  `}
                  >
                    {isPast ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:block ${isCurrent ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 4 && (
                    <div
                      className={`flex-1 mx-4 h-0.5 ${isPast ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Select Service */}
            {currentStep === "service" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Select a Service</h2>
                <p className="text-muted-foreground">
                  Choose the type of physiotherapy service you need
                </p>

                {errors.service && (
                  <p className="text-sm text-destructive">{errors.service}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedService?.id === service.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {service.name}
                          </CardTitle>
                          {selectedService?.id === service.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <CardDescription>{service.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-primary">
                            <span>{formatBDT(service.price)}</span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext} disabled={!selectedService}>
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Select Specialist */}
            {currentStep === "specialist" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Select a Specialist</h2>
                <p className="text-muted-foreground">
                  Choose a physiotherapist or select "Any Available"
                </p>

                <RadioGroup
                  value={selectedSpecialist || ""}
                  onValueChange={setSelectedSpecialist}
                >
                  <div className="space-y-3">
                    {/* Any Available Option */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                        selectedSpecialist === null
                          ? "bg-accent border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedSpecialist(null)}
                    >
                      <RadioGroupItem value="" id="any" className="mr-3" />
                      <div className="flex-1">
                        <Label
                          htmlFor="any"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Any Available Specialist
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          We'll assign the first available specialist for your
                          appointment
                        </p>
                      </div>
                    </div>

                    {/* Specialist Options */}
                    {specialists.map((specialist) => (
                      <div
                        key={specialist.id}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                          selectedSpecialist === specialist.id
                            ? "bg-accent border-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedSpecialist(specialist.id)}
                      >
                        <RadioGroupItem
                          value={specialist.id}
                          id={specialist.id}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={specialist.id}
                            className="text-base font-semibold cursor-pointer"
                          >
                            {specialist.user.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {specialist.specialization}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              {specialist.experience} years exp
                            </span>
                            <span className="font-semibold text-primary">
                              {formatBDT(specialist.consultationFee)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {currentStep === "datetime" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Select Date & Time</h2>
                  <p className="text-muted-foreground">
                    Choose your preferred appointment date and time
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Select Date
                    </Label>
                    {errors.date && (
                      <p className="text-sm text-destructive mb-2">
                        {errors.date}
                      </p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {dateOptions.map((date) => {
                        const isSelected =
                          selectedDate &&
                          date.toDateString() === selectedDate.toDateString();
                        const isWeekendDay = isWeekend(date);
                        const isPast =
                          date < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <button
                            key={date.toISOString()}
                            disabled={isPast || isWeekendDay}
                            onClick={() =>
                              !isPast && !isWeekendDay && setSelectedDate(date)
                            }
                            className={`p-3 text-center rounded-lg border transition-all
                              ${isPast || isWeekendDay ? "opacity-30 cursor-not-allowed" : "hover:border-primary"}
                              ${isSelected ? "bg-primary text-primary-foreground border-primary" : ""}
                            `}
                          >
                            <div className="text-xs uppercase text-muted-foreground">
                              {format(date, "EEE")}
                            </div>
                            <div className="text-lg font-semibold">
                              {format(date, "d")}
                            </div>
                            <div className="text-xs">{format(date, "MMM")}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Select Time
                      {selectedService && `(${selectedService.duration} min)`}
                    </Label>
                    {errors.time && (
                      <p className="text-sm text-destructive mb-2">
                        {errors.time}
                      </p>
                    )}

                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : selectedDate ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((time) => {
                            // Convert 24h format to 12h format with AM/PM
                            const [hours, minutes] = time
                              .split(":")
                              .map(Number);
                            const hour12 = hours % 12 || 12;
                            const ampm = hours >= 12 ? "PM" : "AM";
                            const displayTime = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;

                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-3 text-center rounded-lg border transition-all hover:border-primary
                                  ${selectedTime === time ? "bg-primary text-primary-foreground border-primary" : ""}
                                `}
                              >
                                {displayTime}
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-full text-center py-8 text-muted-foreground">
                            No available slots for this date
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Please select a date first
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Type */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Appointment Type
                  </Label>
                  <RadioGroup
                    value={appointmentType}
                    onValueChange={(v) =>
                      setAppointmentType(v as "IN_PERSON" | "TELEHEALTH")
                    }
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent flex-1
                        ${appointmentType === "IN_PERSON" ? "bg-accent border-primary" : ""}
                      `}
                      >
                        <RadioGroupItem
                          value="IN_PERSON"
                          id="in-person"
                          className="mr-3"
                        />
                        <Label
                          htmlFor="in-person"
                          className="cursor-pointer flex-1"
                        >
                          <div className="font-semibold">In-Person Visit</div>
                          <div className="text-sm text-muted-foreground">
                            Visit our clinic for your appointment
                          </div>
                        </Label>
                      </div>
                      <div
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent flex-1
                        ${appointmentType === "TELEHEALTH" ? "bg-accent border-primary" : ""}
                      `}
                      >
                        <RadioGroupItem
                          value="TELEHEALTH"
                          id="telehealth"
                          className="mr-3"
                        />
                        <Label
                          htmlFor="telehealth"
                          className="cursor-pointer flex-1"
                        >
                          <div className="font-semibold">
                            Video Consultation
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Online video call with your therapist
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === "details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Your Details</h2>
                  <p className="text-muted-foreground">
                    {session?.user
                      ? "Review your information"
                      : "Please provide your contact information"}
                  </p>
                </div>

                {session?.user ? (
                  // Logged in user - display their info
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{session.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Guest user - collect info
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="guestName">Full Name *</Label>
                      <Input
                        id="guestName"
                        placeholder="John Doe"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        className={errors.guestName ? "border-destructive" : ""}
                      />
                      {errors.guestName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.guestName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="guestEmail">Email Address *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        className={
                          errors.guestEmail ? "border-destructive" : ""
                        }
                      />
                      {errors.guestEmail && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.guestEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="guestPhone">Phone Number *</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        placeholder="+8801XXXXXXXXX"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        className={
                          errors.guestPhone ? "border-destructive" : ""
                        }
                      />
                      {errors.guestPhone && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.guestPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., Back pain, Sports injury, etc."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information you'd like to share..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    *
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-destructive">{errors.terms}</p>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!acceptTerms}>
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {currentStep === "confirm" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Confirm Your Appointment
                  </h2>
                  <p className="text-muted-foreground">
                    Please review your appointment details before confirming
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Appointment Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-semibold">{selectedService?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Specialist
                        </p>
                        <p className="font-semibold">
                          {selectedSpecialist
                            ? specialists.find(
                                (s) => s.id === selectedSpecialist,
                              )?.user.name
                            : "Any Available Specialist"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {selectedDate &&
                            format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold">
                          {selectedTime &&
                            (() => {
                              const [hours, minutes] = selectedTime
                                .split(":")
                                .map(Number);
                              const hour12 = hours % 12 || 12;
                              const ampm = hours >= 12 ? "PM" : "AM";
                              return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
                            })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge
                          variant={
                            appointmentType === "IN_PERSON"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointmentType === "IN_PERSON"
                            ? "In-Person Visit"
                            : "Video Consultation"}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatBDT(selectedService?.price || 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">
                            {session?.user?.name || guestInfo.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">
                          {session?.user?.email || guestInfo.email}
                        </p>
                      </div>
                      {guestInfo.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm">{guestInfo.phone}</p>
                        </div>
                      )}
                      {reason && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Reason for Visit
                          </p>
                          <p className="text-sm">{reason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Clinic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Clinic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">
                          {settings?.clinicName || "PhysioConnect Clinic"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {settings?.address || "123 Healthcare Street"}
                          <br />
                          {settings?.city || "Medical District"},{" "}
                          {settings?.state || "MD"}{" "}
                          {settings?.postalCode || "12345"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {settings?.phone || "+8801XXXXXXXXX"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {settings?.email || "info@physioconnect.com"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm & Book Appointment"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
