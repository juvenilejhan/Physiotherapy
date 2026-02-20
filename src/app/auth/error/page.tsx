'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the error message from URL
    const error = searchParams.get('error');
    
    // Redirect back to login page with error parameter
    if (error) {
      router.replace(`/auth/login?error=${encodeURIComponent(error)}`);
    } else {
      router.replace('/auth/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Authentication Error
          </CardTitle>
          <CardDescription>
            Redirecting to login page...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
