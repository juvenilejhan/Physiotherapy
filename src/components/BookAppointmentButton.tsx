"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface BookAppointmentButtonProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  serviceId?: string;
  specialistId?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function BookAppointmentButton({
  serviceId,
  specialistId,
  showIcon = false,
  children,
  className,
  ...props
}: BookAppointmentButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (status === "loading") return;

    // Build the booking URL with optional parameters
    let bookingUrl = "/book";
    const params = new URLSearchParams();
    if (serviceId) params.set("serviceId", serviceId);
    if (specialistId) params.set("specialistId", specialistId);
    const queryString = params.toString();
    if (queryString) bookingUrl += `?${queryString}`;

    if (session?.user) {
      // User is logged in, go to booking page
      router.push(bookingUrl);
    } else {
      // User is not logged in, redirect to login with callback
      const callbackUrl = encodeURIComponent(bookingUrl);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
    }
  };

  return (
    <Button onClick={handleClick} className={cn(className)} {...props}>
      {showIcon && <Calendar className="mr-2 h-4 w-4" />}
      {children || "Book Appointment"}
    </Button>
  );
}
