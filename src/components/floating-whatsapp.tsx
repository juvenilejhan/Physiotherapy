"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

// Helper to format phone for WhatsApp with proper country code
function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // Handle Bangladesh local format (starts with 0)
  // Convert 01723131343 -> 8801723131343
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "880" + digits.substring(1); // Remove leading 0, add Bangladesh code
  }

  // If number already has country code (starts with 880), use as-is
  // If it's another format, use as-is (might be international already)
  return digits;
}

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [phone, setPhone] = useState<string>("8801712345678"); // Default with country code

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.phone) {
            const formattedPhone = formatPhoneForWhatsApp(data.phone);
            setPhone(formattedPhone);
          }
        }
      } catch (error) {
        console.error("Error fetching settings for WhatsApp:", error);
      }
    };
    fetchSettings();
  }, []);

  // Don't show WhatsApp button in admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Pre-filled message for WhatsApp
  const message = encodeURIComponent("Hello! I have some pain/discomfort and would like to consult with a physiotherapist. Can you help?");
  
  // WhatsApp URL format: https://wa.me/[phone]?text=[message]
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-9999 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
