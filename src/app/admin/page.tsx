'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  monthRevenue: number;
}

interface RecentAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role && !['SUPER_ADMIN', 'CLINIC_MANAGER', 'DOCTOR', 'RECEPTIONIST'].includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, appointmentsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-appointments')
      ]);

      if (statsRes.ok && appointmentsRes.ok) {
        const statsData = await statsRes.json();
        const appointmentsData = await appointmentsRes.json();
        setStats(statsData);
        setRecentAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: string; 
    trendUp?: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trendUp ? '' : 'rotate-180'}`} />
            {trend} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          trend="+12.5%"
          trendUp
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={Calendar}
        />
        <StatCard
          title="This Month Revenue"
          value={formatBDT(stats?.monthRevenue || 0)}
          icon={TrendingUp}
          trend="+8.2%"
          trendUp
        />
        <StatCard
          title="Completion Rate"
          value={`${((stats?.completedAppointments || 0) / (stats?.totalAppointments || 1) * 100).toFixed(1)}%`}
          icon={TrendingUp}
          trend="+2.4%"
          trendUp
        />
      </div>

      {/* More Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          trend="+5.3%"
          trendUp
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
        />
        <StatCard
          title="Completed Sessions"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancelled Appointments"
          value={stats?.cancelledAppointments || 0}
          icon={XCircle}
        />
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Recent Appointments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No recent appointments</p>
                ) : (
                  recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.serviceName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatBDT(stats?.totalRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  All time revenue from completed appointments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatBDT(stats?.monthRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenue for the current month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
