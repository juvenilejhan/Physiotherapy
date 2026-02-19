"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

const PHONE_NUMBER = "5551234567";
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}`;

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Don't show WhatsApp button in admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <MessageCircle className="w-6 h-6" />
    </Link>
  );
}
