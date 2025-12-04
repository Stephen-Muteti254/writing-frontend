import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const RequireAuth = ({ children, requiredRole }: RequireAuthProps) => {
  const { user, accessToken, isLoading, validateToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!accessToken) {
        setIsValidating(false);
        return;
      }
      try {
        await validateToken();
      } catch (error) {
        console.error('[RequireAuth] validateToken error:', error);
      } finally {
        if (!cancelled) setIsValidating(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // 🕓 Wait for both loading & validation
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 🚫 Only redirect after both finished
  if (!accessToken || !user) {
    console.warn('[RequireAuth] Redirecting due to missing auth state.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    console.warn('[RequireAuth] Redirecting due to insufficient role.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

