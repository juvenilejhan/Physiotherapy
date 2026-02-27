import { Suspense } from "react";
import DashboardLoading from "./loading";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardLoading />}>{children}</Suspense>;
}
