"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  CreditCard,
  BarChart3,
  Video,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"],
  },
  {
    title: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"],
  },
  {
    title: "Patients",
    href: "/admin/patients",
    icon: Users,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"],
  },
  {
    title: "Staff",
    href: "/admin/staff",
    icon: Users,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER"],
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR", "RECEPTIONIST"],
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "RECEPTIONIST"],
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: FileText,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER"],
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER"],
  },
  {
    title: "Telehealth",
    href: "/admin/telehealth",
    icon: Video,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER", "DOCTOR"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "CLINIC_MANAGER"],
  },
];

function SidebarContent({
  pathname,
  userRole,
  setMobileMenuOpen,
}: {
  pathname: string;
  userRole: string;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole as string),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-bold">PhysioConnect</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="h-5 w-5" />
          <span>Back to Website</span>
        </Link>
      </div>
    </div>
  );
}

function UserMenu() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {session?.user?.image && (
              <AvatarImage
                src={session.user.image}
                alt={session?.user?.name || ""}
              />
            )}
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
            <p className="text-xs leading-none text-primary">
              {session?.user?.role?.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = session?.user?.role || "PATIENT";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="min-h-screen">
          <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
        <SidebarContent
          pathname={pathname}
          userRole={userRole}
          setMobileMenuOpen={() => {}}
        />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent
                  pathname={pathname}
                  userRole={userRole}
                  setMobileMenuOpen={setMobileMenuOpen}
                />
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  P
                </span>
              </div>
              <span className="text-xl font-bold">PhysioConnect</span>
            </Link>
          </div>

          <UserMenu />
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex fixed top-0 right-0 z-40 h-16 w-[calc(100%-16rem)] border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">
            {navItems
              .filter(
                (item) =>
                  !item.roles || item.roles.includes(userRole as string),
              )
              .find(
                (item) =>
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/"),
              )?.title || "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
