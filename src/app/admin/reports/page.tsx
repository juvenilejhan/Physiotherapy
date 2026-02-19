'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role && !['SUPER_ADMIN', 'CLINIC_MANAGER'].includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }

    // Show toast message
    toast.info('Not implemented yet, coming soon.', {
      position: 'top-center',
    });
  }, [session, status, router]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          View detailed reports and analytics for your clinic.
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium">Reports Module</p>
          <p className="text-sm text-muted-foreground mt-2">This feature is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
