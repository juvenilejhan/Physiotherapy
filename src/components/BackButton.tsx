"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface BackButtonProps {
  className?: string;
  isAuthPage?: boolean; // If true, always go home when not authenticated
  href?: string; // If specified, always navigate to this URL
}

export function BackButton({
  className,
  isAuthPage = false,
  href,
}: BackButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [canGoBack] = useState(() => {
    // Check if there's a previous page in browser history (only evaluates once on mount)
    if (typeof window !== "undefined") {
      return window.history.length > 1;
    }
    return false;
  });

  const handleBack = () => {
    // If href is specified, always navigate to that URL
    if (href) {
      router.push(href);
      return;
    }

    // On auth pages (login/register), always go to home
    // This prevents going back to protected pages after logout
    if (isAuthPage) {
      router.push("/");
      return;
    }

    if (canGoBack) {
      router.back();
    } else {
      // Fallback: go to dashboard if logged in, otherwise home
      router.push(status === "authenticated" ? "/dashboard" : "/");
    }
  };

  const defaultClassName =
    "inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors";

  return (
    <button onClick={handleBack} className={className || defaultClassName}>
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Back
    </button>
  );
}
