'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'buyer' | 'supplier';
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredUserType,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (requiredUserType && user?.userType !== requiredUserType) {
        router.push('/');
      }
      setIsChecking(false);
    }
  }, [loading, isAuthenticated, user, requiredUserType, router]);

  if (loading || isChecking) {
    return fallback || <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 animate-spin mb-4" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
}
