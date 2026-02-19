import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhysioConnect - Modern Physiotherapy Center Management",
  description:
    "Comprehensive physiotherapy center management platform. Book appointments online, access expert care, and manage your health journey with PhysioConnect.",
  keywords: [
    "PhysioConnect",
    "physiotherapy",
    "physical therapy",
    "healthcare",
    "appointment booking",
    "patient care",
    "rehabilitation",
  ],
  authors: [{ name: "PhysioConnect Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PhysioConnect - Modern Physiotherapy Care",
    description:
      "Expert physiotherapy care with modern technology. Book appointments online and start your recovery journey today.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhysioConnect - Modern Physiotherapy Care",
    description:
      "Expert physiotherapy care with modern technology. Book appointments online and start your recovery journey today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <FloatingWhatsApp />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
