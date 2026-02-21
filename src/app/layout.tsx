import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";

// Inter - Clean, professional, highly readable font for healthcare
// Conveys trust, clarity, and modern professionalism
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
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
